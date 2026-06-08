export class ServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "ServiceError";
    this.statusCode = statusCode;
  }
}

function parsePositiveInteger(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new ServiceError(`${fieldName} invalido`, 400);
  }

  return parsed;
}

function parseEventDate(value) {
  if (!value) {
    return new Date();
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new ServiceError("Data do log invalida", 400);
  }

  return date;
}

async function getDefaultClient() {
  const { prisma } = await import("../config/prisma.js");
  return prisma;
}

export async function registerDeviceLog(payload, client = null) {
  const db = client || await getDefaultClient();
  const idDispositivo = parsePositiveInteger(payload?.idDispositivo, "idDispositivo");
  const idUsuario = parsePositiveInteger(payload?.idUsuario, "idUsuario");
  const data = parseEventDate(payload?.data || payload?.dataDeEntrada || payload?.dataDeSaida);

  const lastLog = await db.log.findFirst({
    where: {
      idDispositivo,
      idUsuario,
    },
    orderBy: {
      id: "desc",
    },
  });

  if (!lastLog || (lastLog.dataDeEntrada && lastLog.dataDeSaida)) {
    const log = await db.log.create({
      data: {
        idDispositivo,
        idUsuario,
        dataDeEntrada: data,
        dataDeSaida: null,
      },
    });

    return { action: "entrada", log };
  }

  if (lastLog.dataDeEntrada && !lastLog.dataDeSaida) {
    const log = await db.log.update({
      where: {
        id: lastLog.id,
      },
      data: {
        dataDeSaida: data,
      },
    });

    return { action: "saida", log };
  }

  const log = await db.log.update({
    where: {
      id: lastLog.id,
    },
    data: {
      dataDeEntrada: data,
      dataDeSaida: null,
    },
  });

  return { action: "entrada", log };
}
