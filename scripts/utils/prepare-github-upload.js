/**
 * Script para preparar arquivos do CrossWMS para upload no GitHub
 * Cria estrutura organizada e gera comandos Git necessários
 */

import fs from 'fs';
import path from 'path';

// Arquivos e diretórios essenciais para o GitHub
const essentialFiles = [
  // Configurações principais
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tailwind.config.ts',
  'postcss.config.js',
  'vite.config.ts',
  'drizzle.config.ts',
  'components.json',
  
  // Documentação
  'README.md',
  'replit.md',
  'ARQUITETURA_MULTI_TENANT.md',
  'SECURITY_IMPROVEMENTS.md',
  'SOLUCAO_CACHE_POS_DEPLOY.md',
  'GUIA_CLOUDFLARE_API.md',
  'CONFIGURACAO_DOMINIO_HOSTGATOR.md',
  'INSTRUCOES_FINAIS.md',
  'NSDOCS_API_USAGE.md',
  
  // Controle de versão
  '.gitignore',
  
  // Scripts importantes
  'cloudflare-setup.js',
  'setup-cloudflare.js',
  'nsdocs.api.ts',
  
  // Diretórios do código fonte
  'client/',
  'server/',
  'shared/',
  'migrations/'
];

// Arquivos a serem excluídos (conforme .gitignore)
const excludePatterns = [
  'node_modules/',
  'attached_assets/',
  'cookies*.txt',
  'chromedriver*',
  'automacao*',
  '.replit',
  'replit.nix',
  '*.log',
  '.env*',
  'dist/',
  'build/'
];

function shouldExclude(filePath) {
  return excludePatterns.some(pattern => {
    if (pattern.endsWith('/')) {
      return filePath.includes(pattern);
    }
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace(/\*/g, '.*'));
      return regex.test(filePath);
    }
    return filePath.includes(pattern);
  });
}

function generateGitCommands() {
  const commands = [
    '# Comandos para upload do CrossWMS no GitHub',
    '',
    '# 1. Inicializar repositório (se necessário)',
    'git init',
    '',
    '# 2. Configurar usuário Git',
    'git config user.name "Leonardo Bandeira"',
    'git config user.email "admin@crosswms.com.br"',
    '',
    '# 3. Adicionar remote do GitHub (substitua pela URL do seu repositório)',
    'git remote add origin https://github.com/crosswms/crosswms-sistema.git',
    '',
    '# 4. Adicionar todos os arquivos',
    'git add .',
    '',
    '# 5. Fazer commit inicial',
    'git commit -m "feat: Sistema CrossWMS v2.1.0 - Plataforma logística completa',
    '',
    '- Sistema multi-tenant com arquitetura hierárquica',
    '- Módulos: Armazenagem, Coletas, Carregamento, Relatórios',
    '- Integração NSDocs API para processamento NFe',
    '- Interface moderna com React + TypeScript',
    '- Backend Node.js com PostgreSQL e Drizzle ORM',
    '- Sistema de permissões granulares (38+ permissões)',
    '- Autenticação JWT com 4 tipos de usuário',
    '- Domínio personalizado com Cloudflare',
    '- Controle de versões integrado com GitHub',
    '- Documentação completa e guias de deploy"',
    '',
    '# 6. Fazer push para GitHub',
    'git branch -M main',
    'git push -u origin main',
    '',
    '# 7. Verificar upload',
    'git status',
    'git log --oneline -5'
  ];
  
  return commands.join('\n');
}

function createProjectStructure() {
  const structure = {
    'Sistema CrossWMS': {
      'Frontend (React + TypeScript)': [
        'client/src/components/ - Componentes reutilizáveis',
        'client/src/pages/ - Páginas da aplicação',
        'client/src/hooks/ - Hooks customizados',
        'client/src/lib/ - Utilitários e configurações'
      ],
      'Backend (Node.js + Express)': [
        'server/routes.ts - Rotas da API',
        'server/storage.ts - Camada de dados',
        'server/index.ts - Servidor Express'
      ],
      'Banco de Dados': [
        'shared/schema.ts - Schema Drizzle ORM',
        'migrations/ - Migrações do banco'
      ],
      'Configurações': [
        'package.json - Dependências e scripts',
        'tsconfig.json - Configuração TypeScript',
        'tailwind.config.ts - Configuração Tailwind',
        'vite.config.ts - Configuração Vite'
      ],
      'Documentação': [
        'README.md - Documentação principal',
        'replit.md - Histórico e arquitetura',
        'ARQUITETURA_MULTI_TENANT.md - Documentação técnica',
        'SECURITY_IMPROVEMENTS.md - Melhorias de segurança'
      ],
      'Integrações': [
        'nsdocs.api.ts - Integração NSDocs API',
        'cloudflare-setup.js - Configuração Cloudflare'
      ]
    }
  };
  
  return JSON.stringify(structure, null, 2);
}

