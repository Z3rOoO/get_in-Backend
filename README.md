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
fetch('http://localhost:3000/auth/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
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
  .catch(error => console.error('Erro:', error));
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
fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
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
    localStorage.setItem('jwtToken', data.token);
  })
  .catch(error => console.error('Erro:', error));
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
| POST | `/user/` | Sim | Criar usuário simples |
| PUT | `/user/:id` | Sim | Atualizar dados do usuário |
| DELETE | `/user/:id` | Sim | Remover usuário |

#### 📌 GET `/user/` - Listar todos os usuários

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/user/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
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
const token = localStorage.getItem('jwtToken');
const userId = 1;
fetch(`http://localhost:3000/user/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
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
const token = localStorage.getItem('jwtToken');
const userName = "João";
fetch(`http://localhost:3000/user/name/${userName}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
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
const token = localStorage.getItem('jwtToken');
const userCpf = "123";
fetch(`http://localhost:3000/user/cpf/${userCpf}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
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

#### 📌 POST `/user/` - Criar um usuário simples

**Requisição:**

```json
{
  "nome": "Maria Souza",
  "cpf": "98765432109",
  "cel": "(11) 91234-5678",
  "email": "maria.souza@example.com",
  "idDep": 1
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/user/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    nome: "Maria Souza",
    cpf: "98765432109",
    cel: "(11) 91234-5678",
    email: "maria.souza@example.com",
    idDep: 1
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
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
    "idDep": 1
  }
}
```

#### 📌 PUT `/user/:id` - Atualizar dados do usuário

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const userId = 2;
fetch(`http://localhost:3000/user/${userId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    nome: "Maria Antônia Souza",
    cel: "(11) 99887-7665"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Usuário atualizado com sucesso",
  "data": {
    "id": 2,
    "nome": "Maria Antônia Souza",
    "cpf": "98765432109",
    "celular": "(11) 99887-7665",
    "email": "maria.souza@example.com",
    "dataDeCriacao": "2026-05-15T10:00:00.000Z",
    "idEmpresa": null,
    "idDep": 1
  }
}
```

#### 📌 DELETE `/user/:id` - Remover usuário

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const userId = 2;
fetch(`http://localhost:3000/user/${userId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Usuário deletado com sucesso",
  "data": {
    "id": 2,
    "nome": "Maria Antônia Souza",
    "cpf": "98765432109",
    "celular": "(11) 99887-7665",
    "email": "maria.souza@example.com",
    "dataDeCriacao": "2026-05-15T10:00:00.000Z",
    "idEmpresa": null,
    "idDep": 1
  }
}
```

---

### 👔 Funcionários (`/func`)

Gerencia registros funcionais vinculados a usuários. O tipo do funcionário pode ser `func`, `port`, `sup`, `ger` ou `adm`.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/func/` | Sim | Listar funcionários |
| GET | `/func/:id` | Sim | Buscar funcionário por ID |
| GET | `/func/name/:nome` | Sim | Buscar funcionário por nome |
| GET | `/func/cpf/:cpf` | Sim | Buscar funcionário por CPF |
| POST | `/func/` | Sim | Criar funcionário |
| PUT | `/func/:id` | Sim | Atualizar funcionário |
| DELETE | `/func/:id` | Sim | Remover funcionário |

