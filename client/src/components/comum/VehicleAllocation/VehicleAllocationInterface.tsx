import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Truck, Package, MapPin, Calendar, Search, Filter, CheckCircle, AlertCircle, Clock, X, Route, FileText } from 'lucide-react';

// Tipos de dados
interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
  tipo: 'Van' | 'Caminhão' | 'Carreta' | 'Bitrem';
  capacidadePeso: number;
  capacidadeVolume: number;
  status: 'disponivel' | 'ocupado' | 'manutencao';
  motorista: string;
  localizacao: string;
}

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

interface VehicleAllocationInterfaceProps {
  onAllocationChange?: (allocations: VehicleAllocation[]) => void;
  onGenerateRoute?: (vehicleId: string, requests: LoadingRequest[]) => void;
}

const VehicleAllocationInterface: React.FC<VehicleAllocationInterfaceProps> = ({
  onAllocationChange,
  onGenerateRoute
}) => {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LoadingRequest[]>([]);
  const [allocations, setAllocations] = useState<VehicleAllocation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Dados mock para demonstração
  useEffect(() => {
    const mockVehicles: Vehicle[] = [
      {
        id: 'v1',
        placa: 'ABC-1234',
        modelo: 'Mercedes Sprinter',
        tipo: 'Van',
        capacidadePeso: 3500,
        capacidadeVolume: 15,
        status: 'disponivel',
        motorista: 'João Silva',
        localizacao: 'São Paulo - SP'
      },
      {
        id: 'v2',
        placa: 'DEF-5678',
        modelo: 'Volvo FH',
        tipo: 'Caminhão',
        capacidadePeso: 23000,
        capacidadeVolume: 90,
        status: 'disponivel',
        motorista: 'Maria Santos',
        localizacao: 'Rio de Janeiro - RJ'
      },
      {
        id: 'v3',
        placa: 'GHI-9012',
        modelo: 'Scania R450',
        tipo: 'Carreta',
        capacidadePeso: 40000,
        capacidadeVolume: 140,
        status: 'disponivel',
        motorista: 'Carlos Oliveira',
        localizacao: 'Belo Horizonte - MG'
      },
      {
        id: 'v4',
        placa: 'JKL-3456',
        modelo: 'Ford Transit',
        tipo: 'Van',
        capacidadePeso: 2300,
        capacidadeVolume: 12,
        status: 'manutencao',
        motorista: 'Ana Costa',
        localizacao: 'São Paulo - SP'
      }
    ];

    const mockRequests: LoadingRequest[] = [
      {
        id: 'r1',
        numero: 'SOL-001',
        tipo: 'Direta',
        origem: 'São Paulo - SP',
        destino: 'Rio de Janeiro - RJ',
        pesoTotal: 2500,
        volumeTotal: 8,
        dataColeta: '2025-06-14',
        prioridade: 'Alta',
        status: 'pendente'
      },
      {
        id: 'r2',
        numero: 'SOL-002',
        tipo: 'Coleta',
        origem: 'Belo Horizonte - MG',
        destino: 'São Paulo - SP',
        pesoTotal: 1500,
        volumeTotal: 6,
        dataColeta: '2025-06-15',
        prioridade: 'Média',
        status: 'pendente'
      },
      {
        id: 'r3',
        numero: 'SOL-003',
        tipo: 'Transferência',
        origem: 'Rio de Janeiro - RJ',
        destino: 'Salvador - BA',
        pesoTotal: 3500,
        volumeTotal: 12,
        dataColeta: '2025-06-16',
        prioridade: 'Baixa',
        status: 'pendente'
      },
      {
        id: 'r4',
        numero: 'SOL-004',
        tipo: 'Coleta',
        origem: 'São Paulo - SP',
        destino: 'Campinas - SP',
        pesoTotal: 800,
        volumeTotal: 3,
        dataColeta: '2025-06-14',
        prioridade: 'Média',
        status: 'pendente'
      },
      {
        id: 'r5',
        numero: 'SOL-005',
        tipo: 'Direta',
        origem: 'Santos - SP',
        destino: 'São Paulo - SP',
        pesoTotal: 1200,
        volumeTotal: 4,
        dataColeta: '2025-06-14',
        prioridade: 'Alta',
        status: 'pendente'
      }
    ];

    setVehicles(mockVehicles);
    setPendingRequests(mockRequests);
    
    // Inicializar alocações vazias para cada veículo disponível
    const initialAllocations = mockVehicles
      .filter(v => v.status === 'disponivel')
      .map(vehicle => ({
        vehicleId: vehicle.id,
        requests: [],
        totalWeight: 0,
        totalVolume: 0,
        utilizacaoPeso: 0,
        utilizacaoVolume: 0
      }));
    
    setAllocations(initialAllocations);
  }, []);

  // Filtragem de solicitações pendentes
  const filteredPendingRequests = pendingRequests.filter(request => {
    const matchesSearch = request.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.destino.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Filtragem de veículos
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesType = typeFilter === 'all' || vehicle.tipo === typeFilter;
    
    return matchesStatus && matchesType && vehicle.status === 'disponivel';
  });

  // Verificar se uma solicitação pode ser adicionada a um veículo
  const canAddRequestToVehicle = (vehicleId: string, request: LoadingRequest): boolean => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const allocation = allocations.find(a => a.vehicleId === vehicleId);
    
    if (!vehicle || !allocation) return false;
    
    const newTotalWeight = allocation.totalWeight + request.pesoTotal;
    const newTotalVolume = allocation.totalVolume + request.volumeTotal;
    
    return newTotalWeight <= vehicle.capacidadePeso && newTotalVolume <= vehicle.capacidadeVolume;
  };

  // Calcular utilização do veículo
  const calculateUtilization = (vehicleId: string, totalWeight: number, totalVolume: number) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) return { peso: 0, volume: 0 };
    
    return {
      peso: Math.round((totalWeight / vehicle.capacidadePeso) * 100),
      volume: Math.round((totalVolume / vehicle.capacidadeVolume) * 100)
    };
  };

  // Manipular drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const requestId = draggableId.replace('request-', '');
    const request = pendingRequests.find(r => r.id === requestId) || 
                   allocations.flatMap(a => a.requests).find(r => r.id === requestId);

    if (!request) return;

    // Se moveu de pendentes para um veículo
    if (source.droppableId === 'pending-requests' && destination.droppableId.startsWith('vehicle-')) {
      const vehicleId = destination.droppableId.replace('vehicle-', '');
      
      if (!canAddRequestToVehicle(vehicleId, request)) {
        toast({
          title: "Capacidade Excedida",
          description: "Este veículo não tem capacidade suficiente para esta solicitação.",
          variant: "destructive"
        });
        return;
      }

      // Remover da lista de pendentes
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
      
      // Adicionar à alocação do veículo
      setAllocations(prev => prev.map(allocation => {
        if (allocation.vehicleId === vehicleId) {
          const newRequests = [...allocation.requests, request];
          const newTotalWeight = allocation.totalWeight + request.pesoTotal;
          const newTotalVolume = allocation.totalVolume + request.volumeTotal;
          const utilization = calculateUtilization(vehicleId, newTotalWeight, newTotalVolume);
          
          return {
            ...allocation,
            requests: newRequests,
            totalWeight: newTotalWeight,
            totalVolume: newTotalVolume,
            utilizacaoPeso: utilization.peso,
            utilizacaoVolume: utilization.volume
          };
        }
        return allocation;
      }));

      toast({
        title: "Solicitação Alocada",
        description: `${request.numero} foi alocada ao veículo`,
      });
    }

    // Se moveu de um veículo de volta para pendentes
    if (source.droppableId.startsWith('vehicle-') && destination.droppableId === 'pending-requests') {
      const vehicleId = source.droppableId.replace('vehicle-', '');
      
      // Remover da alocação do veículo
      setAllocations(prev => prev.map(allocation => {
        if (allocation.vehicleId === vehicleId) {
          const newRequests = allocation.requests.filter(r => r.id !== requestId);
          const newTotalWeight = allocation.totalWeight - request.pesoTotal;
          const newTotalVolume = allocation.totalVolume - request.volumeTotal;
          const utilization = calculateUtilization(vehicleId, newTotalWeight, newTotalVolume);
          
          return {
            ...allocation,
            requests: newRequests,
            totalWeight: newTotalWeight,
            totalVolume: newTotalVolume,
            utilizacaoPeso: utilization.peso,
            utilizacaoVolume: utilization.volume
          };
        }
        return allocation;
      }));
      
      // Adicionar de volta aos pendentes
      setPendingRequests(prev => [...prev, request]);

      toast({
        title: "Alocação Removida",
        description: `${request.numero} foi removida do veículo`,
      });
    }

    // Se moveu entre veículos
    if (source.droppableId.startsWith('vehicle-') && destination.droppableId.startsWith('vehicle-')) {
      const sourceVehicleId = source.droppableId.replace('vehicle-', '');
      const destVehicleId = destination.droppableId.replace('vehicle-', '');
      
      if (sourceVehicleId === destVehicleId) return;

      if (!canAddRequestToVehicle(destVehicleId, request)) {
        toast({
          title: "Capacidade Excedida",
          description: "O veículo de destino não tem capacidade suficiente.",
          variant: "destructive"
        });
        return;
      }

      setAllocations(prev => prev.map(allocation => {
        if (allocation.vehicleId === sourceVehicleId) {
          // Remover do veículo origem
          const newRequests = allocation.requests.filter(r => r.id !== requestId);
          const newTotalWeight = allocation.totalWeight - request.pesoTotal;
          const newTotalVolume = allocation.totalVolume - request.volumeTotal;
          const utilization = calculateUtilization(sourceVehicleId, newTotalWeight, newTotalVolume);
          
          return {
            ...allocation,
            requests: newRequests,
            totalWeight: newTotalWeight,
            totalVolume: newTotalVolume,
            utilizacaoPeso: utilization.peso,
            utilizacaoVolume: utilization.volume
          };
        }
        
        if (allocation.vehicleId === destVehicleId) {
          // Adicionar ao veículo destino
          const newRequests = [...allocation.requests, request];
          const newTotalWeight = allocation.totalWeight + request.pesoTotal;
          const newTotalVolume = allocation.totalVolume + request.volumeTotal;
          const utilization = calculateUtilization(destVehicleId, newTotalWeight, newTotalVolume);
          
          return {
            ...allocation,
            requests: newRequests,
            totalWeight: newTotalWeight,
            totalVolume: newTotalVolume,
            utilizacaoPeso: utilization.peso,
            utilizacaoVolume: utilization.volume
          };
        }
        
        return allocation;
      }));

      toast({
        title: "Solicitação Transferida",
        description: `${request.numero} foi transferida entre veículos`,
      });
    }
  };

  // Remover solicitação específica de um veículo
  const removeRequestFromVehicle = (vehicleId: string, requestId: string) => {
    const allocation = allocations.find(a => a.vehicleId === vehicleId);
    const request = allocation?.requests.find(r => r.id === requestId);
    
    if (!request) return;

    setAllocations(prev => prev.map(allocation => {
      if (allocation.vehicleId === vehicleId) {
        const newRequests = allocation.requests.filter(r => r.id !== requestId);
        const newTotalWeight = allocation.totalWeight - request.pesoTotal;
        const newTotalVolume = allocation.totalVolume - request.volumeTotal;
        const utilization = calculateUtilization(vehicleId, newTotalWeight, newTotalVolume);
        
        return {
          ...allocation,
          requests: newRequests,
          totalWeight: newTotalWeight,
          totalVolume: newTotalVolume,
          utilizacaoPeso: utilization.peso,
          utilizacaoVolume: utilization.volume
        };
      }
      return allocation;
    }));
    
    setPendingRequests(prev => [...prev, request]);
  };

  // Gerar roteirização para um veículo
  const handleGenerateRoute = (vehicleId: string) => {
    const allocation = allocations.find(a => a.vehicleId === vehicleId);
    const vehicle = vehicles.find(v => v.id === vehicleId);
    
    if (!allocation || !vehicle || allocation.requests.length === 0) {
      toast({
        title: "Nenhuma Solicitação",
        description: "Este veículo não possui solicitações alocadas.",
        variant: "destructive"
      });
      return;
    }

    if (onGenerateRoute) {
      onGenerateRoute(vehicleId, allocation.requests);
    }

    toast({
      title: "Roteirização Gerada",
      description: `Rota criada para ${vehicle.placa} com ${allocation.requests.length} solicitações`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'alocado': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'em_transito': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'concluido': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default: return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Notificar mudanças
  useEffect(() => {
    if (onAllocationChange) {
      onAllocationChange(allocations);
    }
  }, [allocations, onAllocationChange]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Alocação de Veículos</h2>
          <p className="text-gray-500">Arraste solicitações para os veículos e gerencie múltiplas cargas por veículo</p>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Painel de Solicitações Pendentes */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Solicitações Pendentes ({filteredPendingRequests.length})
                </CardTitle>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar solicitações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              
              <CardContent>
                <Droppable droppableId="pending-requests">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[400px] space-y-3 p-2 rounded-lg border-2 border-dashed transition-colors ${
                        snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      {filteredPendingRequests.map((request, index) => (
                        <Draggable key={request.id} draggableId={`request-${request.id}`} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 rounded-lg border cursor-move transition-all ${
                                snapshot.isDragging 
                                  ? 'shadow-lg bg-white border-blue-400' 
                                  : 'bg-gray-50 hover:bg-white border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-medium text-sm">{request.numero}</div>
                                <Badge variant="outline" className="text-xs">
                                  {request.tipo}
                                </Badge>
                              </div>
                              
                              <Badge className={`${getPriorityColor(request.prioridade)} text-xs mb-2`}>
                                {request.prioridade}
                              </Badge>
                              
                              <div className="text-xs text-gray-600 space-y-1">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {request.origem} → {request.destino}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Package className="w-3 h-3" />
                                  {request.pesoTotal}kg / {request.volumeTotal}m³
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(request.dataColeta).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {filteredPendingRequests.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                          <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                          <p>Nenhuma solicitação pendente</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>

          {/* Painel de Veículos com Alocações */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="ocupado">Ocupado</SelectItem>
                    <SelectItem value="manutencao">Manutenção</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Tipos</SelectItem>
                    <SelectItem value="Van">Van</SelectItem>
                    <SelectItem value="Caminhão">Caminhão</SelectItem>
                    <SelectItem value="Carreta">Carreta</SelectItem>
                    <SelectItem value="Bitrem">Bitrem</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredVehicles.map((vehicle) => {
                const allocation = allocations.find(a => a.vehicleId === vehicle.id);
                if (!allocation) return null;

                return (
                  <Card key={vehicle.id} className="h-fit">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-lg">
                            <Truck className="w-5 h-5" />
                            {vehicle.placa}
                          </CardTitle>
                          <div className="text-sm text-gray-600">
                            {vehicle.modelo} - {vehicle.motorista}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vehicle.localizacao}
                          </div>
                        </div>
                        <Badge variant="outline">{vehicle.tipo}</Badge>
                      </div>

                      {/* Indicadores de Capacidade */}
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <div className="flex justify-between text-xs">
                            <span>Peso</span>
                            <span className={getUtilizationColor(allocation.utilizacaoPeso)}>
                              {allocation.utilizacaoPeso}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                allocation.utilizacaoPeso >= 90 ? 'bg-red-500' :
                                allocation.utilizacaoPeso >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${allocation.utilizacaoPeso}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {allocation.totalWeight}kg / {vehicle.capacidadePeso}kg
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs">
                            <span>Volume</span>
                            <span className={getUtilizationColor(allocation.utilizacaoVolume)}>
                              {allocation.utilizacaoVolume}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                allocation.utilizacaoVolume >= 90 ? 'bg-red-500' :
                                allocation.utilizacaoVolume >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${allocation.utilizacaoVolume}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {allocation.totalVolume}m³ / {vehicle.capacidadeVolume}m³
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleGenerateRoute(vehicle.id)}
                          disabled={allocation.requests.length === 0}
                          className="flex-1"
                        >
                          <Route className="w-4 h-4 mr-1" />
                          Gerar Rota
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={allocation.requests.length === 0}
                          className="flex-1"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          Romaneio
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="mb-2">
                        <span className="text-sm font-medium">
                          Solicitações Alocadas ({allocation.requests.length})
                        </span>
                      </div>

                      <Droppable droppableId={`vehicle-${vehicle.id}`}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-[200px] space-y-2 p-3 rounded-lg border-2 border-dashed transition-colors ${
                              snapshot.isDraggingOver 
                                ? 'border-green-400 bg-green-50' 
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            {allocation.requests.map((request, index) => (
                              <Draggable 
                                key={request.id} 
                                draggableId={`request-${request.id}`} 
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-3 rounded-lg border cursor-move transition-all relative ${
                                      snapshot.isDragging 
                                        ? 'shadow-lg bg-white border-green-400' 
                                        : 'bg-white border-green-200 hover:border-green-300'
                                    }`}
                                  >
                                    <button
                                      onClick={() => removeRequestFromVehicle(vehicle.id, request.id)}
                                      className="absolute top-1 right-1 p-1 rounded-full hover:bg-red-100 text-red-500"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>

                                    <div className="flex justify-between items-start mb-2 pr-6">
                                      <div className="font-medium text-sm">{request.numero}</div>
                                      <Badge variant="outline" className="text-xs">
                                        {request.tipo}
                                      </Badge>
                                    </div>
                                    
                                    <Badge className={`${getPriorityColor(request.prioridade)} text-xs mb-2`}>
                                      {request.prioridade}
                                    </Badge>
                                    
                                    <div className="text-xs text-gray-600 space-y-1">
                                      <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {request.origem} → {request.destino}
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Package className="w-3 h-3" />
                                        {request.pesoTotal}kg / {request.volumeTotal}m³
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(request.dataColeta).toLocaleDateString('pt-BR')}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            
                            {allocation.requests.length === 0 && (
                              <div className="text-center text-gray-500 py-8">
                                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Arraste solicitações aqui</p>
                                <p className="text-xs">
                                  Capacidade: {vehicle.capacidadePeso}kg / {vehicle.capacidadeVolume}m³
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default VehicleAllocationInterface;