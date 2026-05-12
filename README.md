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
- [🖼️ Avatares (`/api/avatar`)](#️-avatares-apiavatar)
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

# Supabase Storage
SUPABASE_URL="https://dmlshwvpsoqpptjmplfq.supabase.co"
SUPABASE_KEY="sua_chave_do_supabase"
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

#### 📌 POST `/auth/` - Registrar novo funcionário

**Descrição:** Cria uma nova conta de usuário e um registro de funcionário associado no sistema.

**Requisição:**
- **URL:** `http://localhost:3000/auth/`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "nome": "João Silva",
    "cpf": "12345678901",
    "celular": "(11) 98765-4321",
    "email": "joao.silva@example.com",
    "idDepartamento": 1, // ID de um departamento existente
    "tipo": "func",      // Tipo de funcionário (func, port, sup, ger, adm)
    "dataDeNascimento": "1990-01-01",
    "senha": "senha_segura_123"
  }
  ```

**Exemplo `fetch`:**
```javascript
fetch('http://localhost:3000/auth/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    nome: 'João Silva',
    cpf: '12345678901',
    celular: '(11) 98765-4321',
    email: 'joao.silva@example.com',
    idDepartamento: 1,
    tipo: 'func',
    dataDeNascimento: '1990-01-01',
    senha: 'senha_segura_123',
  }),
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
      "idDepartamento": 1,
      "tipo": "func",
      "dataDeNascimento": "1990-01-01T00:00:00.000Z",
      "imagem": null,
      "senhaHash": "$2a$10$...
    }
  }
}
```

**Resposta de Erro (400 Bad Request - Exemplo):**
```json
{
  "sucesso": false,
  "mensagem": "Usuário já é funcionário"
}
```

---

#### 📌 POST `/auth/login` - Autenticar usuário

**Descrição:** Autentica um usuário e retorna um token JWT para ser usado em requisições subsequentes.

**Requisição:**
- **URL:** `http://localhost:3000/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "email": "joao.silva@example.com",
    "senha": "senha_segura_123"
  }
  ```

**Exemplo `fetch`:**
```javascript
fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'joao.silva@example.com',
    senha: 'senha_segura_123',
  }),
})
.then(response => response.json())
.then(data => {
  console.log(data);
  if (data.sucesso) {
    localStorage.setItem('jwtToken', data.token); // Armazena o token
  }
})
.catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // Seu token JWT
  "sucesso": true,
  "mensagem": "login bem-sucedido",
  "data": {
    "id": 1,
    "nome": "João Silva",
    "cpf": "12345678901",
    "celular": "(11) 98765-4321",
    "email": "joao.silva@example.com",
    "dataDeCriacao": "2026-04-29T10:00:00.000Z"
  }
}
```

**Resposta de Erro (401 Unauthorized - Exemplo):**
```json
{
  "sucesso": false,
  "mensagem": "Senha incorreta"
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

#### 📌 GET `/user/` - Listar todos os usuários

**Descrição:** Retorna uma lista de todos os usuários cadastrados no sistema.

**Requisição:**
- **URL:** `http://localhost:3000/user/`
- **Headers:**
  ```
  Authorization: Bearer <SEU_TOKEN_JWT>
  ```

**Exemplo `fetch`:**
```javascript
const token = localStorage.getItem('jwtToken'); // Obtém o token armazenado

fetch('http://localhost:3000/user/', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**
```json
[
  {
    "id": 1,
    "nome": "João Silva",
    "cpf": "12345678901",
    "celular": "(11) 98765-4321",
    "email": "joao.silva@example.com",
    "dataDeCriacao": "2026-04-29T10:00:00.000Z"
  },
  {
    "id": 2,
    "nome": "Maria Souza",
    "cpf": "98765432109",
    "celular": "(11) 91234-5678",
    "email": "maria.souza@example.com",
    "dataDeCriacao": "2026-04-29T10:05:00.000Z"
  }
]
```

**Resposta de Erro (401 Unauthorized - Exemplo):**
```json
{
  "sucesso": false,
  "mensagem": "Token inválido ou expirado"
}
```

---

#### 📌 POST `/user/` - Criar um usuário simples

**Descrição:** Cria um novo registro de usuário no sistema sem vinculá-lo a um funcionário.

**Requisição:**
- **URL:** `http://localhost:3000/user/`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <SEU_TOKEN_JWT>
  ```
- **Body:**
  ```json
  {
    "nome": "Carlos Pereira",
    "cpf": "11122233344",
    "cel": "(11) 99999-8888",
    "email": "carlos.pereira@example.com"
  }
  ```

**Exemplo `fetch`:**
```javascript
const token = localStorage.getItem('jwtToken');

fetch('http://localhost:3000/user/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    nome: 'Carlos Pereira',
    cpf: '11122233344',
    cel: '(11) 99999-8888',
    email: 'carlos.pereira@example.com',
  }),
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
    "id": 3,
    "nome": "Carlos Pereira",
    "cpf": "11122233344",
    "celular": "(11) 99999-8888",
    "email": "carlos.pereira@example.com",
    "dataDeCriacao": "2026-04-29T10:10:00.000Z"
  }
}
```

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

#### 📌 POST `/func/` - Criar registro de funcionário

**Descrição:** Vincula um usuário existente a um registro de funcionário, definindo seu departamento, tipo e senha.

**Requisição:**
- **URL:** `http://localhost:3000/func/`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <SEU_TOKEN_JWT>
  ```
- **Body:**
  ```json
  {
    "idUsuario": 3, // ID de um usuário existente (ex: Carlos Pereira)
    "idDepartamento": 2, // ID de um departamento existente
    "tipo": "port",      // Tipo de funcionário (func, port, sup, ger, adm)
    "dataDeNascimento": "1985-05-15",
    "senha": "senha_porteiro_456"
  }
  ```

**Exemplo `fetch`:**
```javascript
const token = localStorage.getItem('jwtToken');

