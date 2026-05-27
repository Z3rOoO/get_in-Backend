CREATE TABLE IF NOT EXISTS "crachas" (
  "id" SERIAL NOT NULL,
  "status" "StatusCracha" NOT NULL DEFAULT 'disponivel',

  CONSTRAINT "crachas_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "crachas" ADD COLUMN IF NOT EXISTS "idUsuario" INTEGER;
ALTER TABLE "crachas" ADD COLUMN IF NOT EXISTS "codigoTag" VARCHAR(100);
ALTER TABLE "crachas" ADD COLUMN IF NOT EXISTS "temporario" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "crachas" ADD COLUMN IF NOT EXISTS "validade" TIMESTAMP(3);
ALTER TABLE "crachas" ADD COLUMN IF NOT EXISTS "dataDeCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "crachas" ADD COLUMN IF NOT EXISTS "dataDeAtualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "crachas" ADD COLUMN IF NOT EXISTS "dataDeDevolucao" TIMESTAMP(6);

UPDATE "crachas"
SET "codigoTag" = CONCAT('LEGACY-', "id")
WHERE "codigoTag" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "crachas_codigoTag_key" ON "crachas"("codigoTag");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'crachas_idUsuario_fkey'
  ) THEN
    ALTER TABLE "crachas"
      ADD CONSTRAINT "crachas_idUsuario_fkey"
      FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "crachas" ALTER COLUMN "codigoTag" SET NOT NULL;
