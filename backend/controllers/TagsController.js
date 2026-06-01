import { prisma } from "../config/prisma.js";
import { ensureUserCracha, getVirtualTagCode } from "../services/crachaService.js";

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function buildTagData(body = {}) {
    const data = {};
    const idUsuario = parseId(body.idUsuario);
    const idCracha = parseId(body.idCracha);

    if (body.idUsuario !== undefined) data.idUsuario = idUsuario;
    if (body.idCracha !== undefined) data.idCracha = idCracha;
    if (body.status !== undefined) data.status = body.status || null;
    if (body.codigoTag !== undefined) data.codigoTag = String(body.codigoTag || "").trim();
    if (body.temporario !== undefined) data.temporario = Boolean(body.temporario);
    if (body.fisica !== undefined) data.fisica = Boolean(body.fisica);
    if (body.validade !== undefined) data.validade = body.validade ? new Date(body.validade) : null;

    return data;
}

class TagsController {
    static async Read(req, res) {
        try {
            const tags = await prisma.tag.findMany({
                where: req.query?.fisica === "true" ? { fisica: true } : undefined,
                include: {
                    usuario: {
                        include: {
                            departamentos: true
                        }
                    },
                    cracha: true
                },
                orderBy: [
                    { fisica: "desc" },
                    { dataDeCriacao: "desc" },
                    { id: "desc" }
                ]
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Tags lidas com sucesso",
                data: tags
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler as tags",
                erro: e.message
            });
        }
    }

    static async ReadLatest(req, res) {
        try {
            const tag = await prisma.tag.findFirst({
                where: {
                    fisica: true,
                    idUsuario: null,
                    idCracha: null,
                    status: "disponivel"
                },
                include: {
                    usuario: true,
                    cracha: true
                },
                orderBy: [
                    { dataDeCriacao: "desc" },
                    { id: "desc" }
                ]
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Ultima tag lida com sucesso",
                data: tag
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler a ultima tag",
                erro: e.message
            });
        }
    }

    static async ReadAvailable(req, res) {
        try {
            const tags = await prisma.tag.findMany({
                where: {
                    idUsuario: null,
                    idCracha: null,
                    status: "disponivel"
                },
                include: {
                    usuario: true,
                    cracha: true
                },
                orderBy: [
                    { id: "asc" }
                ]
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Tags disponiveis listadas com sucesso",
                data: tags
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar tags disponiveis",
                erro: e.message
            });
        }
    }

    static async ReadByCode(req, res) {
        try {
            const { codigoTag } = req.params;
            const tag = await prisma.tag.findUnique({
                where: { codigoTag },
                include: {
                    usuario: true,
                    cracha: true
                }
            });

            if (!tag) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Tag nao encontrada"
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Tag lida com sucesso",
                data: tag
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler a tag",
                erro: e.message
            });
        }
    }

    static async Create(req, res) {
        try {
            const data = buildTagData(req.body);

            if (!data.codigoTag) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "codigoTag e obrigatorio"
                });
            }

            const result = await prisma.tag.create({ data });

            return res.status(201).json({
                sucesso: true,
                mensagem: "Tag criada com sucesso",
                data: result
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar a tag",
                erro: e.message
            });
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params;
            const data = buildTagData(req.body);

            const result = await prisma.tag.update({
                where: {
                    id: Number(id)
                },
                data,
                include: {
                    usuario: true,
                    cracha: true
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Tag atualizada com sucesso",
                data: result
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar a tag",
                erro: e.message
            });
        }
    }

    static async AssignByCode(req, res) {
        try {
            const { codigoTag } = req.params;
            const idUsuario = parseId(req.body?.idUsuario);

            if (!idUsuario) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "idUsuario e obrigatorio"
                });
            }

            const result = await prisma.$transaction(async (tx) => {
                const tag = await tx.tag.findUnique({
                    where: { codigoTag }
                });

                if (!tag) {
                    throw new Error("Tag nao encontrada");
                }

                const tagEstaEmUsoPorOutroUsuario = tag.idUsuario && tag.idUsuario !== idUsuario;
                const tagEstaEmOutroCracha = tag.idCracha && tag.idUsuario !== idUsuario;

                if (tagEstaEmUsoPorOutroUsuario || tagEstaEmOutroCracha) {
                    throw new Error("Tag ja esta vinculada a outro usuario");
                }

                const cracha = await ensureUserCracha(idUsuario, tx);

                if (!tag.fisica) {
                    await tx.tag.updateMany({
                        where: {
                            idCracha: cracha.id,
                            fisica: false,
                            codigoTag: { not: codigoTag }
                        },
                        data: {
                            idUsuario: null,
                            idCracha: null,
                            status: "disponivel",
                            dataDeDevolucao: new Date()
                        }
                    });
                }

                return tx.tag.update({
                    where: { codigoTag },
                    data: {
                        idUsuario,
                        idCracha: cracha.id,
                        status: "emUso",
                        dataDeDevolucao: null
                    },
                    include: {
                        usuario: true,
                        cracha: true
                    }
                });
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Tag vinculada com sucesso",
                data: result
            });
        } catch (e) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Erro ao vincular a tag",
                erro: e.message
            });
        }
    }

    static async AssignVirtual(req, res) {
        try {
            const idUsuario = parseId(req.body?.idUsuario);

            if (!idUsuario) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "idUsuario e obrigatorio"
                });
            }

            const cracha = await ensureUserCracha(idUsuario);
            const codigoTag = getVirtualTagCode(idUsuario);
            await prisma.tag.updateMany({
                where: {
                    idCracha: cracha.id,
                    fisica: false,
                    codigoTag: { not: codigoTag }
                },
                data: {
                    idUsuario: null,
                    idCracha: null,
                    status: "disponivel",
                    dataDeDevolucao: new Date()
                }
            });

            const tag = await prisma.tag.findUnique({
                where: { codigoTag },
                include: {
                    usuario: true,
                    cracha: true
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Tag virtual vinculada com sucesso",
                data: tag,
                cracha
            });
        } catch (e) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Erro ao vincular tag virtual",
                erro: e.message
            });
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params;

            await prisma.tag.delete({
                where: {
                    id: Number(id)
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Tag deletada com sucesso"
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar a tag",
                erro: e.message
            });
        }
    }

    static async ReadById(req, res) {
        try {
            const { id } = req.params;

            const tag = await prisma.tag.findUnique({
                where: {
                    id: Number(id)
                },
                include: {
                    usuario: true,
                    cracha: true
                }
            });

            if (!tag) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Tag nao encontrada"
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Tag lida com sucesso",
                data: tag
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler a tag",
                erro: e.message
            });
        }
    }
}

export default TagsController;
