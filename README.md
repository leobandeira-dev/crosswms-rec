# CrossWMS - Sistema de Gestão Logística

![CrossWMS Logo](https://img.shields.io/badge/CrossWMS-Sistema%20Log%C3%ADstico-blue)
![Version](https://img.shields.io/badge/version-2.1.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## 📋 Sobre o Projeto

**CrossWMS** é uma plataforma logística integrada de alta performance desenvolvida especificamente para o mercado brasileiro. O sistema oferece gestão completa de operações logísticas com foco em processamento de NFe (Nota Fiscal Eletrônica), automação RPA e gerenciamento multi-tenant.

### 🎯 Principais Funcionalidades

- **Gestão de Armazenagem**: Dashboard, Conferência, Endereçamento e Checklist
- **Sistema de Coletas**: Solicitações, Programação, Execução e Relatórios
- **Carregamento Inteligente**: Planejamento, Ordem de Carga, Execução e Rastreamento
- **Portal do Cliente**: Dashboard personalizado, Aprovações, Rastreamento e Documentos
- **Portal do Fornecedor**: Gestão de Solicitações, Documentação e Comunicação
- **Administração Multi-Tenant**: Gestão de usuários, configurações e relatórios avançados

## 🏗️ Arquitetura Técnica

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Radix UI** componentes de interface
- **TanStack Query** para gerenciamento de estado
- **React Router** para navegação
- **Vite** para build e desenvolvimento

### Backend
- **Node.js** com Express.js
- **TypeScript** com ES modules
- **PostgreSQL** com Drizzle ORM
- **Autenticação JWT** com sessões seguras
- **API RESTful** com validação Zod

### Integrações
- **NSDocs API** para busca de NFe
- **BrasilAPI** para consulta de CNPJ
- **Cloudflare** para CDN e domínio personalizado
- **GitHub** para controle de versões

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL 14+
- NPM ou Yarn

### 1. Clone o repositório
```bash
git clone https://github.com/crosswms/crosswms-sistema.git
cd crosswms-sistema
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/crosswms
NSDOCS_CLIENT_ID=seu_client_id
NSDOCS_CLIENT_SECRET=seu_client_secret
```

### 4. Execute as migrações do banco
```bash
npm run db:push
```

### 5. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build de produção
- `npm run db:push` - Sincroniza schema com banco de dados
- `npm run db:studio` - Interface visual do banco (Drizzle Studio)

## 📁 Estrutura do Projeto

```
crosswms/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── hooks/        # Hooks customizados
│   │   └── lib/          # Utilitários e configurações
├── server/                # Backend Node.js
│   ├── routes.ts         # Rotas da API
│   ├── storage.ts        # Camada de dados
│   └── index.ts          # Servidor Express
├── shared/               # Código compartilhado
│   └── schema.ts         # Schema do banco de dados
├── migrations/           # Migrações do banco
└── docs/                # Documentação
```

## 🔐 Autenticação e Permissões

O sistema implementa um robusto sistema de autenticação multi-tenant com:

- **4 tipos de usuário**: Super Admin, Transportador, Cliente, Fornecedor
- **Controle granular**: 38+ permissões específicas por módulo
- **Hierarquia empresarial**: Sistema matriz-filial para grandes operações
- **Segurança**: JWT com rotação automática de tokens

### Credenciais padrão
- **Email**: admin@crosswms.com.br
- **Senha**: 123456
- **Tipo**: Super Administrador

## 📊 Funcionalidades Principais

### 1. Processamento de NFe
- Importação via chave de acesso de 44 dígitos
- Integração com APIs oficiais (NSDocs)
- Extração automática de dados
- Validação e cubagem de volumes

### 2. Gestão de Cargas
- Criação de ordens de carregamento
- Otimização de rotas e volumes
- Rastreamento em tempo real
- Relatórios de performance

### 3. Multi-Tenant
- Isolamento completo de dados por empresa
- Gestão hierárquica de usuários
- Configurações personalizáveis
- Aprovações em múltiplos níveis

## 🌐 Deploy e Produção

### Deploy no Replit
1. Configure as variáveis de ambiente no Replit
2. Conecte ao banco PostgreSQL (Neon recomendado)
3. Execute `npm run build` para build de produção
4. Configure domínio personalizado via Cloudflare

### Configuração de Domínio
Consulte os guias detalhados:
- `GUIA_CLOUDFLARE_API.md` - Configuração completa do Cloudflare
- `CONFIGURACAO_DOMINIO_HOSTGATOR.md` - DNS no Hostgator
- `SOLUCAO_CACHE_POS_DEPLOY.md` - Resolução de problemas de cache

## 📈 Monitoramento e Versões

O sistema inclui:
- **Tracking de versões** integrado com GitHub
- **Histórico de deploys** com detalhes técnicos
- **Monitoramento de performance** em tempo real
- **Logs de auditoria** para operações críticas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Changelog

### Versão 2.1.0 (Junho 2025)
- ✅ Sistema multi-tenant completo
- ✅ Integração GitHub para controle de versões
- ✅ Domínio personalizado com Cloudflare
- ✅ Interface redesenhada com melhor UX
- ✅ API otimizada para performance

### Versão 2.0.0 (Junho 2025)
- ✅ Reescrita completa em TypeScript
- ✅ Nova arquitetura multi-tenant
- ✅ Sistema de permissões granulares
- ✅ Integração com NSDocs API

## 📞 Suporte

- **Website**: [www.crosswms.com.br](https://www.crosswms.com.br)
- **Email**: suporte@crosswms.com.br
- **Documentação**: Consulte os arquivos `.md` na raiz do projeto

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**CrossWMS** - Transformando a logística brasileira através da tecnologia 🚛📦