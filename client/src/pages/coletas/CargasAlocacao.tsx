
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '../../components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  Archive, Package2, Truck, CheckCircle, Clock, AlertTriangle,
  MapPin, Calendar, Weight, Ruler, Users, Navigation, MousePointerClick
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { Carga, Motorista, Veiculo, TipoVeiculo } from '@shared/schema';
import { DragDropProvider } from '@/components/ui/drag-drop-context';
import DraggableCargaCard from '@/components/allocation/DraggableCargaCard';
import MotoristaDropZone from '@/components/allocation/MotoristaDropZone';

interface CargaDisplayData extends Carga {
  motoristaInfo?: { nome: string; telefone?: string };
  veiculoInfo?: { placa: string; tipo: string };
}

const CargasAlocacao: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCargas, setSelectedCargas] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('pendentes');

  // API Queries
  const { data: cargasPendentes, isLoading: loadingPendentes } = useQuery({
    queryKey: ['/api/cargas/pendentes'],
    queryFn: () => apiRequest('/api/cargas/pendentes')
  });

  const { data: cargasEmTransito, isLoading: loadingEmTransito } = useQuery({
    queryKey: ['/api/cargas/em-transito'],
    queryFn: () => apiRequest('/api/cargas/em-transito')
  });

  const { data: cargasEntregues, isLoading: loadingEntregues } = useQuery({
    queryKey: ['/api/cargas/entregues'],
    queryFn: () => apiRequest('/api/cargas/entregues')
  });

  const { data: motoristas } = useQuery({
    queryKey: ['/api/motoristas'],
    queryFn: () => apiRequest('/api/motoristas')
  });

  const { data: veiculos } = useQuery({
    queryKey: ['/api/veiculos', 'disponivel=true'],
    queryFn: () => apiRequest('/api/veiculos?disponivel=true')
  });

  const { data: tiposVeiculo } = useQuery({
    queryKey: ['/api/tipos-veiculo'],
    queryFn: () => apiRequest('/api/tipos-veiculo')
  });

  // Mutations
  const alocarCargaMutation = useMutation({
    mutationFn: async ({ cargaId, motoristaId, veiculoId }: { 
      cargaId: string; 
      motoristaId: string; 
      veiculoId: string; 
    }) => {
      return apiRequest(`/api/cargas/${cargaId}/alocar`, {
        method: 'POST',
        body: JSON.stringify({ motoristaId, veiculoId })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cargas/pendentes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cargas/em-transito'] });
      toast({
        title: "Carga alocada com sucesso",
        description: "A carga foi alocada ao motorista."
      });
    },
    onError: () => {
      toast({
        title: "Erro ao alocar carga",
        description: "Não foi possível alocar a carga.",
        variant: "destructive"
      });
    }
  });

  const atualizarStatusMutation = useMutation({
    mutationFn: async ({ cargaId, status }: { cargaId: string; status: string }) => {
      return apiRequest(`/api/cargas/${cargaId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cargas/em-transito'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cargas/entregues'] });
      toast({
        title: "Status atualizado",
        description: "O status da carga foi atualizado com sucesso."
      });
    }
  });

  // Helper functions
  const formatData = (data: string | Date | null) => {
    if (!data) return '-';
    if (typeof data === 'string') return data;
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatVolume = (volume: number | null) => {
    if (!volume) return '0 m³';
    return `${(volume / 1000).toFixed(2)} m³`;
  };

  const formatPeso = (peso: number | null) => {
    if (!peso) return '0 kg';
    return `${peso} kg`;
  };

  const getStatusBadge = (status: string | null) => {
    const statusMap = {
      'pendente': { label: 'Pendente', variant: 'secondary' as const },
      'alocada': { label: 'Alocada', variant: 'default' as const },
      'em_transito': { label: 'Em Trânsito', variant: 'default' as const },
      'entregue': { label: 'Entregue', variant: 'default' as const },
      'problema': { label: 'Problema', variant: 'destructive' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pendente;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  // Drag and drop handler
  const handleDragDrop = (cargaId: string, motoristaId: string, veiculoId: string) => {
    alocarCargaMutation.mutate({
      cargaId,
      motoristaId,
      veiculoId
    });
  };

  const renderCargaCard = (carga: Carga) => (
    <Card key={carga.id} className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            {carga.numero_carga}
          </CardTitle>
          {getStatusBadge(carga.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Origem:</span>
            <span>{carga.origem}</span>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Destino:</span>
            <span>{carga.destino}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Previsão:</span>
            <span>{formatData(carga.data_previsao)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Package2 className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Volumes:</span>
            <span>{carga.volumes || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Weight className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Peso:</span>
            <span>{formatPeso(carga.peso_kg)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Volume:</span>
            <span>{formatVolume(carga.volume_m3)}</span>
          </div>
        </div>
        
        {carga.motorista_alocado_id && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-green-600" />
              <span className="font-medium">Motorista:</span>
              <span>{motoristas?.find(m => m.id === carga.motorista_alocado_id)?.nome || 'N/A'}</span>
            </div>
          </div>
        )}
        
        <div className="mt-4 flex gap-2">
          {carga.status === 'pendente' && (
            <Button 
              size="sm" 
              onClick={() => {
                if (motoristas && veiculos && motoristas.length > 0 && veiculos.length > 0) {
                  alocarCargaMutation.mutate({
                    cargaId: carga.id,
                    motoristaId: motoristas[0].id,
                    veiculoId: veiculos[0].id
                  });
                }
              }}
              disabled={alocarCargaMutation.isPending}
            >
              <Truck className="h-4 w-4 mr-2" />
              Alocar
            </Button>
          )}
          
          {(carga.status === 'alocada' || carga.status === 'em_transito') && (
            <>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => atualizarStatusMutation.mutate({ cargaId: carga.id, status: 'entregue' })}
                disabled={atualizarStatusMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Entregar
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => atualizarStatusMutation.mutate({ cargaId: carga.id, status: 'problema' })}
                disabled={atualizarStatusMutation.isPending}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Problema
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DragDropProvider>
      <MainLayout title="Alocação de Cargas - Interface Arrastar e Soltar">
        <div className="space-y-6">
          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-orange-500" />
                  Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {cargasPendentes?.length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Truck className="mr-2 h-4 w-4 text-blue-500" />
                  Em Trânsito
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {cargasEmTransito?.length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Entregues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {cargasEntregues?.length || 0}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Users className="mr-2 h-4 w-4 text-purple-500" />
                  Motoristas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {motoristas?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <MousePointerClick className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">Interface de Alocação Intuitiva</h3>
                  <p className="text-blue-700 text-sm">
                    Arraste as cargas pendentes e solte sobre os motoristas para alocação automática. 
                    Selecione o veículo desejado antes de soltar a carga.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Left Column - Pending Cargas */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Cargas Pendentes de Alocação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingPendentes ? (
                    <div className="text-center py-8">Carregando cargas pendentes...</div>
                  ) : !cargasPendentes || cargasPendentes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma carga pendente encontrada
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cargasPendentes.map(carga => (
                        <DraggableCargaCard
                          key={carga.id}
                          carga={carga}
                          formatData={formatData}
                          formatVolume={formatVolume}
                          formatPeso={formatPeso}
                          getStatusBadge={getStatusBadge}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Motoristas Drop Zones */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-500" />
                    Motoristas Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!motoristas || motoristas.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhum motorista disponível
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {motoristas.filter((m: any) => m.status === 'ativo').map((motorista: any) => (
                        <MotoristaDropZone
                          key={motorista.id}
                          motorista={motorista}
                          veiculos={veiculos || []}
                          onDrop={handleDragDrop}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Traditional Tabs for Other Views */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full md:w-[300px]">
              <TabsTrigger value="emrota">Em Rota</TabsTrigger>
              <TabsTrigger value="finalizadas">Finalizadas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="emrota" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-500" />
                    Cargas Em Trânsito
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingEmTransito ? (
                    <div className="text-center py-8">Carregando cargas em trânsito...</div>
                  ) : !cargasEmTransito || cargasEmTransito.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma carga em trânsito encontrada
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {cargasEmTransito.map(renderCargaCard)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="finalizadas" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Cargas Finalizadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingEntregues ? (
                    <div className="text-center py-8">Carregando cargas finalizadas...</div>
                  ) : !cargasEntregues || cargasEntregues.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Nenhuma carga finalizada encontrada
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {cargasEntregues.map(renderCargaCard)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </DragDropProvider>
  );
};

export default CargasAlocacao;
