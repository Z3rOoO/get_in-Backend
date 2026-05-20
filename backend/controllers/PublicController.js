import { prisma } from "../config/prisma.js";

class PublicController {
    static async stats(req, res) {
        try {
            const inicioDoDia = new Date();
            inicioDoDia.setHours(0, 0, 0, 0);

            const [usuariosTotal, setoresTotal, visitasHoje] = await Promise.all([
                prisma.usuario.count(),
                prisma.setores.count(),
                prisma.requisicaoDeVisita.count({
                    where: {
                        dataDaRequisicao: {
                            gte: inicioDoDia
                        }
                    }
                })
            ]);

            return res.status(200).json({
                sucesso: true,
                data: {
                    usuariosTotal,
                    setoresTotal,
                    visitasHoje
                }
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao buscar estatisticas publicas",
                erro: e.message
            });
        }
    }
}

export default PublicController;
