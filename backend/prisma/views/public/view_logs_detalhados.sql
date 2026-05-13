SELECT
  l.id AS log_id,
  u.nome AS usuario_nome,
  u.cpf AS usuario_cpf,
  disp.local AS local_dispositivo,
  l."dataDeEntrada",
  l."dataDeSaida",
  d.nome AS departamento_usuario
FROM
  (
    (
      (
        (
          LOGS l
          JOIN usuarios u ON ((l."idUsuario" = u.id))
        )
        JOIN dispositivos disp ON ((l."idDispositivo" = disp.id))
      )
      LEFT JOIN funcionarios f ON ((u.id = f."idUsuario"))
    )
    LEFT JOIN setores d ON ((f."idSetor" = d.id))
  );