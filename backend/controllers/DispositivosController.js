import { prisma } from "../config/prisma.js";
import { client } from "../config/mqtt.js";


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

        try {
            // /dispositivos/idDoDispositivo/cracha
            const { id, cracha } = req.params;

            // VERIFICAÇÕES DE CRACHA E USUARIO
            const dispositivo = await prisma.dispositivo.findUnique({
                where: {
                    id: Number(id)
                }, select: {
                    idSetor: true
                }
            })

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

                client.publish(`get-in-3td/dispositivos/${id}`, "true/CRACHA CADASTRADO NO SISTEMA")

                const newCracha = await prisma.tag.create({
                    data: {
                        codigoTag: cracha,
                        idUsuario: null,
                        idCracha: null,
                        status: "disponivel",
                        fisica: true
                    }
                })

                return res.status(201).json({
                    sucesso: true,
                    mensagem: "CRACHA CADASTRADO NO SISTEMA"
                })
            }

            if (tag.idUsuario == null) { // verifica se o cracha tem um usuario associado, se não tiver, retorna que não existe usuario vinculado ao cracha

                client.publish(`get-in-3td/dispositivos/${id}`, "false/NENHUM USUARIO VINCULADO AO CRACHA")

                return res.status(404).json({
                    sucesso: false,
                    mensagem: "NENHUM USUARIO VINCULADO AO CRACHA"
                })
            }

            const setor = await prisma.setores.findFirst({
                where: {
                    id: dispositivo.idSetor
                }
            })

            const log = {
                idDispositivo: Number(id),
                idUsuario: tag.idUsuario,
                data: new Date().toISOString()
            }


            if (!setor) {
                client.publish(`get-in-3td/dispositivos/${id}`, "false/SETOR NÃO VINCULADO")
                return res.status(404).json({
                    sucesso: false,
                    mesagem: "SETOR NÃO VINCULADO"
                })
            }

            if (setor.status == "Inativo") {
                client.publish(`get-in-3td/dispositivos/${id}`, "aguarde/SETOR INATIVO")
                return res.status(200).json({
                    sucesso: true,
                    mesagem: "SETOR INATIVO"
                })
            }

            if (setor.acesso == "Bloqueado") {
                client.publish(`get-in-3td/dispositivos/${id}`, "aguarde/SETOR BLOQUEADO")
                return res.status(200).json({
                    sucesso: true,
                    mesagem: "SETOR BLOQUEADO"
                })
            }

            if (setor.acesso == "Liberado") {
                client.publish(`get-in-3td/dispositivos/${id}`, "true/ACESSO PERMITIDO")

                await fetch(`https://get-in-ilp5.onrender.com/logs/disp`, {
                    headers: { "Content-Type": "application/json" },
                    method: "POST",
                    body: JSON.stringify(log)
                })

                return res.status(200).json({
                    sucesso: true,
                    mesagem: "ACESSO PERMITIDO"
                })
            }



            const funcionario = await prisma.funcionario.findFirst({
                where: {
                    idUsuario: tag.idUsuario,
                    idSetor: dispositivo.idSetor
                }
            })


            if (funcionario != null) {

                await fetch("https://get-in-ilp5.onrender.com/logs/disp", {
                    headers: { "Content-Type": "application/json" },
                    method: "POST",
                    body: JSON.stringify(log)
                })


                client.publish(`get-in-3td/dispositivos/${id}`, "true/ACESSO PERMITIDO")
                return res.status(200).json({
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

            if (requisicao != null) {
                if (requisicao.status === "aprovado") {

                    await fetch(`https://get-in-ilp5.onrender.com/logs/disp`, {
                        headers: { "Content-Type": "application/json" },
                        method: "POST",
                        body: JSON.stringify(log)
                    })

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
                    client.publish(`get-in-3td/dispositivos/${id}`, "aguarde/AGUARDANDO VERIFICAÇÃO DO SUPERVISOR")
                    return res.status(200).json({
                        sucesso: false,
                        mensagem: "AGUARDANDO VERIFICAÇÃO DO SUPERVISOR"
                    })
                }
            }
            else {

                client.publish(`get-in-3td/dispositivos/${id}`, "false/ACESSO NEGADO")
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "ACESSO NEGADO"
                })
            }
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
