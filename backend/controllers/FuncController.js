// import { getConnection, Create, Read, Update, Delete, hashPassword } from '../config/database.js';
import { prisma } from '../config/prisma.js';
import { hashPassword } from '../config/utils.js';

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

    static async ReadView(req, res) {
        try {
            const funcionarios = await prisma.funcionario.findMany({
                include: {
                    usuario: true,
                    setores_funcionarios_idSetorTosetores: true
                },
                orderBy: [
                    { dataDeCriacao: "desc" },
                    { id: "desc" }
                ]
            })
            const func = funcionarios.map((item) => ({
                id: item.id,
                usuario_id: item.idUsuario,
                idUsuario: item.idUsuario,
                usuario_nome: item.usuario?.nome || null,
                nome: item.usuario?.nome || null,
                email: item.usuario?.email || null,
                cpf: item.usuario?.cpf || null,
                celular: item.usuario?.celular || null,
                cargo: item.tipo,
                tipo: item.tipo,
                idSetor: item.idSetor,
                setor_id: item.idSetor,
                departamento_nome: item.setores_funcionarios_idSetorTosetores?.nome || null,
                setor: item.setores_funcionarios_idSetorTosetores?.nome || null,
                dataDeNascimento: item.dataDeNascimento,
                dataDeCriacao: item.dataDeCriacao,
                foto_perfil: item.imagem
            }))
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
            const { idUsuario, idSetor, tipo, dataDeNascimento, imagem, senha, nome, cpf, celular, telefone, email } = req.body

            const funcionario = await prisma.funcionario.findUnique({
                where: {
                    id: Number(id)
                },
                include: {
                    usuario: true
                }
            })

            if (!funcionario) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Funcionario nao encontrado"
                })
            }

            const updatedFunc = {}
            const updatedUser = {}

            if (idUsuario !== undefined) updatedFunc.idUsuario = Number(idUsuario)
            if (idSetor !== undefined) updatedFunc.idSetor = idSetor ? Number(idSetor) : null
            if (tipo !== undefined) updatedFunc.tipo = tipo
            if (dataDeNascimento !== undefined) updatedFunc.dataDeNascimento = dataDeNascimento ? new Date(dataDeNascimento) : null
            if (imagem !== undefined) updatedFunc.imagem = imagem || null
            if (senha) updatedFunc.senhaHash = await hashPassword(senha)

            if (nome !== undefined) updatedUser.nome = String(nome).trim()
            if (cpf !== undefined) updatedUser.cpf = String(cpf).trim()
            if (celular !== undefined || telefone !== undefined) updatedUser.celular = String(celular || telefone || "").trim() || null
            if (email !== undefined) updatedUser.email = String(email).trim().toLowerCase()

            const result = await prisma.$transaction(async (tx) => {
                if (Object.keys(updatedUser).length > 0) {
                    await tx.usuario.update({
                        where: { id: funcionario.idUsuario },
                        data: updatedUser
                    })
                }

                if (Object.keys(updatedFunc).length > 0) {
                    await tx.funcionario.update({
                        where: { id: Number(id) },
                        data: updatedFunc
                    })
                }

                return tx.funcionario.findUnique({
                    where: { id: Number(id) },
                    include: {
                        usuario: true,
                        setores_funcionarios_idSetorTosetores: true
                    }
                })
            })

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


