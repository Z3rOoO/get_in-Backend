import { prisma } from "../config/prisma.js";

const STATUS_VALIDOS = new Set(["disponivel", "emUso"]);
const STATUS_ALIAS = {
  d: "disponivel",
  e: "emUso",
};

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeStatus(value, fallback = "disponivel") {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const status = STATUS_ALIAS[value] || String(value).trim();
  return STATUS_VALIDOS.has(status) ? status : null;
}

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildCrachaData(body = {}, { partial = false } = {}) {
  const data = {};

  if (!partial || body.codigoTag !== undefined) {
    const codigoTag = String(body.codigoTag || "").trim();
    if (!codigoTag) {
      throw new Error("codigoTag e obrigatorio");
    }
    data.codigoTag = codigoTag;
  }

  if (!partial || body.status !== undefined) {
    const status = normalizeStatus(body.status);
    if (!status) {
      throw new Error("Status de cracha invalido");
    }
    data.status = status;
  }

  if (body.idUsuario !== undefined) {
    data.idUsuario = parseId(body.idUsuario);
  }

  if (body.temporario !== undefined) {
    data.temporario = Boolean(body.temporario);
  }

  if (body.validade !== undefined) {
    data.validade = parseDate(body.validade);
  }

  if (body.dataDeDevolucao !== undefined) {
    data.dataDeDevolucao = parseDate(body.dataDeDevolucao);
  }

  return data;
}

const includeUsuario = {
  usuario: {
    include: {
      departamentos: true,
    },
  },
};

class CrachaController {
  static async create(req, res) {
    try {
      const data = buildCrachaData(req.body);
      const result = await prisma.cracha.create({
        data,
        include: includeUsuario,
      });

      return res.status(201).json({
        sucesso: true,
        mensagem: "Cracha criado com sucesso",
        data: result,
      });
    } catch (e) {
      return res.status(400).json({
        sucesso: false,
        mensagem: e.message || "Erro ao criar cracha",
      });
    }
  }

  static async read(req, res) {
    try {
      const crachas = await prisma.cracha.findMany({
        include: includeUsuario,
        orderBy: [
          { dataDeCriacao: "desc" },
          { id: "desc" },
        ],
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Crachas listados com sucesso",
        data: crachas,
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao listar crachas",
        erro: e.message,
      });
    }
  }

  static async update(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return res.status(400).json({ sucesso: false, mensagem: "Id do cracha invalido" });
      }

      const data = buildCrachaData(req.body, { partial: true });
      if (Object.keys(data).length === 0) {
        return res.status(400).json({ sucesso: false, mensagem: "Nenhum campo para atualizar" });
      }

      const result = await prisma.cracha.update({
        where: { id },
        data,
        include: includeUsuario,
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Cracha atualizado com sucesso",
        data: result,
      });
    } catch (e) {
      return res.status(400).json({
        sucesso: false,
        mensagem: e.message || "Erro ao atualizar o cracha",
      });
    }
  }

  static async delete(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return res.status(400).json({ sucesso: false, mensagem: "Id do cracha invalido" });
      }

      const result = await prisma.cracha.delete({
        where: { id },
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Cracha deletado com sucesso",
        data: result,
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao deletar o cracha",
        erro: e.message,
      });
    }
  }

  static async readById(req, res) {
    try {
      const id = parseId(req.params.id);
      if (!id) {
        return res.status(400).json({ sucesso: false, mensagem: "Id do cracha invalido" });
      }

      const result = await prisma.cracha.findUnique({
        where: { id },
        include: includeUsuario,
      });

      if (!result) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Cracha nao encontrado",
        });
      }

      return res.status(200).json({
        sucesso: true,
        mensagem: "Cracha encontrado com sucesso",
        data: result,
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao encontrar o cracha",
        erro: e.message,
      });
    }
  }

  static async readByStatus(req, res) {
    try {
      const status = normalizeStatus(req.params.status);
      if (!status) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Status de cracha invalido",
        });
      }

      const result = await prisma.cracha.findMany({
        where: { status },
        include: includeUsuario,
        orderBy: [
          { dataDeCriacao: "desc" },
          { id: "desc" },
        ],
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Crachas encontrados com sucesso",
        data: result,
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao encontrar os crachas",
        erro: e.message,
      });
    }
  }
}

export default CrachaController;
