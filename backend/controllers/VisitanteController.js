import { prisma } from "../config/prisma.js";
import { STATUS_REQUISICAO, normalizeMotivoVisita } from "../config/requisicaoVisitanteRules.js";

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function cleanString(value) {
  if (value === undefined || value === null) return undefined;
  const text = String(value).trim();
  return text || null;
}

async function resolveEmpresa(tx, { idEmpresa, empresa }) {
  const empresaId = parseId(idEmpresa);
  if (empresaId) {
    const existente = await tx.empresas.findUnique({ where: { id: empresaId } });
    return existente ? { id: existente.id, nome: existente.nome } : null;
  }

  const nome = cleanString(empresa);
  if (!nome) {
    return null;
  }

  const existente = await tx.empresas.findFirst({
    where: { nome: { equals: nome, mode: "insensitive" } },
  });

  if (existente) {
    return { id: existente.id, nome: existente.nome };
  }

  const criada = await tx.empresas.create({
    data: {
      nome,
      status: "Ativa",
    },
  });

  return { id: criada.id, nome: criada.nome };
}

class VisitanteController {
  static async criar(req, res) {
    try {
      const {
        nome,
        cpf,
        celular,
        telefone,
        email,
        idEmpresa,
        empresa,
        idSetor,
        motivo,
        validade,
        descricao,
      } = req.body;

      const nomeLimpo = cleanString(nome);
      const cpfLimpo = cleanString(cpf);
      const emailLimpo = cleanString(email)?.toLowerCase();
      const celularLimpo = cleanString(celular || telefone);
      const setorId = parseId(idSetor);

      if (!nomeLimpo || !cpfLimpo || !emailLimpo || !setorId) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "nome, cpf, email e idSetor sao obrigatorios",
        });
      }

      const resultado = await prisma.$transaction(async (tx) => {
        const setor = await tx.setores.findUnique({ where: { id: setorId } });
        if (!setor) {
          throw new Error("Setor nao encontrado");
        }

        const empresaResolvida = await resolveEmpresa(tx, { idEmpresa, empresa });
        const usuarioExistente = await tx.usuario.findFirst({
          where: {
            OR: [
              { cpf: cpfLimpo },
              { email: emailLimpo },
            ],
          },
          include: { funcionarios: true },
        });

        if (usuarioExistente?.funcionarios?.length > 0) {
          throw new Error("O CPF ou email informado pertence a um funcionario");
        }

        const userData = {
          nome: nomeLimpo,
          cpf: cpfLimpo,
          email: emailLimpo,
          celular: celularLimpo,
          idEmpresa: empresaResolvida?.id || null,
        };

        const usuario = usuarioExistente
          ? await tx.usuario.update({
              where: { id: usuarioExistente.id },
              data: userData,
            })
          : await tx.usuario.create({ data: userData });

        const requisicao = await tx.requisicaoDeVisita.create({
          data: {
            idUsuario: usuario.id,
            idSetor: setorId,
            motivo: motivo ? normalizeMotivoVisita(motivo) : null,
            validade: validade ? new Date(validade) : null,
            descricao: cleanString(descricao) || null,
            empresa: empresaResolvida?.nome || cleanString(empresa) || null,
            status: STATUS_REQUISICAO.PENDENTE,
          },
          include: {
            usuario: true,
            setores: true,
          },
        });

        return { usuario, requisicao };
      });

      return res.status(201).json({
        sucesso: true,
        mensagem: "Visitante e requisicao criados com sucesso",
        data: resultado,
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao criar visitante",
        erro: e.message,
      });
    }
  }
}

export default VisitanteController;
