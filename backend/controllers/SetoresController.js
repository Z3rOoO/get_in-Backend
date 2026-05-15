import { prisma } from "../config/prisma.js"

class SetoresController {

    static async read(req, res) {
        try {
            const setores = await prisma.setores.findMany()

            if (setores.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhum setor encontrado"
                })
            }

            res.status(200).json({
                sucesso: true,
                mensagem: "Setores listados com sucesso",
                data: setores
            })

        }
        catch (e) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar Setores",
                erro: e.message
            })
        }


    }

    static async create(req, res) {
        const { nome, idGestor, acesso } = req.body

        // VERIFICA SE O NOME DO SETOR FOI FORNECIDO
        if (!nome) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "O nome do setor é obrigatório"
            })
        }

        if (idGestor != null) {

            const gestor = await prisma.funcionario.findFirst({
                where: {
                    idUsuario: idGestor,
                    tipo: "ger"
                }
            })


            if (!gestor) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Gestor não encontrado"
                })
            }
        }

        // LISTA OS SETORES EXISTENTES PARA VER SE O NOME DO SETOR JÁ EXISTE
        const setor = await prisma.setores.findUnique({
            where: { nome: nome }
        })


        // SE O SETOR EXISTIR, RETORNA UM ERRO
        if (setor) {
            return res.status(400).json({
                sucesso: false,
                mensagem: "Setor já existe"
            })
        }

        // CRIA O SETOR
        await prisma.setores.create({
            data: {
                nome: nome,
                idGestor: idGestor,
                idDep: 1,
                acesso: acesso
            }
        })

        res.status(200).json({
            sucesso: true,
            mensagem: `Criado o setor ${nome} com sucesso!`
        })

    }
    catch(e) {
        res.status(500).json({
            sucesso: false,
            mensagem: "Erro ao criar um Setor",
            erro: e.message
        })
    }

}

export default SetoresController