import { prisma } from "../config/prisma.js"

function hasValue(value) {
    return value !== undefined && value !== null && String(value).trim() !== ""
}

function cleanString(value) {
    return String(value || "").trim()
}

function parseId(value) {
    const id = Number(value)
    return Number.isInteger(id) && id > 0 ? id : null
}

async function findVisitante(id) {
    return prisma.usuario.findUnique({
        where: { id },
        include: { funcionarios: true }
    })
}

async function resolveEmpresaId(nomeEmpresa) {
    if (!hasValue(nomeEmpresa)) {
        return undefined
    }

    const nome = cleanString(nomeEmpresa)
    const empresaExistente = await prisma.empresas.findFirst({
        where: { nome }
    })

    if (empresaExistente) {
        return empresaExistente.id
    }

    const novaEmpresa = await prisma.empresas.create({
        data: { nome }
    })

    return novaEmpresa.id
}

async function resolveSetorId(idSetor, setor) {
    const parsedId = parseId(idSetor)

    if (parsedId) {
        const setorPorId = await prisma.setores.findUnique({
            where: { id: parsedId }
        })

        return setorPorId?.id
    }

    if (!hasValue(setor)) {
        return undefined
    }

    const setorPorNome = await prisma.setores.findFirst({
        where: { nome: cleanString(setor) }
    })

    return setorPorNome?.id
}

function getPrismaErrorMessage(error) {
    if (error?.code === "P2002") {
        return "Ja existe um visitante cadastrado com esses dados."
    }

    if (error?.code === "P2025") {
        return "Visitante nao encontrado."
    }

    return error.message
}

class PortariaController {

