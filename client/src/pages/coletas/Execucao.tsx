import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Navigation, 
  Clock,
  Package,
  Search,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause,
  CheckSquare,
  Truck,
  User,
  Phone,
  Route,
  Camera,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ColetaExecucao {
  id: string;
  numeroNota: string;
  cliente: string;
  endereco: string;
  volumes: number;
  pesoTotal: number;
  veiculo: string;
  motorista: string;
  telefoneMotorista: string;
  horarioInicio: string;
  prazoColeta: string;
  status: 'alocada' | 'em_rota' | 'no_local' | 'coletando' | 'finalizada';
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  observacoes?: string;
  coordenadas?: { lat: number; lng: number };
}

const Execucao: React.FC = () => {
  const { toast } = useToast();
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');

  const coletas: ColetaExecucao[] = [
    {
      id: '1',
      numeroNota: '417536',
      cliente: 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA',
      endereco: 'RUA GUARUJA, 434 - ITAUM - JOINVILLE/SC',
      volumes: 2,
      pesoTotal: 16.2,
      veiculo: 'ABC-1234 - Mercedes Sprinter',
      motorista: 'João Silva',
      telefoneMotorista: '(47) 99999-1234',
      horarioInicio: '2025-06-16T08:00:00',
      prazoColeta: '2025-06-16T14:00:00',
      status: 'em_rota',
      prioridade: 'alta',
      coordenadas: { lat: -26.3044, lng: -48.8464 }
    },
    {
      id: '2',
      numeroNota: '415201',
      cliente: 'METALURGICA DEL REY LTDA',
      endereco: 'AV INDUSTRIAL, 1500 - DISTRITO INDUSTRIAL - SAO LUIS/MA',
      volumes: 5,
      pesoTotal: 45.8,
      veiculo: 'DEF-5678 - Iveco Daily',
      motorista: 'Maria Santos',
      telefoneMotorista: '(47) 99999-5678',
      horarioInicio: '2025-06-16T09:30:00',
      prazoColeta: '2025-06-16T16:00:00',
      status: 'no_local',
      prioridade: 'media',
      coordenadas: { lat: -2.5307, lng: -44.3068 }
    },
    {
      id: '3',
      numeroNota: '418923',
      cliente: 'INDUSTRIA QUIMICA NORDESTE SA',
      endereco: 'RUA PETROQUIMICA, 789 - POLO INDUSTRIAL - RECIFE/PE',
      volumes: 3,
      pesoTotal: 28.5,
      veiculo: 'GHI-9012 - Ford Cargo',
      motorista: 'Carlos Oliveira',
      telefoneMotorista: '(47) 99999-9012',
      horarioInicio: '2025-06-16T07:15:00',
      prazoColeta: '2025-06-16T13:00:00',
      status: 'finalizada',
      prioridade: 'urgente',
      coordenadas: { lat: -8.0476, lng: -34.8770 }
    }
  ];

  const coletasFiltradas = coletas.filter(coleta => {
    const matchFiltro = coleta.cliente.toLowerCase().includes(filtro.toLowerCase()) ||
                       coleta.numeroNota.includes(filtro) ||
                       coleta.motorista.toLowerCase().includes(filtro.toLowerCase());
    const matchStatus = statusFiltro === 'todos' || coleta.status === statusFiltro;
    return matchFiltro && matchStatus;
  });

  const handleIniciarColeta = (id: string) => {
    toast({
      title: "Coleta Iniciada",
      description: "O motorista foi notificado e a coleta está em execução.",
      variant: "default"
    });
  };

  const handleFinalizarColeta = (id: string) => {
    toast({
      title: "Coleta Finalizada",
      description: "Coleta concluída com sucesso. Aguardando confirmação de recebimento.",
      variant: "default"
    });
  };

  const handleContatarMotorista = (telefone: string) => {
    window.open(`tel:${telefone}`, '_self');
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Urgente</Badge>;
      case 'alta':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Alta</Badge>;
      case 'media':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Média</Badge>;
      case 'baixa':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Baixa</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'alocada':
        return <Badge className="bg-blue-100 text-blue-800">Alocada</Badge>;
      case 'em_rota':
        return <Badge className="bg-yellow-100 text-yellow-800">Em Rota</Badge>;
      case 'no_local':
        return <Badge className="bg-orange-100 text-orange-800">No Local</Badge>;
      case 'coletando':
        return <Badge className="bg-purple-100 text-purple-800">Coletando</Badge>;
      case 'finalizada':
        return <Badge className="bg-green-100 text-green-800">Finalizada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'alocada':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'em_rota':
        return <Navigation className="h-4 w-4 text-yellow-600" />;
      case 'no_local':
        return <MapPin className="h-4 w-4 text-orange-600" />;
      case 'coletando':
        return <Package className="h-4 w-4 text-purple-600" />;
      case 'finalizada':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const isAtrasado = (prazo: string) => {
    return new Date() > new Date(prazo);
  };

  const estatisticasStatus = {
    alocada: coletasFiltradas.filter(c => c.status === 'alocada').length,
    em_rota: coletasFiltradas.filter(c => c.status === 'em_rota').length,
    no_local: coletasFiltradas.filter(c => c.status === 'no_local').length,
    coletando: coletasFiltradas.filter(c => c.status === 'coletando').length,
    finalizada: coletasFiltradas.filter(c => c.status === 'finalizada').length
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-heading mb-2">Execução de Coletas</h1>
          <p className="text-gray-600">
            Acompanhamento em tempo real das coletas em execução
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{estatisticasStatus.alocada}</div>
              <div className="text-sm text-gray-600">Alocadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{estatisticasStatus.em_rota}</div>
              <div className="text-sm text-gray-600">Em Rota</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{estatisticasStatus.no_local}</div>
              <div className="text-sm text-gray-600">No Local</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{estatisticasStatus.coletando}</div>
              <div className="text-sm text-gray-600">Coletando</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{estatisticasStatus.finalizada}</div>
              <div className="text-sm text-gray-600">Finalizadas</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por cliente, nota fiscal ou motorista..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={statusFiltro === 'todos' ? 'default' : 'outline'}
                  onClick={() => setStatusFiltro('todos')}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={statusFiltro === 'em_rota' ? 'default' : 'outline'}
                  onClick={() => setStatusFiltro('em_rota')}
                  size="sm"
                >
                  Em Rota
                </Button>
                <Button
                  variant={statusFiltro === 'no_local' ? 'default' : 'outline'}
                  onClick={() => setStatusFiltro('no_local')}
                  size="sm"
                >
                  No Local
                </Button>
                <Button
                  variant={statusFiltro === 'coletando' ? 'default' : 'outline'}
                  onClick={() => setStatusFiltro('coletando')}
                  size="sm"
                >
                  Coletando
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Coletas */}
        <div className="space-y-4">
          {coletasFiltradas.map((coleta) => (
            <Card key={coleta.id} className={`border-l-4 ${
              coleta.status === 'finalizada' ? 'border-l-green-500' :
              coleta.status === 'coletando' ? 'border-l-purple-500' :
              coleta.status === 'no_local' ? 'border-l-orange-500' :
              coleta.status === 'em_rota' ? 'border-l-yellow-500' :
              'border-l-blue-500'
            }`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      coleta.status === 'finalizada' ? 'bg-green-100' :
                      coleta.status === 'coletando' ? 'bg-purple-100' :
                      coleta.status === 'no_local' ? 'bg-orange-100' :
                      coleta.status === 'em_rota' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      {getStatusIcon(coleta.status)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">NF {coleta.numeroNota}</h3>
                      <p className="text-sm text-gray-600">{coleta.cliente}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    {isAtrasado(coleta.prazoColeta) && coleta.status !== 'finalizada' && (
                      <Badge className="bg-red-100 text-red-800 border-red-300">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Atrasado
                      </Badge>
                    )}
                    {getPrioridadeBadge(coleta.prioridade)}
                    {getStatusBadge(coleta.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                  {/* Dados da Coleta */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Detalhes da Coleta
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span>{coleta.endereco}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-600">Volumes:</span> {coleta.volumes}
                        </div>
                        <div>
                          <span className="text-gray-600">Peso:</span> {coleta.pesoTotal} kg
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-gray-600">Início:</span><br />
                          {formatTime(coleta.horarioInicio)}
                        </div>
                        <div>
                          <span className="text-gray-600">Prazo:</span><br />
                          <span className={isAtrasado(coleta.prazoColeta) ? 'text-red-600 font-medium' : ''}>
                            {formatTime(coleta.prazoColeta)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dados do Motorista e Veículo */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Recursos Alocados
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{coleta.motorista}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{coleta.telefoneMotorista}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-gray-400" />
                        <span>{coleta.veiculo}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {coleta.observacoes && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FileText className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-800 text-sm">Observações:</div>
                        <div className="text-yellow-700 text-sm">{coleta.observacoes}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-3 pt-4 border-t">
                  {coleta.status === 'alocada' && (
                    <Button
                      onClick={() => handleIniciarColeta(coleta.id)}
                      className="flex items-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Iniciar Coleta
                    </Button>
                  )}
                  
                  {(coleta.status === 'no_local' || coleta.status === 'coletando') && (
                    <Button
                      onClick={() => handleFinalizarColeta(coleta.id)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckSquare className="h-4 w-4" />
                      Finalizar Coleta
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => handleContatarMotorista(coleta.telefoneMotorista)}
                    className="flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Contatar Motorista
                  </Button>

                  <Button variant="outline" className="flex items-center gap-2">
                    <Route className="h-4 w-4" />
                    Ver Rota
                  </Button>

                  <Button variant="outline" className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Fotos
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {coletasFiltradas.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MapPin className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma coleta encontrada
              </h3>
              <p className="text-gray-600">
                Não há coletas que correspondam aos filtros aplicados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Execucao;