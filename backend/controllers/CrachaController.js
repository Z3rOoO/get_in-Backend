import { getConnection, Create, Read, Update, Delete } from '../config/database.js';
import { prisma } from '../config/prisma.js';

class CrachaController {

    // /cracha
    static async create(req, res) {
        try {
            const status = "disponivel";


            const result = await prisma.cracha.create({
                data: {
                    status: status
                }
            })

            if (!result) {
                return res.status(400).json({ erro: 'Erro ao criar crachá' });
            }

            res.status(201).json({
                sucesso: true,
                message: 'Crachá criado com sucesso'
            });


        } catch (e) {
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao criar crachá',
                erro: e.message
            });
        }
    }

    static async read(req, res) {
        try {
            const crachas = await prisma.cracha.findMany();

            res.status(200).json({
                sucesso: true,
                mensagem: "Crachás listados com sucesso",
                data: crachas
            })
        } catch {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar crachás",
                erro: e.message
            })
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const result = await prisma.cracha.update({
                where: {
                    id: Number(id)
                },
                data: {
                    status: status
                }
            })

            return res.status(200).json({
                sucesso: true,
                mensagem: "Crachá atualizado com sucesso",
                dados: result
            })
        } catch {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar o crachá",
                erro: e.message
            })
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            

            const result = await prisma.cracha.delete({
                where: {
                    id: Number(id)
                }
            })
            return res.status(200).json({
                sucesso: true,
                mensagem: "Crachá deletado com sucesso",
                dados: result
            })
        } catch (e){
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar o crachá",
                erro: e.message
            })
        }
    }

    static async readById(req, res) {
        try {
            const { id } = req.params;

            const result = await prisma.cracha.findMany({
                where: {
                    id: Number(id)
                }
            })
            return res.status(200).json({
                sucesso: true,
                mensagem: "Crachá encontrado com sucesso",
                dado: result
            })
        } catch {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao encontrar o crachá",
                erro: e.message
            })
        }
    }

    static async readByStatus(req, res) {
        try {
            let { status } = req.params;

            switch (status) {
                case 'd': status = 'disponivel'
                 break;
                case 'p': status = 'perdido'
                 break;
                case 'e': status = 'emUso'
                 break;
            }

            console.log(status)

            const result = await prisma.cracha.findMany({
                where: {
                    status: status
                }
            })

            return res.status(200).json({
                sucesso: true,
                mensagem: "Crachás encontrados com sucesso",
                dados: result
            });
        } catch {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao encontrar os crachás",
                erro: e.message
            })
        }
    }
}

export default CrachaController;