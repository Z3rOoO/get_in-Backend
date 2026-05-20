SELECT
  u.id AS usuario_id,
  u.nome,
  u.cpf,
  u.email,
  e.nome AS empresa_nome,
  e.id AS empresa_id,
  rv.id AS id_requisicao_pendente,
  rv."idSetor" AS setor_destino_id,
  s.nome AS setor_destino_nome
FROM
  (
    (
      (
        usuarios u
        LEFT JOIN empresas e ON ((u."idEmpresa" = e.id))
      )
      LEFT JOIN requisicoes_de_visitas rv ON (
        (
          (u.id = rv."idUsuario")
          AND (rv.status = 'pendente' :: "StatusRequisicao")
        )
      )
    )
    LEFT JOIN setores s ON ((rv."idSetor" = s.id))
  )
ORDER BY
  u."dataDeCriacao" DESC;