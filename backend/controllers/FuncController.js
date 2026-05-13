// import { getConnection, Create, Read, Update, Delete, hashPassword } from '../config/database.js';
import { prisma } from '../config/prisma.js';

class FuncController {
    static async Read(req, res) {
        try {
            const func = await prisma.funcionario.findMany() // le os funcionaruos da tabela "funcionarios"
            return res.status(200).json({
                sucesso: true,
                mensagem: "Funcionarios lidos com sucesso",
                data: func
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler os funcionarios",
                erro: e.message
            })
        }
    }

    static async ReadId(req, res) {
        try {
            const { id } = req.params;
            const func = await prisma.funcionario.findUnique({
                where: {
                    id: Number(id)
                }
            })//le o resultado do banco e filtra por id por meio da função read do database.js
            return res.status(200).json({
                sucesso: true,
                mensagem: "Funcionario lido com sucesso",
                data: func
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler o funcionario",
                erro: e.message
            })
        }
    }

    static async ReadName(req, res) {
        try {
            const { nome } = req.params;
            const func = await prisma.funcionario.findMany({
                where: {
                    nome: {
                        contains: nome
                    }
                }
            })//le o resultado do banco e filtra por nome
            return res.status(200).json({
                sucesso: true,
                mensagem: "Funcionario lido com sucesso",
                data: func
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler o funcionario",
                erro: e.message
            })
        }
    }

    static async ReadCpf(req, res) {
        try {
            const { cpf } = req.params;
            const func = await prisma.funcionario.findMany({
                where: {
                    cpf: {
                        contains: cpf
                    }
                }
            })//le o resultado do banco e filtra por cpf
            return res.status(200).json({
                sucesso: true,
                mensagem: "Funcionario lido com sucesso",
                data: func
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler o funcionario",
                erro: e.message
            })
        }
    }

    static async Create(req, res) {
        try {
            const { idUsuario, idSetor, tipo, dataDeNascimento, imagem, senha } = req.body

            const senhaHash = await hashPassword(senha) // cria um hash da senha usando a função hashPassword do database.js

            const newFunc = {
                idUsuario,
                idSetor,
                tipo,
                dataDeNascimento,
                imagem,
                senhaHash
            }

            const result = await prisma.funcionario.create({
                data: newFunc
            })// cria um novo funcionario na tabela "funcionarios" 
            return res.status(201).json({
                sucesso: true,
                mensagem: "Funcionario criado com sucesso",
                data: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar funcionario",
                erro: e.message
            })
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params
            const { idUsuario, idSetor, tipo, dataDeNascimento, imagem, senha } = req.body

            const senhaHash = await hashPassword(senha) // cria um hash da senha usando a função hashPassword do database.js

            const updatedFunc = {
                idUsuario,
                idSetor,
                tipo,
                dataDeNascimento,
                imagem,
                senhaHash
            }

            const result = await prisma.funcionario.update({
                where: {
                    id: Number(id)
                },
                data: updatedFunc
            })// atualiza o funcionario buscando por id 
            return res.status(200).json({
                sucesso: true,
                mensagem: "Funcionario atualizado com sucesso",
                data: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar funcionario",
                erro: e.message
            })
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params // obtém o ID do funcionario a partir dos parâmetros da rota
            const result = await prisma.funcionario.delete({
                where: {
                    id: Number(id)
                }
            })//deleta o funcionario da tabela "funcionarios" usando a função delete do database.js, filtrando pelo ID
            return res.status(200).json({
                sucesso: true,
                mensagem: "Funcionario deletado com sucesso",
                data: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar funcionario",
                erro: e.message
            })
        }
    }


}

export default FuncController;


