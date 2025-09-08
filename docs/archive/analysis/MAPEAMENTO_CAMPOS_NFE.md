# Mapeamento Detalhado: Rotinas que Alimentam Campos das NFes

## 1. CAMPOS ALIMENTADOS PELA TABELA `notas_fiscais`

### Dados Fiscais Básicos
| Campo NFe | Campo Origem | Tabela | Rotina |
|-----------|--------------|--------|--------|
| `id` | `id` | `notas_fiscais` | Processamento XML NFe |
| `numero` | `numero_nf` | `notas_fiscais` | Processamento XML NFe |
| `chave_acesso` | `chave_acesso` | `notas_fiscais` | Processamento XML NFe |
| `dataEmissao` | `data_emissao` | `notas_fiscais` | Processamento XML NFe |
| `valorTotal` | `valor_total` | `notas_fiscais` | Processamento XML NFe |
| `pesoTotal` | `peso_bruto` | `notas_fiscais` | Processamento XML NFe |
| `volumes` | `volumes` | `notas_fiscais` | Processamento XML NFe |

### Dados do Remetente
| Campo NFe | Campo Origem | Tabela | Rotina |
|-----------|--------------|--------|--------|
| `remetente` | `emitente_razao_social` | `notas_fiscais` | Processamento XML NFe |
| `cidadeOrigem` | `emitente_cidade + emitente_uf` | `notas_fiscais` | Processamento XML NFe |

### Dados do Destinatário
| Campo NFe | Campo Origem | Tabela | Rotina |
|-----------|--------------|--------|--------|
| `destinatario` | `destinatario_razao_social` | `notas_fiscais` | Processamento XML NFe |
| `cidadeDestino` | `destinatario_cidade + destinatario_uf` | `notas_fiscais` | Processamento XML NFe |

## 2. CAMPOS ALIMENTADOS PELA TABELA `ordens_carga`

### Status e Estágios (Calculados)
| Campo NFe | Lógica de Cálculo | Tabela | Rotina |
|-----------|-------------------|--------|--------|
| `statusAtual` | Baseado nas datas da ordem | `ordens_carga` | API Rastreamento |
| `localizacaoAtual` | Baseado nas datas da ordem | `ordens_carga` | API Rastreamento |

**Lógica Específica:**
```javascript
// Determinação do statusAtual
if (data_entrega_realizada) → 'entregue'
else if (data_saida) → 'em_transito'  
else if (data_carregamento) → 'carregado'
else if (data_entrada_armazem) → 'armazenado'
else if (data_coleta) → 'coletado'
else → 'pendente_coleta'
```

### Prioridade
| Campo NFe | Campo Origem | Tabela | Rotina |
|-----------|--------------|--------|--------|
| `prioridade` | `prioridade.toLowerCase()` | `ordens_carga` | API Rastreamento |

### Datas Operacionais
| Campo NFe | Campo Origem | Tabela | Rotina |
|-----------|--------------|--------|--------|
| `dataSolicitacao` | `data_operacao` | `ordens_carga` | Criação da Ordem |
| `dataAprovacao` | `data_operacao` | `ordens_carga` | Criação da Ordem |
| `dataEntrada` | `data_entrada_armazem` | `ordens_carga` | Atualização Manual/Automática |
| `dataCarregamento` | `data_carregamento` | `ordens_carga` | Atualização Manual/Automática |
| `dataPrevisaoEntrega` | `data_entrega_prevista` | `ordens_carga` | Criação da Ordem |
| `dataEntrega` | `data_entrega_realizada` | `ordens_carga` | Atualização Manual/Automática |

### Informações da Ordem
| Campo NFe | Campo Origem | Tabela | Rotina |
|-----------|--------------|--------|--------|
| `numeroOR` | `numero_ordem` | `ordens_carga` | Geração Automática |
| `ordemCarregamento` | `numero_ordem` | `ordens_carga` | Geração Automática |
| `tipoEntrada` | `subtipo_operacao` | `ordens_carga` | Criação da Ordem |
| `numeroColeta` | `numero_ordem` (se Coleta) | `ordens_carga` | Criação da Ordem |

## 3. CAMPOS ALIMENTADOS PELA TABELA `volumes_etiqueta`

