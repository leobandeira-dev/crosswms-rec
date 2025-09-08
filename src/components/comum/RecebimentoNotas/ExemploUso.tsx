import React from 'react';
import { useLocation } from 'wouter';
import { FileText, Package, Truck } from 'lucide-react';
import RecebimentoNotasManager, { RecebimentoConfig, ProcessedNotaFiscal } from './RecebimentoNotasManager';
import { NotaVolumeData } from '../CubagemManager';

// Exemplo 1: Configuração básica para módulo de armazenagem
const ArmazenagemExample: React.FC = () => {
  const [, setLocation] = useLocation();

  const armazenagemConfig: RecebimentoConfig = {
    title: "Entrada de Notas Fiscais - Armazenagem",
    description: "Registre e processe notas fiscais de entrada com cubagem",
    showCadastro: true,
    showConsulta: true,
    showVolumeExtract: true,
    allowBatchProcessing: true,
    customActions: [
      {
        label: "Gerar Ordem de Carregamento",
        icon: FileText,
        onClick: (batchData: NotaVolumeData[]) => {
          // Preparar dados para marketplace
          const coletaData = {
            nfes: batchData.map(nota => ({
              id: nota.notaId,
              numero: nota.numeroNota,
              peso: nota.pesoTotal,
              volume: nota.totalM3,
              // Mapear outros dados conforme necessário
            })),
            origem: 'armazenagem'
          };
          
          sessionStorage.setItem('coletaData', JSON.stringify(coletaData));
          setLocation('/marketplace/nova-ordem');
        },
        variant: 'default'
      },
      {
        label: "Gerar OR",
        icon: Package,
        onClick: (batchData: NotaVolumeData[]) => {
          console.log("Gerando OR para:", batchData);
          // Implementar lógica de geração de OR
        },
        variant: 'outline'
      }
    ]
  };

  // Dados mockados para demonstração
  const sampleData: ProcessedNotaFiscal[] = [
    {
      id: "1",
      numero: "123456",
      chaveNF: "35250513516247000107550010000113401146202508",
      valor_nota_fiscal: "2500.50",
      peso_bruto: 15.5,
      quantidade_volumes: 2,
      emitente_razao_social: "EMPRESA EMITENTE LTDA",
      emitente_cnpj: "12.345.678/0001-90",
      emitente_cidade: "São Paulo",
      emitente_uf: "SP",
      emitente_endereco: "Rua das Empresas, 123",
      emitente_bairro: "Centro",
      emitente_cep: "01001-000",
      emitente_telefone: "(11) 1234-5678",
      destinatario_razao_social: "CLIENTE DESTINATARIO SA",
      destinatario_cnpj: "98.765.432/0001-10",
      destinatario_cidade: "Rio de Janeiro",
      destinatario_uf: "RJ",
      destinatario_endereco: "Av. dos Clientes, 456",
      destinatario_bairro: "Copacabana",
      destinatario_cep: "22000-000",
      destinatario_telefone: "(21) 9876-5432"
    }
  ];

  return (
    <RecebimentoNotasManager
      config={armazenagemConfig}
      initialData={sampleData}
      onVolumeDataUpdate={(volumeData) => {
        console.log("Dados de volume atualizados:", volumeData);
      }}
      onBatchAction={(action, data) => {
        console.log(`Ação ${action} executada com:`, data);
      }}
    />
  );
};

// Exemplo 2: Configuração simplificada para outros módulos
const SimplifiedExample: React.FC = () => {
  const simplifiedConfig: RecebimentoConfig = {
    title: "Consulta de Notas",
    description: "Visualize e gerencie cubagem das notas fiscais",
    showCadastro: false,
    showConsulta: true,
    showVolumeExtract: true,
    allowBatchProcessing: true,
    customActions: [
      {
        label: "Exportar Dados",
        icon: FileText,
        onClick: (batchData: NotaVolumeData[]) => {
          console.log("Exportando:", batchData);
          // Implementar lógica de exportação
        }
      }
    ]
  };

  return (
    <RecebimentoNotasManager
      config={simplifiedConfig}
      initialData={[]}
    />
  );
};

// Exemplo 3: Integração com componentes customizados
const CustomContentExample: React.FC = () => {
  const customConfig: RecebimentoConfig = {
    title: "Recebimento Customizado",
    showCadastro: true,
    showConsulta: false,
    showVolumeExtract: true,
    customActions: [
      {
        label: "Processar Lote",
        icon: Truck,
        onClick: (batchData: NotaVolumeData[]) => {
          console.log("Processando lote customizado:", batchData);
        }
      }
    ]
  };

  return (
    <RecebimentoNotasManager config={customConfig}>
      {/* Conteúdo customizado para a aba de cadastro */}
      <div className="p-6 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Cadastro Customizado</h3>
        <p className="text-gray-600">
          Aqui você pode integrar qualquer componente de cadastro existente.
        </p>
        {/* Seus componentes customizados aqui */}
      </div>
    </RecebimentoNotasManager>
  );
};

export { ArmazenagemExample, SimplifiedExample, CustomContentExample };
export default ArmazenagemExample;