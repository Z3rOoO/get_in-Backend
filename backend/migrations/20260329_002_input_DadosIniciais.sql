-- =========================
-- USUARIOS
-- =========================
INSERT INTO usuarios (nome, cpf, celular, email)
VALUES 
('João Silva', '12345678901', '11999999999', 'joao@email.com'),
('Maria Souza', '98765432100', '11988888888', 'maria@email.com');

-- =========================
-- DEPARTAMENTO (SEM GESTOR AINDA)
-- =========================
INSERT INTO departamentos (nome)
VALUES 
('TI'),
('RH');

-- =========================
-- FUNCIONARIOS
-- =========================
INSERT INTO funcionarios (idUsuario, idDepartamento, tipo, dataDeNascimento, senhaHash)
VALUES 
(1, 1, 'ger', '1990-05-10', '123456'),
(2, 2, 'func', '1995-08-20', '123456');

-- =========================
-- ATUALIZA GESTOR (AGORA FUNCIONA)
-- =========================
UPDATE departamentos SET idGestor = 1 WHERE id = 1;
UPDATE departamentos SET idGestor = 2 WHERE id = 2;

-- =========================
-- CRACHAS
-- =========================
INSERT INTO crachas (status)
VALUES 
('disponivel'),
('emUso');

-- =========================
-- TAGS
-- =========================
INSERT INTO tags (idUsuario, idCracha, codigoTag, temporario)
VALUES 
(1, 1, 'TAG123', false),
(2, 2, 'TAG456', true);

-- =========================
-- DISPOSITIVOS
-- =========================
INSERT INTO dispositivos (idDepartamento, local)
VALUES 
(1, 'Porta Principal'),
(2, 'Entrada RH');

-- =========================
-- REQUISIÇÕES DE ACESSOS
-- =========================
INSERT INTO requisicoesDeAcessos (idUsuario, idDepartamento, status)
VALUES 
(2, 1, 'pendente'),
(1, 2, 'aprovado');

-- =========================
-- REQUISIÇÕES DE VISITA
-- =========================
INSERT INTO requisicoesDeVisitas (idUsuario, idDepartamento, status, motivo)
VALUES 
(1, 2, 'pendente', 'Visita técnica'),
(2, 1, 'aprovado', 'Reunião');

-- =========================
-- LOGS
-- =========================
INSERT INTO logs (idDispositivo, idUsuario, dataDeEntrada, dataDeSaida)
VALUES 
(1, 1, '2026-03-29 08:00:00', '2026-03-29 17:00:00'),
(2, 2, '2026-03-29 09:00:00', NULL);

