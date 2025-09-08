# FUNCIONALIDADE: PREENCHIMENTO AUTOMÁTICO DE DATAS

## 1. OBJETIVO

Facilitar o preenchimento de ordens de carga preenchendo automaticamente as datas mais importantes baseadas no tipo de movimentação, apenas quando não há informação prévia.

## 2. LÓGICA IMPLEMENTADA

### Tipo ENTRADA
- **Quando**: `tipo_movimentacao === 'Entrada'` E `data_entrada_armazem` está vazia
- **Ação**: Preenche `data_entrada_armazem = data/hora atual`
- **Justificativa**: Facilita marcação de mercadoria que chega no armazém

### Tipo SAÍDA  
- **Quando**: `tipo_movimentacao === 'Saida'` E `data_carregamento` está vazia
- **Ação**: Preenche `data_carregamento = data/hora atual`
- **Justificativa**: Facilita marcação de mercadoria carregada para envio

### Condições Importantes
- ✅ **SÓ funciona se a data estiver VAZIA** (não sobrescreve dados existentes)
- ✅ **Aplica apenas na CRIAÇÃO** de novas ordens
- ✅ **Mantém dados manuais** quando já preenchidos pelo usuário

## 3. IMPLEMENTAÇÃO TÉCNICA

### Backend (ordens-carga-routes.ts)
```javascript
// Linhas 674-686
const currentDateTime = new Date();
const tipoMovimentacao = req.body.tipo_movimentacao;

let autoFilledData = {};
if (tipoMovimentacao === 'Entrada' && !req.body.data_entrada_armazem) {
  autoFilledData.data_entrada_armazem = currentDateTime;
  console.log('Auto-filled data_entrada_armazem for Entrada operation');
} else if (tipoMovimentacao === 'Saida' && !req.body.data_carregamento) {
  autoFilledData.data_carregamento = currentDateTime;
  console.log('Auto-filled data_carregamento for Saida operation');
}
```

### Integração com Processamento de Dados
```javascript
// Linhas 703-704
data_entrada_armazem: autoFilledData.data_entrada_armazem || (req.body.data_entrada_armazem ? new Date(req.body.data_entrada_armazem) : undefined),
data_carregamento: autoFilledData.data_carregamento || (req.body.data_carregamento ? new Date(req.body.data_carregamento) : undefined),
```

## 4. IMPACTO NO RASTREAMENTO NFE

### Antes da Funcionalidade
- Usuário precisa preencher manualmente todas as datas
- Datas vazias = rastreamento incompleto
- Mais passos no processo de criação

### Depois da Funcionalidade
- ✅ **ENTRADA**: `data_entrada_armazem` preenchida automaticamente → Estágio "Armazenado"
- ✅ **SAÍDA**: `data_carregamento` preenchida automaticamente → Estágio "Carregado"  
- ✅ **NFE Tracking**: Datas alimentadas automaticamente na tabela `notas_fiscais`
- ✅ **UX Melhorado**: Menos campos obrigatórios para o usuário

## 5. CASOS DE USO

### Cenário 1: Nova Ordem de Entrada (Recebimento)
```
1. Usuário seleciona: Entrada + Recebimento
2. Preenche NFes e dados básicos  
3. Sistema preenche data_entrada_armazem = agora
4. Ordem criada com estágio "Armazenado" automático
```

### Cenário 2: Nova Ordem de Saída (Expedição)
```
1. Usuário seleciona: Saída + Armazém
2. Preenche NFes e dados básicos
3. Sistema preenche data_carregamento = agora  
4. Ordem criada com estágio "Carregado" automático
```

### Cenário 3: Dados Já Preenchidos (Não Interfere)
```
1. Usuário preenche manualmente data_entrada_armazem
2. Sistema detecta campo já preenchido
3. Mantém data informada pelo usuário
4. Não aplica preenchimento automático
```

## 6. LOGS E DEBUGGING

### Mensagens de Console
```javascript
// Para identificar quando o auto-fill foi aplicado
'ordens-carga-routes: Auto-filled data_entrada_armazem for Entrada operation'
'ordens-carga-routes: Auto-filled data_carregamento for Saida operation'
```

### Teste SQL
```sql
SELECT numero_ordem, tipo_movimentacao, data_entrada_armazem, data_carregamento, created_at
FROM ordens_carga 
ORDER BY created_at DESC;
```

## 7. BENEFÍCIOS

1. **UX Simplificado**: Menos campos obrigatórios
2. **Rastreamento Automático**: NFes recebem datas imediatamente  
3. **Consistência**: Padrão automático para operações comuns
4. **Flexibilidade**: Permite override manual quando necessário
5. **Eficiência**: Reduz tempo de criação de ordens

## 8. MANUTENÇÃO FUTURA

- Monitorar logs para verificar taxa de uso da funcionalidade
- Considerar expansion para outros campos automáticos
- Avaliar feedback de usuários sobre a utilidade
- Possível customização por empresa/usuário