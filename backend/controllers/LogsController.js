// import { Create, Update, Read, Delete } from "../config/database.js";
import { prisma } from '../config/prisma.js';

class LogsController {

    static async Read(req, res) {
        try {
            const logs = await prisma.logDeAcesso.findMany();
            return res.status(200).json({
                sucesso: true,
                mensagem: "Logs lidas com sucesso",
                data: logs
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler os Logs",
                erro: e.message
            });
        }
    }

    static async Create(req, res) {
        try {
            const { idDispositivo, idUsuario, dataDeEntrada, dataDeSaida } = req.body;

            if (!idDispositivo || !idUsuario) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "idDispositivo e idUsuario são obrigatórios"
                });
            }

            const result = await prisma.logDeAcesso.create({
                data: {
                    idDispositivo: Number(idDispositivo),
                    idUsuario: Number(idUsuario),
                    dataDeEntrada: dataDeEntrada ? new Date(dataDeEntrada) : new Date(),
                    dataDeSaida: dataDeSaida ? new Date(dataDeSaida) : null
                }
            });

            return res.status(201).json({
                sucesso: true,
                mensagem: "Log criado com sucesso",
                data: result
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar a log",
                erro: e.message
            });
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params;
            const { idDispositivo, idUsuario, dataDeEntrada, dataDeSaida } = req.body;

            const result = await prisma.logDeAcesso.update({
                where: { id: Number(id) },
                data: {
                    idDispositivo: idDispositivo ? Number(idDispositivo) : undefined,
                    idUsuario: idUsuario ? Number(idUsuario) : undefined,
                    dataDeEntrada: dataDeEntrada ? new Date(dataDeEntrada) : undefined,
                    dataDeSaida: dataDeSaida ? new Date(dataDeSaida) : undefined
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Log atualizado com sucesso",
                data: result
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar a log",
                erro: e.message
            });
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params;

            await prisma.logDeAcesso.delete({
                where: { id: Number(id) }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Log deletado com sucesso"
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar a log",
                erro: e.message
            });
        }
    }

    static async ReadByUser(req, res) {
        try {
            const { idUsuario } = req.params;

            const logs = await prisma.logDeAcesso.findMany({
                where: {
                    idUsuario: Number(idUsuario)
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Logs lidas com sucesso",
                data: logs
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler os logs",
                erro: e.message
            });
        }
    }

    static async ReadByDevice(req, res) {
        try {
            const { idDispositivo } = req.params;

            const logs = await prisma.logDeAcesso.findMany({
                where: {
                    idDispositivo: Number(idDispositivo)
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Logs lidas com sucesso",
                data: logs
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler os logs",
                erro: e.message
            });
        }
    }

    static async ReadById(req, res) {
        try {
            const { id } = req.params;

            const log = await prisma.logDeAcesso.findUnique({
                where: { id: Number(id) }
            });

            if (!log) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Log não encontrado"
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Log lida com sucesso",
                data: log
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler a log",
                erro: e.message
            });
        }
    }
}

export default LogsController;