CREATE DATABASE getIN_db;
USE getIN_db;


-- ENUMS (viram ENUM direto nas tabelas)

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    celular VARCHAR(20),
    email VARCHAR(150) NOT NULL UNIQUE,
    dataDeCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE departamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    idGestor INT ,
    dataDeCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE funcionarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    idDepartamento INT NOT NULL,
    tipo ENUM('func','port','sup','ger','adm') DEFAULT 'func',
    dataDeNascimento DATE,
    imagem VARCHAR(255),
    senhaHash VARCHAR(255) NOT NULL,
    dataDeCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE crachas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    status ENUM('perdido','emUso','disponivel') DEFAULT 'disponivel'
);

CREATE TABLE tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    idCracha INT NOT NULL,
    codigoTag VARCHAR(100) NOT NULL UNIQUE,
    temporario BOOLEAN DEFAULT FALSE,
    validade TIMESTAMP,
    dataDeCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE requisicoesDeAcessos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    idDepartamento INT NOT NULL,
    status ENUM('pendente','aprovado','recusado') DEFAULT 'pendente',
    dataDaRequisicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dispositivos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idDepartamento INT NOT NULL,
    local VARCHAR(150),
    dataManutencao TIMESTAMP,
    dataDeCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE requisicoesDeVisitas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idUsuario INT NOT NULL,
    idDepartamento INT NOT NULL,
    status ENUM('pendente','aprovado','recusado') DEFAULT 'pendente',
    motivo VARCHAR(255),
    validade TIMESTAMP,
    dataDaRequisicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    idDispositivo INT NOT NULL,
    idUsuario INT NOT NULL,
    dataDeEntrada DATETIME,
    dataDeSaida DATETIME
);

-- 🔗 FOREIGN KEYS

ALTER TABLE funcionarios
ADD CONSTRAINT fk_funcionario_usuario
FOREIGN KEY (idUsuario) REFERENCES usuarios(id);

ALTER TABLE funcionarios
ADD CONSTRAINT fk_funcionario_departamento
FOREIGN KEY (idDepartamento) REFERENCES departamentos(id);

ALTER TABLE departamentos
ADD CONSTRAINT fk_departamento_gestor
FOREIGN KEY (idGestor) REFERENCES funcionarios(id);

ALTER TABLE tags
ADD CONSTRAINT fk_tag_usuario
FOREIGN KEY (idUsuario) REFERENCES usuarios(id);

ALTER TABLE tags
ADD CONSTRAINT fk_tag_cracha
FOREIGN KEY (idCracha) REFERENCES crachas(id);

ALTER TABLE requisicoesDeAcessos
ADD CONSTRAINT fk_req_acesso_usuario
FOREIGN KEY (idUsuario) REFERENCES usuarios(id);

ALTER TABLE requisicoesDeAcessos
ADD CONSTRAINT fk_req_acesso_departamento
FOREIGN KEY (idDepartamento) REFERENCES departamentos(id);

ALTER TABLE requisicoesDeVisitas
ADD CONSTRAINT fk_req_visita_usuario
FOREIGN KEY (idUsuario) REFERENCES usuarios(id);

ALTER TABLE requisicoesDeVisitas
ADD CONSTRAINT fk_req_visita_departamento
FOREIGN KEY (idDepartamento) REFERENCES departamentos(id);

ALTER TABLE dispositivos
ADD CONSTRAINT fk_dispositivo_departamento
FOREIGN KEY (idDepartamento) REFERENCES departamentos(id);

ALTER TABLE logs
ADD CONSTRAINT fk_logs_dispositivo
FOREIGN KEY (idDispositivo) REFERENCES dispositivos(id);

ALTER TABLE logs
ADD CONSTRAINT fk_logs_usuario
FOREIGN KEY (idUsuario) REFERENCES usuarios(id);