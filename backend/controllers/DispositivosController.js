import { prisma } from "../config/prisma.js";
import mqtt from "mqtt";

function parseOptionalNumber(value) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : undefined;
}

class DispositivosController {
    static async Create(req, res) {
        try {
            const { idDepartamento, idDep, idSetor, local, dataManutencao } = req.body;

            const result = await prisma.dispositivo.create({
                data: {
                    idDep: parseOptionalNumber(idDep || idDepartamento) || 1,
                    idSetor: parseOptionalNumber(idSetor) || null,
                    local,
                    dataManutencao: dataManutencao ? new Date(dataManutencao) : null
                }
            });

            return res.status(201).json({
                sucesso: true,
                mensagem: "Dispositivo cadastrado com sucesso",
                data: result
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao cadastrar o dispositivo",
                erro: e.message
            });
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params;
            const { idDepartamento, idDep, idSetor, local, dataManutencao } = req.body;
            const data = {};

            if (idDep !== undefined || idDepartamento !== undefined) {
                data.idDep = parseOptionalNumber(idDep || idDepartamento) || 1;
            }
            if (idSetor !== undefined) data.idSetor = parseOptionalNumber(idSetor) || null;
            if (local !== undefined) data.local = local;
            if (dataManutencao !== undefined) data.dataManutencao = dataManutencao ? new Date(dataManutencao) : null;

            const result = await prisma.dispositivo.update({
                where: { id: Number(id) },
                data
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Dados do dispositivo atualizados",
                data: result
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar os dados do dispositivo",
                erro: e.message
            });
        }
    }

    static async Read(req, res) {
        try {
            const dispositivos = await prisma.dispositivo.findMany();
            return res.status(200).json({
                sucesso: true,
                mensagem: "Dispositivos lidos com sucesso",
                data: dispositivos
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler dispositivos",
                erro: e.message
            });
        }
    }

    static async ReadById(req, res) {
        try {
            const { id } = req.params;

            const dispositivo = await prisma.dispositivo.findUnique({
                where: { id: Number(id) }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Dispositivo lido com sucesso",
                data: dispositivo
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler o dispositivo",
                erro: e.message
            });
        }
    }

    static async ReadBySetor(req, res) {
        try {
            const { id } = req.params;

            const dispositivos = await prisma.dispositivo.findMany({
                where: {
                    idSetor: Number(id)
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Dispositivos encontrados com sucesso",
                data: dispositivos
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao encontrar dispositivos",
                erro: e.message
            });
        }
    }

    static async ReadByName(req, res) {
        try {
            const { name } = req.params;

            const dispositivos = await prisma.dispositivo.findMany({
                where: {
                    local: {
                        contains: name,
                        mode: "insensitive"
                    }
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Dispositivos encontrados com sucesso",
                data: dispositivos
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao procurar dispositivos",
                erro: e.message
            });
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params;
            const result = await prisma.dispositivo.delete({
                where: {
                    id: Number(id)
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Dispositivo deletado com sucesso",
                data: result
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar o dispositivo",
                erro: e.message
            });
        }
    }

    static async verificarCracha(req, res) {
        const client = mqtt.connect("mqtt://broker.hivemq.com");

        try {
            const { id, cracha } = req.params;

            client.on("connect", async () => {
                client.subscribe(`get-in-3td/dispositivos/${id}`);

                const dispositivo = await prisma.dispositivo.findUnique({
                    where: {
                        id: Number(id)
                    },
                    select: {
                        idSetor: true
                    }
                });

                if (!dispositivo) {
                    client.publish(`get-in-3td/dispositivos/${id}`, "false/ERRO, DISPOSITIVO NAO VINCULADO");

                    return res.status(404).json({
                        sucesso: false,
                        mensagem: "ERRO, DISPOSITIVO NAO VINCULADO"
                    });
                }

                const tag = await prisma.tag.findUnique({
                    where: {
                        codigoTag: cracha
                    },
                    select: {
                        idUsuario: true
                    }
                });

                if (!tag) {
                    client.publish(`get-in-3td/dispositivos/${id}`, "false/CRACHA NAO CADASTRADO");

                    return res.status(404).json({
                        sucesso: false,
                        mensagem: "CRACHA NAO CADASTRADO NO SISTEMA"
                    });
                }

                if (!tag.idUsuario) {
                    client.publish(`get-in-3td/dispositivos/${id}`, "false/USUARIO NAO VINCULADO AO CRACHA");

                    return res.status(404).json({
                        sucesso: false,
                        mensagem: "USUARIO NAO VINCULADO AO CRACHA"
                    });
                }

                const funcionarios = await prisma.funcionario.findMany({
                    where: {
                        idUsuario: tag.idUsuario
                    },
                    select: {
                        idSetor: true
                    }
                });

                const requisicao = await prisma.view_central_requisicoes.findFirst({
                    where: {
                        idUsuario: tag.idUsuario,
                        idDepartamento: dispositivo.idSetor
                    },
                    select: {
                        idUsuario: true,
                        idDepartamento: true,
                        status: true
                    }
                });

                if (requisicao?.status === "aprovado") {
                    client.publish(`get-in-3td/dispositivos/${id}`, "true/ACESSO PERMITIDO");
                    return res.status(200).json({
                        sucesso: true,
                        mensagem: "ACESSO PERMITIDO"
                    });
                }

                if (requisicao?.status === "recusado") {
                    client.publish(`get-in-3td/dispositivos/${id}`, "false/ACESSO AO SETOR RECUSADO PELO SUPERVISOR");
                    return res.status(200).json({
                        sucesso: false,
                        mensagem: "ACESSO AO SETOR RECUSADO PELO SUPERVISOR"
                    });
                }

                if (requisicao?.status === "pendente") {
                    client.publish(`get-in-3td/dispositivos/${id}`, "aguarde/AGUARDANDO VERIFICACAO DO SUPERVISOR");
                    return res.status(200).json({
                        sucesso: false,
                        mensagem: "AGUARDANDO VERIFICACAO DO SUPERVISOR"
                    });
                }

                if (!funcionarios.some((funcionario) => funcionario.idSetor === dispositivo.idSetor)) {
                    const funcionario = await prisma.funcionario.findFirst({
                        where: {
                            idUsuario: tag.idUsuario
                        }
                    });

                    if (funcionario) {
                        client.publish(`get-in-3td/dispositivos/${id}`, "aguarde/SETOR NAO AUTORIZADO, SOLICITANDO ACESSO AO SUPERVISOR.");
                        return res.status(403).json({
                            sucesso: false,
                            mensagem: "SETOR NAO AUTORIZADO, SOLICITADO ACESSO AO SUPERVISOR."
                        });
                    }

                    client.publish(`get-in-3td/dispositivos/${id}`, "false/ACESSO NEGADO");
                    return res.status(403).json({
                        sucesso: false,
                        mensagem: "ACESSO NEGADO"
                    });
                }

                client.publish(`get-in-3td/dispositivos/${id}`, "true/ACESSO PERMITIDO");
                return res.status(200).json({
                    sucesso: true,
                    mensagem: "ACESSO PERMITIDO"
                });
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao verificar o cracha",
                erro: e.message
            });
        }
    }
}

export default DispositivosController;
