// import { Create, Update, Read, Delete } from "../config/database.js";
import { prisma } from '../config/prisma.js';

class LogsController {

    static async Read(req, res) {
        try {
            const logs = await prisma.log.findMany();
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

            const result = await prisma.log.create({
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

            const result = await prisma.log.update({
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

            await prisma.log.delete({
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

            const logs = await prisma.log.findMany({
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

            const logs = await prisma.log.findMany({
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

            const log = await prisma.log.findUnique({
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

    static async dispLog(req, res) {

        try {

            const { idDispositivo, idUsuario, data } = req.body; // puxar as informações do dispositivo
            const dispositivoId = Number(idDispositivo);
            const usuarioId = Number(idUsuario);
            const dataRegistro = data ? new Date(data) : new Date();

            if (!Number.isInteger(dispositivoId) || !Number.isInteger(usuarioId)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "idDispositivo e idUsuario são obrigatórios"
                })
            }

            const logs = await prisma.log.findFirst({ // verifica se tem um log com essas informações
                where: {
                    idDispositivo: dispositivoId,
                    idUsuario: usuarioId
                }, orderBy: {
                    id: "desc"
                }
            })


            if (!logs) { // não tem log desse usuario para essa dispositivo

                const log = await prisma.log.create({ // cria um novo log com data de entrada
                    data: {
                        idDispositivo: dispositivoId,
                        idUsuario: usuarioId,
                        dataDeEntrada: dataRegistro,
                        dataDeSaida: null
                    }
                })

                return res.status(201).json({
                    sucesso: true,
                    mensagem: "Criado log com sucesso",
                    data: log
                })
            }

            if (logs.dataDeEntrada != null && logs.dataDeSaida != null) { // cria um novo log
                const log = await prisma.log.create({
                    data: {
                        idDispositivo: dispositivoId,
                        idUsuario: usuarioId,
                        dataDeEntrada: dataRegistro,
                        dataDeSaida: null
                    }
                })

                return res.status(201).json({
                    sucesso: true,
                    mensagem: "Criado log com sucesso",
                    data: log
                })

            }

            if (logs.dataDeEntrada != null && logs.dataDeSaida == null) { // atualiza colocando a data de saida do usuario
                const log = await prisma.log.update({ // atualiza a saida do log
                    where: {
                        id: logs.id
                    }, data: {
                        dataDeSaida: dataRegistro
                    }
                })

                return res.status(201).json({
                    sucesso: true,
                    mensagem: "Criado log com sucesso",
                    data: log
                })

            }


        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno do servidor",
                erro: e.message
            })
        }


    }
}

export default LogsController;
