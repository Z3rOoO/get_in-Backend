import { getConnection, hashPassword, Create, Read, Update, Delete, FindOne, comparePassword } from '../config/database.js';
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { prisma } from '../config/prisma.js';

dotenv.config()

class AuthController {

    static async login(req, res) {
        try {
            const { email, senha } = req.body

            // busca usuário
            const user = await prisma.usuario.findUnique({
                where: { email }
            })

            if (!user) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: "Usuário não encontrado"
                })
            }

            // busca funcionario
            const func = await prisma.funcionario.findFirst({
                where: {
                    idUsuario: user.id
                }
            })

            if (!func) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: "Funcionário não encontrado"
                })
            }

            // valida senha
            const validacao = await comparePassword(senha, func.senhaHash)

            if (!validacao) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: "Senha incorreta"
                })
            }

            // gera token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            )

            return res.status(200).json({
                token,
                sucesso: true,
                mensagem: "login bem-sucedido",
                dados: user
            })

        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao realizar login",
                erro: e.message
            })
        }
    }
    static async register(req, res) {

        try {
            const {
                nome,
                cpf,
                celular,
                email,
                idDepartamento,
                tipo,
                dataDeNascimento,
                imagem,
                senha
            } = req.body;

            let datauser
            let idUsuario

            //verifica se o usuario já existe
            const usuarioExistente = await prisma.usuario.findFirst({
                where: {
                    OR: [
                        { cpf: cpf },
                        { email: email }
                    ]
                }
            })
            if (usuarioExistente) {
                idUsuario = usuarioExistente.id

            } else {
                // cria usuário
                datauser = { nome, cpf, celular, email };
                const usuario = await prisma.usuario.create({
                    data: datauser
                })

                idUsuario = usuario.id // cria um novo usuário na tabela "usuarios" usando a função create do database.js

            }
            //verifica se a um registro na tabela funcionarios
            const funcExistente = await prisma.funcionario.findFirst({
                where: {
                    idUsuario: idUsuario
                }
            })

            if (funcExistente) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Usuário já é funcionário"
                });
            }
            //segue apenas se não tiver um registro em ambas as tabelas



            try {

                const senhaHash = await hashPassword(senha);

                const newFunc = {
                    idUsuario,
                    idDepartamento: Number(idDepartamento),
                    tipo,
                    dataDeNascimento: new Date(dataDeNascimento),
                    imagem,
                    senhaHash: senhaHash
                };

                const resultfunc = await prisma.funcionario.create({
                    data: newFunc
                })
                return res.status(201).json({
                    sucesso: true,
                    mensagem: "Usuário e funcionário criados com sucesso",
                    dados: { id: idUsuario, ...datauser },
                    dado2: { id: resultfunc.id, ...newFunc }
                });

            } catch (e) {
                if (!usuarioExistente) {//deleta o usuario soamente se ele foi criado agora 
                    await prisma.usuario.deleteMany({
                        where: {
                            id: idUsuario

                        }
                    })
                }
                return res.status(500).json({
                    sucesso: false,
                    mensagem: "Erro ao registrar funcionário",
                    erro: e.message
                });
            }

        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao registrar usuário",
                erro: e.message
            });
        }

    }

    static async logout(req, res) {
        try {
            return res.status(200).json({
                sucesso: true,
                mensagem: "Logout bem-sucedido"
            })
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao realizar Logout",
                erro: e.message
            })
        }

    }

}

export default AuthController;