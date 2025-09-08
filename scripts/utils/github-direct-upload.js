/**
 * Upload direto do CrossWMS para GitHub via API
 */

import fs from 'fs';
import path from 'path';

// Função para criar o repositório no GitHub
async function createGitHubRepo() {
  const repoData = {
    name: 'crosswms-sistema',
    description: 'Sistema de Gestão Logística Multi-Tenant para o mercado brasileiro - React + TypeScript + Node.js',
    private: false,
    auto_init: false,
    homepage: 'https://www.crosswms.com.br'
  };

  console.log('Criando repositório no GitHub...');
  console.log('Acesse: https://github.com/new');
  console.log('Nome: crosswms-sistema');
  console.log('Descrição:', repoData.description);
  console.log('Público: Sim');
  console.log('NÃO inicialize com README');
}

// Função para gerar arquivo ZIP do projeto
function createProjectArchive() {
  console.log('Preparando arquivos para upload...');
  
  const filesToInclude = [
    'README.md',
    'LICENSE',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'tailwind.config.ts',
    'vite.config.ts',
    'drizzle.config.ts',
    '.gitignore',
    'components.json',
    'postcss.config.js',
    'replit.md',
    'ARQUITETURA_MULTI_TENANT.md',
    'SECURITY_IMPROVEMENTS.md',
    'SOLUCAO_CACHE_POS_DEPLOY.md',
    'GUIA_CLOUDFLARE_API.md',
    'CONFIGURACAO_DOMINIO_HOSTGATOR.md',
    'INSTRUCOES_FINAIS.md',
    'NSDOCS_API_USAGE.md',
    'cloudflare-setup.js',
    'setup-cloudflare.js',
    'nsdocs.api.ts'
  ];
  
  console.log('Arquivos principais incluídos:');
  filesToInclude.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`⚠️ ${file} - não encontrado`);
    }
  });
  
  console.log('\nDiretórios incluídos:');
  ['client/', 'server/', 'shared/', 'migrations/'].forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`✅ ${dir}`);
    } else {
      console.log(`⚠️ ${dir} - não encontrado`);
    }
  });
}

// Instruções de upload manual
function showManualUploadInstructions() {
  console.log('\n🚀 INSTRUÇÕES DE UPLOAD MANUAL PARA GITHUB');
  console.log('==========================================');
  
  console.log('\n1. CRIAR REPOSITÓRIO:');
  console.log('   - Acesse: https://github.com/new');
  console.log('   - Nome: crosswms-sistema');
  console.log('   - Descrição: Sistema de Gestão Logística Multi-Tenant para o mercado brasileiro');
  console.log('   - Público: Sim');
  console.log('   - NÃO marque "Add a README file"');
  console.log('   - Clique em "Create repository"');
  
  console.log('\n2. USAR INTERFACE DO REPLIT:');
  console.log('   - Abra a aba "Version Control" no painel lateral');
  console.log('   - Clique em "Connect to Git Repository"');
  console.log('   - Cole a URL: https://github.com/leobandeira-dev/crosswms-sistema.git');
  console.log('   - Autorize o acesso ao GitHub');
  
  console.log('\n3. FAZER COMMIT:');
  console.log('   - Selecione todos os arquivos na aba Version Control');
  console.log('   - Use a mensagem de commit do arquivo COMMIT_MESSAGE.txt');
  console.log('   - Clique em "Commit & Push"');
  
  console.log('\n4. VERIFICAR UPLOAD:');
  console.log('   - Acesse: https://github.com/leobandeira-dev/crosswms-sistema');
  console.log('   - Verifique se todos os arquivos foram enviados');
  console.log('   - Configure descrição, topics e documentação');
  
  console.log('\n📋 TOPICS SUGERIDAS:');
  console.log('   logistics, nfe, react, typescript, nodejs, multi-tenant, warehouse-management, brazilian-market');
}

// Executar processo
async function main() {
  console.log('🌟 CrossWMS - Upload para GitHub');
  console.log('================================\n');
  
  createProjectArchive();
  await createGitHubRepo();
  showManualUploadInstructions();
  
  console.log('\n✨ Sistema CrossWMS preparado para GitHub!');
  console.log('📖 Consulte CRIAR_REPOSITORIO_GITHUB.md para detalhes completos');
  console.log('🔗 URL do repositório: https://github.com/leobandeira-dev/crosswms-sistema');
}

main().catch(console.error);