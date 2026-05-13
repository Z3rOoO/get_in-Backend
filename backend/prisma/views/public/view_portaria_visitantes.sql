SELECT
  u.id,
  u.nome,
  e.nome AS empresa,
  s.nome AS setor,
  l."dataDeEntrada" AS entrada,
  l."dataDeSaida" AS saida,
  CASE
    WHEN (l."dataDeEntrada" IS NULL) THEN 'Pendente' :: text
    WHEN (l."dataDeSaida" IS NULL) THEN 'Dentro' :: text
    ELSE 'Saída' :: text
  END AS STATUS
FROM
  (
    (
      (
        (
          (
            usuarios u
            LEFT JOIN funcionarios f ON ((u.id = f."idUsuario"))
          )
          LEFT JOIN empresas e ON ((u."idEmpresa" = e.id))
        )
        LEFT JOIN LOGS l ON ((l."idUsuario" = u.id))
      )
      LEFT JOIN dispositivos d ON ((l."idDispositivo" = d.id))
    )
    LEFT JOIN setores s ON ((d."idSetor" = s.id))
  )
WHERE
  (f."idUsuario" IS NULL)
ORDER BY
  l."dataDeEntrada" DESC;