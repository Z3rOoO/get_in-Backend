WITH requisicoes_aprovadas AS (
  SELECT
    rv."idUsuario",
    max(rv.id) AS "idRequisicao",
    max((rv.motivo) :: text) AS motivo,
    string_agg(DISTINCT rv.descricao, ' | ' :: text) FILTER (
      WHERE
        (rv.descricao IS NOT NULL)
    ) AS descricao,
    COALESCE(max((rv.empresa) :: text), max((e_1.nome) :: text)) AS empresa,
    string_agg(
      DISTINCT (s.nome) :: text,
      ', ' :: text
      ORDER BY
        (s.nome) :: text
    ) AS setor,
    max(rv."dataDaRequisicao") AS "dataDaRequisicao"
  FROM
    (
      (
        (
          requisicoes_de_visitas rv
          LEFT JOIN setores s ON ((s.id = rv."idSetor"))
        )
        LEFT JOIN usuarios u_1 ON ((u_1.id = rv."idUsuario"))
      )
      LEFT JOIN empresas e_1 ON ((e_1.id = u_1."idEmpresa"))
    )
  WHERE
    (rv.status = 'aprovado' :: "StatusRequisicao")
  GROUP BY
    rv."idUsuario"
),
ultimos_logs AS (
  SELECT
    l.id,
    l."idDispositivo",
    l."idUsuario",
    l."dataDeEntrada",
    l."dataDeSaida",
    row_number() OVER (
      PARTITION BY l."idUsuario"
      ORDER BY
        COALESCE(l."dataDeSaida", l."dataDeEntrada") DESC NULLS LAST,
        l.id DESC
    ) AS ordem
  FROM
    LOGS l
)
SELECT
  u.id,
  u.nome,
  u.cpf,
  COALESCE(ra.empresa, (e.nome) :: text) AS empresa,
  ra.setor,
  ra."idRequisicao",
  ra.motivo,
  ra.descricao,
  ul.id AS "idLog",
  ul."dataDeEntrada" AS entrada,
  ul."dataDeEntrada" AS "dataEntrada",
  ul."dataDeSaida" AS "dataSaida",
  u.celular,
  u.celular AS telefone,
  u.email,
  CASE
    WHEN (ul."dataDeEntrada" IS NULL) THEN 'Liberado' :: text
    WHEN (ul."dataDeSaida" IS NULL) THEN 'Dentro' :: text
    ELSE 'Saida' :: text
  END AS STATUS
FROM
  (
    (
      (
        (
          requisicoes_aprovadas ra
          JOIN usuarios u ON ((u.id = ra."idUsuario"))
        )
        LEFT JOIN funcionarios f ON ((u.id = f."idUsuario"))
      )
      LEFT JOIN empresas e ON ((u."idEmpresa" = e.id))
    )
    LEFT JOIN ultimos_logs ul ON (
      (
        (ul."idUsuario" = u.id)
        AND (ul.ordem = 1)
      )
    )
  )
WHERE
  (f."idUsuario" IS NULL)
ORDER BY
  COALESCE(
    ul."dataDeSaida",
    ul."dataDeEntrada",
    ra."dataDaRequisicao"
  ) DESC NULLS LAST,
  ra."idRequisicao" DESC;