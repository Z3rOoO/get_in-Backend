import { prisma } from "../config/prisma.js";
import { supabase, BUCKET_NAME } from "../config/supabase.js";

class AvatarController {
    /**
     * Obter imagem de um funcionário
     */
    static async getAvatar(req, res) {
        try {
            const { funcId } = req.params;

            const funcionario = await prisma.funcionario.findUnique({
                where: {
                    id: Number(funcId)
                },
                include: {
                    usuario: {
                        select: {
                            nome: true
                        }
                    }
                }
            });

            if (!funcionario) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Funcionário não encontrado"
                });
            }

            if (!funcionario.imagem) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Imagem não encontrada para este funcionário"
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Imagem obtida com sucesso",
                data: {
                    funcId: funcionario.id,
                    nome: funcionario.usuario.nome,
                    imagem: funcionario.imagem
                }
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao obter imagem",
                erro: e.message
            });
        }
    }

    /**
     * Upload de imagem para um funcionário
     */
    static async uploadAvatar(req, res) {
        try {
            const { funcId } = req.params;

            if (!req.file) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Nenhum arquivo foi enviado"
                });
            }

            // Verificar se o funcionário existe
            const funcionario = await prisma.funcionario.findUnique({
                where: {
                    id: Number(funcId)
                }
            });

            if (!funcionario) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Funcionário não encontrado"
                });
            }

            // Gerar nome único para o arquivo
            const timestamp = Date.now();
            const random = Math.round(Math.random() * 1e9);
            const fileExtension = req.file.originalname.split('.').pop();
            const fileName = `func-${funcId}-${timestamp}-${random}.${fileExtension}`;

            // Se o funcionário já tem imagem, deletar a antiga do Supabase
            if (funcionario.imagem) {
                try {
                    const oldFileName = funcionario.imagem.split('/').pop();
                    await supabase.storage
                        .from(BUCKET_NAME)
                        .remove([oldFileName]);
                } catch (error) {
                    console.error("Erro ao deletar imagem antiga:", error);
                }
            }

            // Upload do novo arquivo para o Supabase
            const { data, error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(fileName, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: false
                });

            if (error) {
                return res.status(500).json({
                    sucesso: false,
                    mensagem: "Erro ao fazer upload da imagem",
                    erro: error.message
                });
            }

            // Obter URL pública do arquivo
            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(fileName);

            const imageUrl = publicUrlData.publicUrl;

            // Salvar URL da imagem no banco de dados (tabela funcionario, campo imagem)
            const updatedFunc = await prisma.funcionario.update({
                where: {
                    id: Number(funcId)
                },
                data: {
                    imagem: imageUrl
                },
                include: {
                    usuario: {
                        select: {
                            nome: true
                        }
                    }
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Imagem enviada com sucesso",
                data: {
                    id: updatedFunc.id,
                    nome: updatedFunc.usuario.nome,
                    imagem: updatedFunc.imagem
                }
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao enviar imagem",
                erro: e.message
            });
        }
    }

    /**
     * Deletar imagem de um funcionário
     */
    static async deleteAvatar(req, res) {
        try {
            const { funcId } = req.params;

            const funcionario = await prisma.funcionario.findUnique({
                where: {
                    id: Number(funcId)
                }
            });

            if (!funcionario) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Funcionário não encontrado"
                });
            }

            if (!funcionario.imagem) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Este funcionário não possui imagem"
                });
            }

            // Extrair nome do arquivo da URL
            const fileName = funcionario.imagem.split('/').pop();

            // Deletar arquivo do Supabase
            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([fileName]);

            if (error) {
                console.error("Erro ao deletar arquivo do Supabase:", error);
            }

            // Atualizar funcionário removendo referência à imagem
            const updatedFunc = await prisma.funcionario.update({
                where: {
                    id: Number(funcId)
                },
                data: {
                    imagem: null
                },
                include: {
                    usuario: {
                        select: {
                            nome: true
                        }
                    }
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Imagem deletada com sucesso",
                data: {
                    id: updatedFunc.id,
                    nome: updatedFunc.usuario.nome,
                    imagem: updatedFunc.imagem
                }
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar imagem",
                erro: e.message
            });
        }
    }

    /**
     * Obter todas as imagens de funcionários
     */
    static async getAllAvatars(req, res) {
        try {
            const funcs = await prisma.funcionario.findMany({
                where: {
                    imagem: {
                        not: null
                    }
                },
                include: {
                    usuario: {
                        select: {
                            nome: true
                        }
                    }
                }
            });

            if (funcs.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhuma imagem encontrada"
                });
            }

            const data = funcs.map(f => ({
                id: f.id,
                nome: f.usuario.nome,
                imagem: f.imagem
            }));

            return res.status(200).json({
                sucesso: true,
                mensagem: "Imagens obtidas com sucesso",
                data: data
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao obter imagens",
                erro: e.message
            });
        }
    }
}

export default AvatarController;
