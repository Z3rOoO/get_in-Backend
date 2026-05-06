SELECT
  t."codigoTag",
  u.id AS usuario_id,
  u.nome AS usuario_nome,
  c.status AS status_cracha,
  t.temporario,
  t.validade AS validade_tag,
  d.nome AS departamento_vinculado
FROM
  (
    (
      (
        (
          tags t
          JOIN usuarios u ON ((t."idUsuario" = u.id))
        )
        JOIN crachas c ON ((t."idCracha" = c.id))
      )
      LEFT JOIN funcionarios f ON ((u.id = f."idUsuario"))
    )
    LEFT JOIN departamentos d ON ((f."idDepartamento" = d.id))
  );