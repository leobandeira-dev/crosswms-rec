import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Eye, 
  Edit, 
  Truck, 
  Package, 
  Calendar, 
  MapPin, 
  FileText, 
  Search, 
  Plus,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  Grid3X3,
  List,
  Columns3,
  Printer,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PrintDialog from './PrintDialog';

interface NotaFiscal {
  numero_nota: string;
  emitente_razao_social: string;
  destinatario_razao_social: string;
  valor_nota_fiscal: number;
  peso_bruto: number;
  quantidade_volumes: number;
}

interface Volume {
  id: string;
  altura_cm: string;
  largura_cm: string;
  comprimento_cm: string;
  peso_kg: string;
  volume_m3: string;
}

interface OrdemCarregamento {
  id: string;
  numero_ordem: string;
  tipo_movimentacao?: string;
  subtipo_operacao?: string;
  status: string;
  data_criacao?: string;
  data_programada?: string;
  data_carregamento?: string;
  data_saida?: string;
  data_entrega_prevista?: string;
  data_entrega_realizada?: string;
  created_at: string;
  prioridade?: string;
  modulo?: string;
  notasFiscais?: NotaFiscal[];
  volumes?: Volume[];
  totalNotas: number;
  totalValor: number;
  totalPeso: number;
  totalVolumes: number;
  observacoes?: string;
  created_by?: string;
}

interface ListaOrdensCarregamentoProps {
  titulo?: string;
  modulo?: string;
  onNovaOrdem?: () => void;
  onVisualizarOrdem?: (ordem: OrdemCarregamento) => void;
  onEditarOrdem?: (ordem: OrdemCarregamento) => void;
  showActions?: boolean;
  showFilter?: boolean;
  className?: string;
}

