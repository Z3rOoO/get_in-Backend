// import { getConnection, Read, Create, Update, Delete } from "../config/database.js";
import { prisma } from "../config/prisma.js";

class UserController {

    static async Read(req, res) {
        try {
            const user = await prisma.usuario.findMany(); // lê os usuários da tabela "usuarios"
            if(user.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhum usuário encontrado"
                })
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuários lidos com sucesso",
                data: user
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler os usuários",
                erro: e.message
            })
        }
    }

    static async ReadId(req, res) {
        try {
            const { id } = req.params; 
            const user = await prisma.usuario.findUnique({
                where: {
                    id: Number(id)
                }
            }); 
            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuário lido com sucesso",
                data: user
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler o usuário",
                erro: e.message
            })
        }
    }
    static async ReadName(req, res) {
        try {
            const { nome } = req.params; 
            const user = await prisma.usuario.findMany({
                where: {
                    nome: {
                        contains: nome
                    }
                }
            }); 
            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuário lido com sucesso",
                data: user
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler o usuário",
                erro: e.message
            })
        }
    }
    static async ReadCpf(req, res) {
        try {
            const { cpf } = req.params; 
            const user = await prisma.usuario.findMany({
                where: {
                    cpf: {
                        contains: cpf
                    }
                }
            }); 
            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuário lido com sucesso",
                data: user
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler o usuário",
                erro: e.message
            })
        }
    }

    static async Create(req, res) {
        try {
            const { nome, cpf, cel, email, empresa, idDep } = req.body; 
            const data = {
                nome: nome,
                cpf: cpf,
                celular: cel,
                email: email,
                empresa: empresa,
                idDep: idDep ? Number(idDep) : null
            }
            const result = await prisma.usuario.create({
                data: data
            }) 
            return res.status(201).json({
                sucesso: true,
                mensagem: "Usuário criado com sucesso",
                data: result
            })

        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar o usuário",
                erro: e.message
            })
        }
    }

    static async Update(req, res) {
        const { id } = req.params; 
        const { nome, cpf, cel, email, empresa, idDep } = req.body; 
        const data = {
            nome: nome,
            cpf: cpf,
            celular: cel,
            email: email,
            empresa: empresa,
            idDep: idDep ? Number(idDep) : undefined
        }
        try {
            const result = await prisma.usuario.update({
                where: {
                    id: Number(id)
                },
                data: data
            }) 
            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuário atualizado com sucesso",
                data: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar o usuário",
                erro: e.message
            })
        }
    }

    static async Delete(req, res) { 
        const { id } = req.params; 
        try {
            const result = await prisma.usuario.delete({
                where: {
                    id: Number(id)
                }
            }) 
            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuário deletado com sucesso",
                data: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar o usuário",
                erro: e.message
            })
        }
    }

}
export default UserController;
