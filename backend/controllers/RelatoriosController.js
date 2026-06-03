import { prisma } from "../config/prisma.js";

const TZ = "America/Sao_Paulo";
const ALERTA_HORAS = 8;
const STATUS_VALIDOS = new Set(["todos", "em_andamento", "finalizado", "alerta"]);

const STATUS_LABEL = {
  em_andamento: "Em andamento",
  finalizado: "Finalizado",
  alerta: "Alerta",
};

const STATUS_COLOR = {
  em_andamento: "#f59e0b",
  finalizado: "#34a853",
  alerta: "#ef4444",
};

const STATUS_RANK_ORDER = ["em_andamento", "finalizado", "alerta"];
const EMPRESA_PLACEHOLDERS = new Set(["sem empresa", "equipe interna", "nao informado"]);

const TIPO_COLOR = {
  Visitante: "#0f3a7d",
  Funcionario: "#34a853",
};

function parseDateParam(value, { endExclusive = false } = {}) {
  const text = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;

  const [year, month, day] = text.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return null;
  if (endExclusive) date.setDate(date.getDate() + 1);

  return date;
}

function parseDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function pickFirst(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== "") || "";
}

function isEmpresaAtiva(empresa) {
  const status = normalizeText(empresa?.status || "Ativa");
  return status === "ativa" || status === "ativo";
}

function isEmpresaContabilizavel(value) {
  const empresa = normalizeText(value);
  return empresa && !EMPRESA_PLACEHOLDERS.has(empresa);
}