#### 📌 GET `/func/` - Listar funcionários

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/func/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Funcionarios lidos com sucesso",
  "data": [
    {
      "id": 1,
      "idUsuario": 1,
      "idSetor": null,
      "tipo": "func",
      "dataDeNascimento": "1990-01-01T00:00:00.000Z",
      "imagem": null,
      "senhaHash": "$2b$10$...
    }
  ]
}
```

#### 📌 GET `/func/:id` - Buscar funcionário por ID

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const funcId = 1;
fetch(`http://localhost:3000/func/${funcId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Funcionario lido com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 1,
    "idSetor": null,
    "tipo": "func",
    "dataDeNascimento": "1990-01-01T00:00:00.000Z",
    "imagem": null,
    "senhaHash": "$2b$10$...
  }
}
```

#### 📌 GET `/func/name/:nome` - Buscar funcionário por nome

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const funcName = "João";
fetch(`http://localhost:3000/func/name/${funcName}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Funcionario lido com sucesso",
  "data": [
    {
      "id": 1,
      "idUsuario": 1,
      "idSetor": null,
      "tipo": "func",
      "dataDeNascimento": "1990-01-01T00:00:00.000Z",
      "imagem": null,
      "senhaHash": "$2b$10$...
    }
  ]
}
```

#### 📌 GET `/func/cpf/:cpf` - Buscar funcionário por CPF

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const funcCpf = "123";
fetch(`http://localhost:3000/func/cpf/${funcCpf}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Funcionario lido com sucesso",
  "data": [
    {
      "id": 1,
      "idUsuario": 1,
      "idSetor": null,
      "tipo": "func",
      "dataDeNascimento": "1990-01-01T00:00:00.000Z",
      "imagem": null,
      "senhaHash": "$2b$10$...
    }
  ]
}
```

#### 📌 POST `/func/` - Criar registro de funcionário

**Requisição:**

```json
{
  "idUsuario": 1,
  "idSetor": 2,
  "tipo": "func",
  "dataDeNascimento": "1990-01-01",
  "imagem": null,
  "senha": "senha_segura_123"
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/func/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    idUsuario: 1,
    idSetor: 2,
    tipo: "func",
    dataDeNascimento: "1990-01-01",
    imagem: null,
    senha: "senha_segura_123"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (201 Created):**

```json
{
  "sucesso": true,
  "mensagem": "Funcionario criado com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 1,
    "idSetor": 2,
    "tipo": "func",
    "dataDeNascimento": "1990-01-01"
  }
}
```

#### 📌 PUT `/func/:id` - Atualizar funcionário

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const funcId = 1;
fetch(`http://localhost:3000/func/${funcId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    idSetor: 3,
    tipo: "ger"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Funcionario atualizado com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 1,
    "idSetor": 3,
    "tipo": "ger",
    "dataDeNascimento": "1990-01-01T00:00:00.000Z",
    "imagem": null,
    "senhaHash": "$2b$10$...
  }
}
```

#### 📌 DELETE `/func/:id` - Remover funcionário

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const funcId = 1;
fetch(`http://localhost:3000/func/${funcId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Funcionario deletado com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 1,
    "idSetor": 3,
    "tipo": "ger",
    "dataDeNascimento": "1990-01-01T00:00:00.000Z",
    "imagem": null,
    "senhaHash": "$2b$10$...
  }
}
```

---

### 🏢 Departamentos (`/dep`)

Gerencia departamentos da organização. No modelo atual, departamentos podem agrupar setores, usuários e dispositivos.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/dep/` | Sim | Listar departamentos |
| GET | `/dep/:id` | Sim | Buscar departamento por ID |
| POST | `/dep/` | Sim | Criar departamento |
| PUT | `/dep/:id` | Sim | Atualizar departamento |
| DELETE | `/dep/:id` | Sim | Remover departamento |

#### 📌 GET `/dep/` - Listar departamentos

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/dep/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Departamentos lidos com sucesso",
  "data": [
    {
      "id": 1,
      "nome": "Tecnologia",
      "rua": null,
      "UF": null,
      "cidade": null,
      "numero": null,
      "CEP": null,
      "tel": null,
      "id_ger": 1
    }
  ]
}
```

#### 📌 GET `/dep/:id` - Buscar departamento por ID

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const depId = 1;
fetch(`http://localhost:3000/dep/${depId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Departamento lido com sucesso",
  "data": {
    "id": 1,
    "nome": "Tecnologia",
    "rua": null,
    "UF": null,
    "cidade": null,
    "numero": null,
    "CEP": null,
    "tel": null,
    "id_ger": 1
  }
}
```

#### 📌 POST `/dep/` - Criar novo departamento

**Requisição:**

```json
{
  "nome": "Tecnologia",
  "idGestor": 1
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/dep/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    nome: "Recursos Humanos",
    id_ger: 1 // id do funcionário gestor
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Criado o departamento Recursos Humanos com sucesso!"
}
```

#### 📌 PUT `/dep/:id` - Atualizar departamento

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const depId = 1;
fetch(`http://localhost:3000/dep/${depId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    nome: "TI e Inovação"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Departamento atualizado com sucesso",
  "data": {
    "id": 1,
    "nome": "TI e Inovação",
    "rua": null,
    "UF": null,
    "cidade": null,
    "numero": null,
    "CEP": null,
    "tel": null,
    "id_ger": 1
  }
}
```

#### 📌 DELETE `/dep/:id` - Remover departamento

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const depId = 1;
fetch(`http://localhost:3000/dep/${depId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Departamento deletado com sucesso",
  "data": {
    "id": 1,
    "nome": "TI e Inovação",
    "rua": null,
    "UF": null,
    "cidade": null,
    "numero": null,
    "CEP": null,
    "tel": null,
    "id_ger": 1
  }
}
```

---

### 💳 Crachás (`/cracha`)

Gerencia o ciclo de vida dos crachás. Ao criar um novo crachá, o status inicial é definido como `disponivel`.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| POST | `/cracha/` | Sim | Criar crachá com status disponível |
| GET | `/cracha/` | Sim | Listar crachás |
| GET | `/cracha/status/:status` | Sim | Filtrar crachás por status |
| GET | `/cracha/:id` | Sim | Buscar crachá por ID |
| PUT | `/cracha/:id` | Sim | Atualizar status do crachá |
| DELETE | `/cracha/:id` | Sim | Remover crachá |

#### 📌 POST `/cracha/` - Criar crachá com status disponível

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/cracha/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (201 Created):**

```json
{
  "sucesso": true,
  "mensagem": "Crachá criado com sucesso",
  "data": {
    "id": 1,
    "status": "disponivel",
    "dataDeCriacao": "2026-05-15T10:00:00.000Z"
  }
}
```

#### 📌 GET `/cracha/` - Listar crachás

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/cracha/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Crachás lidos com sucesso",
  "data": [
    {
      "id": 1,
      "status": "disponivel",
      "dataDeCriacao": "2026-05-15T10:00:00.000Z"
    }
  ]
}
```

#### 📌 GET `/cracha/status/:status` - Filtrar crachás por status

O parâmetro `status` aceita o valor completo ou os atalhos usados no controller.

| Parâmetro | Status interpretado |
| --- | --- |
| `d` | `disponivel` |
| `p` | `perdido` |
| `e` | `emUso` |
| `disponivel` | `disponivel` |
| `perdido` | `perdido` |
| `emUso` | `emUso` |

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const status = "d"; // ou "disponivel"
fetch(`http://localhost:3000/cracha/status/${status}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Crachás lidos com sucesso",
  "data": [
    {
      "id": 1,
      "status": "disponivel",
      "dataDeCriacao": "2026-05-15T10:00:00.000Z"
    }
  ]
}
```

#### 📌 GET `/cracha/:id` - Buscar crachá por ID

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const crachaId = 1;
fetch(`http://localhost:3000/cracha/${crachaId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Crachá lido com sucesso",
  "data": {
    "id": 1,
    "status": "disponivel",
    "dataDeCriacao": "2026-05-15T10:00:00.000Z"
  }
}
```

#### 📌 PUT `/cracha/:id` - Atualizar status do crachá

**Requisição:**

```json
{
  "status": "emUso"
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const crachaId = 1;
fetch(`http://localhost:3000/cracha/${crachaId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    status: "emUso"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Crachá atualizado com sucesso",
  "data": {
    "id": 1,
    "status": "emUso",
    "dataDeCriacao": "2026-05-15T10:00:00.000Z"
  }
}
```

#### 📌 DELETE `/cracha/:id` - Remover crachá

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const crachaId = 1;
fetch(`http://localhost:3000/cracha/${crachaId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Crachá deletado com sucesso",
  "data": {
    "id": 1,
    "status": "emUso",
    "dataDeCriacao": "2026-05-15T10:00:00.000Z"
  }
}
```

---

### 🏷️ Tags RFID (`/tags`)

Gerencia tags RFID vinculadas a usuários. As tags são usadas durante a validação de acesso nos dispositivos.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/tags/` | Sim | Listar tags |
| GET | `/tags/:id` | Sim | Buscar tag por ID |
| POST | `/tags/` | Sim | Criar tag |
| PUT | `/tags/:id` | Sim | Atualizar tag |
| DELETE | `/tags/:id` | Sim | Remover tag |

#### 📌 GET `/tags/` - Listar tags

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/tags/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Tags lidas com sucesso",
  "data": [
    {
      "id": 1,
      "idUsuario": 1,
      "status": null,
      "codigoTag": "RFID-ABC-123",
      "temporario": false,
      "validade": null,
      "dataDeCriacao": "2026-05-15T10:00:00.000Z",
      "dataDeDevolucao": null
    }
  ]
}
```

#### 📌 GET `/tags/:id` - Buscar tag por ID

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const tagId = 1;
fetch(`http://localhost:3000/tags/${tagId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Tag lida com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 1,
    "status": null,
    "codigoTag": "RFID-ABC-123",
    "temporario": false,
    "validade": null,
    "dataDeCriacao": "2026-05-15T10:00:00.000Z",
    "dataDeDevolucao": null
  }
}
```

#### 📌 POST `/tags/` - Vincular nova tag

**Requisição:**

```json
{
  "idUsuario": 1,
  "codigoTag": "RFID-ABC-123",
  "temporario": false,
  "validade": null
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/tags/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    idUsuario: 1,
    codigoTag: "RFID-XYZ-456",
    temporario: false,
    validade: null
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (201 Created):**

```json
{
  "sucesso": true,
  "mensagem": "Tag criado com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 1,
    "status": null,
    "codigoTag": "RFID-ABC-123",
    "temporario": false,
    "validade": null
  }
}
```

#### 📌 PUT `/tags/:id` - Atualizar tag

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const tagId = 1;
fetch(`http://localhost:3000/tags/${tagId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    temporario: true,
    validade: "2026-12-31T23:59:59.000Z"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Tag atualizada com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 1,
    "status": null,
    "codigoTag": "RFID-ABC-123",
    "temporario": true,
    "validade": "2026-12-31T23:59:59.000Z",
    "dataDeCriacao": "2026-05-15T10:00:00.000Z",
    "dataDeDevolucao": null
  }
}
```

#### 📌 DELETE `/tags/:id` - Remover tag

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const tagId = 1;
fetch(`http://localhost:3000/tags/${tagId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Tag deletada com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 1,
    "status": null,
    "codigoTag": "RFID-ABC-123",
    "temporario": true,
    "validade": "2026-12-31T23:59:59.000Z",
    "dataDeCriacao": "2026-05-15T10:00:00.000Z",
    "dataDeDevolucao": null
  }
}
```

---

### 📥 Requisições de Acesso (`/requisicao`)

Gerencia solicitações de acesso interno de usuários a setores. O status da requisição utiliza o enum `pendente`, `aprovado` ou `recusado`.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/requisicao/` | Sim | Listar requisições de acesso |
| GET | `/requisicao/:id` | Sim | Buscar requisição por ID |
| GET | `/requisicao/func/:id` | Sim | Buscar requisições por usuário/funcionário |
| GET | `/requisicao/setor/:id` | Sim | Buscar requisições por setor |
| POST | `/requisicao/` | Sim | Criar requisição de acesso |
| PUT | `/requisicao/:id` | Sim | Atualizar status da requisição |
| DELETE | `/requisicao/:id` | Sim | Remover requisição |

#### 📌 GET `/requisicao/` - Listar requisições de acesso

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/requisicao/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Requisições lidas com sucesso",
  "data": [
    {
      "id": 1,
      "idUsuario": 1,
      "idSetor": 2,
      "status": "pendente",
      "dataDaRequisicao": "2026-05-15T10:00:00.000Z"
    }
  ]
}
```

#### 📌 GET `/requisicao/:id` - Buscar requisição por ID

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const requisicaoId = 1;
fetch(`http://localhost:3000/requisicao/${requisicaoId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Requisição lida com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 1,
    "idSetor": 2,
    "status": "pendente",
    "dataDaRequisicao": "2026-05-15T10:00:00.000Z"
  }
}
```

#### 📌 GET `/requisicao/func/:id` - Buscar requisições por usuário/funcionário

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const userId = 1;
fetch(`http://localhost:3000/requisicao/func/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Requisições lidas com sucesso",
  "data": [
    {
      "id": 1,
      "idUsuario": 1,
      "idSetor": 2,
      "status": "pendente",
      "dataDaRequisicao": "2026-05-15T10:00:00.000Z"
    }
  ]
}
```

#### 📌 GET `/requisicao/setor/:id` - Buscar requisições por setor

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const setorId = 2;
fetch(`http://localhost:3000/requisicao/setor/${setorId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Requisições lidas com sucesso",
  "data": [
    {
      "id": 1,
      "idUsuario": 1,
      "idSetor": 2,
      "status": "pendente",
      "dataDaRequisicao": "2026-05-15T10:00:00.000Z"
    }
  ]
}
```

#### 📌 POST `/requisicao/` - Criar nova solicitação de acesso

**Requisição:**

```json
{
  "idUsuario": 1,
  "idSetor": 2
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/requisicao/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    idUsuario: 1,
    idSetor: 2
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (201 Created):**

```json
{
  "sucesso": true,
  "mensagem": "Requisição criada com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 1,
    "idSetor": 2,
    "status": "pendente",
    "dataDaRequisicao": "2026-05-15T10:00:00.000Z"
  }
}
```

#### 📌 PUT `/requisicao/:id` - Atualizar status

**Requisição:**

```json
{
  "status": "aprovado"
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const requisicaoId = 1;
fetch(`http://localhost:3000/requisicao/${requisicaoId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    status: "aprovado"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Requisição atualizada com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 1,
    "idSetor": 2,
    "status": "aprovado",
    "dataDaRequisicao": "2026-05-15T10:00:00.000Z"
  }
}
```

#### 📌 DELETE `/requisicao/:id` - Remover requisição

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const requisicaoId = 1;
fetch(`http://localhost:3000/requisicao/${requisicaoId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Requisição deletada com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 1,
    "idSetor": 2,
    "status": "aprovado",
    "dataDaRequisicao": "2026-05-15T10:00:00.000Z"
  }
}
```

---

### 🧾 Requisições de Visitante (`/requisicao-visitante`)

Gerencia solicitações de acesso para visitantes externos. O status da requisição utiliza o enum `pendente`, `aprovado` ou `recusado`.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/requisicao-visitante/` | Sim | Listar requisições de visitante |
| GET | `/requisicao-visitante/:id` | Sim | Buscar requisição de visitante por ID |
| GET | `/requisicao-visitante/user/:idUsuario` | Sim | Buscar requisições de visitante por usuário |
| GET | `/requisicao-visitante/setor/:idSetor` | Sim | Buscar requisições de visitante por setor |
| POST | `/requisicao-visitante/` | Sim | Criar requisição de visitante |
| PUT | `/requisicao-visitante/:id` | Sim | Atualizar status da requisição de visitante |
| DELETE | `/requisicao-visitante/:id` | Sim | Remover requisição de visitante |

