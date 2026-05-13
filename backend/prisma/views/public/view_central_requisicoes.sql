SELECT
  requisicoes_de_acessos.id,
  requisicoes_de_acessos."idUsuario",
  requisicoes_de_acessos."idSetor" AS "idDepartamento",
  requisicoes_de_acessos.status,
  requisicoes_de_acessos."dataDaRequisicao",
  'Acesso Interno' :: text AS tipo_requisicao,
  NULL :: character varying AS empresa_visitante,
  NULL :: timestamp without time zone AS validade_visita
FROM
  requisicoes_de_acessos
UNION
ALL
SELECT
  requisicoes_de_visitas.id,
  requisicoes_de_visitas."idUsuario",
  requisicoes_de_visitas."idSetor" AS "idDepartamento",
  requisicoes_de_visitas.status,
  requisicoes_de_visitas."dataDaRequisicao",
  'Visita Externa' :: text AS tipo_requisicao,
  requisicoes_de_visitas.empresa AS empresa_visitante,
  requisicoes_de_visitas.validade AS validade_visita
FROM
  requisicoes_de_visitas;