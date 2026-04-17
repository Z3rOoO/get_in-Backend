-- CreateEnum
CREATE TYPE "TipoFuncionario" AS ENUM ('func', 'port', 'sup', 'ger', 'adm');

-- CreateEnum
CREATE TYPE "StatusCracha" AS ENUM ('perdido', 'emUso', 'disponivel');

-- CreateEnum
CREATE TYPE "StatusRequisicao" AS ENUM ('pendente', 'aprovado', 'recusado');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "cpf" VARCHAR(14) NOT NULL,
    "celular" VARCHAR(20),
    "email" VARCHAR(150) NOT NULL,
    "dataDeCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamentos" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "idGestor" INTEGER,
    "dataDeCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funcionarios" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "idDepartamento" INTEGER NOT NULL,
    "tipo" "TipoFuncionario" NOT NULL DEFAULT 'func',
    "dataDeNascimento" DATE,
    "imagem" VARCHAR(255),
    "senhaHash" VARCHAR(255) NOT NULL,
    "dataDeCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "funcionarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crachas" (
    "id" SERIAL NOT NULL,
    "status" "StatusCracha" NOT NULL DEFAULT 'disponivel',

    CONSTRAINT "crachas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "idCracha" INTEGER NOT NULL,
    "codigoTag" VARCHAR(100) NOT NULL,
    "temporario" BOOLEAN NOT NULL DEFAULT false,
    "validade" TIMESTAMP(3),
    "dataDeCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisicoes_de_acessos" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "idDepartamento" INTEGER NOT NULL,
    "status" "StatusRequisicao" NOT NULL DEFAULT 'pendente',
    "dataDaRequisicao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requisicoes_de_acessos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositivos" (
    "id" SERIAL NOT NULL,
    "idDepartamento" INTEGER NOT NULL,
    "local" VARCHAR(150),
    "dataManutencao" TIMESTAMP(3),
    "dataDeCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requisicoes_de_visitas" (
    "id" SERIAL NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "idDepartamento" INTEGER NOT NULL,
    "status" "StatusRequisicao" NOT NULL DEFAULT 'pendente',
    "motivo" VARCHAR(255),
    "validade" TIMESTAMP(3),
    "dataDaRequisicao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "requisicoes_de_visitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs" (
    "id" SERIAL NOT NULL,
    "idDispositivo" INTEGER NOT NULL,
    "idUsuario" INTEGER NOT NULL,
    "dataDeEntrada" TIMESTAMP(3),
    "dataDeSaida" TIMESTAMP(3),

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cpf_key" ON "usuarios"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_nome_key" ON "departamentos"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "tags_codigoTag_key" ON "tags"("codigoTag");

-- AddForeignKey
ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_idGestor_fkey" FOREIGN KEY ("idGestor") REFERENCES "funcionarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funcionarios" ADD CONSTRAINT "funcionarios_idDepartamento_fkey" FOREIGN KEY ("idDepartamento") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_idCracha_fkey" FOREIGN KEY ("idCracha") REFERENCES "crachas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisicoes_de_acessos" ADD CONSTRAINT "requisicoes_de_acessos_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisicoes_de_acessos" ADD CONSTRAINT "requisicoes_de_acessos_idDepartamento_fkey" FOREIGN KEY ("idDepartamento") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispositivos" ADD CONSTRAINT "dispositivos_idDepartamento_fkey" FOREIGN KEY ("idDepartamento") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisicoes_de_visitas" ADD CONSTRAINT "requisicoes_de_visitas_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisicoes_de_visitas" ADD CONSTRAINT "requisicoes_de_visitas_idDepartamento_fkey" FOREIGN KEY ("idDepartamento") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_idDispositivo_fkey" FOREIGN KEY ("idDispositivo") REFERENCES "dispositivos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs" ADD CONSTRAINT "logs_idUsuario_fkey" FOREIGN KEY ("idUsuario") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
