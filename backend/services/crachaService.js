import { prisma } from "../config/prisma.js";

export const VIRTUAL_TAG_PREFIX = "VIRTUAL-U";

export function getVirtualTagCode(idUsuario) {
  return `${VIRTUAL_TAG_PREFIX}${idUsuario}`;
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export const includeCrachaDetalhado = {
  usuario: {
    include: {
      departamentos: true,
      empresas: true,
      funcionarios: {
        include: {
          setores_funcionarios_idSetorTosetores: true,
        },
        orderBy: { id: "asc" },
      },
      requisicoesDeVisitas: {
        include: {
          setores: true,
        },
        orderBy: { dataDaRequisicao: "desc" },
        take: 1,
      },
    },
  },
  tags: {
    orderBy: [
      { fisica: "asc" },
      { dataDeCriacao: "asc" },
      { id: "asc" },
    ],
  },
};

export async function ensureUserCracha(idUsuario, client = prisma) {
  const userId = parseId(idUsuario);
  if (!userId) {
    throw new Error("idUsuario invalido para criar cracha");
  }

  const codigoTag = getVirtualTagCode(userId);
  let cracha = await client.cracha.findFirst({
    where: { idUsuario: userId },
    orderBy: { id: "asc" },
  });

  if (!cracha) {
    cracha = await client.cracha.create({
      data: {
        idUsuario: userId,
        codigoTag,
        status: "emUso",
        temporario: false,
      },
    });
  } else if (cracha.status !== "perdido") {
    cracha = await client.cracha.update({
      where: { id: cracha.id },
      data: {
        idUsuario: userId,
        status: "emUso",
      },
    });
  }

  await client.tag.upsert({
    where: { codigoTag },
    create: {
      idUsuario: userId,
      idCracha: cracha.id,
      codigoTag,
      status: cracha.status === "perdido" ? "perdido" : "emUso",
      temporario: false,
      fisica: false,
    },
    update: {
      idUsuario: userId,
      idCracha: cracha.id,
      status: cracha.status === "perdido" ? "perdido" : "emUso",
      temporario: false,
      fisica: false,
      validade: null,
      dataDeDevolucao: null,
    },
  });

  return client.cracha.findUnique({
    where: { id: cracha.id },
    include: includeCrachaDetalhado,
  });
}