function formatDuration(ms) {
  if (!ms || ms < 0) return "-";
  const minutes = Math.round(ms / 60000);
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours}h ${rest}m` : `${rest}m`;
}

function formatDateKey(date) {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function formatDateLabel(date) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function formatHourKey(date) {
  return `${String(date.getHours()).padStart(2, "0")}h`;
}

function getStatus({ entrada, saida }, now = new Date()) {
  if (saida) return "finalizado";
  if (!entrada) return "em_andamento";

  const horas = (now - entrada) / (1000 * 60 * 60);
  return horas >= ALERTA_HORAS ? "alerta" : "em_andamento";
}

function normalizeLog(log, now = new Date()) {
  const usuario = log.usuario || {};
  const funcionario = usuario.funcionarios?.[0] || null;
  const setorFuncionario = funcionario?.setores_funcionarios_idSetorTosetores?.nome;
  const entrada = parseDate(log.dataDeEntrada);
  const saida = parseDate(log.dataDeSaida);
  const status = getStatus({ entrada, saida }, now);
  const fimPermanencia = saida || (entrada ? now : null);
  const permanenciaMs = entrada && fimPermanencia ? fimPermanencia - entrada : 0;
  const tipo = funcionario ? "Funcionario" : "Visitante";
  const setor = pickFirst(log.dispositivo?.setores?.nome, setorFuncionario, log.dispositivo?.local, "Nao informado");
  const empresa = pickFirst(usuario.empresas?.nome, funcionario ? "Equipe interna" : "Sem empresa");

  return {
    id: log.id,
    idUsuario: log.idUsuario,
    visitante: pickFirst(usuario.nome, "Usuario"),
    cpf: usuario.cpf || "",
    email: usuario.email || "",
    empresa,
    setor,
    local: log.dispositivo?.local || setor,
    tipo,
    entrada: entrada ? entrada.toISOString() : null,
    saida: saida ? saida.toISOString() : null,
    permanenciaMinutos: permanenciaMs > 0 ? Math.round(permanenciaMs / 60000) : 0,
    permanencia: formatDuration(permanenciaMs),
    status,
    statusLabel: STATUS_LABEL[status] || status,
  };
}

function matchesSearch(registro, busca) {
  if (!busca) return true;

  const haystack = [
    registro.visitante,
    registro.cpf,
    registro.email,
    registro.empresa,
    registro.setor,
    registro.local,
    registro.tipo,
    registro.statusLabel,
  ]
    .map(normalizeText)
    .join(" ");

  return haystack.includes(normalizeText(busca));
}

function matchesFilter(registro, filters) {
  const setor = normalizeText(filters.setor);
  const empresa = normalizeText(filters.empresa);
  const status = STATUS_VALIDOS.has(filters.status) ? filters.status : "todos";

  if (setor && normalizeText(registro.setor) !== setor) return false;
  if (empresa && normalizeText(registro.empresa) !== empresa) return false;
  if (status !== "todos" && registro.status !== status) return false;

  return matchesSearch(registro, filters.busca);
}

function getDateWhere(inicio, fim) {
  const start = parseDateParam(inicio);
  const end = parseDateParam(fim, { endExclusive: true });
  const dataDeEntrada = {};

  if (start) dataDeEntrada.gte = start;
  if (end) dataDeEntrada.lt = end;

  return Object.keys(dataDeEntrada).length > 0 ? { dataDeEntrada } : {};
}

function sortRanking(a, b) {
  return b.visitas - a.visitas || a.nome.localeCompare(b.nome, "pt-BR");
}

function buildBaseRanking(items) {
  const map = new Map();

  items.forEach((item) => {
    const nome = pickFirst(item?.nome);
    const key = normalizeText(nome);

    if (!key || map.has(key)) return;
    map.set(key, { nome, visitas: 0 });
  });

  return map;
}

function rankSetores(registros, setoresAtivos) {
  const map = buildBaseRanking(setoresAtivos);

  registros.forEach((registro) => {
    const key = normalizeText(registro.setor);
    const current = map.get(key);

    if (!current) return;
    current.visitas += 1;
  });

  return [...map.values()].sort(sortRanking);
}

async function rankEmpresas(empresasAtivas) {
  const ids = empresasAtivas.map((empresa) => empresa.id).filter(Boolean);

  if (ids.length === 0) return [];

  const empresas = await prisma.empresas.findMany({
    where: { id: { in: ids } },
    include: {
      usuarios: {
        where: {
          funcionarios: {
            none: {},
          },
        },
        select: {
          id: true,
          logs: {
            where: {
              dataDeEntrada: {
                not: null,
              },
            },
            orderBy: [{ dataDeEntrada: "desc" }, { id: "desc" }],
            take: 1,
            select: {
              dataDeEntrada: true,
            },
          },
        },
      },
    },
  });

  return empresas
    .map((empresa) => {
      const ultimoAcesso = empresa.usuarios
        .flatMap((usuario) => usuario.logs || [])
        .map((log) => parseDate(log.dataDeEntrada))
        .filter(Boolean)
        .sort((a, b) => b - a)[0];

      return {
        nome: empresa.nome,
        visitantes: empresa.usuarios.length,
        visitas: empresa.usuarios.length,
        ultimoAcessoTimestamp: ultimoAcesso?.getTime() || 0,
        ultimoAcesso: ultimoAcesso ? ultimoAcesso.toISOString() : null,
      };
    })
    .sort((a, b) => {
      const visitasDiff = b.visitas - a.visitas;
      if (visitasDiff !== 0) return visitasDiff;

      const ultimoAcessoDiff = (b.ultimoAcessoTimestamp || 0) - (a.ultimoAcessoTimestamp || 0);
      if (ultimoAcessoDiff !== 0) return ultimoAcessoDiff;

      return a.nome.localeCompare(b.nome, "pt-BR");
    })
    .map((item) => ({
      nome: item.nome,
      visitas: item.visitas,
      visitantes: item.visitantes,
      ultimoAcesso: item.ultimoAcesso || null,
    }));
}

function statusDistribution(registros) {
  const map = new Map(
    STATUS_RANK_ORDER.map((status) => [
      status,
      { name: STATUS_LABEL[status] || status, value: 0, color: STATUS_COLOR[status] || "#0f3a7d" },
    ])
  );

  registros.forEach((registro) => {
    const current = map.get(registro.status);
    if (current) current.value += 1;
  });

  return STATUS_RANK_ORDER.map((status) => map.get(status));
}

function distribution(registros, key, labels = {}, colors = {}) {
  const map = new Map();

  registros.forEach((registro) => {
    const raw = registro[key] || "Nao informado";
    const name = labels[raw] || raw;
    const current = map.get(raw) || { name, value: 0, color: colors[raw] || "#0f3a7d" };
    current.value += 1;
    map.set(raw, current);
  });

  return [...map.values()].sort((a, b) => b.value - a.value);
}

function buildSeriesPorHora(registros) {
  const map = new Map(Array.from({ length: 24 }, (_, hour) => [`${String(hour).padStart(2, "0")}h`, 0]));

  registros.forEach((registro) => {
    const entrada = parseDate(registro.entrada);
    if (!entrada) return;
    const key = formatHourKey(entrada);
    map.set(key, (map.get(key) || 0) + 1);
  });

  return [...map.entries()].map(([hora, value]) => ({ hora, value }));
}

function buildSeriesPorDia(registros, inicio, fim) {
  const map = new Map();
  const start = parseDateParam(inicio);
  const endInclusive = parseDateParam(fim);

  if (start && endInclusive) {
    const cursor = new Date(start);
    const maxDays = 62;
    let count = 0;

    while (cursor <= endInclusive && count < maxDays) {
      const key = formatDateKey(cursor);
      map.set(key, { data: key, hora: formatDateLabel(cursor), value: 0 });
      cursor.setDate(cursor.getDate() + 1);
      count += 1;
    }
  }

  registros.forEach((registro) => {
    const entrada = parseDate(registro.entrada);
    if (!entrada) return;
    const key = formatDateKey(entrada);
    const current = map.get(key) || { data: key, hora: formatDateLabel(entrada), value: 0 };
    current.value += 1;
    map.set(key, current);
  });

  return [...map.values()].sort((a, b) => a.data.localeCompare(b.data));
}

function getResumo(registros, empresasAtivas = []) {
  const total = registros.length;
  const saidas = registros.filter((registro) => registro.saida).length;
  const dentro = registros.filter((registro) => ["em_andamento", "alerta"].includes(registro.status)).length;
  const alertas = registros.filter((registro) => registro.status === "alerta").length;
  const empresasAtivasSet = new Set(empresasAtivas.map((empresa) => normalizeText(empresa.nome)).filter(Boolean));
  const empresasAcessadas = new Set();
  const duracoesFinalizadas = registros
    .filter((registro) => registro.saida && registro.permanenciaMinutos > 0)
    .map((registro) => registro.permanenciaMinutos);
  const mediaMinutos =
    duracoesFinalizadas.length > 0
      ? Math.round(duracoesFinalizadas.reduce((sum, value) => sum + value, 0) / duracoesFinalizadas.length)
      : 0;

  registros.forEach((registro) => {
    const empresa = normalizeText(registro.empresa);

    if (!isEmpresaContabilizavel(registro.empresa)) return;
    if (empresasAtivasSet.size > 0 && !empresasAtivasSet.has(empresa)) return;

    empresasAcessadas.add(empresa);
  });

  return {
    totalAcessos: total,
    entradas: total,
    saidas,
    dentro,
    taxaCheckout: total > 0 ? Math.round((saidas / total) * 100) : 0,
    tempoMedioMinutos: mediaMinutos,
    tempoMedio: mediaMinutos > 0 ? formatDuration(mediaMinutos * 60000) : "-",
    alertas,
    empresasAcessadas: empresasAcessadas.size,
  };
}

async function getFiltrosDisponiveis(registros) {
  const [setores, empresas] = await Promise.all([
    prisma.setores.findMany({
      select: { nome: true },
      orderBy: { nome: "asc" },
    }),
    prisma.empresas.findMany({
      select: { nome: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  const setoresSet = new Set([
    ...setores.map((setor) => setor.nome).filter(Boolean),
    ...registros.map((registro) => registro.setor).filter(Boolean),
  ]);
  const empresasSet = new Set([
    ...empresas.map((empresa) => empresa.nome).filter(Boolean),
    ...registros.map((registro) => registro.empresa).filter(Boolean),
  ]);

  return {
    setores: [...setoresSet].sort((a, b) => a.localeCompare(b)),
    empresas: [...empresasSet].sort((a, b) => a.localeCompare(b)),
  };
}

class RelatoriosController {
  static async acessos(req, res) {
    try {
      const { inicio, fim, busca = "", setor = "", empresa = "", status = "todos" } = req.query || {};
      const normalizedStatus = STATUS_VALIDOS.has(String(status)) ? String(status) : "todos";
      const [logs, setoresAtivos, empresasCatalogo] = await Promise.all([
        prisma.log.findMany({
          where: getDateWhere(inicio, fim),
          include: {
            usuario: {
              include: {
                empresas: true,
                funcionarios: {
                  include: {
                    setores_funcionarios_idSetorTosetores: true,
                  },
                },
              },
            },
            dispositivo: {
              include: {
                setores: true,
              },
            },
          },
          orderBy: [{ dataDeEntrada: "desc" }, { id: "desc" }],
        }),
        prisma.setores.findMany({
          where: { status: "Ativo" },
          select: { nome: true },
          orderBy: { nome: "asc" },
        }),
        prisma.empresas.findMany({
          select: { id: true, nome: true, status: true },
          orderBy: { nome: "asc" },
        }),
      ]);

      const empresasAtivas = empresasCatalogo.filter(isEmpresaAtiva);
      const normalized = logs.map((log) => normalizeLog(log));
      const registros = normalized.filter((registro) =>
        matchesFilter(registro, {
          busca,
          setor,
          empresa,
          status: normalizedStatus,
        })
      );
      const filtrosDisponiveis = await getFiltrosDisponiveis(normalized);

      return res.status(200).json({
        sucesso: true,
        data: {
          resumo: getResumo(registros, empresasAtivas),
          series: {
            porDia: buildSeriesPorDia(registros, inicio, fim),
            porHora: buildSeriesPorHora(registros),
          },
          rankings: {
            setores: rankSetores(registros, setoresAtivos),
            empresas: await rankEmpresas(empresasAtivas),
            status: statusDistribution(registros),
            tipos: distribution(registros, "tipo", {}, TIPO_COLOR),
          },
          registros,
          filtrosDisponiveis,
        },
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao gerar relatorio de acessos",
        erro: e.message,
      });
    }
  }
}

export default RelatoriosController;
