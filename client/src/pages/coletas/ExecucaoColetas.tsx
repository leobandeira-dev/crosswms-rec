import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ViewSelector } from '@/components/common/ViewSelector';
import { ListView } from '@/components/common/ListView';
import { KanbanView } from '@/components/common/KanbanView';
import { 
  MapPin, 
  Clock, 
  Navigation, 
  Phone, 
  AlertTriangle,
  CheckCircle,
  Truck,
  Package,
  User,
  Calendar,
  Route,
  MessageSquare,
  Camera,
  FileText,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

interface ColetaExecucao {
  id: string;
  numero: string;
  motorista: {
    nome: string;
    telefone: string;
    veiculo: string;
    placa: string;
  };
  cliente: {
    nome: string;
    telefone: string;
  };
  origem: {
    endereco: string;
    cidade: string;
    uf: string;
    lat: number;
    lng: number;
  };
  destino: {
    endereco: string;
    cidade: string;
    uf: string;
    lat: number;
    lng: number;
  };
  status: 'em_rota' | 'no_local' | 'carregando' | 'em_transito' | 'entregue' | 'problema';
  dataInicio: string;
  horaInicio: string;
  previsaoChegada: string;
  distanciaPercorrida: number;
  distanciaTotal: number;
  volumes: number;
  pesoTotal: number;
  observacoes?: string;
  ultimaAtualizacao: string;
  localizacaoAtual: {
    lat: number;
    lng: number;
    endereco: string;
  };
  etapas: {
    id: string;
    nome: string;
    status: 'pendente' | 'em_andamento' | 'concluido';
    horaInicio?: string;
    horaConclusao?: string;
  }[];
}

const ExecucaoColetas = () => {
  const { toast } = useToast();
  const [coletas, setColetas] = useState<ColetaExecucao[]>([]);
  const [filteredColetas, setFilteredColetas] = useState<ColetaExecucao[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentView, setCurrentView] = useState<'cards' | 'list' | 'kanban'>('cards');
  const [isLoading, setIsLoading] = useState(true);

  const mockColetas: ColetaExecucao[] = [
    {
      id: 'EXE-001',
      numero: 'COL-2023-001',
      motorista: {
        nome: 'João Silva',
        telefone: '(11) 99999-1111',
        veiculo: 'Iveco Daily',
        placa: 'ABC-1234'
      },
      cliente: {
        nome: 'Empresa ABC Ltda',
        telefone: '(11) 3333-4444'
      },
      origem: {
        endereco: 'Av. Industrial, 456',
        cidade: 'São Paulo',
        uf: 'SP',
        lat: -23.5505,
        lng: -46.6333
      },
      destino: {
        endereco: 'Rua Comercial, 789',
        cidade: 'Rio de Janeiro',
        uf: 'RJ',
        lat: -22.9068,
        lng: -43.1729
      },
      status: 'em_rota',
      dataInicio: '2025-06-13',
      horaInicio: '08:30',
      previsaoChegada: '14:30',
      distanciaPercorrida: 120,
      distanciaTotal: 430,
      volumes: 15,
      pesoTotal: 2500,
      ultimaAtualizacao: '2025-06-13T10:15:00',
      localizacaoAtual: {
        lat: -23.4505,
        lng: -46.5333,
        endereco: 'Rod. Presidente Dutra, km 180'
      },
      etapas: [
        { id: '1', nome: 'Saída do CD', status: 'concluido', horaInicio: '08:30', horaConclusao: '08:45' },
        { id: '2', nome: 'Em rota para coleta', status: 'em_andamento', horaInicio: '08:45' },
        { id: '3', nome: 'Chegada no local', status: 'pendente' },
        { id: '4', nome: 'Carregamento', status: 'pendente' },
        { id: '5', nome: 'Transporte', status: 'pendente' },
        { id: '6', nome: 'Entrega', status: 'pendente' }
      ]
    },
    {
      id: 'EXE-002',
      numero: 'COL-2023-002',
      motorista: {
        nome: 'Maria Santos',
        telefone: '(21) 88888-2222',
        veiculo: 'Mercedes Sprinter',
        placa: 'DEF-5678'
      },
      cliente: {
        nome: 'Transportes Beta Ltda',
        telefone: '(21) 5555-6666'
      },
      origem: {
        endereco: 'Rua da Indústria, 321',
        cidade: 'Belo Horizonte',
        uf: 'MG',
        lat: -19.9191,
        lng: -43.9386
      },
      destino: {
        endereco: 'Av. Central, 654',
        cidade: 'São Paulo',
        uf: 'SP',
        lat: -23.5505,
        lng: -46.6333
      },
      status: 'carregando',
      dataInicio: '2025-06-13',
      horaInicio: '09:00',
      previsaoChegada: '16:00',
      distanciaPercorrida: 580,
      distanciaTotal: 580,
      volumes: 8,
      pesoTotal: 1200,
      ultimaAtualizacao: '2025-06-13T11:30:00',
      localizacaoAtual: {
        lat: -19.9191,
        lng: -43.9386,
        endereco: 'Rua da Indústria, 321 - Belo Horizonte, MG'
      },
      etapas: [
        { id: '1', nome: 'Saída do CD', status: 'concluido', horaInicio: '09:00', horaConclusao: '09:15' },
        { id: '2', nome: 'Em rota para coleta', status: 'concluido', horaInicio: '09:15', horaConclusao: '11:15' },
        { id: '3', nome: 'Chegada no local', status: 'concluido', horaInicio: '11:15', horaConclusao: '11:20' },
        { id: '4', nome: 'Carregamento', status: 'em_andamento', horaInicio: '11:20' },
        { id: '5', nome: 'Transporte', status: 'pendente' },
        { id: '6', nome: 'Entrega', status: 'pendente' }
      ]
    },
    {
      id: 'EXE-003',
      numero: 'COL-2023-003',
      motorista: {
        nome: 'Carlos Oliveira',
        telefone: '(85) 77777-3333',
        veiculo: 'Ford Cargo',
        placa: 'GHI-9012'
      },
      cliente: {
        nome: 'Express Delta Transportes',
        telefone: '(85) 4444-5555'
      },
      origem: {
        endereco: 'Centro de Distribuição, 246',
        cidade: 'Fortaleza',
        uf: 'CE',
        lat: -3.7319,
        lng: -38.5267
      },
      destino: {
        endereco: 'Shopping Center, Loja 15',
        cidade: 'Recife',
        uf: 'PE',
        lat: -8.0476,
        lng: -34.8770
      },
      status: 'problema',
      dataInicio: '2025-06-13',
      horaInicio: '07:00',
      previsaoChegada: '12:00',
      distanciaPercorrida: 400,
      distanciaTotal: 800,
      volumes: 5,
      pesoTotal: 850,
      observacoes: 'Problema mecânico - aguardando guincho',
      ultimaAtualizacao: '2025-06-13T09:45:00',
      localizacaoAtual: {
        lat: -5.2081,
        lng: -37.3249,
        endereco: 'BR-116, km 240 - próximo a Mossoró, RN'
      },
      etapas: [
        { id: '1', nome: 'Saída do CD', status: 'concluido', horaInicio: '07:00', horaConclusao: '07:15' },
        { id: '2', nome: 'Em rota para coleta', status: 'em_andamento', horaInicio: '07:15' },
        { id: '3', nome: 'Chegada no local', status: 'pendente' },
        { id: '4', nome: 'Carregamento', status: 'pendente' },
        { id: '5', nome: 'Transporte', status: 'pendente' },
        { id: '6', nome: 'Entrega', status: 'pendente' }
      ]
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setColetas(mockColetas);
      setFilteredColetas(mockColetas);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = coletas;

    if (searchTerm) {
      filtered = filtered.filter(coleta =>
        coleta.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coleta.motorista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coleta.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(coleta => coleta.status === statusFilter);
    }

    setFilteredColetas(filtered);
  }, [searchTerm, statusFilter, coletas]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'em_rota': { label: 'Em Rota', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'no_local': { label: 'No Local', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      'carregando': { label: 'Carregando', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      'em_transito': { label: 'Em Trânsito', className: 'bg-green-100 text-green-800 border-green-200' },
      'entregue': { label: 'Entregue', className: 'bg-gray-100 text-gray-800 border-gray-200' },
      'problema': { label: 'Problema', className: 'bg-red-100 text-red-800 border-red-200' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.em_rota;
    return (
      <Badge className={`${statusInfo.className} border`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'em_rota': return <Navigation className="w-4 h-4 text-blue-500" />;
      case 'no_local': return <MapPin className="w-4 h-4 text-purple-500" />;
      case 'carregando': return <Package className="w-4 h-4 text-orange-500" />;
      case 'em_transito': return <Truck className="w-4 h-4 text-green-500" />;
      case 'entregue': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case 'problema': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressPercentage = (coleta: ColetaExecucao): number => {
    return Math.round((coleta.distanciaPercorrida / coleta.distanciaTotal) * 100);
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleContactDriver = (coleta: ColetaExecucao) => {
    toast({
      title: "Contatando Motorista",
      description: `Ligando para ${coleta.motorista.nome}...`,
    });
  };

  const handleViewLocation = (coleta: ColetaExecucao) => {
    toast({
      title: "Localização",
      description: `${coleta.localizacaoAtual.endereco}`,
    });
  };

  if (isLoading) {
    return (
      <MainLayout title="Execução de Coletas">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Execução de Coletas">
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Execução de Coletas</h1>
            <p className="text-gray-600 mt-1">Acompanhe o progresso em tempo real das coletas em andamento</p>
          </div>
          
          <div className="flex gap-3">
            <ViewSelector 
              currentView={currentView} 
              onViewChange={setCurrentView}
              showBackButton={true}
            />
            
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Execução</p>
                  <p className="text-2xl font-bold text-blue-600">{coletas.length}</p>
                </div>
                <Truck className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Rota</p>
                  <p className="text-2xl font-bold text-green-600">
                    {coletas.filter(c => c.status === 'em_rota').length}
                  </p>
                </div>
                <Navigation className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Carregando</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {coletas.filter(c => c.status === 'carregando').length}
                  </p>
                </div>
                <Package className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Problemas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {coletas.filter(c => c.status === 'problema').length}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por número, motorista ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="em_rota">Em Rota</SelectItem>
                  <SelectItem value="no_local">No Local</SelectItem>
                  <SelectItem value="carregando">Carregando</SelectItem>
                  <SelectItem value="em_transito">Em Trânsito</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="problema">Problema</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Coletas em Execução com Views */}
        {currentView === 'cards' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredColetas.map((coleta) => (
            <Card key={coleta.id} className="hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(coleta.status)}
                    <div>
                      <CardTitle className="text-lg">{coleta.numero}</CardTitle>
                      <p className="text-sm text-gray-600">{coleta.cliente.nome}</p>
                    </div>
                  </div>
                  {getStatusBadge(coleta.status)}
                </div>

                {/* Progresso da Viagem */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progresso da Rota</span>
                    <span>{getProgressPercentage(coleta)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${getProgressPercentage(coleta)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{coleta.distanciaPercorrida}km</span>
                    <span>{coleta.distanciaTotal}km</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Informações do Motorista */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{coleta.motorista.nome}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>{coleta.motorista.veiculo} - {coleta.motorista.placa}</p>
                    <p>{coleta.motorista.telefone}</p>
                  </div>
                </div>

                {/* Rota */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">
                      {coleta.origem.cidade}/{coleta.origem.uf} → {coleta.destino.cidade}/{coleta.destino.uf}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Navigation className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-600">{coleta.localizacaoAtual.endereco}</span>
                  </div>
                </div>

                {/* Horários */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-600">Início: {coleta.horaInicio}</p>
                      <p className="text-gray-600">Prev.: {coleta.previsaoChegada}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-600">{coleta.volumes} volumes</p>
                      <p className="text-gray-600">{coleta.pesoTotal}kg</p>
                    </div>
                  </div>
                </div>

                {/* Etapas do Processo */}
                <div className="border-t pt-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Etapas do Processo</h4>
                  <div className="space-y-1">
                    {coleta.etapas.map((etapa) => (
                      <div key={etapa.id} className="flex items-center gap-2 text-xs">
                        {etapa.status === 'concluido' && (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                        {etapa.status === 'em_andamento' && (
                          <Clock className="w-3 h-3 text-blue-500 animate-pulse" />
                        )}
                        {etapa.status === 'pendente' && (
                          <div className="w-3 h-3 rounded-full border border-gray-300" />
                        )}
                        <span className={`${
                          etapa.status === 'concluido' ? 'text-green-700' :
                          etapa.status === 'em_andamento' ? 'text-blue-700' :
                          'text-gray-500'
                        }`}>
                          {etapa.nome}
                          {etapa.horaConclusao && ` (${etapa.horaConclusao})`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observações de Problema */}
                {coleta.observacoes && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-3 rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-red-800">Atenção</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">{coleta.observacoes}</p>
                  </div>
                )}

                {/* Última Atualização */}
                <div className="text-xs text-gray-500 border-t pt-2">
                  Última atualização: {formatTime(coleta.ultimaAtualizacao)}
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleContactDriver(coleta)}
                    className="flex-1"
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    Contato
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewLocation(coleta)}
                    className="flex-1"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Localização
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {currentView === 'list' && (
          <ListView 
            items={filteredColetas}
            onViewDetails={(item) => handleViewLocation(item)}
            showActions={true}
          />
        )}

        {currentView === 'kanban' && (
          <KanbanView 
            items={filteredColetas}
            onViewDetails={(item) => handleViewLocation(item)}
            showActions={true}
          />
        )}

        {filteredColetas.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma coleta em execução
              </h3>
              <p className="text-gray-500">
                Não há coletas em execução no momento que correspondam aos filtros aplicados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default ExecucaoColetas;