fetch('http://localhost:3000/func/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    idUsuario: 3,
    idDepartamento: 2,
    tipo: 'port',
    dataDeNascimento: '1985-05-15',
    senha: 'senha_porteiro_456',
  }),
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
    "id": 2,
    "idUsuario": 3,
    "idDepartamento": 2,
    "tipo": "port",
    "dataDeNascimento": "1985-05-15T00:00:00.000Z",
    "imagem": null,
    "senhaHash": "$2a$10$...
  }
}
```

---

### 🏢 Departamentos (`/dep`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/dep/` | Listar todos os departamentos |
| POST | `/dep/` | Criar novo departamento |
| PUT | `/dep/:id` | Atualizar departamento (nome/gestor) |
| DELETE | `/dep/:id` | Remover departamento |

#### 📌 POST `/dep/` - Criar novo departamento

**Descrição:** Adiciona um novo departamento à estrutura da empresa.

**Requisição:**
- **URL:** `http://localhost:3000/dep/`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <SEU_TOKEN_JWT>
  ```
- **Body:**
  ```json
  {
    "nome": "Portaria",
    "idGestor": 2 // Opcional: ID de um funcionário que será o gestor
  }
  ```

**Exemplo `fetch`:**
```javascript
const token = localStorage.getItem('jwtToken');

fetch('http://localhost:3000/dep/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    nome: 'Portaria',
    idGestor: 2, // ID do funcionário Carlos Pereira
  }),
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK):**
```json
{
  "sucesso": true,
  "mensagem": "Criado o departamento Portaria com sucesso!"
}
```

**Resposta de Erro (400 Bad Request - Exemplo):**
```json
{
  "sucesso": false,
  "mensagem": "Departamento já existe"
}
```

---

### 💳 Crachás (`/cracha`)
*Representa o objeto físico do crachá.*

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/cracha/` | Listar todos os crachás |
| POST | `/cracha/` | Gerar novo crachá (status padrão: disponível) |
| GET | `/cracha/status/:status` | Filtrar por status (`d`=disponível, `p`=perdido, `e`=emUso) |

#### 📌 POST `/cracha/` - Gerar novo crachá

**Descrição:** Cria um novo registro de crachá com status `disponivel`.

**Requisição:**
- **URL:** `http://localhost:3000/cracha/`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <SEU_TOKEN_JWT>
  ```
- **Body:** (Não é necessário corpo para esta requisição)

**Exemplo `fetch`:**
```javascript
const token = localStorage.getItem('jwtToken');

