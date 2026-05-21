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

        const client = await mqtt.connect("mqtt://broker.hivemq.com")

        try {
            // /dispositivos/idDoDispositivo/cracha
            const { id, cracha } = req.params

            await client.on("connect", async () => {
                console.log("conectou aqui na api")
                client.subscribe(`get-in-3td/dispositivos/${id}`)


                // VERIFICAÇÕES DE CRACHA E USUARIO

                const dispositivo = await prisma.dispositivo.findUnique({
                    where: {
                        id: Number(id)
                    }, select: {
                        idSetor: true
                    }
                })

                console.log(dispositivo)

                if (!dispositivo) { // verifica se o dispositivo existe, se não existir, retorna que o dispositivo não é cadastrado

                    client.publish(`get-in-3td/dispositivos/${id}`, "false/ERRO, DISPOSITIVO NÃO VINCULADO")

                    return res.status(404).json({
                        sucesso: false,
                        mensagem: "ERRO, DISPOSITIVO NÃO VINCULADO"
                    })
                }

                const tag = await prisma.tag.findUnique({ // pega a tag pelo pela id do cracha 
                    where: {
                        codigoTag: cracha
                    }
                })


                if (!tag) { // CRACHA NÃO CADASTRADO NO SISTEMA 
                    return res.status(404).json({
                        sucesso: false,
                        mensagem: "CRACHA NÃO CADASTRADO NO SISTEMA"
                    })
                }

                if (tag.idUsuario == null) { // verifica se o cracha tem um usuario associado, se não tiver, retorna que não existe usuario vinculado ao cracha

                    client.publish(`get-in-3td/dispositivos/${id}`, "false/CRACHA NÃO CADASTRADO")

                    return res.status(404).json({
                        sucesso: false,
                        mensagem: "NENHUM USUARIO VINCULADO AO CRACHA"
                    })
                }

                console.log("id: " + tag.idUsuario)
                console.log("idSetor: " + dispositivo.idSetor)


                const funcionario = await prisma.funcionario.findFirst({
                    where: {
                        id: tag.idUsuario,
                        idSetor: dispositivo.idSetor
                    }
                })

                console.log("funcionario: " + funcionario)

                if (funcionario != null) {
                    client.publish(`get-in-3td/dispositivos/${id}`, "true/ACESSO PERMITIDO")
                    return res.json({
                        sucesso: true,
                        mensagem: "ACESSO PERMITIDO"
                    })
                }


                const requisicao = await prisma.view_central_requisicoes.findFirst({
                    where: {
                        idDepartamento: dispositivo.idSetor,
                        idUsuario: tag.idUsuario
                    }
                })

                console.log(requisicao.status)


                if (requisicao.length != 0) {
                    if (requisicao.status === "aprovado") {
                        client.publish(`get-in-3td/dispositivos/${id}`, "true/ACESSO PERMITIDO")
                        return res.status(200).json({
                            sucesso: true,
                            mensagem: "ACESSO PERMITIDO"
                        })
                    }
                    if (requisicao.status === "recusado") {
                        client.publish(`get-in-3td/dispositivos/${id}`, "false/ACESSO AO DEPARTAMENTO RECUSADO PELO SUPERVISOR")
                        return res.status(200).json({
                            sucesso: false,
                            mensagem: "ACESSO AO DEPARTAMENTO RECUSADO PELO SUPERVISOR"
                        })
                    }
                    if (requisicao.status === "pendente") {
                        client.publish(`get-in-3td/dispositivos/${id}`, "/AGUARDANDO VERIFICAÇÃO DO SUPERVISOR")
                        return res.status(200).json({
                            sucesso: false,
                            mensagem: "AGUARDANDO VERIFICAÇÃO DO SUPERVISOR"
                        })
                    }
                }
                else {
                    return res.status(404).json({
                        sucesso: false,
                        mensagem: "ACESSO NEGADO"
                    })
                }


            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "erro interno",
                erro: e.message
            })
        }
    }
}

export default DispositivosController;
