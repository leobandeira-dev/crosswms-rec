import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Package, 
  Phone, 
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Truck,
  Play,
  Pause,
  Square,
  Route,
  Eye,
  Filter,
  Search,
  Send,
  Camera,
  FileText,
  User,
  Activity,
  Zap,
  Target,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

interface Evento {
  id: string;
  tipo: 'inicio' | 'chegada' | 'entrega' | 'ocorrencia' | 'pausa' | 'retomada';
  timestamp: string;
  descricao: string;
  parada?: string;
  detalhes?: {
    pod?: {
      assinatura?: string;
      foto?: string;
      recebedor?: string;
      documento?: string;
    };
    ocorrencia?: {
      motivo: string;
      observacoes?: string;
      foto?: string;
    };
  };
}

interface Parada {
  id: string;
  sequencia: number;
  endereco: string;
  contato: string;
  telefone: string;
  status: 'pendente' | 'em_andamento' | 'concluida' | 'com_ocorrencia';
  ordens: string[];
  estimativaChegada: string;
  chegadaReal?: string;
  conclusaoReal?: string;
  distanciaProxima: string;
  tempoEstimado: string;
  instrucoesEspeciais?: string;
  nfes: Array<{
    numero: string;
    valor: number;
    peso: number;
    descricao: string;
  }>;
}

interface Rota {
  id: string;
  numero: string;
  motorista: {
    id: string;
    nome: string;
    telefone: string;
    avatar: string;
    avaliacao: number;
    nivelExperiencia: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Expert';
  };
  veiculo: {
    placa: string;
    modelo: string;
    capacidadePeso: number;
    capacidadeVolume: number;
    cor: string;
  };
  status: 'Ofertada' | 'Aceita' | 'Em Trânsito' | 'Pausada' | 'Concluída' | 'Com Ocorrência';
  paradas: Parada[];
  paradasConcluidas: number;
  distanciaTotal: number;
  distanciaPercorrida: number;
  tempoEstimado: string;
  tempoDecorrido: string;
  ganhos: {
    tarifaBase: number;
    bonusDesempenho: number;
    taxaKm: number;
    taxasPlataforma: number;
    valorLiquido: number;
  };
  iniciadaEm?: string;
  localizacaoAtual: {
    lat: number;
    lng: number;
    endereco: string;
    velocidade?: number;
    direcao?: number;
    ultimaAtualizacao: string;
  };
  eventos: Evento[];
  kpis: {
    taxaEntregaNoPrazo: number;
    tempoMedioParada: number;
    ocorrenciasHoje: number;
    avaliacaoClientes: number;
  };
}