const ListaOrdensCarregamento = ({
  titulo = "Ordens de Carregamento",
  modulo,
  onNovaOrdem,
  onVisualizarOrdem,
  onEditarOrdem,
  showActions = true,
  showFilter = true,
  className = ""
}: ListaOrdensCarregamentoProps) => {
  const [ordens, setOrdens] = useState<OrdemCarregamento[]>([]);
  const [filteredOrdens, setFilteredOrdens] = useState<OrdemCarregamento[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState('todos');
  const [tipoMovimentacaoFilter, setTipoMovimentacaoFilter] = useState('todos');
  const [subtipoOperacaoFilter, setSubtipoOperacaoFilter] = useState('todos');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [campoDataFilter, setCampoDataFilter] = useState('data_inclusao');
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'kanban'>('card');
  const [isLoading, setIsLoading] = useState(true);
  const [ordemParaImpressao, setOrdemParaImpressao] = useState<any>(null);
  const [carregandoOrdemCompleta, setCarregandoOrdemCompleta] = useState(false);
  const { toast } = useToast();

  // Buscar dados da API conforme módulo
  useEffect(() => {
    carregarOrdens();
  }, [modulo]);

  // Função para buscar dados completos de uma ordem para impressão
  const buscarOrdemCompleta = async (ordemId: string) => {
    setCarregandoOrdemCompleta(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ordens-carga/${ordemId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar ordem completa: ${response.status}`);
      }

      const ordemCompleta = await response.json();
      console.log('Ordem completa para impressão:', ordemCompleta);
      setOrdemParaImpressao(ordemCompleta);
      
    } catch (error) {
      console.error('Erro ao buscar ordem completa:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados completos da ordem.",
        variant: "destructive"
      });
    } finally {
      setCarregandoOrdemCompleta(false);
    }
  };

  // Função para excluir ordem de carga
  const excluirOrdem = async (ordem: OrdemCarregamento) => {
    const confirmacao = window.confirm(
      `Tem certeza que deseja excluir a ordem ${ordem.numero_ordem}?\n\nEsta ação irá excluir permanentemente:\n- A ordem de carga\n- Todas as notas fiscais relacionadas\n- Todos os volumes e etiquetas\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmacao) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ordens-carga/${ordem.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ao excluir ordem: ${response.status}`);
      }

      const result = await response.json();
      
      toast({
        title: "Sucesso",
        description: result.message || "Ordem de carga excluída com sucesso",
        variant: "default"
      });

      // Recarregar a lista após exclusão
      await carregarOrdens();
      
    } catch (error) {
      console.error('Erro ao excluir ordem:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível excluir a ordem.",
        variant: "destructive"
      });
    }
  };

  const carregarOrdens = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = '/api/ordens-carga';
      
      // Adicionar filtro por módulo se especificado
      if (modulo) {
        url += `?modulo=${encodeURIComponent(modulo)}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const ordensData = await response.json();
      
      // Transformar dados para o formato esperado pelo componente
      const ordensFormatadas = ordensData.map((ordem: any) => ({
        id: ordem.id,
        numero_ordem: ordem.numero_ordem,
        tipo_movimentacao: ordem.tipo_movimentacao || (ordem.tipo_carregamento === 'armazenagem_recebimento' ? 'Entrada' : 'Saída'),
        subtipo_operacao: ordem.subtipo_operacao || (ordem.tipo_carregamento === 'armazenagem_recebimento' ? 'Recebimento' : 
                          ordem.tipo_carregamento === 'coletas' ? 'Coleta' : 'Carregamento'),
        status: ordem.status === 'criada' ? 'pendente_processamento' : ordem.status,
        data_criacao: ordem.created_at,
        data_operacao: ordem.data_programada,
        prioridade: ordem.prioridade || 'Normal',
        modulo: ordem.modulo || ordem.tipo_carregamento,
        notasFiscais: ordem.notasFiscais || [],
        volumes: ordem.volumes || [],
        totalNotas: ordem.totalNotas || 0,
        totalValor: parseFloat(ordem.totalValor) || 0,
        totalPeso: parseFloat(ordem.totalPeso) || 0,
        totalVolumes: ordem.totalVolumes || 0,
        observacoes: ordem.observacoes,
        created_by: 'Sistema',
        // Dados de remetente e destinatário
        remetente_razao_social: ordem.remetente_razao_social,
        remetente_cnpj: ordem.remetente_cnpj,
        destinatario_razao_social: ordem.destinatario_razao_social,
        destinatario_cnpj: ordem.destinatario_cnpj
      }));

      setOrdens(ordensFormatadas);
      setFilteredOrdens(ordensFormatadas);
    } catch (error) {
      console.error('Erro ao carregar ordens:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de ordens de carregamento.",
        variant: "destructive"
      });
      
      // Fallback para localStorage em caso de erro
      setOrdens([]);
      setFilteredOrdens([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrar ordens com base na pesquisa, status, prioridade e data
  useEffect(() => {
    let filtered = ordens;

    // Filtro de texto
    if (searchTerm) {
      filtered = filtered.filter(ordem =>
        ordem.numero_ordem.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ordem.subtipo_operacao || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ordem.notasFiscais || []).some(nf => 
          (nf.emitente_razao_social || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (nf.destinatario_razao_social || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (nf.numero_nota || '').includes(searchTerm)
        )
      );
    }

    // Filtro de status
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(ordem => ordem.status === statusFilter);
    }

    // Filtro de prioridade
    if (prioridadeFilter !== 'todos') {
      filtered = filtered.filter(ordem => (ordem.prioridade || 'Normal') === prioridadeFilter);
    }

    // Filtro de tipo de movimentação
    if (tipoMovimentacaoFilter !== 'todos') {
      filtered = filtered.filter(ordem => (ordem.tipo_movimentacao || '') === tipoMovimentacaoFilter);
    }

    // Filtro de subtipo de operação
    if (subtipoOperacaoFilter !== 'todos') {
      filtered = filtered.filter(ordem => (ordem.subtipo_operacao || '') === subtipoOperacaoFilter);
    }

    // Filtro de data de início
    if (dataInicio) {
      filtered = filtered.filter(ordem => {
        let dataOrdem;
        const ordemExtended = ordem as any;
        
        switch (campoDataFilter) {
          case 'data_criacao':
            dataOrdem = new Date(ordem.data_criacao || ordem.created_at);
            break;
          case 'data_inclusao':
            dataOrdem = new Date(ordem.created_at);
            break;
          case 'data_programada':
            if (!ordemExtended.data_programada) return false;
            dataOrdem = new Date(ordemExtended.data_programada);
            break;
          case 'data_carregamento':
            if (!ordemExtended.data_carregamento) return false;
            dataOrdem = new Date(ordemExtended.data_carregamento);
            break;
          case 'data_saida':
            if (!ordemExtended.data_saida) return false;
            dataOrdem = new Date(ordemExtended.data_saida);
            break;
          case 'data_entrega_prevista':
            if (!ordemExtended.data_entrega_prevista) return false;
            dataOrdem = new Date(ordemExtended.data_entrega_prevista);
            break;
          case 'data_entrega_realizada':
            if (!ordemExtended.data_entrega_realizada) return false;
            dataOrdem = new Date(ordemExtended.data_entrega_realizada);
            break;
          default:
            dataOrdem = new Date(ordem.data_criacao || ordem.created_at);
        }
        
        const dataInicioFiltro = new Date(dataInicio);
        return dataOrdem >= dataInicioFiltro;
      });
    }

    // Filtro de data de fim
    if (dataFim) {
      filtered = filtered.filter(ordem => {
        let dataOrdem;
        const ordemExtended = ordem as any;
        
        switch (campoDataFilter) {
          case 'data_criacao':
            dataOrdem = new Date(ordem.data_criacao || ordem.created_at);
            break;
          case 'data_inclusao':
            dataOrdem = new Date(ordem.created_at);
            break;
          case 'data_programada':
            if (!ordemExtended.data_programada) return false;
            dataOrdem = new Date(ordemExtended.data_programada);
            break;
          case 'data_carregamento':
            if (!ordemExtended.data_carregamento) return false;
            dataOrdem = new Date(ordemExtended.data_carregamento);
            break;
          case 'data_saida':
            if (!ordemExtended.data_saida) return false;
            dataOrdem = new Date(ordemExtended.data_saida);
            break;
          case 'data_entrega_prevista':
            if (!ordemExtended.data_entrega_prevista) return false;
            dataOrdem = new Date(ordemExtended.data_entrega_prevista);
            break;
          case 'data_entrega_realizada':
            if (!ordemExtended.data_entrega_realizada) return false;
            dataOrdem = new Date(ordemExtended.data_entrega_realizada);
            break;
          default:
            dataOrdem = new Date(ordem.data_criacao || ordem.created_at);
        }
        
        const dataFimFiltro = new Date(dataFim);
        dataFimFiltro.setHours(23, 59, 59, 999); // Incluir todo o dia
        return dataOrdem <= dataFimFiltro;
      });
    }

    setFilteredOrdens(filtered);
  }, [searchTerm, statusFilter, prioridadeFilter, tipoMovimentacaoFilter, subtipoOperacaoFilter, dataInicio, dataFim, campoDataFilter, ordens]);

  const formatarData = (data: string | null | undefined, formato: string = "dd/MM/yyyy") => {
    if (!data) return '-';
    try {
      const dataObj = new Date(data);
      if (isNaN(dataObj.getTime())) return '-';
      return format(dataObj, formato, { locale: ptBR });
    } catch (error) {
      return '-';
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pendente_processamento':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          icon: Clock, 
          label: 'Pendente' 
        };
      case 'em_processamento':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: AlertCircle, 
          label: 'Processando' 
        };
      case 'finalizada':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: CheckCircle2, 
          label: 'Finalizada' 
        };
      case 'cancelada':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: XCircle, 
          label: 'Cancelada' 
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: AlertCircle, 
          label: status 
        };
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Alta': return 'bg-red-100 text-red-800';
      case 'Média': return 'bg-yellow-100 text-yellow-800';
      case 'Normal': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{titulo}</h2>
          <p className="text-gray-600">
            {filteredOrdens.length} {filteredOrdens.length === 1 ? 'ordem encontrada' : 'ordens encontradas'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Controles de Visualização */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'card' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="h-8 px-3"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('kanban')}
              className="h-8 px-3"
            >
              <Columns3 className="h-4 w-4" />
            </Button>
          </div>

          {showActions && onNovaOrdem && (
            <Button onClick={onNovaOrdem} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Ordem
            </Button>
          )}
        </div>
      </div>

      {/* Filtros */}
      {showFilter && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Linha 1: Busca e Status */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Buscar por número, operação, empresa..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="lg:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos os Status</option>
                    <option value="pendente_processamento">Pendente</option>
                    <option value="em_processamento">Processando</option>
                    <option value="finalizada">Finalizada</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              {/* Linha 2: Tipo e Subtipo de Operação */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="lg:w-48">
                  <select
                    value={tipoMovimentacaoFilter}
                    onChange={(e) => setTipoMovimentacaoFilter(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todos os Tipos</option>
                    <option value="Entrada">Entrada</option>
                    <option value="Saída">Saída</option>
                    <option value="Transferência">Transferência</option>
                  </select>
                </div>
                <div className="lg:w-48">
                  <select
                    value={subtipoOperacaoFilter}
                    onChange={(e) => setSubtipoOperacaoFilter(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todas as Operações</option>
                    <option value="Recebimento">Recebimento</option>
                    <option value="Coleta">Coleta</option>
                    <option value="Devolução">Devolução</option>
                    <option value="Transferência">Transferência</option>
                    <option value="Armazém">Armazém</option>
                    <option value="Direta">Direta</option>
                    <option value="Entrega">Entrega</option>
                  </select>
                </div>
                <div className="flex-1">
                  {(tipoMovimentacaoFilter !== 'todos' || subtipoOperacaoFilter !== 'todos') && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTipoMovimentacaoFilter('todos');
                        setSubtipoOperacaoFilter('todos');
                      }}
                      className="h-10 px-3"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Linha 3: Prioridade e Campo de Data */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="lg:w-48">
                  <select
                    value={prioridadeFilter}
                    onChange={(e) => setPrioridadeFilter(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="todos">Todas as Prioridades</option>
                    <option value="Expressa">Expressa</option>
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Normal">Normal</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
                <div className="lg:w-56">
                  <select
                    value={campoDataFilter}
                    onChange={(e) => setCampoDataFilter(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="data_criacao">Data de Criação</option>
                    <option value="data_inclusao">Data de Inclusão</option>
                    <option value="data_programada">Data Programada</option>
                    <option value="data_carregamento">Data Carregamento</option>
                    <option value="data_saida">Data Saída</option>
                    <option value="data_entrega_prevista">Data Entrega Prevista</option>
                    <option value="data_entrega_realizada">Data Entrega Realizada</option>
                  </select>
                </div>
              </div>

              {/* Linha 4: Filtros de Data */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      type="date"
                      placeholder="Data Início"
                      value={dataInicio}
                      onChange={(e) => setDataInicio(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="date"
                      placeholder="Data Fim"
                      value={dataFim}
                      onChange={(e) => setDataFim(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  {(prioridadeFilter !== 'todos' || campoDataFilter !== 'data_criacao' || dataInicio || dataFim) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPrioridadeFilter('todos');
                        setCampoDataFilter('data_criacao');
                        setDataInicio('');
                        setDataFim('');
                      }}
                      className="h-10 px-3"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Ordens */}
      {filteredOrdens.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma ordem encontrada
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {searchTerm || statusFilter !== 'todos' || prioridadeFilter !== 'todos' || tipoMovimentacaoFilter !== 'todos' || subtipoOperacaoFilter !== 'todos' || dataInicio || dataFim
                ? 'Não há ordens que correspondam aos filtros aplicados.' 
                : 'Não há ordens de carregamento cadastradas ainda.'
              }
            </p>
            {showActions && onNovaOrdem && !searchTerm && statusFilter === 'todos' && prioridadeFilter === 'todos' && tipoMovimentacaoFilter === 'todos' && subtipoOperacaoFilter === 'todos' && !dataInicio && !dataFim && (
              <Button onClick={onNovaOrdem} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeira Ordem
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div>
          {/* Visualização em Cartões */}
          {viewMode === 'card' && (
            <div className="space-y-4">
              {filteredOrdens.map((ordem) => {
            const statusConfig = getStatusConfig(ordem.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card key={ordem.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Informações Principais */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ordem.numero_ordem}
                        </h3>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        <Badge className={getPrioridadeColor(ordem.prioridade || 'normal')}>
                          {ordem.prioridade || 'Normal'}
                        </Badge>
                      </div>

                      {/* Linha 1: Classificação da Ordem */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm bg-blue-50 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Tipo:</span>
                          <span className="font-semibold">{ordem.tipo_movimentacao || 'Não informado'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Operação:</span>
                          <span className="font-semibold">{ordem.subtipo_operacao || 'Não informado'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Prioridade:</span>
                          <span className="font-semibold">{ordem.prioridade || 'Normal'}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Data Operação:</span>
                          <span className="font-semibold">
                            {(() => {
                              const dataParaExibir = (ordem as any).data_programada;
                              if (!dataParaExibir) return 'Não informada';
                              
                              try {
                                const date = new Date(dataParaExibir);
                                if (isNaN(date.getTime())) return 'Data inválida';
                                return format(date, 'dd/MM/yyyy', { locale: ptBR });
                              } catch (error) {
                                return 'Data inválida';
                              }
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Linha 2: Dados Operacionais */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Data Criação:</span>
                          <span>
                            {(() => {
                              // Tentar múltiplas fontes de data de criação
                              const dataParaExibir = (ordem as any).created_at || ordem.data_criacao;
                              if (!dataParaExibir) {
                                return 'Não informada';
                              }
                              
                              try {
                                const date = new Date(dataParaExibir);
                                if (isNaN(date.getTime())) return 'Data inválida';
                                return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
                              } catch (error) {
                                console.error('Erro ao formatar data de criação:', error);
                                return 'Data inválida';
                              }
                            })()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Notas:</span>
                          <span>{ordem.totalNotas || ordem.notasFiscais?.length || 0}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-orange-600" />
                          <span className="font-medium">Volumes:</span>
                          <span>{ordem.totalVolumes || 0}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-600" />
                          <span className="font-medium">Módulo:</span>
                          <span>{ordem.modulo?.replace('_', ' ') || 'Sistema'}</span>
                        </div>
                      </div>

                      {/* Resumo Operacional Completo */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                        <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                          <div className="font-medium text-gray-700">Valor Total</div>
                          <div className="text-lg font-bold text-green-700">
                            {formatarMoeda(ordem.totalValor || 0)}
                          </div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                          <div className="font-medium text-gray-700">Peso Total</div>
                          <div className="text-lg font-bold text-blue-700">
                            {ordem.totalPeso || 0} kg
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                          <div className="font-medium text-gray-700">Total de Volumes</div>
                          <div className="text-lg font-bold text-purple-700">
                            {ordem.totalVolumes || 0}
                          </div>
                        </div>
                        <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400">
                          <div className="font-medium text-gray-700">Maiores Dimensões (m)</div>
                          <div className="text-sm font-bold text-orange-700">
                            {(() => {
                              // Calcular maiores dimensões dos volumes (igual à visualização detalhada)
                              if ((ordem as any).volumes && Array.isArray((ordem as any).volumes) && (ordem as any).volumes.length > 0) {
                                const volumes = (ordem as any).volumes;
                                
                                // Converter de cm para metros (igual ao backend)
                                const alturas = volumes.map((v: any) => parseFloat(v.altura_cm || '0') / 100);
                                const larguras = volumes.map((v: any) => parseFloat(v.largura_cm || '0') / 100);
                                const comprimentos = volumes.map((v: any) => parseFloat(v.comprimento_cm || '0') / 100);
                                
                                const maxAltura = Math.max(...alturas);
                                const maxLargura = Math.max(...larguras);
                                const maxComprimento = Math.max(...comprimentos);
                                
                                // Verificar se há pelo menos uma dimensão maior que zero
                                if (maxAltura === 0 && maxLargura === 0 && maxComprimento === 0) {
                                  return 'Dimensões não informadas';
                                }
                                
                                return `A: ${maxAltura.toFixed(2)} | L: ${maxLargura.toFixed(2)} | C: ${maxComprimento.toFixed(2)}`;
                              }
                              return 'Dimensões não informadas';
                            })()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Informações Adicionais */}
                      <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                        <span>
                          <span className="font-medium">Criado por:</span> {ordem.created_by || 'Sistema'}
                        </span>
                        <span>
                          <span className="font-medium">Total de Notas:</span> {ordem.totalNotas || 0}
                        </span>
                      </div>

                      {/* Observações */}
                      {ordem.observacoes && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-700">Observações:</span>
                          <p className="mt-1 text-gray-600">{ordem.observacoes}</p>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    {showActions && (
                      <div className="flex flex-row lg:flex-col gap-2">
                        {onVisualizarOrdem && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onVisualizarOrdem(ordem)}
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            Visualizar
                          </Button>
                        )}
                        {onEditarOrdem && ordem.status === 'pendente_processamento' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEditarOrdem(ordem)}
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Editar
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => buscarOrdemCompleta(ordem.id)}
                            >
                              <Printer className="h-4 w-4" />
                              Imprimir
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Impressão - {ordem.numero_ordem}</DialogTitle>
                            </DialogHeader>
                            {carregandoOrdemCompleta ? (
                              <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                  <p className="text-sm text-gray-600">Carregando dados completos...</p>
                                </div>
                              </div>
                            ) : ordemParaImpressao ? (
                              <PrintDialog 
                                open={true} 
                                onClose={() => setOrdemParaImpressao(null)} 
                                formData={ordemParaImpressao}
                                notasFiscais={ordemParaImpressao.notasFiscais || []}
                                volumeData={ordemParaImpressao.volumes || []}
                              />
                            ) : (
                              <div className="py-8 text-center text-gray-500">
                                Clique no ícone de impressora para carregar os dados
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => excluirOrdem(ordem)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
            </div>
          )}

          {/* Visualização em Lista */}
          {viewMode === 'list' && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-medium">Ordem</th>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Tipo/Operação</th>
                        <th className="text-left p-4 font-medium">Data Programada</th>
                        <th className="text-left p-4 font-medium">Volumes</th>
                        <th className="text-left p-4 font-medium">Valor</th>
                        <th className="text-left p-4 font-medium">Peso</th>
                        {showActions && <th className="text-left p-4 font-medium">Ações</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrdens.map((ordem) => {
                        const statusConfig = getStatusConfig(ordem.status);
                        const StatusIcon = statusConfig.icon;

                        return (
                          <tr key={ordem.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div className="font-semibold">{ordem.numero_ordem}</div>
                              <div className="text-sm text-gray-600">
                                {formatarData(ordem.created_at, "dd/MM/yyyy HH:mm")}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={statusConfig.color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig.label}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <div className="text-sm">
                                <div className="font-medium">{ordem.tipo_movimentacao || '-'}</div>
                                <div className="text-gray-600">{ordem.subtipo_operacao || '-'}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              {formatarData(ordem.data_programada, "dd/MM/yyyy")}
                            </td>
                            <td className="p-4">
                              <div className="font-medium">{ordem.totalVolumes || 0}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-green-700">
                                {formatarMoeda(ordem.totalValor || 0)}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium">{ordem.totalPeso || 0} kg</div>
                            </td>
                            {showActions && (
                              <td className="p-4">
                                <div className="flex gap-2">
                                  {onVisualizarOrdem && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onVisualizarOrdem(ordem)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {onEditarOrdem && ordem.status === 'pendente_processamento' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onEditarOrdem(ordem)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => buscarOrdemCompleta(ordem.id)}
                                      >
                                        <Printer className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>Impressão - {ordem.numero_ordem}</DialogTitle>
                                      </DialogHeader>
                                      {carregandoOrdemCompleta ? (
                                        <div className="flex items-center justify-center py-8">
                                          <div className="text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                            <p className="text-sm text-gray-600">Carregando dados completos...</p>
                                          </div>
                                        </div>
                                      ) : ordemParaImpressao ? (
                                        <PrintDialog 
                                          open={true} 
                                          onClose={() => setOrdemParaImpressao(null)} 
                                          formData={ordemParaImpressao}
                                          notasFiscais={ordemParaImpressao.notasFiscais || []}
                                          volumeData={ordemParaImpressao.volumes || []}
                                        />
                                      ) : (
                                        <div className="py-8 text-center text-gray-500">
                                          Clique no ícone de impressora para carregar os dados
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => excluirOrdem(ordem)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Visualização Kanban */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Colunas do Kanban por status */}
              {['pendente_processamento', 'em_processamento', 'finalizado', 'cancelado'].map((status) => {
                const ordensDoStatus = filteredOrdens.filter(ordem => ordem.status === status);
                const statusConfig = getStatusConfig(status);
                
                return (
                  <div key={status} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                      <span className="text-sm text-gray-600">({ordensDoStatus.length})</span>
                    </div>
                    
                    <div className="space-y-3">
                      {ordensDoStatus.map((ordem) => (
                        <Card key={ordem.id} className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="font-semibold text-sm">{ordem.numero_ordem}</div>
                              <div className="flex justify-between items-center">
                                <Badge className={getPrioridadeColor(ordem.prioridade || 'normal')} variant="outline">
                                  {ordem.prioridade || 'Normal'}
                                </Badge>
                                <span className="text-xs text-gray-600">
                                  {ordem.totalVolumes || 0} vol.
                                </span>
                              </div>
                              
                              <div className="text-xs text-gray-600">
                                <div>{ordem.tipo_movimentacao || '-'}</div>
                                <div>{ordem.subtipo_operacao || '-'}</div>
                              </div>
                              
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-medium text-green-600">
                                  {formatarMoeda(ordem.totalValor || 0)}
                                </span>
                                <span className="text-gray-600">
                                  {ordem.totalPeso || 0} kg
                                </span>
                              </div>
                              
                              {ordem.data_programada && (
                                <div className="text-xs text-gray-600">
                                  📅 {formatarData(ordem.data_programada, "dd/MM/yyyy")}
                                </div>
                              )}
                              
                              {showActions && (
                                <div className="flex gap-1 pt-2">
                                  {onVisualizarOrdem && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onVisualizarOrdem(ordem)}
                                      className="h-7 px-2"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {onEditarOrdem && ordem.status === 'pendente_processamento' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onEditarOrdem(ordem)}
                                      className="h-7 px-2"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => excluirOrdem(ordem)}
                                    className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ListaOrdensCarregamento;