fetch('http://localhost:3000/cracha/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro:', error));
```

**Resposta Esperada (201 Created):**
```json
{
  "sucesso": true,
  "message": "Crachá criado com sucesso"
}
```

---

### 🏷️ Tags RFID (`/tags`)
*Vincula um código de tag física a um usuário e um crachá.*

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/tags/` | Vincular nova tag a usuário/crachá |
| GET | `/tags/:id` | Consultar detalhes de uma tag |

#### 📌 POST `/tags/` - Vincular nova tag

**Descrição:** Associa um código de tag RFID a um usuário e um crachá existente, podendo ser temporária e com validade.

**Requisição:**
- **URL:** `http://localhost:3000/tags/`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <SEU_TOKEN_JWT>
  ```
- **Body:**
  ```json
  {
    "idUsuario": 1, // ID do usuário (ex: João Silva)
    "idCracha": 1,  // ID do crachá (recém-criado)
    "codigoTag": "TAG123456",
    "temporario": false,
    "validade": null // Opcional: "YYYY-MM-DDTHH:MM:SSZ" para tags temporárias
  }
  ```

**Exemplo `fetch`:**
```javascript
const token = localStorage.getItem('jwtToken');

fetch('http://localhost:3000/tags/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    idUsuario: 1,
    idCracha: 1,
    codigoTag: 'TAG123456',
    temporario: false,
    validade: null,
  }),
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
    "idCracha": 1,
    "codigoTag": "TAG123456",
    "temporario": false,
    "validade": null,
    "dataDeCriacao": "2026-04-29T10:20:00.000Z"
  }
}
```

---

### 📥 Requisições de Acesso (`/requisicao`)
*Fluxo de solicitações de permissão para entrar em departamentos.*

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/requisicao/` | Criar nova solicitação de acesso |
| PUT | `/requisicao/:id` | Atualizar status (aprovado/recusado) |
| GET | `/requisicao/dep/:id` | Listar requisições de um departamento específico |

#### 📌 POST `/requisicao/` - Criar nova solicitação de acesso

**Descrição:** Um usuário solicita acesso a um determinado departamento.

**Requisição:**
- **URL:** `http://localhost:3000/requisicao/`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <SEU_TOKEN_JWT>
  ```
- **Body:**
  ```json
  {
    "idUsuario": 1, // ID do usuário solicitante
    "idDepartamento": 2 // ID do departamento desejado
  }
  ```

**Exemplo `fetch`:**
```javascript
const token = localStorage.getItem('jwtToken');

fetch('http://localhost:3000/requisicao/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    idUsuario: 1,
    idDepartamento: 2,
  }),
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro:', error));
```

**Resposta Esperada (201 Created):**
```json
{
  "sucesso": true,
  "mensagem": "Requisição de acesso criada com sucesso",
  "data": {
    "id": 1,
    "idUsuario": 1,
    "idDepartamento": 2,
    "status": "pendente",
    "dataDaRequisicao": "2026-04-29T10:25:00.000Z"
  }
}
```

---

### 🚪 Dispositivos (`/dispositivos`)
*Gerencia os leitores físicos instalados nos departamentos.*

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/dispositivos/` | Listar dispositivos cadastrados |
| GET | `/dispositivos/:id/:cracha` | **Validação de Acesso:** Verifica se o crachá tem permissão no dispositivo |
| POST | `/dispositivos/` | Criar novo dispositivo |

#### 📌 POST `/dispositivos/` - Criar novo dispositivo

**Descrição:** Cadastra um novo dispositivo leitor de crachás em um departamento.

**Requisição:**
- **URL:** `http://localhost:3000/dispositivos/`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <SEU_TOKEN_JWT>
  ```
- **Body:**
  ```json
  {
    "idDepartamento": 2, // ID do departamento onde o dispositivo será instalado
    "local": "Entrada Principal"
  }
  ```

**Exemplo `fetch`:**
```javascript
const token = localStorage.getItem('jwtToken');

