import { Create, Read, Update, Delete } from "../config/database";

class TagsController {
    static async Read(req, res) {
        try {
            const tags = await prisma.tag.findMany() //le as tags da tabela "tags"
            return res.status(200).json({
                sucesso: true,
                mensagem: "Tags lidas com sucesso",
                dados: tags
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler as tags",
                erro: e.message
            })
        }
    }

    static async Create(req, res) {
        try {
            const { idUsuario, idCracha, codigoTag, temporario, validade } = req.body

            const newTag = {
                idUsuario,
                idCracha,
                codigoTag,
                temporario,
                validade
            }

            const result = await prisma.tag.create({
                data: newTag
            }) // cria uma nova tag na tabela "tags"
            return res.status(200).json({
                sucesso: true,
                mensagem: "Tag criado com sucesso",
                dados: { id: result.insertId, ...newTag } // retorna o ID da nova tag junto com os dados fornecidos
            })

        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar a tag",
                erro: e.message
            })
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params
            const { idUsuario, idCracha, codigoTag, temporario, validade } = req.body

            const updatedTag = {
                idUsuario,
                idCracha,
                codigoTag,
                temporario,
                validade
            }

            const result = await prisma.tag.update({
                where: {
                    id: Number(id)
                },
                data: updatedTag
            }) // atualiza a tag com o id fornecido usando os dados fornecidos
            return res.status(200).json({
                sucesso: true,
                mensagem: "Tag atualizado com sucesso",
                dados: { id, ...updatedTag } // retorna o ID da tag atualizada junto com os dados fornecidos
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar a tag",
                erro: e.message
            })
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params //pega o id da tag a ser deletada 

            await prisma.tag.delete({
                where: {
                    id: Number(id)
                }
            }) //deleta a tag com o id fornecido
            return res.status(200).json({
                sucesso: true,
                mensagem: "Tag deletado com sucesso",
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar a tag",
                erro: e.message
            })
        }
    }

    static async ReadById(req, res) {
        try {
            const { id } = req.params //pega o id da tag a ser lida

            const tag = await prisma.tag.findUnique({
                where: {
                    id: Number(id)
                }
            }) //le a tag com o id fornecido
            return res.status(200).json({
                sucesso: true,
                mensagem: "Tag lida com sucesso",
                dados: tag 
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler a tag",
                erro: e.message
            })
        }
    }
}

export default TagsController