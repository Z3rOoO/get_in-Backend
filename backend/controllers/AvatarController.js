import { prisma } from "../config/prisma.js";
import { supabase, BUCKET_NAME } from "../config/supabase.js";

class AvatarController {
    /**
     * Utilitário para gerar URL pública a partir do path salvo no banco
     */
    static getPublicUrl(path) {
        if (!path) return null;
        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(path);
        return data.publicUrl;
    }

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
                    imagem: AvatarController.getPublicUrl(funcionario.imagem)
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

            // 🔐 usuário autenticado (vem do seu middleware JWT)
            const userId = req.user.id;

            // Buscar funcionário
            const funcionario = await prisma.funcionario.findUnique({
                where: {
                    id: Number(funcId)
                },
                include: {
                    usuario: true
                }
            });

            if (!funcionario) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Funcionário não encontrado"
                });
            }

            // 🔥 VALIDAR DONO (SEGURANÇA)
            if (funcionario.usuarioId !== userId) {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: "Você não tem permissão para alterar esta imagem"
                });
            }

            // 📁 path correto (obrigatório pra policy funcionar)
            const fileExtension = req.file.originalname.split('.').pop();
            const filePath = `${userId}/avatar.${fileExtension}`;

            // 🧹 deletar imagem antiga (se existir)
            if (funcionario.imagem) {
                try {
                    await supabase.storage
                        .from(BUCKET_NAME)
                        .remove([funcionario.imagem]);
                } catch (error) {
                    console.error("Erro ao deletar imagem antiga:", error);
                }
            }

            // 📤 upload com upsert (substitui automaticamente)
            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                    upsert: true
                });

            if (error) {
                return res.status(500).json({
                    sucesso: false,
                    mensagem: "Erro ao fazer upload da imagem",
                    erro: error.message
                });
            }

            // 💾 salvar no banco apenas o PATH
            const updatedFunc = await prisma.funcionario.update({
                where: {
                    id: Number(funcId)
                },
                data: {
                    imagem: filePath
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
                    imagem: AvatarController.getPublicUrl(updatedFunc.imagem)
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
            const userId = req.user.id;

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

            // 🔐 validar dono
            if (funcionario.usuarioId !== userId) {
                return res.status(403).json({
                    sucesso: false,
                    mensagem: "Sem permissão"
                });
            }

            if (!funcionario.imagem) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Este funcionário não possui imagem"
                });
            }

            // 📁 remover do storage
            await supabase.storage
                .from(BUCKET_NAME)
                .remove([funcionario.imagem]);

            // 💾 limpar banco
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
                    imagem: null
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
                imagem: AvatarController.getPublicUrl(f.imagem)
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
