
import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CargasPendentes from './components/CargasPendentes';
import CargasEmRota from './components/CargasEmRota';
import CargasFinalizadas from './components/CargasFinalizadas';
import CargasPreRomaneio from './components/CargasPreRomaneio';
import { Carga } from './types/coleta.types';
import { toast } from '@/hooks/use-toast';
import { Archive } from 'lucide-react';
import { extrairApenasUF } from '@/utils/estadoUtils';

// This is mock data that would normally come from an API
const mockCargas: Carga[] = [
  {
    id: 'CARGA-001',
    destino: 'São Paulo - SP',
    origem: 'Rio de Janeiro - RJ',
    dataPrevisao: '15/05/2025',
    volumes: 25,
    peso: '350kg',
    status: 'pending',
    cep: '01310-200',
    volumeM3: 4.5,
    altura: 1.5,
    largura: 1.2,
    comprimento: 2.5
  },
  {
    id: 'CARGA-002',
    destino: 'Rio de Janeiro - RJ',
    origem: 'São Paulo - SP',
    dataPrevisao: '16/05/2025',
    volumes: 18,
    peso: '245kg',
    status: 'transit',
    motorista: 'José da Silva',
    veiculo: 'Fiorino - ABC-1234',
    cep: '22041-011',
    volumeM3: 3.2,
    altura: 1.4,
    largura: 1.1,
    comprimento: 2.1
  },
  {
    id: 'CARGA-003',
    destino: 'Belo Horizonte - MG',
    origem: 'São Paulo - SP',
    dataPrevisao: '17/05/2025',
    volumes: 32,
    peso: '410kg',
    status: 'pending',
    cep: '30130-110',
    volumeM3: 5.8,
    altura: 1.8,
    largura: 1.4,
    comprimento: 2.3
  },
  {
    id: 'CARGA-004',
    destino: 'Curitiba - PR',
    origem: 'São Paulo - SP',
    dataPrevisao: '18/05/2025',
    volumes: 15,
    peso: '180kg',
    status: 'pending',
    cep: '80010-010',
    volumeM3: 2.5,
    altura: 1.2,
    largura: 1.0,
    comprimento: 2.1
  },
  {
    id: 'CARGA-005',
    destino: 'Campinas - SP',
    origem: 'São Paulo - SP',
    dataPrevisao: '15/05/2025',
    volumes: 22,
    peso: '290kg',
    status: 'transit',
    motorista: 'Carlos Santos',
    veiculo: 'Van - DEF-5678',
    cep: '13015-904',
    volumeM3: 3.8,
    altura: 1.5,
    largura: 1.2,
    comprimento: 2.1
  },
  {
    id: 'CARGA-006',
    destino: 'Santos - SP',
    origem: 'São Paulo - SP',
    dataPrevisao: '16/05/2025',
    volumes: 10,
    peso: '130kg',
    status: 'delivered',
    motorista: 'Pedro Oliveira',
    dataEntrega: '16/05/2025',
    cep: '11010-000',
    volumeM3: 1.8,
    altura: 1.1,
    largura: 0.9,
    comprimento: 1.8
  },
  {
    id: 'CARGA-007',
    destino: 'Sorocaba - SP',
    origem: 'São Paulo - SP',
    dataPrevisao: '17/05/2025',
    volumes: 18,
    peso: '210kg',
    status: 'delivered',
    motorista: 'Antônio Ferreira',
    dataEntrega: '17/05/2025',
    cep: '18035-400',
    volumeM3: 2.9,
    altura: 1.3,
    largura: 1.1,
    comprimento: 2.0
  },
  // Cargas adicionais para testar agrupamento por CEP
  {
    id: 'CARGA-008',
    destino: 'São Bernardo do Campo - SP',
    origem: 'São Paulo - SP',
    dataPrevisao: '19/05/2025',
    volumes: 14,
    peso: '175kg',
    status: 'pending',
    cep: '09750-000',
    volumeM3: 2.3,
    altura: 1.2,
    largura: 1.0,
    comprimento: 1.9
  },
  {
    id: 'CARGA-009',
    destino: 'Guarulhos - SP',
    origem: 'São Paulo - SP',
    dataPrevisao: '19/05/2025',
    volumes: 8,
    peso: '120kg',
    status: 'pending',
    cep: '07000-000',
    volumeM3: 1.5,
    altura: 1.0,
    largura: 0.8,
    comprimento: 1.7
  },
  {
    id: 'CARGA-010',
    destino: 'Santo André - SP',
    origem: 'São Paulo - SP',
    dataPrevisao: '20/05/2025',
    volumes: 12,
    peso: '160kg',
    status: 'pending',
    cep: '09000-000',
    volumeM3: 2.0,
    altura: 1.1,
    largura: 0.9,
    comprimento: 1.8
  }
];

