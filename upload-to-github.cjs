const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Iniciando upload do CrossWMS para GitHub...');

// Verificar se o repositório já existe
console.log('📋 Preparando commit...');

try {
  // Fazer commit se houver mudanças
  try {
    execSync('git add .', { stdio: 'inherit' });
    execSync('git commit -m "feat: CrossWMS Sistema Completo Restaurado - Versão Final\n\n- Sistema completo restaurado da pasta client\n- SuperAdminDashboard com métricas corretas\n- Navbar completa com todas as rotas\n- Armazenagem, Marketplace, Conquistas implementados\n- Versão anterior preservada em src_legacy\n- Configurado para Replit preview\n- Todas as dependências instaladas"', { stdio: 'inherit' });
  } catch (e) {
    console.log('ℹ️ Nenhuma mudança para commit ou commit já existe');
  }

  // Configurar remote
  console.log('🔗 Configurando repositório remoto...');
  try {
    execSync('git remote remove origin', { stdio: 'pipe' });
  } catch (e) {
    // Remote não existe, tudo bem
  }
  
  execSync('git remote add origin https://github.com/leonardobandeira/crosswms-rec.git', { stdio: 'inherit' });
  execSync('git branch -M main', { stdio: 'inherit' });

  console.log('📤 Fazendo push para GitHub...');
  execSync('git push -u origin main --force', { stdio: 'inherit' });

  console.log('✅ Upload concluído com sucesso!');
  console.log('🌐 Repositório: https://github.com/leonardobandeira/crosswms-rec');
  
} catch (error) {
  console.error('❌ Erro durante o upload:', error.message);
  
  // Criar arquivo de instruções
  const instructions = `
# Instruções para Upload Manual

1. Acesse: https://github.com/new
2. Nome do repositório: crosswms-rec
3. Descrição: Sistema CrossWMS - Gestão Logística Completa
4. Público: ✓
5. Clique em "Create repository"

6. No terminal, execute:
git remote add origin https://github.com/leonardobandeira/crosswms-rec.git
git branch -M main
git push -u origin main

## Estrutura do Projeto:
- /src/ - Versão mais recente (restaurada do client)
- /src_legacy/ - Versão anterior (backup)
- /client/ - Fonte original
- Porta: 8080/8081 (Replit preview)
`;

  fs.writeFileSync('UPLOAD_INSTRUCTIONS.md', instructions);
  console.log('📝 Instruções salvas em UPLOAD_INSTRUCTIONS.md');
}
