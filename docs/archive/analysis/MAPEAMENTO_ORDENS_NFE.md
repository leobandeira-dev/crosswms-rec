# Estratégia Completa: Alimentação Automática de Dados entre Ordens de Carga e Rastreamento NFe

## 1. ARQUITETURA DO SISTEMA

### Fluxo de Dados Principal
```
ORDEM DE CARGA → ITEM CARGA → NOTA FISCAL → RASTREAMENTO
     ↓              ↓            ↓             ↓
  Estágios      Vinculação    Dados NFe    Status Final
```

### Tabelas Envolvidas
- `ordens_carga`: Dados principais da operação
- `itens_carga`: Vinculação ordem ↔ NFe
- `notas_fiscais`: Dados fiscais e comerciais
- `volumes_etiqueta`: Dimensões e volumes

## 2. MAPEAMENTO DE CAMPOS AUTOMÁTICO

### A. Estágios (Baseados em Datas da Ordem)
**Lógica de Progressão Temporal:**

```sql
CASE 
  WHEN oc.data_entrega_realizada IS NOT NULL THEN 'entregue'
  WHEN oc.data_saida IS NOT NULL THEN 'em_transito'
  WHEN oc.data_carregamento IS NOT NULL THEN 'carregado'
  WHEN oc.data_entrada_armazem IS NOT NULL THEN 'armazenado'
  WHEN oc.data_coleta IS NOT NULL THEN 'coletado'
  ELSE 'pendente_coleta'
END as statusAtual
```

**Mapeamento Completo:**
- `data_prevista_coleta` → **Pendente Coleta**
- `data_coleta` → **Coletado**
- `data_entrada_armazem` → **Armazenado**
- `data_carregamento` → **Carregado**
- `data_saida` → **Em Trânsito**
- `data_entrega_prevista` → **Filial Destino**
- `data_entrega_realizada` → **Entregue**

### B. Status da Nota (Independente do Estágio)
**Status Operacionais:**
- `disponivel`: Padrão para novas notas
- `bloqueada`: Impedimento documentação/pagamento
- `avariada`: Dano na mercadoria
- `extraviado`: Perda identificada

### C. Prioridade (Herdada da Ordem)
**Mapeamento Direto:**
```sql
oc.prioridade → nf.prioridade_rastreamento
```
- `baixa` / `normal` → `normal`
- `alta` → `prioridade`
- `urgente` → `expressa`

## 3. LOCALIZAÇÃO AUTOMÁTICA

### Lógica de Localização Atual
```sql
CASE
  WHEN oc.data_entrega_realizada IS NOT NULL THEN 'Entregue'
  WHEN oc.data_saida IS NOT NULL THEN 'Em trânsito'
  WHEN oc.data_carregamento IS NOT NULL THEN 'Carregado para entrega'
  WHEN oc.data_entrada_armazem IS NOT NULL THEN 'Armazenado'
  WHEN oc.data_coleta IS NOT NULL THEN 'Coletado'
  ELSE 'Aguardando processamento'
END as localizacaoAtual
```

## 4. CÁLCULOS AUTOMÁTICOS

### A. Dias de Armazenagem
```sql
CASE 
  WHEN oc.data_entrada_armazem IS NOT NULL 
  THEN EXTRACT(DAY FROM (CURRENT_DATE - oc.data_entrada_armazem::date))
  ELSE 0
END as diasArmazenagem
```

### B. KM Faltantes (Simulado)
```sql
-- Baseado em cidade origem/destino
CASE 
  WHEN nf.destinatario_uf != nf.emitente_uf THEN 
    (RANDOM() * 1000 + 200)::INTEGER
  ELSE 
    (RANDOM() * 200 + 50)::INTEGER
END as kmFaltantes
```

### C. Progresso da Jornada
```javascript
const calcularProgresso = (statusAtual) => {
  const etapas = [
    'pendente_coleta', 'coletado', 'armazenado', 
    'carregado', 'em_transito', 'filial_destino', 
    'rota_entrega', 'aguardando_descarga', 'entregue'
  ];
  const indice = etapas.indexOf(statusAtual);
  return ((indice + 1) / etapas.length) * 100;
};
```

## 5. HISTÓRICO DE EVENTOS AUTOMÁTICO

