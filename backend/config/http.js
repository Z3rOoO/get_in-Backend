import { env } from "./env.js";

export function errorResponse(res, status, mensagem, error = null) {
  const payload = {
    sucesso: false,
    mensagem,
  };

  if (!env.isProduction && error) {
    payload.erro = error.message || String(error);
  }

  return res.status(status).json(payload);
}
