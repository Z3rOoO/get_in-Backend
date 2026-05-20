# 🏢 GET IN - Backend API Documentation

Documentação completa da API Backend do sistema **GET IN**, uma solução para controle de acessos, gestão de usuários, funcionários, visitantes, crachás, tags RFID, dispositivos e logs em ambientes corporativos.

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
  - [🧾 Requisições de Visitante (`/requisicao-visitante`)](#-requisições-de-visitante-requisicao-visitante)
  - [🚪 Dispositivos (`/dispositivos`)](#-dispositivos-dispositivos)
  - [📜 Logs de Acesso (`/logs`)](#-logs-de-acesso-logs)
  - [🖼️ Avatares (`/avatar`)](#️-avatares-avatar)
  - [📊 Views Consolidadas (`/views`)](#-views-consolidadas-views)
  - [🛂 Portaria (`/portaria`)](#-portaria-portaria)
  - [📍 Setores (`/setores`)](#-setores-setores)
  - [🏢 Empresas (`/empresas`)](#-empresas-empresas)
  - [🌐 Público (`/public`)](#-público-public)
- [Modelos de Dados (Prisma)](#modelos-de-dados-prisma)
- [Códigos de Resposta](#códigos-de-resposta)
- [Notas Técnicas](#notas-técnicas)

---

## Visão Geral

O **GET IN** é um backend desenvolvido para gerenciar o fluxo de pessoas em organizações. A API centraliza cadastros de usuários e funcionários, requisições de acesso interno, requisições de visitantes, vínculos com tags RFID, dispositivos de validação, registros de entrada e saída, além de consultas consolidadas para telas administrativas e de portaria.

### Principais Funcionalidades:

- **Gestão de Identidade:** cadastro e manutenção de usuários, funcionários e visitantes.
- **Controle de Acesso:** validação por tag RFID, crachá, setor/departamento e status de requisição.
- **Workflow de Requisições:** criação, aprovação, recusa e acompanhamento de solicitações de acesso interno e visita externa.
- **Monitoramento:** registro de logs por usuário e dispositivo, com views consolidadas para consulta analítica.
- **Upload de Avatar:** integração com Supabase Storage para armazenar imagens de funcionários, salvando apenas o caminho no banco de dados e retornando a URL pública completa.
- **Integração com Dispositivos:** suporte a comunicação MQTT para retorno de autorização aos dispositivos físicos.

---

## Stack Tecnológica

| Componente | Tecnologia |
| --- | --- |
| **Ambiente de Execução** | Node.js |
| **Framework Web** | Express.js |
| **Linguagem** | JavaScript (ES Modules) |
| **ORM** | Prisma |
| **Banco de Dados** | PostgreSQL |
| **Autenticação** | JWT (JSON Web Tokens) |
| **Criptografia de Senha** | bcrypt |
| **Upload de Arquivos** | Multer |
| **Storage de Imagens** | Supabase Storage |
| **Comunicação com Dispositivos** | MQTT |
| **CORS** | cors |

---

## Pré-requisitos

Para executar o projeto localmente, é necessário possuir **Node.js**, **npm**, acesso a um banco **PostgreSQL** e as credenciais de ambiente utilizadas pela aplicação. O projeto também possui integração opcional com **Supabase Storage** para avatares e com broker **MQTT** para comunicação com dispositivos.

| Recurso | Recomendação |
| --- | --- |
| **Node.js** | v18 ou superior |
| **npm** | versão compatível com o Node instalado |
| **PostgreSQL** | instância local ou remota acessível via `DATABASE_URL` |
| **Supabase** | projeto e bucket configurados para upload de imagens |
| **MQTT** | acesso ao broker configurado no código quando usar validação por dispositivo |

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

Crie um arquivo `.env` dentro da pasta `backend/`. O repositório mantém arquivos de referência chamados `.env.example` e `dotenvexample`; copie um deles e ajuste os valores conforme o ambiente utilizado.

```env
PORT=8080
DATABASE_URL="postgresql://usuario:senha@localhost:5432/get_in_db?schema=public"
JWT_SECRET="segredo_muito_dificil"
JWT_EXPIRES_IN="9h"

# Supabase Storage
SUPABASE_URL="https://seu-projeto.supabase.co"
SUPABASE_KEY="sua_chave_do_supabase"
```

> **Observação:** a configuração ativa do Prisma utiliza `DATABASE_URL` com provider `postgresql`, conforme definido em `backend/prisma/schema.prisma`, `backend/prisma.config.ts` e `backend/config/prisma.js`. Variáveis antigas como `DB_HOST`, `DB_USER` e `DB_NAME` não são utilizadas pelo backend atual.

### 4. Configurar o Banco de Dados

Após configurar a variável `DATABASE_URL`, aplique as migrations ou sincronize o schema, de acordo com o fluxo de desenvolvimento adotado pela equipe.

```bash
npx prisma migrate dev
npx prisma generate
```

### 5. Iniciar o Servidor

O `package.json` define scripts para execução local. Depois de configurar o `.env`, inicie o servidor com:

```bash
npm start
```

Para desenvolvimento com reinício automático em mudanças de arquivo, use:

```bash
npm run dev
```

Por padrão, a API utiliza a porta definida em `PORT`. Caso a variável não seja informada, o servidor usa a porta `3000`.

---

## Estrutura do Projeto

```text
backend/
├── config/         # Configurações de Prisma, Supabase, MQTT e utilitários
├── controllers/    # Lógica das rotas e regras de negócio
├── middleware/     # Middlewares, incluindo autenticação JWT
├── prisma/         # Schema, migrations e views SQL
├── router/         # Definição das rotas da API
├── dotenvexample   # Exemplo de variáveis de ambiente
├── package.json    # Dependências e metadados do backend
└── server.js       # Ponto de entrada da aplicação Express
```

---

## Autenticação

A maioria das rotas exige autenticação via **JWT**. O fluxo recomendado é realizar login em `/auth/login`, capturar o token retornado e enviá-lo nas requisições protegidas por meio do header `Authorization`.

```http
Authorization: Bearer <SEU_TOKEN_JWT>
```

Quando o token não é enviado, está em formato inválido ou está expirado, o middleware retorna `401 Unauthorized`. As rotas públicas principais são as de autenticação e a validação de crachá do dispositivo, enquanto as demais rotas administrativas são protegidas no router.

---

## Documentação das Rotas

### 🔐 Autenticação (`/auth`)

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| POST | `/auth/` | Não | Registrar usuário e funcionário associado |
| POST | `/auth/login` | Não | Autenticar usuário e retornar token JWT |

#### 📌 POST `/auth/` - Registrar novo funcionário

**Descrição:** cria um usuário quando ele ainda não existe e, em seguida, cria o registro de funcionário associado. Caso o usuário já exista, o endpoint reutiliza o `id` do usuário encontrado por CPF ou e-mail e valida se ele ainda não possui cadastro funcional.

**Requisição:**

```json
{
  "nome": "João Silva",
  "cpf": "12345678901",
  "celular": "(11) 98765-4321",
  "email": "joao.silva@example.com",
  "tipo": "func",
  "dataDeNascimento": "1990-01-01",
  "imagem": null,
  "senha": "senha_segura_123"
}
```

**Exemplo de `fetch`:**

```javascript
fetch("http://localhost:3000/auth/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    nome: "João Silva",
    cpf: "12345678901",
    celular: "(11) 98765-4321",
    email: "joao.silva@example.com",
    tipo: "func",
    dataDeNascimento: "1990-01-01",
    imagem: null,
    senha: "senha_segura_123"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (201 Created):**

```json
{
  "sucesso": true,
  "mensagem": "Usuário e funcionário criados com sucesso",
  "data": {
    "usuario": {
      "id": 1,
      "nome": "João Silva",
      "cpf": "12345678901",
      "celular": "(11) 98765-4321",
      "email": "joao.silva@example.com"
    },
    "funcionario": {
      "id": 1,
      "idUsuario": 1,
      "idSetor": null,
      "tipo": "func",
      "dataDeNascimento": "1990-01-01T00:00:00.000Z",
      "imagem": null
    }
  }
}
```

#### 📌 POST `/auth/login` - Autenticar usuário

**Descrição:** valida e-mail e senha do funcionário, gerando um token JWT para acesso às rotas protegidas.

**Requisição:**

```json
{
  "email": "joao.silva@example.com",
  "senha": "senha_segura_123"
}
```

**Exemplo de `fetch`:**

```javascript
fetch("http://localhost:3000/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: "joao.silva@example.com",
    senha: "senha_segura_123"
  })
})
  .then(response => response.json())
  .then(data => {
    console.log(data);
    // Salvar o token para uso em requisições futuras
    localStorage.setItem("jwtToken", data.token);
  })
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sucesso": true,
  "mensagem": "login bem-sucedido",
  "data": {
    "id": 1,
    "nome": "João Silva",
    "cpf": "12345678901",
    "celular": "(11) 98765-4321",
    "email": "joao.silva@example.com"
  }
}
```

---

### 👥 Usuários (`/user`)

Gerencia os dados básicos de identificação de usuários, incluindo funcionários e visitantes.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/user/` | Sim | Listar todos os usuários |
| GET | `/user/:id` | Sim | Buscar usuário por ID |
| GET | `/user/name/:nome` | Sim | Buscar usuários por nome parcial |
| GET | `/user/cpf/:cpf` | Sim | Buscar usuários por CPF parcial |
| GET | `/user/me/profile` | Sim | Obter perfil completo do usuário autenticado |
| PUT | `/user/me/profile` | Sim | Atualizar dados do perfil do usuário autenticado |
| PUT | `/user/me/password` | Sim | Atualizar senha do usuário autenticado |
| POST | `/user/` | Sim | Criar usuário simples |
| PUT | `/user/:id` | Sim | Atualizar dados do usuário |
| DELETE | `/user/:id` | Sim | Remover usuário |

#### 📌 GET `/user/` - Listar todos os usuários

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
fetch("http://localhost:3000/user/", {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Usuários lidos com sucesso",
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "cpf": "12345678901",
      "celular": "(11) 98765-4321",
      "email": "joao.silva@example.com",
      "dataDeCriacao": "2026-05-15T10:00:00.000Z",
      "idEmpresa": null,
      "idDep": null
    }
  ]
}
```

#### 📌 GET `/user/:id` - Buscar usuário por ID

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
const userId = 1;
fetch(`http://localhost:3000/user/${userId}`, {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Usuário lido com sucesso",
  "data": {
    "id": 1,
    "nome": "João Silva",
    "cpf": "12345678901",
    "celular": "(11) 98765-4321",
    "email": "joao.silva@example.com",
    "dataDeCriacao": "2026-05-15T10:00:00.000Z",
    "idEmpresa": null,
    "idDep": null
  }
}
```

#### 📌 GET `/user/name/:nome` - Buscar usuários por nome parcial

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
const userName = "João";
fetch(`http://localhost:3000/user/name/${userName}`, {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Usuário lido com sucesso",
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "cpf": "12345678901",
      "celular": "(11) 98765-4321",
      "email": "joao.silva@example.com",
      "dataDeCriacao": "2026-05-15T10:00:00.000Z",
      "idEmpresa": null,
      "idDep": null
    }
  ]
}
```

#### 📌 GET `/user/cpf/:cpf` - Buscar usuários por CPF parcial

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
const userCpf = "123";
fetch(`http://localhost:3000/user/cpf/${userCpf}`, {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Usuário lido com sucesso",
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "cpf": "12345678901",
      "celular": "(11) 98765-4321",
      "email": "joao.silva@example.com",
      "dataDeCriacao": "2026-05-15T10:00:00.000Z",
      "idEmpresa": null,
      "idDep": null
    }
  ]
}
```

#### 📌 GET `/user/me/profile` - Obter perfil completo do usuário autenticado

**Descrição:** Retorna os dados completos do perfil do usuário autenticado, incluindo informações de funcionário, empresa e setor.

**Requisição:**

```http
GET http://localhost:3000/user/me/profile
Authorization: Bearer <SEU_TOKEN_JWT>
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
fetch("http://localhost:3000/user/me/profile", {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "data": {
    "usuario": {
      "id": 1,
      "nome": "João Silva",
      "cpf": "12345678901",
      "celular": "(11) 98765-4321",
      "email": "joao.silva@example.com",
      "dataDeCriacao": "2026-05-15T10:00:00.000Z",
      "idEmpresa": null,
      "idDep": null,
      "empresas": null,
      "departamentos": null
    },
    "funcionario": {
      "id": 1,
      "idUsuario": 1,
      "idSetor": 1,
      "tipo": "adm",
      "dataDeNascimento": "1990-01-01T00:00:00.000Z",
      "imagem": "1/func-1-1678886400000-abc.png",
      "avatarUrl": "https://dmlshwvpsoqpptjmplfq.supabase.co/storage/v1/object/public/usuarios/1/func-1-1678886400000-abc.png",
      "setor": {
        "id": 1,
        "nome": "Administração",
        "idGestor": null,
        "dataDeCriacao": "2026-05-15T09:00:00.000Z",
        "idDep": null,
        "acesso": "Liberado",
        "status": "Ativo"
      }
    },
    "perfil": {
      "id": 1,
      "nome": "João Silva",
      "cpf": "12345678901",
      "email": "joao.silva@example.com",
      "telefone": "(11) 98765-4321",
      "celular": "(11) 98765-4321",
      "empresa": null,
      "setor": "Administração",
      "cargo": "adm",
      "dataAdmissao": "2026-05-15T10:00:00.000Z",
      "avatarUrl": "https://dmlshwvpsoqpptjmplfq.supabase.co/storage/v1/object/public/usuarios/1/func-1-1678886400000-abc.png"
    }
  }
}
```

#### 📌 PUT `/user/me/profile` - Atualizar dados do perfil do usuário autenticado

**Descrição:** Atualiza informações do usuário e do funcionário associado. A alteração do `tipo` (cargo) só é permitida para usuários com `tipo: 'adm'`.

**Requisição:**

```json
{
  "nome": "João Silva Atualizado",
  "email": "joao.atualizado@example.com",
  "celular": "(11) 99999-9999",
  "idSetor": 2, // ID do novo setor
  "tipo": "ger" // Apenas ADMs podem alterar o tipo
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
fetch("http://localhost:3000/user/me/profile", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    nome: "João Silva Atualizado",
    email: "joao.atualizado@example.com",
    celular: "(11) 99999-9999",
    idSetor: 2,
    tipo: "ger"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Perfil atualizado com sucesso",
  "data": {
    "usuario": {
      "id": 1,
      "nome": "João Silva Atualizado",
      "cpf": "12345678901",
      "celular": "(11) 99999-9999",
      "email": "joao.atualizado@example.com",
      "dataDeCriacao": "2026-05-15T10:00:00.000Z",
      "idEmpresa": null,
      "idDep": null,
      "empresas": null,
      "departamentos": null
    },
    "funcionario": {
      "id": 1,
      "idUsuario": 1,
      "idSetor": 2,
      "tipo": "ger",
      "dataDeNascimento": "1990-01-01T00:00:00.000Z",
      "imagem": "1/func-1-1678886400000-abc.png",
      "avatarUrl": "https://dmlshwvpsoqpptjmplfq.supabase.co/storage/v1/object/public/usuarios/1/func-1-1678886400000-abc.png",
      "setor": {
        "id": 2,
        "nome": "Gerência",
        "idGestor": null,
        "dataDeCriacao": "2026-05-15T09:05:00.000Z",
        "idDep": null,
        "acesso": "Liberado",
        "status": "Ativo"
      }
    },
    "perfil": {
      "id": 1,
      "nome": "João Silva Atualizado",
      "cpf": "12345678901",
      "email": "joao.atualizado@example.com",
      "telefone": "(11) 99999-9999",
      "celular": "(11) 99999-9999",
      "empresa": null,
      "setor": "Gerência",
      "cargo": "ger",
      "dataAdmissao": "2026-05-15T10:00:00.000Z",
      "avatarUrl": "https://dmlshwvpsoqpptjmplfq.supabase.co/storage/v1/object/public/usuarios/1/func-1-1678886400000-abc.png"
    }
  }
}
```

#### 📌 PUT `/user/me/password` - Atualizar senha do usuário autenticado

**Descrição:** Permite ao usuário autenticado alterar sua senha, exigindo a senha atual para validação e uma nova senha com no mínimo 8 caracteres.

**Requisição:**

```json
{
  "senhaAtual": "senha_segura_123",
  "novaSenha": "nova_senha_forte_456"
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
fetch("http://localhost:3000/user/me/password", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    senhaAtual: "senha_segura_123",
    novaSenha: "nova_senha_forte_456"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Senha atualizada com sucesso"
}
```

#### 📌 POST `/user/` - Criar um usuário simples

**Requisição:**

```json
{
  "nome": "Maria Souza",
  "cpf": "98765432109",
  "cel": "(11) 91234-5678",
  "email": "maria.souza@example.com",
  "idEmpresa": 1 // ID de uma empresa existente
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
fetch("http://localhost:3000/user/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    nome: "Maria Souza",
    cpf: "98765432109",
    cel: "(11) 91234-5678",
    email: "maria.souza@example.com",
    idEmpresa: 1
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (201 Created):**

```json
{
  "sucesso": true,
  "mensagem": "Usuário criado com sucesso",
  "data": {
    "id": 2,
    "nome": "Maria Souza",
    "cpf": "98765432109",
    "celular": "(11) 91234-5678",
    "email": "maria.souza@example.com",
    "dataDeCriacao": "2026-05-15T10:10:00.000Z",
    "idEmpresa": 1,
    "idDep": null
  }
}
```

---

### 👔 Funcionários (`/func`)

Gerencia o vínculo profissional, cargo e setor de funcionários.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/func/` | Sim | Listar todos os funcionários |
| GET | `/func/:id` | Sim | Buscar funcionário por ID |
| GET | `/func/name/:nome` | Sim | Buscar funcionários por nome parcial |
| GET | `/func/cpf/:cpf` | Sim | Buscar funcionários por CPF parcial |
| POST | `/func/` | Sim | Criar registro de funcionário para usuário existente |
| PUT | `/func/:id` | Sim | Atualizar dados profissionais |
| DELETE | `/func/:id` | Sim | Remover registro de funcionário |

#### 📌 POST `/func/` - Criar registro de funcionário

**Descrição:** Vincula um usuário existente a um registro de funcionário, definindo seu setor, tipo e senha.

**Requisição:**

```json
{
  "idUsuario": 2, // ID de um usuário existente (ex: Maria Souza)
  "idSetor": 1, // ID de um setor existente
  "tipo": "port",      // Tipo de funcionário (func, port, sup, ger, adm)
  "dataDeNascimento": "1985-05-15",
  "senha": "senha_porteiro_456"
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
fetch("http://localhost:3000/func/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    idUsuario: 2,
    idSetor: 1,
    tipo: "port",
    dataDeNascimento: "1985-05-15",
    senha: "senha_porteiro_456"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (201 Created):**

```json
{
  "sucesso": true,
  "mensagem": "Funcionario criado com sucesso",
  "data": {
    "id": 2,
    "idUsuario": 2,
    "idSetor": 1,
    "tipo": "port",
    "dataDeNascimento": "1985-05-15T00:00:00.000Z",
    "imagem": null,
    "senhaHash": "$2a$10$...
  }
}
```

---

### 🏢 Departamentos (`/dep`)

Gerencia os departamentos da organização.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/dep/` | Sim | Listar todos os departamentos |
| GET | `/dep/:id` | Sim | Buscar departamento por ID |
| POST | `/dep/` | Sim | Criar novo departamento |
| PUT | `/dep/:id` | Sim | Atualizar departamento (nome/gestor) |
| DELETE | `/dep/:id` | Sim | Remover departamento |

---

### 💳 Crachás (`/cracha`)

Gerencia os crachás físicos.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/cracha/` | Sim | Listar todos os crachás |
| GET | `/cracha/:id` | Sim | Buscar crachá por ID |
| GET | `/cracha/status/:status` | Sim | Buscar crachás por status (perdido, emUso, disponivel) |
| POST | `/cracha/` | Sim | Criar novo crachá |
| PUT | `/cracha/:id` | Sim | Atualizar status do crachá |
| DELETE | `/cracha/:id` | Sim | Remover crachá |

---

### 🏷️ Tags RFID (`/tags`)

Gerencia as tags RFID e seus vínculos com usuários e crachás.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/tags/` | Sim | Listar todas as tags |
| GET | `/tags/latest` | Sim | Obter a tag mais recente (sem idUsuario ou geral) |
| GET | `/tags/code/:codigoTag` | Sim | Buscar tag por código |
| PUT | `/tags/code/:codigoTag/assign` | Sim | Atribuir tag a um usuário pelo código da tag |
| GET | `/tags/:id` | Sim | Buscar tag por ID |
| POST | `/tags/` | Sim | Criar nova tag |
| PUT | `/tags/:id` | Sim | Atualizar dados da tag |
| DELETE | `/tags/:id` | Sim | Remover tag |

---

### 📥 Requisições de Acesso (`/requisicao`)

Gerencia as requisições de acesso interno de funcionários.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/requisicao/` | Sim | Listar todas as requisições de acesso |
| GET | `/requisicao/:id` | Sim | Buscar requisição de acesso por ID |
| GET | `/requisicao/func/:id` | Sim | Buscar requisições de acesso por ID de funcionário |
| GET | `/requisicao/setor/:id` | Sim | Buscar requisições de acesso por ID de setor |
| POST | `/requisicao/` | Sim | Criar nova requisição de acesso |
| PUT | `/requisicao/:id` | Sim | Atualizar status da requisição de acesso |
| DELETE | `/requisicao/:id` | Sim | Remover requisição de acesso |

---

### 🧾 Requisições de Visitante (`/requisicao-visitante`)

Gerencia as requisições de visita externa.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/requisicao-visitante/` | Sim | Listar todas as requisições de visitante |
| GET | `/requisicao-visitante/:id` | Sim | Buscar requisição de visitante por ID |
| POST | `/requisicao-visitante/` | Sim | Criar nova requisição de visitante (suporta múltiplos setores) |
| PUT | `/requisicao-visitante/:id` | Sim | Atualizar status ou dados da requisição de visitante |
| PUT | `/requisicao-visitante/lote` | Sim | Atualizar status de múltiplas requisições de visitante em lote |
| DELETE | `/requisicao-visitante/:id` | Sim | Remover requisição de visitante |

#### 📌 POST `/requisicao-visitante/` - Criar nova requisição de visitante

**Descrição:** Cria uma ou mais requisições de visita para um usuário e setor(es) específico(s). Suporta a criação de múltiplas requisições se `idSetor` for um array.

**Requisição:**

```json
{
  "idUsuario": 2, // ID do usuário visitante
  "idSetor": [1, 2], // ID do(s) setor(es) a ser(em) visitado(s) (pode ser um array ou um único ID)
  "motivo": "Reunião com a gerência",
  "validade": "2026-05-21T18:00:00.000Z",
  "descricao": "Assuntos referentes ao projeto X",
  "empresa": "Empresa Visitante S.A."
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
fetch("http://localhost:3000/requisicao-visitante/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    idUsuario: 2,
    idSetor: [1, 2],
    motivo: "Reunião com a gerência",
    validade: "2026-05-21T18:00:00.000Z",
    descricao: "Assuntos referentes ao projeto X",
    empresa: "Empresa Visitante S.A."
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (201 Created):**

```json
{
  "sucesso": true,
  "mensagem": "Requisicao de visitante criada com sucesso",
  "data": [
    {
      "id": 1,
      "idUsuario": 2,
      "idSetor": 1,
      "status": "pendente",
      "dataDaRequisicao": "2026-05-20T14:00:00.000Z",
      "motivo": "Reunião com a gerência",
      "validade": "2026-05-21T18:00:00.000Z",
      "descricao": "Assuntos referentes ao projeto X",
      "empresa": "Empresa Visitante S.A.",
      "usuario": { /* dados do usuário */ },
      "setores": { /* dados do setor */ }
    },
    {
      "id": 2,
      "idUsuario": 2,
      "idSetor": 2,
      "status": "pendente",
      "dataDaRequisicao": "2026-05-20T14:00:00.000Z",
      "motivo": "Reunião com a gerência",
      "validade": "2026-05-21T18:00:00.000Z",
      "descricao": "Assuntos referentes ao projeto X",
      "empresa": "Empresa Visitante S.A.",
      "usuario": { /* dados do usuário */ },
      "setores": { /* dados do setor */ }
    }
  ]
}
```

#### 📌 PUT `/requisicao-visitante/lote` - Atualizar status de múltiplas requisições de visitante em lote

**Descrição:** Permite atualizar o status de várias requisições de visitante simultaneamente.

**Requisição:**

```json
{
  "updates": [
    {
      "id": 1,
      "status": "aprovado"
    },
    {
      "id": 2,
      "status": "recusado"
    }
  ]
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
fetch("http://localhost:3000/requisicao-visitante/lote", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    updates: [
      {
        id: 1,
        status: "aprovado"
      },
      {
        id: 2,
        status: "recusado"
      }
    ]
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Requisicoes atualizadas com sucesso",
  "data": [
    {
      "id": 1,
      "idUsuario": 2,
      "idSetor": 1,
      "status": "aprovado",
      "dataDaRequisicao": "2026-05-20T14:00:00.000Z",
      "motivo": "Reunião com a gerência",
      "validade": "2026-05-21T18:00:00.000Z",
      "descricao": "Assuntos referentes ao projeto X",
      "empresa": "Empresa Visitante S.A.",
      "usuario": { /* dados do usuário */ },
      "setores": { /* dados do setor */ }
    },
    {
      "id": 2,
      "idUsuario": 2,
      "idSetor": 2,
      "status": "recusado",
      "dataDaRequisicao": "2026-05-20T14:00:00.000Z",
      "motivo": "Reunião com a gerência",
      "validade": "2026-05-21T18:00:00.000Z",
      "descricao": "Assuntos referentes ao projeto X",
      "empresa": "Empresa Visitante S.A.",
      "usuario": { /* dados do usuário */ },
      "setores": { /* dados do setor */ }
    }
  ]
}
```

---

### 🚪 Dispositivos (`/dispositivos`)

Gerencia os dispositivos de acesso e suas configurações.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/dispositivos/` | Sim | Listar todos os dispositivos |
| GET | `/dispositivos/:id` | Sim | Buscar dispositivo por ID |
| GET | `/dispositivos/:id/:cracha` | Não | Validar crachá em dispositivo específico (público) |
| POST | `/dispositivos/` | Sim | Criar novo dispositivo |
| PUT | `/dispositivos/:id` | Sim | Atualizar dados do dispositivo |
| DELETE | `/dispositivos/:id` | Sim | Remover dispositivo |

---

### 📜 Logs de Acesso (`/logs`)

Gerencia os registros de entrada e saída.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/logs/` | Sim | Listar todos os logs |
| GET | `/logs/:id` | Sim | Buscar log por ID |
| GET | `/logs/user/:idUsuario` | Sim | Buscar logs por ID de usuário |
| GET | `/logs/device/:idDispositivo` | Sim | Buscar logs por ID de dispositivo |
| POST | `/logs/` | Sim | Criar novo log |
| PUT | `/logs/:id` | Sim | Atualizar log |
| DELETE | `/logs/:id` | Sim | Remover log |

---

### 🖼️ Avatares (`/avatar`)

Gerencia o upload e recuperação de imagens de perfil de funcionários.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/avatar/:funcId` | Não | Obter imagem de um funcionário específico |
| POST | `/avatar/:funcId` | Sim | Fazer upload de imagem para um funcionário |
| DELETE | `/avatar/:funcId` | Sim | Deletar imagem de um funcionário |
| GET | `/avatar/` | Não | Obter todas as imagens de funcionários |

#### 📌 POST `/avatar/:funcId` - Fazer upload de imagem para um funcionário

**Descrição:** Realiza o upload de uma imagem de perfil para um funcionário específico, armazenando-a no Supabase Storage e atualizando o caminho no banco de dados. O usuário autenticado deve ser o dono do funcionário ou um administrador.

**Requisição:**

```http
POST http://localhost:3000/avatar/:funcId
Content-Type: multipart/form-data
Authorization: Bearer <SEU_TOKEN_JWT>

Body: (form-data)
  avatar: [arquivo de imagem]
```

**Exemplo de `fetch` (com FormData):**

```javascript
const token = localStorage.getItem("jwtToken");
const funcId = 1;
const formData = new FormData();
const fileInput = document.querySelector("#avatar-file-input"); // Supondo um input de arquivo
formData.append("avatar", fileInput.files[0]);

fetch(`http://localhost:3000/avatar/${funcId}`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`
  },
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Avatar atualizado com sucesso",
  "data": {
    "id": 1,
    "nome": "João Silva",
    "imagem": "1/func-1-1678886400000-abc.png",
    "avatarUrl": "https://dmlshwvpsoqpptjmplfq.supabase.co/storage/v1/object/public/usuarios/1/func-1-1678886400000-abc.png"
  }
}
```

---

### 📊 Views Consolidadas (`/views`)

Endpoints que retornam dados consolidados de múltiplas tabelas para visualização em dashboards ou relatórios.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/views/requisicoes` | Sim | Obter requisições de acesso e visita consolidadas |
| GET | `/views/logs` | Sim | Obter logs detalhados de entrada e saída |
| GET | `/views/usuarios` | Sim | Obter usuários detalhados com informações de funcionário e departamento |
| GET | `/views/tags` | Sim | Obter tags detalhadas com informações de usuário e crachá |
| GET | `/views/gestores` | Sim | Obter lista de gestores |

---

### 🛂 Portaria (`/portaria`)

Endpoints específicos para o módulo de portaria, incluindo controle de visitantes e pendências.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/portaria/vlocal` | Sim | Listar visitantes locais com status de entrada/saída |
| GET | `/portaria/pendencias` | Sim | Listar requisições de visita pendentes agrupadas por visitante |
| POST | `/portaria/checkout` | Sim | Realizar check-out de um log de acesso |
| PUT | `/portaria/visitante/:id` | Sim | Atualizar dados de um visitante e sua requisição mais recente |
| DELETE | `/portaria/visitante/:id` | Sim | Remover um visitante e seus registros associados |

#### 📌 GET `/portaria/vlocal` - Listar visitantes locais com status de entrada/saída

**Descrição:** Retorna uma lista de visitantes com requisições aprovadas, incluindo seu status atual (Liberado, Dentro, Saída) com base nos logs de acesso.

**Requisição:**

```http
GET http://localhost:3000/portaria/vlocal
Authorization: Bearer <SEU_TOKEN_JWT>
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
fetch("http://localhost:3000/portaria/vlocal", {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "dados": [
    {
      "id": 2,
      "nome": "Maria Souza",
      "cpf": "98765432109",
      "empresa": "Empresa Visitante S.A.",
      "setor": "Administração, Gerência",
      "idRequisicao": 2,
      "motivo": "Reunião com a gerência",
      "descricao": "Assuntos referentes ao projeto X",
      "idLog": null,
      "entrada": null,
      "dataEntrada": null,
      "dataSaida": null,
      "celular": "(11) 91234-5678",
      "telefone": "(11) 91234-5678",
      "email": "maria.souza@example.com",
      "status": "Liberado"
    }
  ],
  "data": [
    {
      "id": 2,
      "nome": "Maria Souza",
      "cpf": "98765432109",
      "empresa": "Empresa Visitante S.A.",
      "setor": "Administração, Gerência",
      "idRequisicao": 2,
      "motivo": "Reunião com a gerência",
      "descricao": "Assuntos referentes ao projeto X",
      "idLog": null,
      "entrada": null,
      "dataEntrada": null,
      "dataSaida": null,
      "celular": "(11) 91234-5678",
      "telefone": "(11) 91234-5678",
      "email": "maria.souza@example.com",
      "status": "Liberado"
    }
  ]
}
```

#### 📌 GET `/portaria/pendencias` - Listar requisições de visita pendentes agrupadas por visitante

**Descrição:** Retorna uma lista consolidada de requisições de visita com status 'pendente', agrupadas por visitante, com informações detalhadas do usuário, empresa e setores solicitados.

**Requisição:**

```http
GET http://localhost:3000/portaria/pendencias
Authorization: Bearer <SEU_TOKEN_JWT>
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
fetch("http://localhost:3000/portaria/pendencias", {
  method: "GET",
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "dados": [
    {
      "id": 3,
      "ids": [3, 4],
      "idUsuario": 3,
      "visitante": "Visitante Teste",
      "nome": "Visitante Teste",
      "cpf": "11122233344",
      "empresa": "Empresa Teste",
      "setor": "Setor A, Setor B",
      "setores": ["Setor A", "Setor B"],
      "motivo": "Reunião",
      "descricao": "Discussão de projeto",
      "observacoes": "Discussão de projeto",
      "solicitacao": "pendente",
      "status": "pendente",
      "dataDaRequisicao": "2026-05-20T15:00:00.000Z",
      "validade": "2026-05-20T17:00:00.000Z",
      "telefone": "(11) 98765-1234",
      "celular": "(11) 98765-1234",
      "email": "visitante@example.com"
    }
  ],
  "data": [
    {
      "id": 3,
      "ids": [3, 4],
      "idUsuario": 3,
      "visitante": "Visitante Teste",
      "nome": "Visitante Teste",
      "cpf": "11122233344",
      "empresa": "Empresa Teste",
      "setor": "Setor A, Setor B",
      "setores": ["Setor A", "Setor B"],
      "motivo": "Reunião",
      "descricao": "Discussão de projeto",
      "observacoes": "Discussão de projeto",
      "solicitacao": "pendente",
      "status": "pendente",
      "dataDaRequisicao": "2026-05-20T15:00:00.000Z",
      "validade": "2026-05-20T17:00:00.000Z",
      "telefone": "(11) 98765-1234",
      "celular": "(11) 98765-1234",
      "email": "visitante@example.com"
    }
  ]
}
```

#### 📌 POST `/portaria/checkout` - Realizar check-out de um log de acesso

**Descrição:** Registra a saída de um usuário (funcionário ou visitante) com base em um `idLog` ou `idUsuario` (ou `id`). Se `idLog` for fornecido, atualiza o log específico. Caso contrário, busca o log de entrada mais recente sem saída para o `idUsuario` e o atualiza.

**Requisição:**

```json
{
  "idLog": 1, // Opcional: ID do log específico a ser atualizado
  "idUsuario": 2, // Opcional: ID do usuário para buscar o log mais recente
  "dataSaida": "2026-05-20T16:30:00.000Z" // Opcional: Data e hora da saída, padrão é a hora atual
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
fetch("http://localhost:3000/portaria/checkout", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    idUsuario: 2,
    dataSaida: "2026-05-20T16:30:00.000Z"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Check-out realizado com sucesso",
  "data": {
    "id": 1,
    "idDispositivo": 1,
    "idUsuario": 2,
    "dataDeEntrada": "2026-05-20T14:00:00.000Z",
    "dataDeSaida": "2026-05-20T16:30:00.000Z"
  }
}
```

#### 📌 PUT `/portaria/visitante/:id` - Atualizar dados de um visitante e sua requisição mais recente

**Descrição:** Atualiza os dados de um usuário que é visitante e a requisição de visita mais recente associada a ele. Não permite a atualização de funcionários.

**Requisição:**

```json
{
  "nome": "Visitante Atualizado",
  "cpf": "99988877766",
  "celular": "(11) 77777-7777",
  "email": "visitante.atualizado@example.com",
  "empresa": "Nova Empresa Visitante",
  "idSetor": 3, // ID do novo setor para a requisição
  "motivo": "Nova reunião",
  "validade": "2026-05-22T10:00:00.000Z",
  "descricao": "Discussão de novos termos"
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
const visitanteId = 2;
fetch(`http://localhost:3000/portaria/visitante/${visitanteId}`, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    nome: "Visitante Atualizado",
    cpf: "99988877766",
    celular: "(11) 77777-7777",
    email: "visitante.atualizado@example.com",
    empresa: "Nova Empresa Visitante",
    idSetor: 3,
    motivo: "Nova reunião",
    validade: "2026-05-22T10:00:00.000Z",
    descricao: "Discussão de novos termos"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Visitante atualizado com sucesso",
  "data": {
    "usuario": {
      "id": 2,
      "nome": "Visitante Atualizado",
      "cpf": "99988877766",
      "celular": "(11) 77777-7777",
      "email": "visitante.atualizado@example.com",
      "dataDeCriacao": "2026-05-15T10:10:00.000Z",
      "idEmpresa": 1,
      "idDep": null
    },
    "requisicao": {
      "id": 2,
      "idUsuario": 2,
      "idSetor": 3,
      "status": "pendente",
      "dataDaRequisicao": "2026-05-20T14:00:00.000Z",
      "motivo": "Nova reunião",
      "validade": "2026-05-22T10:00:00.000Z",
      "descricao": "Discussão de novos termos",
      "empresa": "Nova Empresa Visitante"
    }
  }
}
```

#### 📌 DELETE `/portaria/visitante/:id` - Remover um visitante e seus registros associados

**Descrição:** Remove um usuário que é visitante, juntamente com todas as tags, requisições de visita, requisições de acesso e logs associados a ele.

**Requisição:**

```http
DELETE http://localhost:3000/portaria/visitante/:id
Authorization: Bearer <SEU_TOKEN_JWT>
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
const visitanteId = 2;
fetch(`http://localhost:3000/portaria/visitante/${visitanteId}`, {
  method: "DELETE",
  headers: {
    "Authorization": `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Visitante e registros associados removidos com sucesso",
  "data": {
    "id": 2,
    "nome": "Visitante Atualizado",
    "cpf": "99988877766",
    "celular": "(11) 77777-7777",
    "email": "visitante.atualizado@example.com",
    "dataDeCriacao": "2026-05-15T10:10:00.000Z",
    "idEmpresa": 1,
    "idDep": null
  }
}
```

---

### 📍 Setores (`/setores`)

Gerencia os setores da organização.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/setores/` | Sim | Listar todos os setores |
| POST | `/setores/` | Sim | Criar novo setor |

#### 📌 POST `/setores/` - Criar novo setor

**Descrição:** Cria um novo setor na organização. O `idGestor` deve ser o `idUsuario` de um funcionário com `tipo: 'ger'`.

**Requisição:**

```json
{
  "nome": "Novo Setor",
  "idGestor": 1, // ID do usuário gestor (tipo 'ger')
  "acesso": "Restrito", // 'Liberado', 'Restrito', 'Bloqueado'
  "status": "Ativo" // 'Ativo', 'Inativo'
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem("jwtToken");
fetch("http://localhost:3000/setores/", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({
    nome: "Novo Setor",
    idGestor: 1,
    acesso: "Restrito",
    status: "Ativo"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Setor criado com sucesso"
}
```

---

### 🏢 Empresas (`/empresas`)

Gerencia as empresas cadastradas no sistema.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/empresas/` | Sim | Listar todas as empresas |

---

### 🌐 Público (`/public`)

Endpoints públicos que não exigem autenticação.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/public/stats` | Não | Obter estatísticas públicas do sistema |

#### 📌 GET `/public/stats` - Obter estatísticas públicas do sistema

**Descrição:** Retorna o número total de usuários, setores e requisições de visita para o dia atual.

**Requisição:**

```http
GET http://localhost:3000/public/stats
```

**Exemplo de `fetch`:**

```javascript
fetch("http://localhost:3000/public/stats")
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error("Erro:", error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "data": {
    "usuariosTotal": 10,
    "setoresTotal": 5,
    "visitasHoje": 3
  }
}
```

---

## Modelos de Dados (Prisma)

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Get a free hosted Postgres database in seconds: `npx create-db`

generator client {
  provider = "prisma-client-js"
  // output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// --- ENUMS ---

enum TipoFuncionario {
  func
  port
  sup
  ger
  adm
}

enum StatusCracha {
  perdido
  emUso
  disponivel
}

enum StatusRequisicao {
  pendente
  aprovado
  recusado
}

enum StatusAcesso {
  Liberado
  Restrito
  Bloqueado
}

enum StatusSetor {
  Ativo
  Inativo
}

enum TipoLog {
  port
  disp
}

// --- TABELAS ---

model Usuario {
  id            Int      @id @default(autoincrement())
  nome          String   @db.VarChar(150)
  cpf           String   @unique @db.VarChar(14)
  celular       String?  @db.VarChar(20)
  email         String   @unique @db.VarChar(150)
  dataDeCriacao DateTime @default(now())
  idEmpresa     Int?
  idDep         Int?

  // Relações
  funcionarios         Funcionario[]
  tags                 Tag[]
  requisicoesDeAcessos RequisicaoDeAcesso[]
  requisicoesDeVisitas RequisicaoDeVisita[]
  logs                 Log[]
  empresas             empresas?            @relation(fields: [idEmpresa], references: [id])
  departamentos        Departamento?        @relation(fields: [idDep], references: [id])

  @@map("usuarios")
}

model Departamento {
  id            Int      @id @default(autoincrement())
  nome          String   @unique @db.VarChar(100)
  idGestor      Int?
  dataDeCriacao DateTime @default(now())

  // Relações
  gestor               Funcionario?         @relation("GestorDepartamento", fields: [idGestor], references: [id])
  funcionarios         Funcionario[]        @relation("FuncionarioDepartamento")
  dispositivos         Dispositivo[]
  requisicoesDeAcessos RequisicaoDeAcesso[]
  requisicoesDeVisitas RequisicaoDeVisita[]
  usuarios             Usuario[]

  @@map("departamentos")
}

model Funcionario {
  id               Int             @id @default(autoincrement())
  idUsuario        Int
  idSetor          Int
  tipo             TipoFuncionario @default(func)
  dataDeNascimento DateTime?       @db.Date
  imagem           String?         @db.VarChar(255)
  senhaHash        String          @db.VarChar(255)
  dataDeCriacao    DateTime        @default(now())

  // Relações
  usuario                                     Usuario              @relation(fields: [idUsuario], references: [id])
  setores_funcionarios_idSetorTosetores       setores              @relation(fields: [idSetor], references: [id])
  gestao                                      setores[]            @relation("setores_idGestorTofuncionarios")
  departamento                                Departamento[]       @relation("FuncionarioDepartamento")

  @@map("funcionarios")
}

model Cracha {
  id     Int          @id @default(autoincrement())
  status StatusCracha @default(disponivel)
  tags   Tag[]

  @@map("crachas")
}

model Tag {
  id            Int      @id @default(autoincrement())
  idUsuario     Int
  idCracha      Int
  codigoTag     String   @unique @db.VarChar(100)
  temporario    Boolean  @default(false)
  validade      DateTime?
  dataDeCriacao DateTime @default(now())

  // Relações
  usuario Usuario @relation(fields: [idUsuario], references: [id])
  cracha  Cracha  @relation(fields: [idCracha], references: [id])

  @@map("tags")
}

model RequisicaoDeAcesso {
  id               Int              @id @default(autoincrement())
  idUsuario        Int
  idSetor          Int
  status           StatusRequisicao @default(pendente)
  dataDaRequisicao DateTime         @default(now())

  // Relações
  usuario      Usuario      @relation(fields: [idUsuario], references: [id])
  setores      setores      @relation(fields: [idSetor], references: [id])

  @@map("requisicoes_de_acessos")
}

model Dispositivo {
  id             Int      @id @default(autoincrement())
  idSetor        Int
  local          String?  @db.VarChar(150)
  dataManutencao DateTime?
  dataDeCriacao  DateTime @default(now())

  // Relações
  setores setores @relation(fields: [idSetor], references: [id])
  logs    Log[]

  @@map("dispositivos")
}

model RequisicaoDeVisita {
  id               Int              @id @default(autoincrement())
  idUsuario        Int
  idSetor          Int
  status           StatusRequisicao @default(pendente)
  motivo           String?          @db.VarChar(255)
  validade         DateTime?
  dataDaRequisicao DateTime         @default(now())
  descricao        String?
  empresa          String?          @db.VarChar(150)

  // Relações
  setores setores @relation(fields: [idSetor], references: [id], map: "requisicoes_de_visitas_idDepartamento_fkey")
  usuario Usuario @relation(fields: [idUsuario], references: [id])

  @@map("requisicoes_de_visitas")
}

model Log {
  id            Int       @id @default(autoincrement())
  idDispositivo Int
  idUsuario     Int
  dataDeEntrada DateTime?
  dataDeSaida   DateTime?

  // Relações
  dispositivo Dispositivo @relation(fields: [idDispositivo], references: [id])
  usuario     Usuario     @relation(fields: [idUsuario], references: [id])

  @@map("logs")
}

model setores {
  id                                          Int                  @id(map: "departamentos_pkey") @default(autoincrement())
  nome                                        String               @unique(map: "departamentos_nome_key") @db.VarChar(100)
  idGestor                                    Int?
  dataDeCriacao                               DateTime             @default(now())
  idDep                                       Int?
  acesso                                      StatusAcesso
  status                                      StatusSetor

  // Relações
  dispositivos                                Dispositivo[]
  funcionarios_funcionarios_idSetorTosetores  Funcionario[]        @relation("funcionarios_idSetorTosetores")
  requisicoes_de_acessos                      RequisicaoDeAcesso[]
  requisicoes_de_visitas                      RequisicaoDeVisita[]
  departamentos                               Departamento?        @relation(fields: [idDep], references: [id], onDelete: NoAction, onUpdate: NoAction, map: "departamento")
  funcionarios_setores_idGestorTofuncionarios Funcionario?         @relation("setores_idGestorTofuncionarios", fields: [idGestor], references: [id], map: "departamentos_idGestor_fkey")
}

model empresas {
  id       Int       @id @default(autoincrement())
  nome     String    @db.VarChar
  usuarios Usuario[]

  @@map("empresas")
}

// --- VIEWS ---

view view_perfil_completo_usuario {
  usuario_id        Int?             @unique
  usuario_nome      String?          @db.VarChar(150)
  email             String?          @db.VarChar(150)
  cpf               String?          @db.VarChar(14)
  celular           String?          @db.VarChar(20)
  cargo             TipoFuncionario?
  dataDeNascimento  DateTime?        @db.Date
  foto_perfil       String?          @db.VarChar(255)
  departamento_nome String?          @db.VarChar(100)
  dataDeCriacao     DateTime?
}

view view_central_requisicoes {
  id                Int?              @unique
  idUsuario         Int?
  idDepartamento    Int?
  status            StatusRequisicao?
  dataDaRequisicao  DateTime?
  tipo_requisicao   String?
  empresa_visitante String?           @db.VarChar
  validade_visita   DateTime?         @db.Timestamp(6)
}

view view_logs_detalhados {
  log_id               Int?      @unique
  usuario_nome         String?   @db.VarChar(150)
  usuario_cpf          String?   @db.VarChar(14)
  local_dispositivo    String?   @db.VarChar(150)
  dataDeEntrada        DateTime?
  dataDeSaida          DateTime?
  departamento_usuario String?   @db.VarChar(100)
}

view view_portaria_visitantes {
  id           Int?
  nome         String?   @db.VarChar(150)
  cpf          String?   @db.VarChar(14)
  empresa      String?   @db.VarChar
  setor        String?
  idRequisicao Int?
  motivo       String?   @db.VarChar(255)
  descricao    String?
  idLog        Int?
  entrada      DateTime?
  dataEntrada  DateTime?
  dataSaida    DateTime?
  celular      String?   @db.VarChar(20)
  telefone     String?   @db.VarChar(20)
  email        String?   @db.VarChar(150)
  status       String?
}

view view_gestores {
  id     Int?
  gestor String? @db.VarChar(150)
}

view view_portaria_pendencias {
  id               Int?
  ids              Int[]
  idUsuario        Int?
  nome             String?           @db.VarChar(150)
  cpf              String?           @db.VarChar(14)
  empresa          String?           @db.VarChar
  setor            String?
  motivo           String?           @db.VarChar(255)
  descricao        String?
  solicitacao      StatusRequisicao?
  status           StatusRequisicao?
  dataDaRequisicao DateTime?
  validade         DateTime?
  celular          String?           @db.VarChar(20)
  telefone         String?           @db.VarChar(20)
  email            String?           @db.VarChar(150)
}
```

---

## Códigos de Resposta

| Código | Descrição |
| --- | --- |
| `200 OK` | Requisição bem-sucedida. |
| `201 Created` | Recurso criado com sucesso. |
| `400 Bad Request` | A requisição contém sintaxe inválida ou parâmetros incorretos. |
| `401 Unauthorized` | Autenticação necessária ou falhou (token inválido/expirado). |
| `403 Forbidden` | O usuário não tem permissão para acessar o recurso. |
| `404 Not Found` | O recurso solicitado não foi encontrado. |
| `500 Internal Server Error` | Erro interno no servidor. |

---

## Notas Técnicas

- **Integração MQTT:** O backend se conecta a um broker MQTT (`mqtt://broker.hivemq.com`) e se inscreve no tópico `get-in-3td/dispositivos/res`. Mensagens recebidas neste tópico são processadas para validação de crachás, fazendo chamadas HTTP para `https://get-in-ilp5.onrender.com/dispositivos/:id/:cracha`.
- **Upload de Imagens:** O upload de avatares é feito para o Supabase Storage, utilizando o bucket `usuarios`. A URL pública para acesso às imagens é `https://dmlshwvpsoqpptjmplfq.supabase.co/storage/v1/object/public/usuarios`.
- **Views SQL:** O projeto utiliza views SQL no Prisma para consultas consolidadas, como `view_perfil_completo_usuario`, `view_central_requisicoes`, `view_logs_detalhados`, `view_portaria_visitantes` e `view_gestores`.
