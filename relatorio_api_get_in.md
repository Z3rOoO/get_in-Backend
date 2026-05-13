# Relatório de Análise e Ajustes da API GET IN

## 1. Visão Geral da API

A API Backend do sistema **GET IN** é uma solução desenvolvida para controle de acessos, gestão de funcionários e visitantes em ambientes corporativos.

## 2. Ajustes Realizados com Base no DER

Após a análise do Diagrama de Entidade-Relacionamento (DER) fornecido, foram realizados os seguintes ajustes para garantir a compatibilidade entre o código da API e o banco de dados:

### 2.1. Schema do Prisma (`schema.prisma`)
- **Tabela `usuarios`:** Adicionado o campo `empresa` (`String? @db.VarChar(100)`) e `idDep` (`Int?`), conforme identificado no DER.
- **Tabela `setores`:** Removida a restrição de chave primária personalizada que estava causando conflitos e simplificada a estrutura para refletir o DER.
- **Tabelas de Requisições:** Atualizadas para usar `idSetor` em vez de `idDepartamento`, alinhando com a estrutura de relacionamento do DER onde as requisições são vinculadas a setores específicos.
- **Views:** Adicionada a propriedade `@unique` aos campos de ID das views para permitir que o Prisma as trate corretamente.

### 2.2. Controllers e Rotas
- **`UserController.js`:** 
    - Corrigido o método `Create` e `Update` para incluir o campo `empresa` e `idDep`.
    - Corrigidos os métodos `ReadName` e `ReadCpf` que estavam usando incorretamente o parâmetro `id` em vez de `nome` e `cpf`.
- **`RequisicaoFuncionarioController.js`:**
    - Alterado de `idDepartamento` para `idSetor`.
    - Renomeado o método `ReadByDepartamento` para `ReadBySetor`.
- **`RequisicaoVisitanteController.js`:**
    - Atualizado para incluir os campos `idSetor`, `motivo`, `validade`, `descricao` e `empresa`, conforme a tabela `requisicoes_de_visitas` do DER.
- **`RequisicaoFuncRouter.js`:**
    - Atualizada a rota `/dep/:id` para `/setor/:id` para refletir a mudança no controller.

## 3. Resultados dos Testes Online (Anterior)

*Nota: Os testes abaixo foram realizados antes das correções de schema.*

- **`GET /health`:** OK (200).
- **`POST /auth/login`:** Erro 500 (Coluna `usuarios.empresa` não encontrada). **[CORRIGIDO NO CÓDIGO]**
- **`GET /user`:** 401 Unauthorized (Autenticação funcionando).
- **`GET /dispositivos/1/12345`:** 502 Bad Gateway (Possível problema de conexão MQTT).

## 4. Recomendações

1.  **Sincronização do Banco de Dados:** Como o código foi ajustado para incluir a coluna `empresa`, certifique-se de que o banco de dados online (Render/Neon) esteja sincronizado. Execute `npx prisma db push` ou aplique as migrações necessárias.
2.  **Conectividade MQTT:** O erro 502 no endpoint de dispositivos persiste como uma questão de infraestrutura/rede que deve ser verificada no painel da Render.
3.  **Variáveis de Ambiente:** Verifique se `DATABASE_URL` e outras chaves estão configuradas no ambiente de produção.

---
*Ajustes realizados em 13 de Maio de 2026.*