function MonitoramentoRotas() {
  const [activeTab, setActiveTab] = useState('mapa');
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [rotaSelecionada, setRotaSelecionada] = useState<string | null>(null);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [showOcorrenciaDialog, setShowOcorrenciaDialog] = useState(false);
  const [mensagemChat, setMensagemChat] = useState('');
  const [busca, setBusca] = useState('');

  // Simulação de atualizações em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Aqui seria a implementação do WebSocket ou Server-Sent Events
      // para receber atualizações em tempo real das localizações e eventos
      console.log('Atualizando localizações em tempo real...');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Mock data com dados mais realistas
  const mockRotas: Rota[] = [
    {
      id: 'RT-001',
      numero: 'Rota SP-001',
      motorista: {
        id: 'MOT-001',
        nome: 'Carlos Oliveira',
        telefone: '(11) 99999-9999',
        avatar: 'CO',
        avaliacao: 4.8,
        nivelExperiencia: 'Expert'
      },
      veiculo: {
        placa: 'ABC-1234',
        modelo: 'Iveco Daily',
        capacidadePeso: 3500,
        capacidadeVolume: 12,
        cor: 'Branco'
      },
      status: 'Em Trânsito',
      paradas: [
        {
          id: 'P-001',
          sequencia: 1,
          endereco: 'Rua das Flores, 123 - Vila Madalena, São Paulo, SP',
          contato: 'João Silva',
          telefone: '(11) 98888-8888',
          status: 'concluida',
          ordens: ['OC-001'],
          estimativaChegada: '09:30',
          chegadaReal: '09:28',
          conclusaoReal: '09:35',
          distanciaProxima: '0 km',
          tempoEstimado: '0 min',
          nfes: [
            { numero: '000001', valor: 1500.00, peso: 25.5, descricao: 'Equipamentos eletrônicos' }
          ]
        },
        {
          id: 'P-002',
          sequencia: 2,
          endereco: 'Av. Paulista, 456 - Bela Vista, São Paulo, SP',
          contato: 'Maria Santos',
          telefone: '(11) 97777-7777',
          status: 'em_andamento',
          ordens: ['OC-002'],
          estimativaChegada: '10:15',
          chegadaReal: '10:12',
          distanciaProxima: '0 km',
          tempoEstimado: '0 min',
          instrucoesEspeciais: 'Entregar apenas para o responsável do setor',
          nfes: [
            { numero: '000002', valor: 2200.00, peso: 35.2, descricao: 'Material de escritório' }
          ]
        },
        {
          id: 'P-003',
          sequencia: 3,
          endereco: 'Rua Augusta, 789 - Consolação, São Paulo, SP',
          contato: 'Pedro Costa',
          telefone: '(11) 96666-6666',
          status: 'pendente',
          ordens: ['OC-003'],
          estimativaChegada: '11:00',
          distanciaProxima: '2.3 km',
          tempoEstimado: '8 min',
          nfes: [
            { numero: '000003', valor: 3500.00, peso: 45.0, descricao: 'Produtos farmacêuticos' }
          ]
        }
      ],
      paradasConcluidas: 1,
      distanciaTotal: 145,
      distanciaPercorrida: 67,
      tempoEstimado: '6h 30min',
      tempoDecorrido: '2h 45min',
      ganhos: {
        tarifaBase: 180.00,
        bonusDesempenho: 25.00,
        taxaKm: 75.00,
        taxasPlataforma: -20.00,
        valorLiquido: 260.00
      },
      iniciadaEm: '08:30',
      localizacaoAtual: {
        lat: -23.5505,
        lng: -46.6333,
        endereco: 'Av. Paulista, 456 - Bela Vista, São Paulo, SP',
        velocidade: 0,
        direcao: 90,
        ultimaAtualizacao: '10:15'
      },
      eventos: [
        {
          id: 'E-001',
          tipo: 'inicio',
          timestamp: '08:30',
          descricao: 'Rota iniciada - Saída do centro de distribuição'
        },
        {
          id: 'E-002',
          tipo: 'chegada',
          timestamp: '09:28',
          descricao: 'Chegou à parada 1',
          parada: 'Rua das Flores, 123'
        },
        {
          id: 'E-003',
          tipo: 'entrega',
          timestamp: '09:35',
          descricao: 'Entrega concluída - POD coletado',
          parada: 'Rua das Flores, 123',
          detalhes: {
            pod: {
              recebedor: 'João Silva',
              documento: '123.456.789-10',
              assinatura: 'assinatura_digital.png',
              foto: 'foto_entrega.jpg'
            }
          }
        },
        {
          id: 'E-004',
          tipo: 'chegada',
          timestamp: '10:12',
          descricao: 'Chegou à parada 2',
          parada: 'Av. Paulista, 456'
        }
      ],
      kpis: {
        taxaEntregaNoPrazo: 96.5,
        tempoMedioParada: 7.2,
        ocorrenciasHoje: 0,
        avaliacaoClientes: 4.8
      }
    },
    {
      id: 'RT-002',
      numero: 'Rota SP-002',
      motorista: {
        id: 'MOT-002',
        nome: 'Ana Silva',
        telefone: '(11) 88888-8888',
        avatar: 'AS',
        avaliacao: 4.6,
        nivelExperiencia: 'Avançado'
      },
      veiculo: {
        placa: 'DEF-5678',
        modelo: 'Mercedes Sprinter',
        capacidadePeso: 5000,
        capacidadeVolume: 18,
        cor: 'Azul'
      },
      status: 'Com Ocorrência',
      paradas: [
        {
          id: 'P-004',
          sequencia: 1,
          endereco: 'Rua Consolação, 800 - Consolação, São Paulo, SP',
          contato: 'Lucas Ferreira',
          telefone: '(11) 95555-5555',
          status: 'com_ocorrencia',
          ordens: ['OC-004'],
          estimativaChegada: '12:00',
          chegadaReal: '12:05',
          distanciaProxima: '0 km',
          tempoEstimado: '0 min',
          nfes: [
            { numero: '000004', valor: 4200.00, peso: 60.0, descricao: 'Móveis de escritório' }
          ]
        }
      ],
      paradasConcluidas: 0,
      distanciaTotal: 230,
      distanciaPercorrida: 156,
      tempoEstimado: '8h 15min',
      tempoDecorrido: '5h 20min',
      ganhos: {
        tarifaBase: 240.00,
        bonusDesempenho: 0.00,
        taxaKm: 115.00,
        taxasPlataforma: -30.00,
        valorLiquido: 325.00
      },
      iniciadaEm: '07:00',
      localizacaoAtual: {
        lat: -23.5506,
        lng: -46.6334,
        endereco: 'Rua Consolação, 800 - Consolação, São Paulo, SP',
        velocidade: 0,
        direcao: 180,
        ultimaAtualizacao: '12:30'
      },
      eventos: [
        {
          id: 'E-005',
          tipo: 'inicio',
          timestamp: '07:00',
          descricao: 'Rota iniciada'
        },
        {
          id: 'E-006',
          tipo: 'chegada',
          timestamp: '12:05',
          descricao: 'Chegou à parada 1',
          parada: 'Rua Consolação, 800'
        },
        {
          id: 'E-007',
          tipo: 'ocorrencia',
          timestamp: '12:30',
          descricao: 'Ocorrência: Destinatário ausente',
          parada: 'Rua Consolação, 800',
          detalhes: {
            ocorrencia: {
              motivo: 'Destinatário Ausente',
              observacoes: 'Tentativa de contato por telefone sem sucesso. Porteiro informou que responsável saiu para almoço.',
              foto: 'foto_fachada.jpg'
            }
          }
        }
      ],
      kpis: {
        taxaEntregaNoPrazo: 92.1,
        tempoMedioParada: 8.5,
        ocorrenciasHoje: 1,
        avaliacaoClientes: 4.6
      }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Trânsito':
        return 'bg-blue-100 text-blue-800';
      case 'Com Ocorrência':
        return 'bg-red-100 text-red-800';
      case 'Pausada':
        return 'bg-yellow-100 text-yellow-800';
      case 'Concluída':
        return 'bg-green-100 text-green-800';
      case 'Aceita':
      case 'Ofertada':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getParadaStatusColor = (status: string) => {
    switch (status) {
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'com_ocorrencia':
        return 'bg-red-100 text-red-800';
      case 'pendente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Em Trânsito':
        return <Navigation className="w-4 h-4" />;
      case 'Com Ocorrência':
        return <AlertTriangle className="w-4 h-4" />;
      case 'Pausada':
        return <Pause className="w-4 h-4" />;
      case 'Concluída':
        return <CheckCircle className="w-4 h-4" />;
      case 'Aceita':
      case 'Ofertada':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const rotasFiltradas = filtroStatus === 'all' 
    ? mockRotas 
    : mockRotas.filter(rota => rota.status === filtroStatus);

  const rotasBuscadas = busca 
    ? rotasFiltradas.filter(rota => 
        rota.numero.toLowerCase().includes(busca.toLowerCase()) ||
        rota.motorista.nome.toLowerCase().includes(busca.toLowerCase()) ||
        rota.veiculo.placa.toLowerCase().includes(busca.toLowerCase())
      )
    : rotasFiltradas;

  const enviarMensagem = (rotaId: string) => {
    if (!mensagemChat.trim()) return;
    
    console.log(`Enviando mensagem para rota ${rotaId}: ${mensagemChat}`);
    // Aqui seria a integração com WebSocket para envio em tempo real
    setMensagemChat('');
    setShowChatDialog(false);
  };

  const resolverOcorrencia = (rotaId: string, instrucao: string) => {
    console.log(`Resolvendo ocorrência da rota ${rotaId}: ${instrucao}`);
    // Aqui seria a integração com a API para envio de instruções
    setShowOcorrenciaDialog(false);
  };

  return (
    <MainLayout title="Monitoramento de Rotas em Tempo Real">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Monitoramento Ativo</h1>
            <p className="text-gray-600 mt-2">Acompanhe todas as rotas em tempo real com visibilidade total</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros Avançados
            </Button>
            <Button>
              <Activity className="w-4 h-4 mr-2" />
              Mapa Geral
            </Button>
          </div>
        </div>

        {/* Métricas em Tempo Real */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Rotas Ativas</p>
                  <p className="text-2xl font-bold">{mockRotas.filter(r => r.status === 'Em Trânsito').length}</p>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <Truck className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Com Ocorrências</p>
                  <p className="text-2xl font-bold text-red-600">{mockRotas.filter(r => r.status === 'Com Ocorrência').length}</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Entregas Hoje</p>
                  <p className="text-2xl font-bold">47</p>
                </div>
                <Package className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa no Prazo</p>
                  <p className="text-2xl font-bold text-green-600">94.2%</p>
                </div>
                <Target className="w-6 h-6 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="mapa">Mapa Interativo</TabsTrigger>
            <TabsTrigger value="lista">Lista de Rotas</TabsTrigger>
            <TabsTrigger value="eventos">Log de Eventos</TabsTrigger>
            <TabsTrigger value="kpis">KPIs Tempo Real</TabsTrigger>
          </TabsList>

          {/* Mapa Tab */}
          <TabsContent value="mapa" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Map Container */}
              <div className="lg:col-span-2">
                <Card className="h-[600px]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Mapa em Tempo Real
                      <div className="flex items-center gap-1 ml-auto">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500">Live</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full">
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 h-full rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200">
                      <div className="text-center text-gray-500">
                        <div className="relative mb-4">
                          <MapPin className="w-16 h-16 mx-auto text-gray-300" />
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                        </div>
                        <p className="text-lg font-medium">Mapa Interativo em Tempo Real</p>
                        <p className="text-sm">Integração com Google Maps ativa</p>
                        <p className="text-xs mt-2 text-blue-600">
                          {mockRotas.length} veículos sendo rastreados
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Route Details Sidebar */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">Rotas Ativas</CardTitle>
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <Input 
                          placeholder="Buscar..." 
                          value={busca}
                          onChange={(e) => setBusca(e.target.value)}
                          className="w-32"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rotasBuscadas.map((rota) => (
                        <div 
                          key={rota.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                            rotaSelecionada === rota.id 
                              ? 'border-blue-500 bg-blue-50 shadow-md' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setRotaSelecionada(rota.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{rota.numero}</span>
                            <Badge className={getStatusColor(rota.status)}>
                              {getStatusIcon(rota.status)}
                              <span className="ml-1">{rota.status}</span>
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{rota.motorista.nome}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              <span>{rota.veiculo.placa}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              <span>{rota.paradasConcluidas}/{rota.paradas.length} paradas</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Atualizado: {rota.localizacaoAtual.ultimaAtualizacao}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Route Details */}
                {rotaSelecionada && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detalhes da Rota</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const rota = mockRotas.find(r => r.id === rotaSelecionada);
                        if (!rota) return null;
                        
                        return (
                          <div className="space-y-4">
                            {/* Motorista Info */}
                            <div>
                              <h4 className="font-medium mb-2">Motorista</h4>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {rota.motorista.avatar}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm">{rota.motorista.nome}</p>
                                  <div className="flex items-center gap-2 text-xs text-gray-600">
                                    <span>⭐ {rota.motorista.avaliacao}</span>
                                    <span>•</span>
                                    <span>{rota.motorista.nivelExperiencia}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Progresso */}
                            <div>
                              <h4 className="font-medium mb-2">Progresso</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Paradas:</span>
                                  <span>{rota.paradasConcluidas}/{rota.paradas.length}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all" 
                                    style={{ width: `${(rota.paradasConcluidas / rota.paradas.length) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-gray-600">Distância:</span>
                                    <span className="ml-1 font-medium">{rota.distanciaPercorrida}/{rota.distanciaTotal} km</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Tempo:</span>
                                    <span className="ml-1 font-medium">{rota.tempoDecorrido}/{rota.tempoEstimado}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Localização Atual */}
                            <div>
                              <h4 className="font-medium mb-2">Localização Atual</h4>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{rota.localizacaoAtual.endereco}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                                      <span>Velocidade: {rota.localizacaoAtual.velocidade || 0} km/h</span>
                                      <span>•</span>
                                      <span>Última atualização: {rota.localizacaoAtual.ultimaAtualizacao}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Próxima Parada */}
                            {rota.paradas.find(p => p.status === 'pendente') && (
                              <div>
                                <h4 className="font-medium mb-2">Próxima Parada</h4>
                                {(() => {
                                  const proximaParada = rota.paradas.find(p => p.status === 'pendente');
                                  return (
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                      <p className="text-sm font-medium">{proximaParada?.endereco}</p>
                                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                                        <span>{proximaParada?.distanciaProxima}</span>
                                        <span>{proximaParada?.tempoEstimado}</span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
                                <DialogTrigger asChild>
                                  <Button size="sm" className="flex-1">
                                    <MessageSquare className="w-3 h-3 mr-1" />
                                    Chat
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Chat com {rota.motorista.nome}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto">
                                      <div className="text-sm text-gray-600">
                                        <p>Sistema: Rota {rota.numero} ativa</p>
                                        <p className="text-xs mt-1">Última atividade: {rota.localizacaoAtual.ultimaAtualizacao}</p>
                                      </div>
                                    </div>
                                    <Textarea
                                      placeholder="Digite sua mensagem..."
                                      value={mensagemChat}
                                      onChange={(e) => setMensagemChat(e.target.value)}
                                      rows={3}
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline" onClick={() => setShowChatDialog(false)}>
                                        Cancelar
                                      </Button>
                                      <Button onClick={() => enviarMensagem(rota.id)}>
                                        <Send className="w-4 h-4 mr-2" />
                                        Enviar
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Button size="sm" variant="outline" className="flex-1">
                                <Phone className="w-3 h-3 mr-1" />
                                Ligar
                              </Button>
                            </div>

                            {/* Ganhos */}
                            <div>
                              <h4 className="font-medium mb-2">Ganhos da Rota</h4>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span>Tarifa Base:</span>
                                    <span>R$ {rota.ganhos.tarifaBase.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Bônus Performance:</span>
                                    <span>R$ {rota.ganhos.bonusDesempenho.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Taxa por KM:</span>
                                    <span>R$ {rota.ganhos.taxaKm.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between text-red-600">
                                    <span>Taxas Plataforma:</span>
                                    <span>R$ {rota.ganhos.taxasPlataforma.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between font-bold border-t pt-1">
                                    <span>Valor Líquido:</span>
                                    <span>R$ {rota.ganhos.valorLiquido.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Lista Tab */}
          <TabsContent value="lista" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-500" />
                    <Input 
                      placeholder="Buscar por motorista, placa ou rota..." 
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="w-80"
                    />
                  </div>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="Em Trânsito">Em Trânsito</SelectItem>
                      <SelectItem value="Com Ocorrência">Com Ocorrência</SelectItem>
                      <SelectItem value="Pausada">Pausada</SelectItem>
                      <SelectItem value="Concluída">Concluída</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Routes List */}
            <div className="grid gap-4">
              {rotasBuscadas.map((rota) => (
                <Card key={rota.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                      {/* Route Info */}
                      <div className="lg:col-span-3">
                        <div className="flex items-center gap-3 mb-2">
                          <Route className="w-4 h-4 text-blue-500" />
                          <span className="font-semibold">{rota.numero}</span>
                          <Badge className={getStatusColor(rota.status)}>
                            {getStatusIcon(rota.status)}
                            <span className="ml-1">{rota.status}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Truck className="w-3 h-3" />
                            <span>{rota.veiculo.placa} - {rota.veiculo.modelo}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3" />
                            <span>Iniciada às {rota.iniciadaEm}</span>
                          </div>
                        </div>
                      </div>

                      {/* Driver Info */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {rota.motorista.avatar}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{rota.motorista.nome}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <span>⭐ {rota.motorista.avaliacao}</span>
                              <span>•</span>
                              <span>{rota.motorista.nivelExperiencia}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="lg:col-span-3">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progresso:</span>
                            <span className="font-medium">{rota.paradasConcluidas}/{rota.paradas.length} paradas</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all" 
                              style={{ width: `${(rota.paradasConcluidas / rota.paradas.length) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{rota.distanciaPercorrida}/{rota.distanciaTotal} km</span>
                            <span>{rota.tempoDecorrido}/{rota.tempoEstimado}</span>
                          </div>
                        </div>
                      </div>

                      {/* KPIs */}
                      <div className="lg:col-span-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Entrega no Prazo:</span>
                            <span className="ml-1 font-medium text-green-600">{rota.kpis.taxaEntregaNoPrazo}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tempo/Parada:</span>
                            <span className="ml-1 font-medium">{rota.kpis.tempoMedioParada}min</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Ocorrências:</span>
                            <span className={`ml-1 font-medium ${rota.kpis.ocorrenciasHoje > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {rota.kpis.ocorrenciasHoje}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Ganhos:</span>
                            <span className="ml-1 font-medium text-green-600">R$ {rota.ganhos.valorLiquido.toFixed(0)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-2">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                          <Button size="sm">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Chat
                          </Button>
                          {rota.status === 'Com Ocorrência' && (
                            <Dialog open={showOcorrenciaDialog} onOpenChange={setShowOcorrenciaDialog}>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Resolver
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Resolver Ocorrência - {rota.numero}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="bg-red-50 p-3 rounded-lg">
                                    <p className="text-sm font-medium text-red-800">Última Ocorrência:</p>
                                    <p className="text-sm text-red-700">
                                      {rota.eventos.find(e => e.tipo === 'ocorrencia')?.descricao}
                                    </p>
                                  </div>
                                  <div>
                                    <Label>Instruções para o Motorista:</Label>
                                    <Select>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione uma instrução" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="reagendar">Reagendar entrega para amanhã</SelectItem>
                                        <SelectItem value="contatar">Tentar contato telefônico novamente</SelectItem>
                                        <SelectItem value="retornar">Retornar à base com a mercadoria</SelectItem>
                                        <SelectItem value="vizinho">Deixar com vizinho responsável</SelectItem>
                                        <SelectItem value="prosseguir">Prosseguir para próxima parada</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex justify-end gap-2">
                                    <Button variant="outline" onClick={() => setShowOcorrenciaDialog(false)}>
                                      Cancelar
                                    </Button>
                                    <Button onClick={() => resolverOcorrencia(rota.id, 'instrução')}>
                                      <Send className="w-4 h-4 mr-2" />
                                      Enviar Instrução
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Eventos Tab */}
          <TabsContent value="eventos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Log de Eventos em Tempo Real
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Live Feed</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {mockRotas.flatMap(rota => 
                    rota.eventos.map(evento => (
                      <div key={`${rota.id}-${evento.id}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {rota.motorista.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{rota.motorista.nome}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{rota.numero}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{evento.timestamp}</span>
                            <Badge className={`ml-auto ${
                              evento.tipo === 'entrega' ? 'bg-green-100 text-green-800' :
                              evento.tipo === 'ocorrencia' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {evento.tipo}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">{evento.descricao}</p>
                          {evento.parada && (
                            <p className="text-xs text-gray-500 mt-1">{evento.parada}</p>
                          )}
                          {evento.detalhes?.pod && (
                            <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                              <p className="font-medium text-green-800">POD Coletado:</p>
                              <p>Recebedor: {evento.detalhes.pod.recebedor}</p>
                              <p>Documento: {evento.detalhes.pod.documento}</p>
                            </div>
                          )}
                          {evento.detalhes?.ocorrencia && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                              <p className="font-medium text-red-800">Detalhes da Ocorrência:</p>
                              <p>Motivo: {evento.detalhes.ocorrencia.motivo}</p>
                              {evento.detalhes.ocorrencia.observacoes && (
                                <p>Observações: {evento.detalhes.ocorrencia.observacoes}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KPIs Tab */}
          <TabsContent value="kpis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Performance em Tempo Real
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockRotas.map(rota => (
                      <div key={rota.id} className="border-b pb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">{rota.motorista.nome}</span>
                          <Badge className={getStatusColor(rota.status)}>{rota.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Entrega no Prazo:</span>
                            <span className={`ml-2 font-bold ${rota.kpis.taxaEntregaNoPrazo >= 95 ? 'text-green-600' : 'text-orange-600'}`}>
                              {rota.kpis.taxaEntregaNoPrazo}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Tempo/Parada:</span>
                            <span className="ml-2 font-bold">{rota.kpis.tempoMedioParada} min</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Avaliação:</span>
                            <span className="ml-2 font-bold">⭐ {rota.kpis.avaliacaoClientes}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Ocorrências:</span>
                            <span className={`ml-2 font-bold ${rota.kpis.ocorrenciasHoje === 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {rota.kpis.ocorrenciasHoje}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Métricas Operacionais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Taxa Média de Entregas no Prazo</span>
                      <span className="font-bold text-green-600">94.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Tempo Médio por Parada</span>
                      <span className="font-bold">7.85 min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Ocorrências Hoje</span>
                      <span className="font-bold text-red-600">
                        {mockRotas.reduce((sum, rota) => sum + rota.kpis.ocorrenciasHoje, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Avaliação Média Motoristas</span>
                      <span className="font-bold">⭐ 4.7</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Faturamento Diário</span>
                      <span className="font-bold text-green-600">
                        R$ {mockRotas.reduce((sum, rota) => sum + rota.ganhos.valorLiquido, 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default MonitoramentoRotas;