# Documentação das Rotas de Imagem de Funcionários

## Visão Geral

As rotas de imagem permitem gerenciar as fotos de perfil dos **funcionários**. O sistema utiliza o **Supabase Storage** para armazenamento e salva a URL no campo `imagem` da tabela `funcionarios`.

---

## Endpoints

### 1. Obter Imagem de um Funcionário

**Endpoint:** `GET /api/avatar/:funcId`

**Descrição:** Retorna os dados da imagem de um funcionário específico.

**Parâmetros:**
- `funcId` (path, obrigatório): ID do funcionário

**Resposta de Sucesso (200):**
```json
{
  "sucesso": true,
  "mensagem": "Imagem obtida com sucesso",
  "data": {
    "funcId": 1,
    "nome": "João Silva",
    "imagem": "https://dmlshwvpsoqpptjmplfq.supabase.co/storage/v1/object/public/usuarios/func-1-1715000000.jpg"
  }
}
```

---

### 2. Upload de Imagem

**Endpoint:** `POST /api/avatar/:funcId`

**Descrição:** Faz upload de uma imagem para um funcionário. Salva a URL no campo `imagem` da tabela `funcionarios`.

**Parâmetros:**
- `funcId` (path, obrigatório): ID do funcionário
- `avatar` (form-data, obrigatório): Arquivo de imagem

**Exemplo `fetch`:**
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

---

### 3. Deletar Imagem

**Endpoint:** `DELETE /api/avatar/:funcId`

**Descrição:** Remove a imagem do funcionário do Supabase e limpa o campo `imagem` no banco de dados.

**Parâmetros:**
- `funcId` (path, obrigatório): ID do funcionário

---

### 4. Obter Todas as Imagens

**Endpoint:** `GET /api/avatar`

**Descrição:** Retorna uma lista de todos os funcionários que possuem imagens.

---

## Configuração do Banco de Dados

O sistema utiliza a tabela `funcionarios` e o campo `imagem`:

```prisma
model Funcionario {
  id        Int     @id @default(autoincrement())
  idUsuario Int
  imagem    String? @db.VarChar(255) // Campo utilizado para a URL do Supabase
  // ...
}
```

---

## Notas Técnicas

1. **Storage**: Supabase Storage (Bucket: `usuarios`).
2. **Substituição**: Ao enviar uma nova imagem, a antiga é automaticamente removida do Supabase.
3. **URL Pública**: O campo `imagem` armazena a URL pública completa para acesso direto.
