import { prisma } from "../config/prisma.js";
import { supabase, BUCKET_NAME } from "../config/supabase.js";

class AvatarController {
    /**
     * Obter avatar de um usuário
     */
    static async getAvatar(req, res) {
        try {
            const { userId } = req.params;

            const user = await prisma.usuario.findUnique({
                where: {
                    id: Number(userId)
                },
                select: {
                    id: true,
                    nome: true,
                    avatar: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Usuário não encontrado"
                });
            }

            if (!user.avatar) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Avatar não encontrado para este usuário"
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Avatar obtido com sucesso",
                data: {
                    userId: user.id,
                    nome: user.nome,
                    avatar: user.avatar
                }
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao obter avatar",
                erro: e.message
            });
        }
    }

    /**
     * Upload de avatar para um usuário
     */
    static async uploadAvatar(req, res) {
        try {
            const { userId } = req.params;

            if (!req.file) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Nenhum arquivo foi enviado"
                });
            }

            // Verificar se o usuário existe
            const user = await prisma.usuario.findUnique({
                where: {
                    id: Number(userId)
                }
            });

            if (!user) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Usuário não encontrado"
                });
            }

            // Gerar nome único para o arquivo
            const timestamp = Date.now();
            const random = Math.round(Math.random() * 1e9);
            const fileExtension = req.file.originalname.split('.').pop();
            const fileName = `avatar-${userId}-${timestamp}-${random}.${fileExtension}`;

            // Se o usuário já tem avatar, deletar o antigo do Supabase
            if (user.avatar) {
                try {
                    const oldFileName = user.avatar.split('/').pop();
                    await supabase.storage
                        .from(BUCKET_NAME)
                        .remove([oldFileName]);
                } catch (error) {
                    console.error("Erro ao deletar avatar antigo:", error);
                    // Continuar mesmo se falhar ao deletar o antigo
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
                    mensagem: "Erro ao fazer upload do avatar",
                    erro: error.message
                });
            }

            // Obter URL pública do arquivo
            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(fileName);

            const avatarUrl = publicUrlData.publicUrl;

            // Salvar URL do avatar no banco de dados
            const updatedUser = await prisma.usuario.update({
                where: {
                    id: Number(userId)
                },
                data: {
                    avatar: avatarUrl
                },
                select: {
                    id: true,
                    nome: true,
                    avatar: true
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Avatar enviado com sucesso",
                data: updatedUser
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao enviar avatar",
                erro: e.message
            });
        }
    }

    /**
     * Deletar avatar de um usuário
     */
    static async deleteAvatar(req, res) {
        try {
            const { userId } = req.params;

            const user = await prisma.usuario.findUnique({
                where: {
                    id: Number(userId)
                }
            });

            if (!user) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Usuário não encontrado"
                });
            }

            if (!user.avatar) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Este usuário não possui avatar"
                });
            }

            // Extrair nome do arquivo da URL
            const fileName = user.avatar.split('/').pop();

            // Deletar arquivo do Supabase
            const { error } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([fileName]);

            if (error) {
                console.error("Erro ao deletar arquivo do Supabase:", error);
                // Continuar mesmo se falhar ao deletar do storage
            }

            // Atualizar usuário removendo referência ao avatar
            const updatedUser = await prisma.usuario.update({
                where: {
                    id: Number(userId)
                },
                data: {
                    avatar: null
                },
                select: {
                    id: true,
                    nome: true,
                    avatar: true
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Avatar deletado com sucesso",
                data: updatedUser
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar avatar",
                erro: e.message
            });
        }
    }

    /**
     * Obter todos os avatares de usuários
     */
    static async getAllAvatars(req, res) {
        try {
            const users = await prisma.usuario.findMany({
                where: {
                    avatar: {
                        not: null
                    }
                },
                select: {
                    id: true,
                    nome: true,
                    avatar: true
                }
            });

            if (users.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhum avatar encontrado"
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Avatares obtidos com sucesso",
                data: users
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao obter avatares",
                erro: e.message
            });
        }
    }
}

export default AvatarController;
