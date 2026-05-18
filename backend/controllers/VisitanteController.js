import { prisma } from "../config/prisma.js";

class VisitanteController {
    static async criar(req, res) {

        let usuario

        try {


            // pega os dados da requisição
            const { nome, cpf, idEmpresa, motivo, celular, email, idSetor } = req.body


            // por só ter um departamento na empresa deixamos fixo o valor
            const idDep = 1

            // pega as informações para a tabela usuarios
            const infoUser = { nome, cpf, celular, email, idEmpresa, idDep }

            // verifica se existe o mesmo cpf cadastrado na tabela usuarios
            const existeCPF = await prisma.usuario.findFirst({
                where: {
                    cpf: cpf
                }
            })

            // verifica se ja existe o mesmo email cadastrado na tabela usuarios
            const existeEmail = await prisma.usuario.findFirst({
                where: {
                    cpf: email
                }
            })

            // se existir cpf retorna um erro
            if (existeCPF) {
                return res.status(409).json({
                    sucesso: false,
                    mensagem: "ja existe um usuário cadastrado com esse CPF",
                })
            }


            // se existir email retorna um erro
            if (existeEmail) {
                return res.status(409).json({
                    sucesso: false,
                    mensagem: "ja existe um usuário cadastrado com esse email",
                })
            }

            // adiciona o visitante a tabela usuarios
            usuario = await prisma.usuario.create({
                data: infoUser
            })

            // pega o nome da empresa 
            const empresa = await prisma.empresas.findFirst({
                where: {
                    id: idEmpresa
                }, select: {
                    nome: true
                }
            })

            console.log(empresa.nome)


            const dadosReq = await {
                idUsuario: usuario.id,
                idSetor: idSetor,
                motivo: motivo,
                validade: null,
                descricao: null,
                empresa: empresa
            }


            const respostaFetch = await fetch("https://get-in-ilp5.onrender.com/requisicao-visitante", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosReq)
            })

            if (!respostaFetch.ok) {
                const dadosErroFetch = await respostaFetch.json().catch(() => ({}))

                throw new Error(dadosErroFetch.erro || "A API de requisições rejeitou os dados.");
            }
            
            res.status(201).json({
                sucesso: true,
                mensagem: "as requisições do visitante atual foi criadas com sucesso"
            })


        } catch (e) {

            if (usuario && usuario.id) {
                console.log("apagando usuario criado")
                try {
                    await prisma.usuario.delete({
                        where: {
                            id: usuario.id
                        }
                    })
                    return res.status(500).json({
                        sucesso: false,
                        mensagem: "não foi possivel criar o usuario pois a requisição falhou",
                        erro: e.message
                    })

                } catch (e) {
                    console.error("erro ao tentar apagar usuario: " + e)
                }
            }

            res.status(500).json({
                sucesso: false,
                mensagem: "Erro interno do servidor",
                erro: e.message
            })
        }
    }
}

export default VisitanteController