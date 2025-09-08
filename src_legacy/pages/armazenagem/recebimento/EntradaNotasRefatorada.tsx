import React from 'react';
import { useLocation } from 'wouter';
import MainLayout from '../../../components/layout/MainLayout';
import { FileText, Package, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RecebimentoNotasManager, { RecebimentoConfig } from '@/components/comum/RecebimentoNotas/RecebimentoNotasManager';
import { NotaVolumeData } from '@/components/comum/CubagemManager';
import CadastroNota from './components/CadastroNota';

const EntradaNotasRefatorada: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Configuração específica para o módulo de armazenagem
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
        onClick: (batchVolumeData: NotaVolumeData[]) => {
          // Preparar dados para marketplace
          const nfesForMarketplace = batchVolumeData.map(nota => ({
            id: nota.notaId,
            chaveAcesso: '', // Será preenchido com dados reais
            numero: nota.numeroNota,
            valorDeclarado: 0, // Será calculado com dados reais
            peso: nota.pesoTotal,
            volume: nota.volumes.length,
            m3: nota.totalM3,
            remetente: {
              razaoSocial: '',
              cnpj: '',
              uf: '',
              cidade: ''
            },
            destinatario: {
              razaoSocial: '',
              cnpj: '',
              uf: '',
              cidade: ''
            }
          }));

          const coletaData = {
            nfes: nfesForMarketplace,
            totais: {
              quantidade: batchVolumeData.length,
              volumes: batchVolumeData.reduce((sum, nota) => sum + nota.volumes.length, 0),
              peso: batchVolumeData.reduce((sum, nota) => sum + nota.pesoTotal, 0),
              volume: batchVolumeData.reduce((sum, nota) => sum + nota.totalM3, 0),
              valor: 0 // Será calculado com dados reais
            },
            origem: 'armazenagem',
            criadoEm: new Date().toISOString()
          };

          sessionStorage.setItem('coletaData', JSON.stringify(coletaData));
          
          toast({
            title: "Redirecionando para Solicitação de Coleta",
            description: `${batchVolumeData.length} notas processadas com sucesso`,
          });

          setLocation('/marketplace/nova-ordem');
        },
        variant: 'default'
      },
      {
        label: "Gerar OR",
        icon: Package,
        onClick: (batchVolumeData: NotaVolumeData[]) => {
          toast({
            title: "Ordem de Recebimento Gerada",
            description: `OR criada para ${batchVolumeData.length} notas fiscais`,
          });
          
          console.log("Generating OR document:", batchVolumeData);
        },
        variant: 'outline'
      },
      {
        label: "Exportar Dados",
        icon: Download,
        onClick: (batchVolumeData: NotaVolumeData[]) => {
          // Criar dados para exportação
          const exportData = batchVolumeData.map(nota => ({
            nota_fiscal: nota.numeroNota,
            total_volumes: nota.volumes.length,
            total_m3: nota.totalM3,
            peso_total: nota.pesoTotal,
            volumes_detalhados: nota.volumes.map(vol => ({
              volume: vol.volume,
              altura: vol.altura,
              largura: vol.largura,
              comprimento: vol.comprimento,
              m3: vol.m3
            }))
          }));

          // Criar blob e download
          const dataStr = JSON.stringify(exportData, null, 2);
          const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
          
          const exportFileDefaultName = `cubagem_${new Date().toISOString().split('T')[0]}.json`;
          
          const linkElement = document.createElement('a');
          linkElement.setAttribute('href', dataUri);
          linkElement.setAttribute('download', exportFileDefaultName);
          linkElement.click();

          toast({
            title: "Dados Exportados",
            description: `Arquivo ${exportFileDefaultName} baixado com sucesso`,
          });
        },
        variant: 'outline'
      }
    ]
  };

  // Dados mockados para demonstração (em produção, viriam do backend)
  const sampleNotasFiscais = [
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
    },
    {
      id: "2",
      numero: "789012",
      chaveNF: "35250513516247000107550010000113401146202509",
      valor_nota_fiscal: "1750.25",
      peso_bruto: 8.2,
      quantidade_volumes: 1,
      emitente_razao_social: "FORNECEDOR ABC LTDA",
      emitente_cnpj: "11.222.333/0001-44",
      emitente_cidade: "Campinas",
      emitente_uf: "SP",
      emitente_endereco: "Rua do Fornecedor, 789",
      emitente_bairro: "Industrial",
      emitente_cep: "13000-000",
      emitente_telefone: "(19) 3333-4444",
      destinatario_razao_social: "DISTRIBUIDORA XYZ SA",
      destinatario_cnpj: "55.666.777/0001-88",
      destinatario_cidade: "Belo Horizonte",
      destinatario_uf: "MG",
      destinatario_endereco: "Av. da Distribuição, 321",
      destinatario_bairro: "Logística",
      destinatario_cep: "30000-000",
      destinatario_telefone: "(31) 5555-6666"
    }
  ];

  // Estado para gerenciar notas processadas
  const [notasProcessadas, setNotasProcessadas] = React.useState(sampleNotasFiscais);

  const handleVolumeDataUpdate = (volumeData: NotaVolumeData[]) => {
    console.log("Dados de volume atualizados:", volumeData);
    // Aqui você pode implementar lógica adicional para salvar no backend
  };

  const handleBatchAction = (action: string, data: NotaVolumeData[]) => {
    console.log(`Ação ${action} executada com:`, data);
    // Implementar lógica específica para cada ação
  };

  const handleNotaProcessed = (nota: any) => {
    console.log('=== EntradaNotasRefatorada - handleNotaProcessed chamado ===');
    console.log('Nota recebida:', nota);
    
    // Converter dados da nota para o formato esperado
    const notaProcessada = {
      id: nota.id || `nfe_${Date.now()}`,
      numero: nota.numeroNota || nota.numero || '',
      chaveNF: nota.chaveNF || nota.chaveAcesso || '',
      valor_nota_fiscal: nota.valorNota || nota.valor_nota_fiscal || '0',
      peso_bruto: parseFloat(nota.peso || nota.peso_bruto || '0'),
      quantidade_volumes: parseInt(nota.quantidadeVolumes || nota.quantidade_volumes || '1'),
      emitente_razao_social: nota.emitente?.razaoSocial || nota.emitente_razao_social || '',
      emitente_cnpj: nota.emitente?.cnpj || nota.emitente_cnpj || '',
      emitente_cidade: nota.emitente?.cidade || nota.emitente_cidade || '',
      emitente_uf: nota.emitente?.uf || nota.emitente_uf || '',
      emitente_endereco: nota.emitente?.endereco || nota.emitente_endereco || '',
      emitente_bairro: nota.emitente?.bairro || nota.emitente_bairro || '',
      emitente_cep: nota.emitente?.cep || nota.emitente_cep || '',
      emitente_telefone: nota.emitente?.telefone || nota.emitente_telefone || '',
      destinatario_razao_social: nota.destinatario?.razaoSocial || nota.destinatario_razao_social || '',
      destinatario_cnpj: nota.destinatario?.cnpj || nota.destinatario_cnpj || '',
      destinatario_cidade: nota.destinatario?.cidade || nota.destinatario_cidade || '',
      destinatario_uf: nota.destinatario?.uf || nota.destinatario_uf || '',
      destinatario_endereco: nota.destinatario?.endereco || nota.destinatario_endereco || '',
      destinatario_bairro: nota.destinatario?.bairro || nota.destinatario_bairro || '',
      destinatario_cep: nota.destinatario?.cep || nota.destinatario_cep || '',
      destinatario_telefone: nota.destinatario?.telefone || nota.destinatario_telefone || ''
    };

    console.log('Nota processada formatada:', notaProcessada);

    // Adicionar ou atualizar a nota na lista
    setNotasProcessadas(prev => {
      const existingIndex = prev.findIndex(n => n.id === notaProcessada.id || n.chaveNF === notaProcessada.chaveNF);
      let newList;
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = notaProcessada;
        newList = updated;
      } else {
        newList = [...prev, notaProcessada];
      }
      
      console.log('Lista de notas atualizada:', newList);
      return newList;
    });

    toast({
      title: "Nota Processada",
      description: `NFe ${notaProcessada.numero} adicionada com sucesso. Agora você pode informar a cubagem.`,
    });
  };

  return (
    <MainLayout title="Entrada de Notas Fiscais">
      <RecebimentoNotasManager
        config={armazenagemConfig}
        initialData={notasProcessadas}
        onVolumeDataUpdate={handleVolumeDataUpdate}
        onBatchAction={handleBatchAction}
        onNotaProcessed={handleNotaProcessed}
      >
        {(props) => (
          <CadastroNota 
            onVolumeDataUpdate={(volumeData) => {
              console.log("Volume data from CadastroNota:", volumeData);
            }}
            onNotaProcessed={props.onNotaProcessed}
          />
        )}
      </RecebimentoNotasManager>
    </MainLayout>
  );
};

export default EntradaNotasRefatorada;