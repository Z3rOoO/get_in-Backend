import { Create, Update, Read, Delete } from "../config/database";

class LogsController {

    static async Read(req, res) {
        try {
            const logs = await Read("logs")//le os logs do banco
            return res.status(200).json({
                sucesso: true,
                mensagem: "Logs lidas com sucesso",
                dados: logs
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler os Logs",
                erro: e.message
            })
        }
    }

    static async Create(req, res) {
        try {
            const { idDispositivo, idUsuario, dataDeEntrada, dataDeSaida } = req.body

            const newlog = {
                idDispositivo,
                idUsuario,
                dataDeEntrada,
                dataDeSaida
            }

            await Create("logs", newlog)//cria uma nova log no banco

            return res.status(200).json({
                sucesso: true,
                mensagem: "Log criado com sucesso",
                dados: newlog
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar a log",
                erro: e.message
            })
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params
            const { idDispositivo, idUsuario, dataDeEntrada, dataDeSaida } = req.body

            const updatedLog = {
                idDispositivo,
                idUsuario,
                dataDeEntrada,
                dataDeSaida
            }
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar a log",
                erro: e.message
            })
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params
            await Delete("logs", `id = ${id}`)//deleta a log com o id fornecido
            return res.status(200).json({
                sucesso: true,
                mensagem: "Log deletado com sucesso",
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar a log",
                erro: e.message
            })
        }
    }

    static async ReadByUser(req, res) {
        try {
            const { idUsuario } = req.params

            const logs = await Read("logs", `idUsuario = ${idUsuario}`)//le as logs de um usuario especifico
            return res.status(200).json({
                sucesso: true,
                mensagem: "Logs lidas com sucesso",
                dados: logs
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler os logs",
                erro: e.message
            })
        }
    }

    static async ReadByDevice(req, res) {
        try {
            const { idDispositivo } = req.params

            const logs = await Read("logs", `idDIspositivos = ${idDispositivo}`) // le as logs baseado em umunico dispositivo
            return res.status(200).json({
                sucesso: true,
                mensagem: "Logs lidas com sucesso",
                dados: logs
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler os logs",
                erro: e.message
            })
        }
    }

    static async ReadById(req, res) {
        try {
            const { id } = req.params
            const log = await Read("logs", `id = ${id}`)
            return res.status(200).json({
                sucesso:true,
                mensagem: "Log lida com sucesso",
                dados: log[0]
            })
        } catch (e){
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler a log",
                erro: e.message
            })
        }
    }
}


export default LogsController