import { getConnection, Read, Create, Update, Delete } from "../config/database.js";
import { prisma } from "../config/prisma.js";

class UserController {

    static async Read(req, res) {
        try {
            const user = await prisma.usuario.findMany(); // lê os usuários da tabela "usuarios" usando a função read do database.js
            if(user.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhum usuário encontrado"
                })
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuários lidos com sucesso",
                dados: user
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
            const { id } = req.params; // obtém o ID do usuário a partir dos parâmetros da rota
            const user = await prisma.usuario.findUnique({
                where: {
                    id: Number(id)
                }
            }); // le o usuário da tabela "usuarios" usando a função read do database.js, filtrando pelo ID
            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuário lido com sucesso",
                dados: user
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
            const { id } = req.params; // obtém o ID do usuário a partir dos parâmetros da rota
            const user = await prisma.usuario.findMany({
                where: {
                    nome: {
                        contains: id
                    }
                }
            }); // le o usuário da tabela "usuarios" usando a função read do database.js, filtrando pelo nome
            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuário lido com sucesso",
                dados: user
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
            const { id } = req.params; // obtém o ID do usuário a partir dos parâmetros da rota
            const user = await prisma.usuario.findMany({
                where: {
                    cpf: {
                        contains: id
                    }
                }
            }); // le o usuário da tabela "usuarios" usando a função read do database.js, filtrando pelo CPF
            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuário lido com sucesso",
                dados: user
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
            const { nome, cpf, cel, email } = req.body; // obtém os dados do usuário a partir do corpo da requisição    
            const data = {
                nome: nome,
                cpf: cpf,
                celular: cel,
                email: email
            }
            const result = await prisma.usuario.create({
                data: data
            }) // cria um novo usuário na tabela "usuarios" usando a função create do database.js
            return res.status(201).json({
                sucesso: true,
                mensagem: "Usuário criado com sucesso",
                dados: { id: result.insertId, ...data } // retorna o ID do novo usuário junto com os dados fornecidos
            })

        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar o usuário",
                erro: e.message
            })
        }
    }

    static async Update(req, res) {// implementa mudanças em um usuário existente
        const { id } = req.params; // obtém o ID do usuário a partir dos parâmetros da rota
        const { nome, cpf, cel, email } = req.body; // obtém os dados atualizados do usuário a partir do corpo da requisição
        const data = {
            nome: nome,
            cpf: cpf,
            celular: cel,
            email: email
        }
        try {
            const result = await prisma.usuario.update({
                where: {
                    id: Number(id)
                },
                data: data
            }) // atualiza o usuário na tabela "usuarios" usando a função update do database.js, filtrando pelo ID
            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuário atualizado com sucesso",
                dados: result
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar o usuário",
                erro: e.message
            })
        }
    }

    static async Delete(req, res) { // remove um usuário existente
        const { id } = req.params; // obtém o ID do usuário a partir dos parâmetros da rota
        try {
            const result = await prisma.usuario.delete({
                where: {
                    id: Number(id)
                }
            }) // deleta o usuário da tabela "usuarios" usando a função delete do database.js, filtrando pelo ID    
            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuário deletado com sucesso",
                dados: result
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
