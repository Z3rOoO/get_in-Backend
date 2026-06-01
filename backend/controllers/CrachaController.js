import { prisma } from "../config/prisma.js";
import { includeCrachaDetalhado } from "../services/crachaService.js";

const STATUS_VALIDOS = new Set(["disponivel", "emUso", "perdido"]);
const STATUS_ALIAS = {
  d: "disponivel",
  e: "emUso",
  p: "perdido",
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

class CrachaController {
  static async create(req, res) {
    try {
      const data = buildCrachaData(req.body);

      const result = await prisma.$transaction(async (tx) => {
        const cracha = await tx.cracha.create({ data });

        await tx.tag.create({
          data: {
            idUsuario: cracha.idUsuario,
            idCracha: cracha.id,
            codigoTag: cracha.codigoTag,
            status: cracha.status,
            temporario: cracha.temporario,
            fisica: false,
            validade: cracha.validade,
          },
        });

        return tx.cracha.findUnique({
          where: { id: cracha.id },
          include: includeCrachaDetalhado,
        });
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
        include: includeCrachaDetalhado,
        orderBy: [
          { id: "asc" },
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

      const result = await prisma.$transaction(async (tx) => {
        const crachaAtual = await tx.cracha.findUnique({
          where: { id },
        });

        if (!crachaAtual) {
          throw new Error("Cracha nao encontrado");
        }

        const updateData = { ...data };
        const agora = new Date();

        if (data.status === "disponivel") {
          updateData.idUsuario = null;
          updateData.status = "disponivel";
          updateData.temporario = false;
          updateData.validade = null;
          updateData.dataDeDevolucao = agora;
        }

        if (data.status === "emUso") {
          const idUsuarioFinal = data.idUsuario !== undefined ? data.idUsuario : crachaAtual.idUsuario;

          if (!idUsuarioFinal) {
            throw new Error("Nao e possivel voltar um cracha sem usuario para em uso");
          }

          updateData.status = "emUso";
          updateData.idUsuario = idUsuarioFinal;
          updateData.dataDeDevolucao = null;
        }

        const cracha = await tx.cracha.update({
          where: { id },
          data: updateData,
        });

        if (data.status === "disponivel") {
          await tx.tag.updateMany({
            where: { idCracha: id },
            data: {
              idUsuario: null,
              idCracha: null,
              status: "disponivel",
              temporario: false,
              validade: null,
              dataDeDevolucao: agora,
            },
          });
        } else {
          const tagData = {};
          if (updateData.idUsuario !== undefined) tagData.idUsuario = updateData.idUsuario;
          if (updateData.status !== undefined) tagData.status = updateData.status;
          if (updateData.temporario !== undefined) tagData.temporario = updateData.temporario;
          if (updateData.validade !== undefined) tagData.validade = updateData.validade;
          if (updateData.dataDeDevolucao !== undefined) tagData.dataDeDevolucao = updateData.dataDeDevolucao;

          if (Object.keys(tagData).length > 0) {
            await tx.tag.updateMany({
              where: { idCracha: id },
              data: tagData,
            });
          }
        }

        return tx.cracha.findUnique({
          where: { id: cracha.id },
          include: includeCrachaDetalhado,
        });
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

      const result = await prisma.$transaction(async (tx) => {
        await tx.tag.deleteMany({
          where: {
            idCracha: id,
            fisica: false,
          },
        });

        await tx.tag.updateMany({
          where: {
            idCracha: id,
            fisica: true,
          },
          data: {
            idUsuario: null,
            idCracha: null,
            status: "disponivel",
            temporario: false,
            validade: null,
            dataDeDevolucao: new Date(),
          },
        });

        return tx.cracha.delete({
          where: { id },
        });
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
        include: includeCrachaDetalhado,
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
        include: includeCrachaDetalhado,
        orderBy: [
          { id: "asc" },
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

  static async assignPhysicalTag(req, res) {
    try {
      const id = parseId(req.params.id);
      const tagId = parseId(req.params.tagId || req.body?.idTag);

      if (!id || !tagId) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Id do cracha e id da TAG sao obrigatorios",
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        const cracha = await tx.cracha.findUnique({ where: { id } });
        if (!cracha) {
          throw new Error("Cracha nao encontrado");
        }

        const tag = await tx.tag.findUnique({ where: { id: tagId } });
        if (!tag || !tag.fisica) {
          throw new Error("TAG fisica nao encontrada");
        }

        if (tag.idUsuario || tag.idCracha) {
          throw new Error("TAG fisica ja esta vinculada");
        }

        await tx.tag.update({
          where: { id: tagId },
          data: {
            idUsuario: cracha.idUsuario,
            idCracha: cracha.id,
            status: "emUso",
            temporario: false,
            validade: null,
            dataDeDevolucao: null,
          },
        });

        await tx.cracha.update({
          where: { id },
          data: { status: "emUso" },
        });

        await tx.tag.updateMany({
          where: { idCracha: id, fisica: false },
          data: { status: "emUso" },
        });

        return tx.cracha.findUnique({
          where: { id },
          include: includeCrachaDetalhado,
        });
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "TAG fisica vinculada ao cracha com sucesso",
        data: result,
      });
    } catch (e) {
      return res.status(400).json({
        sucesso: false,
        mensagem: e.message || "Erro ao vincular TAG fisica",
      });
    }
  }

  static async releasePhysicalTag(req, res) {
    try {
      const tagId = parseId(req.params.tagId);

      if (!tagId) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Id da TAG fisica invalido",
        });
      }

      const result = await prisma.tag.update({
        where: { id: tagId },
        data: {
          idUsuario: null,
          idCracha: null,
          status: "disponivel",
          temporario: false,
          validade: null,
          dataDeDevolucao: new Date(),
        },
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "TAG fisica liberada com sucesso",
        data: result,
      });
    } catch (e) {
      return res.status(400).json({
        sucesso: false,
        mensagem: e.message || "Erro ao liberar TAG fisica",
      });
    }
  }
}

export default CrachaController;
