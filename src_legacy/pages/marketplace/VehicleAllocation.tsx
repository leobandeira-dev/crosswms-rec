import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import MainLayout from '@/components/layout/MainLayout';
import { 
  Truck, 
  Package, 
  MapPin, 
  Calendar, 
  Clock, 
  Weight, 
  User,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react';

interface Vehicle {
  id: string;
  plate: string;
  type: string;
  capacity: number;
  driver: string;
  status: 'available' | 'assigned' | 'in_transit' | 'maintenance';
  location: string;
  lastUpdate: Date;
}

interface LoadingOrder {
  id: string;
  orderNumber: string;
  type: 'Direta' | 'Coleta' | 'Armazém';
  origin: string;
  destination: string;
  weight: number;
  volume: number;
  value: number;
  priority: 'high' | 'medium' | 'low';
  scheduledDate: Date;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed';
  assignedVehicle?: string;
  nfeCount: number;
}

// Mock data for demonstration
const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    plate: 'ABC-1234',
    type: 'Caminhão 3/4',
    capacity: 3500,
    driver: 'João Silva',
    status: 'available',
    location: 'Base Principal',
    lastUpdate: new Date()
  },
  {
    id: 'v2',
    plate: 'DEF-5678',
    type: 'Carreta',
    capacity: 25000,
    driver: 'Maria Santos',
    status: 'available',
    location: 'Filial Norte',
    lastUpdate: new Date()
  },
  {
    id: 'v3',
    plate: 'GHI-9012',
    type: 'Van',
    capacity: 1500,
    driver: 'Pedro Costa',
    status: 'available',
    location: 'Base Principal',
    lastUpdate: new Date()
  },
  {
    id: 'v4',
    plate: 'JKL-3456',
    type: 'Bi-trem',
    capacity: 40000,
    driver: 'Ana Lima',
    status: 'in_transit',
    location: 'Em Rota',
    lastUpdate: new Date()
  }
];

const mockOrders: LoadingOrder[] = [
  {
    id: 'o1',
    orderNumber: 'ORD-001',
    type: 'Coleta',
    origin: 'São Paulo - SP',
    destination: 'Rio de Janeiro - RJ',
    weight: 2500,
    volume: 15,
    value: 45000,
    priority: 'high',
    scheduledDate: new Date('2025-06-14'),
    status: 'pending',
    nfeCount: 3
  },
  {
    id: 'o2',
    orderNumber: 'ORD-002',
    type: 'Direta',
    origin: 'Belo Horizonte - MG',
    destination: 'Salvador - BA',
    weight: 1200,
    volume: 8,
    value: 28000,
    priority: 'medium',
    scheduledDate: new Date('2025-06-15'),
    status: 'pending',
    nfeCount: 2
  },
  {
    id: 'o3',
    orderNumber: 'ORD-003',
    type: 'Armazém',
    origin: 'Curitiba - PR',
    destination: 'Porto Alegre - RS',
    weight: 18000,
    volume: 45,
    value: 125000,
    priority: 'high',
    scheduledDate: new Date('2025-06-16'),
    status: 'pending',
    nfeCount: 8
  }
];

