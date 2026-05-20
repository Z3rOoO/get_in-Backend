import { prisma } from "../config/prisma.js";
import { comparePassword, hashPassword } from "../config/utils.js";

const AVATAR_PUBLIC_URL = "https://dmlshwvpsoqpptjmplfq.supabase.co/storage/v1/object/public/usuarios";

function hasValue(value) {
    return value !== undefined && value !== null && String(value).trim() !== "";
}

function cleanString(value) {
    return String(value || "").trim();
}

function parseId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeTipo(tipo) {
    const value = String(tipo || "").trim().toLowerCase();
    const aliases = {
        administrador: "adm",
        admin: "adm",
        adm: "adm",
        gerente: "ger",
        ger: "ger",
        supervisor: "sup",
        sup: "sup",
        portaria: "port",
        porteiro: "port",
        port: "port",
        funcionario: "func",
        func: "func"
    };

    return aliases[value] || value;
}

function getAvatarUrl(path) {
    return path ? `${AVATAR_PUBLIC_URL}/${path}` : null;
}

function sanitizeFuncionario(funcionario) {
    if (!funcionario) {
        return null;
    }

    const { senhaHash, setores_funcionarios_idSetorTosetores, ...safeFuncionario } = funcionario;

    return {
        ...safeFuncionario,
        setor: setores_funcionarios_idSetorTosetores || null,
        setores: setores_funcionarios_idSetorTosetores || null,
        avatarUrl: getAvatarUrl(funcionario.imagem)
    };
}

async function getCurrentFuncionario(userId) {
    return prisma.funcionario.findFirst({
        where: { idUsuario: userId },
        include: {
            usuario: {
                include: {
                    empresas: true,
                    departamentos: true
                }
            },
            setores_funcionarios_idSetorTosetores: true
        }
    });
}

function buildProfile(funcionario) {
    const usuario = funcionario?.usuario;
    const safeFuncionario = sanitizeFuncionario(funcionario);

    return {
        usuario: usuario || null,
        funcionario: safeFuncionario,
        perfil: usuario
            ? {
                id: usuario.id,
                nome: usuario.nome,
                cpf: usuario.cpf,
                email: usuario.email,
                telefone: usuario.celular,
                celular: usuario.celular,
                empresa: usuario.empresas?.nome || null,
                setor: safeFuncionario?.setor?.nome || usuario.departamentos?.nome || null,
                cargo: safeFuncionario?.tipo || null,
                dataAdmissao: safeFuncionario?.dataDeCriacao || usuario.dataDeCriacao,
                avatarUrl: safeFuncionario?.avatarUrl || null
            }
            : null
    };
}

function getPrismaErrorMessage(error) {
    if (error?.code === "P2002") {
        return "Ja existe um usuario cadastrado com esse CPF ou e-mail.";
    }

    if (error?.code === "P2025") {
        return "Usuario nao encontrado.";
    }

    return error.message;
}

class UserController {
    static async Read(req, res) {
        try {
            const user = await prisma.usuario.findMany({
                include: {
                    empresas: true,
                    departamentos: true
                },
                orderBy: { nome: "asc" }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuarios lidos com sucesso",
                data: user
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler os usuarios",
                erro: e.message
            });
        }
    }

