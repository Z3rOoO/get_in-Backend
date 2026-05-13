SELECT
  u.id AS usuario_id,
  u.nome AS usuario_nome,
  u.email,
  u.cpf,
  u.celular,
  f.tipo AS cargo,
  f."dataDeNascimento",
  f.imagem AS foto_perfil,
  d.nome AS departamento_nome,
  u."dataDeCriacao"
FROM
  (
    (
      usuarios u
      LEFT JOIN funcionarios f ON ((u.id = f."idUsuario"))
    )
    LEFT JOIN setores d ON ((f."idSetor" = d.id))
  );