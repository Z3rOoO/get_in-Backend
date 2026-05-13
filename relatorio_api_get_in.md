# Relatório de Análise da API GET IN

## 1. Visão Geral da API

A API Backend do sistema **GET IN** é uma solução desenvolvida para controle de acessos, gestão de funcionários e visitantes em ambientes corporativos. Ela permite o controle granular de quem pode acessar determinados departamentos, utilizando dispositivos de leitura de tags/crachás e um sistema de requisições de acesso. As principais funcionalidades incluem gestão de identidade, controle de acesso, workflow de requisições e monitoramento de logs [1].

### Stack Tecnológica

A API é construída com a seguinte stack tecnológica [1]:

| Componente | Tecnologia |
|---|---|
| **Ambiente de Execução** | Node.js |
| **Framework Web** | Express.js |
| **Linguagem** | JavaScript (ES Modules) |
| **ORM** | Prisma |
| **Banco de Dados** | PostgreSQL |
| **Autenticação** | JWT (JSON Web Tokens) |
| **Criptografia** | bcryptjs |

## 2. Estrutura do Projeto

A estrutura do projeto segue uma organização modular, com diretórios dedicados a diferentes aspectos da aplicação [1]:

```
backend/
├── config/         # Configurações de banco e Prisma
├── controllers/    # Lógica de negócio (regras e processamento)
├── middleware/     # Middlewares (ex: AuthMiddleware)
├── prisma/         # Schema do banco de dados e migrações
├── router/         # Definição das rotas da API
└── server.js       # Ponto de entrada da aplicação
```

## 3. Endpoints Identificados

Com base na análise dos arquivos `server.js` e dos roteadores (`router/`), os seguintes grupos de endpoints foram identificados:

| Rota Base | Descrição | Endpoints Principais (Exemplos) |
|---|---|---|
| `/auth` | Autenticação de usuários e registro de funcionários. | `POST /auth/`, `POST /auth/login` |
| `/user` | Gerenciamento de dados básicos de usuários. | `GET /user/`, `GET /user/:id`, `POST /user/` |
| `/func` | Gerenciamento de vínculos profissionais e dados de funcionários. | `GET /func/`, `POST /func/` |
| `/dep` | Gerenciamento de departamentos. | `GET /dep/`, `POST /dep/` |
| `/cracha` | Gerenciamento de crachás físicos. | `GET /cracha/`, `POST /cracha/` |
| `/tags` | Vinculação de tags RFID a usuários e crachás. | `POST /tags/`, `GET /tags/:id` |
| `/requisicao` | Fluxo de solicitações de acesso a departamentos. | `POST /requisicao/`, `PUT /requisicao/:id` |
| `/requisicao-visitante` | Fluxo de solicitações de acesso para visitantes. | (Não detalhado no escopo inicial) |
| `/dispositivos` | Gerenciamento de dispositivos e validação de crachás. | `GET /dispositivos/`, `GET /dispositivos/:id/:cracha` |
| `/logs` | Registro e consulta de logs de acesso. | (Não detalhado no escopo inicial) |
| `/views` | Endpoints para visualizações agregadas de dados. | (Não detalhado no escopo inicial) |
| `/api/avatar` | Upload e gerenciamento de avatares de usuários. | `POST /api/avatar`, `GET /api/avatar/:funcId` |

## 4. Resultados dos Testes Online

Foram realizados testes nos seguintes endpoints da API online (`https://get-in-ilp5.onrender.com`):

### 4.1. Endpoint de Saúde (`GET /health`)

*   **Requisição:** `GET https://get-in-ilp5.onrender.com/health`
*   **Status Code:** `200 OK`
*   **Resposta:** `{"ok": true}`
*   **Observação:** O endpoint de saúde está funcionando corretamente, indicando que a aplicação base está ativa e respondendo.

### 4.2. Endpoint de Login (`POST /auth/login`)

*   **Requisição:** `POST https://get-in-ilp5.onrender.com/auth/login` com dados inválidos.
*   **Status Code:** `500 Internal Server Error`
*   **Resposta:**
    ```json
    {
      "sucesso": false,
      "mensagem": "Erro ao realizar login",
      "erro": "\nInvalid `prisma.usuario.findUnique()` invocation:\n\n\nThe column `usuarios.empresa` does not exist in the current database."
    }
    ```
