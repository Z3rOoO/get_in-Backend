// import { Create, Read, Delete, Update } from "../config/database.js";
import { prisma } from '../config/prisma.js';
import mqtt from "mqtt"

class DispositivosController {

    static async Create(req, res) {
        //     //idDepartamento INT NOT NULL,
        // local VARCHAR(150),
        // dataManutencao TIMESTAMP,
        try {
            const { idDepartamento, local, dataManutencao } = req.body// faz a requisição dos valores do body
            const data = { idDepartamento, local, dataManutencao }

            const result = await prisma.dispositivo.create({
                data: data
            })//cria o registro na tabela
            return res.status(201).json({
                sucesso: true,
                mensagem: "Dispositivo cadastrado com sucesso",
                data: result//retorna os valores com o id do dispositivo que foi criado
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao cadastrar o dispositivo",
                erro: e.message
            })
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params;
            const { idDepartamento, local, dataManutencao } = req.body;
            const data = {
                idDepartamento,
                local,
                dataManutencao
            }

            const result = await prisma.dispositivo.update({
                where: {
                    id: Number(id)
                },
                data: {
                    idDepartamento: Number(idDepartamento),
                    local,
                    dataManutencao: new Date(dataManutencao)
                }
            })

            return res.status(200).json({
                sucesso: true,
                mensagem: "Dados do dispositivos atualizados",
                data: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar so dados dos funcionarios",
                erro: e.message
            })
        }
    }

    static async Read(req, res) {
        try {
            const dispositivos = await prisma.dispositivo.findMany()
            return res.status(200).json({
                sucesso: true,
                mensagem: "Dispositivos lidos com sucesso",
                data: dispositivos
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler dispositivos",
                erro: e.message
            })
        }
    }

    static async ReadById(req, res) {
        try {
            const { id } = req.params

            const dispositivo = await prisma.dispositivo.findUnique({
                where: {
                    id: Number(id)
                }
            })

            return res.status(200).json({
                sucesso: true,
                mensagem: "dispositivo lido com sucesso",
                data: dispositivo
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler o dispositivo",
                erro: e.message
            })
        }
    }

    static async ReadBySetor(req, res) {
        try {
            const { id } = req.params

            const dispositivos = await prisma.dispositivo.findMany({
                where: {
                    idDepartamento: Number(id)
                }
            })

            return res.status(200).json({
                sucesso: true,
                mensagem: "Dispositivos encontrados com sucesso",
                data: dispositivos
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao encontrar dispositivos",
                erro: e.message
            })
        }
    }

    static async ReadByName(req, res) {
        try {
            const { name } = req.params

            const dispositivos = await prisma.dispositivo.findMany({
                where: {
                    local: {
                        contains: name
                    }
                }
            }) // verifica se tem o valor procurado em qualquer posição no nome dos registros
            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuarios encontrados com sucesso",
                data: dispositivos
            })

        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao procurar usuarios desejados",
                erro: e.message
            })
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params
            const result = await prisma.dispositivo.delete({
                where: {
                    id: Number(id)
                }
            })
            return res.status(200).json({
                sucesso: true,
                mensagem: "Dispositivo deletado com sucesso",
                data: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar o dispositivo",
                erro: e.message
            })
        }
    }

    static async verificarCracha(req, res) {

        // const client = await mqtt.connect("mqtt://broker.hivemq.com")

        try {
            // /dispositivos/idDoDispositivo/cracha
            const { id, cracha } = req.params

            // await client.on("connect", async () => {
            //     console.log("conectou aqui na api")
            //     client.subscribe(`get-in-3td/dispositivos/${id}`)


            // VERIFICAÇÕES DE CRACHA E USUARIO

            const dispositivo = await prisma.dispositivo.findUnique({
                where: {
                    id: Number(id)
                }, select: {
                    idSetor: true
                }
            })

            if (!dispositivo) { // verifica se o dispositivo existe, se não existir, retorna que o dispositivo não é cadastrado

                // client.publish(`get-in-3td/dispositivos/${id}`, "false/ERRO, DISPOSITIVO NÃO VINCULADO")

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

                // client.publish(`get-in-3td/dispositivos/${id}`, "false/CRACHA NÃO CADASTRADO")

                return res.status(404).json({
                    sucesso: false,
                    mensagem: "NENHUM USUARIO VINCULADO AO CRACHA"
                })
            }


            const funcionario = await prisma.funcionario.findFirst({
                where: {
                    id: tag.idUsuario,
                    idSetor: dispositivo.idSetor
                }
            })

            if (funcionario.length !== 0) {
                // client.publish(`get-in-3td/dispositivos/${id}`, "true/ACESSO PERMITIDO")
                return res.json({
                    sucesso: true,
                    mensagem: "ACESSO PERMITIDO"
                })
            }


            const requisicao = await prisma.view_central_requisicoes.findMany({
                where: {
                    idDepartamento: dispositivo.idSetor,
                    idUsuario: tag.idUsuario
                }
            })

            console.log(requisicao)


            if (requisicao.length !== 0) {
                if (requisicao.status === "aprovado") {
                    // client.publish(`get-in-3td/dispositivos/${id}`, "true/ACESSO PERMITIDO")
                    return res.status(200).json({
                        sucesso: true,
                        mensagem: "ACESSO PERMITIDO"
                    })
                }
                if (requisicao.status === "recusado") {
                    // client.publish(`get-in-3td/dispositivos/${id}`, "false/ACESSO AO DEPARTAMENTO RECUSADO PELO SUPERVISOR")
                    return res.status(200).json({
                        sucesso: false,
                        mensagem: "ACESSO AO DEPARTAMENTO RECUSADO PELO SUPERVISOR"
                    })
                }
                if (requisicao.status === "pendente") {
                    // client.publish(`get-in-3td/dispositivos/${id}`, "/AGUARDANDO VERIFICAÇÃO DO SUPERVISOR")
                    return res.status(200).json({
                        sucesso: false,
                        mensagem: "AGUARDANDO VERIFICAÇÃO DO SUPERVISOR"
                    })
                }
            }

            
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao verificar o crachá",
                erro: e.message
            })
        }
    }
}

export default DispositivosController;