#### 📌 GET `/requisicao-visitante/` - Listar requisições de visitante

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/requisicao-visitante/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Requisições de visitante lidas com sucesso",
  "data": [
    {
      "id": 1,
      "idUsuario": 3,
      "idSetor": 2,
      "status": "pendente",
      "motivo": "Reunião com equipe comercial",
      "validade": "2026-05-20T18:00:00.000Z",
      "dataDaRequisicao": "2026-05-15T10:00:00.000Z",
      "descricao": "Visitante autorizado para reunião agendada",
      "empresa": "Empresa Parceira"
    }
  ]
}
```

#### 📌 GET `/requisicao-visitante/:id` - Buscar requisição de visitante por ID

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const requisicaoId = 1;
fetch(`http://localhost:3000/requisicao-visitante/${requisicaoId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Requisição de visitante lida com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 3,
    "idSetor": 2,
    "status": "pendente",
    "motivo": "Reunião com equipe comercial",
    "validade": "2026-05-20T18:00:00.000Z",
    "dataDaRequisicao": "2026-05-15T10:00:00.000Z",
    "descricao": "Visitante autorizado para reunião agendada",
    "empresa": "Empresa Parceira"
  }
}
```

#### 📌 GET `/requisicao-visitante/user/:idUsuario` - Buscar requisições de visitante por usuário

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const userId = 3;
fetch(`http://localhost:3000/requisicao-visitante/user/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Requisições de visitante lidas com sucesso",
  "data": [
    {
      "id": 1,
      "idUsuario": 3,
      "idSetor": 2,
      "status": "pendente",
      "motivo": "Reunião com equipe comercial",
      "validade": "2026-05-20T18:00:00.000Z",
      "dataDaRequisicao": "2026-05-15T10:00:00.000Z",
      "descricao": "Visitante autorizado para reunião agendada",
      "empresa": "Empresa Parceira"
    }
  ]
}
```

#### 📌 GET `/requisicao-visitante/setor/:idSetor` - Buscar requisições de visitante por setor

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const setorId = 2;
fetch(`http://localhost:3000/requisicao-visitante/setor/${setorId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Requisições de visitante lidas com sucesso",
  "data": [
    {
      "id": 1,
      "idUsuario": 3,
      "idSetor": 2,
      "status": "pendente",
      "motivo": "Reunião com equipe comercial",
      "validade": "2026-05-20T18:00:00.000Z",
      "dataDaRequisicao": "2026-05-15T10:00:00.000Z",
      "descricao": "Visitante autorizado para reunião agendada",
      "empresa": "Empresa Parceira"
    }
  ]
}
```

#### 📌 POST `/requisicao-visitante/` - Criar requisição de visitante

**Requisição:**

```json
{
  "idUsuario": 3,
  "idSetor": 2,
  "motivo": "Reunião com equipe comercial",
  "validade": "2026-05-20T18:00:00.000Z",
  "descricao": "Visitante autorizado para reunião agendada",
  "empresa": "Empresa Parceira"
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/requisicao-visitante/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    idUsuario: 3,
    idSetor: 2,
    motivo: "Reunião com equipe comercial",
    validade: "2026-05-20T18:00:00.000Z",
    descricao: "Visitante autorizado para reunião agendada",
    empresa: "Empresa Parceira"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (201 Created):**

```json
{
  "sucesso": true,
  "mensagem": "Requisição de visitante criada com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 3,
    "idSetor": 2,
    "status": "pendente",
    "motivo": "Reunião com equipe comercial",
    "validade": "2026-05-20T18:00:00.000Z",
    "empresa": "Empresa Parceira"
  }
}
```

#### 📌 PUT `/requisicao-visitante/:id` - Atualizar status da requisição de visitante

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const requisicaoId = 1;
fetch(`http://localhost:3000/requisicao-visitante/${requisicaoId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    status: "aprovado"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Requisição de visitante atualizada com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 3,
    "idSetor": 2,
    "status": "aprovado",
    "motivo": "Reunião com equipe comercial",
    "validade": "2026-05-20T18:00:00.000Z",
    "dataDaRequisicao": "2026-05-15T10:00:00.000Z",
    "descricao": "Visitante autorizado para reunião agendada",
    "empresa": "Empresa Parceira"
  }
}
```

#### 📌 DELETE `/requisicao-visitante/:id` - Remover requisição de visitante

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const requisicaoId = 1;
fetch(`http://localhost:3000/requisicao-visitante/${requisicaoId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Requisição de visitante deletada com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 3,
    "idSetor": 2,
    "status": "aprovado",
    "motivo": "Reunião com equipe comercial",
    "validade": "2026-05-20T18:00:00.000Z",
    "dataDaRequisicao": "2026-05-15T10:00:00.000Z",
    "descricao": "Visitante autorizado para reunião agendada",
    "empresa": "Empresa Parceira"
  }
}
```

---

### 🚪 Dispositivos (`/dispositivos`)

Gerencia dispositivos físicos usados para validação de acesso e inclui endpoint público para validação de crachá/tag.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/dispositivos/` | Sim | Listar dispositivos |
| GET | `/dispositivos/:id` | Sim | Buscar dispositivo por ID |
| POST | `/dispositivos/` | Sim | Criar dispositivo |
| GET | `/dispositivos/:id/:cracha` | Não | Validar crachá/tag em um dispositivo |
| PUT | `/dispositivos/:id` | Sim | Atualizar dispositivo |
| DELETE | `/dispositivos/:id` | Sim | Remover dispositivo |

#### 📌 GET `/dispositivos/` - Listar dispositivos

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/dispositivos/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Dispositivos lidos com sucesso",
  "data": [
    {
      "id": 1,
      "idSetor": 2,
      "local": "Entrada Principal",
      "dataManutencao": "2026-06-01T10:00:00.000Z",
      "dataDeCriacao": "2026-05-15T10:00:00.000Z",
      "idDep": 1
    }
  ]
}
```

#### 📌 GET `/dispositivos/:id` - Buscar dispositivo por ID

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const dispositivoId = 1;
fetch(`http://localhost:3000/dispositivos/${dispositivoId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Dispositivo lido com sucesso",
  "data": {
    "id": 1,
    "idSetor": 2,
    "local": "Entrada Principal",
    "dataManutencao": "2026-06-01T10:00:00.000Z",
    "dataDeCriacao": "2026-05-15T10:00:00.000Z",
    "idDep": 1
  }
}
```

#### 📌 POST `/dispositivos/` - Criar dispositivo

**Requisição:**

```json
{
  "idSetor": 2,
  "idDep": 1,
  "local": "Entrada Principal",
  "dataManutencao": "2026-06-01T10:00:00.000Z"
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/dispositivos/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    idSetor: 2,
    idDep: 1,
    local: "Entrada Secundária",
    dataManutencao: "2026-07-01T10:00:00.000Z"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (201 Created):**

```json
{
  "sucesso": true,
  "mensagem": "Dispositivo criado com sucesso",
  "data": {
    "id": 1,
    "idSetor": 2,
    "local": "Entrada Principal",
    "dataManutencao": "2026-06-01T10:00:00.000Z",
    "dataDeCriacao": "2026-05-15T10:00:00.000Z",
    "idDep": 1
  }
}
```

#### 📌 GET `/dispositivos/:id/:cracha` - Validação de acesso

**Descrição:** valida se a tag/crachá possui autorização para o setor associado ao dispositivo. O fluxo consulta a tag pelo `codigoTag`, verifica o vínculo do usuário, compara permissões e publica o resultado no tópico MQTT `dispositivos/:id`.

| Situação | Resposta esperada |
| --- | --- |
| Dispositivo não encontrado | `404` com mensagem `ERRO, DISPOSITIVO NÃO VINCULADO` |
| Tag não cadastrada | `404` com mensagem `CRACHA NAO CADASTRADO NO SISTEMA` |
| Requisição aprovada | `200` com mensagem `ACESSO PERMITIDO` |
| Requisição recusada | `200` com mensagem de acesso recusado pelo supervisor |
| Requisição pendente | `200` com mensagem de aguardando verificação |
| Sem permissão | `403` com mensagem de acesso negado ou solicitação ao supervisor |

**Exemplo de `fetch`:**

```javascript
const dispositivoId = 1;
const crachaCodigo = "RFID-ABC-123";
fetch(`http://localhost:3000/dispositivos/${dispositivoId}/${crachaCodigo}`, {
  method: 'GET'
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "ACESSO PERMITIDO"
}
```

#### 📌 PUT `/dispositivos/:id` - Atualizar dispositivo

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const dispositivoId = 1;
fetch(`http://localhost:3000/dispositivos/${dispositivoId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    local: "Entrada Principal - Revisado"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Dispositivo atualizado com sucesso",
  "data": {
    "id": 1,
    "idSetor": 2,
    "local": "Entrada Principal - Revisado",
    "dataManutencao": "2026-06-01T10:00:00.000Z",
    "dataDeCriacao": "2026-05-15T10:00:00.000Z",
    "idDep": 1
  }
}
```

#### 📌 DELETE `/dispositivos/:id` - Remover dispositivo

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const dispositivoId = 1;
fetch(`http://localhost:3000/dispositivos/${dispositivoId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Dispositivo deletado com sucesso",
  "data": {
    "id": 1,
    "idSetor": 2,
    "local": "Entrada Principal - Revisado",
    "dataManutencao": "2026-06-01T10:00:00.000Z",
    "dataDeCriacao": "2026-05-15T10:00:00.000Z",
    "idDep": 1
  }
}
```

---

### 📜 Logs de Acesso (`/logs`)

Gerencia registros de entrada e saída por usuário e dispositivo.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/logs/` | Sim | Listar logs |
| GET | `/logs/:id` | Sim | Buscar log por ID |
| GET | `/logs/user/:idUsuario` | Sim | Buscar logs por usuário |
| GET | `/logs/device/:idDispositivo` | Sim | Buscar logs por dispositivo |
| POST | `/logs/` | Sim | Criar log |
| PUT | `/logs/:id` | Sim | Atualizar log |
| DELETE | `/logs/:id` | Sim | Remover log |

#### 📌 GET `/logs/` - Listar logs

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/logs/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Logs lidos com sucesso",
  "data": [
    {
      "id": 1,
      "idDispositivo": 1,
      "idUsuario": 1,
      "dataDeEntrada": "2026-05-13T08:00:00.000Z",
      "dataDeSaida": null
    }
  ]
}
```

#### 📌 GET `/logs/:id` - Buscar log por ID

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const logId = 1;
fetch(`http://localhost:3000/logs/${logId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Log lido com sucesso",
  "data": {
    "id": 1,
    "idDispositivo": 1,
    "idUsuario": 1,
    "dataDeEntrada": "2026-05-13T08:00:00.000Z",
    "dataDeSaida": null
  }
}
```

#### 📌 GET `/logs/user/:idUsuario` - Buscar logs por usuário

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const userId = 1;
fetch(`http://localhost:3000/logs/user/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Logs lidos com sucesso",
  "data": [
    {
      "id": 1,
      "idDispositivo": 1,
      "idUsuario": 1,
      "dataDeEntrada": "2026-05-13T08:00:00.000Z",
      "dataDeSaida": null
    }
  ]
}
```

#### 📌 GET `/logs/device/:idDispositivo` - Buscar logs por dispositivo

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const dispositivoId = 1;
fetch(`http://localhost:3000/logs/device/${dispositivoId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Logs lidos com sucesso",
  "data": [
    {
      "id": 1,
      "idDispositivo": 1,
      "idUsuario": 1,
      "dataDeEntrada": "2026-05-13T08:00:00.000Z",
      "dataDeSaida": null
    }
  ]
}
```

#### 📌 POST `/logs/` - Criar novo registro de log

**Requisição:**

```json
{
  "idDispositivo": 1,
  "idUsuario": 1,
  "dataDeEntrada": "2026-05-13T08:00:00.000Z",
  "dataDeSaida": null
}
```

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/logs/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    idDispositivo: 1,
    idUsuario: 1,
    dataDeEntrada: "2026-05-13T08:00:00.000Z",
    dataDeSaida: null
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (201 Created):**

```json
{
  "sucesso": true,
  "mensagem": "Log criado com sucesso",
  "data": {
    "id": 1,
    "idDispositivo": 1,
    "idUsuario": 1,
    "dataDeEntrada": "2026-05-13T08:00:00.000Z",
    "dataDeSaida": null
  }
}
```

#### 📌 PUT `/logs/:id` - Atualizar log

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const logId = 1;
fetch(`http://localhost:3000/logs/${logId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    dataDeSaida: "2026-05-13T17:00:00.000Z"
  })
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Log atualizado com sucesso",
  "data": {
    "id": 1,
    "idDispositivo": 1,
    "idUsuario": 1,
    "dataDeEntrada": "2026-05-13T08:00:00.000Z",
    "dataDeSaida": "2026-05-13T17:00:00.000Z"
  }
}
```

#### 📌 DELETE `/logs/:id` - Remover log

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const logId = 1;
fetch(`http://localhost:3000/logs/${logId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Log deletado com sucesso",
  "data": {
    "id": 1,
    "idDispositivo": 1,
    "idUsuario": 1,
    "dataDeEntrada": "2026-05-13T08:00:00.000Z",
    "dataDeSaida": "2026-05-13T17:00:00.000Z"
  }
}
```

---

### 🖼️ Avatares (`/avatar`)

Gerencia imagens de funcionários via upload em memória com Multer e armazenamento no Supabase Storage. O banco de dados agora armazena apenas o **caminho** do arquivo no Supabase, e a API retorna a **URL pública completa** para acesso. São aceitos arquivos `JPEG`, `PNG`, `GIF` e `WebP`, com limite de **5 MB** por arquivo.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/avatar/` | Não | Listar avatares cadastrados |
| GET | `/avatar/:funcId` | Não | Obter avatar de um funcionário |
| POST | `/avatar/:funcId` | Sim | Fazer upload de avatar |
| DELETE | `/avatar/:funcId` | Sim | Remover avatar |

