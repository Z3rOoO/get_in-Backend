import { prisma } from "../config/prisma.js";

class EmpresasController {
    static async Read(req, res) {
        try {
            const empresas = await prisma.$queryRaw`
                SELECT
                    ROW_NUMBER() OVER (ORDER BY nome) AS id,
                    nome,
                    'Ativa' AS status,
                    COUNT(*)::int AS visitantes,
                    MAX(data_visita) AS "ultimaVisita"
                FROM (
                    SELECT TRIM(empresa) AS nome, "dataDeCriacao" AS data_visita
                    FROM usuarios
                    WHERE empresa IS NOT NULL AND TRIM(empresa) <> ''

                    UNION ALL

                    SELECT TRIM(empresa) AS nome, "dataDaRequisicao" AS data_visita
                    FROM requisicoes_de_visitas
                    WHERE empresa IS NOT NULL AND TRIM(empresa) <> ''
                ) empresas_banco
                GROUP BY nome
                ORDER BY nome ASC
            `;

            return res.status(200).json({
                sucesso: true,
                mensagem: "Empresas lidas com sucesso",
                data: empresas.map((empresa) => ({
                    ...empresa,
                    id: Number(empresa.id),
                    ultimaVisita: empresa.ultimaVisita
                }))
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler as empresas",
                erro: e.message
            });
        }
    }
}

export default EmpresasController;