const VehicleAllocation: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [orders, setOrders] = useState<LoadingOrder[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Se não há destino, não faz nada
    if (!destination) return;

    // Se é a mesma posição, não faz nada
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Se está movendo de veículos disponíveis para uma ordem
    if (source.droppableId === 'available-vehicles' && destination.droppableId.startsWith('order-')) {
      const orderId = destination.droppableId.replace('order-', '');
      const vehicleId = draggableId;

      // Atualizar ordem com veículo atribuído
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, assignedVehicle: vehicleId, status: 'assigned' as const }
            : order
        )
      );

      // Atualizar status do veículo
      setVehicles(prevVehicles =>
        prevVehicles.map(vehicle =>
          vehicle.id === vehicleId
            ? { ...vehicle, status: 'assigned' as const }
            : vehicle
        )
      );
    }

    // Se está removendo veículo de uma ordem
    if (source.droppableId.startsWith('order-') && destination.droppableId === 'available-vehicles') {
      const orderId = source.droppableId.replace('order-', '');
      const vehicleId = draggableId;

      // Remover veículo da ordem
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, assignedVehicle: undefined, status: 'pending' as const }
            : order
        )
      );

      // Atualizar status do veículo para disponível
      setVehicles(prevVehicles =>
        prevVehicles.map(vehicle =>
          vehicle.id === vehicleId
            ? { ...vehicle, status: 'available' as const }
            : vehicle
        )
      );
    }
  };

  const getAvailableVehicles = () => {
    return vehicles.filter(vehicle => 
      vehicle.status === 'available' &&
      (searchTerm === '' || 
       vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
       vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
       vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getAssignedVehicle = (vehicleId: string | undefined) => {
    if (!vehicleId) return undefined;
    return vehicles.find(v => v.id === vehicleId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-yellow-100 text-yellow-800';
      case 'maintenance': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Alocação de Veículos</h1>
            <p className="text-gray-600">Arraste e solte veículos nas ordens de carregamento</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Ordem
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Painel de Veículos Disponíveis */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Veículos Disponíveis
                </CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar veículo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Droppable droppableId="available-vehicles">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`space-y-3 min-h-[400px] p-2 rounded-lg transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
                      }`}
                    >
                      {getAvailableVehicles().map((vehicle, index) => (
                        <Draggable key={vehicle.id} draggableId={vehicle.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-move ${
                                snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-semibold text-gray-900">{vehicle.plate}</div>
                                <Badge className={getStatusColor(vehicle.status)}>
                                  {vehicle.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 space-y-1">
                                <div className="flex items-center gap-1">
                                  <Truck className="w-3 h-3" />
                                  {vehicle.type}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Weight className="w-3 h-3" />
                                  {vehicle.capacity.toLocaleString()}kg
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {vehicle.driver}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {vehicle.location}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {getAvailableVehicles().length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                          <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Nenhum veículo disponível</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          </div>

          {/* Painel de Ordens de Carregamento */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Ordens de Carregamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-lg">{order.orderNumber}</div>
                          <Badge variant="outline">{order.type}</Badge>
                          <Badge className={getPriorityColor(order.priority)}>
                            {order.priority}
                          </Badge>
                          <Badge variant={order.status === 'assigned' ? 'default' : 'secondary'}>
                            {order.status === 'assigned' ? 'Atribuído' : 'Pendente'}
                          </Badge>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {order.scheduledDate.toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <div className="text-gray-500">Origem</div>
                          <div className="font-medium">{order.origin}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Destino</div>
                          <div className="font-medium">{order.destination}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Peso</div>
                          <div className="font-medium">{order.weight.toLocaleString()}kg</div>
                        </div>
                        <div>
                          <div className="text-gray-500">NFes</div>
                          <div className="font-medium">{order.nfeCount} notas</div>
                        </div>
                      </div>

                      {/* Zona de Drop para Veículos */}
                      <Droppable droppableId={`order-${order.id}`}>
                        {(provided, snapshot) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`border-2 border-dashed rounded-lg p-4 min-h-[100px] transition-colors ${
                              snapshot.isDraggingOver 
                                ? 'border-green-400 bg-green-50' 
                                : order.assignedVehicle 
                                  ? 'border-blue-300 bg-blue-50' 
                                  : 'border-gray-300 bg-gray-50'
                            }`}
                          >
                            {order.assignedVehicle ? (
                              <Draggable draggableId={order.assignedVehicle} index={0}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-3 bg-white border rounded-lg shadow-sm cursor-move ${
                                      snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
                                    }`}
                                  >
                                    {(() => {
                                      const vehicle = order.assignedVehicle ? getAssignedVehicle(order.assignedVehicle) : null;
                                      return vehicle ? (
                                        <div>
                                          <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="font-semibold">{vehicle.plate}</span>
                                            <Badge className="bg-blue-100 text-blue-800">Atribuído</Badge>
                                          </div>
                                          <div className="text-sm text-gray-600 grid grid-cols-2 gap-2">
                                            <div>{vehicle.type}</div>
                                            <div>{vehicle.driver}</div>
                                            <div>{vehicle.capacity.toLocaleString()}kg</div>
                                            <div>{vehicle.location}</div>
                                          </div>
                                        </div>
                                      ) : null;
                                    })()}
                                  </div>
                                )}
                              </Draggable>
                            ) : (
                              <div className="text-center text-gray-500 py-6">
                                <Truck className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Arraste um veículo aqui para atribuir</p>
                                <p className="text-xs">Capacidade requerida: ~{order.weight.toLocaleString()}kg</p>
                              </div>
                            )}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </DragDropContext>
      </div>
    </MainLayout>
  );
};

export default VehicleAllocation;