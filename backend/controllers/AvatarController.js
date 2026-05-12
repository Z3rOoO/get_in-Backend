import { prisma } from "../config/prisma.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "../uploads");

// Criar diretório de uploads se não existir
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

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
                // Remover arquivo se usuário não existe
                fs.unlinkSync(req.file.path);
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Usuário não encontrado"
                });
            }

            // Se o usuário já tem avatar, remover o antigo
            if (user.avatar) {
                const oldAvatarPath = path.join(uploadsDir, path.basename(user.avatar));
                if (fs.existsSync(oldAvatarPath)) {
                    fs.unlinkSync(oldAvatarPath);
                }
            }

            // Salvar caminho do novo avatar
            const avatarPath = `/uploads/${req.file.filename}`;

            const updatedUser = await prisma.usuario.update({
                where: {
                    id: Number(userId)
                },
                data: {
                    avatar: avatarPath
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
            // Remover arquivo em caso de erro
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
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

            // Remover arquivo do sistema
            const avatarPath = path.join(uploadsDir, path.basename(user.avatar));
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
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