    static async readVisitanteLocal(req, res) {

        try {

            const visitantes = await prisma.$queryRaw`
                WITH visitantes_logs AS (
                    SELECT
                        u.id,
                        u.nome,
                        u.cpf,
                        COALESCE(e.nome, ultima_requisicao.empresa) AS empresa,
                        ultima_requisicao.setor,
                        ultima_requisicao."idRequisicao",
                        ultima_requisicao.motivo,
                        ultima_requisicao.descricao,
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
                    LEFT JOIN LATERAL (
                        SELECT
                            rv.id AS "idRequisicao",
                            rv.motivo,
                            rv.descricao,
                            rv.empresa,
                            s.nome AS setor
                        FROM requisicoes_de_visitas rv
                        LEFT JOIN setores s ON s.id = rv."idSetor"
                        WHERE rv."idUsuario" = u.id
                        ORDER BY rv."dataDaRequisicao" DESC NULLS LAST, rv.id DESC
                        LIMIT 1
                    ) ultima_requisicao ON TRUE
                    LEFT JOIN logs l ON l."idUsuario" = u.id
                    LEFT JOIN dispositivos d ON l."idDispositivo" = d.id
                    WHERE f."idUsuario" IS NULL
                        AND d.id = 10
                )
                SELECT
                    id,
                    nome,
                    cpf,
                    empresa,
                    setor,
                    "idRequisicao",
                    motivo,
                    descricao,
                    "idLog",
                    entrada,
                    entrada AS "dataEntrada",
                    "dataSaida",
                    celular,
                    celular AS telefone,
                    email,
                    status
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

    static async updateVisitante(req, res) {
        const id = parseId(req.params.id)

        if (!id) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Id do visitante invalido"
            })
        }

        try {
            const visitante = await findVisitante(id)

            if (!visitante || visitante.funcionarios.length > 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Visitante nao encontrado"
                })
            }

            const {
                nome,
                cpf,
                celular,
                telefone,
                cel,
                email,
                empresa,
                setor,
                idSetor,
                motivo,
                validade,
                descricao
            } = req.body

            const userData = {}
            const reqData = {}
            const empresaNome = hasValue(empresa) ? cleanString(empresa) : ""

            if (hasValue(nome)) userData.nome = cleanString(nome)
            if (hasValue(cpf)) userData.cpf = cleanString(cpf)
            if (hasValue(celular) || hasValue(telefone) || hasValue(cel)) {
                userData.celular = cleanString(celular || telefone || cel)
            }
            if (hasValue(email)) userData.email = cleanString(email).toLowerCase()

            const empresaId = await resolveEmpresaId(empresaNome)
            if (empresaId) userData.idEmpresa = empresaId

            const setorId = await resolveSetorId(idSetor, setor)
            if (setorId) reqData.idSetor = setorId
            if (hasValue(motivo)) reqData.motivo = cleanString(motivo)
            if (hasValue(descricao)) reqData.descricao = cleanString(descricao)
            if (empresaNome) reqData.empresa = empresaNome
            if (hasValue(validade)) {
                const validadeDate = new Date(validade)
                if (!Number.isNaN(validadeDate.getTime())) {
                    reqData.validade = validadeDate
                }
            }

            const resultado = await prisma.$transaction(async (tx) => {
                const usuarioAtualizado = Object.keys(userData).length > 0
                    ? await tx.usuario.update({
                        where: { id },
                        data: userData
                    })
                    : visitante

                let requisicaoAtualizada = null

                if (Object.keys(reqData).length > 0) {
                    const requisicao = await tx.requisicaoDeVisita.findFirst({
                        where: { idUsuario: id },
                        orderBy: [
                            { dataDaRequisicao: "desc" },
                            { id: "desc" }
                        ]
                    })

                    if (requisicao) {
                        requisicaoAtualizada = await tx.requisicaoDeVisita.update({
                            where: { id: requisicao.id },
                            data: reqData
                        })
                    }
                }

                return {
                    usuario: usuarioAtualizado,
                    requisicao: requisicaoAtualizada
                }
            })

            return res.status(200).json({
                sucesso: true,
                mensagem: "Visitante atualizado com sucesso",
                data: resultado
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar visitante",
                erro: getPrismaErrorMessage(e)
            })
        }
    }

    static async deleteVisitante(req, res) {
        const id = parseId(req.params.id)

        if (!id) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Id do visitante invalido"
            })
        }

        try {
            const visitante = await findVisitante(id)

            if (!visitante || visitante.funcionarios.length > 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Visitante nao encontrado"
                })
            }

            const resultado = await prisma.$transaction(async (tx) => {
                await tx.tag.deleteMany({ where: { idUsuario: id } })
                await tx.requisicaoDeVisita.deleteMany({ where: { idUsuario: id } })
                await tx.requisicaoDeAcesso.deleteMany({ where: { idUsuario: id } })
                await tx.log.deleteMany({ where: { idUsuario: id } })

                return tx.usuario.delete({
                    where: { id }
                })
            })

            return res.status(200).json({
                sucesso: true,
                mensagem: "Visitante excluido com sucesso",
                data: resultado
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao excluir visitante",
                erro: getPrismaErrorMessage(e)
            })
        }
    }

    static async readPendencias(req, res) {

        try {
            const requisicoes = await prisma.requisicaoDeVisita.findMany({
                where: { status: "pendente" },
                include: {
                    usuario: {
                        include: { empresas: true }
                    },
                    setores: true
                },
                orderBy: [
                    { dataDaRequisicao: "desc" },
                    { id: "desc" }
                ]
            })

            const visitantesPorIdentidade = new Map()

            for (const requisicao of requisicoes) {
                const usuario = requisicao.usuario || {}
                const identidade = String(
                    requisicao.idUsuario ||
                    usuario.cpf ||
                    usuario.email ||
                    usuario.nome ||
                    requisicao.id
                )
                const setor = requisicao.setores?.nome || null
                const visitanteAtual = visitantesPorIdentidade.get(identidade)

                if (!visitanteAtual) {
                    visitantesPorIdentidade.set(identidade, {
                        id: requisicao.id,
                        ids: [requisicao.id],
                        idUsuario: requisicao.idUsuario,
                        visitante: usuario.nome || null,
                        nome: usuario.nome || null,
                        cpf: usuario.cpf || null,
                        empresa: requisicao.empresa || usuario.empresas?.nome || null,
                        setor,
                        setores: setor ? [setor] : [],
                        motivo: requisicao.motivo || null,
                        descricao: requisicao.descricao || null,
                        observacoes: requisicao.descricao || null,
                        solicitacao: requisicao.status,
                        status: requisicao.status,
                        dataDaRequisicao: requisicao.dataDaRequisicao,
                        validade: requisicao.validade,
                        telefone: usuario.celular || null,
                        celular: usuario.celular || null,
                        email: usuario.email || null
                    })
                    continue
                }

                visitanteAtual.ids.push(requisicao.id)

                if (setor && !visitanteAtual.setores.includes(setor)) {
                    visitanteAtual.setores.push(setor)
                    visitanteAtual.setor = visitanteAtual.setores.join(", ")
                }

                if (!visitanteAtual.motivo && requisicao.motivo) {
                    visitanteAtual.motivo = requisicao.motivo
                }

                if (!visitanteAtual.descricao && requisicao.descricao) {
                    visitanteAtual.descricao = requisicao.descricao
                    visitanteAtual.observacoes = requisicao.descricao
                }
            }

            const visitantes = Array.from(visitantesPorIdentidade.values()).map((visitante) => ({
                ...visitante,
                setor: visitante.setores.join(", ") || visitante.setor
            }))

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
