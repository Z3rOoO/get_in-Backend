CREATE TABLE IF NOT EXISTS "preferencias_usuarios" (
  "id" SERIAL PRIMARY KEY,
  "idUsuario" INTEGER NOT NULL UNIQUE,
  "valor" JSONB NOT NULL,
  "dataDeCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dataDeAtualizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "preferencias_usuarios_idUsuario_fkey"
    FOREIGN KEY ("idUsuario")
    REFERENCES "usuarios"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);
