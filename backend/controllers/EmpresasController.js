import { prisma } from "../config/prisma.js";

class EmpresasController {
    static async Read(req, res) {
        try {
            const empresas = await prisma.$queryRaw`
                SELECT
                    id,
                    nome,
                    'Ativa' AS status,
                    0 AS visitantes,
                    NULL AS "ultimaVisita"
                FROM empresas
                WHERE nome IS NOT NULL AND TRIM(nome) <> ''
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
