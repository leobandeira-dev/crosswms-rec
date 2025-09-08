# CrossWMS - Sistema de Gestão Logística

## 🚀 Sobre o Projeto

O CrossWMS é um sistema completo de gestão logística desenvolvido em React + TypeScript, projetado para otimizar operações de armazenagem, coletas, expedição e marketplace.

## 📋 Funcionalidades Principais

### 🏢 Super Admin Dashboard
- **Métricas em Tempo Real**: Empresas Ativas (12), Usuários Total (156), Receita Mensal (R$ 24.500), Tickets Suporte (8)
- **Ações Rápidas**: Gerenciar Empresas, Gestão de Pacotes, Aprovação Transportadores
- **Relatórios Sistema**: Análises e métricas gerais
- **Logs e Auditoria**: Monitoramento completo do sistema

### 📦 Módulos Implementados
- **Armazenagem**: Recebimento, Movimentações, Carregamento, Rastreamento, FilaX
- **Coletas**: Solicitações, Aprovações, Alocação de Cargas, Roteirização
- **Expedição**: Faturamento, Emissão de Documentos, Remessas
- **Marketplace**: Dashboard, Criação de Ordens, Monitoramento de Rotas
- **Conquistas**: Sistema de Gamificação e Achievements
- **SAC**: Atendimentos, Chamados, Ocorrências
- **Relatórios**: Dashboards específicos por módulo
- **Cadastros**: Empresas, Usuários, Produtos, Motoristas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Vite
- **Roteamento**: Wouter + React Router DOM
- **UI Components**: Radix UI, Tailwind CSS, Lucide Icons
- **Estado**: TanStack Query, Context API
- **Formulários**: React Hook Form, Zod
- **Gráficos**: Recharts
- **PDF/Print**: jsPDF, html2canvas
- **QR/Barcode**: @zxing/browser, jsbarcode
- **Drag & Drop**: react-beautiful-dnd
- **Notificações**: Sonner

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/             # Componentes base (Radix UI)
│   ├── layout/         # Layout (TopNavbar, MainLayout)
│   ├── common/         # Componentes compartilhados
│   └── [modulo]/       # Componentes específicos por módulo
├── pages/              # Páginas da aplicação
│   ├── admin/          # Páginas administrativas
│   ├── armazenagem/    # Módulo de armazenagem
│   ├── coletas/        # Módulo de coletas
│   ├── expedicao/      # Módulo de expedição
│   ├── marketplace/    # Módulo marketplace
│   └── [outros]/       # Outros módulos
├── routes/             # Configuração de rotas
├── hooks/              # Custom hooks
├── services/           # Serviços de API
├── types/              # Definições TypeScript
└── utils/              # Utilitários

src_legacy/             # Versão anterior (backup)
client/                 # Fonte original de referência
```

## 🚀 Como Executar

### Desenvolvimento
```bash
npm install
npm run dev
```

### Apenas Frontend
```bash
npm run dev:client
```

### Apenas Backend
```bash
npm run dev:server
```

## 🌐 Acesso

- **Frontend**: http://localhost:8080 ou 8081
- **Backend API**: http://localhost:5000

### Navegação
- `/` - Página inicial com seletor de versões
- `/admin` - Super Admin Dashboard (Nova Versão)
- `/legacy` - Dashboard anterior (Versão Legacy)

## 🎨 Interface

### TopNavbar
- **Logo**: CrossWMS + Gestão Logística
- **Perfil**: Leonardo Bandeira - Super Admin
- **Menus**: Dashboard, Admin, Coletas, Armazenagem, Marketplace, Conquistas, Cadastros, Relatórios, SAC

### Temas
- **Cores**: Azul corporativo (#0066CC), cinzas profissionais
- **Tipografia**: Inter (Google Fonts)
- **Layout**: Responsivo, moderno, acessível

## 📊 Métricas do Sistema

- **Empresas Ativas**: 12 (+2 este mês)
- **Usuários Total**: 156 (+15 este mês)
- **Receita Mensal**: R$ 24.500 (+12% vs mês anterior)
- **Tickets Suporte**: 8 (3 pendentes)

## 🔧 Configuração Replit

O projeto está configurado para rodar no Replit com:
- **Porta**: 8080 (configurada no .replit)
- **Preview**: Simple Browser
- **Hot Reload**: Ativo
- **Dependências**: Auto-instalação

## 📝 Versioning

- **Versão Atual**: Sistema completo restaurado do client
- **Versão Legacy**: Preservada em src_legacy/
- **Fonte Original**: Mantida em client/

## 🎯 Status

✅ Sistema 100% operacional  
✅ Todas as rotas implementadas  
✅ Interface responsiva  
✅ Dependências completas  
✅ Configurado para Replit  
✅ Backup de versões preservado  

---

**Desenvolvido por Leonardo Bandeira**  
**CrossWMS © 2025 - Sistema de Gestão Logística**