fetch('http://localhost:3000/dispositivos/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    idDepartamento: 2,
    local: 'Entrada Principal',
  }),
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
    "idDepartamento": 2,
    "local": "Entrada Principal",
    "dataManutencao": null,
    "dataDeCriacao": "2026-04-29T10:30:00.000Z"
  }
}
```

---

#### 📌 GET `/dispositivos/:id/:cracha` - Validação de Acesso

**Descrição:** Verifica se um crachá específico (`:cracha`) tem permissão para acessar o dispositivo (`:id`) em seu departamento.

**Requisição:**
- **URL:** `http://localhost:3000/dispositivos/1/TAG123456` (Exemplo: Dispositivo ID 1, Crachá TAG123456)
- **Headers:** (Não requer autenticação JWT, pois é para uso por hardware)

**Exemplo `fetch`:**
```javascript
fetch('http://localhost:3000/dispositivos/1/TAG123456', {
  method: 'GET',
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Erro:', error));
```

**Resposta Esperada (200 OK - Acesso Permitido):**
```json
{
  "sucesso": true
}
```

**Resposta de Erro (403 Forbidden - Acesso Negado):**
```json
{
  "sucesso": false,
  "mensagem": "Acesso negado: usuário não tem permissão para acessar este dispositivo"
}
```

**Resposta de Erro (404 Not Found - Crachá/Dispositivo não cadastrado):**
```json
{
  "sucesso": false,
  "mensagem": "Cracha não cadastrado"
}
```

---

### 📜 Logs de Acesso (`/logs`)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/logs/` | Listar todos os logs de acesso |
| GET | `/logs/user/:id` | Buscar logs por ID de usuário |
| GET | `/logs/device/:id` | Buscar logs por ID de dispositivo |

---

### 🖼️ Avatares (`/api/avatar`)
*Gerencia as imagens de perfil dos usuários.*

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/avatar/:userId` | Obter avatar de um usuário específico |
| POST | `/api/avatar/:userId` | Fazer upload de avatar para um usuário |
| DELETE | `/api/avatar/:userId` | Deletar avatar de um usuário |
| GET | `/api/avatar/` | Listar todos os usuários com avatares |

#### 📌 POST `/api/avatar/:userId` - Upload de Avatar

**Descrição:** Faz upload de uma imagem de avatar para um usuário. Se o usuário já possuir um avatar, o antigo será substituído.

**Requisição:**
- **URL:** `http://localhost:3000/api/avatar/1`
- **Headers:**
  ```
  Authorization: Bearer <SEU_TOKEN_JWT>
  ```
- **Body (form-data):**
  - `avatar`: Arquivo de imagem (JPEG, PNG, GIF, WebP)

**Exemplo `fetch`:**
```javascript
const token = localStorage.getItem('jwtToken');
const formData = new FormData();
formData.append('avatar', fileInput.files[0]);

fetch('http://localhost:3000/api/avatar/1', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
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
  "mensagem": "Avatar enviado com sucesso",
  "data": {
    "id": 1,
    "nome": "João Silva",
    "avatar": "/uploads/avatar-1715000000000-123456789.jpg"
  }
}
```

---

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/logs/` | Listar histórico completo de acessos |
| GET | `/logs/user/:idUsuario` | Histórico de um usuário específico |
| GET | `/logs/device/:idDispositivo` | Histórico de um dispositivo específico |
| POST | `/logs/` | Criar novo registro de log |

#### 📌 POST `/logs/` - Criar novo registro de log

**Descrição:** Registra uma entrada ou saída de um usuário em um dispositivo.

**Requisição:**
- **URL:** `http://localhost:3000/logs/`
- **Headers:**
  ```
  Content-Type: application/json
  Authorization: Bearer <SEU_TOKEN_JWT>
  ```
- **Body:**
  ```json
  {
    "idDispositivo": 1, // ID do dispositivo
    "idUsuario": 1,     // ID do usuário
    "dataDeEntrada": "2026-04-29T10:35:00.000Z", // Opcional: Data e hora da entrada
    "dataDeSaida": null // Opcional: Data e hora da saída (pode ser atualizado depois)
  }
  ```

**Exemplo `fetch`:**
```javascript
const token = localStorage.getItem('jwtToken');

fetch('http://localhost:3000/logs/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    idDispositivo: 1,
    idUsuario: 1,
    dataDeEntrada: new Date().toISOString(),
    dataDeSaida: null,
  }),
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
    "dataDeEntrada": "2026-04-29T10:35:00.000Z",
    "dataDeSaida": null
  }
}
```

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
