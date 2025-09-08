/**
 * Script para fazer upload do CrossWMS para GitHub
 * Usando a interface do Replit
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🚀 Iniciando upload do CrossWMS para GitHub...');

// Verificar se todos os arquivos estão prontos
const requiredFiles = [
  'README.md',
  'package.json',
  '.gitignore',
  'LICENSE',
  'client/',
  'server/',
  'shared/'
];

console.log('📋 Verificando arquivos necessários...');
let allFilesPresent = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - FALTANDO`);
    allFilesPresent = false;
  }
});

if (!allFilesPresent) {
  console.log('❌ Alguns arquivos necessários estão faltando!');
  process.exit(1);
}

console.log('\n✅ Todos os arquivos necessários estão presentes!');

// Preparar commit message
const commitMessage = `feat: Sistema CrossWMS v2.1.0 - Plataforma logística completa

- Sistema multi-tenant com arquitetura hierárquica
- Módulos: Armazenagem, Coletas, Carregamento, Relatórios
- Integração NSDocs API para processamento NFe
- Interface moderna com React + TypeScript
- Backend Node.js com PostgreSQL e Drizzle ORM
- Sistema de permissões granulares (38+ permissões)
- Autenticação JWT com 4 tipos de usuário
- Domínio personalizado com Cloudflare
- Controle de versões integrado com GitHub
- Documentação completa e guias de deploy`;

// Criar arquivo de commit message
fs.writeFileSync('COMMIT_MESSAGE.txt', commitMessage);

console.log('\n📝 Commit message criada em COMMIT_MESSAGE.txt');
console.log('\n🎯 Sistema CrossWMS pronto para upload!');
console.log('\n📌 PRÓXIMOS PASSOS:');
console.log('1. Use a aba "Version Control" no painel lateral do Replit');
console.log('2. Adicione todos os arquivos para commit');
console.log('3. Use a mensagem do arquivo COMMIT_MESSAGE.txt');
console.log('4. Configure o repositório: https://github.com/leobandeira-dev/crosswms-sistema');
console.log('5. Faça push para GitHub');
console.log('\n🔗 Repositório sugerido: crosswms-sistema');
console.log('📖 Consulte CRIAR_REPOSITORIO_GITHUB.md para detalhes');

// Mostrar estatísticas do projeto
try {
  const stats = {
    totalFiles: 0,
    codeFiles: 0,
    docFiles: 0
  };

  function countFiles(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = `${dir}/${file}`;
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('attached_assets')) {
          countFiles(filePath);
        }
      } else {
        stats.totalFiles++;
        if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
          stats.codeFiles++;
        }
        if (file.endsWith('.md')) {
          stats.docFiles++;
        }
      }
    });
  }

  countFiles('.');

  console.log('\n📊 ESTATÍSTICAS DO PROJETO:');
  console.log(`📁 Total de arquivos: ${stats.totalFiles}`);
  console.log(`💻 Arquivos de código: ${stats.codeFiles}`);
  console.log(`📚 Arquivos de documentação: ${stats.docFiles}`);
} catch (error) {
  console.log('⚠️ Não foi possível calcular estatísticas');
}

console.log('\n🌟 CrossWMS - Sistema de Gestão Logística');
console.log('🔗 https://www.crosswms.com.br');
console.log('👨‍💻 Leonardo Bandeira - admin@crosswms.com.br');