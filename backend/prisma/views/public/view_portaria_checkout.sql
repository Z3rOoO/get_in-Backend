SELECT
  l.id AS log_id,
  u.id AS usuario_id,
  u.nome AS visitante_nome,
  u.cpf AS visitante_cpf,
  t."codigoTag" AS tag_para_recolher,
  t.id AS tag_id,
  l."dataDeEntrada" AS horario_entrada,
  rv.empresa AS empresa_visitada,
  s.nome AS setor_visitado
FROM
  (
    (
      (
        (
          LOGS l
          JOIN usuarios u ON ((l."idUsuario" = u.id))
        )
        JOIN tags t ON ((u.id = t."idUsuario"))
      )
      JOIN requisicoes_de_visitas rv ON ((u.id = rv."idUsuario"))
    )
    JOIN setores s ON ((rv."idSetor" = s.id))
  )
WHERE
  (
    (l."dataDeSaida" IS NULL)
    AND (t.status = 'emUso' :: "StatusCracha")
  )
ORDER BY
  l."dataDeEntrada";