function generateUploadGuide() {
  const guide = `
# Guia de Upload para GitHub - CrossWMS

## 📋 Preparação Concluída

✅ README.md criado com documentação completa
✅ .gitignore configurado para excluir arquivos desnecessários
✅ Estrutura do projeto organizada
✅ Comandos Git preparados

## 🚀 Próximos Passos

### 1. Criar Repositório no GitHub
- Acesse https://github.com/new
- Nome: \`crosswms-sistema\`
- Descrição: "Sistema de Gestão Logística Multi-Tenant para o mercado brasileiro"
- Tipo: Público ou Privado (sua escolha)
- NÃO inicialize com README (já temos um)

### 2. Executar Upload
Execute os comandos do arquivo \`git-commands.txt\` ou use a interface do Replit:
- Va em "Version Control" no painel lateral
- Faça commit de todos os arquivos
- Configure o remote para seu repositório GitHub
- Faça push para main branch

### 3. Configurar Repositório
Após upload, configure:
- Descrição detalhada
- Topics: \`logistics\`, \`nfe\`, \`react\`, \`typescript\`, \`multi-tenant\`
- Branch protection rules (se necessário)
- Issues e Projects (se aplicável)

## 📊 Estatísticas do Projeto

- **Linguagens**: TypeScript, JavaScript, CSS
- **Framework Frontend**: React 18 + Vite
- **Framework Backend**: Node.js + Express
- **Banco de Dados**: PostgreSQL + Drizzle ORM
- **Arquivos principais**: ~100+ arquivos de código
- **Documentação**: 8 arquivos .md com guias completos

## 🔗 URLs Importantes

- **Produção**: https://www.crosswms.com.br
- **Desenvolvimento**: http://localhost:5173
- **Replit**: https://replit.com/@leonardobandei1/workspace

## ✨ Funcionalidades Destacadas

1. **Multi-Tenant**: Arquitetura hierárquica empresa matriz → filiais
2. **NFe Processing**: Integração com NSDocs API para busca automática
3. **Permissões Granulares**: 38+ permissões específicas por módulo
4. **Interface Moderna**: Design system com Tailwind + Radix UI
5. **Controle de Versões**: Integração nativa com GitHub
6. **Deploy Automation**: Scripts para Cloudflare e domínio personalizado

---
Sistema pronto para upload! 🚀
`;
  
  return guide;
}

// Gerar arquivos de preparação
console.log('🚀 Preparando CrossWMS para GitHub...');

// 1. Comandos Git
fs.writeFileSync('git-commands.txt', generateGitCommands());
console.log('✅ Comandos Git criados em: git-commands.txt');

// 2. Estrutura do projeto
fs.writeFileSync('project-structure.json', createProjectStructure());
console.log('✅ Estrutura do projeto documentada em: project-structure.json');

// 3. Guia de upload
fs.writeFileSync('GITHUB_UPLOAD_GUIDE.md', generateUploadGuide());
console.log('✅ Guia de upload criado em: GITHUB_UPLOAD_GUIDE.md');

// 4. Verificar arquivos essenciais
console.log('\n📋 Verificando arquivos essenciais...');
let missingFiles = [];
let existingFiles = [];

essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    existingFiles.push(file);
  } else {
    missingFiles.push(file);
  }
});

console.log(`✅ ${existingFiles.length} arquivos essenciais encontrados`);
if (missingFiles.length > 0) {
  console.log(`⚠️  ${missingFiles.length} arquivos não encontrados:`, missingFiles);
}

console.log('\n🎯 CrossWMS está pronto para upload no GitHub!');
console.log('📖 Consulte GITHUB_UPLOAD_GUIDE.md para instruções detalhadas');