*   **Observação:** Ocorreu um erro interno no servidor. A mensagem de erro do Prisma (`The column usuarios.empresa does not exist in the current database.`) sugere uma **incompatibilidade no esquema do banco de dados**. Isso pode indicar que o banco de dados implantado na Render não possui a coluna `empresa` na tabela `usuarios`, ou que a migração do Prisma não foi aplicada corretamente no ambiente de produção, ou que o código está esperando uma coluna que foi removida ou renomeada no banco de dados.

### 4.3. Endpoint de Usuários (`GET /user`)

*   **Requisição:** `GET https://get-in-ilp5.onrender.com/user` (sem token de autenticação)
*   **Status Code:** `401 Unauthorized`
*   **Resposta:**
    ```json
    {
      "sucesso": false,
      "mensagem": "Token não fornecido"
    }
    ```
*   **Observação:** O middleware de autenticação está funcionando conforme o esperado, protegendo a rota `/user` e exigindo um token JWT válido. Isso confirma que a segurança básica da API está ativa.

### 4.4. Endpoint de Verificação de Crachá (`GET /dispositivos/:id/:cracha`)

*   **Requisição:** `GET https://get-in-ilp5.onrender.com/dispositivos/1/12345`
*   **Status Code:** `502 Bad Gateway`
*   **Resposta:** Vazia (ou erro de gateway)
*   **Observação:** O endpoint `verificarCracha` retornou um erro `502 Bad Gateway`. Este tipo de erro geralmente indica um problema na comunicação entre o servidor da aplicação e um serviço externo (como o broker MQTT, conforme identificado na análise do `DispositivosController.js`) ou um problema de configuração de rede/proxy no ambiente de hospedagem. É provável que a conexão com o broker MQTT (`mqtt://broker.hivemq.com`) não esteja sendo estabelecida ou esteja falhando no ambiente da Render.

## 5. Recomendações e Próximos Passos

1.  **Corrigir o Erro de Schema do Banco de Dados:** O erro no endpoint de login é crítico. É fundamental verificar o esquema do banco de dados no ambiente da Render. Assegure-se de que todas as migrações do Prisma foram aplicadas corretamente e que o esquema do banco de dados corresponde ao que a aplicação espera. Se a coluna `usuarios.empresa` não deveria existir, o código deve ser ajustado para não tentar acessá-la. Se ela deveria existir, a migração do banco de dados precisa ser executada ou corrigida.
2.  **Investigar o Erro 502 no Endpoint de Crachá:** O erro `502 Bad Gateway` no endpoint de verificação de crachá aponta para um problema de conectividade ou configuração com o serviço MQTT. Verifique as configurações de rede do ambiente da Render, as variáveis de ambiente relacionadas ao MQTT (se houver) e se o broker MQTT (`broker.hivemq.com`) é acessível a partir do ambiente de hospedagem.
3.  **Configurar Variáveis de Ambiente:** Certifique-se de que todas as variáveis de ambiente necessárias (`JWT_SECRET`, `JWT_EXPIRES_IN`, `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_KEY`, etc.) estão configuradas corretamente no ambiente da Render, conforme especificado no `.env.example` do repositório [1]. Valores incorretos ou ausentes podem causar comportamentos inesperados e erros.
4.  **Testar Autenticação com Credenciais Válidas:** Uma vez que o erro de schema do banco de dados for resolvido, será possível tentar registrar um usuário e realizar o login para obter um token JWT. Com um token válido, mais endpoints protegidos por autenticação poderão ser testados para verificar seu funcionamento completo.
5.  **Documentação Detalhada dos Endpoints:** Embora o `README.md` forneça uma boa visão geral, uma documentação mais detalhada (por exemplo, usando Swagger/OpenAPI) seria benéfica para facilitar o consumo e teste da API, especialmente para endpoints com lógicas mais complexas ou muitos parâmetros.

## Referências

[1] [Z3rOoO/get_in-Backend - GitHub](https://github.com/Z3rOoO/get_in-Backend/blob/main/README.md)
