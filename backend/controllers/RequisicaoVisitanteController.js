import { prisma } from "../config/prisma.js";

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeSetorIds(idSetor) {
    const ids = Array.isArray(idSetor) ? idSetor : [idSetor];

    return Array.from(
        new Set(ids.map(parseId).filter(Boolean))
    );
}

function normalizeStatus(status) {
    const value = String(status || "").trim().toLowerCase();
    const validStatuses = ["pendente", "aprovado", "recusado"];

    return validStatuses.includes(value) ? value : null;
}

class RequisicaoVisitanteController {
    static async Create(req, res) {
        try {
            const { idUsuario, idSetor, motivo, validade, descricao, empresa } = req.body;
            const usuarioId = parseId(idUsuario);
            const setorIds = normalizeSetorIds(idSetor);

            if (!usuarioId || setorIds.length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "idUsuario e ao menos um idSetor sao obrigatorios"
                });
            }

            const setoresEncontrados = await prisma.setores.findMany({
                where: {
                    id: { in: setorIds }
                },
                select: { id: true }
            });

            const setoresValidos = new Set(setoresEncontrados.map((setor) => setor.id));
            const setorInvalido = setorIds.find((id) => !setoresValidos.has(id));

            if (setorInvalido) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: `Setor ${setorInvalido} nao encontrado`
                });
            }

            const requisicoes = await prisma.$transaction(
                setorIds.map((setorId) =>
                    prisma.requisicaoDeVisita.create({
                        data: {
                            idUsuario: usuarioId,
                            idSetor: setorId,
                            motivo: motivo || null,
                            validade: validade ? new Date(validade) : null,
                            descricao: descricao || null,
                            empresa: empresa || null,
                            status: "pendente"
                        },
                        include: {
                            usuario: true,
                            setores: true
                        }
                    })
                )
            );

            return res.status(201).json({
                sucesso: true,
                mensagem: "Requisicao de visitante criada com sucesso",
                data: requisicoes
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar requisicao de visitante",
                erro: e.message
            });
        }
    }

    static async Read(req, res) {
        try {
            const resultado = await prisma.requisicaoDeVisita.findMany({
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

            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisicoes de visitantes listadas com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar requisicoes de visitantes",
                erro: e.message
            });
        }
    }

    static async ReadById(req, res) {
        try {
            const { id } = req.params;

            const resultado = await prisma.requisicaoDeVisita.findUnique({
                where: { id: Number(id) },
                include: {
                    usuario: {
                        include: { empresas: true }
                    },
                    setores: true
                }
            });

            if (!resultado) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Requisicao nao encontrada"
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisicao encontrada com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao buscar requisicao",
                erro: e.message
            });
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params;
            const { status, motivo, validade, descricao, empresa } = req.body;
            const data = {};
            const normalizedStatus = normalizeStatus(status);

            if (normalizedStatus) data.status = normalizedStatus;
            if (motivo !== undefined) data.motivo = motivo || null;
            if (validade !== undefined) data.validade = validade ? new Date(validade) : null;
            if (descricao !== undefined) data.descricao = descricao || null;
            if (empresa !== undefined) data.empresa = empresa || null;

            const resultado = await prisma.requisicaoDeVisita.update({
                where: { id: Number(id) },
                data,
                include: {
                    usuario: true,
                    setores: true
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisicao atualizada com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar requisicao",
                erro: e.message
            });
        }
    }

    static async BulkUpdate(req, res) {
        try {
            const updates = Array.isArray(req.body?.updates) ? req.body.updates : [];

            if (updates.length === 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Nenhuma atualizacao enviada"
                });
            }

            const result = await prisma.$transaction(
                updates.map((item) => {
                    const id = parseId(item.id);
                    const status = normalizeStatus(item.status);

                    if (!id || !status) {
                        throw new Error("Atualizacao invalida. Informe id e status validos.");
                    }

                    return prisma.requisicaoDeVisita.update({
                        where: { id },
                        data: { status },
                        include: {
                            usuario: true,
                            setores: true
                        }
                    });
                })
            );

            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisicoes atualizadas com sucesso",
                data: result
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar requisicoes",
                erro: e.message
            });
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params;

            const resultado = await prisma.requisicaoDeVisita.delete({
                where: { id: Number(id) }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisicao deletada com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar requisicao",
                erro: e.message
            });
        }
    }
}

export default RequisicaoVisitanteController;
