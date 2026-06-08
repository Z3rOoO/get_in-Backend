import { prisma } from "../config/prisma.js";
import { errorResponse } from "../config/http.js";
import { publishDeviceMessage } from "../config/mqtt.js";
import { verifyDeviceAccess } from "../services/deviceAccessService.js";

function parseOptionalNumber(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
}

class DispositivosController {
  static async Create(req, res) {
    try {
      const { idDepartamento, idDep, idSetor, local, dataManutencao } = req.body;

      const result = await prisma.dispositivo.create({
        data: {
          idDep: parseOptionalNumber(idDep || idDepartamento) || 1,
          idSetor: parseOptionalNumber(idSetor) || null,
          local,
          dataManutencao: dataManutencao ? new Date(dataManutencao) : null,
        },
      });

      return res.status(201).json({
        sucesso: true,
        mensagem: "Dispositivo cadastrado com sucesso",
        data: result,
      });
    } catch (error) {
      return errorResponse(res, 500, "Erro ao cadastrar o dispositivo", error);
    }
  }

  static async Update(req, res) {
    try {
      const { id } = req.params;
      const { idDepartamento, idDep, idSetor, local, dataManutencao } = req.body;
      const data = {};

      if (idDep !== undefined || idDepartamento !== undefined) {
        data.idDep = parseOptionalNumber(idDep || idDepartamento) || 1;
      }
      if (idSetor !== undefined) data.idSetor = parseOptionalNumber(idSetor) || null;
      if (local !== undefined) data.local = local;
      if (dataManutencao !== undefined) {
        data.dataManutencao = dataManutencao ? new Date(dataManutencao) : null;
      }

      const result = await prisma.dispositivo.update({
        where: { id: Number(id) },
        data,
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Dados do dispositivo atualizados",
        data: result,
      });
    } catch (error) {
      return errorResponse(res, 500, "Erro ao atualizar os dados do dispositivo", error);
    }
  }

  static async Read(req, res) {
    try {
      const dispositivos = await prisma.dispositivo.findMany();
      return res.status(200).json({
        sucesso: true,
        mensagem: "Dispositivos lidos com sucesso",
        data: dispositivos,
      });
    } catch (error) {
      return errorResponse(res, 500, "Erro ao ler dispositivos", error);
    }
  }

  static async ReadById(req, res) {
    try {
      const { id } = req.params;

      const dispositivo = await prisma.dispositivo.findUnique({
        where: { id: Number(id) },
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Dispositivo lido com sucesso",
        data: dispositivo,
      });
    } catch (error) {
      return errorResponse(res, 500, "Erro ao ler o dispositivo", error);
    }
  }

  static async ReadBySetor(req, res) {
    try {
      const { id } = req.params;

      const dispositivos = await prisma.dispositivo.findMany({
        where: {
          idSetor: Number(id),
        },
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Dispositivos encontrados com sucesso",
        data: dispositivos,
      });
    } catch (error) {
      return errorResponse(res, 500, "Erro ao encontrar dispositivos", error);
    }
  }

  static async ReadByName(req, res) {
    try {
      const { name } = req.params;

      const dispositivos = await prisma.dispositivo.findMany({
        where: {
          local: {
            contains: name,
            mode: "insensitive",
          },
        },
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Dispositivos encontrados com sucesso",
        data: dispositivos,
      });
    } catch (error) {
      return errorResponse(res, 500, "Erro ao procurar dispositivos", error);
    }
  }

  static async Delete(req, res) {
    try {
      const { id } = req.params;
      const result = await prisma.dispositivo.delete({
        where: {
          id: Number(id),
        },
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Dispositivo deletado com sucesso",
        data: result,
      });
    } catch (error) {
      return errorResponse(res, 500, "Erro ao deletar o dispositivo", error);
    }
  }

  static async verificarCracha(req, res) {
    try {
      const { id, cracha } = req.params;
      const result = await verifyDeviceAccess({
        id,
        cracha,
        publish: publishDeviceMessage,
      });

      return res.status(result.statusCode).json(result.body);
    } catch (error) {
      return errorResponse(res, 500, "erro interno", error);
    }
  }
}

export default DispositivosController;
