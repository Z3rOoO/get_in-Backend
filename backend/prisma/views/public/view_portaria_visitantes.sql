SELECT
  u.id,
  u.nome,
  e.nome AS empresa,
  l."dataDeEntrada" AS entrada,
  u.celular,
  u.email,
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
          usuarios u
          LEFT JOIN funcionarios f ON ((u.id = f."idUsuario"))
        )
        LEFT JOIN empresas e ON ((u."idEmpresa" = e.id))
      )
      LEFT JOIN LOGS l ON ((l."idUsuario" = u.id))
    )
    LEFT JOIN dispositivos d ON ((l."idDispositivo" = d.id))
  )
WHERE
  (
    (f."idUsuario" IS NULL)
    AND (d.id = 10)
  )
ORDER BY
  l."dataDeEntrada" DESC;