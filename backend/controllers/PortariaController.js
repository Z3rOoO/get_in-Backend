import { prisma } from "../config/prisma.js"

class PortariaController {

    static async readVisitanteLocal(req, res) {

        try {

            const visitantes = await prisma.$queryRaw`
                WITH visitantes_logs AS (
                    SELECT
                        u.id,
                        u.nome,
                        e.nome AS empresa,
                        l.id AS "idLog",
                        l."dataDeEntrada" AS entrada,
                        l."dataDeSaida" AS "dataSaida",
                        u.celular,
                        u.email,
                        CASE
                            WHEN l."dataDeEntrada" IS NULL THEN 'Pendente'
                            WHEN l."dataDeSaida" IS NULL THEN 'Dentro'
                            ELSE 'Saida'
                        END AS status,
                        ROW_NUMBER() OVER (
                            PARTITION BY u.id
                            ORDER BY
                                COALESCE(l."dataDeSaida", l."dataDeEntrada") DESC NULLS LAST,
                                l.id DESC
                        ) AS ordem
                    FROM usuarios u
                    LEFT JOIN funcionarios f ON u.id = f."idUsuario"
                    LEFT JOIN empresas e ON u."idEmpresa" = e.id
                    LEFT JOIN logs l ON l."idUsuario" = u.id
                    LEFT JOIN dispositivos d ON l."idDispositivo" = d.id
                    WHERE f."idUsuario" IS NULL
                        AND d.id = 10
                )
                SELECT id, nome, empresa, "idLog", entrada, "dataSaida", celular, email, status
                FROM visitantes_logs
                WHERE ordem = 1
                ORDER BY
                    COALESCE("dataSaida", entrada) DESC NULLS LAST,
                    "idLog" DESC
            `

            return res.status(200).json({
                sucesso: true,
                dados: visitantes,
                data: visitantes
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mesagem: "erro interno no servidor",
                erro: e.message
            })
        }

    }

    static async readPendencias(req, res) {

        try {

            const visitantes = await prisma.view_portaria_pendencias.findMany()

            return res.status(200).json({
                sucesso: true,
                dados: visitantes,
                data: visitantes
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
