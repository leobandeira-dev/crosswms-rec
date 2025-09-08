#!/bin/bash

# Script para criar repositório GitHub e fazer upload do CrossWMS
# Este script deve ser executado após criar o repositório manualmente no GitHub

echo "🚀 Configurando upload do CrossWMS para GitHub..."

# Configurar Git (se necessário)
git config --global user.name "Leonardo Bandeira"
git config --global user.email "admin@crosswms.com.br"

# Remover remote existente e adicionar novo
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/leobandeira-dev/crosswms-sistema.git

# Verificar status
echo "📋 Status do repositório:"
git status --porcelain | head -10

# Adicionar todos os arquivos (exceto os ignorados)
echo "📁 Adicionando arquivos..."
git add .

# Fazer commit com mensagem preparada
echo "💾 Fazendo commit..."
git commit -F COMMIT_MESSAGE.txt || git commit -m "feat: Sistema CrossWMS v2.1.0 - Plataforma logística completa"

# Configurar branch principal
git branch -M main

# Fazer push para GitHub
echo "⬆️ Enviando para GitHub..."
git push -u origin main

echo "✅ Upload concluído!"
echo "🔗 Repositório: https://github.com/leobandeira-dev/crosswms-sistema"