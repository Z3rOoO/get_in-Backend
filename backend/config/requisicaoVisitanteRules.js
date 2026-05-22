import { prisma } from "./prisma.js";

export const STATUS_REQUISICAO = {
    PENDENTE: "pendente",
    APROVADO: "aprovado",
    RECUSADO: "recusado",
    EXPIRADO: "expirado"
};

export const MOTIVOS_VISITA = ["Visita", "Entrega", "Manutenção", "Reunião", "Outro"];

function normalizeText(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function getTodayRange(referenceDate = new Date()) {
    const start = new Date(referenceDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return { start, end };
}

export function normalizeStatusRequisicao(status) {
    const value = normalizeText(status);
    const aliases = {
        pendente: STATUS_REQUISICAO.PENDENTE,
        aguardando: STATUS_REQUISICAO.PENDENTE,
        aprovado: STATUS_REQUISICAO.APROVADO,
        aprovada: STATUS_REQUISICAO.APROVADO,
        recusado: STATUS_REQUISICAO.RECUSADO,
        recusada: STATUS_REQUISICAO.RECUSADO,
        rejeitado: STATUS_REQUISICAO.RECUSADO,
        negado: STATUS_REQUISICAO.RECUSADO,
        expirado: STATUS_REQUISICAO.EXPIRADO,
        expirada: STATUS_REQUISICAO.EXPIRADO
    };

    return aliases[value] || null;
}

export function normalizeMotivoVisita(motivo) {
    const value = normalizeText(motivo);
    const aliases = {
        visita: "Visita",
        entrega: "Entrega",
        manutencao: "Manutenção",
        reuniao: "Reunião",
        outro: "Outro"
    };

    return aliases[value] || "Outro";
}

export async function expireOldPendingVisitRequests(client = prisma) {
    const { start } = getTodayRange();

    return client.requisicaoDeVisita.updateMany({
        where: {
            status: STATUS_REQUISICAO.PENDENTE,
            dataDaRequisicao: {
                lt: start
            }
        },
        data: {
            status: STATUS_REQUISICAO.EXPIRADO
        }
    });
}
