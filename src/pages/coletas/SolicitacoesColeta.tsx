import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import MainLayout from '../../components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ViewSelector } from '@/components/common/ViewSelector';
import { ListView } from '@/components/common/ListView';
import { KanbanView } from '@/components/common/KanbanView';
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  Package, 
  User, 
  Phone, 
  Eye, 
  Edit3,
  Clock,
  CheckCircle,
  AlertCircle,
  Building,
  Hash
} from 'lucide-react';

interface SolicitacaoColeta {
  id: string;
  numero: string;
  cliente: {
    nome: string;
    cnpj: string;
    telefone: string;
    endereco: string;
  };
  remetente: {
    nome: string;
    endereco: string;
    cidade: string;
    uf: string;
  };
  destinatario: {
    nome: string;
    endereco: string;
    cidade: string;
    uf: string;
  };
  dataColeta: string;
  horaColeta: string;
  dataCriacao: string;
  volumes: number;
  pesoTotal: number;
  valorMercadoria: number;
  observacoes?: string;
  notasFiscais: string[];
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'alocada' | 'em_coleta' | 'coletada';
  prioridade: 'Alta' | 'Média' | 'Baixa';
  tipo: 'Direta' | 'Coleta' | 'Transferência';
}

const SolicitacoesColeta = () => {
  const { toast } = useToast();
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoColeta[]>([]);
  const [filteredSolicitacoes, setFilteredSolicitacoes] = useState<SolicitacaoColeta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tipoFilter, setTipoFilter] = useState<string>('all');
  const [prioridadeFilter, setPrioridadeFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'cards' | 'list' | 'kanban'>('cards');

  // Mock data
  const mockSolicitacoes: SolicitacaoColeta[] = [
    {
      id: 'COL-2023-001',
      numero: 'COL-2023-001',
      cliente: {
        nome: 'Empresa ABC Distribuidora Ltda',
        cnpj: '12.345.678/0001-90',
        telefone: '(11) 99999-9999',
        endereco: 'Rua das Flores, 123, Centro'
      },
      remetente: {
        nome: 'Fábrica XYZ',
        endereco: 'Av. Industrial, 456',
        cidade: 'São Paulo',
        uf: 'SP'
      },
      destinatario: {
        nome: 'Distribuidora DEF',
        endereco: 'Rua Comercial, 789',
        cidade: 'Rio de Janeiro',
        uf: 'RJ'
      },
      dataColeta: '2025-06-14',
      horaColeta: '14:30',
      dataCriacao: '2025-06-13',
      volumes: 15,
      pesoTotal: 2500,
      valorMercadoria: 25000,
      notasFiscais: ['NFE-001', 'NFE-002'],
      status: 'pendente',
      prioridade: 'Alta',
      tipo: 'Direta',
      observacoes: 'Carga frágil - cuidado no manuseio'
    },
    {
      id: 'COL-2023-002',
      numero: 'COL-2023-002',
      cliente: {
        nome: 'Transportes Beta Ltda',
        cnpj: '98.765.432/0001-10',
        telefone: '(21) 88888-8888',
        endereco: 'Av. Principal, 234, Zona Sul'
      },
      remetente: {
        nome: 'Fornecedor GHI',
        endereco: 'Rua da Indústria, 321',
        cidade: 'Belo Horizonte',
        uf: 'MG'
      },
      destinatario: {
        nome: 'Cliente JKL',
        endereco: 'Av. Central, 654',
        cidade: 'São Paulo',
        uf: 'SP'
      },
      dataColeta: '2025-06-15',
      horaColeta: '09:00',
      dataCriacao: '2025-06-13',
      volumes: 8,
      pesoTotal: 1200,
      valorMercadoria: 18000,
      notasFiscais: ['NFE-003'],
      status: 'aprovada',
      prioridade: 'Média',
      tipo: 'Coleta'
    },
    {
      id: 'COL-2023-003',
      numero: 'COL-2023-003',
      cliente: {
        nome: 'Logística Gamma S.A.',
        cnpj: '55.666.777/0001-88',
        telefone: '(31) 77777-7777',
        endereco: 'Complexo Industrial, 567'
      },
      remetente: {
        nome: 'Indústria MNO',
        endereco: 'Distrito Industrial, 890',
        cidade: 'Salvador',
        uf: 'BA'
      },
      destinatario: {
        nome: 'Depósito PQR',
        endereco: 'Zona Portuária, 135',
        cidade: 'Santos',
        uf: 'SP'
      },
      dataColeta: '2025-06-16',
      horaColeta: '16:00',
      dataCriacao: '2025-06-12',
      volumes: 22,
      pesoTotal: 3800,
      valorMercadoria: 45000,
      notasFiscais: ['NFE-004', 'NFE-005', 'NFE-006'],
      status: 'rejeitada',
      prioridade: 'Baixa',
      tipo: 'Transferência'
    },
    {
      id: 'COL-2023-004',
      numero: 'COL-2023-004',
      cliente: {
        nome: 'Express Delta Transportes',
        cnpj: '11.222.333/0001-44',
        telefone: '(85) 66666-6666',
        endereco: 'Rod. BR-116, km 45'
      },
      remetente: {
        nome: 'Atacado STU',
        endereco: 'Centro de Distribuição, 246',
        cidade: 'Fortaleza',
        uf: 'CE'
      },
      destinatario: {
        nome: 'Varejo VWX',
        endereco: 'Shopping Center, Loja 15',
        cidade: 'Recife',
        uf: 'PE'
      },
      dataColeta: '2025-06-17',
      horaColeta: '11:30',
      dataCriacao: '2025-06-13',
      volumes: 5,
      pesoTotal: 850,
      valorMercadoria: 12000,
      notasFiscais: ['NFE-007'],
      status: 'alocada',
      prioridade: 'Média',
      tipo: 'Direta'
    }
  ];

  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      setSolicitacoes(mockSolicitacoes);
      setFilteredSolicitacoes(mockSolicitacoes);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filtros
  useEffect(() => {
    let filtered = solicitacoes;

    if (searchTerm) {
      filtered = filtered.filter(sol =>
        sol.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sol.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sol.remetente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sol.destinatario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sol.notasFiscais.some(nf => nf.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sol => sol.status === statusFilter);
    }

    if (tipoFilter !== 'all') {
      filtered = filtered.filter(sol => sol.tipo === tipoFilter);
    }

    if (prioridadeFilter !== 'all') {
      filtered = filtered.filter(sol => sol.prioridade === prioridadeFilter);
    }

    setFilteredSolicitacoes(filtered);
  }, [searchTerm, statusFilter, tipoFilter, prioridadeFilter, solicitacoes]);

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pendente': { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'aprovada': { label: 'Aprovada', className: 'bg-green-100 text-green-800 border-green-200' },
      'rejeitada': { label: 'Rejeitada', className: 'bg-red-100 text-red-800 border-red-200' },
      'alocada': { label: 'Alocada', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'em_coleta': { label: 'Em Coleta', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      'coletada': { label: 'Coletada', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pendente;
    return (
      <Badge className={`${statusInfo.className} border`}>
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

  const handleViewDetails = (solicitacao: SolicitacaoColeta) => {
    toast({
      title: "Detalhes da Solicitação",
      description: `Visualizando detalhes de ${solicitacao.numero}`,
    });
  };

  const handleEdit = (solicitacao: SolicitacaoColeta) => {
    toast({
      title: "Editar Solicitação",
      description: `Editando ${solicitacao.numero}`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'aprovada': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejeitada': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'alocada': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'em_coleta': return <Package className="w-4 h-4 text-purple-500" />;
      case 'coletada': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Solicitações de Coleta">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Solicitações de Coleta">
      <div className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Solicitações de Coleta</h1>
            <p className="text-gray-600 mt-1">Gerencie e monitore todas as solicitações de coleta e carregamento</p>
          </div>
          <div className="flex items-center gap-4">
            <ViewSelector 
              currentView={currentView} 
              onViewChange={setCurrentView}
              showBackButton={true}
            />
            <div className="flex gap-3">
              <Link href="/coletas/alocacao-veiculos">
                <Button variant="outline" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                  <Truck className="w-4 h-4 mr-2" />
                  Alocação de Veículos
                </Button>
              </Link>
              
              <Link href="/coletas/nova-ordem">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Solicitação
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{solicitacoes.length}</p>
                </div>
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {solicitacoes.filter(s => s.status === 'pendente').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {solicitacoes.filter(s => s.status === 'aprovada').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Processo</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {solicitacoes.filter(s => ['alocada', 'em_coleta'].includes(s.status)).length}
                  </p>
                </div>
                <Truck className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por ID, cliente, remetente..."
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
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aprovada">Aprovada</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                  <SelectItem value="alocada">Alocada</SelectItem>
                  <SelectItem value="em_coleta">Em Coleta</SelectItem>
                  <SelectItem value="coletada">Coletada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Tipos</SelectItem>
                  <SelectItem value="Direta">Direta</SelectItem>
                  <SelectItem value="Coleta">Coleta</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                </SelectContent>
              </Select>

              <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Prioridades</SelectItem>
                  <SelectItem value="Alta">Alta</SelectItem>
                  <SelectItem value="Média">Média</SelectItem>
                  <SelectItem value="Baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Solicitações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSolicitacoes.map((solicitacao) => (
            <Card key={solicitacao.id} className="hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(solicitacao.status)}
                    <div>
                      <CardTitle className="text-lg">{solicitacao.numero}</CardTitle>
                      <p className="text-sm text-gray-600">{solicitacao.cliente.nome}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(solicitacao.status)}
                    <Badge variant="outline" className="text-xs">
                      {solicitacao.tipo}
                    </Badge>
                  </div>
                </div>

                <Badge className={`${getPriorityColor(solicitacao.prioridade)} w-fit`}>
                  Prioridade {solicitacao.prioridade}
                </Badge>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Informações da Coleta */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {solicitacao.remetente.cidade}/{solicitacao.remetente.uf} → {solicitacao.destinatario.cidade}/{solicitacao.destinatario.uf}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      {new Date(solicitacao.dataColeta).toLocaleDateString('pt-BR')} às {solicitacao.horaColeta}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{solicitacao.volumes} volumes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{solicitacao.pesoTotal}kg</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      NFe: {solicitacao.notasFiscais.join(', ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{solicitacao.cliente.telefone}</span>
                  </div>
                </div>

                {/* Valor da Mercadoria */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-600">Valor da Mercadoria</div>
                  <div className="text-lg font-semibold text-green-600">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(solicitacao.valorMercadoria)}
                  </div>
                </div>

                {/* Observações */}
                {solicitacao.observacoes && (
                  <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                    <strong>Obs:</strong> {solicitacao.observacoes}
                  </div>
                )}

                {/* Ações */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetails(solicitacao)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Detalhes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(solicitacao)}
                    className="flex-1"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredSolicitacoes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma solicitação encontrada
              </h3>
              <p className="text-gray-500 mb-6">
                Não há solicitações que correspondam aos filtros aplicados.
              </p>
              <Link href="/coletas/nova-ordem">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Nova Solicitação
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default SolicitacoesColeta;