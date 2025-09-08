# Tabelas e Informações Armazenadas ao Incluir uma Ordem de Carga

## 1. TABELA PRINCIPAL: `ordens_carga`

### Campos de Identificação (4 campos)
| Campo | Tipo | Descrição | Fonte |
|-------|------|-----------|-------|
| `id` | uuid | ID único da ordem | Gerado automaticamente |
| `numero_ordem` | text | Número sequencial único | Gerado automaticamente (ORD-DDMMAAHHMMSS) |
| `tipo_carregamento` | text | coleta, expedicao | Seleção do usuário |
| `status` | text | criada, aguardando_carregamento, carregando, em_transito, entregue | Padrão: "criada" |

### Classificação da Operação (4 campos)
| Campo | Tipo | Descrição | Fonte |
|-------|------|-----------|-------|
| `tipo_movimentacao` | text | Entrada, Saída | Seleção do usuário |
| `subtipo_operacao` | text | Recebimento, Coleta, Expedição, etc. | Seleção do usuário |
| `prioridade` | text | Normal, Alta, Urgente | Padrão: "Normal" |
| `empresa_cliente_id` | uuid | Referência da empresa cliente | Seleção do usuário |

### Dados do Remetente (10 campos)
| Campo | Tipo | Descrição | Fonte |
|-------|------|-----------|-------|
| `remetente_razao_social` | text | Razão social do remetente | Digitado ou autocompletado |
| `remetente_cnpj` | text | CNPJ do remetente | Digitado ou autocompletado |
| `remetente_telefone` | text | Telefone do remetente | Digitado |
| `remetente_endereco` | text | Logradouro do remetente | Digitado ou autocompletado |
| `remetente_numero` | text | Número do endereço | Digitado |
| `remetente_complemento` | text | Complemento do endereço | Digitado |
| `remetente_bairro` | text | Bairro do remetente | Digitado |
| `remetente_cidade` | text | Cidade do remetente | Digitado |
| `remetente_uf` | text | UF do remetente | Digitado |
| `remetente_cep` | text | CEP do remetente | Digitado |

### Dados do Destinatário (10 campos)
| Campo | Tipo | Descrição | Fonte |
|-------|------|-----------|-------|
| `destinatario_razao_social` | text | Razão social do destinatário | Digitado ou autocompletado |
| `destinatario_cnpj` | text | CNPJ do destinatário | Digitado ou autocompletado |
| `destinatario_telefone` | text | Telefone do destinatário | Digitado |
| `destinatario_endereco` | text | Logradouro do destinatário | Digitado ou autocompletado |
| `destinatario_numero` | text | Número do endereço | Digitado |
| `destinatario_complemento` | text | Complemento do endereço | Digitado |
| `destinatario_bairro` | text | Bairro do destinatário | Digitado |
| `destinatario_cidade` | text | Cidade do destinatário | Digitado |
| `destinatario_uf` | text | UF do destinatário | Digitado |
| `destinatario_cep` | text | CEP do destinatário | Digitado |

### Datas Operacionais (16 campos)
| Campo | Tipo | Descrição | Fonte |
|-------|------|-----------|-------|
| `data_operacao` | timestamp | Data da operação | Padrão: agora |
| `data_programada` | timestamp | Data programada | Seleção do usuário |
| `data_carregamento` | timestamp | Data do carregamento | Atualização posterior |
| `data_saida` | timestamp | Data da saída | Atualização posterior |
| `data_entrada_galpao` | timestamp | Data entrada no galpão | Atualização posterior |
| `data_entrega_prevista` | timestamp | Data prevista de entrega | Seleção do usuário |
| `data_entrega_realizada` | timestamp | Data real de entrega | Atualização posterior |
| `data_prevista_coleta` | timestamp | Data prevista da coleta | Seleção do usuário |
| `data_coleta` | timestamp | Data real da coleta | Atualização posterior |
| `data_prevista_entrada_armazem` | timestamp | Data prevista entrada armazém | Seleção do usuário |
| `data_entrada_armazem` | timestamp | Data real entrada armazém | Atualização posterior |
| `data_prevista_entrega` | timestamp | Data prevista entrega | Seleção do usuário |
| `data_chegada_filial_entrega` | timestamp | Data chegada filial entrega | Atualização posterior |
| `data_saida_entrega` | timestamp | Data saída para entrega | Atualização posterior |
| `data_chegada_na_entrega` | timestamp | Data chegada na entrega | Atualização posterior |
| `data_entrega` | timestamp | Data da entrega | Atualização posterior |

### Recursos e Totais (8 campos)
| Campo | Tipo | Descrição | Fonte |
|-------|------|-----------|-------|
| `motorista_id` | uuid | Referência do motorista | Seleção do usuário |
| `veiculo_id` | uuid | Referência do veículo | Seleção do usuário |
| `peso_total` | decimal | Peso total da carga | Calculado das NFes |
| `volume_total` | integer | Volume total | Calculado das NFes |
| `valor_total_frete` | decimal | Valor total do frete | Calculado |
| `layout_carga` | json | Layout do carregamento | Sistema |
| `checklist_carregamento` | json | Checklist do carregamento | Sistema |
| `fotos_carregamento` | text[] | URLs das fotos | Upload posterior |

