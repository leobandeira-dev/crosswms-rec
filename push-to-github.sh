#!/bin/bash

# Script para fazer push para GitHub usando token de acesso pessoal
# Substitua YOUR_TOKEN pelo seu token de acesso pessoal do GitHub

echo "🚀 Fazendo push para GitHub..."

# Configurar o remote com token
git remote set-url origin https://ghp_YOUR_TOKEN@github.com/leobandeira-dev/crosswms-rec.git

# Fazer push
git push origin main

echo "✅ Push concluído!"
