import { prisma } from "../config/prisma.js";
import { supabase, BUCKET_NAME } from "../config/supabase.js";

const url = "https://dmlshwvpsoqpptjmplfq.supabase.co/storage/v1/object/public/usuarios";


class ViewController {
    /**
     * Utilitário para gerar URL pública a partir do path salvo no banco
     */

    static async getRequisicoesConsolidadas(req, res) {
        try {
            const data = await prisma.view_central_requisicoes.findMany();
            return res.status(200).json({ sucesso: true, data });
        } catch (e) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar requisições consolidadas", erro: e.message });
        }
    }

    static async getLogsDetalhados(req, res) {
        try {
            const query = `
                SELECT
                    l.id AS log_id,
                    u.nome AS usuario_nome,
                    u.cpf AS usuario_cpf,
                    disp.local AS local_dispositivo,
                    l."dataDeEntrada",
                    l."dataDeSaida",
                    d.nome AS departamento_usuario
                FROM
                    logs l
                    JOIN usuarios u ON l."idUsuario" = u.id
                    JOIN dispositivos disp ON l."idDispositivo" = disp.id
                    LEFT JOIN funcionarios f ON u.id = f."idUsuario"
                    LEFT JOIN setores d ON f."idSetor" = d.id
            `;
            const data = await prisma.$queryRawUnsafe(query);
            return res.status(200).json({ sucesso: true, data });
        } catch (e) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar logs detalhados", erro: e.message });
        }
    }

    static async getUsuariosDetalhados(req, res) {
        try {
            const rawData = await prisma.view_perfil_completo_usuario.findMany();
            const data = rawData.map(item => ({
                ...item,
                foto_perfil: item.foto_perfil ? `${url}/${item.foto_perfil}` : null
            }));
            return res.status(200).json({ sucesso: true, data });
        } catch (e) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar usuários detalhados", erro: e.message });
        }
    }

    static async getUsuarioDetalhadoPorId(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ sucesso: false, mensagem: "ID do usuário é obrigatório" });
            }
            const usuario = await prisma.view_perfil_completo_usuario.findFirst({
                where: { usuario_id: Number(id) }
            });
            if (!usuario) {
                return res.status(404).json({ sucesso: false, mensagem: "Usuário não encontrado" });
            }
            usuario.foto_perfil = usuario.foto_perfil ? `${url}/${usuario.foto_perfil}` : null;
            return res.status(200).json({ sucesso: true, data: usuario });
        } catch (e) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar usuário detalhado", erro: e.message });
        }
    }
  

    static async getTagsDetalhadas(req, res) {
        try {
            const query = `
                SELECT
                    t."codigoTag",
                    t."fisica",
                    u.id AS usuario_id,
                    u.nome AS usuario_nome,
                    c.status AS status_cracha,
                    t.temporario,
                    t.validade AS validade_tag,
                    s.nome AS departamento_vinculado
                FROM
                    tags t
                    LEFT JOIN usuarios u ON t."idUsuario" = u.id
                    LEFT JOIN crachas c ON t."idCracha" = c.id
                    LEFT JOIN funcionarios f ON u.id = f."idUsuario"
                    LEFT JOIN setores s ON f."idSetor" = s.id
            `;
            const data = await prisma.$queryRawUnsafe(query);
            return res.status(200).json({ sucesso: true, data });
        } catch (e) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar tags detalhadas", erro: e.message });
        }
    }

    static async getGestores(req, res) {

        const gestores = await prisma.view_gestores.findMany()

        res.status(200).json({
            sucesso: true,
            data: gestores
        })

    }
}

export default ViewController;
