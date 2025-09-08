# RESUMO: Rotinas que Alimentam Campos das NFes

## ORIGEM DOS DADOS POR ROTINA

### 1. **Processamento XML NFe** → 11 campos
- **Arquivo:** `process-nfe.js`, `server/nfe-routes.ts`
- **Tabela:** `notas_fiscais`
- **Campos:** número, chave, remetente, destinatário, cidades, valores, peso, volumes, data emissão

### 2. **API Rastreamento** → 12 campos
- **Arquivo:** `server/rastreamento-routes.ts`
- **Tabela:** `ordens_carga` (via JOIN)
- **Campos:** status atual, localização, prioridade, datas operacionais, números OR/coleta

### 3. **Cadastro de Volumes** → 5 campos
- **Arquivo:** `client/src/components/comum/VolumeModal.tsx`
- **Tabela:** `volumes_etiqueta`
- **Campos:** dimensões (altura, largura, comprimento), volume m³, código etiqueta

### 4. **Campos Calculados** → 8 campos
- **Lógica:** API Rastreamento
- **Campos:** KM faltantes, histórico eventos, progresso, última atualização

### 5. **Valores Padrão** → 4 campos
- **Campos:** série (001), aprovação (aprovado), tipo frete (CIF), tipo transporte (Fracionado)

### 6. **Não Implementados** → 3 campos
- **Campos:** motorista, CTE coleta, CTE viagem

## FLUXO DE ALIMENTAÇÃO

```
XML NFe → notas_fiscais (dados fiscais)
         ↓
Ordem Carga → ordens_carga (datas/status)
         ↓
Volumes → volumes_etiqueta (dimensões)
         ↓
API Rastreamento → Cálculos + Formatação
         ↓
Interface Final → 43 campos totais
```

## STATUS AUTOMÁTICO (Baseado em Datas)

```javascript
if (data_entrega_realizada) → 'entregue'
else if (data_saida) → 'em_transito'  
else if (data_carregamento) → 'carregado'
else if (data_entrada_armazem) → 'armazenado'
else if (data_coleta) → 'coletado'
else → 'pendente_coleta'
```

## HISTÓRICO AUTOMÁTICO

- **Recebido:** `created_at` da NFe
- **Coletado:** `data_coleta` da ordem
- **Armazenado:** `data_entrada_armazem` da ordem
- **Carregado:** `data_carregamento` da ordem
- **Em Trânsito:** `data_saida` da ordem
- **Entregue:** `data_entrega_realizada` da ordem

**Total:** 43 campos mapeados | 4 rotinas principais | 3 tabelas origem