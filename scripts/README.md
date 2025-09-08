# 📜 Scripts do Sistema - CrossWMS

Esta pasta contém todos os scripts auxiliares do sistema, organizados por categoria.

## 📁 Estrutura de Scripts

### 🚀 Desenvolvimento (`dev/`)
Scripts para desenvolvimento e execução local:
- `start-dev.js` - Inicia servidor de desenvolvimento
- `start-dev-with-vite.js` - Inicia com Vite
- `start-system.js` - Inicia sistema completo
- `server-dev.js` - Servidor de desenvolvimento

### 🧪 Testes (`test/`)
Scripts de teste e validação:
- `test-danfe-oficial.js` - Teste do gerador DANFE
- `test-xml-processing.js` - Teste de processamento XML
- `test-35-notes.js` - Teste com 35 notas
- `insert-nfe-417536.js` - Inserção de NFe específica

### 🔧 Utilitários (`utils/`)
Scripts utilitários e processamento:
- `process-nfe.js` - Processamento de NFe
- `process-real-nfe.js` - Processamento de NFe real
- `dangerous-goods-output.js` - Processamento de produtos perigosos
- `github-direct-upload.js` - Upload direto para GitHub
- `prepare-github-upload.js` - Preparação para upload
- `upload-github.js` - Upload para GitHub

### ⚙️ Setup (`setup/`)
Scripts de configuração e instalação:
- `cloudflare-setup.js` - Configuração Cloudflare
- `setup-database.js` - Configuração do banco de dados

## 🚀 Como Usar

### Desenvolvimento
```bash
# Iniciar desenvolvimento
node scripts/dev/start-dev.js

# Iniciar com Vite
node scripts/dev/start-dev-with-vite.js

# Iniciar sistema completo
node scripts/dev/start-system.js
```

### Testes
```bash
# Executar testes
node scripts/test/test-danfe-oficial.js
node scripts/test/test-xml-processing.js
```

### Utilitários
```bash
# Processar NFe
node scripts/utils/process-nfe.js

# Upload para GitHub
node scripts/utils/upload-github.js
```

### Setup
```bash
# Configurar banco
node scripts/setup/setup-database.js

# Configurar Cloudflare
node scripts/setup/cloudflare-setup.js
```

## ⚠️ Importante

- **Scripts críticos** permanecem na raiz do projeto
- **Sempre teste** scripts antes de usar em produção
- **Verifique dependências** antes de executar
- **Consulte logs** para troubleshooting

## 🔗 Scripts Críticos (Raiz)

Estes scripts **NÃO** devem ser movidos:
- `server.js` - Servidor principal
- `package.json` - Configuração do projeto
- `tsconfig.json` - Configuração TypeScript
- `postcss.config.js` - Configuração PostCSS
- `eslint.config.js` - Configuração ESLint

---

*Mantenha esta documentação atualizada conforme novos scripts são adicionados.*
