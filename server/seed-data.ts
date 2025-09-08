import { db } from './db';
import { 
  empresas, 
  pacotesSistema, 
  assinaturas, 
  users, 
  perfis, 
  perfilPermissoes,
  permissoes,
  modulosSistema
} from '@shared/schema';
import bcrypt from 'bcrypt';

interface ModuloData {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  rotas: string[];
  funcionalidades: string[];
  tipo_usuario: string[];
}

interface PacoteData {
  id: string;
  nome: string;
  descricao: string;
  preco_mensal: number;
  modulos: string[];
  permissoes: string[];
  tipo_publico: string[];
}

// Mapeamento completo de módulos do sistema
const MODULOS_SISTEMA: ModuloData[] = [
  // Módulos para Transportadores/Operadores Logísticos
  {
    id: 'armazenagem',
    nome: 'Armazenagem',
    descricao: 'Gestão completa de armazém com conferência, endereçamento e checklist',
    categoria: 'Operacional',
    rotas: [
      '/armazenagem',
      '/armazenagem/dashboard',
      '/armazenagem/conferencia',
      '/armazenagem/enderecamento',
      '/armazenagem/checklist',
      '/armazenagem/recebimento',
      '/armazenagem/entrada-notas',
      '/armazenagem/editar-nota-fiscal'
    ],
    funcionalidades: [
      'Dashboard de armazenagem',
      'Conferência de mercadorias',
      'Sistema de endereçamento',
      'Checklist operacional',
      'Recebimento de notas fiscais',
      'Entrada de notas via XML/API',
      'Edição de dados fiscais',
      'Cubagem e dimensionamento'
    ],
    tipo_usuario: ['transportador']
  },
  {
    id: 'coletas',
    nome: 'Coletas',
    descricao: 'Gestão de solicitações, programação e execução de coletas',
    categoria: 'Operacional',
    rotas: [
      '/coletas',
      '/coletas/dashboard',
      '/coletas/nova-ordem',
      '/coletas/solicitacoes',
      '/coletas/programacao',
      '/coletas/execucao',
      '/coletas/relatorios'
    ],
    funcionalidades: [
      'Dashboard de coletas',
      'Criação de ordens de coleta',
      'Gestão de solicitações',
      'Programação de rotas',
      'Execução operacional',
      'Relatórios gerenciais',
      'Rastreamento em tempo real'
    ],
    tipo_usuario: ['transportador']
  },
  {
    id: 'carregamento',
    nome: 'Carregamento',
    descricao: 'Planejamento, ordem de carga e execução de carregamentos',
    categoria: 'Operacional',
    rotas: [
      '/carregamento',
      '/carregamento/planejamento',
      '/carregamento/ordem-carga',
      '/carregamento/execucao',
      '/carregamento/rastreamento',
      '/carregamento/conferencia',
      '/carregamento/enderecamento'
    ],
    funcionalidades: [
      'Planejamento de cargas',
      'Ordem de carregamento',
      'Execução operacional',
      'Rastreamento de veículos',
      'Conferência de carga',
      'Endereçamento de caminhões',
      'Otimização de rotas'
    ],
    tipo_usuario: ['transportador']
  },
  {
    id: 'gamificacao',
    nome: 'Gamificação',
    descricao: 'Sistema de conquistas, rankings e engajamento operacional',
    categoria: 'Engajamento',
    rotas: [
      '/gamificacao',
      '/gamificacao/conquistas',
      '/gamificacao/rankings',
      '/gamificacao/desafios'
    ],
    funcionalidades: [
      'Sistema de conquistas',
      'Rankings operacionais',
      'Desafios e metas',
      'Pontuação por performance',
      'Badges e recompensas'
    ],
    tipo_usuario: ['transportador']
  },
  {
    id: 'configuracoes-transportador',
    nome: 'Configurações',
    descricao: 'Gestão de empresa, usuários e permissões para transportadores',
    categoria: 'Administrativo',
    rotas: [
      '/configuracoes',
      '/configuracoes/empresa',
      '/configuracoes/usuarios',
      '/configuracoes/permissoes',
      '/configuracoes/aprovacoes'
    ],
    funcionalidades: [
      'Informações da empresa',
      'Gerenciamento de usuários',
      'Controle de permissões',
      'Aprovação de clientes/fornecedores',
      'Configurações do sistema'
    ],
    tipo_usuario: ['transportador']
  },

  // Módulos para Clientes
  {
    id: 'portal-cliente',
    nome: 'Portal do Cliente',
    descricao: 'Dashboard e funcionalidades específicas para clientes',
    categoria: 'Portal',
    rotas: [
      '/cliente/dashboard',
      '/cliente/solicitacoes',
      '/cliente/rastreamento',
      '/cliente/documentos',
      '/cliente/aprovacoes'
    ],
    funcionalidades: [
      'Dashboard personalizado',
      'Solicitação de coletas',
      'Rastreamento de cargas',
      'Documentos fiscais',
      'Sistema de aprovações'
    ],
    tipo_usuario: ['cliente']
  },

  // Módulos para Fornecedores
  {
    id: 'portal-fornecedor',
    nome: 'Portal do Fornecedor',
    descricao: 'Dashboard e funcionalidades específicas para fornecedores',
    categoria: 'Portal',
    rotas: [
      '/fornecedor/dashboard',
      '/fornecedor/solicitacoes',
      '/fornecedor/documentacao',
      '/fornecedor/comunicacao',
      '/fornecedor/relatorios'
    ],
    funcionalidades: [
      'Dashboard de fornecedor',
      'Gestão de solicitações',
      'Documentação fiscal',
      'Comunicação integrada',
      'Relatórios de performance'
    ],
    tipo_usuario: ['fornecedor']
  },

  // Módulos para Super Admin
  {
    id: 'gestao-empresas',
    nome: 'Gestão de Empresas',
    descricao: 'Administração completa de empresas no sistema',
    categoria: 'Super Admin',
    rotas: [
      '/admin/empresas',
      '/admin/aprovacao-transportadores'
    ],
    funcionalidades: [
      'CRUD de empresas',
      'Aprovação de transportadores',
      'Gestão de assinaturas',
      'Monitoramento de uso'
    ],
    tipo_usuario: ['super_admin']
  },
  {
    id: 'gestao-pacotes',
    nome: 'Gestão de Pacotes',
    descricao: 'Criação e administração de pacotes do sistema',
    categoria: 'Super Admin',
    rotas: [
      '/admin/pacotes'
    ],
    funcionalidades: [
      'Criação de pacotes',
      'Definição de preços',
      'Configuração de módulos',
      'Gestão de permissões'
    ],
    tipo_usuario: ['super_admin']
  },
  {
    id: 'admin-clientes',
    nome: 'Administração de Clientes',
    descricao: 'Gestão centralizada de todos os clientes do sistema',
    categoria: 'Super Admin',
    rotas: [
      '/admin/clientes'
    ],
    funcionalidades: [
      'Listagem de clientes',
      'Gestão de relacionamentos',
      'Monitoramento de atividades',
      'Relatórios de uso'
    ],
    tipo_usuario: ['super_admin']
  },
  {
    id: 'admin-financeiro',
    nome: 'Administrativo Financeiro',
    descricao: 'Gestão financeira e recebimentos do sistema',
    categoria: 'Super Admin',
    rotas: [
      '/admin/financeiro/recebimentos',
      '/admin/financeiro/notas-fiscais'
    ],
    funcionalidades: [
      'Gestão de recebimentos',
      'Administração de notas fiscais',
      'Relatórios financeiros',
      'Controle de inadimplência'
    ],
    tipo_usuario: ['super_admin']
  },
  {
    id: 'admin-suporte',
    nome: 'Suporte Administrativo',
    descricao: 'Sistema de suporte e atendimento ao cliente',
    categoria: 'Super Admin',
    rotas: [
      '/admin/suporte'
    ],
    funcionalidades: [
      'Gestão de tickets',
      'Atendimento ao cliente',
      'Base de conhecimento',
      'Métricas de satisfação'
    ],
    tipo_usuario: ['super_admin']
  }
];

