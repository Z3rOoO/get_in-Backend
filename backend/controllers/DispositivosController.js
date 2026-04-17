import { Create, Read, Delete, Update } from "../config/database";

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
                dados: result//retorna os valores com o id do dispositivo que foi criado
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
                dados: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar so dados dos funcionarios",
                dados: e.message
            })
        }
    }

    static async Read(req, res) {
        try {
            const dispositivos = await prisma.dispositivo.findMany()
            return res.status(200).json({
                sucesso: true,
                mensagem: "Dispositivos lidos com sucesso",
                dados: dispositivos
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

            const dado = await prisma.dispositivo.findUnique({
                where: {
                    id: Number(id)
                }
            })

            return res.status(200).json({
                sucesso: true,
                mensagem: "dispositivo lido com sucesso",
                dados: dado
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

            const dado = await prisma.dispositivo.findMany({
                where: {
                    idDepartamento: Number(id)
                }
            })

            return res.status(200).json({
                sucesso: true,
                mensagem: "Dispositivos encontrados com sucesso",
                dados: dado
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

            const dado = await prisma.dispositivo.findMany({
                where: {
                    local: {
                        contains: name
                    }
                }
            }) // verifica se tem o valor procurado em qualquer posição no nome dos registros
            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuarios encontrados com sucesso",
                dados: dado
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
                dados: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar o dispositivo",
                erro: e.message
            })
        }
    }
}

export default DispositivosController;