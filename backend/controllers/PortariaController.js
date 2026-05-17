import { prisma } from "../config/prisma.js"

class PortariaController {

    static async readVisitanteLocal(req, res) {

        try {

            const visitantes = await prisma.view_portaria_visitantes.findMany()

            return res.status(200).json({
                sucesso: true,
                dados: visitantes
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mesagem: "erro interno no servidor",
                erro: e.message
            })
        }

    }

    static async readDependencias(req, res) {

        try {

            const visitantes = await prisma.view_portaria_pendencias.findMany()

            return res.status(200).json({
                sucesso: true,
                dados: visitantes
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mesagem: "erro interno no servidor",
                erro: e.message
            })
        }

    }

}

export default PortariaController