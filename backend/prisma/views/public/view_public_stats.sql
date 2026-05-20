SELECT
  (
    SELECT
      count(*) AS count
    FROM
      LOGS
    WHERE
      ((LOGS."dataDeEntrada") :: date = CURRENT_DATE)
  ) AS visitas_hoje,
  (
    SELECT
      count(DISTINCT s.id) AS count
    FROM
      (
        (
          setores s
          LEFT JOIN dispositivos d ON ((s.id = d."idSetor"))
        )
        LEFT JOIN requisicoes_de_visitas rv ON ((s.id = rv."idSetor"))
      )
    WHERE
      (
        (d.id IS NOT NULL)
        OR ((rv."dataDaRequisicao") :: date = CURRENT_DATE)
      )
  ) AS setores_ativos,
  (
    SELECT
      CASE
        WHEN (count(*) = 0) THEN (100) :: numeric
        ELSE round(
          (
            ((count(LOGS."dataDeSaida")) :: numeric * 100.0) / (count(*)) :: numeric
          ),
          2
        )
      END AS round
    FROM
      LOGS
    WHERE
      ((LOGS."dataDeEntrada") :: date = CURRENT_DATE)
  ) AS taxa_rastreabilidade;