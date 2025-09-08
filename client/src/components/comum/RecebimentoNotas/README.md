# RecebimentoNotasManager - Componente Reutilizável

O `RecebimentoNotasManager` é um componente reutilizável para gerenciamento de recebimento de notas fiscais com funcionalidade de cubagem integrada.

## Características Principais

- **Configuração flexível** através de props
- **Integração com CubagemManager** para cálculo de volumes
- **Ações customizáveis** para diferentes módulos
- **Interface responsiva** com visualização de totais
- **Suporte a batch processing** para múltiplas notas

## Como Usar

### Importação Básica

```tsx
import RecebimentoNotasManager, { RecebimentoConfig } from '@/components/comum/RecebimentoNotas/RecebimentoNotasManager';
import { NotaVolumeData } from '@/components/comum/CubagemManager';
```

### Exemplo Básico

```tsx
const MinhaTelaRecebimento = () => {
  const config: RecebimentoConfig = {
    title: "Recebimento de Notas",
    description: "Gerencie notas fiscais com cubagem",
    showCadastro: true,
    showConsulta: true,
    showVolumeExtract: true,
    customActions: [
      {
        label: "Processar Lote",
        icon: Package,
        onClick: (batchData: NotaVolumeData[]) => {
          console.log("Processando:", batchData);
        }
      }
    ]
  };

  return (
    <RecebimentoNotasManager
      config={config}
      initialData={minhasNotas}
      onVolumeDataUpdate={(data) => console.log("Volume atualizado:", data)}
    />
  );
};
```

### Configurações Disponíveis

#### RecebimentoConfig

```tsx
interface RecebimentoConfig {
  showCadastro?: boolean;        // Mostrar aba de cadastro
  showConsulta?: boolean;        // Mostrar aba de consulta
  showVolumeExtract?: boolean;   // Mostrar extrato de volumes
  showPrintOptions?: boolean;    // Mostrar opções de impressão
  allowBatchProcessing?: boolean; // Permitir processamento em lote
  customActions?: Array<{        // Ações customizadas
    label: string;
    icon?: React.ComponentType<any>;
    onClick: (batchVolumeData: NotaVolumeData[]) => void;
    variant?: 'default' | 'outline' | 'destructive';
  }>;
  title?: string;               // Título da tela
  description?: string;         // Descrição da tela
}
```

#### ProcessedNotaFiscal

```tsx
interface ProcessedNotaFiscal {
  id: string;
  numero: string;
  chaveNF: string;
  valor_nota_fiscal: string;
  peso_bruto: number;
  quantidade_volumes: number;
  emitente_razao_social: string;
  emitente_cnpj: string;
  // ... outros campos de emitente e destinatário
}
```

### Exemplos de Uso por Módulo

#### Armazenagem

```tsx
const armazenagemConfig: RecebimentoConfig = {
  title: "Entrada de Notas Fiscais - Armazenagem",
  customActions: [
    {
      label: "Gerar Ordem de Carregamento",
      icon: FileText,
      onClick: (batchData) => {
        // Redirecionar para marketplace
        sessionStorage.setItem('coletaData', JSON.stringify(batchData));
        setLocation('/marketplace/nova-ordem');
      }
    },
    {
      label: "Gerar OR",
      icon: Package,
      onClick: (batchData) => {
        // Processar ordem de recebimento
      }
    }
  ]
};
```

#### Expedição

```tsx
const expedicaoConfig: RecebimentoConfig = {
  title: "Preparação para Expedição",
  showCadastro: false,
  customActions: [
    {
      label: "Gerar Romaneio",
      icon: FileText,
      onClick: (batchData) => {
        // Gerar romaneio de expedição
      }
    }
  ]
};
```

#### Marketplace

```tsx
const marketplaceConfig: RecebimentoConfig = {
  title: "Solicitação de Coleta",
  showVolumeExtract: true,
  customActions: [
    {
      label: "Criar Solicitação",
      icon: Truck,
      onClick: (batchData) => {
        // Criar solicitação de coleta
      }
    }
  ]
};
```

### Componentes Customizados

Você pode passar componentes customizados como children:

```tsx
<RecebimentoNotasManager config={config}>
  <MeuComponenteCadastroCustomizado />
</RecebimentoNotasManager>
```

### Callbacks Disponíveis

```tsx
<RecebimentoNotasManager
  config={config}
  onVolumeDataUpdate={(volumeData) => {
    // Chamado quando dados de volume são atualizados
  }}
  onNotaProcessed={(nota) => {
    // Chamado quando uma nota é processada
  }}
  onBatchAction={(action, data) => {
    // Chamado quando uma ação em lote é executada
  }}
/>
```

## Integração com Outros Sistemas

### Marketplace de Cargas

```tsx
const prepararParaMarketplace = (batchData: NotaVolumeData[]) => {
  const coletaData = {
    nfes: batchData.map(nota => ({
      id: nota.notaId,
      numero: nota.numeroNota,
      peso: nota.pesoTotal,
      volume: nota.totalM3,
      // Mapear outros campos necessários
    })),
    totais: {
      quantidade: batchData.length,
      volumes: batchData.reduce((sum, nota) => sum + nota.volumes.length, 0),
      peso: batchData.reduce((sum, nota) => sum + nota.pesoTotal, 0),
      volume: batchData.reduce((sum, nota) => sum + nota.totalM3, 0)
    },
    origem: 'modulo-origem'
  };
  
  sessionStorage.setItem('coletaData', JSON.stringify(coletaData));
  // Redirecionar para marketplace
};
```

### Exportação de Dados

```tsx
const exportarDados = (batchData: NotaVolumeData[]) => {
  const exportData = batchData.map(nota => ({
    nota_fiscal: nota.numeroNota,
    total_volumes: nota.volumes.length,
    total_m3: nota.totalM3,
    peso_total: nota.pesoTotal,
    volumes_detalhados: nota.volumes
  }));

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const link = document.createElement('a');
  link.setAttribute('href', dataUri);
  link.setAttribute('download', `cubagem_${new Date().toISOString().split('T')[0]}.json`);
  link.click();
};
```

## Rota de Demonstração

Acesse `/armazenagem/recebimento/notas-reutilizavel` para ver o componente em funcionamento com dados de exemplo.

## Estrutura de Arquivos

```
client/src/components/comum/RecebimentoNotas/
├── RecebimentoNotasManager.tsx  # Componente principal
├── ExemploUso.tsx              # Exemplos de uso
├── index.ts                    # Exportações
└── README.md                   # Esta documentação
```