// Processar os dados mock para garantir que apenas as siglas UF sejam exibidas
const processedMockCargas: Carga[] = mockCargas.map(carga => {
  // Extrair cidade e UF da origem e destino usando o padrão "Cidade - UF"
  let origem = carga.origem || '';
  let destino = carga.destino || '';
  
  // Processar origem
  const origemParts = origem.split(' - ');
  if (origemParts.length >= 2) {
    const cidade = origemParts[0];
    const uf = extrairApenasUF(origemParts[1]);
    origem = `${cidade} - ${uf}`;
  }
  
  // Processar destino
  const destinoParts = destino.split(' - ');
  if (destinoParts.length >= 2) {
    const cidade = destinoParts[0];
    const uf = extrairApenasUF(destinoParts[1]);
    destino = `${cidade} - ${uf}`;
  }
  
  return {
    ...carga,
    origem,
    destino
  };
});

const CargasAlocacao: React.FC = () => {
  const [cargasPendentes, setCargasPendentes] = useState<Carga[]>(
    processedMockCargas.filter(carga => carga.status === 'pending')
  );
  const [cargasEmRota, setCargasEmRota] = useState<Carga[]>(
    processedMockCargas.filter(carga => carga.status === 'transit' || carga.status === 'scheduled' || carga.status === 'loading')
  );
  const [cargasFinalizadas, setCargasFinalizadas] = useState<Carga[]>(
    processedMockCargas.filter(carga => carga.status === 'delivered' || carga.status === 'problem')
  );
  const [preRomaneioCargas, setPreRomaneioCargas] = useState<Carga[]>([]);
  
  const [currentPendentesPage, setCurrentPendentesPage] = useState(1);
  const [currentEmRotaPage, setCurrentEmRotaPage] = useState(1);
  const [currentFinalizadasPage, setCurrentFinalizadasPage] = useState(1);
  const [currentPreRomaneioPage, setCurrentPreRomaneioPage] = useState(1);

  // Função para pré-alocar cargas com um tipo de veículo
  const handlePreAlocarCargas = (cargasIds: string[], tipoVeiculoId: string, tipoVeiculoNome: string) => {
    // Atualizar as cargas pendentes com as informações do tipo de veículo
    const novasCargasPendentes = cargasPendentes.map(carga => {
      if (cargasIds.includes(carga.id)) {
        return {
          ...carga,
          tipoVeiculo: tipoVeiculoNome,
          tipoVeiculoId: tipoVeiculoId
        };
      }
      return carga;
    });
    
    setCargasPendentes(novasCargasPendentes);
    
    toast({
      title: "Pré-alocação concluída",
      description: `${cargasIds.length} carga(s) pré-alocada(s) para veículo tipo ${tipoVeiculoNome}.`,
    });
  };
  
  // Função para gerar pré-romaneio
  const handleGerarPreRomaneio = (cargasIds: string[], tipoVeiculoId: string, tipoVeiculoNome: string) => {
    // Selecionar cargas para o pré-romaneio
    const cargasParaPreRomaneio = cargasPendentes
      .filter(carga => cargasIds.includes(carga.id))
      .map(carga => ({
        ...carga,
        tipoVeiculo: tipoVeiculoNome,
        tipoVeiculoId: tipoVeiculoId,
        grupoRota: `PR-${new Date().getTime().toString().slice(-6)}`  // Identificador do grupo de rota
      }));
    
    // Remover cargas da lista de pendentes
    const novasCargasPendentes = cargasPendentes.filter(carga => !cargasIds.includes(carga.id));
    
    setCargasPendentes(novasCargasPendentes);
    setPreRomaneioCargas(prev => [...prev, ...cargasParaPreRomaneio]);
    
    toast({
      title: "Pré-romaneio gerado",
      description: `${cargasIds.length} carga(s) agrupada(s) em um pré-romaneio com veículo tipo ${tipoVeiculoNome}.`,
    });
  };
  
  // Função para alocar coletas para um motorista
  const handleAlocarColetas = (cargasIds: string[], motoristaId: string, motoristaName: string, veiculoId: string, veiculoName: string) => {
    // Verificar se as cargas estão no pré-romaneio ou nas pendentes
    const cargasPreRomaneioDaAlocacao = preRomaneioCargas.filter(carga => cargasIds.includes(carga.id));
    const cargasPendentesDaAlocacao = cargasPendentes.filter(carga => cargasIds.includes(carga.id));
    
    // Juntar todas as cargas da alocação
    const cargasDaAlocacao = [...cargasPreRomaneioDaAlocacao, ...cargasPendentesDaAlocacao];
    
    // Atualizar as cargas em rota com as novas alocações
    const cargasAlocadas = cargasDaAlocacao.map(carga => ({
      ...carga,
      status: 'transit' as const,
      motorista: motoristaName,
      veiculo: veiculoName
    }));
    
    // Remover as cargas das listas originais
    const novasCargasPendentes = cargasPendentes.filter(carga => !cargasIds.includes(carga.id));
    const novasPreRomaneioCargas = preRomaneioCargas.filter(carga => !cargasIds.includes(carga.id));
    
    setCargasPendentes(novasCargasPendentes);
    setPreRomaneioCargas(novasPreRomaneioCargas);
    setCargasEmRota([...cargasEmRota, ...cargasAlocadas]);
    
    toast({
      title: "Cargas alocadas com sucesso!",
      description: `${cargasIds.length} carga(s) alocada(s) para ${motoristaName}.`,
    });
  };
  
  // Função para finalizar coletas
  const handleFinalizarColeta = (cargaId: string, status: 'delivered' | 'problem') => {
    const carga = cargasEmRota.find(c => c.id === cargaId);
    if (!carga) return;
    
    // Remove a carga das em rota
    const novasCargasEmRota = cargasEmRota.filter(carga => carga.id !== cargaId);
    
    // Adiciona nas finalizadas com status atualizado
    const cargaFinalizada = {
      ...carga,
      status,
      dataEntrega: new Date().toLocaleDateString()
    };
    
    setCargasEmRota(novasCargasEmRota);
    setCargasFinalizadas([cargaFinalizada, ...cargasFinalizadas]);
    
    toast({
      title: status === 'delivered' ? "Coleta entregue" : "Coleta finalizada com problema",
      description: `Carga ${cargaId} foi ${status === 'delivered' ? 'entregue' : 'finalizada com problema'}.`,
      variant: status === 'delivered' ? "default" : "destructive",
    });
  };
  
  // Voltar cargas do pré-romaneio para pendentes
  const handleVoltarParaPendentes = (cargasIds: string[]) => {
    const cargasParaVoltar = preRomaneioCargas.filter(carga => cargasIds.includes(carga.id));
    
    // Remover do pré-romaneio
    const novasPreRomaneioCargas = preRomaneioCargas.filter(carga => !cargasIds.includes(carga.id));
    
    // Resetar grupo de rota antes de adicionar às pendentes
    const cargasResetadas = cargasParaVoltar.map(carga => ({
      ...carga,
      grupoRota: undefined
    }));
    
    setPreRomaneioCargas(novasPreRomaneioCargas);
    setCargasPendentes(prev => [...prev, ...cargasResetadas]);
    
    toast({
      title: "Cargas movidas",
      description: `${cargasIds.length} carga(s) retornada(s) para lista de pendentes.`,
    });
  };

  return (
    <MainLayout title="Alocação de Cargas">
      <div className="space-y-6">
        <Tabs defaultValue="pendentes" className="w-full">
          <TabsList className="grid grid-cols-4 w-full md:w-[550px]">
            <TabsTrigger value="pendentes">Não Alocadas</TabsTrigger>
            <TabsTrigger value="preromaneio">
              <Archive className="h-4 w-4 mr-2" /> Pré Romaneio
            </TabsTrigger>
            <TabsTrigger value="emrota">Em Rota</TabsTrigger>
            <TabsTrigger value="finalizadas">Finalizadas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pendentes" className="mt-4">
            <CargasPendentes
              cargas={cargasPendentes}
              currentPage={currentPendentesPage}
              setCurrentPage={setCurrentPendentesPage}
              onAlocar={handleAlocarColetas}
              onPreAlocar={handlePreAlocarCargas}
              onGerarPreRomaneio={handleGerarPreRomaneio}
            />
          </TabsContent>
          
          <TabsContent value="preromaneio" className="mt-4">
            <CargasPreRomaneio
              cargas={preRomaneioCargas}
              currentPage={currentPreRomaneioPage}
              setCurrentPage={setCurrentPreRomaneioPage}
              onAlocar={handleAlocarColetas}
              onRemoverDoPreRomaneio={handleVoltarParaPendentes}
            />
          </TabsContent>
          
          <TabsContent value="emrota" className="mt-4">
            <CargasEmRota 
              cargas={cargasEmRota}
              currentPage={currentEmRotaPage}
              setCurrentPage={setCurrentEmRotaPage}
              onFinalizar={handleFinalizarColeta}
            />
          </TabsContent>
          
          <TabsContent value="finalizadas" className="mt-4">
            <CargasFinalizadas
              cargas={cargasFinalizadas}
              currentPage={currentFinalizadasPage}
              setCurrentPage={setCurrentFinalizadasPage}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default CargasAlocacao;
