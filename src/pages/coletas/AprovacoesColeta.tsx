import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, CheckCircle, XCircle, Clock, FileText, MapPin, Weight, Calendar, User, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ViewSelector } from '@/components/common/ViewSelector';
import { ListView } from '@/components/common/ListView';
import { KanbanView } from '@/components/common/KanbanView';
import MainLayout from '../../components/layout/MainLayout';

interface SolicitacaoColeta {
  id: string;
  numero: string;
  tipo: 'Direta' | 'Coleta' | 'Transferência';
  cliente: string;
  origem: string;
  destino: string;
  pesoTotal: number;
  volumeTotal: number;
  dataColeta: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
  status: 'pendente' | 'aprovado' | 'rejeitado';
  observacoes?: string;
  motivoRejeicao?: string;
  dataSubmissao: string;
  dataAprovacao?: string;
  aprovadoPor?: string;
  documentos: Array<{
    id: string;
    tipo: string;
    nome: string;
    url: string;
  }>;
  detalhes: {
    remetente: string;
    destinatario: string;
    valorCarga: number;
    seguro: boolean;
    tipoVeiculo: string;
    urgente: boolean;
  };
}

const AprovacoesColeta = () => {
  // Mock data for demonstration
  const mockSolicitacoesPendentes: SolicitacaoColeta[] = [
    {
      id: '1',
      numero: 'SOL-2025-001',
      tipo: 'Direta',
      cliente: 'ABC Logística',
      origem: 'São Paulo, SP',
      destino: 'Rio de Janeiro, RJ',
      pesoTotal: 2500,
      volumeTotal: 15,
      dataColeta: '2025-06-15',
      prioridade: 'Alta',
      status: 'pendente',
      dataSubmissao: '2025-06-13T08:30:00Z',
      documentos: [
        { id: '1', tipo: 'NFe', nome: 'NFe-12345.xml', url: '#' },
        { id: '2', tipo: 'Foto', nome: 'produto-foto.jpg', url: '#' }
      ],
      detalhes: {
        remetente: 'Empresa ABC Ltda',
        destinatario: 'Cliente XYZ SA',
        valorCarga: 50000,
        seguro: true,
        tipoVeiculo: 'Truck',
        urgente: true
      }
    },
    {
      id: '2',
      numero: 'SOL-2025-002',
      tipo: 'Coleta',
      cliente: 'DEF Transportes',
      origem: 'Campinas, SP',
      destino: 'Guarulhos, SP',
      pesoTotal: 800,
      volumeTotal: 5,
      dataColeta: '2025-06-16',
      prioridade: 'Média',
      status: 'pendente',
      dataSubmissao: '2025-06-13T09:15:00Z',
      documentos: [
        { id: '3', tipo: 'NFe', nome: 'NFe-67890.xml', url: '#' }
      ],
      detalhes: {
        remetente: 'Fornecedor 123',
        destinatario: 'Centro de Distribuição',
        valorCarga: 25000,
        seguro: false,
        tipoVeiculo: 'Van',
        urgente: false
      }
    }
  ];

  const mockHistoricoAprovacoes: SolicitacaoColeta[] = [
    {
      id: '3',
      numero: 'SOL-2025-003',
      tipo: 'Transferência',
      cliente: 'GHI Express',
      origem: 'Santos, SP',
      destino: 'Brasília, DF',
      pesoTotal: 5000,
      volumeTotal: 25,
      dataColeta: '2025-06-14',
      prioridade: 'Alta',
      status: 'aprovado',
      dataSubmissao: '2025-06-12T14:00:00Z',
      dataAprovacao: '2025-06-12T16:30:00Z',
      aprovadoPor: 'Maria Silva',
      documentos: [
        { id: '4', tipo: 'NFe', nome: 'NFe-11111.xml', url: '#' }
      ],
      detalhes: {
        remetente: 'Filial Santos',
        destinatario: 'Filial Brasília',
        valorCarga: 75000,
        seguro: true,
        tipoVeiculo: 'Refrigerado',
        urgente: true
      },
      observacoes: 'Aprovado - transporte refrigerado confirmado'
    }
  ];

  // State management
  const [activeTab, setActiveTab] = useState('pendentes');
  const [currentView, setCurrentView] = useState<'cards' | 'list' | 'kanban'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrioridade, setFilterPrioridade] = useState('all');
  const [filterTipo, setFilterTipo] = useState('all');
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoColeta | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [observacoes, setObservacoes] = useState('');
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [pendentes, setPendentes] = useState<SolicitacaoColeta[]>([]);
  const [historico, setHistorico] = useState<SolicitacaoColeta[]>([]);

  const { toast } = useToast();

  // Initialize with mock data on mount
  useEffect(() => {
    setPendentes(mockSolicitacoesPendentes);
    setHistorico(mockHistoricoAprovacoes);
  }, []);

  // Use local state for demonstration
  const solicitacoesPendentes = pendentes;
  const historicoAprovacoes = historico;
  const loadingPendentes = false;
  const loadingHistorico = false;

  // Approval handlers
  const handleApprove = (id: string, observacoesText?: string) => {
    const solicitacao = pendentes.find(s => s.id === id);
    if (solicitacao) {
      const approved = {
        ...solicitacao,
        status: 'aprovado' as const,
        dataAprovacao: new Date().toISOString(),
        aprovadoPor: 'Gestor CROSSWMS',
        observacoes: observacoesText || 'Aprovado'
      };
      
      setPendentes(prev => prev.filter(s => s.id !== id));
      setHistorico(prev => [approved, ...prev]);
      
      toast({
        title: 'Solicitação aprovada',
        description: `Solicitação ${solicitacao.numero} foi aprovada com sucesso.`,
      });
    }
    
    setIsApproveDialogOpen(false);
    setIsDetailDialogOpen(false);
    setObservacoes('');
  };

  const handleReject = (id: string, motivo: string) => {
    const solicitacao = pendentes.find(s => s.id === id);
    if (solicitacao) {
      const rejected = {
        ...solicitacao,
        status: 'rejeitado' as const,
        dataAprovacao: new Date().toISOString(),
        aprovadoPor: 'Gestor CROSSWMS',
        motivoRejeicao: motivo
      };
      
      setPendentes(prev => prev.filter(s => s.id !== id));
      setHistorico(prev => [rejected, ...prev]);
      
      toast({
        title: 'Solicitação rejeitada',
        description: `Solicitação ${solicitacao.numero} foi rejeitada.`,
        variant: 'destructive'
      });
    }
    
    setIsRejectDialogOpen(false);
    setIsDetailDialogOpen(false);
    setMotivoRejeicao('');
  };

  const openDetailDialog = (solicitacao: SolicitacaoColeta) => {
    setSelectedSolicitacao(solicitacao);
    setIsDetailDialogOpen(true);
  };

  // Wrapper functions for view components
  const handleApproveItem = (item: any) => {
    setSelectedSolicitacao(item);
    setIsApproveDialogOpen(true);
  };

  const handleRejectItem = (item: any) => {
    setSelectedSolicitacao(item);
    setIsRejectDialogOpen(true);
  };

  const SolicitacaoCard = ({ solicitacao }: { solicitacao: SolicitacaoColeta }) => {
    const getBadgeColor = (prioridade: string) => {
      switch (prioridade) {
        case 'Alta': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
        case 'Média': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
        case 'Baixa': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
      }
    };

    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'pendente':
          return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
        case 'aprovado':
          return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
        case 'rejeitado':
          return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"><XCircle className="w-3 h-3 mr-1" />Rejeitado</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    };

    return (
      <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold">{solicitacao.numero}</CardTitle>
              <p className="text-sm text-muted-foreground">{solicitacao.cliente}</p>
            </div>
            <div className="flex gap-2">
              <Badge className={getBadgeColor(solicitacao.prioridade)}>
                {solicitacao.prioridade}
              </Badge>
              {getStatusBadge(solicitacao.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="font-medium">Origem:</span>
              <span>{solicitacao.origem}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-500" />
              <span className="font-medium">Destino:</span>
              <span>{solicitacao.destino}</span>
            </div>
            <div className="flex items-center gap-2">
              <Weight className="w-4 h-4 text-gray-500" />
              <span className="font-medium">Peso:</span>
              <span>{solicitacao.pesoTotal}kg</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span className="font-medium">Coleta:</span>
              <span>{new Date(solicitacao.dataColeta).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => openDetailDialog(solicitacao)}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              Detalhes
            </Button>
            
            {solicitacao.status === 'pendente' && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => {
                    setSelectedSolicitacao(solicitacao);
                    setIsApproveDialogOpen(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => {
                    setSelectedSolicitacao(solicitacao);
                    setIsRejectDialogOpen(true);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Filter functions
  const filterSolicitacoes = (solicitacoes: SolicitacaoColeta[]) => {
    return solicitacoes.filter(solicitacao => {
      const matchesSearch = 
        solicitacao.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        solicitacao.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        solicitacao.origem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        solicitacao.destino.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPrioridade = filterPrioridade === 'all' || solicitacao.prioridade === filterPrioridade;
      const matchesTipo = filterTipo === 'all' || solicitacao.tipo === filterTipo;
      
      return matchesSearch && matchesPrioridade && matchesTipo;
    });
  };

  const filteredPendentes = filterSolicitacoes(solicitacoesPendentes);
  const filteredHistorico = filterSolicitacoes(historicoAprovacoes);

  return (
    <MainLayout title="Aprovações de Coleta">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Aprovações de Coleta</h1>
          <div className="flex items-center gap-4">
          <ViewSelector 
            currentView={currentView} 
            onViewChange={setCurrentView}
            showBackButton={true}
          />
          <div className="flex gap-2">
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="w-4 h-4 mr-2" />
              {filteredPendentes.length} Pendentes
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <CheckCircle className="w-4 h-4 mr-2" />
              {filteredHistorico.length} Processadas
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Número, cliente, origem..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select value={filterPrioridade} onValueChange={setFilterPrioridade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Direta">Direta</SelectItem>
                  <SelectItem value="Coleta">Coleta</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterPrioridade('all');
                  setFilterTipo('all');
                }}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pendentes" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Solicitações Pendentes ({filteredPendentes.length})
          </TabsTrigger>
          <TabsTrigger value="historico" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Histórico de Aprovações ({filteredHistorico.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="space-y-4">
          {loadingPendentes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredPendentes.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Nenhuma solicitação pendente
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Não há solicitações aguardando aprovação no momento.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {currentView === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPendentes.map((solicitacao) => (
                    <SolicitacaoCard key={solicitacao.id} solicitacao={solicitacao} />
                  ))}
                </div>
              )}
              {currentView === 'list' && (
                <ListView 
                  items={filteredPendentes}
                  onViewDetails={openDetailDialog}
                  onApprove={handleApproveItem}
                  onReject={handleRejectItem}
                  showActions={true}
                />
              )}
              {currentView === 'kanban' && (
                <KanbanView 
                  items={filteredPendentes}
                  onViewDetails={openDetailDialog}
                  onApprove={handleApproveItem}
                  onReject={handleRejectItem}
                  showActions={true}
                />
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          {loadingHistorico ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredHistorico.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Nenhum histórico encontrado
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Não há aprovações processadas que correspondam aos filtros aplicados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {currentView === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredHistorico.map((solicitacao) => (
                    <SolicitacaoCard key={solicitacao.id} solicitacao={solicitacao} />
                  ))}
                </div>
              )}
              {currentView === 'list' && (
                <ListView 
                  items={filteredHistorico}
                  onViewDetails={openDetailDialog}
                  showActions={false}
                />
              )}
              {currentView === 'kanban' && (
                <KanbanView 
                  items={filteredHistorico}
                  onViewDetails={openDetailDialog}
                  showActions={false}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Detalhes da Solicitação - {selectedSolicitacao?.numero}
            </DialogTitle>
            <DialogDescription>
              Informações completas da solicitação de coleta
            </DialogDescription>
          </DialogHeader>
          
          {selectedSolicitacao && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Cliente</Label>
                  <p className="text-sm">{selectedSolicitacao.cliente}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <p className="text-sm">{selectedSolicitacao.tipo}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data de Submissão</Label>
                  <p className="text-sm">{new Date(selectedSolicitacao.dataSubmissao).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data de Coleta</Label>
                  <p className="text-sm">{new Date(selectedSolicitacao.dataColeta).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>

              {/* Route Info */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      Origem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedSolicitacao.detalhes.remetente}</p>
                    <p className="text-sm text-muted-foreground">{selectedSolicitacao.origem}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-500" />
                      Destino
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{selectedSolicitacao.detalhes.destinatario}</p>
                    <p className="text-sm text-muted-foreground">{selectedSolicitacao.destino}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Cargo Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Weight className="w-5 h-5" />
                    Detalhes da Carga
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Peso Total</Label>
                      <p className="text-sm">{selectedSolicitacao.pesoTotal}kg</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Volume</Label>
                      <p className="text-sm">{selectedSolicitacao.volumeTotal}m³</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Valor da Carga</Label>
                      <p className="text-sm">R$ {selectedSolicitacao.detalhes.valorCarga.toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Tipo de Veículo</Label>
                      <p className="text-sm">{selectedSolicitacao.detalhes.tipoVeiculo}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Badge variant={selectedSolicitacao.detalhes.seguro ? "default" : "secondary"}>
                        {selectedSolicitacao.detalhes.seguro ? "Com Seguro" : "Sem Seguro"}
                      </Badge>
                    </div>
                    {selectedSolicitacao.detalhes.urgente && (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Urgente
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Documents */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documentos Anexados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedSolicitacao.documentos.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-blue-500" />
                          <div>
                            <p className="font-medium">{doc.nome}</p>
                            <p className="text-sm text-muted-foreground">{doc.tipo}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Approval Info */}
              {selectedSolicitacao.status !== 'pendente' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informações da Aprovação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <p className="text-sm">{selectedSolicitacao.status === 'aprovado' ? 'Aprovado' : 'Rejeitado'}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Aprovado por</Label>
                        <p className="text-sm">{selectedSolicitacao.aprovadoPor}</p>
                      </div>
                      {selectedSolicitacao.dataAprovacao && (
                        <div>
                          <Label className="text-sm font-medium">Data da Aprovação</Label>
                          <p className="text-sm">{new Date(selectedSolicitacao.dataAprovacao).toLocaleString('pt-BR')}</p>
                        </div>
                      )}
                    </div>
                    
                    {selectedSolicitacao.observacoes && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium">Observações</Label>
                        <p className="text-sm mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          {selectedSolicitacao.observacoes}
                        </p>
                      </div>
                    )}
                    
                    {selectedSolicitacao.motivoRejeicao && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium">Motivo da Rejeição</Label>
                        <p className="text-sm mt-1 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          {selectedSolicitacao.motivoRejeicao}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          
          <DialogFooter>
            {selectedSolicitacao?.status === 'pendente' && (
              <>
                <Button 
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    setIsApproveDialogOpen(true);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    setIsRejectDialogOpen(true);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Rejeitar
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Aprovar Solicitação
            </DialogTitle>
            <DialogDescription>
              Você está aprovando a solicitação {selectedSolicitacao?.numero}. 
              Adicione observações se necessário.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações sobre a aprovação..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => selectedSolicitacao && handleApprove(selectedSolicitacao.id, observacoes)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar Aprovação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Rejeitar Solicitação
            </DialogTitle>
            <DialogDescription>
              Você está rejeitando a solicitação {selectedSolicitacao?.numero}. 
              Informe o motivo da rejeição.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="motivo">Motivo da Rejeição *</Label>
              <Textarea
                id="motivo"
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Informe o motivo da rejeição..."
                rows={3}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedSolicitacao && motivoRejeicao.trim() && handleReject(selectedSolicitacao.id, motivoRejeicao)}
              disabled={!motivoRejeicao.trim()}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Confirmar Rejeição
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </MainLayout>
  );
};

export default AprovacoesColeta;