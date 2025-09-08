import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ArmazenagemNavbar from '@/components/layout/ArmazenagemNavbar';
import { useLocation } from 'wouter';
import { 
  Package, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Info,
  BarChart3,
  FileText,
  Truck,
  Settings,
  ArrowRight,
  Users,
  Calendar,
  Target,
  Plus
} from 'lucide-react';

const Dashboard = () => {
  const [, setLocation] = useLocation();
  // Dados simulados para demonstração
  const metricas = {
    recebidosHoje: { valor: 127, variacao: "+15%", status: "up" },
    expedidosHoje: { valor: 98, variacao: "Meta: 100/dia", status: "warning" },
    aguardando: { valor: 34, variacao: "Para processamento", status: "pending" },
    ocupacao: { valor: "71.2%", variacao: "2.847 volumes", status: "ok" }
  };

  const statusPosicoes = {
    total: 4000,
    ocupadas: 2847,
    disponiveis: 1153,
    bloqueadas: 12
  };

  const performance = {
    tempoMedio: "2.4h",
    produtividade: "125%",
    eficienciaPicking: "97.2%",
    acuracidade: "99.8%"
  };

  const alertas = [
    { tipo: "Crítico", msg: "5 posições com problema de refrigeração", cor: "red" },
    { tipo: "Atenção", msg: "16 volumes aguardando há mais de 24h", cor: "yellow" },
    { tipo: "Info", msg: "Manutenção programada setor C - 16h", cor: "blue" }
  ];

  const fluxoTrabalho = [
    {
      numero: 1,
      titulo: "Ordem",
      descricao: "Criação e gerenciamento de ordens de carregamento",
      icone: Package,
      cor: "bg-blue-500",
      rota: "/armazenagem/carregamento"
    },
    {
      numero: 2,
      titulo: "Conferência",
      descricao: "Verificação e validação dos volumes",
      icone: CheckCircle,
      cor: "bg-orange-500",
      rota: "/armazenagem/conferencia"
    },
    {
      numero: 3,
      titulo: "Endereçamento",
      descricao: "Posicionamento dos volumes no veículo",
      icone: Target,
      cor: "bg-purple-500",
      rota: "/armazenagem/enderecamento"
    },
    {
      numero: 4,
      titulo: "Checklist",
      descricao: "Verificação final e liberação do carregamento",
      icone: FileText,
      cor: "bg-green-500",
      rota: "/armazenagem/checklist"
    }
  ];

  const movimentacoesRecentes = [
    { id: 1, tipo: "Recebimento", item: "NF 417536", hora: "14:30", status: "Concluído" },
    { id: 2, tipo: "Expedição", item: "Ordem #1245", hora: "14:15", status: "Em andamento" },
    { id: 3, tipo: "Transferência", item: "Lote ABC123", hora: "13:45", status: "Concluído" },
    { id: 4, tipo: "Conferência", item: "NF 417533", hora: "13:20", status: "Pendente" }
  ];

  const modulosArmazenagem = [
    { nome: "Recebimento", descricao: "Entrada de mercadorias", icone: Package },
    { nome: "Conferência", descricao: "Validação de volumes", icone: CheckCircle },
    { nome: "Estoque", descricao: "Gestão de posições", icone: BarChart3 },
    { nome: "Expedição", descricao: "Saída de mercadorias", icone: Truck },
    { nome: "Movimentações", descricao: "Transferências internas", icone: ArrowRight },
    { nome: "Relatórios", descricao: "Analytics e insights", icone: FileText }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ArmazenagemNavbar />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Demonstração do Fluxo de Trabalho */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-blue-900 mb-2">Demonstração do Fluxo de Trabalho Macro</h2>
                <p className="text-blue-700 mb-4">Experimente o fluxo completo: Dashboard → Conferência → Endereçamento → Checklist</p>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setLocation('/armazenagem/conferencia')}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Iniciar Demonstração
                  </Button>
                  <Button variant="outline" className="border-blue-300 text-blue-700">
                    Ver Documentação
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">1</div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">2</div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm font-bold">3</div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold">4</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Centro de Distribuição - Métricas */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold">Centro de Distribuição</h2>
            <span className="text-sm text-gray-500">Gestão completa de recebimentos, armazenagem e expedição</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">📈 Recebidos Hoje</p>
                    <p className="text-2xl font-bold text-green-600">{metricas.recebidosHoje.valor}</p>
                    <p className="text-xs text-green-500">{metricas.recebidosHoje.variacao} vs. ontem</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">📤 Expedidos Hoje</p>
                    <p className="text-2xl font-bold text-blue-600">{metricas.expedidosHoje.valor}</p>
                    <p className="text-xs text-blue-500">{metricas.expedidosHoje.variacao}</p>
                  </div>
                  <Truck className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">⏳ Aguardando</p>
                    <p className="text-2xl font-bold text-yellow-600">{metricas.aguardando.valor}</p>
                    <p className="text-xs text-yellow-500">{metricas.aguardando.variacao}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">📊 Ocupação</p>
                    <p className="text-2xl font-bold text-purple-600">{metricas.ocupacao.valor}</p>
                    <p className="text-xs text-purple-500">{metricas.ocupacao.variacao}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Fluxo de Trabalho */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Fluxo de Trabalho</h2>
            <p className="text-gray-600">Gerencie todas as etapas do processo de carregamento de veículos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {fluxoTrabalho.map((etapa, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${etapa.cor} flex items-center justify-center text-white text-xl font-bold`}>
                      {etapa.numero}
                    </div>
                    <etapa.icone className="w-8 h-8 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{etapa.titulo}</h3>
                  <p className="text-gray-600 text-sm mb-4">{etapa.descricao}</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-gray-50"
                  >
                    Acessar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Grid inferior com 3 seções */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status das Posições */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Status das Posições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Posições</span>
                  <span className="font-semibold">{statusPosicoes.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ocupadas</span>
                  <span className="font-semibold text-blue-600">{statusPosicoes.ocupadas.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Disponíveis</span>
                  <span className="font-semibold text-green-600">{statusPosicoes.disponiveis.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bloqueadas</span>
                  <span className="font-semibold text-red-600">{statusPosicoes.bloqueadas}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Operacional */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Performance Operacional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tempo Médio Processamento</span>
                  <Badge variant="outline" className="text-blue-600">{performance.tempoMedio}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Produtividade Hoje</span>
                  <Badge variant="outline" className="text-green-600">{performance.produtividade}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Eficiência Picking</span>
                  <Badge variant="outline" className="text-purple-600">{performance.eficienciaPicking}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Acuracidade</span>
                  <Badge variant="outline" className="text-green-600">{performance.acuracidade}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alertas e Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Alertas e Notificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertas.map((alerta, index) => (
                  <div key={index} className={`p-3 rounded-lg border-l-4 ${
                    alerta.cor === 'red' ? 'border-l-red-500 bg-red-50' :
                    alerta.cor === 'yellow' ? 'border-l-yellow-500 bg-yellow-50' :
                    'border-l-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className={`text-xs ${
                        alerta.cor === 'red' ? 'bg-red-100 text-red-800' :
                        alerta.cor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alerta.tipo}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{alerta.msg}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Grid inferior - Movimentações Recentes e Módulos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Movimentações Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5" />
                Movimentações Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {movimentacoesRecentes.map((mov) => (
                  <div key={mov.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-sm">{mov.tipo}</p>
                        <p className="text-xs text-gray-600">{mov.item}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{mov.hora}</p>
                      <Badge variant="outline" className="text-xs">
                        {mov.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Módulos de Armazenagem */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Módulos de Armazenagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {modulosArmazenagem.map((modulo, index) => (
                  <Button 
                    key={index}
                    variant="ghost" 
                    className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-gray-50"
                  >
                    <modulo.icone className="w-6 h-6 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{modulo.nome}</p>
                      <p className="text-xs text-gray-500">{modulo.descricao}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;