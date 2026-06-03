import { prisma } from "../config/prisma.js";

const ACESSOS = new Set(["Liberado", "Restrito", "Bloqueado"]);
const STATUS = new Set(["Ativo", "Inativo"]);

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function cleanString(value) {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  return text || null;
}

function normalizeAcesso(value) {
  const text = cleanString(value) || "Liberado";
  return ACESSOS.has(text) ? text : "Liberado";
}

function normalizeStatus(value) {
  const text = cleanString(value) || "Ativo";
  return STATUS.has(text) ? text : "Ativo";
}

async function validarGestor(idGestor) {
  if (idGestor === undefined || idGestor === null || idGestor === "") {
    return null;
  }

  const gestorId = parseId(idGestor);
  if (!gestorId) {
    throw new Error("Gestor invalido");
  }

  const gestor = await prisma.funcionario.findFirst({
    where: {
      id: gestorId,
      tipo: "ger",
    },
  });

  if (!gestor) {
    throw new Error("Gestor nao encontrado");
  }

  return gestorId;
}

async function buildSetorData(body = {}, { partial = false } = {}) {
  const data = {};

  if (!partial || body.nome !== undefined) {
    const nome = cleanString(body.nome);
    if (!nome) {
      throw new Error("O nome do setor e obrigatorio");
    }
    data.nome = nome;
  }

  if (!partial || body.acesso !== undefined) {
    data.acesso = normalizeAcesso(body.acesso);
  }

  if (!partial || body.status !== undefined) {
    data.status = normalizeStatus(body.status);
  }

  if (body.idGestor !== undefined) {
    data.idGestor = await validarGestor(body.idGestor);
  } else if (!partial) {
    data.idGestor = null;
  }

  if (!partial) {
    data.idDep = 1;
  }

  return data;
}

async function contarUsuariosDoSetor(idSetor) {
  const [funcionarios, visitantes] = await Promise.all([
    prisma.funcionario.findMany({
      where: { idSetor },
      select: { idUsuario: true },
    }),
    prisma.requisicaoDeVisita.findMany({
      where: { idSetor },
      distinct: ["idUsuario"],
      select: { idUsuario: true },
    }),
  ]);

  const usuarios = new Set([
    ...funcionarios.map((item) => item.idUsuario).filter(Boolean),
    ...visitantes.map((item) => item.idUsuario).filter(Boolean),
  ]);

  return {
    usuariosCadastrados: usuarios.size,
    funcionariosCadastrados: funcionarios.length,
    visitantesCadastrados: visitantes.length,
  };
}

class SetoresController {
  static async read(req, res) {
    try {
      const setores = await prisma.setores.findMany({
        include: {
          funcionarios_setores_idGestorTofuncionarios: {
            include: { usuario: true },
          },
        },
        orderBy: { nome: "asc" },
      });

      const data = await Promise.all(
        setores.map(async (setor) => ({
          ...setor,
          responsavel: setor.funcionarios_setores_idGestorTofuncionarios?.usuario?.nome || null,
          ...(await contarUsuariosDoSetor(setor.id)),
        }))
      );

      return res.status(200).json({
        sucesso: true,
        mensagem: "Setores listados com sucesso",
        data,
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao listar setores",
        erro: e.message,
      });
    }
  }

  static async readById(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return res.status(400).json({ sucesso: false, mensagem: "Id do setor invalido" });
      }

      const setor = await prisma.setores.findUnique({ where: { id } });
      if (!setor) {
        return res.status(404).json({ sucesso: false, mensagem: "Setor nao encontrado" });
      }

      return res.status(200).json({ sucesso: true, data: setor });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao buscar setor",
        erro: e.message,
      });
    }
  }

  static async create(req, res) {
    try {
      const data = await buildSetorData(req.body);
      const existente = await prisma.setores.findUnique({ where: { nome: data.nome } });

      if (existente) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Setor ja existe",
        });
      }

      const setor = await prisma.setores.create({ data });

      return res.status(201).json({
        sucesso: true,
        mensagem: `Criado o setor ${data.nome} com sucesso`,
        data: setor,
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao criar setor",
        erro: e.message,
      });
    }
  }

  static async update(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return res.status(400).json({ sucesso: false, mensagem: "Id do setor invalido" });
      }

      const data = await buildSetorData(req.body, { partial: true });
      if (Object.keys(data).length === 0) {
        return res.status(400).json({ sucesso: false, mensagem: "Nenhum campo para atualizar" });
      }

      const setor = await prisma.setores.update({
        where: { id },
        data,
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Setor atualizado com sucesso",
        data: setor,
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar setor",
        erro: e.message,
      });
    }
  }

  static async delete(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return res.status(400).json({ sucesso: false, mensagem: "Id do setor invalido" });
      }

      const setor = await prisma.setores.delete({ where: { id } });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Setor removido com sucesso",
        data: setor,
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao remover setor",
        erro: e.message,
      });
    }
  }
}

export default SetoresController;
