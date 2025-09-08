import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import EnhancedVehicleAllocation from '../../components/comum/VehicleAllocation/EnhancedVehicleAllocation';
import { useToast } from '@/hooks/use-toast';
import { ViewSelector } from '@/components/common/ViewSelector';

// Tipos importados do componente de alocação
interface LoadingRequest {
  id: string;
  numero: string;
  tipo: 'Direta' | 'Coleta' | 'Transferência';
  origem: string;
  destino: string;
  pesoTotal: number;
  volumeTotal: number;
  dataColeta: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  status: 'pendente' | 'alocado' | 'em_transito' | 'concluido';
  observacoes?: string;
}

interface VehicleAllocation {
  vehicleId: string;
  requests: LoadingRequest[];
  totalWeight: number;
  totalVolume: number;
  utilizacaoPeso: number;
  utilizacaoVolume: number;
}

const AlocacaoVeiculos = () => {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'cards' | 'list' | 'kanban'>('cards');

  const handleAllocationChange = (allocations: VehicleAllocation[]) => {
    console.log('Alocações atualizadas:', allocations);
    
    // Aqui você pode salvar as alocações no backend
    // Exemplo: saveAllocations(allocations);
    
    // Contabilizar estatísticas
    const totalVehiclesWithAllocations = allocations.filter(a => a.requests.length > 0).length;
    const totalRequests = allocations.reduce((sum, a) => sum + a.requests.length, 0);
    
    console.log(`${totalVehiclesWithAllocations} veículos com ${totalRequests} solicitações alocadas`);
  };

  const handleGenerateRoute = (vehicleId: string, requests: LoadingRequest[]) => {
    console.log(`Gerando roteirização para veículo ${vehicleId}:`, requests);
    
    // Aqui você pode implementar a lógica de roteirização
    // Por exemplo: 
    // - Calcular rota otimizada baseada em origem/destino
    // - Considerar prioridades das solicitações
    // - Gerar sequência de paradas
    // - Calcular tempo estimado de viagem
    
    toast({
      title: "Roteirização Iniciada",
      description: `Processando rota otimizada para ${requests.length} solicitações`,
    });
    
    // Simular processo de otimização
    setTimeout(() => {
      toast({
        title: "Rota Otimizada",
        description: "Romaneio de cargas pronto para envio ao motorista",
      });
    }, 2000);
  };

  const handleSaveAllocations = (allocations: VehicleAllocation[]) => {
    console.log('Salvando alocações:', allocations);
    
    // Implementar persistência das alocações
    // Por exemplo: salvar no backend, localStorage, etc.
    
    toast({
      title: "Alocações Salvas",
      description: "As alocações foram salvas com sucesso!",
    });
  };

  return (
    <MainLayout title="Alocação de Veículos">
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alocação de Veículos</h1>
            <p className="text-gray-600 mt-1">Gerencie a alocação de veículos para solicitações de coleta</p>
          </div>
          <ViewSelector 
            currentView={currentView} 
            onViewChange={setCurrentView}
            showBackButton={true}
          />
        </div>

        <EnhancedVehicleAllocation 
          onAllocationChange={handleAllocationChange}
          onGenerateRoute={handleGenerateRoute}
          onSaveAllocations={handleSaveAllocations}
        />
      </div>
    </MainLayout>
  );
};

export default AlocacaoVeiculos;