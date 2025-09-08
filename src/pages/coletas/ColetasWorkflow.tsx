import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  ClipboardList, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Calendar, 
  Package, 
  Users, 
  Clock,
  ArrowRight,
  FileText,
  Phone,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface ColetaStage {
  id: number;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  route: string;
}

interface ColetaInProgress {
  id: string;
  numero: string;
  cliente: string;
  motorista: string;
  veiculo: string;
  origem: string;
  destino: string;
  volumes: number;
  pesoTotal: number;
  dataColeta: string;
  horaColeta: string;
  status: 'solicitacao' | 'aprovacao' | 'alocacao' | 'execucao';
  prioridade: 'Alta' | 'Média' | 'Baixa';
  observacoes?: string;
}

const ColetasWorkflow = () => {
  const { toast } = useToast();
  const [coletasInProgress, setColetasInProgress] = useState<ColetaInProgress[]>([]);
  const [selectedStage, setSelectedStage] = useState<number>(1);

  const workflowStages: ColetaStage[] = [
    {
      id: 1,
      name: "Solicitação",
      description: "Criação e gerenciamento de solicitações de coleta",
      icon: <ClipboardList className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      route: "/coletas/solicitacoes"
    },
    {
      id: 2,
      name: "Aprovação",
      description: "Validação e aprovação das solicitações pelos clientes",
      icon: <CheckCircle className="w-6 h-6" />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      route: "/coletas/aprovacoes"
    },
    {
      id: 3,
      name: "Alocação",
      description: "Designação de veículos e motoristas para as coletas",
      icon: <Truck className="w-6 h-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      route: "/coletas/alocacao-veiculos"
    },
    {
      id: 4,
      name: "Execução",
      description: "Realização das coletas e acompanhamento em tempo real",
      icon: <MapPin className="w-6 h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      route: "/coletas/execucao"
    }
  ];

  const mockColetasInProgress: ColetaInProgress[] = [
    {
      id: 'COL-001',
      numero: 'COL-001',
      cliente: 'Empresa ABC Ltda',
      motorista: 'João Silva',
      veiculo: 'ABC-1234',
      origem: 'São Paulo - SP',
      destino: 'Rio de Janeiro - RJ',
      volumes: 15,
      pesoTotal: 2500,
      dataColeta: '2025-06-14',
      horaColeta: '14:30',
      status: 'aprovacao',
      prioridade: 'Alta'
    },
    {
      id: 'COL-002',
      numero: 'COL-002',
      cliente: 'Distribuidora XYZ',
      motorista: 'Maria Santos',
      veiculo: 'DEF-5678',
      origem: 'Belo Horizonte - MG',
      destino: 'São Paulo - SP',
      volumes: 8,
      pesoTotal: 1200,
      dataColeta: '2025-06-15',
      horaColeta: '15:15',
      status: 'alocacao',
      prioridade: 'Média'
    },
    {
      id: 'COL-003',
      numero: 'COL-003',
      cliente: 'Indústria 123',
      motorista: 'Carlos Oliveira',
      veiculo: 'GHI-9012',
      origem: 'Rio de Janeiro - RJ',
      destino: 'Salvador - BA',
      volumes: 22,
      pesoTotal: 3800,
      dataColeta: '2025-06-16',
      horaColeta: '16:00',
      status: 'execucao',
      prioridade: 'Baixa'
    }
  ];

  useEffect(() => {
    setColetasInProgress(mockColetasInProgress);
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'solicitacao': { label: 'Solicitação', color: 'bg-blue-100 text-blue-800' },
      'aprovacao': { label: 'Em Aprovação', color: 'bg-orange-100 text-orange-800' },
      'alocacao': { label: 'Alocação', color: 'bg-purple-100 text-purple-800' },
      'execucao': { label: 'Em Execução', color: 'bg-green-100 text-green-800' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.solicitacao;
    return (
      <Badge className={`${statusInfo.color} border-0`}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'Média': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Baixa': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageProgress = (status: string): number => {
    const progressMap = {
      'solicitacao': 25,
      'aprovacao': 50,
      'alocacao': 75,
      'execucao': 100
    };
    return progressMap[status as keyof typeof progressMap] || 0;
  };

  const filteredColetas = selectedStage === 0 
    ? coletasInProgress 
    : coletasInProgress.filter(coleta => {
        const stageMap = {
          1: 'solicitacao',
          2: 'aprovacao', 
          3: 'alocacao',
          4: 'execucao'
        };
        return coleta.status === stageMap[selectedStage as keyof typeof stageMap];
      });

  return (
    <MainLayout title="Sistema de Coletas">
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistema de Coletas</h1>
          <p className="text-gray-600 mb-6">
            Gerencie todas as etapas do processo de coleta de mercadorias
          </p>
        </div>

        {/* Fluxo de Trabalho */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Fluxo de Trabalho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {workflowStages.map((stage, index) => (
                <div key={stage.id} className="relative">
                  <Link href={stage.route}>
                    <Card className={`cursor-pointer transition-all hover:shadow-lg ${stage.bgColor} border-2 hover:border-opacity-50`}>
                      <CardContent className="p-6 text-center">
                        <div className={`${stage.color} mb-4 flex justify-center`}>
                          {stage.icon}
                        </div>
                        <div className="mb-2">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-500">{stage.id}</span>
                            <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600">{stage.description}</p>
                        </div>
                        <Button size="sm" variant="outline" className="mt-3">
                          <span>Acessar</span>
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  {/* Seta conectora */}
                  {index < workflowStages.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Coletas em Andamento */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Coletas em Andamento
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={selectedStage === 0 ? "default" : "outline"}
                  onClick={() => setSelectedStage(0)}
                >
                  Todas ({coletasInProgress.length})
                </Button>
                {workflowStages.map(stage => (
                  <Button
                    key={stage.id}
                    size="sm"
                    variant={selectedStage === stage.id ? "default" : "outline"}
                    onClick={() => setSelectedStage(stage.id)}
                  >
                    {stage.name} ({coletasInProgress.filter(c => {
                      const stageMap = { 1: 'solicitacao', 2: 'aprovacao', 3: 'alocacao', 4: 'execucao' };
                      return c.status === stageMap[stage.id as keyof typeof stageMap];
                    }).length})
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {filteredColetas.map((coleta) => (
                <Card key={coleta.id} className="hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {getStatusBadge(coleta.status)}
                          <span className="text-sm font-medium">{coleta.numero}</span>
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{coleta.cliente}</p>
                      </div>
                      <Badge className={getPriorityColor(coleta.prioridade)}>
                        {coleta.prioridade}
                      </Badge>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progresso</span>
                        <span>{getStageProgress(coleta.status)}%</span>
                      </div>
                      <Progress value={getStageProgress(coleta.status)} className="h-2" />
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{coleta.motorista}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{coleta.veiculo}</span>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{coleta.origem} → {coleta.destino}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{coleta.volumes} volumes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">{coleta.pesoTotal}kg</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {new Date(coleta.dataColeta).toLocaleDateString('pt-BR')} às {coleta.horaColeta}
                      </span>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1">
                        <FileText className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredColetas.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma coleta encontrada
                </h3>
                <p className="text-gray-500 mb-4">
                  {selectedStage === 0 
                    ? "Não há coletas em andamento no momento."
                    : `Não há coletas na etapa "${workflowStages.find(s => s.id === selectedStage)?.name}".`
                  }
                </p>
                <Link href="/coletas/solicitacoes">
                  <Button>
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Nova Solicitação de Coleta
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Coletas</p>
                  <p className="text-2xl font-bold text-gray-900">{coletasInProgress.length}</p>
                </div>
                <ClipboardList className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aguardando Aprovação</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {coletasInProgress.filter(c => c.status === 'aprovacao').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Execução</p>
                  <p className="text-2xl font-bold text-green-600">
                    {coletasInProgress.filter(c => c.status === 'execucao').length}
                  </p>
                </div>
                <Truck className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Volume Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {coletasInProgress.reduce((sum, c) => sum + c.volumes, 0)}
                  </p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ColetasWorkflow;