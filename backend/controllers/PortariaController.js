import { prisma } from "../config/prisma.js"

class PortariaController {

    static async readVisitanteLocal(req, res) {
        
        const visitantes = await prisma.view_portaria_visitantes.findMany()

        return res.status(200).json({
            sucesso: true,
            dados: visitantes
        })

    }

}

export default PortariaController