#### 📌 GET `/avatar/` - Listar avatares cadastrados

**Exemplo de `fetch`:**

```javascript
fetch('http://localhost:3000/avatar/', {
  method: 'GET'
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Imagens obtidas com sucesso",
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "imagem": "https://seu-projeto.supabase.co/storage/v1/object/public/usuarios/1/avatar.png"
    }
  ]
}
```

#### 📌 GET `/avatar/:funcId` - Obter avatar de um funcionário

**Exemplo de `fetch`:**

```javascript
const funcId = 1;
fetch(`http://localhost:3000/avatar/${funcId}`, {
  method: 'GET'
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Imagem obtida com sucesso",
  "data": {
    "funcId": 1,
    "nome": "João Silva",
    "imagem": "https://seu-projeto.supabase.co/storage/v1/object/public/usuarios/1/avatar.png"
  }
}
```

#### 📌 POST `/avatar/:funcId` - Upload de imagem de funcionário

**Descrição:** Requer autenticação JWT. Use `multipart/form-data` com o campo `avatar`.

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const funcId = 1;
const fileInput = document.querySelector('#avatarFileInput'); // Exemplo de input de arquivo HTML

const formData = new FormData();
formData.append('avatar', fileInput.files[0]);

fetch(`http://localhost:3000/avatar/${funcId}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Imagem enviada com sucesso",
  "data": {
    "id": 1,
    "nome": "João Silva",
    "imagem": "https://seu-projeto.supabase.co/storage/v1/object/public/usuarios/1/avatar.png"
  }
}
```

#### 📌 DELETE `/avatar/:funcId` - Remover avatar

**Descrição:** Requer autenticação JWT.

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
const funcId = 1;
fetch(`http://localhost:3000/avatar/${funcId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "mensagem": "Imagem deletada com sucesso",
  "data": {
    "id": 1,
    "nome": "João Silva",
    "imagem": null
  }
}
```

---

### 📊 Views Consolidadas (`/views`)

Fornece endpoints de leitura para consultas consolidadas usadas em dashboards, relatórios e telas administrativas. Todas as rotas exigem autenticação.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/views/requisicoes` | Sim | Listar requisições internas e externas em formato consolidado |
| GET | `/views/logs` | Sim | Listar logs com dados de usuário, dispositivo e departamento |
| GET | `/views/usuarios` | Sim | Listar perfis completos de usuários |
| GET | `/views/tags` | Sim | Listar tags com usuário, crachá e departamento vinculado |

