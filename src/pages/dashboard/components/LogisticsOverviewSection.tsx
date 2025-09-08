import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Truck, 
  Clock, 
  MapPin,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useLocation } from 'wouter';

const LogisticsOverviewSection = () => {
  const [, setLocation] = useLocation();

  const logisticsMetrics = [
    {
      title: 'Capacidade de Armazenagem',
      current: 2840,
      total: 4000,
      percentage: 71,
      status: 'warning',
      icon: Package,
      color: 'bg-amber-500',
      trend: { value: 5, positive: true },
      onClick: () => setLocation('/armazenagem')
    },
    {
      title: 'Frota Disponível',
      current: 18,
      total: 25,
      percentage: 72,
      status: 'success',
      icon: Truck,
      color: 'bg-green-500',
      trend: { value: 2, positive: true },
      onClick: () => setLocation('/motoristas')
    },
    {
      title: 'Tempo Médio de Processamento',
      current: 2.4,
      total: 3.0,
      percentage: 80,
      status: 'success',
      icon: Clock,
      color: 'bg-blue-500',
      trend: { value: 8, positive: true },
      onClick: () => setLocation('/armazenagem/movimentacoes')
    },
    {
      title: 'Rotas Ativas',
      current: 42,
      total: 50,
      percentage: 84,
      status: 'success',
      icon: MapPin,
      color: 'bg-purple-500',
      trend: { value: 12, positive: true },
      onClick: () => setLocation('/motoristas/cargas')
    }
  ];

  const operationalStatus = [
    {
      label: 'Operação Normal',
      count: 156,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      label: 'Atenção Requerida',
      count: 12,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      label: 'Problemas Críticos',
      count: 3,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Logistics Metrics Cards */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral da Operação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {logisticsMetrics.map((metric, index) => {
                const IconComponent = metric.icon;
                return (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={metric.onClick}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-full ${metric.color}`}>
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm font-medium">{metric.title}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {metric.trend.positive ? (
                          <TrendingUp className="h-3 w-3 text-green-600" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-600" />
                        )}
                        <span className={`text-xs ${metric.trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.trend.value}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{metric.current.toLocaleString()}</span>
                        <span className="text-gray-500">{metric.total.toLocaleString()}</span>
                      </div>
                      <Progress value={metric.percentage} className="h-2" />
                      <div className="text-right">
                        <Badge variant={metric.status === 'success' ? 'default' : 'secondary'}>
                          {metric.percentage}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Status */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Status Operacional</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {operationalStatus.map((status, index) => {
                const IconComponent = status.icon;
                return (
                  <div key={index} className={`p-3 rounded-lg ${status.bgColor}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className={`h-4 w-4 ${status.color}`} />
                        <span className="text-sm font-medium">{status.label}</span>
                      </div>
                      <Badge variant="outline" className="font-semibold">
                        {status.count}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <button 
                onClick={() => setLocation('/sac')}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Ver Detalhes do SAC →
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LogisticsOverviewSection;