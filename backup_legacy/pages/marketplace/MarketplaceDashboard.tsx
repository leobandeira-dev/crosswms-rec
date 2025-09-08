import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'wouter';
import { 
  Package, 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Calendar,
  BarChart,
  PieChart,
  Users,
  Plus,
  Eye,
  Play,
  Square,
  Phone,
  MessageCircle,
  Route,
  Target,
  Activity,
  FileText,
  Navigation,
  Layers,
  ArrowRight
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { InteractiveButton } from '@/components/ui/interactive-button';

interface OrdemCarregamento {
  id: string;
  numero: string;
  tipo: 'Direta' | 'Coleta' | 'Transferência';
  status: 'Pendente' | 'Aguardando Roteirização' | 'Atribuída' | 'Em Trânsito' | 'Concluída' | 'Com Ocorrência' | 'Cancelada';
  origem: string;
  destino: string;
  contatoOrigem: string;
  contatoDestino: string;
  nfes: Array<{
    chave: string;
    numero: string;
    valor: number;
    peso: number;
    volume: number;
  }>;
  valorTotal: number;
  pesoTotal: number;
  volumeTotal: number;
  prazoEntrega: string;
  criadoEm: string;
  motorista?: {
    nome: string;
    veiculo: string;
    telefone: string;
  };
}

interface Rota {
  id: string;
  numero: string;
  motorista: {
    nome: string;
    telefone: string;
    veiculo: string;
  };
  status: 'Ofertada' | 'Aceita' | 'Em Trânsito' | 'Concluída' | 'Com Ocorrência';
  ordens: string[];
  paradasTotal: number;
  paradasConcluidas: number;
  kmEstimado: number;
  ganhos: number;
  iniciadaEm?: string;
  localizacaoAtual?: {
    lat: number;
    lng: number;
    endereco: string;
  };
}

function MarketplaceDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [ordensSelecionadas, setOrdensSelecionadas] = useState<string[]>([]);
  const [showRoteirizacao, setShowRoteirizacao] = useState(false);

  // Mock data para demonstração
  const mockOrdens: OrdemCarregamento[] = [
    {
      id: 'OC-001',
      numero: 'OC-2024-001',
      tipo: 'Direta',
      status: 'Pendente',
      origem: 'Av. Paulista, 1000 - São Paulo, SP',
      destino: 'Rua Augusta, 500 - São Paulo, SP',
      contatoOrigem: 'João Silva',
      contatoDestino: 'Maria Santos',
      nfes: [
        { chave: '35240101000001000001551000000001000000001', numero: '000001', valor: 1500.00, peso: 25.5, volume: 0.8 },
        { chave: '35240101000001000001551000000002000000002', numero: '000002', valor: 2200.00, peso: 35.2, volume: 1.2 }
      ],
      valorTotal: 3700.00,
      pesoTotal: 60.7,
      volumeTotal: 2.0,
      prazoEntrega: '2024-06-15 18:00',
      criadoEm: '2024-06-13 08:30'
    },
    {
      id: 'OC-002',
      numero: 'OC-2024-002',
      tipo: 'Coleta',
      status: 'Em Trânsito',
      origem: 'Rua das Flores, 123 - São Paulo, SP',
      destino: 'Av. Brasil, 456 - Rio de Janeiro, RJ',
      contatoOrigem: 'Pedro Costa',
      contatoDestino: 'Ana Lima',
      nfes: [
        { chave: '35240101000001000001551000000003000000003', numero: '000003', valor: 5800.00, peso: 120.0, volume: 4.5 }
      ],
      valorTotal: 5800.00,
      pesoTotal: 120.0,
      volumeTotal: 4.5,
      prazoEntrega: '2024-06-16 12:00',
      criadoEm: '2024-06-12 14:20',
      motorista: {
        nome: 'Carlos Oliveira',
        veiculo: 'Iveco Daily - ABC-1234',
        telefone: '(11) 99999-9999'
      }
    }
  ];

  const mockRotas: Rota[] = [
    {
      id: 'RT-001',
      numero: 'Rota SP-001',
      motorista: {
        nome: 'Carlos Oliveira',
        telefone: '(11) 99999-9999',
        veiculo: 'Iveco Daily - ABC-1234'
      },
      status: 'Em Trânsito',
      ordens: ['OC-002', 'OC-005', 'OC-008'],
      paradasTotal: 8,
      paradasConcluidas: 3,
      kmEstimado: 145,
      ganhos: 280.00,
      iniciadaEm: '08:30',
      localizacaoAtual: {
        lat: -23.5505,
        lng: -46.6333,
        endereco: 'Av. Paulista, 1000 - São Paulo, SP'
      }
    }
  ];

  const kpis = {
    ordensHoje: 24,
    rotasAtivas: 8,
    entregasNoPrazo: 94.2,
    motoristasAtivos: 15,
    motoristaTotal: 23,
    ocorrenciasHoje: 3,
    faturamentoHoje: 12450.00
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Aguardando Roteirização':
        return 'bg-blue-100 text-blue-800';
      case 'Atribuída':
        return 'bg-purple-100 text-purple-800';
      case 'Em Trânsito':
        return 'bg-green-100 text-green-800';
      case 'Concluída':
        return 'bg-gray-100 text-gray-800';
      case 'Com Ocorrência':
        return 'bg-red-100 text-red-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const ordensFiltradas = filtroStatus === 'all' 
    ? mockOrdens 
    : mockOrdens.filter(ordem => ordem.status === filtroStatus);

  const toggleOrdemSelecionada = (ordemId: string) => {
    setOrdensSelecionadas(prev => 
      prev.includes(ordemId) 
        ? prev.filter(id => id !== ordemId)
        : [...prev, ordemId]
    );
  };

  const calcularTotaisSelecao = () => {
    const ordens = mockOrdens.filter(o => ordensSelecionadas.includes(o.id));
    return {
      peso: ordens.reduce((sum, o) => sum + o.pesoTotal, 0),
      volume: ordens.reduce((sum, o) => sum + o.volumeTotal, 0),
      valor: ordens.reduce((sum, o) => sum + o.valorTotal, 0),
      paradas: ordens.length
    };
  };

  const totais = calcularTotaisSelecao();

  return (
    <MainLayout title="Marketplace de Cargas - Dashboard Operacional">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ordens Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">{kpis.ordensHoje}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rotas Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">{kpis.rotasAtivas}</p>
                </div>
                <Truck className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Entregas no Prazo</p>
                  <p className="text-2xl font-bold text-gray-900">{kpis.entregasNoPrazo}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Motoristas Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">{kpis.motoristasAtivos}/{kpis.motoristaTotal}</p>
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <Link to="/marketplace/nova-ordem">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nova Ordem
              </Button>
            </Link>
            <Link to="/marketplace/alocacao-veiculos">
              <Button variant="outline">
                <Truck className="w-4 h-4 mr-2" />
                Alocação de Veículos
              </Button>
            </Link>
            <Dialog open={showRoteirizacao} onOpenChange={setShowRoteirizacao}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={ordensSelecionadas.length === 0}>
                  <Route className="w-4 h-4 mr-2" />
                  Roteirizar ({ordensSelecionadas.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Mesa de Roteirização</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Resumo da Seleção */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Resumo da Seleção</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold text-blue-600">{totais.paradas}</p>
                          <p className="text-sm text-gray-600">Paradas</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-green-600">{totais.peso.toFixed(1)} kg</p>
                          <p className="text-sm text-gray-600">Peso Total</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-purple-600">{totais.volume.toFixed(1)} m³</p>
                          <p className="text-sm text-gray-600">Volume Total</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-orange-600">R$ {totais.valor.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">Valor Total</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sugestão de Motoristas */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Motoristas Sugeridos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                              CO
                            </div>
                            <div>
                              <p className="font-medium">Carlos Oliveira</p>
                              <p className="text-sm text-gray-600">Iveco Daily - Capacidade: 3.5t / 12m³</p>
                              <p className="text-sm text-gray-600">Localização: 2.3 km da origem</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-800">Compatível</Badge>
                            <p className="text-sm text-gray-600 mt-1">Avaliação: 4.8/5</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowRoteirizacao(false)}>
                      Cancelar
                    </Button>
                    <Button>
                      <Navigation className="w-4 h-4 mr-2" />
                      Otimizar Rota
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Link to="/marketplace/monitoramento">
              <Button variant="outline">
                <Activity className="w-4 h-4 mr-2" />
                Monitoramento
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-500" />
              <Input placeholder="Buscar ordens..." className="w-64" />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Aguardando Roteirização">Aguardando Roteirização</SelectItem>
                <SelectItem value="Atribuída">Atribuída</SelectItem>
                <SelectItem value="Em Trânsito">Em Trânsito</SelectItem>
                <SelectItem value="Concluída">Concluída</SelectItem>
                <SelectItem value="Com Ocorrência">Com Ocorrência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="ordens">Ordens de Carregamento</TabsTrigger>
            <TabsTrigger value="rotas">Rotas Ativas</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Ordens por Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Ordens por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Pendente', 'Em Trânsito', 'Concluída', 'Com Ocorrência'].map(status => {
                      const count = mockOrdens.filter(o => o.status === status).length;
                      return (
                        <div key={status} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(status)}>{status}</Badge>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Rotas em Andamento */}
              <Card>
                <CardHeader>
                  <CardTitle>Rotas em Andamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockRotas.map(rota => (
                      <div key={rota.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{rota.numero}</p>
                          <p className="text-sm text-gray-600">{rota.motorista.nome}</p>
                          <p className="text-sm text-gray-600">
                            {rota.paradasConcluidas}/{rota.paradasTotal} paradas
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(rota.status)}>{rota.status}</Badge>
                          <p className="text-sm text-gray-600 mt-1">R$ {rota.ganhos.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas e Ocorrências */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Alertas e Ocorrências Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Atraso na Rota SP-001</p>
                      <p className="text-sm text-gray-600">Motorista Carlos reportou trânsito intenso na Marginal Tietê</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-50 border-l-4 border-red-400 rounded">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium">Destinatário Ausente - OC-2024-005</p>
                      <p className="text-sm text-gray-600">Tentativa de entrega falhada. Aguardando instruções.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ordens Tab */}
          <TabsContent value="ordens" className="space-y-6">
            <div className="space-y-4">
              {ordensFiltradas.map(ordem => (
                <Card key={ordem.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={ordensSelecionadas.includes(ordem.id)}
                          onChange={() => toggleOrdemSelecionada(ordem.id)}
                          className="w-4 h-4"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{ordem.numero}</h3>
                          <p className="text-sm text-gray-600">Criado em {ordem.criadoEm}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(ordem.status)}>{ordem.status}</Badge>
                        <Badge variant="outline">{ordem.tipo}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Origem</p>
                        <p className="text-sm">{ordem.origem}</p>
                        <p className="text-xs text-gray-500">Contato: {ordem.contatoOrigem}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Destino</p>
                        <p className="text-sm">{ordem.destino}</p>
                        <p className="text-xs text-gray-500">Contato: {ordem.contatoDestino}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Valores</p>
                        <p className="text-sm">R$ {ordem.valorTotal.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{ordem.pesoTotal}kg • {ordem.volumeTotal}m³</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Prazo</p>
                        <p className="text-sm">{ordem.prazoEntrega}</p>
                        <p className="text-xs text-gray-500">{ordem.nfes.length} NFe(s)</p>
                      </div>
                    </div>

                    {ordem.motorista && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Truck className="w-4 h-4 text-blue-500" />
                        <div>
                          <p className="font-medium">{ordem.motorista.nome}</p>
                          <p className="text-sm text-gray-600">{ordem.motorista.veiculo}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-auto">
                          <Phone className="w-3 h-3 mr-1" />
                          Ligar
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          Chat
                        </Button>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        Detalhes
                      </Button>
                      {ordem.status === 'Pendente' && (
                        <Button size="sm">
                          <Play className="w-3 h-3 mr-1" />
                          Roteirizar
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Rotas Tab */}
          <TabsContent value="rotas" className="space-y-6">
            <div className="grid gap-4">
              {mockRotas.map(rota => (
                <Card key={rota.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{rota.numero}</h3>
                        <p className="text-sm text-gray-600">Iniciada às {rota.iniciadaEm}</p>
                      </div>
                      <Badge className={getStatusColor(rota.status)}>{rota.status}</Badge>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Motorista</p>
                        <p className="text-sm">{rota.motorista.nome}</p>
                        <p className="text-xs text-gray-500">{rota.motorista.veiculo}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Progresso</p>
                        <p className="text-sm">{rota.paradasConcluidas}/{rota.paradasTotal} paradas</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(rota.paradasConcluidas / rota.paradasTotal) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Estimativas</p>
                        <p className="text-sm">{rota.kmEstimado} km</p>
                        <p className="text-xs text-gray-500">R$ {rota.ganhos.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Localização</p>
                        <p className="text-sm">{rota.localizacaoAtual?.endereco}</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <MapPin className="w-3 h-3 mr-1" />
                        Ver no Mapa
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="w-3 h-3 mr-1" />
                        Contatar
                      </Button>
                      <Button size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        Acompanhar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Diária</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Entregas no Prazo</span>
                      <span className="font-bold text-green-600">{kpis.entregasNoPrazo}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Ocorrências</span>
                      <span className="font-bold text-red-600">{kpis.ocorrenciasHoje}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Faturamento</span>
                      <span className="font-bold text-blue-600">R$ {kpis.faturamentoHoje.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Utilização da Frota</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>Motoristas Ativos</span>
                        <span>{kpis.motoristasAtivos}/{kpis.motoristaTotal}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full" 
                          style={{ width: `${(kpis.motoristasAtivos / kpis.motoristaTotal) * 100}%` }}
                        ></div>
                      </div>
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

export default MarketplaceDashboard;