
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { 
  Box, 
  Archive, 
  Truck, 
  Package, 
  MapPin, 
  BarChart3, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Armazenagem: React.FC = () => {
  const [, setLocation] = useLocation();

  const warehouseMetrics = {
    totalVolumes: 2847,
    receivedToday: 127,
    shippedToday: 98,
    pendingProcessing: 34,
    availablePositions: 1153,
    occupancyRate: 71.2,
    avgProcessingTime: 2.4,
    criticalAlerts: 5
  };

  const recentMovements = [
    {
      id: 'MOV-001',
      type: 'Recebimento',
      description: 'NF 45821 - Eletrônicos',
      quantity: 15,
      location: 'Doca A-02',
      timestamp: '14:32',
      status: 'processado',
      operator: 'João Silva'
    },
    {
      id: 'MOV-002',
      type: 'Expedição',
      description: 'ROM 003 - Farmacêuticos',
      quantity: 8,
      location: 'Doca C-01',
      timestamp: '14:15',
      status: 'carregando',
      operator: 'Maria Santos'
    },
    {
      id: 'MOV-003',
      type: 'Transferência',
      description: 'Reorganização Setor B',
      quantity: 23,
      location: 'B-12 → B-20',
      timestamp: '13:45',
      status: 'pendente',
      operator: 'Carlos Oliveira'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processado': return 'bg-green-100 text-green-800';
      case 'carregando': return 'bg-blue-100 text-blue-800';
      case 'pendente': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout title="Armazenagem">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Centro de Distribuição</h2>
        <p className="text-gray-600">Gestão completa de recebimentos, armazenagem e expedição</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation('/armazenagem/recebimento')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center">
                <ArrowDownRight className="mr-2 h-4 w-4 text-green-500" />
                Recebidos Hoje
              </div>
              <TrendingUp className="h-3 w-3 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{warehouseMetrics.receivedToday}</div>
            <p className="text-xs text-muted-foreground mt-1">+15% vs. ontem</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation('/armazenagem/carregamento')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center">
                <ArrowUpRight className="mr-2 h-4 w-4 text-blue-500" />
                Expedidos Hoje
              </div>
              <CheckCircle className="h-3 w-3 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{warehouseMetrics.shippedToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Meta: 120/dia</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation('/armazenagem/movimentacoes')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-amber-500" />
                Aguardando
              </div>
              <AlertTriangle className="h-3 w-3 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{warehouseMetrics.pendingProcessing}</div>
            <p className="text-xs text-muted-foreground mt-1">Para processamento</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center">
                <Package className="mr-2 h-4 w-4 text-purple-500" />
                Ocupação
              </div>
              <BarChart3 className="h-3 w-3 text-purple-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{warehouseMetrics.occupancyRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{warehouseMetrics.totalVolumes.toLocaleString()} volumes</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Button 
          onClick={() => setLocation('/armazenagem/recebimento')}
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <Box className="h-5 w-5" />
          Novo Recebimento
        </Button>
        <Button 
          onClick={() => setLocation('/armazenagem/movimentacoes')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <Archive className="h-5 w-5" />
          Movimentações
        </Button>
        <Button 
          onClick={() => setLocation('/armazenagem/carregamento')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <Truck className="h-5 w-5" />
          Carregamento
        </Button>
        <Button 
          onClick={() => setLocation('/relatorios')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <BarChart3 className="h-5 w-5" />
          Relatórios
        </Button>
      </div>

      {/* Operational Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Status das Posições
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total de Posições</span>
                <span className="font-semibold">4.000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Ocupadas</span>
                <span className="font-semibold text-blue-600">{warehouseMetrics.totalVolumes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Disponíveis</span>
                <span className="font-semibold text-green-600">{warehouseMetrics.availablePositions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Bloqueadas</span>
                <span className="font-semibold text-red-600">12</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Performance Operacional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Tempo Médio Processamento</span>
                <span className="font-semibold text-blue-600">{warehouseMetrics.avgProcessingTime}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Produtividade Hoje</span>
                <span className="font-semibold text-green-600">125%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Eficiência Picking</span>
                <span className="font-semibold text-purple-600">97.2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Acuracidade</span>
                <span className="font-semibold text-green-600">99.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas e Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="p-2 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="text-sm font-medium text-red-800">Crítico</div>
                <div className="text-xs text-red-600">5 posições com problema de refrigeração</div>
              </div>
              <div className="p-2 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                <div className="text-sm font-medium text-amber-800">Atenção</div>
                <div className="text-xs text-amber-600">12 volumes aguardam há mais de 24h</div>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="text-sm font-medium text-blue-800">Info</div>
                <div className="text-xs text-blue-600">Manutenção programada setor C - 16h</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Movimentações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentMovements.map((movement) => (
                <div key={movement.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                     onClick={() => setLocation('/armazenagem/movimentacoes')}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-medium text-sm">{movement.id} - {movement.type}</div>
                      <div className="text-sm text-gray-600">{movement.description}</div>
                    </div>
                    <Badge className={getStatusColor(movement.status)}>
                      {movement.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>{movement.quantity} volumes • {movement.location}</div>
                    <div>Operador: {movement.operator} • {movement.timestamp}</div>
                  </div>
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

        <Card>
          <CardHeader>
            <CardTitle>Módulos de Armazenagem</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button 
              onClick={() => setLocation('/armazenagem/recebimento')}
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Box className="h-6 w-6" />
              <span className="text-xs">Recebimento</span>
            </Button>
            <Button 
              onClick={() => setLocation('/armazenagem/movimentacoes')}
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Archive className="h-6 w-6" />
              <span className="text-xs">Movimentações</span>
            </Button>
            <Button 
              onClick={() => setLocation('/armazenagem/carregamento')}
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Truck className="h-6 w-6" />
              <span className="text-xs">Carregamento</span>
            </Button>
            <Button 
              onClick={() => setLocation('/relatorios')}
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <BarChart3 className="h-6 w-6" />
              <span className="text-xs">Relatórios</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Armazenagem;
