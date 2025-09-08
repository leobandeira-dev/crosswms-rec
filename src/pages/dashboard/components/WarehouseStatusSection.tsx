import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Archive, 
  Truck, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from 'lucide-react';
import { useLocation } from 'wouter';

const WarehouseStatusSection = () => {
  const [, setLocation] = useLocation();

  const warehouseData = {
    receivedToday: 127,
    shippedToday: 98,
    pendingProcessing: 34,
    totalVolumes: 2847,
    availablePositions: 1153,
    occupancyRate: 71.2
  };

  const recentMovements = [
    {
      id: '001',
      type: 'entrada',
      description: 'Recebimento NF 45821',
      quantity: 15,
      timestamp: '14:32',
      status: 'processado'
    },
    {
      id: '002',
      type: 'saida',
      description: 'Expedição ROM 003',
      quantity: 8,
      timestamp: '14:15',
      status: 'carregando'
    },
    {
      id: '003',
      type: 'entrada',
      description: 'Transferência Interna',
      quantity: 23,
      timestamp: '13:45',
      status: 'pendente'
    },
    {
      id: '004',
      type: 'saida',
      description: 'Entrega Local #892',
      quantity: 12,
      timestamp: '13:20',
      status: 'finalizado'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processado':
      case 'finalizado':
        return 'bg-green-100 text-green-800';
      case 'carregando':
        return 'bg-blue-100 text-blue-800';
      case 'pendente':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Warehouse Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5" />
            Status do Armazém
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <ArrowDownRight className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{warehouseData.receivedToday}</div>
              <div className="text-sm text-green-600">Recebidos Hoje</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <ArrowUpRight className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{warehouseData.shippedToday}</div>
              <div className="text-sm text-blue-600">Expedidos Hoje</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Aguardando Processamento</span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <span className="font-semibold">{warehouseData.pendingProcessing}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total de Volumes</span>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gray-500" />
                <span className="font-semibold">{warehouseData.totalVolumes.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Posições Disponíveis</span>
              <span className="font-semibold text-green-600">{warehouseData.availablePositions.toLocaleString()}</span>
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Taxa de Ocupação</span>
                <Badge variant="secondary">{warehouseData.occupancyRate}%</Badge>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setLocation('/armazenagem')}
            className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver Detalhes do Armazém →
          </button>
        </CardContent>
      </Card>

      {/* Recent Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Movimentações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMovements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {movement.type === 'entrada' ? (
                    <ArrowDownRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-blue-600" />
                  )}
                  <div>
                    <div className="text-sm font-medium">{movement.description}</div>
                    <div className="text-xs text-gray-500">
                      {movement.quantity} volumes • {movement.timestamp}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(movement.status)}>
                  {movement.status}
                </Badge>
              </div>
            ))}
          </div>
          
          <button 
            onClick={() => setLocation('/armazenagem/movimentacoes')}
            className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver Todas as Movimentações →
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WarehouseStatusSection;