#### 📌 GET `/views/requisicoes` - Requisições consolidadas

**Descrição:** Retorna uma lista consolidada de requisições de acesso interno e externo.

**Campos retornados:**

| Campo | Descrição |
| --- | --- |
| `id` | Identificador da requisição |
| `idUsuario` | Usuário relacionado |
| `idDepartamento` | Departamento ou setor relacionado conforme consulta consolidada |
| `status` | `pendente`, `aprovado` ou `recusado` |
| `dataDaRequisicao` | Data de criação da solicitação |
| `tipo_requisicao` | `Acesso Interno` ou `Visita Externa` |
| `empresa_visitante` | Campo consolidado para dados do visitante |
| `validade_visita` | Data de validade da visita externa |

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/views/requisicoes', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "data": [
    {
      "id": 1,
      "idUsuario": 1,
      "idDepartamento": 2,
      "status": "aprovado",
      "dataDaRequisicao": "2026-05-15T10:00:00.000Z",
      "tipo_requisicao": "Acesso Interno",
      "empresa_visitante": null,
      "validade_visita": null
    },
    {
      "id": 1,
      "idUsuario": 3,
      "idDepartamento": 2,
      "status": "aprovado",
      "dataDaRequisicao": "2026-05-15T10:00:00.000Z",
      "tipo_requisicao": "Visita Externa",
      "empresa_visitante": "Empresa Parceira",
      "validade_visita": "2026-05-20T18:00:00.000Z"
    }
  ]
}
```

#### 📌 GET `/views/logs` - Logs detalhados

**Descrição:** Retorna logs de acesso enriquecidos com informações de usuário, dispositivo e departamento.

**Campos retornados:** `log_id`, `usuario_nome`, `usuario_cpf`, `local_dispositivo`, `dataDeEntrada`, `dataDeSaida` e `departamento_usuario`.

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/views/logs', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "data": [
    {
      "log_id": 1,
      "usuario_nome": "João Silva",
      "usuario_cpf": "12345678901",
      "local_dispositivo": "Entrada Principal",
      "dataDeEntrada": "2026-05-13T08:00:00.000Z",
      "dataDeSaida": "2026-05-13T17:00:00.000Z",
      "departamento_usuario": "TI e Inovação"
    }
  ]
}
```