// Definição de pacotes do sistema
const PACOTES_SISTEMA: PacoteData[] = [
  {
    id: 'basico-transportador',
    nome: 'Básico Transportador',
    descricao: 'Pacote básico para operadores logísticos iniciantes',
    preco_mensal: 297.00,
    modulos: ['armazenagem', 'coletas', 'configuracoes-transportador'],
    permissoes: [
      'armazenagem_visualizar',
      'armazenagem_conferencia',
      'coletas_visualizar',
      'coletas_criar',
      'configuracoes_empresa',
      'configuracoes_usuarios_basico'
    ],
    tipo_publico: ['transportador']
  },
  {
    id: 'completo-transportador',
    nome: 'Completo Transportador',
    descricao: 'Pacote completo com todos os módulos operacionais',
    preco_mensal: 497.00,
    modulos: ['armazenagem', 'coletas', 'carregamento', 'gamificacao', 'configuracoes-transportador'],
    permissoes: [
      'armazenagem_completo',
      'coletas_completo',
      'carregamento_completo',
      'gamificacao_completo',
      'configuracoes_completo'
    ],
    tipo_publico: ['transportador']
  },
  {
    id: 'premium-transportador',
    nome: 'Premium Transportador',
    descricao: 'Pacote premium com funcionalidades avançadas e suporte prioritário',
    preco_mensal: 797.00,
    modulos: ['armazenagem', 'coletas', 'carregamento', 'gamificacao', 'configuracoes-transportador', 'portal-cliente', 'portal-fornecedor'],
    permissoes: [
      'armazenagem_premium',
      'coletas_premium',
      'carregamento_premium',
      'gamificacao_premium',
      'configuracoes_premium',
      'portal_cliente_acesso',
      'portal_fornecedor_acesso'
    ],
    tipo_publico: ['transportador']
  },
  {
    id: 'cliente-basico',
    nome: 'Cliente Básico',
    descricao: 'Acesso básico ao portal do cliente',
    preco_mensal: 0.00,
    modulos: ['portal-cliente'],
    permissoes: [
      'cliente_dashboard',
      'cliente_solicitacoes_basico',
      'cliente_rastreamento'
    ],
    tipo_publico: ['cliente']
  },
  {
    id: 'fornecedor-basico',
    nome: 'Fornecedor Básico',
    descricao: 'Acesso básico ao portal do fornecedor',
    preco_mensal: 0.00,
    modulos: ['portal-fornecedor'],
    permissoes: [
      'fornecedor_dashboard',
      'fornecedor_solicitacoes_basico',
      'fornecedor_documentacao'
    ],
    tipo_publico: ['fornecedor']
  },
  {
    id: 'super-admin-completo',
    nome: 'Super Admin Completo',
    descricao: 'Acesso completo a todas as funcionalidades administrativas',
    preco_mensal: 0.00,
    modulos: ['gestao-empresas', 'gestao-pacotes', 'admin-clientes', 'admin-financeiro', 'admin-suporte'],
    permissoes: [
      'super_admin_completo',
      'gestao_empresas_completo',
      'gestao_pacotes_completo',
      'admin_clientes_completo',
      'admin_financeiro_completo',
      'admin_suporte_completo'
    ],
    tipo_publico: ['super_admin']
  }
];

