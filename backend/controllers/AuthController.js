import jwt from 'jsonwebtoken'
import { prisma } from '../config/prisma.js';
import { comparePassword, hashPassword } from '../config/utils.js';
import { env } from '../config/env.js';
import { errorResponse } from '../config/http.js';
import { ensureUserCracha } from '../services/crachaService.js';

const AVATAR_PUBLIC_URL = env.supabasePublicBaseUrl;
const INVALID_LOGIN_MESSAGE = "Email ou senha incorretos";

function getAvatarUrl(path) {
    return path ? `${AVATAR_PUBLIC_URL}/${path}` : null;
}

function maskLoginFailureMessages(res) {
    const json = res.json.bind(res);

    res.json = (body) => {
        if (res.statusCode === 401 && body && typeof body === "object") {
            return json({ ...body, mensagem: INVALID_LOGIN_MESSAGE });
        }

        return json(body);
    };
}

class AuthController {

    static async login(req, res) {
        maskLoginFailureMessages(res);

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

            const func = await prisma.funcionario.findFirst({
                where: {
                    idUsuario: user.id
                },
                include: {
                    setores_funcionarios_idSetorTosetores: true
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
                env.jwtSecret,
                { expiresIn: env.jwtExpiresIn }
            )

            const { senhaHash, ...funcionarioSeguro } = func
            const funcionario = {
                ...funcionarioSeguro,
                setor: func.setores_funcionarios_idSetorTosetores || null,
                setores: func.setores_funcionarios_idSetorTosetores || null,
                avatarUrl: getAvatarUrl(func.imagem)
            }

            return res.status(200).json({
                token,
                sucesso: true,
                mensagem: "login bem-sucedido",
                data: {
                    usuario: user,
                    funcionario
                }
            })

        } catch (e) {
            return errorResponse(res, 500, "Erro ao realizar login", e)
        }
    }
    static async register(req, res) {

        try {
            const {
                nome,
                cpf,
                celular,
                email,
                idDep,
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
                datauser = {
                    nome: usuarioExistente.nome,
                    cpf: usuarioExistente.cpf,
                    celular: usuarioExistente.celular,
                    email: usuarioExistente.email
                }

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
                    idSetor: idDep || idDepartamento ? Number(idDep || idDepartamento) : null,
                    tipo,
                    dataDeNascimento: dataDeNascimento ? new Date(dataDeNascimento) : null,
                    imagem,
                    senhaHash: senhaHash
                };

                const result = await prisma.$transaction(async (tx) => {
                    const funcionario = await tx.funcionario.create({
                        data: newFunc
                    })
                    const cracha = await ensureUserCracha(idUsuario, tx)

                    return { funcionario, cracha }
                })
                return res.status(201).json({
                    sucesso: true,
                    mensagem: "Usuário e funcionário criados com sucesso",
                    data: {
                        usuario: { id: idUsuario, ...datauser },
                        funcionario: { id: result.funcionario.id, ...newFunc },
                        cracha: result.cracha
                    }
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
