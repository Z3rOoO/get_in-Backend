import { prisma } from "../config/prisma.js";

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function cleanString(value) {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  return text || null;
}

function buildEmpresaData(body = {}) {
  const data = {};
  const campos = ["nome", "cnpj", "responsavel", "contato", "celular", "categoria", "status"];

  campos.forEach((campo) => {
    if (body[campo] !== undefined) {
      data[campo] = cleanString(body[campo]);
    }
  });

  if (data.status === null) {
    data.status = "Ativa";
  }

  return data;
}

async function enrichEmpresa(empresa) {
  const [usuariosCount, requisicoesCount, ultimaRequisicao] = await Promise.all([
    prisma.usuario.count({ where: { idEmpresa: empresa.id } }),
    prisma.requisicaoDeVisita.count({
      where: {
        OR: [
          { usuario: { idEmpresa: empresa.id } },
          { empresa: empresa.nome },
        ],
      },
    }),
    prisma.requisicaoDeVisita.findFirst({
      where: {
        OR: [
          { usuario: { idEmpresa: empresa.id } },
          { empresa: empresa.nome },
        ],
      },
      orderBy: [
        { dataDaRequisicao: "desc" },
        { id: "desc" },
      ],
      select: { dataDaRequisicao: true },
    }),
  ]);

  return {
    ...empresa,
    status: empresa.status || "Ativa",
    visitantes: Math.max(usuariosCount, requisicoesCount),
    ultimaVisita: ultimaRequisicao?.dataDaRequisicao || null,
  };
}

class EmpresaController {
  static async read(req, res) {
    try {
      const empresas = await prisma.empresas.findMany({
        orderBy: { nome: "asc" },
      });
      const data = await Promise.all(empresas.map(enrichEmpresa));

      return res.status(200).json({
        sucesso: true,
        mensagem: "Empresas listadas com sucesso",
        data,
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro interno no servidor",
        erro: e.message,
      });
    }
  }

  static async create(req, res) {
    try {
      const data = buildEmpresaData(req.body);

      if (!data.nome) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Nome da empresa e obrigatorio",
        });
      }

      const result = await prisma.empresas.create({
        data: {
          ...data,
          status: data.status || "Ativa",
        },
      });

      return res.status(201).json({
        sucesso: true,
        mensagem: "Empresa criada com sucesso",
        data: await enrichEmpresa(result),
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao criar empresa",
        erro: e.message,
      });
    }
  }

  static async update(req, res) {
    try {
      const id = parseId(req.params.id);
      const data = buildEmpresaData(req.body);

      if (!id) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Id da empresa invalido",
        });
      }

      if (Object.keys(data).length === 0) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Nenhum campo para atualizar",
        });
      }

      const result = await prisma.empresas.update({
        where: { id },
        data,
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Empresa atualizada com sucesso",
        data: await enrichEmpresa(result),
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao atualizar empresa",
        erro: e.message,
      });
    }
  }

  static async delete(req, res) {
    try {
      const id = parseId(req.params.id);

      if (!id) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "Id da empresa invalido",
        });
      }

      const result = await prisma.$transaction(async (tx) => {
        await tx.usuario.updateMany({
          where: { idEmpresa: id },
          data: { idEmpresa: null },
        });

        return tx.empresas.delete({ where: { id } });
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Empresa removida com sucesso",
        data: result,
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao remover empresa",
        erro: e.message,
      });
    }
  }
}

export default EmpresaController;