### Geração de Timeline
```javascript
const gerarHistorico = (ordem) => {
  const eventos = [];
  
  // Evento de criação
  eventos.push({
    id: '1',
    dataHora: ordem.created_at,
    status: 'recebido',
    local: `${ordem.remetente_cidade} - ${ordem.remetente_uf}`,
    responsavel: 'Sistema',
    observacoes: 'Ordem criada no sistema'
  });
  
  // Eventos baseados em datas
  if (ordem.data_coleta) {
    eventos.push({
      dataHora: ordem.data_coleta,
      status: 'coletado',
      local: `${ordem.remetente_cidade} - ${ordem.remetente_uf}`,
      responsavel: ordem.motorista_nome || 'Motorista',
      observacoes: 'Coleta realizada'
    });
  }
  
  // ... outros eventos baseados nas datas
  return eventos.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
};
```

## 6. SINCRONIZAÇÃO EM TEMPO REAL

### A. Atualização via API
```javascript
// Endpoint para atualizar status
PUT /api/ordens-carga/:id/status
{
  "campo": "data_coleta",
  "valor": "2025-08-11T10:30:00Z",
  "observacoes": "Coleta realizada com sucesso"
}
```

### B. Propagação Automática
```sql
-- Trigger para atualizar rastreamento quando ordem muda
CREATE OR REPLACE FUNCTION atualizar_rastreamento_nfe()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar todas as NFes vinculadas à ordem
  UPDATE notas_fiscais nf
  SET 
    status_rastreamento = calcular_status(NEW.*),
    localizacao_atual = calcular_localizacao(NEW.*),
    updated_at = CURRENT_TIMESTAMP
  FROM itens_carga ic
  WHERE ic.ordem_carga_id = NEW.id 
    AND nf.id = ic.nota_fiscal_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## 7. DASHBOARD DE MONITORAMENTO

### Métricas em Tempo Real
- **SLA por Prioridade**: Tempo médio por estágio
- **Performance Operacional**: % cumprimento de prazos
- **Gargalos**: Estágios com maior tempo de permanência
- **Alertas**: Notas em atraso por prioridade

### Filtros Inteligentes
```javascript
const filtrosAvancados = {
  estagio: ['pendente_coleta', 'coletado', 'armazenado', ...],
  status: ['disponivel', 'bloqueada', 'avariada', 'extraviado'],
  prioridade: ['normal', 'prioridade', 'expressa'],
  sla: ['no_prazo', 'atrasado', 'critico'],
  periodo: 'last_7_days'
};
```

## 8. IMPLEMENTAÇÃO TÉCNICA

### A. Backend (Node.js/Express)
```javascript
// Service de sincronização
class RastreamentoService {
  async atualizarStatusPorOrdem(ordemId, novosCampos) {
    // 1. Atualizar ordem de carga
    await this.atualizarOrdem(ordemId, novosCampos);
    
    // 2. Calcular novo status
    const novoStatus = this.calcularStatus(ordem);
    
    // 3. Atualizar NFes vinculadas
    await this.atualizarNFesVinculadas(ordemId, novoStatus);
    
    // 4. Gerar eventos de histórico
    await this.gerarEventosHistorico(ordemId, novosCampos);
    
    // 5. Disparar notificações
    await this.dispararNotificacoes(ordemId, novoStatus);
  }
}
```

### B. Frontend (React)
```javascript
// Hook para rastreamento em tempo real
const useRastreamentoRealTime = (ordemId) => {
  const { data, mutate } = useSWR(
    `/api/rastreamento/ordem/${ordemId}`,
    fetcher,
    { refreshInterval: 30000 } // Atualiza a cada 30s
  );
  
  return { rastreamento: data, atualizarStatus: mutate };
};
```

## 9. REGRAS DE NEGÓCIO CRÍTICAS

### A. Hierarquia de Status
1. **Extraviado** > Todos os outros (bloqueia progressão)
2. **Avariada** > Status normais (requer ação)
3. **Bloqueada** > Disponível (impede movimentação)
4. **Disponível** = Status padrão

### B. Validações Automáticas
- Não permitir regressão de estágios
- Validar sequência temporal de datas
- Alertar sobre inconsistências
- Log de todas as alterações

### C. Notificações Inteligentes
- **Expressa**: Alerta imediato para atrasos > 2h
- **Prioridade**: Notificação para atrasos > 4h
- **Normal**: Relatório diário de pendências

## 10. MONITORAMENTO E LOGS

### Eventos Rastreados
```javascript
const eventosTelemetria = {
  'ordem_criada': { prioridade: 'info', sla: null },
  'status_alterado': { prioridade: 'info', sla: 'tracking' },
  'sla_violado': { prioridade: 'warning', sla: 'alert' },
  'entrega_concluida': { prioridade: 'success', sla: 'complete' }
};
```

Esta estratégia garante rastreamento automático e em tempo real, mantendo consistência entre ordens de carga e status das NFes, com alertas proativos e histórico completo para auditoria.

**Data de criação:** 11/08/2025  
**Última atualização:** 11/08/2025