// Lista completa de permissões do sistema
const PERMISSOES_SISTEMA = [
  // Armazenagem
  { codigo: 'armazenagem_visualizar', nome: 'Visualizar Armazenagem', categoria: 'Armazenagem' },
  { codigo: 'armazenagem_conferencia', nome: 'Realizar Conferência', categoria: 'Armazenagem' },
  { codigo: 'armazenagem_enderecamento', nome: 'Gerenciar Endereçamento', categoria: 'Armazenagem' },
  { codigo: 'armazenagem_checklist', nome: 'Executar Checklist', categoria: 'Armazenagem' },
  { codigo: 'armazenagem_completo', nome: 'Armazenagem Completo', categoria: 'Armazenagem' },
  { codigo: 'armazenagem_premium', nome: 'Armazenagem Premium', categoria: 'Armazenagem' },
  
  // Coletas
  { codigo: 'coletas_visualizar', nome: 'Visualizar Coletas', categoria: 'Coletas' },
  { codigo: 'coletas_criar', nome: 'Criar Coletas', categoria: 'Coletas' },
  { codigo: 'coletas_programar', nome: 'Programar Coletas', categoria: 'Coletas' },
  { codigo: 'coletas_executar', nome: 'Executar Coletas', categoria: 'Coletas' },
  { codigo: 'coletas_completo', nome: 'Coletas Completo', categoria: 'Coletas' },
  { codigo: 'coletas_premium', nome: 'Coletas Premium', categoria: 'Coletas' },
  
  // Carregamento
  { codigo: 'carregamento_visualizar', nome: 'Visualizar Carregamento', categoria: 'Carregamento' },
  { codigo: 'carregamento_planejar', nome: 'Planejar Carregamento', categoria: 'Carregamento' },
  { codigo: 'carregamento_executar', nome: 'Executar Carregamento', categoria: 'Carregamento' },
  { codigo: 'carregamento_rastrear', nome: 'Rastrear Carregamento', categoria: 'Carregamento' },
  { codigo: 'carregamento_completo', nome: 'Carregamento Completo', categoria: 'Carregamento' },
  { codigo: 'carregamento_premium', nome: 'Carregamento Premium', categoria: 'Carregamento' },
  
  // Gamificação
  { codigo: 'gamificacao_visualizar', nome: 'Visualizar Gamificação', categoria: 'Gamificação' },
  { codigo: 'gamificacao_participar', nome: 'Participar Gamificação', categoria: 'Gamificação' },
  { codigo: 'gamificacao_completo', nome: 'Gamificação Completo', categoria: 'Gamificação' },
  { codigo: 'gamificacao_premium', nome: 'Gamificação Premium', categoria: 'Gamificação' },
  
  // Configurações
  { codigo: 'configuracoes_empresa', nome: 'Configurar Empresa', categoria: 'Configurações' },
  { codigo: 'configuracoes_usuarios_basico', nome: 'Usuários Básico', categoria: 'Configurações' },
  { codigo: 'configuracoes_usuarios_completo', nome: 'Usuários Completo', categoria: 'Configurações' },
  { codigo: 'configuracoes_permissoes', nome: 'Gerenciar Permissões', categoria: 'Configurações' },
  { codigo: 'configuracoes_completo', nome: 'Configurações Completo', categoria: 'Configurações' },
  { codigo: 'configuracoes_premium', nome: 'Configurações Premium', categoria: 'Configurações' },
  
  // Portal Cliente
  { codigo: 'cliente_dashboard', nome: 'Dashboard Cliente', categoria: 'Portal Cliente' },
  { codigo: 'cliente_solicitacoes_basico', nome: 'Solicitações Básico', categoria: 'Portal Cliente' },
  { codigo: 'cliente_solicitacoes_completo', nome: 'Solicitações Completo', categoria: 'Portal Cliente' },
  { codigo: 'cliente_rastreamento', nome: 'Rastreamento', categoria: 'Portal Cliente' },
  { codigo: 'portal_cliente_acesso', nome: 'Acesso Portal Cliente', categoria: 'Portal Cliente' },
  
  // Portal Fornecedor
  { codigo: 'fornecedor_dashboard', nome: 'Dashboard Fornecedor', categoria: 'Portal Fornecedor' },
  { codigo: 'fornecedor_solicitacoes_basico', nome: 'Solicitações Básico', categoria: 'Portal Fornecedor' },
  { codigo: 'fornecedor_solicitacoes_completo', nome: 'Solicitações Completo', categoria: 'Portal Fornecedor' },
  { codigo: 'fornecedor_documentacao', nome: 'Documentação', categoria: 'Portal Fornecedor' },
  { codigo: 'portal_fornecedor_acesso', nome: 'Acesso Portal Fornecedor', categoria: 'Portal Fornecedor' },
  
  // Super Admin
  { codigo: 'super_admin_completo', nome: 'Super Admin Completo', categoria: 'Super Admin' },
  { codigo: 'gestao_empresas_completo', nome: 'Gestão Empresas Completo', categoria: 'Super Admin' },
  { codigo: 'gestao_pacotes_completo', nome: 'Gestão Pacotes Completo', categoria: 'Super Admin' },
  { codigo: 'admin_clientes_completo', nome: 'Admin Clientes Completo', categoria: 'Super Admin' },
  { codigo: 'admin_financeiro_completo', nome: 'Admin Financeiro Completo', categoria: 'Super Admin' },
  { codigo: 'admin_suporte_completo', nome: 'Admin Suporte Completo', categoria: 'Super Admin' }
];

