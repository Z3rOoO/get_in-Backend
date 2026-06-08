import { prisma } from "../config/prisma.js";
import { errorResponse } from "../config/http.js";
import { registerDeviceLog } from "../services/logService.js";

class LogsController {
  static async Read(req, res) {
    try {
      const logs = await prisma.log.findMany();
      return res.status(200).json({
        sucesso: true,
        mensagem: "Logs lidas com sucesso",
        data: logs,
      });
    } catch (error) {
      return errorResponse(res, 500, "Erro ao ler os Logs", error);
    }
  }

  static async Create(req, res) {
    try {
      const { idDispositivo, idUsuario, dataDeEntrada, dataDeSaida } = req.body;

      if (!idDispositivo || !idUsuario) {
        return res.status(400).json({
          sucesso: false,
          mensagem: "idDispositivo e idUsuario sao obrigatorios",
        });
      }

      const result = await prisma.log.create({
        data: {
          idDispositivo: Number(idDispositivo),
          idUsuario: Number(idUsuario),
          dataDeEntrada: dataDeEntrada ? new Date(dataDeEntrada) : new Date(),
          dataDeSaida: dataDeSaida ? new Date(dataDeSaida) : null,
        },
      });

      return res.status(201).json({
        sucesso: true,
        mensagem: "Log criado com sucesso",
        data: result,
      });
    } catch (error) {
      return errorResponse(res, 500, "Erro ao criar a log", error);
    }
  }

  static async Update(req, res) {
    try {
      const { id } = req.params;
      const { idDispositivo, idUsuario, dataDeEntrada, dataDeSaida } = req.body;

      const result = await prisma.log.update({
        where: { id: Number(id) },
        data: {
          idDispositivo: idDispositivo ? Number(idDispositivo) : undefined,
          idUsuario: idUsuario ? Number(idUsuario) : undefined,
          dataDeEntrada: dataDeEntrada ? new Date(dataDeEntrada) : undefined,
          dataDeSaida: dataDeSaida ? new Date(dataDeSaida) : undefined,
        },
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Log atualizado com sucesso",
        data: result,
      });
    } catch (error) {
      return errorResponse(res, 500, "Erro ao atualizar a log", error);
    }
  }

  static async Delete(req, res) {
    try {
      const { id } = req.params;

      await prisma.log.delete({
        where: { id: Number(id) },
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Log deletado com sucesso",
      });
    } catch (error) {
      return errorResponse(res, 500, "Erro ao deletar a log", error);
    }
  }

  static async ReadByUser(req, res) {
    try {
      const { idUsuario } = req.params;

      const logs = await prisma.log.findMany({
        where: {
          idUsuario: Number(idUsuario),
        },
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Logs lidas com sucesso",
        data: logs,
      });
    } catch (error) {
      return errorResponse(res, 500, "Erro ao ler os logs", error);
    }
  }

  static async ReadByDevice(req, res) {
    try {
      const { idDispositivo } = req.params;

      const logs = await prisma.log.findMany({
        where: {
          idDispositivo: Number(idDispositivo),
        },
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Logs lidas com sucesso",
        data: logs,
      });
    } catch (error) {
      return errorResponse(res, 500, "Erro ao ler os logs", error);
    }
  }

  static async ReadById(req, res) {
    try {
      const { id } = req.params;

      const log = await prisma.log.findUnique({
        where: { id: Number(id) },
      });

      if (!log) {
        return res.status(404).json({
          sucesso: false,
          mensagem: "Log nao encontrado",
        });
      }

      return res.status(200).json({
        sucesso: true,
        mensagem: "Log lida com sucesso",
        data: log,
      });
    } catch (error) {
      return errorResponse(res, 500, "Erro ao ler a log", error);
    }
  }

  static async dispLog(req, res) {
    try {
      const result = await registerDeviceLog(req.body);

      return res.status(201).json({
        sucesso: true,
        mensagem: result.action === "saida" ? "Log atualizado com sucesso" : "Criado log com sucesso",
        data: result.log,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      const message = statusCode === 500 ? "Erro interno do servidor" : error.message;
      return errorResponse(res, statusCode, message, error);
    }
  }
}

export default LogsController;
