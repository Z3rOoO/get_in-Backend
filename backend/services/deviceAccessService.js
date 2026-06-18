import { prisma } from "../config/prisma.js";
import { registerDeviceLog } from "./logService.js";

function parsePositiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function response(statusCode, sucesso, mensagem, extra = {}) {
  return {
    statusCode,
    body: {
      sucesso,
      mensagem,
      ...extra,
    },
  };
}

function publishToDevice(publish, deviceId, message) {
  if (typeof publish !== "function") {
    return;
  }

  try {
    publish(deviceId, message);
  } catch (error) {
    console.error("Erro ao publicar resposta MQTT:", error.message);
  }
}

async function registerAccessLog(client, idDispositivo, idUsuario) {
  await registerDeviceLog({
    idDispositivo,
    idUsuario,
    data: new Date(),
  }, client);
}

export async function verifyDeviceAccess({ id, cracha, publish, client = prisma }) {
  const deviceId = parsePositiveInteger(id);
  const codigoTag = String(cracha || "").trim();

  if (!deviceId || !codigoTag) {
    publishToDevice(publish, id || "desconhecido", "false/DADOS INVALIDOS");
    return response(400, false, "DADOS INVALIDOS");
  }

  const dispositivo = await client.dispositivo.findUnique({
    where: {
      id: deviceId,
    },
    select: {
      idSetor: true,
    },
  });

  if (!dispositivo) {
    publishToDevice(publish, deviceId, "false/DP NAO VINCULADO");
    return response(404, false, "ERRO, DISPOSITIVO NAO VINCULADO");
  }

  const tag = await client.tag.findUnique({
    where: {
      codigoTag,
    },
  });

  if (deviceId == 10) {

    if (!tag) {
      publishToDevice(publish, deviceId, "true/ CRACHA  CRIADO ");

      await client.tag.create({
        data: {
          codigoTag,
          idUsuario: null,
          idCracha: null,
          status: "disponivel",
          fisica: true,
        },
      });

      return response(201, true, "CRACHA CADASTRADO NO SISTEMA");
    }

  }

  if (deviceId != 10) {
    if (!tag) {
      publishToDevice(publish, deviceId, "true/ CRACHA INVALIDO");

      await client.tag.create({
        data: {
          codigoTag,
          idUsuario: null,
          idCracha: null,
          status: "disponivel",
          fisica: true,
        },
      });

      return response(201, true, "CRACHA INVALIDO");
    }
  }


  if (tag.idUsuario == null) {
    publishToDevice(publish, deviceId, "false/NENHUM USU.CRACHA");
    return response(404, false, "NENHUM USUARIO VINCULADO AO CRACHA");
  }

  const setor = await client.setores.findFirst({
    where: {
      id: dispositivo.idSetor,
    },
  });

  if (!setor) {
    publishToDevice(publish, deviceId, "false/SETOR N VINCULADO");
    return response(404, false, "SETOR NAO VINCULADO", { mesagem: "SETOR NAO VINCULADO" });
  }

  if (setor.status === "Inativo") {
    publishToDevice(publish, deviceId, "aguarde/ SETOR INATIVO ");
    return response(200, true, "SETOR INATIVO", { mesagem: "SETOR INATIVO" });
  }

  if (setor.acesso === "Bloqueado") {
    publishToDevice(publish, deviceId, "aguarde/SETOR  BLOQUEADO");
    return response(200, true, "SETOR BLOQUEADO", { mesagem: "SETOR BLOQUEADO" });
  }

  if (setor.acesso === "Liberado") {
    await registerAccessLog(client, deviceId, tag.idUsuario);
    publishToDevice(publish, deviceId, "true/ACESSO PERMITIDO");
    return response(200, true, "ACESSO PERMITIDO", { mesagem: "ACESSO PERMITIDO" });
  }

  const funcionario = await client.funcionario.findFirst({
    where: {
      idUsuario: tag.idUsuario,
      idSetor: dispositivo.idSetor,
    },
  });

  if (funcionario != null) {
    await registerAccessLog(client, deviceId, tag.idUsuario);
    publishToDevice(publish, deviceId, "true/ACESSO PERMITIDO");
    return response(200, true, "ACESSO PERMITIDO");
  }

  const requisicao = await client.view_central_requisicoes.findFirst({
    where: {
      idDepartamento: dispositivo.idSetor,
      idUsuario: tag.idUsuario,
    },
  });

  if (requisicao?.status === "aprovado") {
    await registerAccessLog(client, deviceId, tag.idUsuario);
    publishToDevice(publish, deviceId, "true/ACESSO PERMITIDO");
    return response(200, true, "ACESSO PERMITIDO");
  }

  if (requisicao?.status === "recusado") {
    publishToDevice(publish, deviceId, "false/RECUSADO POR SUP");
    return response(200, false, "ACESSO AO DEPARTAMENTO RECUSADO PELO SUPERVISOR");
  }

  if (requisicao?.status === "pendente") {
    publishToDevice(publish, deviceId, "aguarde/AGUARD.VERIF.SUP");
    return response(200, false, "AGUARDANDO VERIFICACAO DO SUPERVISOR");
  }

  publishToDevice(publish, deviceId, "false/ ACESSO NEGADO  ");
  return response(404, false, "ACESSO NEGADO");
}
