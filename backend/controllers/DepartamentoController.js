// import { Read, Create } from "../config/database.js"
import { prisma } from "../config/prisma.js";

class DepartamentoController {

    static async read(req, res){
        try{
            const departamento = await prisma.departamento.findMany()

            if(departamento.length === 0) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Nenhum departamento encontrado"
                })
            }

            res.status(200).json({
                sucesso: true,
                mensagem: "Departamentos listados com sucesso",
                data: departamento
            })

        }
        catch(e) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar Departamentos",
                erro: e.message
            })
        }

    }

        static async create(req, res){
        try{
            const {nome, idGestor} = req.body;


            // VERIFICA SE O NOME DO DEPARTAMENTO FOI FORNECIDO
            if(!nome) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "O nome do departamento é obrigatório"
                })
            }
        
            // LISTA OS DEPARTAMENTOS EXISTENTES PARA VER SE O NOME DO DEPARTAMENTO JÁ EXISTE
            const departamento = await prisma.departamento.findUnique({
                where: { nome: nome}
            })


            // SE O DEPARTAMENTO EXISTIR, RETORNA UM ERRO
            if(departamento) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Departamento já existe"
                })
            }

            // CRIA O DEPARTAMENTO 
            await prisma.departamento.create({
                data: {
                    nome: nome,
                    idGestor: idGestor
                }
            })
            
            res.status(200).json({
                sucesso: true,
                mensagem: `Criado o departamento ${nome} com sucesso!`
            })

        }
        catch(e) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar um departamento",
                erro: e.message
            })
        }

    }

    static async readById(req, res){
        try{
            const {id} = req.params;
            const departamento = await prisma.departamento.findUnique({
                where: { id: Number(id) }
            })  
            if(!departamento) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Departamento não encontrado"
                })
            }

            res.status(200).json({
                sucesso: true,
                mensagem: "Departamento lido com sucesso",
                dados: departamento
            })

        }
        catch(e) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler o departamento",
                erro: e.message
            })
        }
    }

    static async update(req, res){
        try{
            const {id} = req.params;
            const {nome, idGestor} = req.body;
            const departamento = await prisma.departamento.findUnique({
                where: { id: Number(id) }
            })
            if(!departamento) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Departamento não encontrado"
                })
            }
            await prisma.departamento.update({
                where: { id: Number(id) },
                data: {
                    nome: nome,
                    idGestor: idGestor
                }
            })
            res.status(200).json({
                sucesso: true,
                mensagem: "Departamento atualizado com sucesso"
            })
        }
        catch(e) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar o departamento",
                erro: e.message
            })
        }
    }

    static async delete(req, res){
        try{
            const {id} = req.params;
            const departamento = await prisma.departamento.findUnique({
                where: { id: Number(id) }
            })
            if(!departamento) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Departamento não encontrado"
                })
            }
            await prisma.departamento.delete({
                where: { id: Number(id) }
            })
            res.status(200).json({
                sucesso: true,
                mensagem: "Departamento deletado com sucesso"
            })
        }
        catch(e) {
            res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar o departamento",
                erro: e.message
            })
        }
    }
}

export default DepartamentoController