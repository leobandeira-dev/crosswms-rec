import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Route, 
  MapPin, 
  Clock, 
  Truck, 
  Navigation, 
  Zap, 
  TrendingUp,
  Target,
  Calendar,
  AlertTriangle
} from 'lucide-react';

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
  cliente?: string;
}

interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
  motorista: string;
}

interface RouteStep {
  id: string;
  location: string;
  type: 'pickup' | 'delivery';
  requestId: string;
  estimatedTime: string;
  duration: number;
  priority: 'Alta' | 'Média' | 'Baixa';
}

interface OptimizedRoute {
  vehicleId: string;
  steps: RouteStep[];
  totalDistance: number;
  totalDuration: number;
  efficiency: number;
  warnings: string[];
}

interface RouteOptimizerProps {
  vehicle: Vehicle;
  requests: LoadingRequest[];
  onRouteGenerated?: (route: OptimizedRoute) => void;
  onClose?: () => void;
}

const RouteOptimizer: React.FC<RouteOptimizerProps> = ({
  vehicle,
  requests,
  onRouteGenerated,
  onClose
}) => {
  const { toast } = useToast();
  const [optimizedRoute, setOptimizedRoute] = useState<OptimizedRoute | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Generate optimized route
  const generateRoute = async () => {
    setIsOptimizing(true);
    
    try {
      // Simulate route optimization algorithm
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const steps: RouteStep[] = [];
      let totalDuration = 0;
      
      // Sort requests by priority and optimize pickup/delivery sequence
      const sortedRequests = [...requests].sort((a, b) => {
        const priorityWeight = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
        return priorityWeight[b.prioridade] - priorityWeight[a.prioridade];
      });
      
      sortedRequests.forEach((request, index) => {
        // Add pickup step
        const pickupDuration = 30 + (index * 15); // Base time + travel
        steps.push({
          id: `pickup-${request.id}`,
          location: request.origem,
          type: 'pickup',
          requestId: request.id,
          estimatedTime: new Date(Date.now() + totalDuration * 60000).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          duration: pickupDuration,
          priority: request.prioridade
        });
        totalDuration += pickupDuration;
        
        // Add delivery step
        const deliveryDuration = 45 + (index * 10);
        steps.push({
          id: `delivery-${request.id}`,
          location: request.destino,
          type: 'delivery',
          requestId: request.id,
          estimatedTime: new Date(Date.now() + totalDuration * 60000).toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          duration: deliveryDuration,
          priority: request.prioridade
        });
        totalDuration += deliveryDuration;
      });
      
      // Calculate route metrics
      const totalDistance = steps.length * 45; // Approximate distance
      const efficiency = Math.max(60, 100 - (steps.length * 5)); // Efficiency decreases with more stops
      
      const warnings: string[] = [];
      if (steps.length > 8) warnings.push('Rota com muitas paradas');
      if (totalDuration > 480) warnings.push('Jornada superior a 8 horas');
      if (efficiency < 70) warnings.push('Eficiência da rota baixa');
      
      const route: OptimizedRoute = {
        vehicleId: vehicle.id,
        steps,
        totalDistance,
        totalDuration,
        efficiency,
        warnings
      };
      
      setOptimizedRoute(route);
      onRouteGenerated?.(route);
      
      toast({
        title: "Rota Otimizada",
        description: `Rota gerada com ${steps.length} paradas e ${efficiency}% de eficiência`,
      });
      
    } catch (error) {
      toast({
        title: "Erro na Otimização",
        description: "Não foi possível gerar a rota otimizada",
        variant: "destructive"
      });
    } finally {
      setIsOptimizing(false);
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

  const getStepIcon = (type: 'pickup' | 'delivery') => {
    return type === 'pickup' ? 
      <Target className="w-4 h-4 text-blue-600" /> : 
      <MapPin className="w-4 h-4 text-green-600" />;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Route className="w-5 h-5" />
            Otimização de Rota
          </h3>
          <p className="text-gray-600">
            Veículo {vehicle.placa} - {vehicle.motorista}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={generateRoute}
            disabled={isOptimizing || requests.length === 0}
            className="flex items-center gap-2"
          >
            {isOptimizing ? (
              <>
                <Zap className="w-4 h-4 animate-pulse" />
                Otimizando...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                Gerar Rota
              </>
            )}
          </Button>
          
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          )}
        </div>
      </div>

      {/* Route Summary */}
      {optimizedRoute && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Distância Total</p>
                  <p className="text-lg font-semibold">{optimizedRoute.totalDistance} km</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Duração</p>
                  <p className="text-lg font-semibold">{formatDuration(optimizedRoute.totalDuration)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Eficiência</p>
                  <p className="text-lg font-semibold">{optimizedRoute.efficiency}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Paradas</p>
                  <p className="text-lg font-semibold">{optimizedRoute.steps.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Warnings */}
      {optimizedRoute && optimizedRoute.warnings.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800 mb-2">Atenção</p>
                <ul className="space-y-1">
                  {optimizedRoute.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-yellow-700">
                      • {warning}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Steps */}
      {optimizedRoute && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Sequência de Paradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {optimizedRoute.steps.map((step, index) => {
                const request = requests.find(r => r.id === step.requestId);
                return (
                  <div key={step.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                        {index + 1}
                      </div>
                      {index < optimizedRoute.steps.length - 1 && (
                        <div className="w-px h-8 bg-gray-300 mt-2"></div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStepIcon(step.type)}
                        <span className="font-medium">
                          {step.type === 'pickup' ? 'Coleta' : 'Entrega'} - {step.location}
                        </span>
                        <Badge className={getPriorityColor(step.priority)}>
                          {step.priority}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Solicitação: {request?.numero}</p>
                        <p>Cliente: {request?.cliente}</p>
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {step.estimatedTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDuration(step.duration)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {optimizedRoute.steps.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Route className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma parada programada</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!optimizedRoute && !isOptimizing && (
        <Card>
          <CardContent className="p-8 text-center">
            <Navigation className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Pronto para Otimizar
            </h3>
            <p className="text-gray-500 mb-4">
              {requests.length} solicitação(ões) aguardando otimização de rota
            </p>
            <Button onClick={generateRoute} disabled={requests.length === 0}>
              <Route className="w-4 h-4 mr-2" />
              Iniciar Otimização
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RouteOptimizer;