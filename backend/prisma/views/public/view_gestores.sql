SELECT
  u.id,
  u.nome AS gestor
FROM
  (
    usuarios u
    LEFT JOIN funcionarios f ON ((f."idUsuario" = u.id))
  )
WHERE
  (f.tipo = 'ger' :: "TipoFuncionario");