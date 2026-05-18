WITH visitantes_logs AS (
  SELECT
    u.id,
    u.nome,
    e.nome AS empresa,
    l.id AS log_id,
    l."dataDeEntrada" AS entrada,
    l."dataDeSaida" AS saida,
    u.celular,
    u.email,
    CASE
      WHEN (l."dataDeEntrada" IS NULL) THEN 'Pendente' :: text
      WHEN (l."dataDeSaida" IS NULL) THEN 'Dentro' :: text
      ELSE 'Saida' :: text
    END AS status,
    ROW_NUMBER() OVER (
      PARTITION BY u.id
      ORDER BY
        COALESCE(l."dataDeSaida", l."dataDeEntrada") DESC NULLS LAST,
        l.id DESC
    ) AS ordem
  FROM
    usuarios u
    LEFT JOIN funcionarios f ON ((u.id = f."idUsuario"))
    LEFT JOIN empresas e ON ((u."idEmpresa" = e.id))
    LEFT JOIN logs l ON ((l."idUsuario" = u.id))
    LEFT JOIN dispositivos d ON ((l."idDispositivo" = d.id))
  WHERE
    (
      (f."idUsuario" IS NULL)
      AND (d.id = 10)
    )
)
SELECT
  id,
  nome,
  empresa,
  entrada,
  celular,
  email,
  status
FROM
  visitantes_logs
WHERE
  ordem = 1
ORDER BY
  COALESCE(saida, entrada) DESC NULLS LAST,
  log_id DESC;