### Controle e Auditoria (6 campos)
| Campo | Tipo | Descrição | Fonte |
|-------|------|-----------|-------|
| `observacoes` | text | Observações gerais | Digitado pelo usuário |
| `usuario_responsavel_id` | uuid | Usuário responsável | Usuário logado |
| `endereco_destino` | text | Endereço de destino | Digitado |
| `cidade_destino` | text | Cidade de destino | Digitado |
| `cep_destino` | text | CEP de destino | Digitado |
| `created_at` | timestamp | Data de criação | Automático |
| `updated_at` | timestamp | Data de atualização | Automático |

**Total de campos na tabela `ordens_carga`: 64 campos**

## 2. TABELA DE RELACIONAMENTO: `itens_carga`

### Por Cada NFe Vinculada
| Campo | Tipo | Descrição | Fonte |
|-------|------|-----------|-------|
| `id` | uuid | ID único do item | Gerado automaticamente |
| `ordem_carga_id` | uuid | Referência da ordem | Vinculação automática |
| `nota_fiscal_id` | uuid | Referência da NFe | Seleção/processamento |
| `peso_item` | decimal | Peso do item | Extraído da NFe |
| `volume_item` | integer | Volume do item | Extraído da NFe |
| `valor_frete_item` | decimal | Valor frete do item | Calculado |
| `status_conferencia` | text | Status da conferência | Padrão: "pendente" |
| `data_conferencia` | timestamp | Data da conferência | Posterior |
| `usuario_conferencia_id` | uuid | Usuário que conferiu | Posterior |
| `metodo_conferencia` | text | Método usado | Posterior |
| `observacoes_conferencia` | text | Observações | Posterior |
| `created_at` | timestamp | Data de criação | Automático |
| `updated_at` | timestamp | Data de atualização | Automático |

**13 campos por NFe vinculada**

## 3. TABELA DE NOTAS FISCAIS: `notas_fiscais` (Quando NFe é processada)

### Se NFe for processada junto com a ordem:
**67 campos são preenchidos**, incluindo:
- Chave de acesso e dados fiscais
- Dados completos do emitente e destinatário  
- Valores financeiros e físicos
- Datas e status
- Conteúdo XML
- Referências logísticas

## 4. TABELA DE VOLUMES: `volumes_etiqueta`

### Por Cada Volume das NFes
| Campo | Tipo | Descrição | Fonte |
|-------|------|-----------|-------|
| `id` | uuid | ID único do volume | Gerado automaticamente |
| `codigo_etiqueta` | text | Código único | Gerado: {nf}-VOL-{seq} |
| `nota_fiscal_id` | uuid | Referência da NFe | Vinculação |
| `empresa_id` | uuid | Referência da empresa | Contexto |
| `altura_cm` | decimal | Altura em cm | Padrão: 30 |
| `largura_cm` | decimal | Largura em cm | Padrão: 40 |
| `comprimento_cm` | decimal | Comprimento em cm | Padrão: 50 |
| `peso_kg` | decimal | Peso do volume | Calculado |
| `volume_m3` | decimal | Volume em m³ | Calculado: 0.06 |
| `status` | text | Status do volume | Padrão: "recebido" |
| `created_at` | timestamp | Data de criação | Automático |
| `updated_at` | timestamp | Data de atualização | Automático |

**12 campos por volume**

## 5. RESUMO EXECUTIVO

### Ao Incluir uma Ordem de Carga:

#### **Tabelas Afetadas: 4**
1. `ordens_carga` (principal)
2. `itens_carga` (relacionamento)
3. `notas_fiscais` (se NFes processadas)
4. `volumes_etiqueta` (volumes das NFes)

#### **Total de Campos Armazenados:**
- **Ordem Principal:** 64 campos
- **Por NFe vinculada:** 13 campos em `itens_carga` + 67 campos em `notas_fiscais`
- **Por Volume:** 12 campos em `volumes_etiqueta`

#### **Exemplo Prático:**
Uma ordem com **3 NFes** e **10 volumes totais** armazena:
- 64 campos da ordem
- 39 campos por NFe (3 × 13 = 39 em itens_carga)
- 201 campos das NFes (3 × 67 = 201 em notas_fiscais)
- 120 campos dos volumes (10 × 12 = 120 em volumes_etiqueta)

**Total: 424 campos armazenados no banco de dados**

#### **Informações Principais Capturadas:**
- ✓ Identificação e classificação da operação
- ✓ Dados completos de remetente e destinatário
- ✓ 16 datas para controle temporal completo
- ✓ Recursos alocados (motorista, veículo)
- ✓ Totais calculados (peso, volume, valor)
- ✓ Vinculação com NFes e volumes
- ✓ Controle de conferência e auditoria
- ✓ Dimensões físicas individuais por volume

**Observação:** Todos os campos são populados automaticamente ou através de entrada do usuário na interface, garantindo rastreabilidade completa da operação logística.

---
**Gerado:** 11/08/2025  
**Versão:** 1.0