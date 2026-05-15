import { prisma } from "../config/prisma.js";

class ViewController {
    static async getRequisicoesConsolidadas(req, res) {
        try {
            const query = `
                SELECT
                    id,
                    "idUsuario",
                    "idDepartamento",
                    status,
                    "dataDaRequisicao",
                    'Acesso Interno' AS tipo_requisicao,
                    NULL AS empresa_visitante,
                    NULL AS validade_visita
                FROM
                    requisicoes_de_acessos
                UNION ALL
                SELECT
                    id,
                    "idUsuario",
                    "idDepartamento",
                    status,
                    "dataDaRequisicao",
                    'Visita Externa' AS tipo_requisicao,
                    motivo AS empresa_visitante,
                    validade AS validade_visita
                FROM
                    requisicoes_de_visitas
            `;
            const data = await prisma.$queryRawUnsafe(query);
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
                    LEFT JOIN departamentos d ON f."idDepartamento" = d.id
            `;
            const data = await prisma.$queryRawUnsafe(query);
            return res.status(200).json({ sucesso: true, data });
        } catch (e) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar logs detalhados", erro: e.message });
        }
    }

    static async getUsuariosDetalhados(req, res) {
        try {
            const query = `
                SELECT
                    u.id AS usuario_id,
                    u.nome AS usuario_nome,
                    u.email,
                    u.cpf,
                    u.celular,
                    f.tipo AS cargo,
                    f."dataDeNascimento",
                    f.imagem AS foto_perfil,
                    d.nome AS departamento_nome,
                    u."dataDeCriacao"
                FROM
                    usuarios u
                    LEFT JOIN funcionarios f ON u.id = f."idUsuario"
                    LEFT JOIN departamentos d ON f."idDepartamento" = d.id
            `;
            const data = await prisma.$queryRawUnsafe(query);
            return res.status(200).json({ sucesso: true, data });
        } catch (e) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar usuários detalhados", erro: e.message });
        }
    }

    static async getTagsDetalhadas(req, res) {
        try {
            const query = `
                SELECT
                    t."codigoTag",
                    u.id AS usuario_id,
                    u.nome AS usuario_nome,
                    c.status AS status_cracha,
                    t.temporario,
                    t.validade AS validade_tag,
                    d.nome AS departamento_vinculado
                FROM
                    tags t
                    JOIN usuarios u ON t."idUsuario" = u.id
                    JOIN crachas c ON t."idCracha" = c.id
                    LEFT JOIN funcionarios f ON u.id = f."idUsuario"
                    LEFT JOIN departamentos d ON f."idDepartamento" = d.id
            `;
            const data = await prisma.$queryRawUnsafe(query);
            return res.status(200).json({ sucesso: true, data });
        } catch (e) {
            return res.status(500).json({ sucesso: false, mensagem: "Erro ao buscar tags detalhadas", erro: e.message });
        }
    }

    static async getGestores(req, res){

        const gestores = await prisma.view_gestores.findMany()

        res.status(200).json({
            sucesso: true,
            data: gestores
        })

    }
}

export default ViewController;
