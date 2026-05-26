ALTER TABLE "empresas"
  ADD COLUMN IF NOT EXISTS "cnpj" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "responsavel" VARCHAR(150),
  ADD COLUMN IF NOT EXISTS "contato" VARCHAR(150),
  ADD COLUMN IF NOT EXISTS "celular" VARCHAR(20),
  ADD COLUMN IF NOT EXISTS "categoria" VARCHAR(100),
  ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) DEFAULT 'Ativa';

CREATE TABLE IF NOT EXISTS "permissoes_config" (
  "id" SERIAL PRIMARY KEY,
  "chave" VARCHAR(80) NOT NULL UNIQUE,
  "valor" JSONB NOT NULL,
  "dataDeCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dataDeAtualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DROP VIEW IF EXISTS "view_gestores";

CREATE VIEW "view_gestores" AS
SELECT
  f.id,
  u.id AS "idUsuario",
  u.nome AS gestor
FROM usuarios u
LEFT JOIN funcionarios f ON f."idUsuario" = u.id
WHERE f.tipo = 'ger'::"TipoFuncionario";
