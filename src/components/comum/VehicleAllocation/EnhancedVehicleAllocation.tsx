import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import RouteOptimizer from './RouteOptimizer';
import { 
  Truck, 
  Package, 
  MapPin, 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  X, 
  Route, 
  FileText,
  Weight,
  Box,
  User,
  AlertTriangle,
  Target,
  RefreshCw,
  Save,
  Undo2,
  Eye
} from 'lucide-react';

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
  cliente?: string;
}

interface VehicleAllocation {
  vehicleId: string;
  requests: LoadingRequest[];
  totalWeight: number;
  totalVolume: number;
  utilizacaoPeso: number;
  utilizacaoVolume: number;
  isOverCapacity: boolean;
  warnings: string[];
}

interface EnhancedVehicleAllocationProps {
  onAllocationChange?: (allocations: VehicleAllocation[]) => void;
  onGenerateRoute?: (vehicleId: string, requests: LoadingRequest[]) => void;
  onSaveAllocations?: (allocations: VehicleAllocation[]) => void;
}

const EnhancedVehicleAllocation: React.FC<EnhancedVehicleAllocationProps> = ({
  onAllocationChange,
  onGenerateRoute,
  onSaveAllocations
}) => {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [pendingRequests, setPendingRequests] = useState<LoadingRequest[]>([]);
  const [allocations, setAllocations] = useState<VehicleAllocation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dragOverVehicle, setDragOverVehicle] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<VehicleAllocation[]>([]);
  const [routeOptimizerOpen, setRouteOptimizerOpen] = useState(false);
  const [selectedVehicleForRoute, setSelectedVehicleForRoute] = useState<{ vehicle: Vehicle; requests: LoadingRequest[] } | null>(null);

  // Mock data initialization
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
        status: 'pendente',
        cliente: 'Empresa ABC Ltda'
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
        status: 'pendente',
        cliente: 'Transportes Beta Ltda'
      },
      {
        id: 'r3',
        numero: 'SOL-003',
        tipo: 'Transferência',
        origem: 'Salvador - BA',
        destino: 'Santos - SP',
        pesoTotal: 3800,
        volumeTotal: 12,
        dataColeta: '2025-06-16',
        prioridade: 'Baixa',
        status: 'pendente',
        cliente: 'Logística Gamma S.A.'
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
        status: 'pendente',
        cliente: 'Express Delta'
      },
      {
        id: 'r5',
        numero: 'SOL-005',
        tipo: 'Direta',
        origem: 'Fortaleza - CE',
        destino: 'Recife - PE',
        pesoTotal: 2200,
        volumeTotal: 7,
        dataColeta: '2025-06-17',
        prioridade: 'Alta',
        status: 'pendente',
        cliente: 'Norte Logística'
      }
    ];

    setVehicles(mockVehicles);
    setPendingRequests(mockRequests);

    const initialAllocations = mockVehicles.map(vehicle => ({
      vehicleId: vehicle.id,
      requests: [],
      totalWeight: 0,
      totalVolume: 0,
      utilizacaoPeso: 0,
      utilizacaoVolume: 0,
      isOverCapacity: false,
      warnings: []
    }));

    setAllocations(initialAllocations);
    setLastSavedState(initialAllocations);
  }, []);

  // Calculate allocation metrics
  const calculateAllocationMetrics = useCallback((vehicleId: string, requests: LoadingRequest[]): VehicleAllocation => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      return {
        vehicleId,
        requests,
        totalWeight: 0,
        totalVolume: 0,
        utilizacaoPeso: 0,
        utilizacaoVolume: 0,
        isOverCapacity: false,
        warnings: []
      };
    }

    const totalWeight = requests.reduce((sum, req) => sum + req.pesoTotal, 0);
    const totalVolume = requests.reduce((sum, req) => sum + req.volumeTotal, 0);
    const utilizacaoPeso = (totalWeight / vehicle.capacidadePeso) * 100;
    const utilizacaoVolume = (totalVolume / vehicle.capacidadeVolume) * 100;

    const warnings: string[] = [];
    const isOverCapacity = utilizacaoPeso > 100 || utilizacaoVolume > 100;

    if (utilizacaoPeso > 100) warnings.push(`Peso excede capacidade em ${(utilizacaoPeso - 100).toFixed(1)}%`);
    if (utilizacaoVolume > 100) warnings.push(`Volume excede capacidade em ${(utilizacaoVolume - 100).toFixed(1)}%`);
    if (utilizacaoPeso > 90 && utilizacaoPeso <= 100) warnings.push('Peso próximo ao limite');
    if (utilizacaoVolume > 90 && utilizacaoVolume <= 100) warnings.push('Volume próximo ao limite');

    // Check for conflicting dates/routes
    const dates = requests.map(r => r.dataColeta);
    const uniqueDates = Array.from(new Set(dates));
    if (uniqueDates.length > 1) {
      warnings.push('Solicitações com datas diferentes');
    }

    return {
      vehicleId,
      requests,
      totalWeight,
      totalVolume,
      utilizacaoPeso: Math.min(utilizacaoPeso, 100),
      utilizacaoVolume: Math.min(utilizacaoVolume, 100),
      isOverCapacity,
      warnings
    };
  }, [vehicles]);

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    setDraggedItem(null);
    setDragOverVehicle(null);

    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the dragged request
    let draggedRequest: LoadingRequest | null = null;

    if (source.droppableId === 'pending') {
      draggedRequest = pendingRequests.find(req => req.id === draggableId) || null;
    } else {
      const sourceAllocation = allocations.find(alloc => alloc.vehicleId === source.droppableId);
      draggedRequest = sourceAllocation?.requests.find(req => req.id === draggableId) || null;
    }

    if (!draggedRequest) return;

    // Create new allocations array
    const newAllocations = [...allocations];

    // Remove from source
    if (source.droppableId === 'pending') {
      setPendingRequests(prev => prev.filter(req => req.id !== draggableId));
    } else {
      const sourceIndex = newAllocations.findIndex(alloc => alloc.vehicleId === source.droppableId);
      if (sourceIndex !== -1) {
        newAllocations[sourceIndex] = {
          ...newAllocations[sourceIndex],
          requests: newAllocations[sourceIndex].requests.filter(req => req.id !== draggableId)
        };
      }
    }

    // Add to destination
    if (destination.droppableId === 'pending') {
      setPendingRequests(prev => {
        const newRequests = [...prev];
        newRequests.splice(destination.index, 0, draggedRequest!);
        return newRequests;
      });
    } else {
      const destIndex = newAllocations.findIndex(alloc => alloc.vehicleId === destination.droppableId);
      if (destIndex !== -1) {
        const newRequests = [...newAllocations[destIndex].requests];
        newRequests.splice(destination.index, 0, draggedRequest!);
        newAllocations[destIndex] = {
          ...newAllocations[destIndex],
          requests: newRequests
        };
      }
    }

    // Recalculate metrics for affected vehicles
    newAllocations.forEach((allocation, index) => {
      newAllocations[index] = calculateAllocationMetrics(allocation.vehicleId, allocation.requests);
    });

    setAllocations(newAllocations);
    setHasUnsavedChanges(true);
    onAllocationChange?.(newAllocations);

    // Show toast for capacity warnings
    const affectedAllocation = newAllocations.find(alloc => alloc.vehicleId === destination.droppableId);
    if (affectedAllocation?.isOverCapacity) {
      toast({
        title: "Atenção: Capacidade Excedida",
        description: `O veículo ${affectedAllocation.vehicleId} está acima da capacidade!`,
        variant: "destructive"
      });
    }
  };

  // Handle drag start
  const handleDragStart = (result: any) => {
    setDraggedItem(result.draggableId);
  };

  // Handle drag update
  const handleDragUpdate = (result: any) => {
    setDragOverVehicle(result.destination?.droppableId || null);
  };

  // Filter pending requests
  const filteredRequests = pendingRequests.filter(request => {
    const matchesSearch = request.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.cliente?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || request.tipo === typeFilter;
    const matchesPriority = priorityFilter === 'all' || request.prioridade === priorityFilter;

    return matchesSearch && matchesType && matchesPriority;
  });

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get type color
  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'Direta': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Coleta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Transferência': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get capacity color
  const getCapacityColor = (utilization: number, isOverCapacity: boolean) => {
    if (isOverCapacity) return 'bg-red-500';
    if (utilization > 90) return 'bg-yellow-500';
    if (utilization > 70) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Save allocations
  const handleSaveAllocations = () => {
    setLastSavedState([...allocations]);
    setHasUnsavedChanges(false);
    onSaveAllocations?.(allocations);
    toast({
      title: "Alocações Salvas",
      description: "As alocações foram salvas com sucesso!",
    });
  };

  // Undo changes
  const handleUndoChanges = () => {
    setAllocations([...lastSavedState]);
    setHasUnsavedChanges(false);
    toast({
      title: "Alterações Revertidas",
      description: "As alterações foram desfeitas.",
    });
  };

  // Remove request from vehicle
  const handleRemoveRequest = (vehicleId: string, requestId: string) => {
    const allocation = allocations.find(alloc => alloc.vehicleId === vehicleId);
    const request = allocation?.requests.find(req => req.id === requestId);
    
    if (!request) return;

    // Add back to pending
    setPendingRequests(prev => [...prev, request]);

    // Remove from vehicle
    const newAllocations = allocations.map(alloc => {
      if (alloc.vehicleId === vehicleId) {
        const newRequests = alloc.requests.filter(req => req.id !== requestId);
        return calculateAllocationMetrics(vehicleId, newRequests);
      }
      return alloc;
    });

    setAllocations(newAllocations);
    setHasUnsavedChanges(true);
    onAllocationChange?.(newAllocations);
  };

  // Auto-allocate based on capacity and priority
  const handleAutoAllocate = () => {
    const sortedRequests = [...pendingRequests].sort((a, b) => {
      const priorityWeight = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
      return priorityWeight[b.prioridade] - priorityWeight[a.prioridade];
    });

    const newAllocations = [...allocations];
    const remainingRequests: LoadingRequest[] = [];

    sortedRequests.forEach(request => {
      let allocated = false;
      
      // Try to allocate to best fitting vehicle
      for (const allocation of newAllocations) {
        const vehicle = vehicles.find(v => v.id === allocation.vehicleId);
        if (!vehicle) continue;

        const testRequests = [...allocation.requests, request];
        const testMetrics = calculateAllocationMetrics(allocation.vehicleId, testRequests);

        if (!testMetrics.isOverCapacity) {
          allocation.requests = testRequests;
          allocation.totalWeight = testMetrics.totalWeight;
          allocation.totalVolume = testMetrics.totalVolume;
          allocation.utilizacaoPeso = testMetrics.utilizacaoPeso;
          allocation.utilizacaoVolume = testMetrics.utilizacaoVolume;
          allocation.isOverCapacity = testMetrics.isOverCapacity;
          allocation.warnings = testMetrics.warnings;
          allocated = true;
          break;
        }
      }

      if (!allocated) {
        remainingRequests.push(request);
      }
    });

    setPendingRequests(remainingRequests);
    setAllocations(newAllocations);
    setHasUnsavedChanges(true);
    onAllocationChange?.(newAllocations);

    toast({
      title: "Alocação Automática Concluída",
      description: `${sortedRequests.length - remainingRequests.length} solicitações foram alocadas automaticamente.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Alocação de Veículos</h2>
          <p className="text-gray-600">Arraste as solicitações para os veículos disponíveis</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleAutoAllocate}
            disabled={pendingRequests.length === 0}
          >
            <Target className="w-4 h-4 mr-2" />
            Alocação Automática
          </Button>
          
          {hasUnsavedChanges && (
            <>
              <Button variant="outline" onClick={handleUndoChanges}>
                <Undo2 className="w-4 h-4 mr-2" />
                Desfazer
              </Button>
              <Button onClick={handleSaveAllocations}>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alocações
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar solicitações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="Direta">Direta</SelectItem>
                <SelectItem value="Coleta">Coleta</SelectItem>
                <SelectItem value="Transferência">Transferência</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas Prioridades</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Média">Média</SelectItem>
                <SelectItem value="Baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              {filteredRequests.length} solicitações pendentes
            </div>
          </div>
        </CardContent>
      </Card>

      <DragDropContext
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
        onDragUpdate={handleDragUpdate}
      >
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Pending Requests */}
          <div className="xl:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Solicitações Pendentes
                  <Badge variant="secondary">{filteredRequests.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="pending">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[600px] space-y-3 p-2 rounded-lg border-2 border-dashed transition-colors ${
                        snapshot.isDraggingOver
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      {filteredRequests.map((request, index) => (
                        <Draggable key={request.id} draggableId={request.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 bg-white border rounded-lg shadow-sm cursor-move transition-all ${
                                snapshot.isDragging
                                  ? 'shadow-lg rotate-2 scale-105'
                                  : 'hover:shadow-md'
                              } ${
                                draggedItem === request.id
                                  ? 'opacity-50'
                                  : ''
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                  <span className="font-medium text-sm">{request.numero}</span>
                                  <div className="flex gap-1">
                                    <Badge className={`${getPriorityColor(request.prioridade)} text-xs`}>
                                      {request.prioridade}
                                    </Badge>
                                    <Badge className={`${getTypeColor(request.tipo)} text-xs`}>
                                      {request.tipo}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="text-xs text-gray-600">
                                  <div className="flex items-center gap-1 mb-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{request.origem} → {request.destino}</span>
                                  </div>
                                  <div className="flex items-center gap-1 mb-1">
                                    <User className="w-3 h-3" />
                                    <span>{request.cliente}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="flex items-center gap-1">
                                      <Weight className="w-3 h-3" />
                                      {request.pesoTotal}kg
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Box className="w-3 h-3" />
                                      {request.volumeTotal}m³
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(request.dataColeta).toLocaleDateString('pt-BR')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {filteredRequests.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Nenhuma solicitação pendente</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>

          {/* Vehicle Allocations */}
          <div className="xl:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => {
                const allocation = allocations.find(alloc => alloc.vehicleId === vehicle.id) || {
                  vehicleId: vehicle.id,
                  requests: [],
                  totalWeight: 0,
                  totalVolume: 0,
                  utilizacaoPeso: 0,
                  utilizacaoVolume: 0,
                  isOverCapacity: false,
                  warnings: []
                };

                return (
                  <Card 
                    key={vehicle.id} 
                    className={`transition-all ${
                      allocation.isOverCapacity 
                        ? 'border-red-300 bg-red-50' 
                        : dragOverVehicle === vehicle.id
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Truck className="w-5 h-5" />
                            {vehicle.placa}
                          </CardTitle>
                          <p className="text-sm text-gray-600">{vehicle.modelo}</p>
                          <p className="text-xs text-gray-500">{vehicle.motorista}</p>
                        </div>
                        <Badge className={`${
                          vehicle.status === 'disponivel' 
                            ? 'bg-green-100 text-green-800' 
                            : vehicle.status === 'ocupado'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {vehicle.status === 'disponivel' ? 'Disponível' : 
                           vehicle.status === 'ocupado' ? 'Ocupado' : 'Manutenção'}
                        </Badge>
                      </div>

                      {/* Capacity Indicators */}
                      <div className="space-y-2 mt-3">
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Peso: {allocation.totalWeight}kg / {vehicle.capacidadePeso}kg</span>
                            <span>{allocation.utilizacaoPeso.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={allocation.utilizacaoPeso} 
                            className="h-2"
                            style={{
                              backgroundColor: '#e5e7eb',
                            }}
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Volume: {allocation.totalVolume}m³ / {vehicle.capacidadeVolume}m³</span>
                            <span>{allocation.utilizacaoVolume.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={allocation.utilizacaoVolume} 
                            className="h-2"
                            style={{
                              backgroundColor: '#e5e7eb',
                            }}
                          />
                        </div>
                      </div>

                      {/* Warnings */}
                      {allocation.warnings.length > 0 && (
                        <div className="mt-2">
                          {allocation.warnings.map((warning, index) => (
                            <div key={index} className="flex items-center gap-1 text-xs text-amber-600">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{warning}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardHeader>

                    <CardContent>
                      <Droppable droppableId={vehicle.id}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`min-h-[400px] space-y-2 p-3 rounded-lg border-2 border-dashed transition-colors ${
                              snapshot.isDraggingOver
                                ? 'border-green-400 bg-green-50'
                                : 'border-gray-200'
                            }`}
                          >
                            {allocation.requests.map((request, index) => (
                              <Draggable key={request.id} draggableId={request.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-3 bg-white border rounded-lg shadow-sm cursor-move transition-all ${
                                      snapshot.isDragging
                                        ? 'shadow-lg rotate-1 scale-105'
                                        : 'hover:shadow-md'
                                    }`}
                                  >
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-start">
                                        <span className="font-medium text-sm">{request.numero}</span>
                                        <div className="flex gap-1">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRemoveRequest(vehicle.id, request.id)}
                                            className="h-6 w-6 p-0 hover:bg-red-100"
                                          >
                                            <X className="w-3 h-3 text-red-500" />
                                          </Button>
                                        </div>
                                      </div>
                                      
                                      <div className="text-xs text-gray-600">
                                        <div className="flex items-center gap-1 mb-1">
                                          <MapPin className="w-3 h-3" />
                                          <span className="truncate">{request.origem} → {request.destino}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>{request.pesoTotal}kg</span>
                                          <span>{request.volumeTotal}m³</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            
                            {allocation.requests.length === 0 && (
                              <div className="text-center py-12 text-gray-400">
                                <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Arraste solicitações aqui</p>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>

                      {/* Vehicle Actions */}
                      {allocation.requests.length > 0 && (
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedVehicleForRoute({ vehicle, requests: allocation.requests });
                              setRouteOptimizerOpen(true);
                            }}
                            className="flex-1"
                          >
                            <Route className="w-4 h-4 mr-1" />
                            Otimizar Rota
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onGenerateRoute?.(vehicle.id, allocation.requests)}
                            className="flex-1"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Romaneio
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </DragDropContext>

      {/* Route Optimizer Dialog */}
      <Dialog open={routeOptimizerOpen} onOpenChange={setRouteOptimizerOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Otimização de Rota</DialogTitle>
          </DialogHeader>
          {selectedVehicleForRoute && (
            <RouteOptimizer
              vehicle={selectedVehicleForRoute.vehicle}
              requests={selectedVehicleForRoute.requests}
              onRouteGenerated={(route) => {
                console.log('Rota otimizada gerada:', route);
                onGenerateRoute?.(route.vehicleId, selectedVehicleForRoute.requests);
              }}
              onClose={() => setRouteOptimizerOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedVehicleAllocation;