import { prisma } from "../config/prisma.js";

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function buildTagData(body = {}) {
    const data = {};
    const idUsuario = parseId(body.idUsuario);

    if (body.idUsuario !== undefined) data.idUsuario = idUsuario;
    if (body.status !== undefined) data.status = body.status || null;
    if (body.codigoTag !== undefined) data.codigoTag = String(body.codigoTag || "").trim();
    if (body.temporario !== undefined) data.temporario = Boolean(body.temporario);
    if (body.validade !== undefined) data.validade = body.validade ? new Date(body.validade) : null;

    return data;
}

class TagsController {
    static async Read(req, res) {
        try {
            const tags = await prisma.tag.findMany({
                include: {
                    usuario: {
                        include: {
                            departamentos: true
                        }
                    }
                },
                orderBy: [
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
                where: { idUsuario: null },
                include: {
                    usuario: true
                },
                orderBy: [
                    { dataDeCriacao: "desc" },
                    { id: "desc" }
                ]
            }) || await prisma.tag.findFirst({
                include: {
                    usuario: true
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

    static async ReadByCode(req, res) {
        try {
            const { codigoTag } = req.params;
            const tag = await prisma.tag.findUnique({
                where: { codigoTag }
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
                data
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

            const result = await prisma.tag.update({
                where: { codigoTag },
                data: { idUsuario }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Tag vinculada com sucesso",
                data: result
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao vincular a tag",
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
