ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "idCracha" INTEGER;
ALTER TABLE "tags" ADD COLUMN IF NOT EXISTS "fisica" BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tags_idCracha_fkey'
  ) THEN
    ALTER TABLE "tags"
      ADD CONSTRAINT "tags_idCracha_fkey"
      FOREIGN KEY ("idCracha") REFERENCES "crachas"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

WITH real_tags AS (
  SELECT id
  FROM "tags"
  WHERE "codigoTag" !~* '^(SEED|VIRTUAL|TAG|CRACHA|TEST|TESTE|DEMO)-'
  ORDER BY "dataDeCriacao" ASC, id ASC
  LIMIT 2
)
UPDATE "tags" t
SET
  "fisica" = EXISTS (SELECT 1 FROM real_tags rt WHERE rt.id = t.id),
  "idUsuario" = CASE WHEN EXISTS (SELECT 1 FROM real_tags rt WHERE rt.id = t.id) THEN NULL ELSE t."idUsuario" END,
  "idCracha" = CASE WHEN EXISTS (SELECT 1 FROM real_tags rt WHERE rt.id = t.id) THEN NULL ELSE t."idCracha" END,
  "status" = CASE WHEN EXISTS (SELECT 1 FROM real_tags rt WHERE rt.id = t.id) THEN 'disponivel'::"StatusCracha" ELSE COALESCE(t."status", 'disponivel'::"StatusCracha") END,
  "temporario" = CASE WHEN EXISTS (SELECT 1 FROM real_tags rt WHERE rt.id = t.id) THEN false ELSE t."temporario" END,
  "validade" = CASE WHEN EXISTS (SELECT 1 FROM real_tags rt WHERE rt.id = t.id) THEN NULL ELSE t."validade" END,
  "dataDeDevolucao" = CASE WHEN EXISTS (SELECT 1 FROM real_tags rt WHERE rt.id = t.id) THEN NULL ELSE t."dataDeDevolucao" END;

INSERT INTO "crachas" (
  "idUsuario",
  "status",
  "codigoTag",
  "temporario",
  "validade",
  "dataDeCriacao",
  "dataDeAtualizacao"
)
SELECT
  u.id,
  'emUso'::"StatusCracha",
  CONCAT('VIRTUAL-U', u.id),
  false,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "usuarios" u
WHERE NOT EXISTS (
  SELECT 1 FROM "crachas" c WHERE c."idUsuario" = u.id
)
ON CONFLICT ("codigoTag") DO NOTHING;

UPDATE "crachas"
SET "status" = 'emUso'::"StatusCracha"
WHERE "idUsuario" IS NOT NULL
  AND "status" = 'disponivel'::"StatusCracha";

INSERT INTO "tags" (
  "idUsuario",
  "idCracha",
  "status",
  "codigoTag",
  "temporario",
  "fisica",
  "validade",
  "dataDeCriacao"
)
SELECT
  c."idUsuario",
  c.id,
  c."status",
  CONCAT('VIRTUAL-U', c."idUsuario"),
  false,
  false,
  NULL,
  CURRENT_TIMESTAMP
FROM "crachas" c
WHERE c."idUsuario" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "tags" t
    WHERE t."idUsuario" = c."idUsuario"
      AND t."fisica" = false
      AND t."codigoTag" = CONCAT('VIRTUAL-U', c."idUsuario")
  )
ON CONFLICT ("codigoTag") DO UPDATE
SET
  "idUsuario" = EXCLUDED."idUsuario",
  "idCracha" = EXCLUDED."idCracha",
  "status" = EXCLUDED."status",
  "temporario" = false,
  "fisica" = false,
  "validade" = NULL,
  "dataDeDevolucao" = NULL;
