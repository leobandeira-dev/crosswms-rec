import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  User, 
  MapPin, 
  Clock,
  Fuel,
  AlertTriangle,
  CheckCircle,
  Navigation
} from 'lucide-react';
import { useLocation } from 'wouter';

const FleetManagementSection = () => {
  const [, setLocation] = useLocation();

  const fleetData = {
    totalVehicles: 25,
    activeRoutes: 18,
    availableDrivers: 12,
    maintenanceScheduled: 3,
    fuelEfficiency: 8.2,
    avgDeliveryTime: 2.4
  };

  const activeVehicles = [
    {
      id: 'VEI-001',
      driver: 'João Silva',
      route: 'São Paulo → Campinas',
      status: 'em_transito',
      progress: 65,
      eta: '16:30',
      cargo: 'Eletrônicos - 15 volumes'
    },
    {
      id: 'VEI-007',
      driver: 'Maria Santos',
      route: 'Guarulhos → ABC',
      status: 'carregando',
      progress: 0,
      eta: '18:00',
      cargo: 'Farmacêuticos - 8 volumes'
    },
    {
      id: 'VEI-012',
      driver: 'Carlos Oliveira',
      route: 'Santos → Capital',
      status: 'entregando',
      progress: 90,
      eta: '15:45',
      cargo: 'Industriais - 22 volumes'
    },
    {
      id: 'VEI-018',
      driver: 'Ana Costa',
      route: 'Osasco → Barueri',
      status: 'disponivel',
      progress: 100,
      eta: 'Concluído',
      cargo: 'Disponível para nova rota'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_transito':
        return 'bg-blue-100 text-blue-800';
      case 'carregando':
        return 'bg-amber-100 text-amber-800';
      case 'entregando':
        return 'bg-purple-100 text-purple-800';
      case 'disponivel':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'em_transito':
        return <Navigation className="h-3 w-3" />;
      case 'carregando':
        return <Clock className="h-3 w-3" />;
      case 'entregando':
        return <MapPin className="h-3 w-3" />;
      case 'disponivel':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <AlertTriangle className="h-3 w-3" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Fleet Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Visão Geral da Frota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Truck className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-blue-700">{fleetData.totalVehicles}</div>
                <div className="text-xs text-blue-600">Total Veículos</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Navigation className="h-5 w-5 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-green-700">{fleetData.activeRoutes}</div>
                <div className="text-xs text-green-600">Rotas Ativas</div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Motoristas Disponíveis</span>
                <span className="font-semibold">{fleetData.availableDrivers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Manutenção Agendada</span>
                <span className="font-semibold text-amber-600">{fleetData.maintenanceScheduled}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Eficiência Combustível</span>
                <span className="font-semibold text-green-600">{fleetData.fuelEfficiency} km/l</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tempo Médio Entrega</span>
                <span className="font-semibold">{fleetData.avgDeliveryTime}h</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setLocation('/motoristas')}
            className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Gerenciar Frota →
          </button>
        </CardContent>
      </Card>

      {/* Active Vehicles */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Veículos em Operação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeVehicles.map((vehicle) => (
                <div key={vehicle.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-mono font-semibold text-gray-900">
                        {vehicle.id}
                      </div>
                      <Badge variant="outline" className={getStatusColor(vehicle.status)}>
                        {getStatusIcon(vehicle.status)}
                        <span className="ml-1 capitalize">{vehicle.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500">
                      ETA: {vehicle.eta}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-600">{vehicle.driver}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-sm text-gray-600">{vehicle.route}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    {vehicle.cargo}
                  </div>
                  
                  {vehicle.status !== 'disponivel' && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${vehicle.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setLocation('/motoristas/cargas')}
              className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Ver Todas as Cargas →
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FleetManagementSection;