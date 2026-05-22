import { prisma } from "../config/prisma.js";
import {
    STATUS_REQUISICAO,
    expireOldPendingVisitRequests,
    getTodayRange,
    normalizeMotivoVisita
} from "../config/requisicaoVisitanteRules.js";

function hasValue(value) {
    return value !== undefined && value !== null && String(value).trim() !== "";
}

function cleanString(value) {
    return String(value || "").trim();
}

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeDescricaoLabel(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function getDescricaoValue(descricao, labels) {
    if (!hasValue(descricao)) return "";

    const normalizedLabels = new Set(labels.map(normalizeDescricaoLabel));
    const parts = String(descricao)
        .split("|")
        .map((part) => part.trim())
        .filter(Boolean);

    for (const part of parts) {
        const separatorIndex = part.indexOf(":");
        if (separatorIndex === -1) continue;

        const label = part.slice(0, separatorIndex);
        const value = part.slice(separatorIndex + 1).trim();

        if (normalizedLabels.has(normalizeDescricaoLabel(label))) {
            return value;
        }
    }

    return "";
}

function getObservacaoFromDescricao(descricao) {
    const observacao = getDescricaoValue(descricao, [
        "Observacoes",
        "Observacao",
        "Observações",
        "Observação",
        "Observacao da Portaria",
        "Observação da Portaria"
    ]);
    const normalized = normalizeDescricaoLabel(observacao);

    if (!observacao || normalized === "nenhuma" || normalized.includes("nenhuma observacao")) {
        return null;
    }

    return observacao;
}

function upsertDescricaoField(descricao, label, value, aliases = []) {
    const cleanValue = hasValue(value) ? cleanString(value) : "Nao informado";
    const labels = new Set([label, ...aliases].map(normalizeDescricaoLabel));
    const parts = String(descricao || "")
        .split("|")
        .map((part) => part.trim())
        .filter(Boolean);
    let replaced = false;

    const nextParts = parts.map((part) => {
        const [rawLabel] = part.split(":");

        if (labels.has(normalizeDescricaoLabel(rawLabel))) {
            replaced = true;
            return `${label}: ${cleanValue}`;
        }

        return part;
    });

    if (!replaced) {
        nextParts.push(`${label}: ${cleanValue}`);
    }

    return nextParts.join(" | ");
}

async function findVisitante(id) {
    return prisma.usuario.findUnique({
        where: { id },
        include: { funcionarios: true }
    });
}

async function resolveEmpresaId(nomeEmpresa) {
    if (!hasValue(nomeEmpresa)) {
        return undefined;
    }

    const nome = cleanString(nomeEmpresa);
    const empresaExistente = await prisma.empresas.findFirst({
        where: {
            nome: {
                equals: nome,
                mode: "insensitive"
            }
        }
    });

    if (empresaExistente) {
        return empresaExistente.id;
    }

    const novaEmpresa = await prisma.empresas.create({
        data: { nome }
    });

    return novaEmpresa.id;
}

async function resolveSetorId(idSetor, setor) {
    const parsedId = parseId(idSetor);

    if (parsedId) {
        const setorPorId = await prisma.setores.findUnique({
            where: { id: parsedId }
        });

        return setorPorId?.id;
    }

    if (!hasValue(setor)) {
        return undefined;
    }

    const setorPorNome = await prisma.setores.findFirst({
        where: {
            nome: {
                equals: cleanString(setor),
                mode: "insensitive"
            }
        }
    });

    return setorPorNome?.id;
}

function getPrismaErrorMessage(error) {
    if (error?.code === "P2002") {
        return "Ja existe um visitante cadastrado com esses dados.";
    }

    if (error?.code === "P2025") {
        return "Visitante nao encontrado.";
    }

    return error.message;
}

class PortariaController {
    static async readVisitanteLocal(req, res) {
        try {
            const { start, end } = getTodayRange();
            await expireOldPendingVisitRequests();

            const visitantes = await prisma.$queryRaw`
                WITH requisicoes_visitantes AS (
                    SELECT
                        rv."idUsuario",
                        MAX(rv.id) AS "idRequisicao",
                        MAX(rv.motivo) AS motivo,
                        STRING_AGG(DISTINCT rv.descricao, ' | ') FILTER (WHERE rv.descricao IS NOT NULL) AS descricao,
                        COALESCE(MAX(rv.empresa), MAX(e.nome)) AS empresa,
                        STRING_AGG(DISTINCT s.nome, ', ' ORDER BY s.nome) AS setor,
                        MAX(rv."dataDaRequisicao") AS "dataDaRequisicao",
                        CASE
                            WHEN BOOL_OR(rv.status = 'aprovado') THEN 'aprovado'
                            ELSE 'recusado'
                        END AS "statusRequisicao"
                    FROM requisicoes_de_visitas rv
                    LEFT JOIN setores s ON s.id = rv."idSetor"
                    LEFT JOIN usuarios u ON u.id = rv."idUsuario"
                    LEFT JOIN empresas e ON e.id = u."idEmpresa"
                    WHERE rv.status = 'aprovado'
                    GROUP BY rv."idUsuario"
                ),
                ultimos_logs AS (
                    SELECT
                        l.*,
                        ROW_NUMBER() OVER (
                            PARTITION BY l."idUsuario"
                            ORDER BY
                                COALESCE(l."dataDeSaida", l."dataDeEntrada") DESC NULLS LAST,
                                l.id DESC
                        ) AS ordem
                    FROM logs l
                )
                SELECT
                    u.id,
                    u.id AS "idUsuario",
                    u.nome,
                    u.cpf,
                    COALESCE(rv.empresa, e.nome) AS empresa,
                    rv.setor,
                    rv."idRequisicao",
                    rv.motivo,
                    rv.descricao,
                    ul.id AS "idLog",
                    CASE
                        WHEN ul."dataDeEntrada" IS NOT NULL
                            AND (ul."dataDeSaida" IS NULL OR (ul."dataDeSaida" >= ${start} AND ul."dataDeSaida" < ${end}))
                            THEN ul."dataDeEntrada"
                        ELSE rv."dataDaRequisicao"
                    END AS entrada,
                    CASE
                        WHEN ul."dataDeEntrada" IS NOT NULL
                            AND (ul."dataDeSaida" IS NULL OR (ul."dataDeSaida" >= ${start} AND ul."dataDeSaida" < ${end}))
                            THEN ul."dataDeEntrada"
                        ELSE rv."dataDaRequisicao"
                    END AS "dataEntrada",
                    CASE
                        WHEN ul."dataDeSaida" >= ${start} AND ul."dataDeSaida" < ${end} THEN ul."dataDeSaida"
                        ELSE NULL
                    END AS "dataSaida",
                    u.celular,
                    u.celular AS telefone,
                    u.email,
                    rv."dataDaRequisicao",
                    CASE
                        WHEN ul."dataDeEntrada" IS NOT NULL AND ul."dataDeSaida" IS NULL THEN 'dentro'
                        WHEN ul."dataDeSaida" >= ${start} AND ul."dataDeSaida" < ${end} THEN 'saida'
                        WHEN rv."statusRequisicao" = 'aprovado' THEN 'dentro'
                        ELSE rv."statusRequisicao"
                    END AS status,
                    CASE
                        WHEN ul."dataDeEntrada" IS NOT NULL AND ul."dataDeSaida" IS NULL THEN true
                        WHEN rv."statusRequisicao" = 'aprovado'
                            AND (ul."dataDeSaida" IS NULL OR ul."dataDeSaida" < ${start} OR ul."dataDeSaida" >= ${end})
                            THEN true
                        ELSE false
                    END AS "podeCheckout"
                FROM requisicoes_visitantes rv
                JOIN usuarios u ON u.id = rv."idUsuario"
                LEFT JOIN funcionarios f ON u.id = f."idUsuario"
                LEFT JOIN empresas e ON u."idEmpresa" = e.id
                LEFT JOIN ultimos_logs ul ON ul."idUsuario" = u.id AND ul.ordem = 1
                WHERE f."idUsuario" IS NULL
                    AND (
                        (ul."dataDeEntrada" IS NOT NULL AND ul."dataDeSaida" IS NULL)
                        OR (ul."dataDeSaida" >= ${start} AND ul."dataDeSaida" < ${end})
                        OR (rv."dataDaRequisicao" >= ${start} AND rv."dataDaRequisicao" < ${end})
                    )
                ORDER BY
                    COALESCE(
                        CASE WHEN ul."dataDeSaida" >= ${start} AND ul."dataDeSaida" < ${end} THEN ul."dataDeSaida" END,
                        CASE WHEN ul."dataDeSaida" IS NULL THEN ul."dataDeEntrada" END,
                        rv."dataDaRequisicao"
                    ) DESC NULLS LAST,
                    rv."idRequisicao" DESC
            `;

            return res.status(200).json({
                sucesso: true,
                dados: visitantes,
                data: visitantes
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno no servidor",
                erro: e.message
            });
        }
    }

    static async readPendencias(req, res) {
        try {
            await expireOldPendingVisitRequests();

            const requisicoes = await prisma.requisicaoDeVisita.findMany({
                where: {
                    status: STATUS_REQUISICAO.PENDENTE
                },
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
            });

            const visitantesPorIdentidade = new Map();

            for (const requisicao of requisicoes) {
                const usuario = requisicao.usuario || {};
                const identidade = String(
                    requisicao.idUsuario ||
                    usuario.cpf ||
                    usuario.email ||
                    usuario.nome ||
                    requisicao.id
                );
                const setor = requisicao.setores?.nome || null;
                const observacao = getObservacaoFromDescricao(requisicao.descricao);
                const visitanteAtual = visitantesPorIdentidade.get(identidade);

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
                        motivo: normalizeMotivoVisita(requisicao.motivo),
                        descricao: requisicao.descricao || null,
                        observacoes: observacao,
                        solicitacao: requisicao.status,
                        status: requisicao.status,
                        dataDaRequisicao: requisicao.dataDaRequisicao,
                        validade: requisicao.validade,
                        telefone: usuario.celular || null,
                        celular: usuario.celular || null,
                        email: usuario.email || null
                    });
                    continue;
                }

                visitanteAtual.ids.push(requisicao.id);

                if (setor && !visitanteAtual.setores.includes(setor)) {
                    visitanteAtual.setores.push(setor);
                    visitanteAtual.setor = visitanteAtual.setores.join(", ");
                }

                if (!visitanteAtual.motivo && requisicao.motivo) {
                    visitanteAtual.motivo = normalizeMotivoVisita(requisicao.motivo);
                }

                if (!visitanteAtual.descricao && requisicao.descricao) {
                    visitanteAtual.descricao = requisicao.descricao;
                }

                if (!visitanteAtual.observacoes && observacao) {
                    visitanteAtual.observacoes = observacao;
                }
            }

            const visitantes = Array.from(visitantesPorIdentidade.values()).map((visitante) => ({
                ...visitante,
                setor: visitante.setores.join(", ") || visitante.setor
            }));

            return res.status(200).json({
                sucesso: true,
                dados: visitantes,
                data: visitantes
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno no servidor",
                erro: e.message
            });
        }
    }

    static async readHistorico(req, res) {
        try {
            await expireOldPendingVisitRequests();

            const registros = await prisma.$queryRaw`
                WITH requisicoes_visitantes AS (
                    SELECT
                        rv."idUsuario",
                        MAX(rv.id) AS "idRequisicao",
                        MAX(rv.motivo) AS motivo,
                        STRING_AGG(DISTINCT rv.descricao, ' | ') FILTER (WHERE rv.descricao IS NOT NULL) AS descricao,
                        COALESCE(MAX(rv.empresa), MAX(e.nome)) AS empresa,
                        STRING_AGG(DISTINCT s.nome, ', ' ORDER BY s.nome) AS "setoresPermitidos",
                        MAX(rv."dataDaRequisicao") AS "dataDaRequisicao",
                        CASE
                            WHEN BOOL_OR(rv.status = 'pendente') THEN 'pendente'
                            WHEN BOOL_OR(rv.status = 'aprovado') THEN 'aprovado'
                            WHEN BOOL_OR(rv.status = 'recusado') THEN 'recusado'
                            WHEN BOOL_OR(rv.status = 'expirado') THEN 'expirado'
                            ELSE 'pendente'
                        END AS "statusRequisicao"
                    FROM requisicoes_de_visitas rv
                    LEFT JOIN setores s ON s.id = rv."idSetor"
                    LEFT JOIN usuarios u ON u.id = rv."idUsuario"
                    LEFT JOIN empresas e ON e.id = u."idEmpresa"
                    GROUP BY rv."idUsuario"
                ),
                ultimos_logs AS (
                    SELECT
                        l.*,
                        ROW_NUMBER() OVER (
                            PARTITION BY l."idUsuario"
                            ORDER BY
                                COALESCE(l."dataDeSaida", l."dataDeEntrada") DESC NULLS LAST,
                                l.id DESC
                        ) AS ordem
                    FROM logs l
                )
                SELECT
                    u.id,
                    u.id AS "idUsuario",
                    u.nome,
                    u.cpf,
                    COALESCE(rv.empresa, e.nome) AS empresa,
                    rv."setoresPermitidos" AS setor,
                    rv."setoresPermitidos",
                    rv."idRequisicao",
                    rv.motivo,
                    rv.descricao,
                    ul.id AS "idLog",
                    ul."dataDeEntrada" AS entrada,
                    ul."dataDeEntrada" AS "dataEntrada",
                    ul."dataDeSaida" AS "dataSaida",
                    u.celular,
                    u.celular AS telefone,
                    u.email,
                    rv."dataDaRequisicao",
                    CASE
                        WHEN ul."dataDeEntrada" IS NOT NULL AND ul."dataDeSaida" IS NULL THEN 'dentro'
                        WHEN ul."dataDeSaida" IS NOT NULL THEN 'saida'
                        WHEN rv."statusRequisicao" = 'aprovado' THEN 'dentro'
                        ELSE rv."statusRequisicao"
                    END AS status
                FROM requisicoes_visitantes rv
                JOIN usuarios u ON u.id = rv."idUsuario"
                LEFT JOIN empresas e ON u."idEmpresa" = e.id
                LEFT JOIN ultimos_logs ul ON ul."idUsuario" = u.id AND ul.ordem = 1
                WHERE NOT EXISTS (
                    SELECT 1 FROM funcionarios f WHERE f."idUsuario" = u.id
                )
                ORDER BY
                    COALESCE(ul."dataDeSaida", ul."dataDeEntrada", rv."dataDaRequisicao") DESC NULLS LAST,
                    rv."idRequisicao" DESC
            `;

            return res.status(200).json({
                sucesso: true,
                dados: registros,
                data: registros
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno no servidor",
                erro: e.message
            });
        }
    }

    static async checkout(req, res) {
        try {
            const idLog = parseId(req.body?.idLog);
            const idUsuario = parseId(req.body?.idUsuario || req.body?.id);
            const dataSaida = req.body?.dataSaida ? new Date(req.body.dataSaida) : new Date();

            let log = null;

            if (idLog) {
                log = await prisma.log.findUnique({
                    where: { id: idLog }
                });
            }

            if (!log && idUsuario) {
                log = await prisma.log.findFirst({
                    where: {
                        idUsuario,
                        dataDeEntrada: { not: null },
                        dataDeSaida: null
                    },
                    orderBy: [
                        { dataDeEntrada: "desc" },
                        { id: "desc" }
                    ]
                });
            }

            if (!log) {
                const requisicao = idUsuario
                    ? await prisma.requisicaoDeVisita.findFirst({
                        where: {
                            idUsuario,
                            status: STATUS_REQUISICAO.APROVADO
                        },
                        orderBy: [
                            { dataDaRequisicao: "desc" },
                            { id: "desc" }
                        ]
                    })
                    : null;

                const dispositivo = requisicao
                    ? await prisma.dispositivo.findFirst({
                        where: { idSetor: requisicao.idSetor },
                        orderBy: { id: "asc" }
                    })
                    : await prisma.dispositivo.findFirst({ orderBy: { id: "asc" } });

                if (!requisicao || !dispositivo) {
                    return res.status(404).json({
                        sucesso: false,
                        mensagem: "Nenhuma entrada ativa encontrada para check-out"
                    });
                }

                const resultado = await prisma.log.create({
                    data: {
                        idDispositivo: dispositivo.id,
                        idUsuario,
                        dataDeEntrada: requisicao.dataDaRequisicao || dataSaida,
                        dataDeSaida: dataSaida
                    }
                });

                return res.status(200).json({
                    sucesso: true,
                    mensagem: "Check-out realizado com sucesso",
                    data: resultado
                });
            }

            const resultado = await prisma.log.update({
                where: { id: log.id },
                data: { dataDeSaida: dataSaida }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Check-out realizado com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao realizar check-out",
                erro: e.message
            });
        }
    }

    static async updateVisitante(req, res) {
        const id = parseId(req.params.id);

        if (!id) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Id do visitante invalido"
            });
        }

        try {
            const visitante = await findVisitante(id);

            if (!visitante || visitante.funcionarios.length > 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Visitante nao encontrado"
                });
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
                setorResponsavel,
                areaResponsavel,
                setorPermitido,
                idSetor,
                motivo,
                validade,
                descricao
            } = req.body;

            const userData = {};
            const reqData = {};
            const empresaNome = hasValue(empresa) ? cleanString(empresa) : "";
            const responsavel = setorResponsavel || areaResponsavel || setor;

            if (hasValue(nome)) userData.nome = cleanString(nome);
            if (hasValue(cpf)) userData.cpf = cleanString(cpf);
            if (hasValue(celular) || hasValue(telefone) || hasValue(cel)) {
                userData.celular = cleanString(celular || telefone || cel);
            }
            if (hasValue(email)) userData.email = cleanString(email).toLowerCase();

            const empresaId = await resolveEmpresaId(empresaNome);
            if (empresaId) userData.idEmpresa = empresaId;

            const setorId = await resolveSetorId(idSetor, setorPermitido);
            if (setorId) reqData.idSetor = setorId;
            if (hasValue(motivo)) reqData.motivo = normalizeMotivoVisita(motivo);
            if (hasValue(descricao)) reqData.descricao = cleanString(descricao);
            if (empresaNome) reqData.empresa = empresaNome;
            if (hasValue(validade)) {
                const validadeDate = new Date(validade);
                if (!Number.isNaN(validadeDate.getTime())) {
                    reqData.validade = validadeDate;
                }
            }

            const resultado = await prisma.$transaction(async (tx) => {
                const usuarioAtualizado = Object.keys(userData).length > 0
                    ? await tx.usuario.update({
                        where: { id },
                        data: userData
                    })
                    : visitante;

                let requisicaoAtualizada = null;

                if (Object.keys(reqData).length > 0 || hasValue(responsavel)) {
                    const requisicao = await tx.requisicaoDeVisita.findFirst({
                        where: { idUsuario: id },
                        orderBy: [
                            { dataDaRequisicao: "desc" },
                            { id: "desc" }
                        ]
                    });

                    if (requisicao) {
                        if (hasValue(responsavel)) {
                            reqData.descricao = upsertDescricaoField(
                                reqData.descricao || requisicao.descricao,
                                "Setor responsavel",
                                responsavel,
                                ["Area responsavel", "Setor"]
                            );
                        }

                        requisicaoAtualizada = await tx.requisicaoDeVisita.update({
                            where: { id: requisicao.id },
                            data: reqData
                        });
                    }
                }

                return {
                    usuario: usuarioAtualizado,
                    requisicao: requisicaoAtualizada
                };
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Visitante atualizado com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar visitante",
                erro: getPrismaErrorMessage(e)
            });
        }
    }

    static async deleteVisitante(req, res) {
        const id = parseId(req.params.id);

        if (!id) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Id do visitante invalido"
            });
        }

        try {
            const visitante = await findVisitante(id);

            if (!visitante || visitante.funcionarios.length > 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Visitante nao encontrado"
                });
            }

            const resultado = await prisma.$transaction(async (tx) => {
                await tx.tag.deleteMany({ where: { idUsuario: id } });
                await tx.requisicaoDeVisita.deleteMany({ where: { idUsuario: id } });
                await tx.requisicaoDeAcesso.deleteMany({ where: { idUsuario: id } });
                await tx.log.deleteMany({ where: { idUsuario: id } });

                return tx.usuario.delete({
                    where: { id }
                });
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Visitante excluido com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao excluir visitante",
                erro: getPrismaErrorMessage(e)
            });
        }
    }
}

export default PortariaController;
