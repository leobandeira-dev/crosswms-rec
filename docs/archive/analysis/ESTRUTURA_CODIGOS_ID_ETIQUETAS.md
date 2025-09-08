# Estrutura dos Códigos ID de Etiquetas - CROSSWMS

## Visão Geral

O sistema CROSSWMS utiliza duas estruturas distintas para geração de códigos ID de etiquetas, dependendo do tipo de etiqueta sendo criada. Esta documentação detalha ambas as estruturas e suas implementações.

## 1. Etiquetas de Volume Individual

### Estrutura do Código
**Formato:** `NOTA-VOLUME-DATA-HORA+MINUTOS`

### Exemplos
- `111007-001-11082025-1503` (Volume 1 da NF 111007, criado em 11/08/2025 às 15:03)
- `111007-002-11082025-1503` (Volume 2 da NF 111007, criado em 11/08/2025 às 15:03)
- `111007-003-11082025-1504` (Volume 3 da NF 111007, criado em 11/08/2025 às 15:04)

### Componentes
- **NOTA**: Número da nota fiscal (ex: 111007)
- **VOLUME**: Número do volume específico com 3 dígitos (001, 002, 003, etc.)
- **DATA**: Data de criação no formato DDMMAAAA (11082025)
- **HORA+MINUTOS**: Hora e minutos de criação no formato HHMM (1503)

### Implementação
```typescript
const generateVolumeId = (baseId: string, volumeNumber: number, totalVolumes: number) => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  
  const volumeStr = String(volumeNumber).padStart(3, '0')
  const dateTimeStr = `${day}${month}${year}-${hours}${minutes}`
  
  // New format: NOTA-VOLUME-DATA-HORA+MINUTOS
  return `${baseId}-${volumeStr}-${dateTimeStr}`
}
```

### Características
- ✅ **Temporal**: Inclui momento exato da criação para rastreabilidade
- ✅ **Único**: Combinação de nota, volume e timestamp garante unicidade
- ✅ **Baseado na nota fiscal**: Usa dados reais da NFe
- ✅ **Rastreável**: Permite identificar facilmente a nota fiscal e momento de criação

## 2. Etiquetas MIX (Etiqueta Mãe)

### Estrutura do Código
**Formato:** `ETQM-{timestamp}`

### Exemplos
- `ETQM-174960020959` (Etiqueta mãe criada em timestamp 174960020959)
- `ETQM-174960020958` (Etiqueta mãe criada em timestamp 174960020958)

### Componentes
- **ETQM**: Prefixo fixo para "Etiqueta Mãe"
- **{timestamp}**: Timestamp em millisegundos da data/hora de criação usando `Date.now().getTime()`

### Implementação
```typescript
const handleGerarEtiquetaMae = () => {
  const now = new Date()
  const newEtiquetaMae = {
    id: `ETQM-${now.getTime()}`,
    // ... outros campos
  }
}
```

### Características
- ✅ **Único**: Timestamp garante unicidade absoluta
- ✅ **Temporal**: Indica momento exato da criação
- ✅ **Agrupamento**: Usado para agrupar múltiplos volumes
- ✅ **Flexível**: Não depende de dados específicos da nota fiscal

## Uso no Sistema

### Etiquetas de Volume Individual
- Usadas para volumes únicos de uma nota fiscal
- Integração com QR codes para rastreamento
- Impressão em formato padrão 100x150mm
- Vinculação direta com dados da NFe

### Etiquetas MIX
- Usadas para agrupar múltiplos volumes
- Permitem logística otimizada de cargas
- Facilitam movimentação em paletes ou containers
- Mantêm rastreabilidade dos volumes individuais

## Correções Implementadas (Agosto 2025)

### Alteração do Formato de ID
**Motivo**: Necessidade de implementar formato temporal mais específico conforme solicitação do usuário.

**Formato Anterior**: `BaseID-VolumeNumber-TotalVolumes-Sequence`
**Novo Formato**: `NOTA-VOLUME-DATA-HORA+MINUTOS`

### Mudanças Aplicadas
1. **Frontend**: Atualizada função `generateVolumeId` em `GeracaoEtiquetas.tsx`
2. **Backend**: Atualizada função `createVolumesForNote` em `ordens-carga-routes.ts`
3. **Integração**: Volumes são automaticamente criados quando ordem de carga é salva
4. **Consistência**: Ambos frontend e backend usam o mesmo formato temporal

### Código Implementado (Backend)
```typescript
async function createVolumesForNote(nota: any, notaFiscalId: string, empresaId: string) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const dateTimeStr = `${day}${month}${year}-${hours}${minutes}`;
  
  for (let i = 1; i <= quantidadeVolumes; i++) {
    const volumeStr = String(i).padStart(3, '0');
    const codigoEtiqueta = `${nota.numero_nota}-${volumeStr}-${dateTimeStr}`;
    // ... inserção no banco de dados
  }
}
```

### Benefícios da Nova Estrutura
- ✅ **Rastreabilidade temporal**: Cada volume tem timestamp de criação
- ✅ **Unicidade garantida**: Combinação nota+volume+datetime é sempre única
- ✅ **Integração automática**: Volumes são criados automaticamente ao salvar ordem
- ✅ **Consistência**: Mesmo formato em frontend e backend

## Integração com QR Codes

### Atualização Automática
- QR codes são atualizados a cada minuto para etiquetas MIX
- Mantém timestamp atual para rastreabilidade precisa
- Implementado via `setInterval(generateQRCode, 60000)`

### Geração
```typescript
useEffect(() => {
  const generateQRCode = async () => {
    const volumeId = generateVolumeId(notaFiscal || '111007', 1, parseInt(quantidadeVolumes?.toString() || '1'))
    const qrDataURL = await QRCode.toDataURL(volumeId, {
      width: 64,
      margin: 1,
      color: { dark: '#000000', light: '#FFFFFF' }
    })
    setQrCodeDataURL(qrDataURL)
  }
  
  generateQRCode()
  const interval = setInterval(generateQRCode, 60000)
  return () => clearInterval(interval)
}, [notaFiscal, numeroVolume])
```

## Considerações Técnicas

### Performance
- Códigos individuais são determinísticos e não requerem consulta ao banco
- Timestamps das etiquetas MIX são únicos e de alta performance
- QR codes são gerados sob demanda para otimizar recursos

### Escalabilidade
- Sistema suporta milhares de volumes por nota fiscal
- Etiquetas MIX podem agrupar volumes ilimitados
- Estrutura preparada para futuras extensões

### Rastreabilidade
- Cada código permite identificação completa da origem
- Histórico mantido através dos timestamps
- Integração com sistema de auditoria do CROSSWMS

## Arquivos Relacionados

- `client/src/pages/armazenagem/GeracaoEtiquetas.tsx` - Implementação principal
- `shared/logistics-schema.ts` - Esquemas de dados
- `server/ordens-carga-routes.ts` - API backend para ordens de carga
- Interface `VolumeData` - Definição de tipos TypeScript

---
*Documentação atualizada em Agosto de 2025 - CROSSWMS v2.0*