### Dimensões e Volumes
| Campo NFe | Campo Origem | Tabela | Rotina |
|-----------|--------------|--------|--------|
| `altura_cm` | `altura_cm` | `volumes_etiqueta` | Cadastro de Volumes |
| `largura_cm` | `largura_cm` | `volumes_etiqueta` | Cadastro de Volumes |
| `comprimento_cm` | `comprimento_cm` | `volumes_etiqueta` | Cadastro de Volumes |
| `volume_m3` | `volume_m3` | `volumes_etiqueta` | Cálculo Automático |
| `codigo_etiqueta` | `codigo_etiqueta` | `volumes_etiqueta` | Geração Automática |

## 4. CAMPOS CALCULADOS/PADRÃO

### Valores Padrão (Hardcoded)
| Campo NFe | Valor Padrão | Justificativa |
|-----------|-------------|---------------|
| `serie` | '001' | Campo não existe na tabela |
| `aprovacao` | 'aprovado' | Campo não existe na tabela |
| `tipoFrete` | 'CIF' | Campo não disponível |
| `tipoTransporte` | 'Fracionado' | Campo não disponível |

### Campos Calculados Dinamicamente
| Campo NFe | Lógica | Rotina |
|-----------|--------|--------|
| `kmFaltantes` | `Math.floor(Math.random() * 500) + 100` | API Rastreamento |
| `ultimaAtualizacao` | `created_at` formatado | API Rastreamento |
| `peso` | Cópia de `pesoTotal` | API Rastreamento |

## 5. CAMPOS SEM ORIGEM (Não Implementados)

### Campos Não Disponíveis
| Campo NFe | Status | Observação |
|-----------|--------|------------|
| `motorista` | undefined | Dados não vinculados |
| `numeroCteColeta` | undefined | Campo não implementado |
| `numeroCteViagem` | undefined | Campo não implementado |

## 6. HISTÓRICO DE EVENTOS

### Geração Automática
| Evento | Trigger | Dados Utilizados |
|--------|---------|------------------|
| **Recebido** | `created_at` da NFe | Sistema, cidade origem |
| **Coletado** | `data_coleta` da ordem | Equipe, cidade origem |
| **Armazenado** | `data_entrada_armazem` | Equipe, CD |
| **Carregado** | `data_carregamento` | Equipe, CD |
| **Em Trânsito** | `data_saida` | Motorista, rodovia |
| **Entregue** | `data_entrega_realizada` | Cliente, destino |

### Estrutura do Evento
```javascript
{
  id: 'sequencial',
  dataHora: 'data_da_operacao formatada',
  status: 'nome_do_status',
  local: 'cidade - uf ou descrição',
  responsavel: 'Sistema/Equipe/Motorista',
  observacoes: 'descrição da operação'
}
```

## 7. ROTINAS DE ATUALIZAÇÃO

### A. Processamento XML NFe
**Arquivo:** `process-nfe.js`, `server/nfe-routes.ts`
**Campos Atualizados:**
- Todos os dados fiscais básicos
- Dados do remetente e destinatário
- Valores e quantidades

### B. API de Rastreamento
**Arquivo:** `server/rastreamento-routes.ts`
**Campos Calculados:**
- Status atual baseado em datas
- Localização atual
- Histórico de eventos
- KM faltantes (simulado)

### C. Gestão de Ordens de Carga
**Arquivo:** `server/ordens-carga-routes.ts`
**Campos Atualizados:**
- Datas operacionais
- Status da ordem
- Prioridade
- Dados da operação

### D. Cadastro de Volumes
**Arquivo:** `client/src/components/comum/VolumeModal.tsx`
**Campos Atualizados:**
- Dimensões físicas
- Códigos de etiqueta
- Volume calculado

## 8. FLUXO DE SINCRONIZAÇÃO

```
1. XML NFe → Dados Fiscais (notas_fiscais)
       ↓
2. Ordem Carga → Status/Datas (ordens_carga)
       ↓
3. Volumes → Dimensões (volumes_etiqueta)
       ↓
4. API Rastreamento → Campos Calculados + Histórico
       ↓
5. Frontend → Exibição Final
```

## 9. CAMPOS POR ORIGEM

### Tabela `notas_fiscais` (11 campos)
- Dados fiscais, remetente, destinatário, valores

### Tabela `ordens_carga` (12 campos)
- Datas operacionais, status, prioridade, números

### Tabela `volumes_etiqueta` (5 campos)
- Dimensões físicas e códigos

### Campos Calculados (8 campos)
- Status automático, localização, KM, histórico

### Campos Padrão (4 campos)
- Valores fixos para compatibilidade

### Campos Não Implementados (3 campos)
- Funcionalidades futuras

**Total:** 43 campos mapeados na interface de rastreamento

---

**Atualizado:** 11/08/2025  
**Versão:** 1.0