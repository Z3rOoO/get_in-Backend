# GET IN - Back-end API

Back-end do **GET IN**, uma API para controle de acesso corporativo, gestao de usuarios, funcionarios, visitantes, crachas, tags RFID, dispositivos, logs, portaria, aprovacoes e relatorios.

Este repositorio contem a API Node.js/Express e a camada de persistencia Prisma/PostgreSQL consumida pelo front-end do projeto GET IN.

---

## Indice

- [Visao geral](#visao-geral)
- [Principais funcionalidades](#principais-funcionalidades)
- [Stack tecnologica](#stack-tecnologica)
- [Pre-requisitos](#pre-requisitos)
- [Configuracao de ambiente](#configuracao-de-ambiente)
- [Instalacao e execucao](#instalacao-e-execucao)
- [Scripts disponiveis](#scripts-disponiveis)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Autenticacao](#autenticacao)
- [Rotas da API](#rotas-da-api)
- [Banco de dados e Prisma](#banco-de-dados-e-prisma)
- [Integracao com Supabase Storage](#integracao-com-supabase-storage)
- [Integracao com MQTT e dispositivos](#integracao-com-mqtt-e-dispositivos)
- [Testes](#testes)
- [Notas de seguranca](#notas-de-seguranca)

---

## Visao geral

O GET IN centraliza o fluxo de entrada, permanencia e saida de pessoas em uma empresa. A API fornece recursos para:

- Autenticar funcionarios por JWT.
- Cadastrar usuarios, funcionarios e visitantes.
- Registrar empresas visitantes e setores internos.
- Controlar crachas e tags RFID fisicas ou virtuais.
- Criar e analisar requisicoes de acesso.
- Apoiar a operacao da portaria.
- Registrar logs de entrada e saida por dispositivo.
- Consultar views consolidadas para dashboard, portaria e auditoria.
- Integrar dispositivos fisicos por MQTT.
- Armazenar avatares no Supabase Storage.

---

## Principais funcionalidades

- Login e cadastro com senha criptografada por bcrypt.
- Protecao de rotas por middleware JWT.
- CRUD de usuarios, funcionarios, departamentos, setores, empresas, crachas, tags e dispositivos.
- Workflow de requisicoes de funcionario e visitante.
- Aprovacao em lote de requisicoes de visitantes.
- Views SQL para consultas consolidadas.
- Check-out de visitantes pela portaria.
- Relatorios de acesso com filtros.
- Preferencias de usuario em JSON.
- Upload, consulta e exclusao de avatar.
- Validacao de acesso por dispositivo fisico usando tag/cracha.
- Publicacao de respostas para dispositivos via MQTT.

---

## Stack tecnologica

| Camada | Tecnologia |
| --- | --- |
| Runtime | Node.js |
| Framework HTTP | Express 5 |
| Linguagem | JavaScript com ES Modules |
| ORM | Prisma 7 |
| Banco de dados | PostgreSQL |
| Driver/adapter | `pg` e `@prisma/adapter-pg` |
| Autenticacao | JWT |
| Senhas | bcrypt |
| Upload | Multer |
| Storage externo | Supabase Storage |
| Dispositivos | MQTT |
| Testes | `node:test` |
| Configuracao | dotenv |

---

## Pre-requisitos

- Node.js compativel com as dependencias do projeto.
- npm.
- PostgreSQL acessivel por `DATABASE_URL`.
- Projeto Supabase com bucket para avatares.
- Broker MQTT, quando a validacao por dispositivo fisico for usada.
- Front-end GET IN configurado para consumir esta API.

Em desenvolvimento local, o padrao documentado e:

- API: `http://localhost:8080`
- Front-end: `http://localhost:3000`

---

## Configuracao de ambiente

Crie um arquivo `.env` dentro da pasta `backend/`:

```text
get_in-Backend/
└── backend/
    └── .env
```

Template seguro:

```env
PORT=8080
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

DATABASE_URL=postgresql://usuario:senha@localhost:5432/get_in_db?schema=public

JWT_SECRET=troque_por_um_segredo_forte
JWT_EXPIRES_IN=9h

SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_do_supabase
SUPABASE_BUCKET_NAME=usuarios
SUPABASE_PUBLIC_BASE_URL=https://seu-projeto.supabase.co/storage/v1/object/public/usuarios

MQTT_BROKER_URL=mqtt://broker.hivemq.com
MQTT_RESPONSE_TOPIC=get-in-3td/dispositivos/res
MQTT_COMMAND_TOPIC_PREFIX=get-in-3td/dispositivos
```

### Variaveis

| Variavel | Obrigatoria | Descricao |
| --- | --- | --- |
| `PORT` | Nao | Porta HTTP da API. O codigo usa `3000` como fallback. O projeto recomenda `8080` localmente. |
| `NODE_ENV` | Nao | Ambiente de execucao. Use `development` localmente e `production` em deploy. |
| `CORS_ORIGINS` | Nao | Lista separada por virgulas com origens permitidas. Em desenvolvimento ha fallback para localhost. |
| `DATABASE_URL` | Sim | String de conexao PostgreSQL usada pelo Prisma. |
| `JWT_SECRET` | Sim | Segredo usado para assinar tokens JWT. |
| `JWT_EXPIRES_IN` | Nao | Tempo de expiracao do token. Fallback: `9h`. |
| `SUPABASE_URL` | Sim | URL do projeto Supabase. |
| `SUPABASE_KEY` | Sim | Chave usada pelo servidor para acessar o Supabase. |
| `SUPABASE_BUCKET_NAME` | Nao | Bucket de avatares. Fallback: `usuarios`. |
| `SUPABASE_PUBLIC_BASE_URL` | Nao | URL publica base dos objetos. Se ausente, e montada a partir de `SUPABASE_URL` e bucket. |
| `MQTT_BROKER_URL` | Nao | URL do broker MQTT. Fallback: `mqtt://broker.hivemq.com`. |
| `MQTT_RESPONSE_TOPIC` | Nao | Topico que a API assina para receber mensagens dos dispositivos. |
| `MQTT_COMMAND_TOPIC_PREFIX` | Nao | Prefixo usado para publicar respostas para dispositivos. |

> Nao versionar `.env` real. Use apenas templates com placeholders.

---

## Instalacao e execucao

Acesse a pasta da API:

```bash
cd backend
```

Instale as dependencias:

```bash
npm install
```

Crie o arquivo de ambiente:

```bash
cp dotenvexample .env
```

No Windows PowerShell, se preferir:

```powershell
Copy-Item dotenvexample .env
```

Edite o `.env` com valores reais do ambiente local.

Aplicar migrations e gerar Prisma Client:

```bash
npx prisma migrate dev
npx prisma generate
```

Executar em desenvolvimento:

```bash
npm run dev
```

Executar em modo normal:

```bash
npm start
```

Verificar disponibilidade:

```http
GET http://localhost:8080/health
```

Resposta esperada:

```json
{
  "ok": true
}
```

---

## Scripts disponiveis

| Script | Comando | Descricao |
| --- | --- | --- |
| Start | `npm start` | Inicia a API com `node server.js`. |
| Desenvolvimento | `npm run dev` | Inicia a API com `node --watch server.js`. |
| Prisma generate | `npm run prisma:generate` | Gera o Prisma Client. |
| Postinstall | `npm run postinstall` | Executa `prisma generate` apos instalacao. |
| Testes | `npm test` | Executa testes com `node --test`. |

---

## Estrutura do projeto

```text
get_in-Backend/
├── README.md
└── backend/
    ├── config/           # Ambiente, Prisma, Supabase, MQTT e utilitarios
    ├── controllers/      # Regras de negocio chamadas pelas rotas
    ├── middleware/       # Autenticacao JWT
    ├── prisma/           # Schema, migrations e views SQL
    ├── router/           # Definicao dos endpoints
    ├── services/         # Servicos de dominio, logs, crachas e dispositivos
    ├── test/             # Testes automatizados
    ├── dotenvexample     # Exemplo seguro de variaveis
    ├── package.json
    ├── prisma.config.ts
    └── server.js         # Entrada da aplicacao Express
```

---

## Autenticacao

A autenticacao usa JWT.

Fluxo basico:

1. O cliente envia credenciais para `POST /auth/login`.
2. A API valida usuario e senha.
3. A API retorna token JWT e dados do usuario/funcionario.
4. O cliente envia o token nas rotas protegidas:

```http
Authorization: Bearer <token>
```

Rotas protegidas usam o middleware:

```text
backend/middleware/AuthMiddleware.js
```

Quando o token esta ausente, invalido ou expirado, a API retorna erro de autorizacao.

---

## Rotas da API

### Status

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/health` | Nao | Verifica se a API esta online. |

### Autenticacao - `/auth`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| POST | `/auth/` | Nao | Registra usuario e funcionario associado. |
| POST | `/auth/login` | Nao | Autentica usuario e retorna JWT. |

### Usuarios - `/user`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/user` | Sim | Lista usuarios. |
| GET | `/user/me/profile` | Sim | Consulta perfil do usuario autenticado. |
| PUT | `/user/me/profile` | Sim | Atualiza perfil do usuario autenticado. |
| PUT | `/user/me/password` | Sim | Atualiza senha do usuario autenticado. |
| GET | `/user/me/preferences` | Sim | Consulta preferencias do usuario autenticado. |
| PUT | `/user/me/preferences` | Sim | Atualiza preferencias do usuario autenticado. |
| GET | `/user/name/:nome` | Sim | Busca usuario por nome. |
| GET | `/user/cpf/:cpf` | Sim | Busca usuario por CPF. |
| GET | `/user/:id` | Sim | Busca usuario por ID. |
| POST | `/user` | Sim | Cria usuario. |
| PUT | `/user/:id` | Sim | Atualiza usuario. |
| DELETE | `/user/:id` | Sim | Remove usuario. |

### Funcionarios - `/func`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/func` | Sim | Lista funcionarios. |
| GET | `/func/view` | Nao | Lista funcionarios com dados consolidados. |
| GET | `/func/:id` | Sim | Busca funcionario por ID. |
| GET | `/func/name/:nome` | Sim | Busca funcionario por nome. |
| GET | `/func/cpf/:cpf` | Sim | Busca funcionario por CPF. |
| POST | `/func` | Sim | Cria funcionario. |
| PUT | `/func/:id` | Sim | Atualiza funcionario. |
| DELETE | `/func/:id` | Sim | Remove funcionario. |

### Departamentos - `/dep`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/dep` | Sim | Lista departamentos. |
| GET | `/dep/:id` | Sim | Busca departamento por ID. |
| POST | `/dep` | Sim | Cria departamento. |
| PUT | `/dep/:id` | Sim | Atualiza departamento. |
| DELETE | `/dep/:id` | Sim | Remove departamento. |

### Setores - `/setores`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/setores` | Sim | Lista setores. |
| GET | `/setores/:id` | Sim | Busca setor por ID. |
| POST | `/setores` | Sim | Cria setor. |
| PUT | `/setores/:id` | Sim | Atualiza setor. |
| DELETE | `/setores/:id` | Sim | Remove setor. |

### Empresas - `/empresas`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/empresas` | Sim | Lista empresas. |
| POST | `/empresas` | Sim | Cria empresa. |
| PUT | `/empresas/:id` | Sim | Atualiza empresa. |
| DELETE | `/empresas/:id` | Sim | Remove empresa. |

### Crachas - `/cracha`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| POST | `/cracha` | Sim | Cria cracha. |
| GET | `/cracha` | Sim | Lista crachas. |
| GET | `/cracha/status/:status` | Sim | Lista crachas por status. |
| GET | `/cracha/:id` | Sim | Busca cracha por ID. |
| PUT | `/cracha/:id` | Sim | Atualiza cracha. |
| DELETE | `/cracha/:id` | Sim | Remove cracha. |
| PUT | `/cracha/:id/tags-fisicas/:tagId` | Sim | Associa tag fisica ao cracha. |
| PUT | `/cracha/tags-fisicas/:tagId/release` | Sim | Libera tag fisica associada. |

### Tags RFID - `/tags`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/tags` | Sim | Lista tags. |
| GET | `/tags/latest` | Sim | Busca a tag mais recente. |
| GET | `/tags/disponiveis` | Sim | Lista tags disponiveis. |
| GET | `/tags/code/:codigoTag` | Sim | Busca tag por codigo. |
| GET | `/tags/:id` | Sim | Busca tag por ID. |
| POST | `/tags` | Sim | Cria tag. |
| PUT | `/tags/:id` | Sim | Atualiza tag. |
| DELETE | `/tags/:id` | Sim | Remove tag. |
| PUT | `/tags/virtual/assign` | Sim | Associa tag virtual. |
| PUT | `/tags/code/:codigoTag/assign` | Sim | Associa tag pelo codigo RFID. |

### Requisicoes de acesso - `/requisicao`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/requisicao` | Sim | Lista requisicoes de acesso. |
| GET | `/requisicao/:id` | Sim | Busca requisicao por ID. |
| GET | `/requisicao/func/:id` | Sim | Busca requisicoes por funcionario. |
| GET | `/requisicao/setor/:id` | Sim | Busca requisicoes por setor. |
| POST | `/requisicao` | Sim | Cria requisicao de acesso. |
| PUT | `/requisicao/:id` | Sim | Atualiza requisicao. |
| DELETE | `/requisicao/:id` | Sim | Remove requisicao. |

### Requisicoes de visitante - `/requisicao-visitante`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/requisicao-visitante` | Sim | Lista requisicoes de visitantes. |
| GET | `/requisicao-visitante/:id` | Sim | Busca requisicao por ID. |
| POST | `/requisicao-visitante` | Sim | Cria requisicao de visitante. |
| PUT | `/requisicao-visitante/:id` | Sim | Atualiza requisicao. |
| PUT | `/requisicao-visitante/lote` | Sim | Atualiza requisicoes em lote. |
| DELETE | `/requisicao-visitante/:id` | Sim | Remove requisicao. |

### Visitante - `/visitante`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| POST | `/visitante` | Sim | Cria visitante usando fluxo dedicado. |

### Portaria - `/portaria`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/portaria/vlocal` | Sim | Lista visitantes no local. |
| GET | `/portaria/pendencias` | Sim | Lista pendencias da portaria. |
| GET | `/portaria/historico` | Sim | Lista historico de visitas. |
| POST | `/portaria/checkout` | Sim | Registra saida de visitante. |
| PUT | `/portaria/visitante/:id` | Sim | Atualiza dados de visitante pela portaria. |
| DELETE | `/portaria/visitante/:id` | Sim | Remove visitante pela portaria. |

### Logs - `/logs`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/logs` | Sim | Lista logs. |
| GET | `/logs/user/:idUsuario` | Sim | Lista logs por usuario. |
| GET | `/logs/device/:idDispositivo` | Sim | Lista logs por dispositivo. |
| GET | `/logs/:id` | Sim | Busca log por ID. |
| POST | `/logs` | Sim | Cria log manualmente. |
| POST | `/logs/disp` | Nao | Registra log vindo de dispositivo. |
| PUT | `/logs/:id` | Sim | Atualiza log. |
| DELETE | `/logs/:id` | Sim | Remove log. |

### Dispositivos - `/dispositivos`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/dispositivos` | Sim | Lista dispositivos. |
| GET | `/dispositivos/:id` | Sim | Busca dispositivo por ID. |
| POST | `/dispositivos` | Sim | Cria dispositivo. |
| GET | `/dispositivos/:id/:cracha` | Nao | Valida cracha/tag em um dispositivo. |
| PUT | `/dispositivos/:id` | Sim | Atualiza dispositivo. |
| DELETE | `/dispositivos/:id` | Sim | Remove dispositivo. |

### Views consolidadas - `/views`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/views/requisicoes` | Sim | Consulta requisicoes consolidadas. |
| GET | `/views/logs` | Sim | Consulta logs detalhados. |
| GET | `/views/usuarios` | Sim | Consulta usuarios detalhados. |
| GET | `/views/usuarios/:id` | Sim | Consulta usuario detalhado por ID. |
| GET | `/views/tags` | Sim | Consulta tags detalhadas. |
| GET | `/views/gestores` | Sim | Lista gestores. |

### Avatar - `/avatar`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/avatar` | Nao | Lista avatares. |
| GET | `/avatar/:funcId` | Nao | Busca avatar por funcionario. |
| POST | `/avatar/:funcId` | Sim | Envia avatar com campo multipart `avatar`. |
| DELETE | `/avatar/:funcId` | Sim | Remove avatar do funcionario. |

### Publico - `/public`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/public/stats` | Nao | Retorna estatisticas publicas para a tela de login. |

### Permissoes - `/permissoes`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/permissoes` | Sim | Consulta configuracoes de permissao. |
| POST | `/permissoes` | Sim | Salva configuracoes de permissao. |

### Relatorios - `/relatorios`

| Metodo | Rota | Auth | Descricao |
| --- | --- | --- | --- |
| GET | `/relatorios/acessos` | Sim | Gera relatorio de acessos com filtros por query string. |

---

## Banco de dados e Prisma

O Prisma usa PostgreSQL e esta configurado em:

```text
backend/prisma/schema.prisma
backend/prisma.config.ts
backend/config/prisma.js
```

### Modelos principais

| Modelo | Tabela | Descricao |
| --- | --- | --- |
| `Usuario` | `usuarios` | Dados pessoais, contato, empresa, departamento e relacionamentos. |
| `Funcionario` | `funcionarios` | Dados funcionais, tipo de perfil, setor e senha hash. |
| `PreferenciasUsuario` | `preferencias_usuarios` | Preferencias de interface armazenadas em JSON. |
| `Departamento` | `departamentos` | Unidades/departamentos fisicos ou administrativos. |
| `setores` | `setores` | Setores com gestor, status e regra de acesso. |
| `empresas` | `empresas` | Empresas visitantes ou relacionadas aos usuarios. |
| `Cracha` | `crachas` | Crachas com status, tag, validade e usuario associado. |
| `Tag` | `tags` | Tags RFID fisicas ou virtuais associaveis a crachas/usuarios. |
| `RequisicaoDeAcesso` | `requisicoes_de_acessos` | Solicitacoes de acesso interno a setores. |
| `RequisicaoDeVisita` | `requisicoes_de_visitas` | Solicitacoes de visita com motivo, empresa e validade. |
| `Dispositivo` | `dispositivos` | Dispositivos fisicos ligados a departamentos e setores. |
| `Log` | `logs` | Registros de entrada e saida por usuario e dispositivo. |
| `PermissoesConfig` | `permissoes_config` | Configuracoes gerais de permissao em JSON. |

### Enums

| Enum | Valores |
| --- | --- |
| `TipoFuncionario` | `func`, `port`, `sup`, `ger`, `adm` |
| `StatusCracha` | `perdido`, `emUso`, `disponivel` |
| `StatusRequisicao` | `pendente`, `aprovado`, `recusado`, `expirado` |
| `StatusAcesso` | `Liberado`, `Restrito`, `Bloqueado` |
| `StatusSetor` | `Ativo`, `Inativo` |
| `TipoLog` | `port`, `disp` |

### Views

O projeto usa views SQL para entregar consultas consolidadas ao front-end:

| View | Finalidade |
| --- | --- |
| `view_perfil_completo_usuario` | Perfil completo de usuario/funcionario. |
| `view_central_requisicoes` | Centraliza requisicoes de acesso e visita. |
| `view_logs_detalhados` | Logs com usuario, CPF, local e departamento. |
| `view_portaria_visitantes` | Visitantes acompanhados pela portaria. |
| `view_portaria_pendencias` | Pendencias de visitantes. |
| `view_portaria_checkout` | Dados de checkout e tag a recolher. |
| `view_portaria_checkin` | Dados para check-in. |
| `view_public_stats` | Estatisticas publicas da tela inicial. |
| `view_gestores` | Lista de gestores. |

### Comandos Prisma uteis

```bash
npx prisma generate
npx prisma migrate dev
npx prisma migrate status
```

Para abrir o Prisma Studio, se desejado:

```bash
npx prisma studio
```

---

## Integracao com Supabase Storage

A API usa Supabase Storage para avatares de funcionarios.

Arquivos relacionados:

```text
backend/config/supabase.js
backend/controllers/AvatarController.js
```

Comportamento esperado:

- O cliente envia arquivo por `multipart/form-data` no campo `avatar`.
- A API faz upload para o bucket configurado.
- O banco guarda o caminho/referencia do avatar.
- As consultas retornam URL publica usando `SUPABASE_PUBLIC_BASE_URL`.

Variaveis relevantes:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_BUCKET_NAME`
- `SUPABASE_PUBLIC_BASE_URL`

---

## Integracao com MQTT e dispositivos

A API se conecta ao broker MQTT na inicializacao do servidor:

```text
backend/config/mqtt.js
```

Fluxo resumido:

1. O dispositivo publica mensagem no topico configurado em `MQTT_RESPONSE_TOPIC`.
2. A mensagem deve conter identificador do dispositivo e codigo do cracha/tag.
3. A API processa a validacao em `services/deviceAccessService.js`.
4. A API verifica dispositivo, tag, usuario, setor e requisicoes aprovadas.
5. A API registra entrada ou saida em `logs` quando o acesso e permitido.
6. A API publica a resposta no topico do dispositivo usando `MQTT_COMMAND_TOPIC_PREFIX`.

Mensagens de resposta comuns:

| Situacao | Resposta |
| --- | --- |
| Acesso permitido | `true/ACESSO PERMITIDO` |
| Acesso negado | `false/ACESSO NEGADO` |
| Dados invalidos | `false/DADOS INVALIDOS` |
| Setor inativo | `aguarde/SETOR INATIVO` |
| Setor bloqueado | `aguarde/SETOR BLOQUEADO` |
| Aguardando supervisor | `aguarde/AGUARDANDO VERIFICACAO DO SUPERVISOR` |

Se uma tag desconhecida for lida, a API pode cadastra-la como tag fisica disponivel para uso posterior.

---

## Testes

O projeto possui testes com `node:test`, incluindo cobertura para o servico de logs de dispositivo.

Executar:

```bash
npm test
```

Teste atual:

```text
backend/test/logService.test.js
```

Cenarios cobertos:

- Criar entrada quando nao existe log anterior.
- Fechar saida quando existe log aberto.
- Criar nova entrada quando o ultimo log ja esta fechado.

---

## Notas de seguranca

- Nunca versionar `.env` real.
- Use um `JWT_SECRET` forte e diferente por ambiente.
- Em producao, restrinja `CORS_ORIGINS` ao dominio real do front-end.
- Evite `CORS_ORIGINS=*` fora de situacoes temporarias controladas.
- Armazene chaves Supabase apenas no back-end.
- Revise permissoes de bucket no Supabase antes do deploy.
- Rotas de dispositivo sem JWT devem ser protegidas por rede, broker, topico, credenciais MQTT ou camada equivalente em ambiente real.
- Valide payloads de entrada ao expandir a API.

---

## Repositorio front-end

O front-end relacionado fica em:

```text
C:\Users\25171033\Documents\get_in
```

Configure nele:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Depois inicie o front-end com:

```bash
npm run dev
```