#### 📌 GET `/views/usuarios` - Usuários detalhados

**Descrição:** Retorna um perfil consolidado de usuários, incluindo dados de funcionário e departamento, com a `foto_perfil` como URL pública completa.

**Campos retornados:** `usuario_id`, `usuario_nome`, `email`, `cpf`, `celular`, `cargo`, `dataDeNascimento`, `foto_perfil` (URL pública), `departamento_nome` e `dataDeCriacao`.

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/views/usuarios', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "data": [
    {
      "usuario_id": 1,
      "usuario_nome": "João Silva",
      "email": "joao.silva@example.com",
      "cpf": "12345678901",
      "celular": "(11) 98765-4321",
      "cargo": "ger",
      "dataDeNascimento": "1990-01-01T00:00:00.000Z",
      "foto_perfil": "https://seu-projeto.supabase.co/storage/v1/object/public/usuarios/1/avatar.png",
      "departamento_nome": "TI e Inovação",
      "dataDeCriacao": "2026-05-15T10:00:00.000Z"
    }
  ]
}
```

#### 📌 GET `/views/tags` - Tags detalhadas

**Descrição:** Retorna tags RFID com informações detalhadas do usuário, status do crachá, temporariedade, validade e departamento vinculado.

**Campos retornados:** `codigoTag`, `usuario_id`, `usuario_nome`, `status_cracha`, `temporario`, `validade_tag` e `departamento_vinculado`.

**Exemplo de `fetch`:**

```javascript
const token = localStorage.getItem('jwtToken');
fetch('http://localhost:3000/views/tags', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "data": [
    {
      "codigoTag": "RFID-ABC-123",
      "usuario_id": 1,
      "usuario_nome": "João Silva",
      "status_cracha": "emUso",
      "temporario": true,
      "validade_tag": "2026-12-31T23:59:59.000Z",
      "departamento_vinculado": "TI e Inovação"
    }
  ]
}
```

---

### 🛂 Portaria (`/portaria`)

Fornece consulta voltada para acompanhamento de visitantes na portaria.

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| GET | `/portaria/vlocal` | Não | Listar visitantes com informações de entrada, saída e status |

#### 📌 GET `/portaria/vlocal` - Visitantes no local

**Exemplo de `fetch`:**

```javascript
fetch('http://localhost:3000/portaria/vlocal', {
  method: 'GET'
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**

```json
{
  "sucesso": true,
  "dados": [
    {
      "id": 3,
      "nome": "Maria Souza",
      "empresa": "Empresa Parceira",
      "setor": "Recepção",
      "entrada": "2026-05-13T08:00:00.000Z",
      "saida": null,
      "status": "Dentro"
    }
  ]
}
```

---

## Modelos de Dados (Prisma)

O schema atual utiliza PostgreSQL e define modelos para usuários, departamentos, funcionários, tags, requisições, dispositivos, logs, setores e empresas, além de views para consultas consolidadas.

### Principais Entidades:

| Entidade | Tabela/View | Descrição |
| --- | --- |
| `Usuario` | `usuarios` | Dados básicos de identificação e contato |
| `Departamento` | `departamentos` | Estrutura organizacional principal |
| `Funcionario` | `funcionarios` | Dados funcionais, cargo, setor e senha hash |
| `Tag` | `tags` | Tags RFID vinculadas a usuários |
| `RequisicaoDeAcesso` | `requisicoes_de_acessos` | Solicitações internas de acesso a setores |
| `RequisicaoDeVisita` | `requisicoes_de_visitas` | Solicitações de visitas externas |
| `Dispositivo` | `dispositivos` | Dispositivos físicos de controle de acesso |
| `Log` | `logs` | Registros de entrada e saída |
| `setores` | `setores` | Setores associados a departamentos |
| `empresas` | `empresas` | Empresas vinculadas a usuários visitantes |
| `view_central_requisicoes` | view | Consolidação de requisições internas e externas |
| `view_logs_detalhados` | view | Logs enriquecidos para consulta |
| `view_perfil_completo_usuario` | view | Perfil consolidado de usuários |
| `view_portaria_visitantes` | view | Consulta de visitantes para portaria |

### Enums:

| Enum | Valores |
| --- | --- |
| `TipoFuncionario` | `func`, `port`, `sup`, `ger`, `adm` |
| `StatusCracha` | `perdido`, `emUso`, `disponivel` |
| `StatusRequisicao` | `pendente`, `aprovado`, `recusado` |

---

## Códigos de Resposta

| Código | Significado | Uso comum na API |
| --- | --- | --- |
| `200 OK` | Operação concluída com sucesso | Consultas, atualizações e exclusões |
| `201 Created` | Recurso criado com sucesso | Cadastros de usuários, funcionários, tags, logs e requisições |
| `400 Bad Request` | Dados inválidos ou regra de negócio violada | Campos obrigatórios ausentes ou registro já existente |
| `401 Unauthorized` | Token ausente, inválido ou expirado | Rotas protegidas sem autenticação válida |
| `403 Forbidden` | Acesso negado | Usuário sem permissão para recurso ou departamento |
| `404 Not Found` | Recurso não encontrado | Entidades inexistentes ou listas vazias tratadas como erro |
| `500 Internal Server Error` | Erro interno da aplicação | Falhas de banco, storage, MQTT ou exceções inesperadas |

---

## Notas Técnicas

- O projeto utiliza `type: "module"`, portanto os arquivos usam sintaxe `import/export`.
- A conexão Prisma ativa depende de `DATABASE_URL` e do adapter PostgreSQL configurado em `backend/config/prisma.js`.
- O bucket usado pelo módulo Supabase é `usuarios`.
- A validação de crachá em `/dispositivos/:id/:cracha` publica mensagens no broker MQTT configurado no código.
- Algumas partes do código ainda carregam nomes legados de campos ou modelos, como `idDepartamento` e `logDeAcesso`. Ao evoluir a API, recomenda-se alinhar controllers, schema Prisma, migrations e documentação para evitar divergências entre contrato HTTP e modelo persistido.
