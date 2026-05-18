import { prisma } from "../config/prisma.js"

class EmpresaController {
    static async read(req, res) {
        try {
            const empresas = await prisma.empresas.findMany()
            if (empresas.length == 0) {

                return res.status(404).json({
                    sucesso: false,
                    mesagem: "Nenhuma empresa encontrada",
                })

            }
            return res.status(200).json({
                sucesso: true,
                mesagem: "Empresas listadas com sucesso",
                data: empresas
            })
        } catch (e) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno no servidor",
                erro: e.message
            })
        }
    }
}

export default EmpresaController