export async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // 1. Inserir permissões do sistema
    console.log('📋 Inserindo permissões do sistema...');
    for (const permissao of PERMISSOES_SISTEMA) {
      await db.insert(permissoes).values({
        codigo: permissao.codigo,
        nome: permissao.nome,
        categoria: permissao.categoria,
        ativo: true
      }).onConflictDoNothing();
    }

    // 2. Inserir módulos do sistema
    console.log('🔧 Inserindo módulos do sistema...');
    for (const modulo of MODULOS_SISTEMA) {
      await db.insert(modulosSistema).values({
        id: modulo.id,
        nome: modulo.nome,
        descricao: modulo.descricao,
        categoria: modulo.categoria,
        rotas: modulo.rotas,
        funcionalidades: modulo.funcionalidades,
        tipo_usuario: modulo.tipo_usuario,
        ativo: true
      }).onConflictDoNothing();
    }

    // 3. Inserir pacotes do sistema
    console.log('📦 Inserindo pacotes do sistema...');
    for (const pacote of PACOTES_SISTEMA) {
      await db.insert(pacotesSistema).values({
        id: pacote.id,
        nome: pacote.nome,
        descricao: pacote.descricao,
        preco_mensal: pacote.preco_mensal,
        ativo: true,
        configuracoes: {
          modulos_inclusos: pacote.modulos,
          permissoes_incluidas: pacote.permissoes,
          tipo_publico: pacote.tipo_publico
        }
      }).onConflictDoNothing();

      // Módulos inclusos já estão no campo JSON modulos_inclusos
    }

    // 4. Criar empresa CrossWMS (Super Admin)
    console.log('🏢 Criando empresa CrossWMS...');
    const [empresaCrossWMS] = await db.insert(empresas).values({
      id: crypto.randomUUID(),
      nome: 'CrossWMS Administração',
      cnpj: '00000000000100',
      email: 'admin@crosswms.com.br',
      telefone: '(11) 99999-9999',
      endereco: 'Rua da Tecnologia, 100',
      numero: '100',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01000-000',
      tipo_empresa: 'super_admin',
      status: 'ativo'
    }).returning().onConflictDoNothing();

    // 5. Criar empresas de demonstração
    console.log('🚛 Criando empresas de demonstração...');
    
    // Transportadora
    const transportadorId = crypto.randomUUID();
    const [empresaTranslog] = await db.insert(empresas).values({
      id: transportadorId,
      nome: 'TransLog Brasil Ltda',
      cnpj: '12345678000195',
      email: 'contato@translogbrasil.com.br',
      telefone: '(11) 98765-4321',
      endereco: 'Av. Logística, 500',
      numero: '500',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '03000-000',
      tipo_empresa: 'transportador',
      status: 'ativo'
    }).returning().onConflictDoNothing();

    // Cliente
    const [empresaDelrey] = await db.insert(empresas).values({
      id: crypto.randomUUID(),
      nome: 'Del Rey Indústria e Comércio S.A.',
      cnpj: '98765432000123',
      email: 'compras@delrey.com.br',
      telefone: '(11) 87654-3210',
      endereco: 'Rua Industrial, 200',
      numero: '200',
      cidade: 'São Bernardo do Campo',
      uf: 'SP',
      cep: '09000-000',
      tipo_empresa: 'cliente',
      status: 'ativo',
      transportador_responsavel_id: transportadorId
    }).returning().onConflictDoNothing();

    // Fornecedor
    const [empresaAutopecas] = await db.insert(empresas).values({
      id: crypto.randomUUID(),
      nome: 'AutoPeças Brasil Ltda',
      cnpj: '11122233000144',
      email: 'vendas@autopecasbrasil.com.br',
      telefone: '(11) 76543-2109',
      endereco: 'Av. das Autopeças, 300',
      numero: '300',
      cidade: 'Santo André',
      uf: 'SP',
      cep: '09100-000',
      tipo_empresa: 'fornecedor',
      status: 'ativo',
      transportador_responsavel_id: transportadorId
    }).returning().onConflictDoNothing();

    // 6. Criar assinaturas
    console.log('📝 Criando assinaturas...');
    if (empresaTranslog?.[0]) {
      await db.insert(assinaturas).values({
        id: crypto.randomUUID(),
        empresa_id: empresaTranslog[0].id,
        pacote_id: 'completo-transportador',
        data_inicio: new Date(),
        data_fim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
        status: 'ativo',
        valor_mensal: 497.00
      });
    }

    // 7. Criar perfis do sistema
    console.log('👥 Criando perfis do sistema...');
    const perfisData = [
      { id: 'super-admin', nome: 'Super Administrador', tipo_usuario: 'super_admin' },
      { id: 'admin-transportador', nome: 'Administrador Transportador', tipo_usuario: 'transportador' },
      { id: 'operador-transportador', nome: 'Operador Transportador', tipo_usuario: 'transportador' },
      { id: 'cliente-admin', nome: 'Administrador Cliente', tipo_usuario: 'cliente' },
      { id: 'cliente-usuario', nome: 'Usuário Cliente', tipo_usuario: 'cliente' },
      { id: 'fornecedor-admin', nome: 'Administrador Fornecedor', tipo_usuario: 'fornecedor' },
      { id: 'fornecedor-usuario', nome: 'Usuário Fornecedor', tipo_usuario: 'fornecedor' }
    ];

    const perfisIds = new Map<string, string>();
    
    for (const perfil of perfisData) {
      const [perfilCriado] = await db.insert(perfis).values({
        nome: perfil.nome,
        tipo_perfil: perfil.tipo_usuario,
        ativo: true
      }).returning().onConflictDoNothing();
      
      if (perfilCriado) {
        perfisIds.set(perfil.id, perfilCriado.id);
      }
    }

    // 8. Criar usuários de demonstração
    console.log('👤 Criando usuários de demonstração...');
    const senha = await bcrypt.hash('123456', 10);

    // Super Admin
    await db.insert(users).values({
      id: crypto.randomUUID(),
      email: 'superadmin@crosswms.com.br',
      password: senha,
      nome: 'Super Administrador',
      telefone: '(11) 99999-9999',
      status: 'ativo',
      empresa_id: empresaCrossWMS?.[0]?.id || crypto.randomUUID(),
      perfil_id: perfisIds.get('super-admin') || crypto.randomUUID()
    }).onConflictDoNothing();

    // Admin Transportador
    if (empresaTranslog?.[0]) {
      await db.insert(users).values({
        id: crypto.randomUUID(),
        email: 'admin@translogbrasil.com.br',
        password: senha,
        nome: 'João Silva',
        telefone: '(11) 98765-4321',
        status: 'ativo',
        empresa_id: empresaTranslog[0].id,
        perfil_id: perfisIds.get('admin-transportador') || crypto.randomUUID()
      }).onConflictDoNothing();
    }

    // Cliente
    if (empresaDelrey?.[0]) {
      await db.insert(users).values({
        id: crypto.randomUUID(),
        email: 'compras@delrey.com.br',
        password: senha,
        nome: 'Maria Santos',
        telefone: '(11) 87654-3210',
        status: 'ativo',
        empresa_id: empresaDelrey[0].id,
        perfil_id: perfisIds.get('cliente-admin') || crypto.randomUUID()
      }).onConflictDoNothing();
    }

    // Fornecedor
    if (empresaAutopecas?.[0]) {
      await db.insert(users).values({
        id: crypto.randomUUID(),
        email: 'vendas@autopecasbrasil.com.br',
        password: senha,
        nome: 'Carlos Oliveira',
        telefone: '(11) 76543-2109',
        status: 'ativo',
        empresa_id: empresaAutopecas[0].id,
        perfil_id: perfisIds.get('fornecedor-admin') || crypto.randomUUID()
      }).onConflictDoNothing();
    }

    // 9. Configurar permissões para perfis
    console.log('🔐 Configurando permissões para perfis...');
    
    // Super Admin - todas as permissões
    const allPermissions = await db.select().from(permissoes);
    for (const permission of allPermissions) {
      await db.insert(perfilPermissoes).values({
        perfil_id: perfisIds.get('super-admin') || crypto.randomUUID(),
        permissao_id: permission.id,
        concedida: true
      }).onConflictDoNothing();
    }

    // Admin Transportador - permissões completas
    const transportadorPermissions = allPermissions.filter(p => 
      p.categoria.includes('Armazenagem') || 
      p.categoria.includes('Coletas') || 
      p.categoria.includes('Carregamento') ||
      p.categoria.includes('Gamificação') ||
      p.categoria.includes('Configurações')
    );
    for (const permission of transportadorPermissions) {
      await db.insert(perfilPermissoes).values({
        perfil_id: perfisIds.get('admin-transportador') || crypto.randomUUID(),
        permissao_id: permission.id,
        concedida: true
      }).onConflictDoNothing();
    }

    console.log('✅ Seed do banco de dados concluído com sucesso!');
    console.log('');
    console.log('🔑 Usuários criados:');
    console.log('- Super Admin: superadmin@crosswms.com.br / 123456');
    console.log('- Transportador: admin@translogbrasil.com.br / 123456');
    console.log('- Cliente: compras@delrey.com.br / 123456');
    console.log('- Fornecedor: vendas@autopecasbrasil.com.br / 123456');
    console.log('');
    console.log('📦 Pacotes disponíveis:');
    for (const pacote of PACOTES_SISTEMA) {
      console.log(`- ${pacote.nome}: R$ ${pacote.preco_mensal.toFixed(2)}/mês`);
    }
    console.log('');
    console.log('🔧 Módulos do sistema:', MODULOS_SISTEMA.length);
    console.log('🔐 Permissões criadas:', PERMISSOES_SISTEMA.length);

  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    throw error;
  }
}

// Função para executar o seed
export async function runSeed() {
  await seedDatabase();
  process.exit(0);
}

// Se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed();
}