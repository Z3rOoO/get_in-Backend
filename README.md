# 🏢 GET IN - Backend API Documentation

Documentação completa da API Backend do sistema **GET IN** para controle de acessos e gestão de visitantes em ambientes corporativos.

---

## 📋 Índice

- [Overview](#overview)
- [Stack Tecnológico](#stack-tecnológico)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Rotas da API](#rotas-da-api)
- [Modelos de Dados](#modelos-de-dados)
- [Autenticação JWT](#autenticação-jwt)
- [Códigos HTTP](#códigos-http)
- [Avisos de Segurança](#avisos-de-segurança)

---

## Overview

Sistema backend para gerenciamento de acessos, funcionários, departamentos, visitantes e dispositivos de controle em ambientes corporativos. A API fornece endpoints para:

- ✅ Autenticação de usuários
- ✅ Gerenciamento de funcionários e usuários
- ✅ Controle de departamentos
- ✅ Gestão de crachás e tags RFID
- ✅ Requisições de acesso e visitas
- ✅ Controle de dispositivos
- ✅ Sistema de logs de acessos

---

## Stack Tecnológico

| Componente | Tecnologia |
|-----------|-----------|
| **Runtime** | Node.js (v14+) |
| **Framework Web** | Express.js |
| **ORM** | Prisma |
| **Banco de Dados** | PostgreSQL |
| **Autenticação** | JWT (JSON Web Tokens) |
| **Hashing** | bcryptjs |
| **Validação** | Middleware customizado |

---

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** v14.0.0 ou superior → [Download](https://nodejs.org)
- **npm** v6.0.0 ou superior (incluído com Node.js)
- **PostgreSQL** v12.0 ou superior → [Download](https://www.postgresql.org)
- **Git** para clonar o repositório

### Verificar instalação:

```bash
node --version    # v14.0.0+
npm --version     # v6.0.0+
psql --version    # PostgreSQL 12.0+
```

---

## Instalação

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/seu-usuario/get-in-backend.git
cd get-in-backend/backend
```

### 2️⃣ Instalar dependências

```bash
npm install
```

### 3️⃣ Configurar variáveis de ambiente

Copie o arquivo de exemplo e configure:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais (veja seção [Variáveis de Ambiente](#variáveis-de-ambiente))

### 4️⃣ Criar/Migrar banco de dados

```bash
# Criar migrations do Prisma
npm run prisma:migrate

# Ou executar migrations SQL manualmente (opcional)
psql -U seu_usuario -d seu_banco < migrations/20260329_001_create_DataBase.sql
psql -U seu_usuario -d seu_banco < migrations/20260329_002_input_DadosIniciais.sql
```

### 5️⃣ Iniciar o servidor

```bash
npm start
```

O servidor estará disponível em: **http://localhost:3000**

Para verificar se está rodando:

```bash
curl http://localhost:3000/health
```

Resposta esperada:
```json
{ "message": "Server is running" }
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend/` com as seguintes variáveis:

```env
# SERVIDOR
NODE_ENV=development
PORT=3000

# BANCO DE DADOS - PostgreSQL
DATABASE_URL="postgresql://usuario:senha@localhost:5432/get_in_db"
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario
DB_PASSWORD=sua_senha
DB_NAME=get_in_db

# JWT - Autenticação
JWT_SECRET=sua_chave_secreta_super_segura_aqui
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*

# AMBIENTE
LOG_LEVEL=info
```

### Descrição das variáveis:

| Variável | Tipo | Descrição | Exemplo |
|----------|------|-----------|---------|
| `NODE_ENV` | string | Ambiente (development/production/test) | `development` |
| `PORT` | number | Porta do servidor | `3000` |
| `DATABASE_URL` | string | Connection string PostgreSQL (Prisma) | `postgresql://user:pass@localhost:5432/db` |
| `DB_HOST` | string | Host do PostgreSQL | `localhost` |
| `DB_PORT` | number | Porta do PostgreSQL | `5432` |
| `DB_USER` | string | Usuário do banco | `postgres` |
| `DB_PASSWORD` | string | Senha do banco | `senha123` |
| `DB_NAME` | string | Nome do banco | `get_in_db` |
| `JWT_SECRET` | string | Chave para assinar tokens JWT | `sua_chave_super_secreta` |
| `JWT_EXPIRES_IN` | string | Tempo de expiração do token | `7d` (7 dias) |
| `CORS_ORIGIN` | string | Origem CORS permitida | `*` (todas) ou `http://localhost:3001` |
| `LOG_LEVEL` | string | Nível de log | `info`, `debug`, `error` |

---

## Scripts Disponíveis

```bash
# Iniciar servidor em modo de desenvolvimento
npm start

# Iniciar servidor com auto-reload (nodemon)
npm run dev

# Executar migrations do Prisma
npm run prisma:migrate

# Gerar cliente Prisma
npm run prisma:generate

# Resetar banco de dados (CUIDADO: deleta tudo)
npm run prisma:reset

# Abrir Prisma Studio (interface gráfica)
npm run prisma:studio
```

---

## Estrutura do Projeto

```
backend/
├── config/                    # Configurações
│   ├── database.js           # Conexão MySQL
│   └── prisma.js             # Inicialização Prisma
├── controllers/              # Lógica de negócio
│   ├── AuthController.js
│   ├── UserController.js
│   ├── FuncController.js
│   ├── DepartamentoController.js
│   ├── CrachaController.js
│   ├── TagsController.js
│   ├── RequisicaoFuncionarioController.js
│   ├── RequisicaoVisitanteController.js
│   ├── DispositivosController.js
│   └── LogsController.js
├── middleware/               # Middlewares
│   └── AuthMiddleware.js     # Validação JWT
├── router/                   # Rotas
│   ├── AuthRouter.js
│   ├── UserRouter.js
│   ├── FuncRouter.js
│   ├── DepRouter.js
│   ├── CrachaRouter.js
│   ├── TagsRouter.js
│   ├── RequisicaoFuncRouter.js
│   ├── RequisicaoVisitanteRouter.js
│   └── DispositivosRouter.js
├── prisma/                   # Prisma ORM
│   ├── schema.prisma        # Definição de modelos
│   └── migrations/          # Histórico de migrations
├── migrations/              # SQL migrations
│   ├── 20260329_001_create_DataBase.sql
│   └── 20260329_002_input_DadosIniciais.sql
├── server.js               # Inicialização Express
├── .env.example            # Template de variáveis
├── package.json            # Dependências
└── README.md               # Este arquivo
```

---

## Rotas da API

A API está organizada em **8 módulos principais** com mais de **50 endpoints**.

### Base URL: `http://localhost:3000`

---

### 🔐 1. AUTENTICAÇÃO (`/auth`)

Endpoints para registro, login e logout de usuários.

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| POST | `/auth/` | Registrar novo usuário | ✅ Implementado |
| PUT | `/auth/login` | Fazer login (retorna JWT) | ✅ Implementado |
| PUT | `/auth/logout` | Fazer logout | ✅ Implementado |

#### 📌 POST `/auth/` - Registrar novo usuário

**Descrição:** Cria uma nova conta de usuário no sistema.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "email": "joao@example.com",
  "celular": "(11) 98765-4321"
}
```

**Response 201 (Sucesso):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "email": "joao@example.com",
  "celular": "(11) 98765-4321",
  "dataDeCriacao": "2026-04-20T10:30:00Z"
}
```

**Response 400 (Erro - Email/CPF duplicado):**
```json
{
  "error": "Email ou CPF já cadastrado",
  "code": "DUPLICATE_ENTRY"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/auth/ \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "cpf": "123.456.789-00",
    "email": "joao@example.com",
    "celular": "(11) 98765-4321"
  }'
```

---

#### 📌 PUT `/auth/login` - Fazer login

**Descrição:** Autentica usuário e retorna JWT token para requisições autenticadas.

**Request Body:**
```json
{
  "email": "joao@example.com",
  "senha": "senha123"
}
```

**Response 200 (Sucesso):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@example.com",
    "tipo": "func"
  },
  "expiresIn": "7d"
}
```

**Response 401 (Erro - Credenciais inválidas):**
```json
{
  "error": "Email ou senha incorretos",
  "code": "INVALID_CREDENTIALS"
}
```

**Exemplo cURL:**
```bash
curl -X PUT http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

---

#### 📌 PUT `/auth/logout` - Fazer logout

**Descrição:** Invalida a sessão do usuário (recomenda-se deletar token no frontend).

**Headers:**
```
Authorization: Bearer {seu_token_aqui}
```

**Response 200 (Sucesso):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

**Exemplo cURL:**
```bash
curl -X PUT http://localhost:3000/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 👥 2. USUÁRIOS (`/user`)

Gerenciamento de usuários do sistema.

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| GET | `/user/` | Listar todos os usuários | ✅ Implementado |
| GET | `/user/:id` | Buscar usuário por ID | ✅ Implementado |
| GET | `/user/name/:nome` | Buscar usuários por nome (LIKE) | ✅ Implementado |
| GET | `/user/cpf/:cpf` | Buscar usuários por CPF (LIKE) | ✅ Implementado |
| POST | `/user/` | Criar novo usuário | ✅ Implementado |
| PUT | `/user/:id` | Atualizar usuário | ✅ Implementado |
| DELETE | `/user/:id` | Deletar usuário | ✅ Implementado |

#### 📌 GET `/user/` - Listar todos os usuários

**Response 200 (Sucesso):**
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "cpf": "123.456.789-00",
    "email": "joao@example.com",
    "celular": "(11) 98765-4321",
    "dataDeCriacao": "2026-04-20T10:30:00Z"
  },
  {
    "id": 2,
    "nome": "Maria Santos",
    "cpf": "987.654.321-11",
    "email": "maria@example.com",
    "celular": "(11) 91234-5678",
    "dataDeCriacao": "2026-04-21T14:15:00Z"
  }
]
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/user/
```

---

#### 📌 GET `/user/:id` - Buscar usuário por ID

**Response 200 (Sucesso):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "email": "joao@example.com",
  "celular": "(11) 98765-4321",
  "dataDeCriacao": "2026-04-20T10:30:00Z"
}
```

**Response 404 (Não encontrado):**
```json
{
  "error": "Usuário não encontrado",
  "code": "NOT_FOUND"
}
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/user/1
```

---

#### 📌 GET `/user/name/:nome` - Buscar por nome

**Response 200 (Sucesso):**
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "cpf": "123.456.789-00",
    "email": "joao@example.com"
  }
]
```

**Exemplo cURL:**
```bash
curl -X GET "http://localhost:3000/user/name/Jo%C3%A3o"
```

---

#### 📌 POST `/user/` - Criar novo usuário

**Request Body:**
```json
{
  "nome": "Pedro Costa",
  "cpf": "111.222.333-44",
  "email": "pedro@example.com",
  "celular": "(11) 99999-8888"
}
```

**Response 201 (Criado):**
```json
{
  "id": 3,
  "nome": "Pedro Costa",
  "cpf": "111.222.333-44",
  "email": "pedro@example.com",
  "celular": "(11) 99999-8888",
  "dataDeCriacao": "2026-04-22T09:45:00Z"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/user/ \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Pedro Costa",
    "cpf": "111.222.333-44",
    "email": "pedro@example.com",
    "celular": "(11) 99999-8888"
  }'
```

---

### 💼 3. FUNCIONÁRIOS (`/func`)

Gerenciamento de funcionários com informações profissionais.

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| GET | `/func/` | Listar todos os funcionários | ✅ Implementado |
| GET | `/func/:id` | Buscar funcionário por ID | ✅ Implementado |
| GET | `/func/name/:nome` | Buscar funcionários por nome | ✅ Implementado |
| GET | `/func/cpf/:cpf` | Buscar funcionários por CPF | ✅ Implementado |
| POST | `/func/` | Criar novo funcionário | ✅ Implementado |
| PUT | `/func/:id` | Atualizar funcionário | ✅ Implementado |
| DELETE | `/func/:id` | Deletar funcionário | ✅ Implementado |

#### 📌 GET `/func/` - Listar todos os funcionários

**Response 200 (Sucesso):**
```json
[
  {
    "id": 1,
    "idUsuario": 1,
    "idDepartamento": 5,
    "tipo": "func",
    "dataDeNascimento": "1990-05-15",
    "imagem": "https://...",
    "dataDeCriacao": "2026-04-20T10:30:00Z",
    "usuario": {
      "nome": "João Silva",
      "email": "joao@example.com"
    },
    "departamento": {
      "nome": "TI"
    }
  }
]
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/func/
```

---

#### 📌 POST `/func/` - Criar novo funcionário

**Request Body:**
```json
{
  "idUsuario": 2,
  "idDepartamento": 5,
  "tipo": "func",
  "dataDeNascimento": "1992-03-20",
  "senhaHash": "hashed_password_here"
}
```

**Response 201 (Criado):**
```json
{
  "id": 2,
  "idUsuario": 2,
  "idDepartamento": 5,
  "tipo": "func",
  "dataDeNascimento": "1992-03-20",
  "dataDeCriacao": "2026-04-22T11:20:00Z"
}
```

**Valores válidos para `tipo`:** `func`, `port`, `sup`, `ger`, `adm`

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/func/ \
  -H "Content-Type: application/json" \
  -d '{
    "idUsuario": 2,
    "idDepartamento": 5,
    "tipo": "func",
    "dataDeNascimento": "1992-03-20",
    "senhaHash": "hashed_password_here"
  }'
```

---

### 🏢 4. DEPARTAMENTOS (`/dep`)

Gerenciamento de departamentos da organização.

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| GET | `/dep/` | Listar todos os departamentos | ✅ Implementado |
| GET | `/dep/:id` | Buscar departamento por ID | ✅ Implementado |
| POST | `/dep/` | Criar novo departamento | ✅ Implementado |
| PUT | `/dep/:id` | Atualizar departamento | ✅ Implementado |
| DELETE | `/dep/:id` | Deletar departamento | ✅ Implementado |

#### 📌 GET `/dep/` - Listar departamentos

**Response 200 (Sucesso):**
```json
[
  {
    "id": 1,
    "nome": "TI",
    "idGestor": 1,
    "dataDeCriacao": "2026-04-01T08:00:00Z"
  },
  {
    "id": 2,
    "nome": "Recursos Humanos",
    "idGestor": 3,
    "dataDeCriacao": "2026-04-01T08:15:00Z"
  }
]
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/dep/
```

---

#### 📌 POST `/dep/` - Criar departamento

**Request Body:**
```json
{
  "nome": "Financeiro",
  "idGestor": 5
}
```

**Response 201 (Criado):**
```json
{
  "id": 3,
  "nome": "Financeiro",
  "idGestor": 5,
  "dataDeCriacao": "2026-04-22T13:30:00Z"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/dep/ \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Financeiro",
    "idGestor": 5
  }'
```

---

### 🎫 5. CRACHÁS (`/cracha`)

Gerenciamento de crachás de acesso RFID.

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| GET | `/cracha/` | Listar todos os crachás | ✅ Implementado |
| GET | `/cracha/:id` | Buscar crachá por ID | ✅ Implementado |
| GET | `/cracha/status/:status` | Buscar por status | ✅ Implementado |
| POST | `/cracha/` | Criar novo crachá | ✅ Implementado |
| PUT | `/cracha/:id` | Atualizar crachá | ✅ Implementado |
| DELETE | `/cracha/:id` | Deletar crachá | ✅ Implementado |

**Status válidos:** `disponivel`, `emUso`, `perdido`

#### 📌 GET `/cracha/status/emUso` - Buscar por status

**Response 200 (Sucesso):**
```json
[
  {
    "id": 1,
    "status": "emUso",
    "tags": [
      {
        "id": 1,
        "codigoTag": "RF123456",
        "usuario": {
          "nome": "João Silva"
        }
      }
    ]
  }
]
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/cracha/status/emUso
```

---

#### 📌 POST `/cracha/` - Criar crachá

**Request Body:**
```json
{
  "status": "disponivel"
}
```

**Response 201 (Criado):**
```json
{
  "id": 5,
  "status": "disponivel"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/cracha/ \
  -H "Content-Type: application/json" \
  -d '{"status": "disponivel"}'
```

---

### 🏷️ 6. TAGS RFID (`/tags`)

Gerenciamento de tags RFID vinculadas a crachás.

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| GET | `/tags/` | Listar todas as tags | ✅ Implementado |
| GET | `/tags/:id` | Buscar tag por ID | ✅ Implementado |
| POST | `/tags/` | Criar nova tag | ✅ Implementado |
| PUT | `/tags/:id` | Atualizar tag | ✅ Implementado |
| DELETE | `/tags/:id` | Deletar tag | ✅ Implementado |

#### 📌 GET `/tags/` - Listar tags

**Response 200 (Sucesso):**
```json
[
  {
    "id": 1,
    "idUsuario": 1,
    "idCracha": 1,
    "codigoTag": "RF123456",
    "temporario": false,
    "validade": null,
    "dataDeCriacao": "2026-04-20T10:30:00Z",
    "usuario": {
      "nome": "João Silva"
    },
    "cracha": {
      "status": "emUso"
    }
  }
]
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/tags/
```

---

#### 📌 POST `/tags/` - Criar tag

**Request Body:**
```json
{
  "idUsuario": 1,
  "idCracha": 1,
  "codigoTag": "RF789012",
  "temporario": false,
  "validade": null
}
```

**Response 201 (Criado):**
```json
{
  "id": 5,
  "idUsuario": 1,
  "idCracha": 1,
  "codigoTag": "RF789012",
  "temporario": false,
  "validade": null,
  "dataDeCriacao": "2026-04-22T15:45:00Z"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/tags/ \
  -H "Content-Type: application/json" \
  -d '{
    "idUsuario": 1,
    "idCracha": 1,
    "codigoTag": "RF789012",
    "temporario": false
  }'
```

---

### 📋 7. REQUISIÇÕES DE ACESSO (`/requisicao`)

Controle de requisições de acesso para funcionários.

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| GET | `/requisicao/` | Listar requisições | ✅ Implementado |
| GET | `/requisicao/:id` | Buscar por ID | ✅ Implementado |
| GET | `/requisicao/func/:id` | Buscar por funcionário | ✅ Implementado |
| GET | `/requisicao/dep/:id` | Buscar por departamento | ✅ Implementado |
| POST | `/requisicao/` | Criar requisição | ✅ Implementado |
| PUT | `/requisicao/:id` | Atualizar | ✅ Implementado |
| DELETE | `/requisicao/:id` | Deletar | ✅ Implementado |

**Status válidos:** `pendente`, `aprovado`, `recusado`

#### 📌 GET `/requisicao/` - Listar requisições

**Response 200 (Sucesso):**
```json
[
  {
    "id": 1,
    "idUsuario": 1,
    "idDepartamento": 5,
    "status": "pendente",
    "dataDaRequisicao": "2026-04-20T14:00:00Z",
    "usuario": {
      "nome": "João Silva"
    },
    "departamento": {
      "nome": "TI"
    }
  }
]
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/requisicao/
```

---

#### 📌 POST `/requisicao/` - Criar requisição

**Request Body:**
```json
{
  "idUsuario": 1,
  "idDepartamento": 5,
  "status": "pendente"
}
```

**Response 201 (Criado):**
```json
{
  "id": 5,
  "idUsuario": 1,
  "idDepartamento": 5,
  "status": "pendente",
  "dataDaRequisicao": "2026-04-22T16:20:00Z"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/requisicao/ \
  -H "Content-Type: application/json" \
  -d '{
    "idUsuario": 1,
    "idDepartamento": 5,
    "status": "pendente"
  }'
```

---

### 👨‍💼 8. DISPOSITIVOS (`/dispositivos`)

Gerenciamento de dispositivos de controle de acesso.

| Método | Rota | Descrição | Status |
|--------|------|-----------|--------|
| GET | `/dispositivos/` | Listar dispositivos | ✅ Implementado |
| GET | `/dispositivos/:id` | Buscar por ID | ✅ Implementado |
| POST | `/dispositivos/` | Criar dispositivo | ✅ Implementado |
| PUT | `/dispositivos/:id` | Atualizar | ✅ Implementado |
| DELETE | `/dispositivos/:id` | Deletar | ✅ Implementado |

#### 📌 GET `/dispositivos/` - Listar dispositivos

**Response 200 (Sucesso):**
```json
[
  {
    "id": 1,
    "idDepartamento": 1,
    "local": "Entrada Prédio A",
    "dataManutencao": "2026-05-20T10:00:00Z",
    "dataDeCriacao": "2026-04-01T08:00:00Z",
    "departamento": {
      "nome": "TI"
    }
  }
]
```

**Exemplo cURL:**
```bash
curl -X GET http://localhost:3000/dispositivos/
```

---

#### 📌 POST `/dispositivos/` - Criar dispositivo

**Request Body:**
```json
{
  "idDepartamento": 1,
  "local": "Entrada Prédio B",
  "dataManutencao": "2026-06-20T10:00:00Z"
}
```

**Response 201 (Criado):**
```json
{
  "id": 5,
  "idDepartamento": 1,
  "local": "Entrada Prédio B",
  "dataManutencao": "2026-06-20T10:00:00Z",
  "dataDeCriacao": "2026-04-22T17:00:00Z"
}
```

**Exemplo cURL:**
```bash
curl -X POST http://localhost:3000/dispositivos/ \
  -H "Content-Type: application/json" \
  -d '{
    "idDepartamento": 1,
    "local": "Entrada Prédio B",
    "dataManutencao": "2026-06-20T10:00:00Z"
  }'
```

---

## Modelos de Dados

Estrutura de dados definida no Prisma Schema.

### 📌 Usuario

```prisma
model Usuario {
  id              Int     @id @default(autoincrement())
  nome            String  @db.VarChar(150)
  cpf             String  @unique @db.VarChar(14)
  celular         String? @db.VarChar(20)
  email           String  @unique @db.VarChar(150)
  dataDeCriacao   DateTime @default(now())

  // Relacionamentos
  funcionarios          Funcionario[]
  tags                  Tag[]
  requisicoesDeAcessos  RequisicaoDeAcesso[]
  requisicoesDeVisitas  RequisicaoDeVisita[]
  logs                  LogDeAcesso[]
}
```

**Campos:**
| Campo | Tipo | Requerido | Único | Descrição |
|-------|------|-----------|-------|-----------|
| `id` | INT | ✅ | ✅ | Identificador único (auto-increment) |
| `nome` | VARCHAR(150) | ✅ | ❌ | Nome completo do usuário |
| `cpf` | VARCHAR(14) | ✅ | ✅ | CPF sem máscara (único) |
| `celular` | VARCHAR(20) | ❌ | ❌ | Telefone celular |
| `email` | VARCHAR(150) | ✅ | ✅ | Email (único) |
| `dataDeCriacao` | DateTime | ✅ | ❌ | Data de criação automática |

---

### 📌 Funcionario

```prisma
model Funcionario {
  id                Int     @id
  idUsuario         Int     @unique
  idDepartamento    Int
  tipo              Enum    @default(func) // func, port, sup, ger, adm
  dataDeNascimento  Date?
  imagem            String? @db.VarChar(255)
  senhaHash         String  @db.VarChar(255)
  dataDeCriacao     DateTime @default(now())

  // Relacionamentos
  usuario         Usuario @relation(fields: [idUsuario], references: [id])
  departamento    Departamento @relation("funcionarios", fields: [idDepartamento], references: [id])
  gestao          Departamento[] @relation("gestor")
}
```

**Campos:**
| Campo | Tipo | Requerido | Descrição |
|-------|------|-----------|-----------|
| `id` | INT | ✅ | Identificador único |
| `idUsuario` | INT | ✅ | FK para Usuario |
| `idDepartamento` | INT | ✅ | FK para Departamento |
| `tipo` | ENUM | ✅ | func \| port \| sup \| ger \| adm |
| `dataDeNascimento` | Date | ❌ | Data de nascimento |
| `imagem` | VARCHAR(255) | ❌ | URL da foto/imagem |
| `senhaHash` | VARCHAR(255) | ✅ | Senha hash (bcryptjs) |
| `dataDeCriacao` | DateTime | ✅ | Data de criação |

---

### 📌 Departamento

```prisma
model Departamento {
  id              Int     @id @default(autoincrement())
  nome            String  @unique @db.VarChar(100)
  idGestor        Int?
  dataDeCriacao   DateTime @default(now())

  // Relacionamentos
  gestor              Funcionario? @relation("gestor", fields: [idGestor], references: [id])
  funcionarios        Funcionario[] @relation("funcionarios")
  dispositivos        Dispositivo[]
  requisicoesDeAcessos  RequisicaoDeAcesso[]
  requisicoesDeVisitas  RequisicaoDeVisita[]
}
```

**Campos:**
| Campo | Tipo | Requerido | Único | Descrição |
|-------|------|-----------|-------|-----------|
| `id` | INT | ✅ | ✅ | Identificador único |
| `nome` | VARCHAR(100) | ✅ | ✅ | Nome do departamento |
| `idGestor` | INT | ❌ | ❌ | FK para gestor (Funcionario) |
| `dataDeCriacao` | DateTime | ✅ | ❌ | Data de criação |

---

### 📌 Cracha

```prisma
model Cracha {
  id              Int     @id @default(autoincrement())
  status          Enum    @default(disponivel) // disponivel, emUso, perdido

  // Relacionamentos
  tags            Tag[]
}
```

**Campos:**
| Campo | Tipo | Requerido | Padrão | Descrição |
|-------|------|-----------|--------|-----------|
| `id` | INT | ✅ | - | Identificador único |
| `status` | ENUM | ✅ | disponivel | disponivel \| emUso \| perdido |

---

### 📌 Tag

```prisma
model Tag {
  id              Int     @id @default(autoincrement())
  idUsuario       Int
  idCracha        Int
  codigoTag       String  @unique @db.VarChar(100)
  temporario      Boolean @default(false)
  validade        DateTime?
  dataDeCriacao   DateTime @default(now())

  // Relacionamentos
  usuario         Usuario @relation(fields: [idUsuario], references: [id])
  cracha          Cracha @relation(fields: [idCracha], references: [id])
}
```

**Campos:**
| Campo | Tipo | Requerido | Descrição |
|-------|------|-----------|-----------|
| `id` | INT | ✅ | Identificador único |
| `idUsuario` | INT | ✅ | FK para Usuario |
| `idCracha` | INT | ✅ | FK para Cracha |
| `codigoTag` | VARCHAR(100) | ✅ | Código RFID (único) |
| `temporario` | Boolean | ✅ | Se é tag temporária |
| `validade` | DateTime | ❌ | Data de validade |
| `dataDeCriacao` | DateTime | ✅ | Data de criação |

---

### 📌 RequisicaoDeAcesso

```prisma
model RequisicaoDeAcesso {
  id                  Int     @id @default(autoincrement())
  idUsuario           Int
  idDepartamento      Int
  status              Enum    @default(pendente) // pendente, aprovado, recusado
  dataDaRequisicao    DateTime @default(now())

  // Relacionamentos
  usuario             Usuario @relation(fields: [idUsuario], references: [id])
  departamento        Departamento @relation(fields: [idDepartamento], references: [id])
}
```

**Campos:**
| Campo | Tipo | Requerido | Padrão | Descrição |
|-------|------|-----------|--------|-----------|
| `id` | INT | ✅ | - | Identificador único |
| `idUsuario` | INT | ✅ | - | FK para Usuario |
| `idDepartamento` | INT | ✅ | - | FK para Departamento |
| `status` | ENUM | ✅ | pendente | pendente \| aprovado \| recusado |
| `dataDaRequisicao` | DateTime | ✅ | - | Data da requisição |

---

### 📌 Dispositivo

```prisma
model Dispositivo {
  id              Int     @id @default(autoincrement())
  idDepartamento  Int
  local           String? @db.VarChar(150)
  dataManutencao  DateTime?
  dataDeCriacao   DateTime @default(now())

  // Relacionamentos
  departamento    Departamento @relation(fields: [idDepartamento], references: [id])
  logs            LogDeAcesso[]
}
```

**Campos:**
| Campo | Tipo | Requerido | Descrição |
|-------|------|-----------|-----------|
| `id` | INT | ✅ | Identificador único |
| `idDepartamento` | INT | ✅ | FK para Departamento |
| `local` | VARCHAR(150) | ❌ | Localização física |
| `dataManutencao` | DateTime | ❌ | Data próxima manutenção |
| `dataDeCriacao` | DateTime | ✅ | Data de criação |

---

### 📌 RequisicaoDeVisita

```prisma
model RequisicaoDeVisita {
  id                  Int     @id @default(autoincrement())
  idUsuario           Int
  idDepartamento      Int
  status              Enum    @default(pendente) // pendente, aprovado, recusado
  motivo              String? @db.VarChar(255)
  validade            DateTime?
  dataDaRequisicao    DateTime @default(now())

  // Relacionamentos
  usuario             Usuario @relation(fields: [idUsuario], references: [id])
  departamento        Departamento @relation(fields: [idDepartamento], references: [id])
}
```

**Campos:**
| Campo | Tipo | Requerido | Descrição |
|-------|------|-----------|-----------|
| `id` | INT | ✅ | Identificador único |
| `idUsuario` | INT | ✅ | FK para Usuario |
| `idDepartamento` | INT | ✅ | FK para Departamento |
| `status` | ENUM | ✅ | pendente \| aprovado \| recusado |
| `motivo` | VARCHAR(255) | ❌ | Motivo da visita |
| `validade` | DateTime | ❌ | Validade da visita |
| `dataDaRequisicao` | DateTime | ✅ | Data da requisição |

---

### 📌 LogDeAcesso

```prisma
model LogDeAcesso {
  id              Int     @id @default(autoincrement())
  idUsuario       Int
  idDispositivo   Int
  horario         DateTime @default(now())

  // Relacionamentos
  usuario         Usuario @relation(fields: [idUsuario], references: [id])
  dispositivo     Dispositivo @relation(fields: [idDispositivo], references: [id])
}
```

**Campos:**
| Campo | Tipo | Requerido | Descrição |
|-------|------|-----------|-----------|
| `id` | INT | ✅ | Identificador único |
| `idUsuario` | INT | ✅ | FK para Usuario |
| `idDispositivo` | INT | ✅ | FK para Dispositivo |
| `horario` | DateTime | ✅ | Hora do acesso |

---

## Autenticação JWT

Sistema de autenticação baseado em **JWT (JSON Web Tokens)**.

### 🔑 Como Funciona

1. **Login:** O usuário envia email + senha
2. **Geração:** Servidor verifica credenciais e gera JWT
3. **Token:** Cliente armazena o token
4. **Requisições:** Cliente envia token no header `Authorization`
5. **Validação:** Servidor valida token em cada requisição protegida

### 📌 Formato do JWT

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
                      eyJpZCI6MSwibm9tZSI6IkpvYW8iLCJpYXQiOjE2Mzk4MzAwMDB9.
                      signature_hash_here
```

**Payload decodificado:**
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "iat": 1639830000,
  "exp": 1640434800
}
```

### ⚠️ AVISO IMPORTANTE

**As rotas SIM estão protegidas com autenticação JWT!**

O middleware `AuthMiddleware.js` está implementado e **vinculado em TODAS as rotas** (exceto `/auth` que é correto - é login/logout).

**Rotas protegidas:**
- ✅ `/user/*` — Todas as rotas de usuário
- ✅ `/func/*` — Todas as rotas de funcionários
- ✅ `/dep/*` — Todas as rotas de departamentos
- ✅ `/cracha/*` — Todas as rotas de crachás
- ✅ `/tags/*` — Todas as rotas de tags
- ✅ `/requisicao/*` — Todas as rotas de requisições
- ✅ `/dispositivos/*` — Todas as rotas de dispositivos
- ❌ `/auth/*` — Sem proteção (correto - é login/logout/register)

### 🔐 Configuração de Ambiente

```env
JWT_SECRET=sua_chave_secreta_muito_segura_123
JWT_EXPIRES_IN=7d
```

- **JWT_SECRET:** Chave para assinar tokens (keep it secret!)
- **JWT_EXPIRES_IN:** Quanto tempo até o token expirar (7d = 7 dias)

### 📌 Exemplo: Usando JWT em uma Requisição

**1. Fazer login para obter token:**

```bash
curl -X PUT http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "senha123"
  }'
```

**Resposta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nome": "João Silva"
  },
  "expiresIn": "7d"
}
```

**2. Usar o token em próximas requisições:**

```bash
curl -X GET http://localhost:3000/user/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Códigos HTTP

Referência de status codes retornados pela API.

| Código | Status | Descrição | Exemplo |
|--------|--------|-----------|---------|
| **200** | OK | Requisição bem-sucedida (GET/PUT) | Listagem, atualização |
| **201** | Created | Recurso criado com sucesso (POST) | Novo usuário criado |
| **204** | No Content | Sucesso, sem conteúdo na resposta (DELETE) | Deletado com sucesso |
| **400** | Bad Request | Erro na requisição (dados inválidos) | Email duplicado, campo obrigatório faltando |
| **401** | Unauthorized | Não autenticado ou token inválido | JWT expirado, não enviou token |
| **403** | Forbidden | Não tem permissão para acessar | Sem autorização |
| **404** | Not Found | Recurso não encontrado | Usuário ID 999 não existe |
| **409** | Conflict | Conflito (ex: email duplicado) | CPF já cadastrado |
| **500** | Internal Server Error | Erro no servidor | Erro de banco de dados |
| **503** | Service Unavailable | Serviço indisponível | Banco de dados offline |

### Exemplo de Resposta com Erro 400:

```json
{
  "error": "Validação falhou",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Email já cadastrado"
    }
  ]
}
```

---

## Avisos de Segurança

⚠️ **LEIA COM ATENÇÃO**

### � 1. Proteção JWT ✅ IMPLEMENTADA

**Status:** As rotas estão protegidas com middleware JWT em todas as rotas (exceto `/auth`).

**Todos os endpoints de dados requerem token válido no header:**
```
Authorization: Bearer {token}
```

**Problema:** `CORS_ORIGIN=*` permite requisições de qualquer domínio.

**Risco:** Possibilita ataques CSRF, roubo de dados, abuso da API.

**Solução (produção):**
```env
CORS_ORIGIN=https://seu-dominio.com
```

```javascript
// config/server.js
cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
})
```

---

### 🚨 3. PUT e DELETE Não Implementados

**Problema:** Muitos endpoints PUT/DELETE estão marcados como "Não implementado".

**Impacto:**
- ❌ Usuários não podem atualizar dados
- ❌ Usuários não podem deletar dados
- ✅ Previne acidentes, mas limita funcionalidade

**Status:**
| Rota | PUT | DELETE |
|------|-----|--------|
| `/user/:id` | ❌ | ❌ |
| `/func/:id` | ❌ | ❌ |
| `/dep/:id` | ❌ | ❌ |
| `/cracha/:id` | ❌ | ❌ |
| `/tags/:id` | ❌ | ❌ |
| `/requisicao/:id` | ❌ | ❌ |
| `/dispositivos/:id` | ❌ | ❌ |

---

### 🚨 4. Senhas em Texto Plano

**Problema:** Senhas podem ser armazenadas sem hash adequado.

**Solução:** Sempre use bcryptjs para hash:

```javascript
const bcrypt = require('bcryptjs');

// Ao criar usuário
const salt = await bcrypt.genSalt(10);
const senhaHash = await bcrypt.hash(senha, salt);

// Ao fazer login
const validar = await bcrypt.compare(senha, senhaHash);
```

---

### 🚨 5. Validação Mínima de Entrada

**Problema:** Não há validação rigorosa de inputs (email, CPF, etc).

**Solução:** Implementar validação com `express-validator`:

```javascript
const { body, validationResult } = require('express-validator');

router.post('/', [
  body('email').isEmail(),
  body('cpf').matches(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/),
  body('nome').trim().notEmpty()
], controller.create);
```

---

### 🚨 6. Sem Rate Limiting

**Problema:** Sem limite de requisições por IP/usuário.

**Risco:** Possibilita brute force, DDoS.

**Solução:** Usar `express-rate-limit`:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requisições
});

app.use('/auth/login', limiter);
```

---

### ✅ Checklist de Segurança para Produção

- [ ] Implementar JWT em todas as rotas
- [ ] Configurar CORS apenas para domínios confiáveis
- [ ] Implementar PUT/DELETE com autorização
- [ ] Validar todas as entradas (email, CPF, etc)
- [ ] Adicionar rate limiting
- [ ] Usar HTTPS/SSL
- [ ] Adicionar logs de auditoria
- [ ] Configurar variáveis de ambiente com chaves fortes
- [ ] Implementar refresh tokens
- [ ] Adicionar 2FA (autenticação de dois fatores)

---

## Estrutura do Banco de Dados

### Relacionamentos (ER Diagram)

```
Usuario (1) ─────── (N) Funcionario
  │                      └─ Departamento
  │
  ├─── (N) Tag ───── (1) Cracha
  │
  ├─── (N) RequisicaoDeAcesso ───── (1) Departamento
  │
  ├─── (N) RequisicaoDeVisita ───── (1) Departamento
  │
  └─── (N) LogDeAcesso ───── (1) Dispositivo


Departamento (1) ───── (N) Funcionario
  │                        (gestor)
  └───── (N) Dispositivo
```

### Migrations Aplicadas

**20260329_001_create_DataBase.sql**
- Cria todas as tabelas principais
- Define chaves primárias e estrangeiras
- Configura constraints UNIQUE

**20260329_002_input_DadosIniciais.sql**
- Insere dados iniciais de teste
- Departamentos padrão
- Usuários de exemplo

---

## Troubleshooting

### 🔧 Erro: "Database connection failed"

**Causa:** Variáveis de ambiente incorretas ou PostgreSQL offline.

**Solução:**
```bash
# 1. Verificar variáveis .env
cat .env

# 2. Testar conexão PostgreSQL
psql -h localhost -U seu_usuario -d get_in_db

# 3. Reiniciar serviço
sudo systemctl restart postgresql
```

---

### 🔧 Erro: "JWT token is invalid"

**Causa:** Token expirado ou chave secreta incorreta.

**Solução:**
```bash
# 1. Fazer novo login para obter novo token
curl -X PUT http://localhost:3000/auth/login \
  -d '{"email": "...","senha": "..."}'

# 2. Verificar JWT_SECRET no .env
echo $JWT_SECRET
```

---

### 🔧 Erro: "Prisma client not generated"

**Causa:** Prisma client não foi gerado.

**Solução:**
```bash
npm run prisma:generate
npm start
```

---

### 🔧 Erro: "Port 3000 already in use"

**Causa:** Outra aplicação usando a porta.

**Solução:**
```bash
# Mudar porta no .env
PORT=3001

# Ou matar processo anterior
kill -9 $(lsof -t -i:3000)
```

---

## Contribuindo

Para contribuir com melhorias:

1. **Fork** o repositório
2. **Crie** uma branch para sua feature (`git checkout -b feature/NovaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Adicionar nova feature'`)
4. **Push** para a branch (`git push origin feature/NovaFeature`)
5. **Abra** um Pull Request

### Padrão de Código

- Use **async/await** ao invés de callbacks
- Siga **camelCase** para variáveis e funções
- Adicione **try/catch** em todas as requisições ao BD
- Documente **parâmetros** e **retornos**

```javascript
// ✅ Bom
async function buscarUsuario(id) {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id }
    });
    return usuario;
  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
    throw erro;
  }
}

// ❌ Ruim
function buscarUsuario(id, callback) {
  BD.query('SELECT * FROM usuarios WHERE id = ' + id, callback);
}
```

---

## Suporte

Em caso de dúvidas ou problemas:

- 📧 Email: suporte@getin.com.br
- 💬 Discord: [Link do servidor]
- 📝 Issues: [GitHub Issues]
- 📚 Documentação: [Link da doc]

---

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

---

**Última atualização:** 20 de Abril de 2026  
**Versão:** 1.0.0  
**Status:** Em desenvolvimento ✨
