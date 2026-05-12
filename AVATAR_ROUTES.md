# Documentação das Rotas de Avatar

## Visão Geral

As rotas de avatar permitem gerenciar imagens de perfil dos usuários. O sistema suporta upload, download, listagem e exclusão de avatares.

---

## Endpoints

### 1. Obter Avatar de um Usuário

**Endpoint:** `GET /api/avatar/:userId`

**Descrição:** Retorna os dados do avatar de um usuário específico.

**Parâmetros:**
- `userId` (path, obrigatório): ID do usuário

**Exemplo de Requisição:**
```bash
curl -X GET http://localhost:3000/api/avatar/1
```

**Resposta de Sucesso (200):**
```json
{
  "sucesso": true,
  "mensagem": "Avatar obtido com sucesso",
  "data": {
    "userId": 1,
    "nome": "João Silva",
    "avatar": "/uploads/avatar-1715000000000-123456789.jpg"
  }
}
```

**Resposta de Erro (404):**
```json
{
  "sucesso": false,
  "mensagem": "Avatar não encontrado para este usuário"
}
```

---

### 2. Upload de Avatar

**Endpoint:** `POST /api/avatar/:userId`

**Descrição:** Faz upload de uma imagem de avatar para um usuário. Se o usuário já possuir um avatar, o antigo será substituído.

**Parâmetros:**
- `userId` (path, obrigatório): ID do usuário
- `avatar` (form-data, obrigatório): Arquivo de imagem (JPEG, PNG, GIF, WebP)

**Limitações:**
- Tamanho máximo: 5MB
- Formatos aceitos: JPEG, PNG, GIF, WebP

**Exemplo de Requisição (usando cURL):**
```bash
curl -X POST http://localhost:3000/api/avatar/1 \
  -F "avatar=@/caminho/para/imagem.jpg"
```

**Exemplo de Requisição (usando JavaScript/Fetch):**
```javascript
const formData = new FormData();
formData.append('avatar', fileInput.files[0]);

fetch('http://localhost:3000/api/avatar/1', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => console.log(data));
```

**Resposta de Sucesso (200):**
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

**Resposta de Erro (400):**
```json
{
  "sucesso": false,
  "mensagem": "Apenas arquivos de imagem são permitidos (JPEG, PNG, GIF, WebP)"
}
```

---

### 3. Deletar Avatar

**Endpoint:** `DELETE /api/avatar/:userId`

**Descrição:** Remove o avatar de um usuário e deleta o arquivo do servidor.

**Parâmetros:**
- `userId` (path, obrigatório): ID do usuário

**Exemplo de Requisição:**
```bash
curl -X DELETE http://localhost:3000/api/avatar/1
```

**Resposta de Sucesso (200):**
```json
{
  "sucesso": true,
  "mensagem": "Avatar deletado com sucesso",
  "data": {
    "id": 1,
    "nome": "João Silva",
    "avatar": null
  }
}
```

**Resposta de Erro (404):**
```json
{
  "sucesso": false,
  "mensagem": "Este usuário não possui avatar"
}
```

---

### 4. Obter Todos os Avatares

**Endpoint:** `GET /api/avatar`

**Descrição:** Retorna uma lista de todos os usuários que possuem avatares.

**Exemplo de Requisição:**
```bash
curl -X GET http://localhost:3000/api/avatar
```

**Resposta de Sucesso (200):**
```json
{
  "sucesso": true,
  "mensagem": "Avatares obtidos com sucesso",
  "data": [
    {
      "id": 1,
      "nome": "João Silva",
      "avatar": "/uploads/avatar-1715000000000-123456789.jpg"
    },
    {
      "id": 2,
      "nome": "Maria Santos",
      "avatar": "/uploads/avatar-1715000000001-987654321.png"
    }
  ]
}
```

---

## Estrutura de Arquivos

```
backend/
├── controllers/
│   └── AvatarController.js      # Lógica de negócio para avatares
├── router/
│   └── AvatarRouter.js          # Definição das rotas
├── uploads/                      # Diretório onde os avatares são armazenados
├── server.js                     # Arquivo principal (atualizado)
└── package.json                  # Dependências (multer adicionado)
```

---

## Configuração do Banco de Dados

Certifique-se de que o modelo `Usuario` no Prisma possui o campo `avatar`:

```prisma
model Usuario {
  id       Int     @id @default(autoincrement())
  nome     String
  cpf      String
  celular  String?
  email    String?
  avatar   String? // Campo para armazenar o caminho do avatar
  // ... outros campos
}
```

Se o campo não existir, execute:
```bash
npx prisma migrate dev --name add_avatar_field
```

---

## Instalação de Dependências

Após clonar ou atualizar o projeto, instale as dependências:

```bash
cd backend
npm install
```

---

## Iniciando o Servidor

```bash
npm start
# ou
node server.js
```

O servidor estará disponível em `http://localhost:3000`

---

## Notas Importantes

1. **Armazenamento de Arquivos**: Os avatares são armazenados no **Supabase Storage**, no bucket `usuarios`.

2. **URLs de Acesso**: Os avatares podem ser acessados diretamente via URL pública gerada pelo Supabase, que é salva no campo `avatar` do banco de dados.

3. **Validação de Imagens**: O sistema valida o tipo MIME do arquivo. Apenas imagens são aceitas.

4. **Limite de Tamanho**: O tamanho máximo de arquivo é 5MB. Arquivos maiores serão rejeitados.

5. **Substituição Automática**: Se um usuário fizer upload de um novo avatar, o antigo será automaticamente deletado do Supabase Storage.

---

## Tratamento de Erros

| Código | Mensagem | Causa |
|--------|----------|-------|
| 200 | Avatar obtido/enviado/deletado com sucesso | Operação realizada com sucesso |
| 400 | Nenhum arquivo foi enviado / Apenas imagens permitidas | Requisição inválida |
| 404 | Usuário não encontrado / Avatar não encontrado | Recurso não existe |
| 500 | Erro ao [operação] avatar | Erro no servidor |

---

## Exemplos de Uso Completo

### Exemplo 1: Upload com JavaScript

```javascript
async function uploadAvatar(userId, file) {
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await fetch(`/api/avatar/${userId}`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.sucesso) {
      console.log('Avatar enviado:', result.data.avatar);
    } else {
      console.error('Erro:', result.mensagem);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
  }
}

// Uso
const fileInput = document.getElementById('avatarInput');
uploadAvatar(1, fileInput.files[0]);
```

### Exemplo 2: Obter Avatar com JavaScript

```javascript
async function getAvatar(userId) {
  try {
    const response = await fetch(`/api/avatar/${userId}`);
    const result = await response.json();
    
    if (result.sucesso) {
      const img = document.createElement('img');
      img.src = result.data.avatar;
      document.body.appendChild(img);
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

getAvatar(1);
```

### Exemplo 3: Deletar Avatar com JavaScript

```javascript
async function deleteAvatar(userId) {
  try {
    const response = await fetch(`/api/avatar/${userId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    console.log(result.mensagem);
  } catch (error) {
    console.error('Erro:', error);
  }
}

deleteAvatar(1);
```