    static async ReadId(req, res) {
        try {
            const { id } = req.params;
            const user = await prisma.usuario.findUnique({
                where: {
                    id: Number(id)
                },
                include: {
                    empresas: true,
                    departamentos: true
                }
            });

            if (!user) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Usuario nao encontrado"
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuario lido com sucesso",
                data: user
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler o usuario",
                erro: e.message
            });
        }
    }

    static async ReadName(req, res) {
        try {
            const { nome } = req.params;
            const user = await prisma.usuario.findMany({
                where: {
                    nome: {
                        contains: nome,
                        mode: "insensitive"
                    }
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuario lido com sucesso",
                data: user
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler o usuario",
                erro: e.message
            });
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
                mensagem: "Usuario lido com sucesso",
                data: user
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao ler o usuario",
                erro: e.message
            });
        }
    }

    static async Create(req, res) {
        try {
            const { nome, cpf, cel, celular, email, idDep, idEmpresa } = req.body;
            const data = {
                nome: cleanString(nome),
                cpf: cleanString(cpf),
                celular: hasValue(celular) ? cleanString(celular) : cleanString(cel),
                email: cleanString(email).toLowerCase(),
                idDep: parseId(idDep),
                idEmpresa: parseId(idEmpresa)
            };

            const result = await prisma.usuario.create({ data });

            return res.status(201).json({
                sucesso: true,
                mensagem: "Usuario criado com sucesso",
                data: result
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar o usuario",
                erro: getPrismaErrorMessage(e)
            });
        }
    }

    static async Update(req, res) {
        const { id } = req.params;
        const { nome, cpf, cel, celular, email, idDep, idEmpresa } = req.body;
        const data = {};

        if (hasValue(nome)) data.nome = cleanString(nome);
        if (hasValue(cpf)) data.cpf = cleanString(cpf);
        if (hasValue(celular) || hasValue(cel)) data.celular = cleanString(celular || cel);
        if (hasValue(email)) data.email = cleanString(email).toLowerCase();
        if (idDep !== undefined) data.idDep = parseId(idDep);
        if (idEmpresa !== undefined) data.idEmpresa = parseId(idEmpresa);

        try {
            const result = await prisma.usuario.update({
                where: {
                    id: Number(id)
                },
                data
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuario atualizado com sucesso",
                data: result
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar o usuario",
                erro: getPrismaErrorMessage(e)
            });
        }
    }

    static async Delete(req, res) {
        const { id } = req.params;

        try {
            const result = await prisma.usuario.delete({
                where: {
                    id: Number(id)
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Usuario deletado com sucesso",
                data: result
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar o usuario",
                erro: getPrismaErrorMessage(e)
            });
        }
    }

    static async ReadMyProfile(req, res) {
        try {
            const funcionario = await getCurrentFuncionario(req.user.id);

            if (!funcionario) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Funcionario nao encontrado"
                });
            }

            return res.status(200).json({
                sucesso: true,
                data: buildProfile(funcionario)
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao buscar perfil",
                erro: e.message
            });
        }
    }

    static async UpdateMyProfile(req, res) {
        try {
            const funcionarioAtual = await getCurrentFuncionario(req.user.id);

            if (!funcionarioAtual) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Funcionario nao encontrado"
                });
            }

            const { nome, email, telefone, celular, idSetor, cargo, tipo } = req.body;
            const usuarioData = {};
            const funcionarioData = {};

            if (hasValue(nome)) usuarioData.nome = cleanString(nome);
            if (hasValue(email)) usuarioData.email = cleanString(email).toLowerCase();
            if (hasValue(telefone) || hasValue(celular)) usuarioData.celular = cleanString(telefone || celular);

            const setorId = parseId(idSetor);
            if (setorId) funcionarioData.idSetor = setorId;

            const tipoSolicitado = normalizeTipo(cargo || tipo);
            if (tipoSolicitado && funcionarioAtual.tipo === "adm") {
                funcionarioData.tipo = tipoSolicitado;
            }

            await prisma.$transaction(async (tx) => {
                if (Object.keys(usuarioData).length > 0) {
                    await tx.usuario.update({
                        where: { id: req.user.id },
                        data: usuarioData
                    });
                }

                if (Object.keys(funcionarioData).length > 0) {
                    await tx.funcionario.update({
                        where: { id: funcionarioAtual.id },
                        data: funcionarioData
                    });
                }
            });

            const funcionarioAtualizado = await getCurrentFuncionario(req.user.id);

            return res.status(200).json({
                sucesso: true,
                mensagem: "Perfil atualizado com sucesso",
                data: buildProfile(funcionarioAtualizado)
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar perfil",
                erro: getPrismaErrorMessage(e)
            });
        }
    }

    static async UpdateMyPassword(req, res) {
        try {
            const { senhaAtual, novaSenha } = req.body;

            if (!hasValue(senhaAtual) || !hasValue(novaSenha)) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "Senha atual e nova senha sao obrigatorias"
                });
            }

            if (String(novaSenha).length < 8) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "A nova senha deve ter no minimo 8 caracteres"
                });
            }

            const funcionario = await prisma.funcionario.findFirst({
                where: { idUsuario: req.user.id }
            });

            if (!funcionario) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Funcionario nao encontrado"
                });
            }

            const senhaValida = await comparePassword(senhaAtual, funcionario.senhaHash);

            if (!senhaValida) {
                return res.status(401).json({
                    sucesso: false,
                    mensagem: "Senha atual incorreta"
                });
            }

            const senhaHash = await hashPassword(novaSenha);

            await prisma.funcionario.update({
                where: { id: funcionario.id },
                data: { senhaHash }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Senha atualizada com sucesso"
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar senha",
                erro: e.message
            });
        }
    }
}

export default UserController;
