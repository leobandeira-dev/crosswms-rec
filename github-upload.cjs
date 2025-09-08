const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Preparando upload para GitHub...');

// Criar arquivo tar com todo o projeto
console.log('📦 Criando arquivo compactado...');
try {
  // Excluir node_modules e arquivos desnecessários do tar
  execSync('tar --exclude="node_modules" --exclude=".git" --exclude="dist" --exclude="*.log" -czf crosswms-project.tar.gz .', { stdio: 'inherit' });
  
  console.log('✅ Arquivo crosswms-project.tar.gz criado com sucesso!');
  
  const stats = fs.statSync('crosswms-project.tar.gz');
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`📊 Tamanho do arquivo: ${fileSizeInMB} MB`);
  
  console.log('\n🎯 Próximos passos para upload:');
  console.log('1. Acesse: https://github.com/leobandeira-dev/crosswms-rec');
  console.log('2. Clique em "uploading an existing file"');
  console.log('3. Arraste o arquivo crosswms-project.tar.gz');
  console.log('4. Ou use git com token de acesso pessoal');
  
  // Criar instruções detalhadas
  const instructions = `# 📤 Upload do CrossWMS para GitHub

## 🎯 Repositório
https://github.com/leobandeira-dev/crosswms-rec

## 📦 Arquivo Gerado
- **Nome**: crosswms-project.tar.gz
- **Tamanho**: ${fileSizeInMB} MB
- **Conteúdo**: Projeto completo (exceto node_modules)

## 🚀 Métodos de Upload

### Método 1: Interface GitHub
1. Acesse o repositório no GitHub
2. Clique em "uploading an existing file"
3. Arraste crosswms-project.tar.gz
4. Adicione descrição do commit
5. Clique em "Commit changes"

### Método 2: Git com Token
\`\`\`bash
# Configure seu token de acesso pessoal
git remote set-url origin https://[SEU_TOKEN]@github.com/leobandeira-dev/crosswms-rec.git
git push -u origin main
\`\`\`

### Método 3: GitHub CLI (se disponível)
\`\`\`bash
gh repo clone leobandeira-dev/crosswms-rec
# Copiar arquivos e fazer push
\`\`\`

## 📋 Estrutura do Projeto

- **/src/** - Versão mais recente (restaurada do client)
- **/src_legacy/** - Versão anterior (backup)
- **/client/** - Fonte original
- **README.md** - Documentação completa
- **package.json** - Dependências e scripts
- **.replit** - Configuração Replit

## 🎉 Sistema Completo Incluído

✅ SuperAdminDashboard com métricas das imagens  
✅ Navbar completa com todas as rotas  
✅ Armazenagem + Coletas + Expedição + Marketplace  
✅ Sistema de Conquistas + SAC + Relatórios  
✅ Todas as dependências instaladas  
✅ Configurado para Replit preview  
✅ CSS/Tailwind funcionando  

---
**CrossWMS © 2025 - Sistema de Gestão Logística**
`;

  fs.writeFileSync('GITHUB_UPLOAD_GUIDE.md', instructions);
  console.log('📝 Guia de upload salvo em GITHUB_UPLOAD_GUIDE.md');
  
} catch (error) {
  console.error('❌ Erro ao criar arquivo:', error.message);
}

