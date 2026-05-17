SELECT
  u.nome,
  e.nome AS empresas,
  s.nome AS setores,
  r.motivo,
  r.status AS solicitacao
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
  );