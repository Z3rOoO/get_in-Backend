import { Create, Update, Delete, Read } from "../config/database.js";
import { prisma } from '../config/prisma.js';

class RequisicaoVisitanteController {
    static async Create(req, res) {
        try {
            const { idUsuario, idDepartamento, motivo, validade } = req.body;

            if (!idUsuario || !idDepartamento) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "idUsuario e idDepartamento são obrigatórios"
                });
            }

            const resultado = await prisma.requisicoesDeAcesso.create({
                data: {
                    idUsuario: Number(idUsuario),
                    idDepartamento: Number(idDepartamento),
                    motivo: motivo || null,
                    validade: validade || null,
                    status: "pendente"
                }
            });

            return res.status(201).json({
                sucesso: true,
                mensagem: "Requisição de visitante criada com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar requisição de visitante",
                erro: e.message
            });
        }
    }

    static async Read(req, res) {
        try {
            const resultado = await prisma.requisicoesDeAcesso.findMany({
                include: {
                    usuario: true,
                    departamento: true
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisições de visitantes listadas com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar requisições de visitantes",
                erro: e.message
            });
        }
    }

    static async ReadById(req, res) {
        try {
            const { id } = req.params;

            const resultado = await prisma.requisicoesDeAcesso.findUnique({
                where: { id: Number(id) },
                include: {
                    usuario: true,
                    departamento: true
                }
            });

            if (!resultado) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Requisição não encontrada"
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisição encontrada com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao buscar requisição",
                erro: e.message
            });
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params;
            const { status, motivo, validade } = req.body;

            const resultado = await prisma.requisicoesDeAcesso.update({
                where: { id: Number(id) },
                data: {
                    status: status || undefined,
                    motivo: motivo || undefined,
                    validade: validade || undefined
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisição atualizada com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar requisição",
                erro: e.message
            });
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params;

            const resultado = await prisma.requisicoesDeAcesso.delete({
                where: { id: Number(id) }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisição deletada com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar requisição",
                erro: e.message
            });
        }
    }
}

export default RequisicaoVisitanteController;