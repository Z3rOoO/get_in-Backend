import { prisma } from "../config/prisma.js";

const CHAVE_PADRAO = "admin-dashboard";

const PERMISSOES_PADRAO = {
  funcionarios: [
    {
      categoria: "VISITANTES",
      funcionalidades: [
        { titulo: "Cadastrar visitante", desc: "Registrar novo visitante no sistema", portaria: "allow", supervisor: "allow", admin: "allow" },
        { titulo: "Editar dados de visitante", desc: "Alterar informacoes durante a visita", portaria: "read", supervisor: "allow", admin: "allow" },
        { titulo: "Check-out / encerrar visita", desc: "Finalizar visita e devolver cracha", portaria: "allow", supervisor: "allow", admin: "allow" },
        { titulo: "Excluir visitante", desc: "Remover registro permanentemente", portaria: "deny", supervisor: "deny", admin: "allow" },
      ],
    },
    {
      categoria: "APROVACOES DE ACESSO",
      funcionalidades: [
        { titulo: "Solicitar aprovacao", desc: "Enviar pedido de entrada ao supervisor", portaria: "allow", supervisor: "deny", admin: "allow" },
        { titulo: "Aprovar / negar acesso", desc: "Decisao de entrada em setor restrito", portaria: "deny", supervisor: "allow", admin: "allow" },
        { titulo: "Verificar pendencias", desc: "Visualizar solicitacoes aguardando aprovacao", portaria: "read", supervisor: "allow", admin: "allow" },
      ],
    },
    {
      categoria: "CRACHAS E RFID",
      funcionalidades: [
        { titulo: "Vincular cracha a visitante", desc: "Associar tag RFID ao registro", portaria: "allow", supervisor: "deny", admin: "allow" },
        { titulo: "Bloquear / desativar tag", desc: "Revogar acesso de uma tag especifica", portaria: "deny", supervisor: "allow", admin: "allow" },
        { titulo: "Gerenciar estoque de tags", desc: "Cadastrar e controlar tags disponiveis", portaria: "deny", supervisor: "deny", admin: "allow" },
      ],
    },
    {
      categoria: "RELATORIOS E AUDITORIA",
      funcionalidades: [
        { titulo: "Historico de circulacao", desc: "Trilha de movimentacao por setor", portaria: "read", supervisor: "allow", admin: "allow" },
        { titulo: "Exportar relatorio", desc: "Baixar dados em PDF ou CSV", portaria: "deny", supervisor: "read", admin: "allow" },
        { titulo: "Log de auditoria do sistema", desc: "Acessar registros de acoes do sistema", portaria: "deny", supervisor: "deny", admin: "allow" },
      ],
    },
    {
      categoria: "CONFIGURACOES",
      funcionalidades: [
        { titulo: "Gerenciar funcionarios", desc: "Cadastrar, editar e remover usuarios", portaria: "deny", supervisor: "deny", admin: "allow" },
        { titulo: "Gerenciar setores", desc: "Criar e editar setores da empresa", portaria: "deny", supervisor: "deny", admin: "allow" },
        { titulo: "Editar permissoes", desc: "Alterar niveis de acesso de perfis", portaria: "deny", supervisor: "deny", admin: "allow" },
      ],
    },
  ],
  visitantes: [
    { titulo: "Visualizar mapa do predio", desc: "Ver mapa de rotas liberadas", visitante: "allow" },
    { titulo: "Acesso ao refeitorio", desc: "Permissao para entrar na area de alimentacao", visitante: "deny" },
    { titulo: "Gerar QR Code de entrada", desc: "Criar passe temporario na catraca", visitante: "read" },
  ],
};

class PermissoesController {
  static async read(req, res) {
    try {
      const chave = req.query?.chave || CHAVE_PADRAO;
      const registro = await prisma.permissoesConfig.findUnique({ where: { chave } });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Permissoes carregadas com sucesso",
        data: registro?.valor || PERMISSOES_PADRAO,
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao carregar permissoes",
        erro: e.message,
      });
    }
  }

  static async save(req, res) {
    try {
      const chave = req.body?.chave || CHAVE_PADRAO;
      const valor = {
        funcionarios: Array.isArray(req.body?.funcionarios)
          ? req.body.funcionarios
          : PERMISSOES_PADRAO.funcionarios,
        visitantes: Array.isArray(req.body?.visitantes)
          ? req.body.visitantes
          : PERMISSOES_PADRAO.visitantes,
      };

      const registro = await prisma.permissoesConfig.upsert({
        where: { chave },
        create: { chave, valor },
        update: { valor },
      });

      return res.status(200).json({
        sucesso: true,
        mensagem: "Permissoes salvas com sucesso",
        data: registro.valor,
      });
    } catch (e) {
      return res.status(500).json({
        sucesso: false,
        mensagem: "Erro ao salvar permissoes",
        erro: e.message,
      });
    }
  }
}

export default PermissoesController;
