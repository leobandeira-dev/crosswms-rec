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
## Integração: Logística da Informação (Consulta NFe)

Endpoint backend para consultar o XML da NFe via API SOAP da Logística da Informação.

- URL: `POST /api/xml/fetch-from-logistica`
- Headers: `Content-Type: application/json`
- Body:
  - `chaveNotaFiscal` (string, obrigatório, 44 dígitos)
  - `cnpj` (string, opcional)
  - `token` (string, opcional)

Se `cnpj`/`token` não forem enviados no corpo, o backend usa as variáveis de ambiente `LOGISTICA_CNPJ` e `LOGISTICA_INFORMACAO_TOKEN`. Caso não existam, usa valores padrão de desenvolvimento.

### Exemplo de requisição (PowerShell / Windows)

Para evitar problemas de cotações do PowerShell, use o `cmd` com `curl.exe`:

```
cmd /c "echo {\"chaveNotaFiscal\":\"00000000000000000000000000000000000000000000\",\"cnpj\":\"12345678000199\",\"token\":\"SEU_TOKEN\"} | curl.exe -s -X POST http://localhost:3002/api/xml/fetch-from-logistica -H \"Content-Type: application/json\" --data-binary @-"
```

### Resposta

Retorna `200 OK` com JSON:

```
{
  "success": true | false,
  "data": { ... },
  "xml_content": "<xml...>",
  "error": "Mensagem de erro opcional",
  "nfe_not_found": true | false,
  "api_error": true | false,
  "invalid_xml": true | false,
  "source": "logistica_soap"
}
```

Observação: Mesmo em falhas esperadas da API (NFe não encontrada, SOAP fault), o backend retorna `200` com `success: false` e os indicadores (`nfe_not_found`, `api_error`, etc.). `500` só ocorre em exceções inesperadas (ex.: erro de build, dependência ausente).

### Configuração (.env)

Adicione ao `.env`:

```
LOGISTICA_CNPJ=00000000000000
LOGISTICA_INFORMACAO_TOKEN=SEU_TOKEN_AQUI
```

### Solução de problemas (evitar 500)

- Dependência do parser XML:
  - O serviço usa `xmldom`. Certifique-se que a dependência está instalada e que o serviço não usa `await import('xmldom')` fora de função `async`.
- Duplicidade de rotas:
  - Garanta que exista apenas uma rota `POST /api/xml/fetch-from-logistica`. Remova mocks com funções inexistentes.
- Formatação do JSON:
  - Envios via PowerShell com aspas podem quebrar o parse do body. Use o exemplo com `cmd` e `curl.exe`.
- Credenciais:
  - Sem `cnpj`/`token` válidos, a API remota pode retornar fault. O backend captura e responde com `success: false` (200), evitando 500.

### Uso no frontend

Envie o body com `chaveNotaFiscal`, `cnpj` e `token` ou configure as variáveis no backend. Exemplo:

```ts
await fetch('/api/xml/fetch-from-logistica', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chaveNotaFiscal, cnpj, token })
});
```

## Integração: Meu Danfe (Buscar XML e gerar DANFE)

Endpoint backend Node-only para buscar o XML oficial via API do Meu Danfe (compatível com Windows, sem Python).

- URL: `POST /api/xml/fetch-from-meudanfe`
- Headers: `Content-Type: application/json`
- Body:
  - `chaveNotaFiscal` (string, obrigatório, 44 dígitos)

### Endpoint Batch

- URL: `POST /api/xml/fetch-from-meudanfe/batch`
- Headers: `Content-Type: application/json`
- Body:
  - `keys` (array de strings, obrigatório) — cada item deve ser uma chave com 44 dígitos
- Resposta:
  - `{ success: true, items: [ { key, success, xml_content?, error?, code?, status? } ] }`
- Observações:
  - O servidor processa em lotes com concorrência controlada (tamanho do lote padrão: 5).
  - Em caso de erro por chave (saldo insuficiente, api key inválida, sem XML), o item retorna `success: false` com `error` e `code` específicos.
  - Requer `MEUDANFE_API_KEY` configurada no `.env`.

### Configuração (.env)

Adicione ao `.env`:

```
MEUDANFE_API_KEY=SEU_TOKEN_MEUDANFE
```

Opcional (cliente/Vite), apenas se fizer chamadas diretas do navegador:

```
VITE_MEUDANFE_API_KEY=SEU_TOKEN_MEUDANFE
```

### Fluxo da rota

- Valida a chave (44 dígitos) e a presença de `MEUDANFE_API_KEY`.
- Faz `PUT https://api.meudanfe.com.br/v2/fd/add/{chave}` com header `Api-Key`.
- Faz `GET https://api.meudanfe.com.br/v2/fd/get/xml/{chave}` com header `Api-Key`.
- Extrai o XML do corpo em formatos comuns (`xml`, `data.xml`, `result.xml`, etc.).
- Retorna:
  - Sucesso: `{ success: true, xml: "<NFe...>" }`
  - Falhas mapeadas: `invalid_key`, `meudanfe_api_key_missing`, `meudanfe_insufficient_balance` (402), `meudanfe_invalid_api_key` (401/403), `meudanfe_no_xml`.

### Teste rápido (PowerShell / Windows)

```
$env:MEUDANFE_API_KEY="SEU_TOKEN_MEUDANFE"; npm run dev
Invoke-RestMethod -Uri 'http://localhost:3002/api/xml/fetch-from-meudanfe' -Method POST -Body '{"chaveNotaFiscal":"<44-digitos>"}' -ContentType 'application/json'
```

### Documentação oficial

Referência: `https://meudanfe.com.br/documentacao.php`