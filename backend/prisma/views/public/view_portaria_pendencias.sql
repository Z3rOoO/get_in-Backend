SELECT
  min(r.id) AS id,
  array_agg(
    r.id
    ORDER BY
      r."dataDaRequisicao" DESC,
      r.id DESC
  ) AS ids,
  r."idUsuario",
  u.nome,
  u.cpf,
  COALESCE(max((r.empresa) :: text), max((e.nome) :: text)) AS empresa,
  string_agg(
    DISTINCT (s.nome) :: text,
    ', ' :: text
    ORDER BY
      (s.nome) :: text
  ) AS setor,
  max((r.motivo) :: text) AS motivo,
  string_agg(DISTINCT r.descricao, ' | ' :: text) FILTER (
    WHERE
      (r.descricao IS NOT NULL)
  ) AS descricao,
  max(r.status) AS solicitacao,
  max(r.status) AS STATUS,
  max(r."dataDaRequisicao") AS "dataDaRequisicao",
  max(r.validade) AS validade,
  u.celular,
  u.celular AS telefone,
  u.email
FROM
  (
    (
      (
        requisicoes_de_visitas r
        LEFT JOIN setores s ON ((r."idSetor" = s.id))
      )
      LEFT JOIN usuarios u ON ((r."idUsuario" = u.id))
    )
    LEFT JOIN empresas e ON ((e.id = u."idEmpresa"))
  )
WHERE
  (r.status = 'pendente' :: "StatusRequisicao")
GROUP BY
  r."idUsuario",
  u.nome,
  u.cpf,
  u.celular,
  u.email;