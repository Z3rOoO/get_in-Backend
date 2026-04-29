# 🏢 GET IN - Backend API Documentation

Documentação completa da API Backend do sistema **GET IN**, uma solução robusta para controle de acessos, gestão de funcionários e visitantes em ambientes corporativos.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Autenticação](#autenticação)
- [Documentação das Rotas](#documentação-das-rotas)
  - [🔐 Autenticação (`/auth`)](#-autenticação-auth)
  - [👥 Usuários (`/user`)](#-usuários-user)
  - [👔 Funcionários (`/func`)](#-funcionários-func)
  - [🏢 Departamentos (`/dep`)](#-departamentos-dep)
  - [💳 Crachás (`/cracha`)](#-crachás-cracha)
  - [🏷️ Tags RFID (`/tags`)](#️-tags-rfid-tags)
  - [📥 Requisições de Acesso (`/requisicao`)](#-requisições-de-acesso-requisicao)
  - [🚪 Dispositivos (`/dispositivos`)](#-dispositivos-dispositivos)
  - [📜 Logs de Acesso (`/logs`)](#-logs-de-acesso-logs)
- [Modelos de Dados (Prisma)](#modelos-de-dados-prisma)
- [Códigos de Resposta](#códigos-de-resposta)

---

## Visão Geral

O **GET IN** é um sistema de backend desenvolvido para gerenciar o fluxo de pessoas em organizações. Ele permite o controle granular de quem pode acessar determinados departamentos, utilizando dispositivos de leitura de tags/crachás e um sistema de requisições de acesso.

### Principais Funcionalidades:
- **Gestão de Identidade:** Cadastro de usuários e funcionários com diferentes níveis de acesso (ADM, GER, SUP, PORT, FUNC).
- **Controle de Acesso:** Vinculação de tags RFID a usuários e validação de permissões por departamento.
- **Workflow de Requisições:** Sistema de solicitação e aprovação de acesso para funcionários e visitantes.
- **Monitoramento:** Registro detalhado de logs de entrada e saída por dispositivo e usuário.

---

## Stack Tecnológica

| Componente | Tecnologia |
|-----------|-----------|
| **Ambiente de Execução** | Node.js |
| **Framework Web** | Express.js |
| **Linguagem** | JavaScript (ES Modules) |
| **ORM** | Prisma |
| **Banco de Dados** | PostgreSQL |
| **Autenticação** | JWT (JSON Web Tokens) |
| **Criptografia** | bcryptjs |

---

## Pré-requisitos

- **Node.js** (v16 ou superior recomendado)
- **PostgreSQL** (ou outro banco suportado pelo Prisma)
- **Gerenciador de pacotes** (npm ou yarn)

---

## Instalação e Configuração

### 1. Clonar o Repositório
```bash
git clone https://github.com/Z3rOoO/get_in-Backend.git
cd get_in-Backend/backend
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Variáveis de Ambiente
Crie um arquivo `.env` na pasta `backend/` baseando-se no `.env.example`:
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/get_in_db?schema=public"
JWT_SECRET="sua_chave_secreta_aqui"
JWT_EXPIRES_IN="7d"
```

### 4. Migrações do Banco de Dados
```bash
npx prisma migrate dev --name init
```

### 5. Iniciar o Servidor
```bash
# Modo desenvolvimento
npm run dev

# Modo produção
npm start
```

---

## Estrutura do Projeto

```text
backend/
├── config/         # Configurações de banco e Prisma
├── controllers/    # Lógica de negócio (regras e processamento)
├── middleware/     # Middlewares (ex: AuthMiddleware)
├── prisma/         # Schema do banco de dados e migrações
├── router/         # Definição das rotas da API
└── server.js       # Ponto de entrada da aplicação
```

---

## Autenticação

A maioria das rotas exige autenticação via **JWT**.
1. Realize o login em `/auth/login`.
2. Capture o `token` retornado.
3. Envie o token em todas as requisições protegidas no Header:
   `Authorization: Bearer <SEU_TOKEN_AQUI>`

---

## Documentação das Rotas

### 🔐 Autenticação (`/auth`)

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/` | Registrar um novo funcionário (Cria Usuário + Funcionário) |
| POST | `/auth/login` | Autenticar e receber token JWT |

#### Exemplo de Registro:
**POST** `/auth/`
```json
{
  "nome": "João Silva",
  "cpf": "12345678901",
  "email": "joao@email.com",
  "idDepartamento": 1,
  "tipo": "adm",
  "senha": "senha_segura"
}
```

---

### 👥 Usuários (`/user`)
*Gerencia os dados básicos de identificação das pessoas.*

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/user/` | Listar todos os usuários |
| GET | `/user/:id` | Buscar usuário por ID |
| GET | `/user/name/:nome` | Buscar usuários por nome (filtro parcial) |
| GET | `/user/cpf/:cpf` | Buscar usuário por CPF |
| POST | `/user/` | Criar um usuário simples |
| PUT | `/user/:id` | Atualizar dados do usuário |
| DELETE | `/user/:id` | Remover usuário |

---

### 👔 Funcionários (`/func`)
*Gerencia o vínculo profissional, cargo e departamento.*

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/func/` | Listar todos os funcionários |
| GET | `/func/:id` | Buscar funcionário por ID |
| POST | `/func/` | Criar registro de funcionário para usuário existente |
| PUT | `/func/:id` | Atualizar dados profissionais |
| DELETE | `/func/:id` | Remover registro de funcionário |

---

### 🏢 Departamentos (`/dep`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/dep/` | Listar todos os departamentos |
| POST | `/dep/` | Criar novo departamento |
| PUT | `/dep/:id` | Atualizar departamento (nome/gestor) |
| DELETE | `/dep/:id` | Remover departamento |

---

### 💳 Crachás (`/cracha`)
*Representa o objeto físico do crachá.*

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/cracha/` | Listar todos os crachás |
| POST | `/cracha/` | Gerar novo crachá (status padrão: disponível) |
| GET | `/cracha/status/:status` | Filtrar por status (`d`=disponível, `p`=perdido, `e`=emUso) |

---

### 🏷️ Tags RFID (`/tags`)
*Vincula um código de tag física a um usuário e um crachá.*

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/tags/` | Vincular nova tag a usuário/crachá |
| GET | `/tags/:id` | Consultar detalhes de uma tag |

---

### 📥 Requisições de Acesso (`/requisicao`)
*Fluxo de solicitações de permissão para entrar em departamentos.*

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/requisicao/` | Criar nova solicitação de acesso |
| PUT | `/requisicao/:id` | Atualizar status (aprovado/recusado) |
| GET | `/requisicao/dep/:id` | Listar requisições de um departamento específico |

---

### 🚪 Dispositivos (`/dispositivos`)
*Gerencia os leitores físicos instalados nos departamentos.*

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/dispositivos/` | Listar dispositivos cadastrados |
| GET | `/dispositivos/:id/:cracha` | **Validação de Acesso:** Verifica se o crachá tem permissão no dispositivo |

#### Exemplo de Validação (Uso por Hardware):
**GET** `/dispositivos/1/TAG123456`
- **Sucesso (200):** Acesso permitido.
- **Erro (403):** Acesso negado (usuário sem permissão para este departamento).

---

### 📜 Logs de Acesso (`/logs`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/logs/` | Listar histórico completo de acessos |
| GET | `/logs/user/:idUsuario` | Histórico de um usuário específico |
| GET | `/logs/device/:idDispositivo` | Histórico de um dispositivo específico |

---

## Modelos de Dados (Prisma)

### Principais Entidades:
- **Usuario:** Dados pessoais (nome, CPF, email).
- **Funcionario:** Dados corporativos (cargo, senha, departamento).
- **Departamento:** Setores da empresa com gestor responsável.
- **Cracha & Tag:** Identificadores físicos para acesso.
- **Log:** Registro temporal de entradas e saídas.

---

## Códigos de Resposta

| Código | Significado |
|--------|-------------|
| **200 OK** | Requisição processada com sucesso. |
| **201 Created** | Recurso criado com sucesso. |
| **400 Bad Request** | Dados enviados são inválidos. |
| **401 Unauthorized** | Token ausente ou inválido. |
| **403 Forbidden** | Sem permissão para o recurso ou acesso negado. |
| **404 Not Found** | Recurso não encontrado. |
| **500 Internal Error** | Erro inesperado no servidor. |

---
*Documentação atualizada em 29 de Abril de 2026.*
