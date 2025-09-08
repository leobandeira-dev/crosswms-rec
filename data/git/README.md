# 📝 Arquivos Git - CrossWMS

Esta pasta contém arquivos relacionados ao controle de versão e comandos Git do projeto.

## 📁 Arquivos Git

### Documentação
- `COMMIT_MESSAGE.txt` - Mensagem de commit padrão para o projeto
- `git-commands.txt` - Comandos Git para upload e configuração

## 📋 Conteúdo dos Arquivos

### COMMIT_MESSAGE.txt
Contém a mensagem de commit padrão para o sistema CrossWMS v2.1.0, incluindo:
- Descrição do sistema multi-tenant
- Lista de módulos implementados
- Tecnologias utilizadas
- Funcionalidades principais

### git-commands.txt
Comandos Git organizados para:
- Inicialização do repositório
- Configuração de usuário
- Adição de remote
- Commit inicial
- Push para GitHub
- Verificação de status

## 🚀 Como Usar

### Para Commit Padrão
```bash
# Usar a mensagem padrão
git commit -m "$(cat data/git/COMMIT_MESSAGE.txt)"
```

### Para Configuração Inicial
```bash
# Executar comandos do arquivo
cat data/git/git-commands.txt | bash
```

### Para Upload no GitHub
```bash
# Seguir os passos do git-commands.txt
git add .
git commit -m "$(cat data/git/COMMIT_MESSAGE.txt)"
git push origin main
```

## 📝 Personalização

### Atualizar Mensagem de Commit
Edite `COMMIT_MESSAGE.txt` para refletir mudanças na versão:
- Atualize número da versão
- Adicione novas funcionalidades
- Modifique descrições conforme necessário

### Adicionar Novos Comandos
Edite `git-commands.txt` para incluir:
- Novos comandos de configuração
- Scripts de deploy
- Comandos de manutenção

## ⚠️ Importante

- **Backup**: Mantenha backup dos comandos funcionais
- **Teste**: Teste comandos em ambiente de desenvolvimento
- **Atualização**: Mantenha comandos atualizados com mudanças do projeto
- **Segurança**: Não inclua credenciais ou tokens nos comandos

---

*Mantenha estes arquivos atualizados conforme o projeto evolui.*
