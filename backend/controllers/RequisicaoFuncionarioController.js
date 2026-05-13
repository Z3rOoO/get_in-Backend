// import { Create, Update, Delete, Read } from "../config/database.js";
import { prisma } from '../config/prisma.js';

class RequisicaoFuncionarioController {
    static async Create(req, res) {
        try {
            const { idUsuario, idSetor } = req.body

            const dado = {
                idUsuario: Number(idUsuario),
                idSetor: Number(idSetor)
            }

            const result = await prisma.requisicaoDeAcesso.create({
                data: dado
            })
            return res.status(201).json({
                sucesso: true,
                mensagem: "Requisição feita com sucesso",
                data: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao realizar a requisição",
                erro: e.message
            })
        }
    }

    static async Read(req, res) {
        try {
            const result = await prisma.requisicaoDeAcesso.findMany() 
            if (result.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhuma requisição encontrada"
                })
            }
            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisições listadas com sucesso",
                data: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar as requisições",
                erro: e.message
            })
        }
    }

    static async ReadById(req, res) {
        try {
            const { id } = req.params
            const result = await prisma.requisicaoDeAcesso.findUnique({
                where: {
                    id: Number(id)
                }
            })
            if (!result) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Requisição não encontrada"
                })
            }   
            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisição lida com sucesso",
                data: result
            })
        }
        catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler a requisição",
                erro: e.message
            })
        }
    }

    static async ReadByFunc(req, res) {
        try {
            const { id } = req.params
            const result = await prisma.requisicaoDeAcesso.findMany({
                where: {
                    idUsuario: Number(id)
                }
            })

            if (result.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhuma requisição encontrada para esse funcionário"
                })
            }
            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisições lidas com sucesso",
                data: result
            })
        }
        catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler as requisições",
                erro: e.message
            })
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params
            const { status } = req.body
            const result = await prisma.requisicaoDeAcesso.update({
                where: {
                    id: Number(id)
                },
                data: {
                    status
                }
            })
            return res.status(200).json({
                sucesso: true,
                mensagem: "Status da requisição atualizado",
                data: result
            })
        }
        catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar o status da requisição",
                erro: e.message
            })
        }

    }

    static async Delete(req, res) {
        try {
            const { id } = req.params
            const result = await prisma.requisicaoDeAcesso.delete({
                where: {
                    id: Number(id)
                }
            })
            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisição deletada com sucesso",
                data: result
            })
        }
        catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar a requisição",
                erro: e.message
            })
        }
    }

    static async ReadBySetor(req, res) {
        try {
            const { id } = req.params
            const result = await prisma.requisicaoDeAcesso.findMany({
                where: {
                    idSetor: Number(id)
                }
            })
            if (result.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhuma requisição encontrada para esse setor"
                })
            }
            res.status(200).json({
                sucesso: true,
                mensagem: "Requisições listadas com sucesso",
                data: result
            })
        }
        catch (e) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar as requisições",
                erro: e.message
            })
        }
    }

}

export default RequisicaoFuncionarioController;
