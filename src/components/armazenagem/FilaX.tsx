import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import PrintDialog from '@/components/comum/OrdemCarregamento/PrintDialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Truck, 
  Clock, 
  Package, 
  CheckCircle, 
  XCircle, 
  Eye, 
  MoreVertical,
  Plus,
  Filter,
  Search,
  Calendar,
  User,
  Phone,
  MapPin,
  AlertTriangle,
  QrCode,
  Camera,
  X,
  Monitor,
  Smartphone,
  GripVertical,
  Edit,
  FileText,
  Settings,
  Archive,
  ArchiveX,
  History,
  BarChart3,
  TrendingUp,
  Target,
  FileEdit,
  Printer
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import NovaOrdemIntegrada from '@/components/comum/OrdemCarregamento/NovaOrdemIntegrada';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { toast } from '@/hooks/use-toast';
import TopNavbar from '@/components/layout/TopNavbar';
import { useLocation } from 'wouter';
import { usePrintSystem } from '@/components/comum/PrintSystem';

interface OrdemCarga {
  id: string;
  numero_carregamento: string;
  tipo_carregamento: string;
  tipo_movimentacao: string;
  subtipo_operacao: string;
  status: string;
  data_planejada: string;
  data_inicio: string;
  data_finalizacao: string;
  endereco_coleta: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  notasFiscais?: any[];
  volumes?: any[];
  valor_total?: number;
  peso_total?: number;
  volume_total?: number;
}

interface OrdemVinculada {
  id: string;
  fila_x_id: string;
  ordem_id?: string | null;
  ordem_carga_id?: string | null;
  tipo_ordem: 'carregamento' | 'ordem_carga';
  data_vinculacao: string;
  observacoes?: string;
  ordem_data?: any; // Dados da ordem específica
}

interface FilaXItem {
  id: string;
  titulo_cartao?: string;
  tipo_operacao: 'recebimento' | 'carregamento' | 'transferencia' | 'carga' | 'Entrada' | 'Saida';
  estagio: 'triagem' | 'aguardando_doca' | 'em_processo' | 'finalizado' | 'recusado' | 'apresentar'; // apresentar incluído para compatibilidade
  data_entrada: string;
  data_atualizacao: string;
  observacoes?: string;
  ordens_vinculadas: OrdemVinculada[];
  tempo_espera?: number;
  posicao_fila?: number;
  doca_designada?: string;
  motorista_nome?: string | null;
  motorista_telefone?: string | null;
  veiculo_placa?: string | null;
  veiculo_tipo?: string | null;
  prioridade?: 'baixa' | 'normal' | 'alta' | 'urgente' | null;
  motorista_notificado?: boolean;
  empresa_id: string;
  ordem: OrdemCarga;
}

const ESTAGIOS: Record<string, any> = {
  triagem: {
    label: 'Triagem',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    icon: AlertTriangle,
    description: 'Aguardando análise inicial e documentação',
    slaMinutos: 15
  },
  aguardando_doca: {
    label: 'Aguardando Doca',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    icon: Clock,
    description: 'Autorizado - Aguardando doca disponível',
    slaMinutos: 30
  },
  em_processo: {
    label: 'Em Processo',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    icon: Truck,
    description: 'Operação em andamento na doca',
    slaMinutos: 120
  },
  finalizado: {
    label: 'Finalizado',
    color: 'bg-green-100 border-green-300 text-green-800',
    icon: CheckCircle,
    description: 'Operação concluída com sucesso',
    slaMinutos: 0
  },
  recusado: {
    label: 'Recusado',
    color: 'bg-red-100 border-red-300 text-red-800',
    icon: XCircle,
    description: 'Não autorizado ou com problemas',
    slaMinutos: 0
  },
  // COMPATIBILIDADE: Mapeamento para estágios antigos no banco
  apresentar: {
    label: 'Aguardando Doca',
    color: 'bg-blue-100 border-blue-300 text-blue-800',
    icon: Clock,
    description: 'Autorizado - Aguardando doca disponível (legado)',
    slaMinutos: 30
  }
};

const TIPOS_OPERACAO: Record<string, any> = {
  recebimento: {
    label: 'Recebimento',
    color: 'bg-green-50 text-green-700',
    icon: Package
  },
  carregamento: {
    label: 'Carregamento',
    color: 'bg-blue-50 text-blue-700',
    icon: Truck
  },
  transferencia: {
    label: 'Transferência',
    color: 'bg-purple-50 text-purple-700',
    icon: MapPin
  },
  carga: {
    label: 'Carga',
    color: 'bg-blue-50 text-blue-700',
    icon: Truck
  },
  Entrada: {
    label: 'Entrada',
    color: 'bg-green-50 text-green-700',
    icon: Package
  },
  Saida: {
    label: 'Saída',
    color: 'bg-orange-50 text-orange-700',
    icon: Truck
  }
};

const PRIORIDADES: Record<string, any> = {
  baixa: { label: 'Baixa', color: 'bg-gray-100 text-gray-700' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-700' },
  alta: { label: 'Alta', color: 'bg-yellow-100 text-yellow-700' },
  urgente: { label: 'Urgente', color: 'bg-red-100 text-red-700' }
};

const FilaX: React.FC = () => {
  const printSystem = usePrintSystem();
  const [selectedItem, setSelectedItem] = useState<FilaXItem | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filtroEstagio, setFiltroEstagio] = useState<string>('all');
  const [filtroTipoOperacao, setFiltroTipoOperacao] = useState<string>('all');
  const [filtroPrioridade, setFiltroPrioridade] = useState<string>('all');
  const [pesquisa, setPesquisa] = useState<string>('');
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('');
  const [filtroDataFim, setFiltroDataFim] = useState<string>('');
  const [filtroUsuario, setFiltroUsuario] = useState<string>('all');
  const [showSLAAnalysis, setShowSLAAnalysis] = useState(false);
  
  // Estados para modal de adicionar
  const [modalView, setModalView] = useState<'search' | 'create'>('search');
  const [pesquisaOrdem, setPesquisaOrdem] = useState<string>('');
  const [novaOrdemData, setNovaOrdemData] = useState({
    tipo_operacao: 'recebimento',
    prioridade: 'normal',
    motorista_nome: '',
    motorista_telefone: '',
    veiculo_placa: '',
    veiculo_tipo: '',
    doca_designada: '',
    observacoes: ''
  });

  // Estados para QR Code scanner
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrCodeReader, setQrCodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Estados para visão imersiva e responsividade
  const [showImmersiveView, setShowImmersiveView] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Estados para modal de informações do motorista
  const [showDriverModal, setShowDriverModal] = useState(false);
  
  // Estados para impressão (replicando o padrão do ListaOrdensCarregamento)
  const [ordemParaImpressao, setOrdemParaImpressao] = useState<any>(null);
  const [carregandoOrdemCompleta, setCarregandoOrdemCompleta] = useState(false);
  
  // Estado para filtro de status (ativas/arquivadas)
  const [filtroStatus, setFiltroStatus] = useState<'ativas' | 'arquivadas'>('ativas');
  const [selectedOrderForDriver, setSelectedOrderForDriver] = useState<string | null>(null);
  const [driverInfo, setDriverInfo] = useState({
    motorista_nome: '',
    veiculo_placa: '',
    doca_designada: '',
    estagio_inicial: ''
  });
  
  // Estados para arquivamento
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [itemToArchive, setItemToArchive] = useState<FilaXItem | null>(null);
  const [stageToArchive, setStageToArchive] = useState<string | null>(null);
  
  // Estados para edição de cartões existentes
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<FilaXItem | null>(null);
  const [editInfo, setEditInfo] = useState({
    motorista_nome: '',
    veiculo_placa: '',
    doca_designada: '',
    estagio_inicial: ''
  });
  
  // Estados para edição de etapas
  const [showEtapaEditor, setShowEtapaEditor] = useState(false);
  const [etapaEditando, setEtapaEditando] = useState<string | null>(null);
  const [etapasConfig, setEtapasConfig] = useState(() => {
    // Incluir Expedição na configuração inicial
    return {
      ...ESTAGIOS,
      expedicao: {
        label: 'Expedição',
        color: 'bg-purple-50 border-purple-300 text-purple-700',
        icon: Package,
        description: 'Etapa de expedição de mercadorias',
        slaMinutos: 30
      }
    };
  });
  const [showNovaEtapaForm, setShowNovaEtapaForm] = useState(false);
  const [novaEtapa, setNovaEtapa] = useState({
    key: '',
    label: '',
    description: '',
    slaMinutos: 30,
    color: 'border-blue-300'
  });

  // Estados para gerenciar múltiplas ordens por cartão
  const [showOrdensModal, setShowOrdensModal] = useState(false);
  const [cartaoSelecionado, setCartaoSelecionado] = useState<FilaXItem | null>(null);
  const [showVincularOrdemModal, setShowVincularOrdemModal] = useState(false);
  const [showEditOrdemModal, setShowEditOrdemModal] = useState(false);
  const [ordemEditando, setOrdemEditando] = useState<any>(null);
  const [vinculandoOrdem, setVinculandoOrdem] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  // Função para gerenciar drag and drop das etapas
  const handleDragEnd = (result: any) => {
    if (!result.destination) {
      return; // Item foi largado fora da área válida
    }

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) {
      return; // Item não foi movido
    }

    // Converter o objeto de etapas em array para reordenar
    const etapasArray = Object.entries(etapasConfig);
    
    // Remover item da posição original e inserir na nova posição
    const [itemMovido] = etapasArray.splice(sourceIndex, 1);
    etapasArray.splice(destinationIndex, 0, itemMovido);
    
    // Reconstruir o objeto de etapas com nova ordem
    const novasEtapas = etapasArray.reduce((acc, [key, etapa]) => {
      acc[key] = etapa;
      return acc;
    }, {} as typeof etapasConfig);
    
    setEtapasConfig(novasEtapas);
    
    toast({
      title: "Posição atualizada",
      description: `A etapa "${itemMovido[1].label}" foi reposicionada.`
    });
  };

  // Detectar mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-abrir ordem quando há parâmetros de edição na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const ordemId = urlParams.get('id');
    
    if (mode === 'edit' && ordemId) {
      console.log('FilaX: Detectados parâmetros de edição:', { mode, ordemId });
      
      // Aguardar dados serem carregados antes de abrir
      setTimeout(() => {
        console.log('FilaX: Tentando abrir ordem automaticamente');
        // Buscar a ordem específica para edição
        fetch(`/api/ordens-carga/${ordemId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        .then(response => response.json())
        .then(ordem => {
          console.log('FilaX: Ordem encontrada para edição:', ordem);
          setOrdemEditando(ordem);
          setShowEditOrdemModal(true);
          
          // Limpar parâmetros da URL após abrir
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
          
          toast({
            title: "Ordem aberta",
            description: `Editando ordem ${ordem.numero_ordem}`
          });
        })
        .catch(error => {
          console.error('FilaX: Erro ao carregar ordem para edição:', error);
          toast({
            title: "Erro",
            description: "Não foi possível abrir a ordem para edição",
            variant: "destructive"
          });
        });
      }, 1000); // Aguardar 1 segundo para dados carregarem
    }
  }, []);

  // Polling automático de dados SLA quando modal está aberto
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (showDetailsModal && selectedItem) {
      // Atualizar dados a cada 3 segundos quando modal está aberto
      interval = setInterval(() => {
        queryClient.refetchQueries({ queryKey: ['/api/fila-x/historico'] });
        queryClient.refetchQueries({ queryKey: ['/api/fila-x'] });
      }, 3000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [showDetailsModal, selectedItem, queryClient]);

  // Mutation para mover item
  const moveItemMutation = useMutation({
    mutationFn: async ({ id, novoEstagio, observacoes }: { id: string, novoEstagio: string, observacoes?: string }) => {
      const response = await fetch(`/api/fila-x/${id}/mover`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ estagio: novoEstagio, observacoes })
      });

      if (!response.ok) {
        throw new Error('Erro ao mover item');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar TODOS os dados relacionados para atualização em tempo real
      queryClient.invalidateQueries({ queryKey: ['/api/fila-x'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fila-x/historico'] });
      
      // Se tem modal aberto, forçar atualização do SLA
      if (selectedCard) {
        queryClient.refetchQueries({ queryKey: ['/api/fila-x/historico'] });
      }
      
      toast({
        title: "Item movido com sucesso!",
        description: "O item foi movido para o novo estágio.",
      });
    },
    onError: (error) => {
      console.error('Erro ao mover item:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o item. Tente novamente.",
        variant: "destructive"
      });
      // Reverter a atualização otimística em caso de erro
      queryClient.invalidateQueries({ queryKey: ['/api/fila-x'] });
    }
  });

  // Função para lidar com drag and drop de cartões entre etapas - otimizada
  const handleCardDragEnd = useCallback((result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    const newStage = destination.droppableId;
    const itemId = draggableId;

    // Se mudou de estágio, fazer a atualização
    if (source.droppableId !== newStage) {
      // Atualização otimística da UI para responsividade imediata
      queryClient.setQueryData(['/api/fila-x'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return oldData.map((item: any) => 
          item.id === itemId 
            ? { ...item, estagio: newStage }
            : item
        );
      });
      
      // Fazer a atualização no servidor
      moveItemMutation.mutate({
        id: itemId,
        novoEstagio: newStage,
        observacoes: `Movido via arrastar e soltar de ${(etapasConfig as any)[source.droppableId]?.label || source.droppableId} para ${(etapasConfig as any)[newStage]?.label || newStage}`
      });
    }
  }, [queryClient, etapasConfig, moveItemMutation]);

  // Função para iniciar o scanner QR
  const startQRScanner = async () => {
    try {
      setIsScanning(true);
      setShowQRScanner(true);
      
      // Aguardar um pouco para o modal aparecer
      setTimeout(async () => {
        try {
          const reader = new BrowserMultiFormatReader();
          const videoElement = document.getElementById('qr-scanner-video') as HTMLVideoElement;
          
          if (videoElement) {
            const result = await reader.decodeOnceFromVideoDevice(undefined, videoElement);
            if (result) {
              const scannedText = result.getText();
              setPesquisaOrdem(scannedText);
              stopQRScanner();
              
              toast({
                title: "QR Code lido!",
                description: `Pesquisando por: ${scannedText}`,
              });
            }
          }
        } catch (err) {
          console.error('Erro ao escanear QR Code:', err);
          toast({
            title: "Erro",
            description: "Não foi possível escanear o QR Code. Verifique se a câmera está disponível.",
            variant: "destructive"
          });
          stopQRScanner();
        }
      }, 500);
      
    } catch (err) {
      console.error('Erro ao iniciar scanner:', err);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o scanner",
        variant: "destructive"
      });
      stopQRScanner();
    }
  };

  // Função para parar o scanner QR
  const stopQRScanner = () => {
    try {
      // Parar stream de vídeo se estiver ativo
      const videoElement = document.getElementById('qr-scanner-video') as HTMLVideoElement;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
      }
    } catch (e) {
      console.log('Cleanup error:', e);
    }
    
    setShowQRScanner(false);
    setIsScanning(false);
  };

  // Função para buscar dados completos de uma ordem para impressão (replicando padrão do ListaOrdensCarregamento)
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

  // Buscar itens da fila (ativas ou arquivadas baseado no filtro)
  const { data: filaItems = [], isLoading } = useQuery({
    queryKey: ['/api/fila-x', filtroStatus],
    queryFn: () => apiRequest(`/api/fila-x${filtroStatus === 'arquivadas' ? '/arquivados' : ''}`),
    staleTime: 0, // Sempre buscar dados frescos
    refetchInterval: filtroStatus === 'ativas' ? 1000 * 10 : 0, // 10 segundos para ativas, sem auto-refresh para arquivadas
    refetchOnMount: true,
    refetchOnWindowFocus: filtroStatus === 'ativas',
  });

  // Detectar etapas personalizadas quando dados da fila são carregados
  useEffect(() => {
    if (filaItems && filaItems.length > 0) {
      detectarEtapasPersonalizadas(filaItems);
    }
  }, [filaItems]);

  // Buscar ordens disponíveis com pesquisa dinâmica
  const { data: ordensDisponiveis = [] } = useQuery({
    queryKey: ['/api/ordens-carga', 'disponiveis', pesquisaOrdem],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      // Excluir ordens já vinculadas à FilaX
      params.append('exclude_fila_x', 'true');
      
      // Filtrar apenas ordens que podem ser adicionadas à fila (não finalizadas)
      if (pesquisaOrdem.trim()) {
        params.append('search', pesquisaOrdem);
      }
      
      const result = await apiRequest(`/api/ordens-carga?${params.toString()}`);
      return result;
    }
  });

  // Buscar histórico geral da FilaX para cálculos de SLA
  const { data: historicoItem = [] } = useQuery({
    queryKey: ['/api/fila-x-historico'],
    queryFn: () => apiRequest('/api/fila-x/historico'),
    staleTime: 30000, // Cache por 30 segundos
  });

  // Detectar parâmetro ordem_id na URL e abrir automaticamente a edição
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ordemId = urlParams.get('ordem_id');
    
    if (ordemId && filaItems.length > 0 && !showEditOrdemModal) {
      console.log('FilaX: Detectado ordem_id na URL:', ordemId);
      console.log('FilaX: Procurando em', filaItems.length, 'cartões');
      
      // Procurar a ordem específica nos itens da fila
      const ordemEncontrada = filaItems.find((item: any) => {
        const ordensVinculadas = item.ordens_vinculadas || item.ordensVinculadas || [];
        return ordensVinculadas.some((ordem: any) => ordem.ordem_id === ordemId || ordem.ordem_carga_id === ordemId);
      });
      
      console.log('FilaX: Ordem encontrada no cartão:', ordemEncontrada?.id);
      
      if (ordemEncontrada) {
        // Encontrar a ordem específica dentro do cartão
        const ordensVinculadas = ordemEncontrada.ordens_vinculadas || ordemEncontrada.ordensVinculadas || [];
        const ordemEspecifica = ordensVinculadas.find((ordem: any) => 
          ordem.ordem_id === ordemId || ordem.ordem_carga_id === ordemId
        );
        
        console.log('FilaX: Ordem específica encontrada:', ordemEspecifica);
        
        if (ordemEspecifica && ordemEspecifica.ordem_carga_id) {
          // Abrir automaticamente a edição da ordem
          setOrdemEditando({
            id: ordemEspecifica.ordem_carga_id,
            numero_referencia: ordemEspecifica.ordem_numero || 'Ordem'
          });
          setShowEditOrdemModal(true);
          
          // Limpar o parâmetro da URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
          
          toast({
            title: "Abrindo ordem para edição",
            description: `Editando ordem ${ordemEspecifica.ordem_numero}`,
          });
        }
      } else {
        console.log('FilaX: Ordem não encontrada na fila. Verificando todos os cartões:', 
          filaItems.map((item: any) => ({
            cartao_id: item.id,
            titulo_cartao: item.titulo_cartao,
            ordens_vinculadas: item.ordens_vinculadas?.map((ordem: any) => ({
              ordem_id: ordem.ordem_id,
              ordem_carga_id: ordem.ordem_carga_id,
              ordem_numero: ordem.ordem_numero
            })) || 'undefined',
            // Mostrar estrutura completa do item para debug
            item_keys: Object.keys(item)
          }))
        );
        
        // Tentar busca alternativa pelo ID da ordem diretamente
        console.log('FilaX: Tentando busca alternativa pelo ID da ordem:', ordemId);
        
        // Como a API não está retornando ordens vinculadas, vamos buscar a ordem diretamente
        const buscarOrdemDiretamente = async () => {
          try {
            console.log('FilaX: Buscando ordem diretamente na API...');
            const response = await fetch(`/api/ordens-carga/${ordemId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            
            if (response.ok) {
              const ordemCompleta = await response.json();
              console.log('FilaX: Ordem encontrada diretamente:', ordemCompleta);
              
              // Buscar NFEs separadamente se necessário  
              try {
                const nfesResponse = await fetch(`/api/ordens-carga/${ordemId}/nfes`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                });
                
                let nfesVinculadas = [];
                if (nfesResponse.ok) {
                  nfesVinculadas = await nfesResponse.json();
                  console.log('FilaX: NFEs vinculadas encontradas:', nfesVinculadas.length);
                }
                
                setOrdemEditando({
                  ...ordemCompleta,
                  nfesVinculadas: nfesVinculadas
                });
              } catch (nfeError) {
                console.log('FilaX: Erro ao buscar NFEs, usando ordem sem NFEs:', nfeError);
                setOrdemEditando(ordemCompleta);
              }
              
              setShowEditOrdemModal(true);
              
              // Limpar parâmetro da URL
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
              
              toast({
                title: "Ordem aberta com sucesso",
                description: `Editando ordem ${ordemCompleta.numero_ordem}`,
              });
            } else {
              console.log('FilaX: API retornou erro:', response.status, response.statusText);
              toast({
                title: "Ordem não encontrada",
                description: "A ordem não foi encontrada no sistema",
                variant: "destructive"
              });
            }
          } catch (error) {
            console.error('FilaX: Erro ao buscar ordem diretamente:', error);
            toast({
              title: "Erro ao carregar ordem",
              description: "Não foi possível carregar a ordem solicitada",
              variant: "destructive"
            });
          }
        };
        
        // Executar busca direta
        buscarOrdemDiretamente();
      }
    }
  }, [filaItems, toast, showEditOrdemModal]);



  // Mutation para adicionar ordem à fila
  const addToFilaMutation = useMutation({
    mutationFn: (data: { ordem_id: string; [key: string]: any }) =>
      apiRequest('/api/fila-x', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: async (result: any) => {
      // Invalidar queries e forçar refetch para atualização instantânea
      await queryClient.invalidateQueries({ queryKey: ['/api/fila-x'] });
      await queryClient.refetchQueries({ queryKey: ['/api/fila-x'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/ordens-carga'] });
      
      setShowAddModal(false);
      setModalView('search');
      setNovaOrdemData({
        tipo_operacao: 'recebimento',
        prioridade: 'normal',
        motorista_nome: '',
        motorista_telefone: '',
        veiculo_placa: '',
        veiculo_tipo: '',
        doca_designada: '',
        observacoes: ''
      });
      
      if (result.isDuplicate && result.warning) {
        toast({
          title: "Atenção",
          description: result.warning,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Ordem adicionada à fila!"
        });
      }
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao adicionar ordem à fila.",
        variant: "destructive"
      });
    }
  });

  // Mutation para editar dados do motorista
  const editDriverMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/fila-x/${id}/editar`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fila-x'] });
      setShowEditModal(false);
      setEditingItem(null);
      setEditInfo({ motorista_nome: '', veiculo_placa: '', doca_designada: '' });
      toast({
        title: "Sucesso",
        description: "Dados do motorista atualizados com sucesso!"
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Falha ao atualizar dados do motorista.",
        variant: "destructive"
      });
    }
  });

  // Mutations para arquivamento
  const archiveItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return apiRequest(`/api/fila-x/${itemId}/arquivar`, {
        method: 'PUT'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fila-x'] });
      setShowArchiveModal(false);
      setItemToArchive(null);
      
      toast({
        title: "Item arquivado!",
        description: "O item foi arquivado com sucesso."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao arquivar item",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    }
  });

  // Mutation para arquivar estágio completo
  const archiveStageMutation = useMutation({
    mutationFn: async (stage: string) => {
      return apiRequest(`/api/fila-x/arquivar-estagio/${stage}`, {
        method: 'PUT'
      });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/fila-x'] });
      setShowArchiveModal(false);
      setStageToArchive(null);
      
      toast({
        title: "Estágio arquivado!",
        description: `${data.itemsArquivados} itens foram arquivados do estágio ${etapasConfig[data.estagio]?.label || data.estagio}.`
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao arquivar estágio",
        description: error.message || "Erro interno do servidor",
        variant: "destructive"
      });
    }
  });

  // Funções para edição de cartões existentes
  const abrirModalEdicao = (item: any) => {
    setEditingItem(item);
    setEditInfo({
      motorista_nome: item.motorista_nome || '',
      veiculo_placa: item.veiculo_placa || '',
      doca_designada: item.doca_designada || '',
      estagio_inicial: item.estagio || ''
    });
    setShowEditModal(true);
  };

  // Funções para arquivamento
  const handleArchiveItem = (item: FilaXItem) => {
    setItemToArchive(item);
    setShowArchiveModal(true);
  };

  const handleArchiveStage = (stage: string) => {
    setStageToArchive(stage);
    setShowArchiveModal(true);
  };

  const confirmArchive = () => {
    if (itemToArchive) {
      archiveItemMutation.mutate(itemToArchive.id);
    } else if (stageToArchive) {
      archiveStageMutation.mutate(stageToArchive);
    }
  };

  // Filtrar itens
  const itemsFiltrados = filaItems.filter((item: any) => {
    const matchEstagio = filtroEstagio === 'all' || item.estagio === filtroEstagio;
    const matchTipoOperacao = filtroTipoOperacao === 'all' || item.tipo_operacao === filtroTipoOperacao;
    const matchPrioridade = filtroPrioridade === 'all' || item.prioridade === filtroPrioridade;
    const matchPesquisa = pesquisa === '' || 
      item.titulo_cartao?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      item.motorista_nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      item.veiculo_placa?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      item.observacoes?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      item.motorista_nome?.toLowerCase().includes(pesquisa.toLowerCase()) ||
      item.veiculo_placa?.toLowerCase().includes(pesquisa.toLowerCase());
    
    // Filtros de data
    let matchDataInicio = true;
    let matchDataFim = true;
    
    if (filtroDataInicio) {
      const dataInicio = new Date(filtroDataInicio);
      const dataEntrada = new Date(item.data_entrada);
      matchDataInicio = dataEntrada >= dataInicio;
    }
    
    if (filtroDataFim) {
      const dataFim = new Date(filtroDataFim);
      dataFim.setHours(23, 59, 59, 999); // Incluir todo o dia
      const dataEntrada = new Date(item.data_entrada);
      matchDataFim = dataEntrada <= dataFim;
    }
    
    return matchEstagio && matchTipoOperacao && matchPrioridade && matchPesquisa && matchDataInicio && matchDataFim;
  });

  // Organizar itens por estágio sem agrupamento automático (pode ser habilitado opcionalmente)
  const itemsPorEstagio = Object.keys(etapasConfig).reduce((acc, estagio) => {
    const itemsDoEstagio = itemsFiltrados.filter((item: any) => item.estagio === estagio);
    acc[estagio] = itemsDoEstagio;
    return acc;
  }, {} as Record<string, FilaXItem[]>);



  const calcularTempoEspera = (dataEntrada: string) => {
    // Sistema já está em UTC, usar horário direto
    const agora = new Date();
    const entrada = new Date(dataEntrada);
    
    // Verificar se a data é válida
    if (isNaN(entrada.getTime())) {
      return '0m';
    }
    
    const diffMs = agora.getTime() - entrada.getTime();
    
    // Garantir que não mostre valores negativos
    if (diffMs < 0) {
      return '0m';
    }
    
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHoras > 0) {
      return `${diffHoras}h ${diffMinutos}m`;
    }
    return `${diffMinutos}m`;
  };

  // Calcular tempo total da criação até finalização/recusado
  const calcularTempoTotal = (historico: any[]) => {
    if (!historico || historico.length === 0) return null;
    
    // Buscar primeiro registro (criação) e último (finalização/recusado)
    const ordenado = [...historico].sort((a, b) => 
      new Date(a.data_acao || a.created_at).getTime() - new Date(b.data_acao || b.created_at).getTime()
    );
    
    const inicio = ordenado[0];
    const ultimoMovimento = ordenado[ordenado.length - 1];
    
    // Verificar se foi finalizado ou recusado
    const isFinalizado = ultimoMovimento.estagio_novo === 'finalizado' || ultimoMovimento.estagio_novo === 'recusado';
    
    if (!isFinalizado) {
      // Se ainda não foi finalizado, calcular tempo até agora 
      const agora = new Date();
      const inicioDate = new Date(inicio.data_acao || inicio.created_at);
      const diffMs = agora.getTime() - inicioDate.getTime();
      
      // Garantir que não mostre valores negativos
      if (diffMs < 0) {
        return null;
      }
      
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return {
        tempo: diffHoras > 0 ? `${diffHoras}h ${diffMinutos}m` : `${diffMinutos}m`,
        status: 'em_andamento',
        inicio: inicioDate,
        fim: null
      };
    }
    
    // Calcular tempo total
    const inicioDate = new Date(inicio.data_acao || inicio.created_at);
    const fimDate = new Date(ultimoMovimento.data_acao || ultimoMovimento.created_at);
    const diffMs = fimDate.getTime() - inicioDate.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      tempo: diffHoras > 0 ? `${diffHoras}h ${diffMinutos}m` : `${diffMinutos}m`,
      status: ultimoMovimento.estagio_novo,
      inicio: inicioDate,
      fim: fimDate
    };
  };

  // Função para detectar e adicionar etapas personalizadas ao config
  const detectarEtapasPersonalizadas = (dados: FilaXItem[]) => {
    const etapasEncontradas = new Set<string>();
    
    // Coletar todos os estágios dos itens atuais
    dados.forEach(item => {
      if (item.estagio) {
        etapasEncontradas.add(item.estagio);
      }
    });
    
    // Adicionar etapas não configuradas com valores padrão
    let configAtualizada = false;
    etapasEncontradas.forEach(estagio => {
      if (!etapasConfig[estagio]) {
        console.log(`FilaX: Detectada etapa personalizada não configurada: ${estagio}`);
        etapasConfig[estagio] = {
          label: estagio.charAt(0).toUpperCase() + estagio.slice(1),
          color: 'bg-gray-100 border-gray-300 text-gray-800',
          icon: Clock,
          description: `Etapa personalizada: ${estagio}`,
          slaMinutos: 30
        };
        configAtualizada = true;
      }
    });
    
    if (configAtualizada) {
      setEtapasConfig({...etapasConfig});
    }
  };

  // Calcular tempo detalhado por estágio com entrada e saída - sincronizado com estado atual
  const calcularTempoPorEstagio = (historico: any[], cartaoAtual?: FilaXItem) => {
    if (!historico || historico.length === 0) {
      return [];
    }

    // DEBUG: Log todos os registros do histórico
    console.log('calcularTempoPorEstagio: Total de registros recebidos:', historico.length);
    console.log('calcularTempoPorEstagio: Primeiros 5 registros:', historico.slice(0, 5));
    console.log('calcularTempoPorEstagio: Últimos 5 registros:', historico.slice(-5));

    // Filtrar apenas registros de mudança de estágio
    const mudancasEstagio = historico.filter(h => 
      h.acao === 'cartao_criado' || 
      h.acao === 'movido' ||
      (h.estagio_anterior && h.estagio_novo && h.estagio_anterior !== h.estagio_novo)
    );

    console.log('calcularTempoPorEstagio: Registros filtrados para mudanças de estágio:', mudancasEstagio.length);
    console.log('calcularTempoPorEstagio: Mudanças de estágio:', mudancasEstagio.map(h => ({
      acao: h.acao,
      anterior: h.estagio_anterior,
      novo: h.estagio_novo,
      data: h.data_acao || h.data_alteracao
    })));

    if (mudancasEstagio.length === 0) {
      return [];
    }

    // Ordenar histórico por data
    const ordenado = [...mudancasEstagio].sort((a, b) => 
      new Date(a.data_acao || a.data_alteracao || a.created_at).getTime() - 
      new Date(b.data_acao || b.data_alteracao || b.created_at).getTime()
    );

    const temposPorEstagio = [];
    const agora = new Date();

    // Agrupar por sequência de estágios
    for (let i = 0; i < ordenado.length; i++) {
      const movimento = ordenado[i];
      const proximoMovimento = ordenado[i + 1];
      
      const entrada = new Date(movimento.data_acao || movimento.data_alteracao || movimento.created_at);
      const saida = proximoMovimento ? 
        new Date(proximoMovimento.data_acao || proximoMovimento.data_alteracao || proximoMovimento.created_at) : 
        agora;
      
      const diffMs = saida.getTime() - entrada.getTime();
      const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      const tempoFormatado = diffHoras > 0 ? `${diffHoras}h ${diffMinutos}m` : `${diffMinutos}m`;
      
      const estagio = movimento.estagio_novo || movimento.valor_novo;
      
      // Determinar se este é o estágio ativo baseado no estado atual do cartão
      let isAtivo = false;
      if (cartaoAtual) {
        // Se é o último movimento E o estágio coincide com o estágio atual do cartão
        isAtivo = !proximoMovimento && estagio === cartaoAtual.estagio;
      } else {
        // Fallback: é ativo se é o último movimento
        isAtivo = !proximoMovimento;
      }
      
      temposPorEstagio.push({
        estagio: estagio,
        entrada: entrada.toLocaleString('pt-BR', { 
          timeZone: 'America/Sao_Paulo',
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        saida: proximoMovimento ? saida.toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          day: '2-digit',
          month: '2-digit', 
          year: 'numeric', 
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }) : 'Em andamento',
        tempo: tempoFormatado,
        usuario: movimento.usuario_nome,
        ativo: isAtivo
      });
    }

    // CORREÇÃO CRÍTICA: Se o estágio atual do cartão não está no último registro, adicionar período atual
    if (cartaoAtual && ordenado.length > 0) {
      const ultimoMovimento = ordenado[ordenado.length - 1];
      const ultimoEstagio = ultimoMovimento.estagio_novo || ultimoMovimento.valor_novo;
      
      console.log('Verificando sincronia - Último no histórico:', ultimoEstagio, 'Cartão atual:', cartaoAtual.estagio);
      
      if (cartaoAtual.estagio !== ultimoEstagio) {
        console.log('DESSINCRONIA DETECTADA - Adicionando período atual');
        
        // Marcar último registro como não ativo
        if (temposPorEstagio.length > 0) {
          temposPorEstagio[temposPorEstagio.length - 1].ativo = false;
          temposPorEstagio[temposPorEstagio.length - 1].saida = agora.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          });
        }
        
        // Adicionar o período atual que está faltando
        const ultimaDataMovimento = new Date(ultimoMovimento.data_acao || ultimoMovimento.data_alteracao);
        const tempoAtualMs = agora.getTime() - ultimaDataMovimento.getTime();
        const diffHoras = Math.floor(tempoAtualMs / (1000 * 60 * 60));
        const diffMinutos = Math.floor((tempoAtualMs % (1000 * 60 * 60)) / (1000 * 60));
        const tempoAtualFormatado = diffHoras > 0 ? `${diffHoras}h ${diffMinutos}m` : `${diffMinutos}m`;
        
        temposPorEstagio.push({
          estagio: cartaoAtual.estagio,
          entrada: ultimaDataMovimento.toLocaleString('pt-BR', {
            timeZone: 'America/Sao_Paulo',
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }),
          saida: 'Em andamento',
          tempo: tempoAtualFormatado,
          usuario: 'LEONARDO BANDEIRA',
          ativo: true
        });
      }
    }
    
    return temposPorEstagio;
  };

  // Calcular SLA por etapa - VERSÃO CORRIGIDA PARA HISTÓRICO COMPLETO
  const calcularSLAPorEtapa = (historico: any[], item?: FilaXItem) => {
    if (!item) return [];
    
    // Configurações SLA das etapas
    const slaEtapas: Record<string, number> = {};
    Object.keys(etapasConfig).forEach(key => {
      slaEtapas[key] = etapasConfig[key].slaMinutos || 30;
    });
    
    const agora = new Date();
    const entrada = new Date(item.data_entrada);
    
    // Normalizar estágio legado "apresentar" para "aguardando_doca"
    const estagioNormalizado = item.estagio === 'apresentar' ? 'aguardando_doca' : item.estagio;
    
    // FILTRAR APENAS HISTÓRICO DESTE CARTÃO ESPECÍFICO
    const historicoCartao = historico ? historico.filter(h => h.fila_x_id === item.id) : [];
    
    // Se não há histórico específico, mostrar apenas estágio atual
    if (!historicoCartao || historicoCartao.length === 0) {
      const tempoTotalMs = agora.getTime() - entrada.getTime();
      const tempoTotalMinutos = Math.floor(tempoTotalMs / (1000 * 60));
      const slaEtapaAtual = slaEtapas[estagioNormalizado] || 30;
      
      return [{
        estagio: estagioNormalizado,
        inicio: entrada,
        fim: null,
        tempoMinutos: tempoTotalMinutos,
        slaMinutos: slaEtapaAtual,
        dentrodoSLA: tempoTotalMinutos <= slaEtapaAtual,
        ativo: true
      }];
    }
    
    // Processar eventos do cartão específico
    const eventos = historicoCartao
      .filter(h => h.acao === 'cartao_criado' || h.acao === 'movido')
      .sort((a, b) => new Date(a.data_acao || a.created_at).getTime() - new Date(b.data_acao || b.created_at).getTime());
    
    if (eventos.length === 0) {
      // Fallback para estágio atual
      const tempoTotalMs = agora.getTime() - entrada.getTime();
      const tempoTotalMinutos = Math.floor(tempoTotalMs / (1000 * 60));
      const slaEtapaAtual = slaEtapas[estagioNormalizado] || 30;
      
      return [{
        estagio: estagioNormalizado,
        inicio: entrada,
        fim: null,
        tempoMinutos: tempoTotalMinutos,
        slaMinutos: slaEtapaAtual,
        dentrodoSLA: tempoTotalMinutos <= slaEtapaAtual,
        ativo: true
      }];
    }
    
    const resultado = [];
    
    // Normalizar estágios legados no histórico
    const eventosNormalizados = eventos.map(e => ({
      ...e,
      estagio_anterior: e.estagio_anterior === 'apresentar' ? 'aguardando_doca' : e.estagio_anterior,
      estagio_novo: e.estagio_novo === 'apresentar' ? 'aguardando_doca' : e.estagio_novo
    }));
    
    // NOVA LÓGICA: Construir linha do tempo completa E CONSOLIDAR POR ESTÁGIO
    let dataInicio = entrada;
    let estagioAtual = 'triagem'; // Assumir que sempre começa em triagem
    const periodos: any[] = [];
    
    // Processar cada evento em ordem cronológica
    for (let i = 0; i < eventosNormalizados.length; i++) {
      const evento = eventosNormalizados[i];
      
      if (evento.acao === 'cartao_criado') {
        estagioAtual = evento.estagio_novo || 'triagem';
        dataInicio = new Date(evento.data_acao || evento.created_at);
      } else if (evento.acao === 'movido') {
        // Finalizar período do estágio anterior
        const dataFim = new Date(evento.data_acao || evento.created_at);
        const tempoMinutos = Math.floor((dataFim.getTime() - dataInicio.getTime()) / (1000 * 60));
        
        periodos.push({
          estagio: estagioAtual,
          inicio: dataInicio,
          fim: dataFim,
          tempoMinutos: Math.max(0, tempoMinutos),
          ativo: false
        });
        
        // Iniciar novo período
        estagioAtual = evento.estagio_novo;
        dataInicio = dataFim;
      }
    }
    
    // Adicionar período atual (se ainda ativo)
    if (estagioAtual === estagioNormalizado) {
      const tempoMinutos = Math.floor((agora.getTime() - dataInicio.getTime()) / (1000 * 60));
      
      periodos.push({
        estagio: estagioAtual,
        inicio: dataInicio,
        fim: null,
        tempoMinutos: Math.max(0, tempoMinutos),
        ativo: true
      });
    }
    
    // CONSOLIDAR TEMPOS POR ESTÁGIO
    const temposConsolidados = new Map<string, any>();
    
    periodos.forEach(periodo => {
      const key = periodo.estagio;
      
      if (temposConsolidados.has(key)) {
        // Somar o tempo ao estágio existente
        const existente = temposConsolidados.get(key);
        existente.tempoMinutos += periodo.tempoMinutos;
        
        // Manter início mais antigo e fim mais recente
        if (periodo.inicio < existente.inicio) {
          existente.inicio = periodo.inicio;
        }
        if (periodo.fim && (!existente.fim || periodo.fim > existente.fim)) {
          existente.fim = periodo.fim;
        }
        
        // Marcar como ativo se algum período for ativo
        if (periodo.ativo) {
          existente.ativo = true;
          existente.fim = null; // Reset fim para "Em andamento"
        }
      } else {
        // Criar nova entrada consolidada
        const slaMinutos = slaEtapas[key] || 30;
        temposConsolidados.set(key, {
          estagio: key,
          inicio: periodo.inicio,
          fim: periodo.fim,
          tempoMinutos: periodo.tempoMinutos,
          slaMinutos,
          dentrodoSLA: slaMinutos === 0 || periodo.tempoMinutos <= slaMinutos,
          ativo: periodo.ativo
        });
      }
    });
    
    // Converter Map para Array e recalcular SLA com tempo consolidado
    const resultadoConsolidado = Array.from(temposConsolidados.values()).map(item => ({
      ...item,
      dentrodoSLA: item.slaMinutos === 0 || item.tempoMinutos <= item.slaMinutos
    }));
    
    return resultadoConsolidado;
  };

  // Função para calcular responsabilidade por SLA
  const calcularResponsabilidadeSLA = useCallback((historico: any[], itemAtual: any) => {
    if (!historico || historico.length === 0) {
      return [];
    }

    // Ordenar por data
    const historicoOrdenado = [...historico].sort((a, b) => 
      new Date(a.data_acao || a.created_at).getTime() - new Date(b.data_acao || b.created_at).getTime()
    );

    const responsabilidades: any[] = [];
    
    // Lógica corrigida: analisar todo o tempo desde a criação do cartão
    if (historicoOrdenado.length > 0) {
      // Primeiro evento (criação do cartão) - responsabilidade inicial
      const primeiroEvento = historicoOrdenado[0];
      const inicioCartao = new Date(primeiroEvento.data_acao || primeiroEvento.created_at);
      
      // Buscar movimentos (mudanças de estágio) 
      const movimentos = historicoOrdenado.filter(h => 
        h.acao === 'movido' || 
        (h.estagio_anterior && h.estagio_novo && h.estagio_anterior !== h.estagio_novo)
      );
      
      // Se não há movimentos, analisar desde a criação até agora
      if (movimentos.length === 0) {
        const agora = new Date();
        const tempoMinutos = Math.floor((agora.getTime() - inicioCartao.getTime()) / (1000 * 60));
        const estagioAtual = itemAtual?.estagio || 'triagem';
        const slaMinutos = ESTAGIOS[estagioAtual as keyof typeof ESTAGIOS]?.slaMinutos || 
                         etapasConfig[estagioAtual]?.slaMinutos || 60;
        const dentrodoSLA = tempoMinutos <= slaMinutos;
        
        responsabilidades.push({
          estagio: estagioAtual,
          usuario_responsavel: primeiroEvento.usuario_nome || 'Sistema',
          usuario_id: primeiroEvento.usuario_id,
          inicio: inicioCartao,
          fim: null,
          tempoMinutos,
          slaMinutos,
          dentrodoSLA,
          atraso: dentrodoSLA ? 0 : tempoMinutos - slaMinutos,
          em_andamento: true,
          data_movimento: inicioCartao
        });
      } else {
        // Analisar cada movimento
        let inicioAtual = inicioCartao;
        let estagioAtual = 'triagem'; // Estágio inicial
        let usuarioAtual = primeiroEvento.usuario_nome || 'Sistema';
        let usuarioIdAtual = primeiroEvento.usuario_id;
        
        for (let i = 0; i < movimentos.length; i++) {
          const movimento = movimentos[i];
          const fimEtapa = new Date(movimento.data_acao || movimento.created_at);
          
          const tempoMinutos = Math.floor((fimEtapa.getTime() - inicioAtual.getTime()) / (1000 * 60));
          const slaMinutos = ESTAGIOS[estagioAtual as keyof typeof ESTAGIOS]?.slaMinutos || 
                           etapasConfig[estagioAtual]?.slaMinutos || 60;
          const dentrodoSLA = tempoMinutos <= slaMinutos;
          
          responsabilidades.push({
            estagio: estagioAtual,
            usuario_responsavel: usuarioAtual,
            usuario_id: usuarioIdAtual,
            inicio: inicioAtual,
            fim: fimEtapa,
            tempoMinutos,
            slaMinutos,
            dentrodoSLA,
            atraso: dentrodoSLA ? 0 : tempoMinutos - slaMinutos,
            em_andamento: false,
            data_movimento: inicioAtual
          });
          
          // Preparar para próxima etapa
          inicioAtual = fimEtapa;
          estagioAtual = movimento.estagio_novo || itemAtual?.estagio || 'triagem';
          usuarioAtual = movimento.usuario_nome || 'Sistema';
          usuarioIdAtual = movimento.usuario_id;
        }
        
        // Etapa atual (em andamento)
        const agora = new Date();
        const tempoMinutos = Math.floor((agora.getTime() - inicioAtual.getTime()) / (1000 * 60));
        const slaMinutos = ESTAGIOS[estagioAtual as keyof typeof ESTAGIOS]?.slaMinutos || 
                         etapasConfig[estagioAtual]?.slaMinutos || 60;
        const dentrodoSLA = tempoMinutos <= slaMinutos;
        
        responsabilidades.push({
          estagio: estagioAtual,
          usuario_responsavel: usuarioAtual,
          usuario_id: usuarioIdAtual,
          inicio: inicioAtual,
          fim: null,
          tempoMinutos,
          slaMinutos,
          dentrodoSLA,
          atraso: dentrodoSLA ? 0 : tempoMinutos - slaMinutos,
          em_andamento: true,
          data_movimento: inicioAtual
        });
      }
    }

    return responsabilidades.sort((a, b) => a.data_movimento.getTime() - b.data_movimento.getTime());
  }, []);

  // Função para analisar SLA por usuário em um período
  const analisarSLAPorUsuario = useCallback((historicoTodos: any[], filtroUsuarioId?: string, dataInicio?: Date, dataFim?: Date) => {
    if (!historicoTodos || historicoTodos.length === 0) return [];

    const usuariosAnalise: Record<string, any> = {};
    
    // Processar cada item da fila
    filaItems.forEach((item: any) => {
      const responsabilidades = calcularResponsabilidadeSLA(historicoItem, item);
      
      responsabilidades.forEach((resp: any) => {
        // Filtrar por usuário se especificado
        if (filtroUsuarioId && filtroUsuarioId !== 'all' && resp.usuario_id !== filtroUsuarioId) {
          return;
        }
        
        // Filtrar por período se especificado
        if (dataInicio && resp.inicio < dataInicio) return;
        if (dataFim && resp.inicio > dataFim) return;
        
        const userId = resp.usuario_id || 'unknown';
        const userName = resp.usuario_responsavel || 'Usuário não identificado';
        
        if (!usuariosAnalise[userId]) {
          usuariosAnalise[userId] = {
            usuario_id: userId,
            usuario_nome: userName,
            total_etapas: 0,
            etapas_no_prazo: 0,
            etapas_atrasadas: 0,
            tempo_total_minutos: 0,
            atraso_total_minutos: 0,
            etapas_por_tipo: {},
            percentual_sla: 0,
            tempo_medio_minutos: 0
          };
        }
        
        const userStats = usuariosAnalise[userId];
        userStats.total_etapas++;
        userStats.tempo_total_minutos += resp.tempoMinutos;
        
        if (resp.dentrodoSLA) {
          userStats.etapas_no_prazo++;
        } else {
          userStats.etapas_atrasadas++;
          userStats.atraso_total_minutos += resp.atraso;
        }
        
        // Estatísticas por tipo de etapa
        if (!userStats.etapas_por_tipo[resp.estagio]) {
          userStats.etapas_por_tipo[resp.estagio] = {
            total: 0,
            no_prazo: 0,
            atrasadas: 0,
            tempo_total: 0,
            atraso_total: 0
          };
        }
        
        const etapaStats = userStats.etapas_por_tipo[resp.estagio];
        etapaStats.total++;
        etapaStats.tempo_total += resp.tempoMinutos;
        
        if (resp.dentrodoSLA) {
          etapaStats.no_prazo++;
        } else {
          etapaStats.atrasadas++;
          etapaStats.atraso_total += resp.atraso;
        }
      });
    });

    // Calcular percentuais e médias
    Object.values(usuariosAnalise).forEach((userStats: any) => {
      userStats.percentual_sla = userStats.total_etapas > 0 ? 
        Math.round((userStats.etapas_no_prazo / userStats.total_etapas) * 100) : 0;
      userStats.tempo_medio_minutos = userStats.total_etapas > 0 ? 
        Math.round(userStats.tempo_total_minutos / userStats.total_etapas) : 0;
    });

    return Object.values(usuariosAnalise).sort((a: any, b: any) => b.percentual_sla - a.percentual_sla);
  }, [filaItems, historicoItem, calcularResponsabilidadeSLA]);

  const handleMoverItem = (item: FilaXItem, novoEstagio: string) => {
    moveItemMutation.mutate({ 
      id: item.id, 
      novoEstagio,
      observacoes: `Movido para ${(etapasConfig as any)[novoEstagio]?.label || novoEstagio} em ${new Date().toLocaleString()}`
    });
  };

  // Calcular SLA global considerando todos os itens filtrados
  const calcularSLAGlobal = useMemo(() => {
    if (itemsFiltrados.length === 0) {
      return {
        totalItens: 0,
        dentroSLA: 0,
        foraSLA: 0,
        percentualSLA: 0,
        tempoMedioTotal: 0,
        slasPorEstagio: []
      };
    }

    const resultados = {
      totalItens: itemsFiltrados.length,
      dentroSLA: 0,
      foraSLA: 0,
      tempoMedioTotal: 0,
      slasPorEstagio: [] as Array<{
        estagio: string,
        total: number,
        dentroSLA: number,
        foraSLA: number,
        percentual: number,
        tempoMedio: number
      }>
    };

    let somaTemposTotal = 0;
    const estatisticasPorEstagio: Record<string, any> = {};

    // Inicializar estatísticas por estágio
    Object.keys(etapasConfig).forEach(estagio => {
      estatisticasPorEstagio[estagio] = {
        estagio,
        total: 0,
        dentroSLA: 0,
        foraSLA: 0,
        temposTotal: 0
      };
    });

    itemsFiltrados.forEach((item: FilaXItem) => {
      // Calcular SLA para este item específico usando o histórico real
      const slaEtapas = calcularSLAPorEtapa(historicoItem || [], item);
      
      if (slaEtapas.length > 0) {
        slaEtapas.forEach(etapa => {
          const stats = estatisticasPorEstagio[etapa.estagio];
          if (stats) {
            stats.total++;
            stats.temposTotal += etapa.tempoMinutos;
            
            if (etapa.dentrodoSLA) {
              stats.dentroSLA++;
            } else {
              stats.foraSLA++;
            }
          }
        });

        // Para o SLA geral, verificar se todas as etapas estão dentro do SLA
        const todasDentroSLA = slaEtapas.every(etapa => etapa.dentrodoSLA || etapa.slaMinutos === 0);
        
        if (todasDentroSLA) {
          resultados.dentroSLA++;
        } else {
          resultados.foraSLA++;
        }

        // Calcular tempo total do item
        const tempoTotalItem = slaEtapas.reduce((acc, etapa) => acc + etapa.tempoMinutos, 0);
        somaTemposTotal += tempoTotalItem;
      }
    });

    // Calcular percentuais e médias
    const percentualSLA = resultados.totalItens > 0 ? Math.round((resultados.dentroSLA / resultados.totalItens) * 100) : 0;
    resultados.tempoMedioTotal = resultados.totalItens > 0 ? Math.round(somaTemposTotal / resultados.totalItens) : 0;

    // Processar estatísticas por estágio
    resultados.slasPorEstagio = Object.values(estatisticasPorEstagio)
      .filter((stats: any) => stats.total > 0)
      .map((stats: any) => ({
        ...stats,
        percentual: Math.round((stats.dentroSLA / stats.total) * 100),
        tempoMedio: Math.round(stats.temposTotal / stats.total)
      }));

    return { ...resultados, percentualSLA };
  }, [itemsFiltrados]);

  // Renderizar visão imersiva para TV
  const renderImmersiveView = () => (
    <div className="fixed inset-0 z-50 bg-gray-900 text-white">
      <div className="flex justify-between items-center p-6 bg-gray-800">
        <h1 className="text-4xl font-bold">FilaX - Monitor de Operações</h1>
        <Button
          variant="ghost"
          size="lg"
          onClick={() => setShowImmersiveView(false)}
          className="text-white hover:bg-gray-700"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>
      
      <div className={`grid grid-cols-${Math.min(Object.keys(etapasConfig).length, 5)} gap-4 p-6 h-full overflow-hidden`}>
        {Object.entries(etapasConfig).map(([estagioId, estagio]) => {
          const items = itemsPorEstagio[estagioId] || [];
          const Icon = estagio.icon;
          
          return (
            <div key={estagioId} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <Icon className="h-8 w-8 text-white" />
                <div>
                  <h3 className="text-xl font-bold">{estagio.label}</h3>
                  <p className="text-sm text-gray-400">{items.length} item(s)</p>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg">{item.veiculo_placa || 'S/PLACA'}</span>
                      {item.prioridade === 'urgente' && (
                        <Badge className="bg-red-600 text-white animate-pulse">URGENTE</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{item.motorista_nome || 'Motorista não informado'}</span>
                      </div>
                      
                      {item.doca_designada && (
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg mt-2 mb-2">
                          <div className="flex items-center justify-center gap-2 text-center">
                            <MapPin className="h-6 w-6" />
                            <div>
                              <div className="text-xs font-medium">DOCA</div>
                              <div className="text-2xl font-bold">{item.doca_designada}</div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Tempo: {calcularTempoEspera(item.data_entrada)}</span>
                      </div>
                      
                      <div className="text-xs text-gray-300 mt-2">
                        {item.titulo_cartao || `Cartão ${item.id.substring(0, 8)}`} - {TIPOS_OPERACAO[item.tipo_operacao]?.label}
                        {(item as any).quantidadeOrdens > 1 && (
                          <div className="bg-yellow-500 text-black px-2 py-1 rounded mt-1 text-xs font-bold flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {(item as any).quantidadeOrdens} ORDENS VINCULADAS
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {items.length === 0 && (
                  <div className="text-center text-gray-400 py-8">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum item neste estágio</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  if (showImmersiveView) {
    return renderImmersiveView();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavbar />
      <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-4`}>
      {/* Header */}
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'}`}>
        <div>
          <h1 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}>FilaX - Gestão de Pátio</h1>
          <p className="text-gray-600 text-sm">Sistema de gerenciamento de fila para recebimento</p>
        </div>
        
        <div className={`flex gap-2 ${isMobile ? 'flex-wrap' : ''}`}>
          <Button
            variant="outline"
            size={isMobile ? "sm" : "default"}
            onClick={() => setShowImmersiveView(true)}
            className="flex items-center gap-2"
          >
            <Monitor className="h-4 w-4" />
            {!isMobile && "Visão TV"}
          </Button>
          
          <Button 
            onClick={() => setShowAddModal(true)}
            size={isMobile ? "sm" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {isMobile ? "Adicionar" : "Adicionar à Fila"}
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="pesquisa">Pesquisar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="pesquisa"
                  placeholder="Ordem, empresa, motorista..."
                  value={pesquisa}
                  onChange={(e) => setPesquisa(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="filtro-estagio">Estágio</Label>
              <Select value={filtroEstagio} onValueChange={setFiltroEstagio}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(ESTAGIOS).map(([key, estagio]) => (
                    <SelectItem key={key} value={key}>{estagio.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtro-tipo-operacao">Tipo de Operação</Label>
              <Select value={filtroTipoOperacao} onValueChange={setFiltroTipoOperacao}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(TIPOS_OPERACAO).map(([key, tipo]) => (
                    <SelectItem key={key} value={key}>{tipo.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtro-status">Status</Label>
              <Select value={filtroStatus} onValueChange={(value: 'ativas' | 'arquivadas') => setFiltroStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativas">Ordens Ativas</SelectItem>
                  <SelectItem value="arquivadas">Ordens Arquivadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
            <div>
              <Label htmlFor="filtro-data-inicio">Data Início</Label>
              <Input
                id="filtro-data-inicio"
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filtro-data-fim">Data Fim</Label>
              <Input
                id="filtro-data-fim"
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setPesquisa('');
                  setFiltroEstagio('all');
                  setFiltroTipoOperacao('all');
                  setFiltroDataInicio('');
                  setFiltroDataFim('');
                  setFiltroUsuario('all');
                  setFiltroStatus('ativas');
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowSLAAnalysis(true)}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Análise SLA
              </Button>
              

            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {/* SLA Global */}
        <Card className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">SLA Global</p>
                <p className="text-2xl font-bold text-blue-600">
                  {calcularSLAGlobal.percentualSLA}%
                </p>
                <div className="flex gap-2 text-xs mt-1">
                  <span className="text-green-600">✓ {calcularSLAGlobal.dentroSLA}</span>
                  <span className="text-red-600">✗ {calcularSLAGlobal.foraSLA}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Tempo médio: {Math.floor(calcularSLAGlobal.tempoMedioTotal / 60)}h {calcularSLAGlobal.tempoMedioTotal % 60}m
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas por Estágio com SLA */}
        {Object.entries(etapasConfig).map(([key, estagio]) => {
          const count = itemsPorEstagio[key]?.length || 0;
          const Icon = estagio.icon;
          
          // Calcular SLA baseado no histórico completo de cartões que passaram por esta etapa
          const itensEstagio = itemsPorEstagio[key] || [];
          let slaEstagio = { dentroSLA: 0, foraSLA: 0, percentual: 0, tempoMedioMinutos: 0, tempoTotalMinutos: 0 };
          
          // Buscar todos os cartões (atuais + histórico) que passaram por esta etapa
          const todosCartoes = filaItems;
          

          
          const cartoesQuePassaramPorEtapa = todosCartoes.filter(item => {
            // Verificar se tem histórico de movimentação para esta etapa
            const historicoItemFiltrado = historicoItem.filter(h => h.item_id === item.id);
            

            
            // Incluir cartões atualmente na etapa
            if (item.estagio === key) {
              return true;
            }
            
            // Incluir cartões que já passaram por esta etapa (histórico)
            // Verificar se cartão esteve nesta etapa ou mudou desta etapa
            const passsouPorEtapa = historicoItemFiltrado.some(h => 
              // Cartão foi movido PARA esta etapa (valor_novo)
              (h.campo_alterado === key && h.valor_novo === key) ||
              (h.estagio_novo === key) ||
              // Cartão foi movido DE esta etapa (valor_anterior) 
              (h.campo_alterado === key && h.valor_anterior === key) ||
              (h.estagio_anterior === key) ||
              // Formato alternativo do histórico
              (h.campo_alterado === 'estagio' && h.valor_novo === key) ||
              (h.campo_alterado === 'estagio' && h.valor_anterior === key)
            );
            

            
            return passsouPorEtapa;
          });
          
          if (cartoesQuePassaramPorEtapa.length > 0) {
            let somaTempos = 0;
            const slaConfigurado = etapasConfig[key]?.slaMinutos || 30;
            
            // Processando SLA histórico para esta etapa
            
            cartoesQuePassaramPorEtapa.forEach(item => {
              const historicoItemCompleto = historicoItem.filter(h => h.item_id === item.id).sort((a, b) => 
                new Date(a.data_alteracao).getTime() - new Date(b.data_alteracao).getTime()
              );
              
              let tempoNaEtapaMinutos = 0;
              
              if (item.estagio === key) {
                // Cartão atualmente na etapa - calcular tempo desde quando entrou NESTA etapa
                const agora = new Date();
                
                // Buscar quando entrou especificamente nesta etapa
                const entradaNaEtapa = historicoItemCompleto.find(h => 
                  h.campo_alterado === 'estagio' && h.valor_novo === key
                );
                
                if (entradaNaEtapa) {
                  // Se encontrou histórico de entrada nesta etapa, usar essa data
                  const entrada = new Date(entradaNaEtapa.data_alteracao);
                  tempoNaEtapaMinutos = Math.floor((agora.getTime() - entrada.getTime()) / (1000 * 60));
                } else {
                  // Se não tem histórico (cartão criado diretamente nesta etapa), usar data_entrada
                  const entrada = new Date(item.data_entrada);
                  tempoNaEtapaMinutos = Math.floor((agora.getTime() - entrada.getTime()) / (1000 * 60));
                }
              } else {
                // Cartão que já passou pela etapa - calcular tempo histórico
                const entradaNaEtapa = historicoItemCompleto.find(h => 
                  h.campo_alterado === 'estagio' && h.valor_novo === key
                );
                const saidaDaEtapa = historicoItemCompleto.find(h => 
                  h.campo_alterado === 'estagio' && 
                  h.valor_anterior === key &&
                  new Date(h.data_alteracao) > new Date(entradaNaEtapa?.data_alteracao || 0)
                );
                
                if (entradaNaEtapa && saidaDaEtapa) {
                  const entrada = new Date(entradaNaEtapa.data_alteracao);
                  const saida = new Date(saidaDaEtapa.data_alteracao);
                  tempoNaEtapaMinutos = Math.floor((saida.getTime() - entrada.getTime()) / (1000 * 60));
                } else if (entradaNaEtapa) {
                  // Entrou mas ainda não saiu - usar tempo até agora
                  const entrada = new Date(entradaNaEtapa.data_alteracao);
                  const agora = new Date();
                  tempoNaEtapaMinutos = Math.floor((agora.getTime() - entrada.getTime()) / (1000 * 60));
                }
              }
              
              // Verificar se cumpriu o SLA
              const dentrodoSLA = tempoNaEtapaMinutos <= slaConfigurado;
              
              if (dentrodoSLA) {
                slaEstagio.dentroSLA++;
              } else {
                slaEstagio.foraSLA++;
              }
              

              
              somaTempos += tempoNaEtapaMinutos;
              

            });
            
            slaEstagio.percentual = Math.round((slaEstagio.dentroSLA / cartoesQuePassaramPorEtapa.length) * 100);
            

            slaEstagio.tempoMedioMinutos = Math.round(somaTempos / cartoesQuePassaramPorEtapa.length);
            slaEstagio.tempoTotalMinutos = somaTempos;
            

          }
          
          return (
            <Card key={key} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-600">{estagio.label}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        onClick={() => {
                          setEtapaEditando(key);
                          setShowEtapaEditor(true);
                        }}
                      >
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-2xl font-bold">{count}</p>
                    {count > 0 && (
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            slaEstagio.percentual >= 80 ? 'bg-green-500' : 
                            slaEstagio.percentual >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}></div>
                          <span className={`text-xs font-medium ${
                            slaEstagio.percentual >= 80 ? 'text-green-600' : 
                            slaEstagio.percentual >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            SLA {slaEstagio.percentual}%
                          </span>
                        </div>
                        {slaEstagio.tempoMedioMinutos > 0 && (
                          <div className="text-xs text-gray-500">
                            Tempo médio: {Math.floor(slaEstagio.tempoMedioMinutos / 60) > 0 ? 
                              `${Math.floor(slaEstagio.tempoMedioMinutos / 60)}h ${slaEstagio.tempoMedioMinutos % 60}m` : 
                              `${slaEstagio.tempoMedioMinutos}m`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board com Drag & Drop */}
      <DragDropContext onDragEnd={handleCardDragEnd}>
        <div className={`${isMobile ? 'flex flex-col gap-4' : 'flex gap-6 overflow-x-auto'}`}>
          {Object.entries(etapasConfig).map(([key, estagio]) => {
            const items = itemsPorEstagio[key] || [];
            const Icon = estagio.icon;
            
            return (
              <div key={key} className={`space-y-4 ${isMobile ? 'w-full' : 'flex-shrink-0 min-w-[300px] max-w-[350px]'}`}>
                <Card className={`${estagio.color} border-2`}>
                  <CardHeader className="pb-3">
                    <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-sm'}`}>
                      <Icon className="h-4 w-4" />
                      {estagio.label}
                      <Badge variant="secondary" className="ml-auto">
                        {items.length}
                      </Badge>
                      {items.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleArchiveStage(key)}
                          title={`Arquivar todos os ${items.length} itens deste estágio`}
                          className="h-6 w-6 p-0 hover:bg-red-100 rounded-full ml-1"
                        >
                          <ArchiveX className="h-3 w-3 text-red-600" />
                        </Button>
                      )}
                    </CardTitle>
                    {!isMobile && <p className="text-xs opacity-75">{estagio.description}</p>}
                  </CardHeader>
                </Card>
                
                <Droppable droppableId={key}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-all duration-300 ${
                        snapshot.isDraggingOver ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 border-dashed shadow-inner scale-102' : 'bg-gray-50/50'
                      }`}
                    >
                      {items.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`transition-all ${snapshot.isDragging ? 'rotate-3 shadow-lg' : ''}`}
                            >
                              <Card className={`mb-3 cursor-grab hover:shadow-md transition-all duration-200 ${snapshot.isDragging ? 'shadow-xl scale-105 rotate-2 bg-blue-50 border-blue-300' : 'hover:scale-102'}`}>
                                <CardContent className={`${isMobile ? 'p-3' : 'p-4'} relative`} {...provided.dragHandleProps}>
                                  
                                  {/* Ícones de ação posicionados absolutamente no canto superior direito */}
                                  <div className="absolute top-2 right-2 flex gap-1 z-10">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCartaoSelecionado(item);
                                        setShowOrdensModal(true);
                                      }}
                                      title="Gerenciar ordens do cartão"
                                      className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} p-0 hover:bg-blue-100 rounded-full transition-colors duration-200 bg-white/80 backdrop-blur-sm border border-gray-200`}
                                    >
                                      <Package className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedItem(item);
                                        setShowDetailsModal(true);
                                      }}
                                      title="Ver detalhes"
                                      className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} p-0 hover:bg-green-100 rounded-full transition-colors duration-200 bg-white/80 backdrop-blur-sm border border-gray-200`}
                                    >
                                      <Eye className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingItem(item);
                                        setEditInfo({
                                          motorista_nome: item.motorista_nome || '',
                                          veiculo_placa: item.veiculo_placa || '',
                                          doca_designada: item.doca_designada || '',
                                          estagio_inicial: item.estagio || ''
                                        });
                                        setShowEditModal(true);
                                      }}
                                      title="Editar dados do motorista"
                                      className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} p-0 hover:bg-orange-100 rounded-full transition-colors duration-200 bg-white/80 backdrop-blur-sm border border-gray-200`}
                                    >
                                      <Edit className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleArchiveItem(item);
                                      }}
                                      title="Arquivar item"
                                      className={`${isMobile ? 'h-6 w-6' : 'h-7 w-7'} p-0 hover:bg-red-100 rounded-full transition-colors duration-200 bg-white/80 backdrop-blur-sm border border-gray-200`}
                                    >
                                      <Archive className={`${isMobile ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-red-600`} />
                                    </Button>
                                  </div>

                                  <div className="pr-20">
                                    {/* Header com título e grip */}
                                    <div className="flex items-center gap-2 mb-2">
                                      <div className="cursor-grab flex-shrink-0">
                                        <GripVertical className={`h-4 w-4 ${snapshot.isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                                      </div>
                                      <h4 className={`font-semibold ${isMobile ? 'text-sm' : 'text-sm'} flex-1`}>
                                        {item.titulo_cartao || 
                                         (item.motorista_nome && item.veiculo_placa ? `${item.motorista_nome} - ${item.veiculo_placa}` :
                                          item.motorista_nome ? item.motorista_nome :
                                          item.veiculo_placa ? `Veículo ${item.veiculo_placa}` :
                                          `Cartão ${item.id.substring(0, 8)}`)}
                                        {(item as any).ordensVinculadas && (item as any).ordensVinculadas.length > 1 && (
                                          <Badge variant="secondary" className="text-xs ml-2 bg-yellow-100 text-yellow-800">
                                            {(item as any).ordensVinculadas.length} ordens
                                          </Badge>
                                        )}
                                      </h4>
                                    </div>
                                    
                                    {/* Badges em linha separada */}
                                    <div className="flex flex-wrap gap-1 mb-2 ml-6">
                                      <Badge variant="outline" className="text-xs">
                                        <Package className="h-3 w-3 mr-1" />
                                        {(() => {
                                          const quantidadeOrdens = (item as any).ordensVinculadas?.length || 0;
                                          return quantidadeOrdens > 1 
                                            ? `${quantidadeOrdens} ordens` 
                                            : quantidadeOrdens === 1 
                                              ? '1 ordem' 
                                              : 'Sem ordem';
                                        })()}
                                      </Badge>
                                      <Badge className={TIPOS_OPERACAO[item.tipo_operacao]?.color || 'bg-gray-100'}>
                                        {(() => {
                                          const TipoIcon = TIPOS_OPERACAO[item.tipo_operacao]?.icon || Package;
                                          return <TipoIcon className="h-3 w-3 mr-1" />;
                                        })()}
                                        {isMobile ? '' : TIPOS_OPERACAO[item.tipo_operacao]?.label || item.tipo_operacao}
                                      </Badge>
                                      {item.prioridade && item.prioridade !== 'normal' && (
                                        <Badge className={PRIORIDADES[item.prioridade]?.color || 'bg-gray-100'}>
                                          {PRIORIDADES[item.prioridade]?.label || item.prioridade}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    {/* Informações detalhadas */}
                                    <div className="space-y-1 text-xs ml-6">
                                      {item.veiculo_placa && (
                                        <div className="flex items-center gap-1">
                                          <Truck className="h-3 w-3" />
                                          <span className="font-medium">{item.veiculo_placa}</span>
                                        </div>
                                      )}
                                      {item.motorista_nome && (
                                        <div className="flex items-center gap-1">
                                          <User className="h-3 w-3" />
                                          <span>{item.motorista_nome}</span>
                                        </div>
                                      )}
                                      {item.doca_designada && (
                                        <div className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" />
                                          <span>Doca: {item.doca_designada}</span>
                                        </div>
                                      )}
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>Espera: {calcularTempoEspera(item.data_entrada)}</span>
                                        {(() => {
                                          const tempoMinutos = Math.floor((new Date().getTime() - new Date(item.data_entrada).getTime()) / (1000 * 60));
                                          const slaAtual = etapasConfig[item.estagio]?.slaMinutos || 30;
                                          const dentrodoSLA = tempoMinutos <= slaAtual;
                                          return !dentrodoSLA && (
                                            <span className="text-red-500 text-xs ml-1" title={`SLA de ${slaAtual}min ultrapassado`}>⚠️</span>
                                          );
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Botões de movimentação rápida para mobile */}
                                  {isMobile && (
                                    <div className="flex gap-1 mt-3 flex-wrap">
                                      {Object.keys(ESTAGIOS).map((estagio) => {
                                        if (estagio === item.estagio) return null;
                                        
                                        return (
                                          <Button
                                            key={estagio}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs px-2 py-1 h-6"
                                            onClick={() => handleMoverItem(item, estagio)}
                                          >
                                            {ESTAGIOS[estagio as keyof typeof ESTAGIOS].label}
                                          </Button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {items.length === 0 && (
                        <Card className="border-dashed">
                          <CardContent className={`${isMobile ? 'p-6' : 'p-8'} text-center`}>
                            <p className="text-sm text-gray-500">
                              {isMobile ? 'Vazio' : 'Nenhum item neste estágio'}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Modal de Detalhes */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="dialog-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Package className="h-6 w-6" />
              {selectedItem ? (
                selectedItem.titulo_cartao || 
                (selectedItem.motorista_nome && selectedItem.veiculo_placa ? `${selectedItem.motorista_nome} - ${selectedItem.veiculo_placa}` :
                 selectedItem.motorista_nome ? selectedItem.motorista_nome :
                 selectedItem.veiculo_placa ? `Veículo ${selectedItem.veiculo_placa}` :
                 `Cartão ${selectedItem.id.substring(0, 8)}`)
              ) : 'Detalhes da Ordem na Fila'}
            </DialogTitle>
            <div id="dialog-description" className="sr-only">
              Visualize informações detalhadas sobre o cartão na fila, incluindo ordens vinculadas e histórico de alterações.
            </div>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-6">
              {/* Header Card com informações principais */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <Label className="text-sm text-gray-600">Número da Ordem</Label>
                      <p className="font-bold text-lg text-blue-800">{selectedItem.titulo_cartao || `Cartão ${selectedItem.id.substring(0, 8)}`}</p>
                    </div>
                    <div className="text-center">
                      <Label className="text-sm text-gray-600">Status Atual</Label>
                      <div className="mt-1">
                        <Badge className={`${ESTAGIOS[selectedItem.estagio]?.color || 'bg-gray-100'} text-sm px-3 py-1`}>
                          {ESTAGIOS[selectedItem.estagio]?.label || selectedItem.estagio}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-center">
                      <Label className="text-sm text-gray-600">Tempo na Fila</Label>
                      {(() => {
                        // Filtrar histórico específico deste cartão
                        const historicoCartaoEspecifico = historicoItem.filter(h => h.fila_x_id === selectedItem.id);
                        const tempoTotal = calcularTempoTotal(historicoCartaoEspecifico);
                        
                        // Se há histórico, usar o cálculo do histórico; senão, usar data_entrada
                        const tempoExibir = tempoTotal ? tempoTotal.tempo : calcularTempoEspera(selectedItem.data_entrada);
                        
                        return (
                          <p className="font-bold text-lg text-orange-600">
                            {tempoExibir}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Informações da Operação */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Truck className="h-5 w-5" />
                      Informações da Operação
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium">{TIPOS_OPERACAO[selectedItem.tipo_operacao]?.label || selectedItem.tipo_operacao}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtipo:</span>
                        <span className="font-medium">-</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Prioridade:</span>
                        <Badge className={selectedItem.prioridade ? PRIORIDADES[selectedItem.prioridade]?.color || 'bg-gray-100' : 'bg-gray-100'}>
                          {selectedItem.prioridade ? PRIORIDADES[selectedItem.prioridade]?.label || selectedItem.prioridade : 'Normal'}
                        </Badge>
                      </div>
                      {selectedItem.motorista_nome && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Motorista:</span>
                            <span className="font-medium">{selectedItem.motorista_nome}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Placa:</span>
                            <span className="font-medium">{selectedItem.veiculo_placa}</span>
                          </div>
                        </>
                      )}
                      {selectedItem.doca_designada && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Doca:</span>
                          <span className="font-medium">{selectedItem.doca_designada}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Histórico de Tempo por Etapa com SLA */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      SLA e Tempo por Etapa
                    </h3>
                    <div className="space-y-2">
                      {(() => {
                        // Filtrar histórico específico deste cartão
                        const historicoCartaoEspecifico = historicoItem.filter(h => h.fila_x_id === selectedItem.id);
                        const slaEtapas = calcularSLAPorEtapa(historicoCartaoEspecifico, selectedItem);
                        const tempoTotal = calcularTempoTotal(historicoCartaoEspecifico);
                        
                        const tempoPorEstagio = calcularTempoPorEstagio(historicoCartaoEspecifico, selectedItem);
                        
                        // DEBUG: Log para verificar histórico específico
                        console.log('Modal - Histórico específico do cartão:', historicoCartaoEspecifico.length);
                        console.log('Modal - Cartão selecionado:', selectedItem.id, selectedItem.estagio);
                        console.log('Modal - Últimos 3 registros do histórico:', historicoCartaoEspecifico.slice(-3));
                        
                        return (
                          <div className="space-y-4">
                            {/* Tempo Total */}
                            {tempoTotal && (
                              <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-indigo-800">Tempo Total:</span>
                                  <div className="text-right">
                                    <div className="font-bold text-lg text-indigo-600">{tempoTotal.tempo}</div>
                                    <div className="text-xs text-indigo-500">
                                      {tempoTotal.status === 'em_andamento' ? 'Em andamento' : 
                                       tempoTotal.status === 'finalizado' ? 'Finalizado' : 'Recusado'}
                                    </div>
                                  </div>
                                </div>
                                {tempoTotal.inicio && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    Início: {tempoTotal.inicio.toLocaleDateString('pt-BR')} às {tempoTotal.inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    {tempoTotal.fim && (
                                      <span> | Fim: {tempoTotal.fim.toLocaleDateString('pt-BR')} às {tempoTotal.fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Tempo Detalhado por Estágio */}
                            {tempoPorEstagio.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                  Registro de Entrada/Saída por Estágio: ({tempoPorEstagio.length} períodos)
                                </h4>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                  {tempoPorEstagio.map((registro, index) => (
                                    <div key={index} className={`p-3 rounded-lg text-sm border ${
                                      registro.ativo ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-gray-50 border-gray-200'
                                    }`}>
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-3 h-3 rounded-full ${
                                            registro.ativo ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'
                                          }`}></div>
                                          <span className="font-semibold">
                                            {ESTAGIOS[registro.estagio]?.label || etapasConfig[registro.estagio]?.label || registro.estagio}
                                            {registro.ativo && <span className="ml-1 text-blue-600 font-bold">(ATUAL)</span>}
                                          </span>
                                        </div>
                                        <div className={`font-bold ${registro.ativo ? 'text-blue-600' : 'text-gray-600'}`}>
                                          {registro.tempo}
                                        </div>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                                        <div>
                                          <span className="font-medium">Entrada:</span>
                                          <br />
                                          <span>{registro.entrada}</span>
                                        </div>
                                        <div>
                                          <span className="font-medium">Saída:</span>
                                          <br />
                                          <span className={registro.ativo ? 'text-blue-600 font-medium' : ''}>
                                            {registro.saida}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {registro.usuario && (
                                        <div className="mt-2 text-xs text-gray-500">
                                          <span className="font-medium">Responsável:</span> {registro.usuario}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* SLA por Etapa */}
                            {slaEtapas.length > 0 && (
                              <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                  Análise de SLA por Estágio:
                                </h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {slaEtapas.map((etapa, index) => (
                                    <div key={index} className={`p-2 rounded text-sm border-l-4 ${
                                      etapa.dentrodoSLA ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                                    } ${etapa.ativo ? 'ring-2 ring-blue-300' : ''}`}>
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className={`w-2 h-2 rounded-full ${
                                            etapa.dentrodoSLA ? 'bg-green-500' : 'bg-red-500'
                                          } ${etapa.ativo ? 'animate-pulse' : ''}`}></div>
                                          <span className="font-medium">
                                            {ESTAGIOS[etapa.estagio]?.label || etapasConfig[etapa.estagio]?.label || etapa.estagio}
                                            {etapa.estagio === selectedItem.estagio && <span className="ml-1 text-blue-600">(Atual)</span>}
                                          </span>
                                        </div>
                                        <div className="text-right">
                                          <div className={`font-bold ${etapa.dentrodoSLA ? 'text-green-600' : 'text-red-600'}`}>
                                            {Math.floor(etapa.tempoMinutos / 60) > 0 ? 
                                              `${Math.floor(etapa.tempoMinutos / 60)}h ${etapa.tempoMinutos % 60}m` : 
                                              `${etapa.tempoMinutos}m`}
                                          </div>
                                          {etapa.slaMinutos > 0 && (
                                            <div className="text-xs text-gray-500">
                                              SLA: {Math.floor(etapa.slaMinutos / 60) > 0 ? 
                                              `${Math.floor(etapa.slaMinutos / 60)}h ${etapa.slaMinutos % 60}m` : 
                                              `${etapa.slaMinutos}m`}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {tempoPorEstagio.length === 0 && slaEtapas.length === 0 && (
                              <div className="text-center text-gray-500 py-4">
                                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Nenhum histórico de tempo disponível</p>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ordens Vinculadas */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Ordens Vinculadas ({selectedItem.ordens_vinculadas?.length || 0})
                  </h3>
                  {selectedItem.ordens_vinculadas && selectedItem.ordens_vinculadas.length > 0 ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {selectedItem.ordens_vinculadas.map((ordemVinculada: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {ordemVinculada.tipo_ordem === 'ordem_carga' ? 'Carga' : 'Carregamento'}
                              </Badge>
                              <span className="font-medium text-sm">
                                {ordemVinculada.ordem_data?.numero_referencia || 
                                 ordemVinculada.ordem_data?.numero_ordem || 
                                 ordemVinculada.ordem_data?.numero_carregamento || 
                                 'Ordem sem número'}
                              </span>
                            </div>
                            {ordemVinculada.ordem_data && (
                              <div className="text-xs text-gray-600 mt-1">
                                <div>
                                  {ordemVinculada.ordem_data.remetente_razao_social && (
                                    <span>De: {ordemVinculada.ordem_data.remetente_razao_social}</span>
                                  )}
                                </div>
                                <div>
                                  {ordemVinculada.ordem_data.destinatario_razao_social && (
                                    <span>Para: {ordemVinculada.ordem_data.destinatario_razao_social}</span>
                                  )}
                                </div>
                                {ordemVinculada.data_vinculacao && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Vinculada em: {new Date(ordemVinculada.data_vinculacao).toLocaleDateString('pt-BR')} às {new Date(ordemVinculada.data_vinculacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOrdemEditando(ordemVinculada.ordem_data);
                                setShowEditOrdemModal(true);
                                setShowDetailsModal(false);
                              }}
                              disabled={!ordemVinculada.ordem_data}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Editar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-6">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma ordem vinculada</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setCartaoSelecionado(selectedItem);
                          setShowVincularOrdemModal(true);
                          setShowDetailsModal(false);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Vincular Ordem
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Análise de Responsabilidade por SLA */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Responsabilidade por SLA
                  </h3>
                  {(() => {
                    // Filtrar histórico específico deste cartão para responsabilidades
                    const historicoCartaoEspecifico = historicoItem.filter(h => h.fila_x_id === selectedItem.id);
                    const responsabilidades = calcularResponsabilidadeSLA(historicoCartaoEspecifico, selectedItem);
                    
                    return responsabilidades.length > 0 ? (
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {responsabilidades.map((resp: any, index: number) => (
                          <div key={index} className={`p-3 rounded-lg border-l-4 ${
                            resp.dentrodoSLA ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                          } ${resp.em_andamento ? 'ring-2 ring-blue-300' : ''}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  resp.dentrodoSLA ? 'bg-green-500' : 'bg-red-500'
                                } ${resp.em_andamento ? 'animate-pulse' : ''}`}></div>
                                <div>
                                  <span className="font-medium text-sm">
                                    {ESTAGIOS[resp.estagio]?.label || etapasConfig[resp.estagio]?.label || resp.estagio}
                                    {resp.em_andamento && <span className="ml-1 text-blue-600">(Em andamento)</span>}
                                  </span>
                                  <div className="text-xs text-gray-600">
                                    <User className="h-3 w-3 inline mr-1" />
                                    Responsável: <span className="font-medium">{resp.usuario_responsavel}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`font-bold text-sm ${resp.dentrodoSLA ? 'text-green-600' : 'text-red-600'}`}>
                                  {Math.floor(resp.tempoMinutos / 60) > 0 ? 
                                    `${Math.floor(resp.tempoMinutos / 60)}h ${resp.tempoMinutos % 60}m` : 
                                    `${resp.tempoMinutos}m`}
                                </div>
                                <div className="text-xs text-gray-500">
                                  SLA: {Math.floor(resp.slaMinutos / 60) > 0 ? 
                                    `${Math.floor(resp.slaMinutos / 60)}h ${resp.slaMinutos % 60}m` : 
                                    `${resp.slaMinutos}m`}
                                </div>
                                {!resp.dentrodoSLA && resp.atraso > 0 && (
                                  <div className="text-xs text-red-600 font-medium">
                                    Atraso: {Math.floor(resp.atraso / 60) > 0 ? 
                                      `${Math.floor(resp.atraso / 60)}h ${resp.atraso % 60}m` : 
                                      `${resp.atraso}m`}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 mt-2">
                              Início: {resp.inicio.toLocaleDateString('pt-BR')} às {resp.inicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              {resp.fim && !resp.em_andamento && (
                                <span> | Fim: {resp.fim.toLocaleDateString('pt-BR')} às {resp.fim.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-6">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma análise de responsabilidade disponível</p>
                        <p className="text-xs">Histórico insuficiente para determinar responsabilidades</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Histórico de Alterações */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Histórico de Alterações
                  </h3>
                  {(() => {
                    // Filtrar e mostrar apenas histórico deste cartão específico
                    const historicoCartaoEspecifico = historicoItem.filter(h => h.fila_x_id === selectedItem.id);
                    return historicoCartaoEspecifico && historicoCartaoEspecifico.length > 0 ? (
                      <div className="space-y-3 max-h-48 overflow-y-auto">
                        {historicoCartaoEspecifico.map((evento: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {evento.acao === 'adicionado' && 'Adicionado à fila'}
                                {evento.acao === 'movido' && `Movido para ${ESTAGIOS[evento.estagio_novo]?.label || etapasConfig[evento.estagio_novo]?.label || evento.estagio_novo}`}
                                {evento.acao === 'ordem_vinculada' && 'Ordem vinculada'}
                                {evento.acao === 'ordem_vinculada_manual' && 'Ordem vinculada manualmente'}
                                {evento.acao === 'ordem_desvinculada' && 'Ordem desvinculada'}
                                {evento.acao === 'editado' && 'Dados editados'}
                                {evento.acao === 'arquivado' && 'Arquivado'}
                                {!['adicionado', 'movido', 'ordem_vinculada', 'ordem_vinculada_manual', 'ordem_desvinculada', 'editado', 'arquivado'].includes(evento.acao) && evento.acao}
                              </p>
                              <span className="text-xs text-gray-500">
                                {new Date(evento.data_acao || evento.created_at).toLocaleDateString('pt-BR')} às {new Date(evento.data_acao || evento.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {evento.usuario_nome && (
                              <p className="text-xs text-gray-600 mt-1">
                                <User className="h-3 w-3 inline mr-1" />
                                Por: {evento.usuario_nome}
                              </p>
                            )}
                            {evento.observacoes && (
                              <p className="text-xs text-gray-600 mt-1 italic">
                                {evento.observacoes}
                              </p>
                            )}
                            {evento.estagio_anterior && evento.estagio_novo && evento.estagio_anterior !== evento.estagio_novo && (
                              <p className="text-xs text-gray-500 mt-1">
                                De {ESTAGIOS[evento.estagio_anterior]?.label || etapasConfig[evento.estagio_anterior]?.label || evento.estagio_anterior} → {ESTAGIOS[evento.estagio_novo]?.label || etapasConfig[evento.estagio_novo]?.label || evento.estagio_novo}
                              </p>
                            )}
                          </div>
                        </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-6">
                        <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum histórico disponível</p>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Observações */}
              {selectedItem.observacoes && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Observações
                    </h3>
                    <p className="text-sm bg-gray-50 p-3 rounded-md border-l-4 border-blue-500">
                      {selectedItem.observacoes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Ações Rápidas */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Ações Rápidas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {/* Estágios padrão */}
                    {Object.keys(ESTAGIOS).map((estagio) => {
                      if (estagio === selectedItem.estagio) return null;
                      
                      const EstagioIcon = ESTAGIOS[estagio as keyof typeof ESTAGIOS].icon;
                      
                      return (
                        <Button
                          key={estagio}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => {
                            handleMoverItem(selectedItem, estagio);
                            setShowDetailsModal(false);
                          }}
                        >
                          <EstagioIcon className="h-4 w-4" />
                          Mover para {ESTAGIOS[estagio as keyof typeof ESTAGIOS].label}
                        </Button>
                      );
                    })}
                    
                    {/* Estágios personalizados configurados dinamicamente */}
                    {Object.keys(etapasConfig).filter(estagio => 
                      !ESTAGIOS[estagio as keyof typeof ESTAGIOS] && 
                      estagio !== selectedItem.estagio
                    ).map((estagio) => {
                      const EstagioIcon = etapasConfig[estagio]?.icon || Clock;
                      
                      return (
                        <Button
                          key={estagio}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 border-dashed"
                          onClick={() => {
                            handleMoverItem(selectedItem, estagio);
                            setShowDetailsModal(false);
                          }}
                        >
                          <EstagioIcon className="h-4 w-4" />
                          Mover para {etapasConfig[estagio]?.label || estagio}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Análise SLA por Usuário */}
      <Dialog open={showSLAAnalysis} onOpenChange={setShowSLAAnalysis}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" aria-describedby="sla-analysis-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6" />
              Análise de SLA por Usuário
            </DialogTitle>
            <div id="sla-analysis-description" className="sr-only">
              Análise detalhada do desempenho de SLA por usuário em períodos específicos.
            </div>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Filtros da Análise */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros de Análise
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="analise-data-inicio">Data Início</Label>
                    <Input
                      id="analise-data-inicio"
                      type="date"
                      value={filtroDataInicio}
                      onChange={(e) => setFiltroDataInicio(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="analise-data-fim">Data Fim</Label>
                    <Input
                      id="analise-data-fim"
                      type="date"
                      value={filtroDataFim}
                      onChange={(e) => setFiltroDataFim(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="analise-usuario">Usuário Específico</Label>
                    <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os usuários" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os usuários</SelectItem>
                        {/* Lista de usuários únicos baseada no histórico */}
                        {Array.from(new Set(
                          filaItems.flatMap((item: any) => {
                            const hist = historicoItem;
                            return hist ? hist.map((h: any) => ({
                              id: h.usuario_id,
                              nome: h.usuario_nome
                            })).filter((u: any) => u.id && u.nome) : [];
                          })
                        )).map((usuario: any) => (
                          <SelectItem key={usuario.id} value={usuario.id}>
                            {usuario.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Análise de Performance */}
            {(() => {
              const dataInicio = filtroDataInicio ? new Date(filtroDataInicio) : undefined;
              const dataFim = filtroDataFim ? new Date(filtroDataFim) : undefined;
              const analiseUsuarios = analisarSLAPorUsuario([], filtroUsuario, dataInicio, dataFim);
              
              // Calcular estatísticas por etapa considerando apenas itens filtrados
              const estatisticasPorEtapa: Record<string, {
                total: number,
                dentroSLA: number,
                foraSLA: number,
                tempoTotalMinutos: number,
                tempoMedioMinutos: number,
                percentualSLA: number,
                label: string
              }> = {};
              
              // Inicializar estatísticas
              Object.keys(etapasConfig).forEach(key => {
                estatisticasPorEtapa[key] = {
                  total: 0,
                  dentroSLA: 0,
                  foraSLA: 0,
                  tempoTotalMinutos: 0,
                  tempoMedioMinutos: 0,
                  percentualSLA: 0,
                  label: etapasConfig[key].label
                };
              });
              
              // Processar itens filtrados
              itemsFiltrados.forEach((item: FilaXItem) => {
                const slaEtapas = calcularSLAPorEtapa([], item);
                slaEtapas.forEach(etapa => {
                  const stats = estatisticasPorEtapa[etapa.estagio];
                  if (stats) {
                    stats.total++;
                    stats.tempoTotalMinutos += etapa.tempoMinutos;
                    if (etapa.dentrodoSLA) {
                      stats.dentroSLA++;
                    } else {
                      stats.foraSLA++;
                    }
                  }
                });
              });
              
              // Calcular médias e percentuais
              Object.keys(estatisticasPorEtapa).forEach(key => {
                const stats = estatisticasPorEtapa[key];
                if (stats.total > 0) {
                  stats.tempoMedioMinutos = Math.round(stats.tempoTotalMinutos / stats.total);
                  stats.percentualSLA = Math.round((stats.dentroSLA / stats.total) * 100);
                }
              });
              
              return (
                <div className="space-y-4">
                  {/* Estatísticas por Etapa */}
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-purple-700">
                        <Clock className="h-5 w-5" />
                        Performance por Etapa (Filtros Aplicados)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(estatisticasPorEtapa)
                          .filter(([_, stats]) => stats.total > 0)
                          .map(([key, stats]) => (
                            <div key={key} className="bg-white p-4 rounded-lg border border-purple-100">
                              <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  stats.percentualSLA >= 80 ? 'bg-green-500' :
                                  stats.percentualSLA >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                                <h4 className="font-medium text-sm">{stats.label}</h4>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>SLA:</span>
                                  <span className={`font-bold ${
                                    stats.percentualSLA >= 80 ? 'text-green-600' :
                                    stats.percentualSLA >= 60 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {stats.percentualSLA}%
                                  </span>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                  <span>Total:</span>
                                  <span className="font-medium">{stats.total} itens</span>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                  <span>No prazo:</span>
                                  <span className="text-green-600 font-medium">{stats.dentroSLA}</span>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                  <span>Atrasados:</span>
                                  <span className="text-red-600 font-medium">{stats.foraSLA}</span>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                  <span>Tempo médio:</span>
                                  <span className="font-medium">
                                    {Math.floor(stats.tempoMedioMinutos / 60) > 0 ? 
                                      `${Math.floor(stats.tempoMedioMinutos / 60)}h ${stats.tempoMedioMinutos % 60}m` : 
                                      `${stats.tempoMedioMinutos}m`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                      
                      {Object.values(estatisticasPorEtapa).every(stats => stats.total === 0) && (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-600">Nenhum dado disponível para as etapas nos filtros aplicados.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {analiseUsuarios.length > 0 ? (
                    <>
                      {/* Resumo Geral */}
                      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-700">
                            <Target className="h-5 w-5" />
                            Resumo da Análise
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {analiseUsuarios.length}
                              </div>
                              <div className="text-xs text-blue-600">Usuários Analisados</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {Math.round(analiseUsuarios.reduce((acc, u) => acc + u.percentual_sla, 0) / analiseUsuarios.length)}%
                              </div>
                              <div className="text-xs text-green-600">SLA Médio</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {analiseUsuarios.reduce((acc, u) => acc + u.total_etapas, 0)}
                              </div>
                              <div className="text-xs text-orange-600">Total de Etapas</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-red-600">
                                {analiseUsuarios.reduce((acc, u) => acc + u.etapas_atrasadas, 0)}
                              </div>
                              <div className="text-xs text-red-600">Etapas Atrasadas</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Lista de Usuários */}
                      <div className="grid gap-4">
                        {analiseUsuarios.map((usuario: any) => (
                          <Card key={usuario.usuario_id} className="border-l-4 border-l-blue-500">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    usuario.percentual_sla >= 90 ? 'bg-green-100' :
                                    usuario.percentual_sla >= 70 ? 'bg-yellow-100' : 'bg-red-100'
                                  }`}>
                                    <User className={`h-6 w-6 ${
                                      usuario.percentual_sla >= 90 ? 'text-green-600' :
                                      usuario.percentual_sla >= 70 ? 'text-yellow-600' : 'text-red-600'
                                    }`} />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">{usuario.usuario_nome}</h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <span>Etapas: {usuario.total_etapas}</span>
                                      <span>Tempo médio: {Math.floor(usuario.tempo_medio_minutos / 60)}h {usuario.tempo_medio_minutos % 60}m</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-2xl font-bold ${
                                    usuario.percentual_sla >= 90 ? 'text-green-600' :
                                    usuario.percentual_sla >= 70 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {usuario.percentual_sla}%
                                  </div>
                                  <div className="text-xs text-gray-500">SLA</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div className="bg-green-50 p-3 rounded-lg">
                                  <div className="text-lg font-bold text-green-600">
                                    {usuario.etapas_no_prazo}
                                  </div>
                                  <div className="text-xs text-green-600">No Prazo</div>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg">
                                  <div className="text-lg font-bold text-red-600">
                                    {usuario.etapas_atrasadas}
                                  </div>
                                  <div className="text-xs text-red-600">
                                    Atrasadas 
                                    {usuario.atraso_total_minutos > 0 && (
                                      <span className="block">
                                        ({Math.floor(usuario.atraso_total_minutos / 60)}h {usuario.atraso_total_minutos % 60}m total)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Performance por Etapa */}
                              {Object.keys(usuario.etapas_por_tipo).length > 0 && (
                                <div>
                                  <h5 className="font-medium text-sm mb-2">Performance por Etapa:</h5>
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {Object.entries(usuario.etapas_por_tipo).map(([estagio, stats]: [string, any]) => (
                                      <div key={estagio} className="bg-gray-50 p-2 rounded text-xs">
                                        <div className="font-medium">
                                          {ESTAGIOS[estagio]?.label || estagio}
                                        </div>
                                        <div className="text-gray-600">
                                          {stats.total} etapas | {Math.round((stats.no_prazo / stats.total) * 100)}% no prazo
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum dado encontrado</h3>
                        <p className="text-gray-600">
                          Não foram encontrados dados de SLA para os filtros selecionados.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          Verifique se há histórico de movimentações no período especificado.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar à Fila */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className={modalView === 'create' ? 'max-w-6xl max-h-[95vh] overflow-hidden' : 'max-w-4xl max-h-[90vh] overflow-y-auto'}>
          <DialogHeader>
            <DialogTitle>Adicionar Ordem à Fila</DialogTitle>
          </DialogHeader>
          
          {/* Tabs para alternar entre pesquisar e criar */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4">
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                modalView === 'search' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setModalView('search')}
            >
              <Search className="h-4 w-4 inline mr-2" />
              Pesquisar Ordens
            </button>
            <button
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                modalView === 'create' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setModalView('create')}
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Criar Nova Ordem
            </button>
          </div>

          {modalView === 'search' && (
            <div className="space-y-4">
              {/* Campo de pesquisa */}
              <div>
                <Label htmlFor="pesquisa-ordem">Pesquisar Ordens</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="pesquisa-ordem"
                      placeholder="Digite número da ordem, remetente ou destinatário..."
                      value={pesquisaOrdem}
                      onChange={(e) => setPesquisaOrdem(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={startQRScanner}
                    disabled={isScanning}
                    className="shrink-0"
                    title="Escanear QR Code"
                  >
                    {isScanning ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                    ) : (
                      <QrCode className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Lista de ordens disponíveis */}
              <div>
                <Label>Ordens Disponíveis</Label>
                <div className="max-h-96 overflow-y-auto space-y-2 mt-2 border rounded-md p-2">
                  {ordensDisponiveis.map((ordem: OrdemCarga) => (
                    <Card key={ordem.id} className="cursor-pointer hover:bg-gray-50">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{(ordem as any).numero_ordem || ordem.numero_carregamento || 'Ordem sem número'}</p>
                            <p className="text-xs text-gray-600">{ordem.tipo_movimentacao} - {ordem.subtipo_operacao}</p>
                            <p className="text-xs text-gray-500">
                              De: {(ordem as any).remetente_razao_social || 'Remetente não informado'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Para: {(ordem as any).destinatario_razao_social || 'Destinatário não informado'}
                            </p>
                            {(ordem as any).data_programada && (
                              <p className="text-xs text-gray-500">
                                Data: {new Date((ordem as any).data_programada).toLocaleDateString('pt-BR')}
                              </p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOrderForDriver(ordem.id);
                              setShowDriverModal(true);
                            }}
                            disabled={addToFilaMutation.isPending}
                          >
                            Adicionar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {ordensDisponiveis.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma ordem encontrada</p>
                      <p className="text-xs">Tente pesquisar com outros termos ou crie uma nova ordem</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {modalView === 'create' && (
            <div className="max-h-[70vh] overflow-y-auto">
              <NovaOrdemIntegrada
                title="Nova Ordem de Carga - FilaX"
                mode="create"
                showBackButton={false}
                onSubmit={(data) => {
                  // Quando a ordem for criada com sucesso, adicionar à fila automaticamente
                  if (data && data.id) {
                    addToFilaMutation.mutate({ 
                      ordem_id: data.id,
                      ...novaOrdemData
                    });
                  }
                }}
                onCancel={() => setModalView('search')}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Informações do Motorista */}
      <Dialog open={showDriverModal} onOpenChange={setShowDriverModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Motorista
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="motorista_nome">Nome do Motorista *</Label>
              <Input
                id="motorista_nome"
                placeholder="Digite o nome do motorista"
                value={driverInfo.motorista_nome}
                onChange={(e) => setDriverInfo(prev => ({ ...prev, motorista_nome: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="veiculo_placa">Placa do Veículo *</Label>
              <Input
                id="veiculo_placa"
                placeholder="Ex: ABC-1234"
                value={driverInfo.veiculo_placa}
                onChange={(e) => setDriverInfo(prev => ({ ...prev, veiculo_placa: e.target.value.toUpperCase() }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="doca_designada">Número da Doca (Opcional)</Label>
              <Input
                id="doca_designada"
                placeholder="Ex: D01, D02..."
                value={driverInfo.doca_designada}
                onChange={(e) => setDriverInfo(prev => ({ ...prev, doca_designada: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="estagio_inicial">Estágio Inicial *</Label>
              <Select 
                value={driverInfo.estagio_inicial} 
                onValueChange={(value) => setDriverInfo(prev => ({ ...prev, estagio_inicial: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estágio inicial" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries({...ESTAGIOS, ...etapasConfig}).map(([key, etapa]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${etapa.color?.replace('border-', 'bg-').replace('-300', '-200') || 'bg-gray-200'}`}></div>
                        {etapa.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Selecione em qual estágio este cartão deve iniciar
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowDriverModal(false);
                  setDriverInfo({ motorista_nome: '', veiculo_placa: '', doca_designada: '', estagio_inicial: '' });
                  setSelectedOrderForDriver(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (selectedOrderForDriver && driverInfo.motorista_nome && driverInfo.veiculo_placa && driverInfo.estagio_inicial) {
                    addToFilaMutation.mutate({
                      ordem_id: selectedOrderForDriver,
                      tipo_operacao: novaOrdemData.tipo_operacao,
                      prioridade: novaOrdemData.prioridade,
                      motorista_nome: driverInfo.motorista_nome,
                      veiculo_placa: driverInfo.veiculo_placa,
                      doca_designada: driverInfo.doca_designada,
                      estagio: driverInfo.estagio_inicial,
                      observacoes: `Motorista: ${driverInfo.motorista_nome} - Placa: ${driverInfo.veiculo_placa}`
                    });
                    setShowDriverModal(false);
                    setDriverInfo({ motorista_nome: '', veiculo_placa: '', doca_designada: '', estagio_inicial: '' });
                    setSelectedOrderForDriver(null);
                  }
                }}
                disabled={!driverInfo.motorista_nome || !driverInfo.veiculo_placa || !driverInfo.estagio_inicial || addToFilaMutation.isPending}
              >
                {addToFilaMutation.isPending ? 'Adicionando...' : 'Adicionar à Fila'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição dos Dados do Motorista */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Dados do Motorista
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-motorista-nome">Nome do Motorista *</Label>
              <Input
                id="edit-motorista-nome"
                placeholder="Nome completo do motorista"
                value={editInfo.motorista_nome}
                onChange={(e) => setEditInfo({ ...editInfo, motorista_nome: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-veiculo-placa">Placa do Veículo *</Label>
              <Input
                id="edit-veiculo-placa"
                placeholder="ABC1234"
                value={editInfo.veiculo_placa}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  setEditInfo({ ...editInfo, veiculo_placa: value });
                }}
                maxLength={7}
              />
              <p className="text-xs text-gray-500 mt-1">
                Digite apenas 7 caracteres (3 letras + 4 números, ex: ABC1234)
              </p>
            </div>
            
            <div>
              <Label htmlFor="edit-doca-designada">Doca (Opcional)</Label>
              <Input
                id="edit-doca-designada"
                placeholder="Ex: Doca 01, A1, etc."
                value={editInfo.doca_designada}
                onChange={(e) => setEditInfo({ ...editInfo, doca_designada: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-estagio-inicial">Estágio Inicial *</Label>
              <Select 
                value={editInfo.estagio_inicial || editingItem?.estagio} 
                onValueChange={(value) => setEditInfo({ ...editInfo, estagio_inicial: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estágio inicial" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries({...ESTAGIOS, ...etapasConfig}).map(([key, etapa]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded ${etapa.color?.replace('border-', 'bg-').replace('-300', '-200') || 'bg-gray-200'}`}></div>
                        {etapa.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Selecione em qual estágio este cartão deve iniciar
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setEditInfo({ motorista_nome: '', veiculo_placa: '', doca_designada: '', estagio_inicial: '' });
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (editInfo.motorista_nome && editInfo.veiculo_placa && editInfo.estagio_inicial && editingItem) {
                    editDriverMutation.mutate({
                      id: editingItem.id,
                      data: {
                        motorista_nome: editInfo.motorista_nome,
                        veiculo_placa: editInfo.veiculo_placa,
                        doca_designada: editInfo.doca_designada,
                        estagio: editInfo.estagio_inicial
                      }
                    });
                  }
                }}
                disabled={!editInfo.motorista_nome || !editInfo.veiculo_placa || !editInfo.estagio_inicial || editDriverMutation.isPending}
              >
                {editDriverMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal do QR Code Scanner */}
      <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scanner de QR Code
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-center">
              <div className="relative bg-gray-100 rounded-lg p-4 min-h-64">
                <video
                  id="qr-scanner-video"
                  className="w-full h-full object-cover rounded"
                  autoPlay
                  playsInline
                ></video>
                
                {/* Overlay de escaneamento */}
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mt-2">
                Posicione o QR Code ou código de barras dentro da área de escaneamento
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={stopQRScanner}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Etapas */}
      <Dialog open={showEtapaEditor} onOpenChange={setShowEtapaEditor}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurar Etapas do FilaX
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-sm text-gray-600">
              Configure as etapas do fluxo, seus tempos de SLA e organize a ordem das colunas.
            </div>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="etapas-list">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {Object.entries(etapasConfig).map(([key, etapa], index) => (
                      <Draggable key={key} draggableId={key} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border rounded-lg p-4 space-y-3 ${
                              snapshot.isDragging ? 'shadow-lg bg-gray-50 border-blue-300' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded ${etapa.color.replace('border-', 'bg-').replace('-300', '-200')}`}></div>
                                <div>
                                  <h4 className="font-medium">{etapa.label}</h4>
                                  <p className="text-sm text-gray-500">{etapa.description}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
                                >
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  onClick={() => {
                                    if (confirm(`Tem certeza que deseja excluir a etapa "${etapa.label}"? Esta ação não pode ser desfeita.`)) {
                                      const novasEtapas = { ...etapasConfig };
                                      delete novasEtapas[key];
                                      setEtapasConfig(novasEtapas);
                                      toast({
                                        title: "Etapa excluída",
                                        description: `A etapa "${etapa.label}" foi removida com sucesso.`
                                      });
                                    }
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <Label>Tempo SLA (minutos)</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={etapa.slaMinutos || 30}
                                  onChange={(e) => {
                                    const novasEtapas = { ...etapasConfig };
                                    novasEtapas[key] = { ...etapa, slaMinutos: parseInt(e.target.value) || 30 };
                                    setEtapasConfig(novasEtapas);
                                  }}
                                />
                              </div>
                              <div>
                                <Label>Posição</Label>
                                <div className="bg-gray-50 border rounded px-3 py-2 text-sm text-gray-600">
                                  Posição {index + 1}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            {/* Formulário para Nova Etapa */}
            {showNovaEtapaForm ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Nova Etapa</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      setShowNovaEtapaForm(false);
                      setNovaEtapa({
                        key: '',
                        label: '',
                        description: '',
                        slaMinutos: 30,
                        color: 'border-blue-300'
                      });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div>
                  <Label>Nome da Etapa *</Label>
                  <Input
                    placeholder="Ex: Verificação Final"
                    value={novaEtapa.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      const key = label.toLowerCase()
                        .replace(/[áàâãä]/g, 'a')
                        .replace(/[éèêë]/g, 'e')
                        .replace(/[íìîï]/g, 'i')
                        .replace(/[óòôõö]/g, 'o')
                        .replace(/[úùûü]/g, 'u')
                        .replace(/[ç]/g, 'c')
                        .replace(/[^a-z0-9\s]/g, '')
                        .replace(/\s+/g, '_')
                        .replace(/_{2,}/g, '_')
                        .replace(/^_|_$/g, '');
                      setNovaEtapa({ ...novaEtapa, label, key });
                    }}
                  />
                  {novaEtapa.label && (
                    <p className="text-xs text-gray-500 mt-1">
                      Chave gerada automaticamente: <code className="bg-gray-100 px-1 rounded">{novaEtapa.key}</code>
                    </p>
                  )}
                </div>
                
                <div>
                  <Label>Descrição</Label>
                  <Input
                    placeholder="Descrição da etapa"
                    value={novaEtapa.description}
                    onChange={(e) => setNovaEtapa({ ...novaEtapa, description: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Tempo SLA (minutos) *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={novaEtapa.slaMinutos}
                      onChange={(e) => setNovaEtapa({ ...novaEtapa, slaMinutos: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                  <div>
                    <Label>Cor</Label>
                    <Select value={novaEtapa.color} onValueChange={(color) => setNovaEtapa({ ...novaEtapa, color })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="border-blue-300">Azul</SelectItem>
                        <SelectItem value="border-green-300">Verde</SelectItem>
                        <SelectItem value="border-yellow-300">Amarelo</SelectItem>
                        <SelectItem value="border-red-300">Vermelho</SelectItem>
                        <SelectItem value="border-purple-300">Roxo</SelectItem>
                        <SelectItem value="border-pink-300">Rosa</SelectItem>
                        <SelectItem value="border-indigo-300">Índigo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setShowNovaEtapaForm(false);
                      setNovaEtapa({
                        key: '',
                        label: '',
                        description: '',
                        slaMinutos: 30,
                        color: 'border-blue-300'
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => {
                      if (novaEtapa.label.trim()) {
                        // Gerar chave única, adicionando número se necessário
                        let chaveUnica = novaEtapa.key;
                        let contador = 1;
                        
                        while (etapasConfig[chaveUnica]) {
                          chaveUnica = `${novaEtapa.key}_${contador}`;
                          contador++;
                        }
                        
                        const novasEtapas = {
                          ...etapasConfig,
                          [chaveUnica]: {
                            label: novaEtapa.label,
                            description: novaEtapa.description || `Etapa ${novaEtapa.label}`,
                            color: novaEtapa.color,
                            icon: Settings, // Ícone padrão para etapas customizadas
                            slaMinutos: novaEtapa.slaMinutos
                          }
                        };
                        setEtapasConfig(novasEtapas);
                        setShowNovaEtapaForm(false);
                        setNovaEtapa({
                          key: '',
                          label: '',
                          description: '',
                          slaMinutos: 30,
                          color: 'border-blue-300'
                        });
                        toast({
                          title: "Etapa criada!",
                          description: `A etapa "${novaEtapa.label}" foi adicionada com sucesso.`
                        });
                      } else {
                        toast({
                          title: "Erro",
                          description: "Por favor, insira o nome da etapa.",
                          variant: "destructive"
                        });
                      }
                    }}
                    disabled={!novaEtapa.label.trim()}
                  >
                    Criar Etapa
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowNovaEtapaForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Nova Etapa
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowEtapaEditor(false);
                  setEtapaEditando(null);
                  setEtapasConfig(ESTAGIOS); // Reset para configuração original
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  // TODO: Salvar configurações das etapas
                  setShowEtapaEditor(false);
                  setEtapaEditando(null);
                  toast({
                    title: "Configurações salvas",
                    description: "As etapas foram atualizadas com sucesso!"
                  });
                }}
              >
                Salvar Configurações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Gerenciamento de Múltiplas Ordens */}
      <Dialog open={showOrdensModal} onOpenChange={setShowOrdensModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Package className="h-6 w-6" />
              Gerenciar Ordens do Cartão
              {cartaoSelecionado && (
                <Badge variant="outline">
                  {cartaoSelecionado.titulo_cartao || `Cartão ${cartaoSelecionado.id.substring(0, 8)}`}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {cartaoSelecionado && (
            <div className="space-y-6">
              {/* Informações do Cartão */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Veículo</p>
                        <p className="font-medium">{cartaoSelecionado.veiculo_placa || 'Não informado'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Motorista</p>
                        <p className="font-medium">{cartaoSelecionado.motorista_nome || 'Não informado'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-gray-600">Doca</p>
                        <p className="font-medium">{cartaoSelecionado.doca_designada || 'Não designada'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ações disponíveis */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    setShowVincularOrdemModal(true);
                  }}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Vincular Nova Ordem
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setModalView('create');
                    setShowAddModal(true);
                    setShowOrdensModal(false);
                  }}
                  className="flex-1"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Criar e Vincular Ordem
                </Button>
              </div>

              {/* Lista de Ordens Vinculadas */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Ordens Vinculadas</h3>
                  <Badge variant="secondary">
                    {(() => {
                      const ordensVinculadas = (cartaoSelecionado as any).ordens_vinculadas || 
                        (cartaoSelecionado as any).ordensVinculadas || 
                        ((cartaoSelecionado as any).ordem_carga_id ? [cartaoSelecionado] : []);
                      return `${ordensVinculadas.length} ordem${ordensVinculadas.length !== 1 ? 's' : ''}`;
                    })()}
                  </Badge>
                </div>

{/* Exibir todas as ordens vinculadas */}
                {(() => {
                  // Suporte para ambos os formatos de API (novo e legado)
                  const ordensVinculadas = (cartaoSelecionado as any).ordens_vinculadas || 
                                         (cartaoSelecionado as any).ordensVinculadas || [];
                  const temOrdemPrincipal = (cartaoSelecionado as any).ordem_carga_id;
                  

                  
                  if (temOrdemPrincipal || ordensVinculadas.length > 0) {
                    const todasOrdens = temOrdemPrincipal ? [cartaoSelecionado, ...ordensVinculadas] : ordensVinculadas;
                    
                    return (
                      <div className="space-y-3">
                        {todasOrdens.map((itemOrdem: any, index: number) => (
                          <Card key={itemOrdem.id || index} className={`border-l-4 ${index === 0 ? 'border-l-green-500' : 'border-l-blue-400'}`}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium">{itemOrdem.ordem_data?.numero_ordem || itemOrdem.ordem_data?.numero_carregamento || 'Ordem sem número'}</h4>
                                    {index === 0 && (
                                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        Principal
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-gray-600">Remetente</p>
                                      <p className="font-medium">{itemOrdem.ordem_data?.remetente_razao_social || 'Não informado'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Destinatário</p>
                                      <p className="font-medium">{itemOrdem.ordem_data?.destinatario_razao_social || 'Não informado'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Status</p>
                                      <p className="font-medium capitalize">{itemOrdem.ordem_data?.status || 'Sem status'}</p>
                                    </div>
                                    <div>
                                      <p className="text-gray-600">Data Criação</p>
                                      <p className="font-medium">
                                        {itemOrdem.ordem_data?.created_at || itemOrdem.data_vinculacao
                                          ? new Date(itemOrdem.ordem_data?.created_at || itemOrdem.data_vinculacao).toLocaleDateString('pt-BR')
                                          : 'Não informado'
                                        }
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 ml-4">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      if (itemOrdem.ordem_carga_id || itemOrdem.ordem_id) {
                                        const ordemId = itemOrdem.ordem_carga_id || itemOrdem.ordem_id;
                                        const endpoint = itemOrdem.tipo_ordem === 'ordem_carga' ? 'ordens-carga' : 'carregamentos';
                                        console.log('Carregando dados completos para ordem:', ordemId);
                                        try {
                                          // Buscar dados completos da ordem (inclui NFes, volumes, itens)
                                          const response = await fetch(`/api/${endpoint}/${ordemId}`, {
                                            headers: {
                                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                                            }
                                          });
                                          
                                          if (!response.ok) {
                                            throw new Error(`Erro ${response.status}: ${response.statusText}`);
                                          }
                                          
                                          const ordemCompleta = await response.json();
                                          console.log('Ordem completa carregada:', ordemCompleta);
                                          
                                          // Buscar NFes vinculadas separadamente para garantir compatibilidade
                                          const nfesResponse = await fetch(`/api/${endpoint}/${ordemId}/nfes`, {
                                            headers: {
                                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                                            }
                                          });
                                          
                                          let nfesVinculadas = [];
                                          if (nfesResponse.ok) {
                                            nfesVinculadas = await nfesResponse.json();
                                            console.log('NFes vinculadas carregadas:', nfesVinculadas.length);
                                          }
                                          
                                          // Definir ordem com todos os dados
                                          setOrdemEditando({
                                            ...ordemCompleta,
                                            nfesVinculadas: nfesVinculadas
                                          });
                                          setShowEditOrdemModal(true);
                                        } catch (error) {
                                          console.error('Erro ao carregar dados da ordem:', error);
                                          toast({
                                            title: "Erro",
                                            description: "Não foi possível carregar os dados completos da ordem.",
                                            variant: "destructive"
                                          });
                                          // Fallback: usar dados básicos da ordem se disponível
                                          if (itemOrdem.ordem_data) {
                                            setOrdemEditando(itemOrdem.ordem_data);
                                            setShowEditOrdemModal(true);
                                          }
                                        }
                                      }
                                    }}
                                    title="Editar ordem / Gerar etiquetas"
                                    disabled={!itemOrdem.ordem_carga_id && !itemOrdem.ordem_id}
                                  >
                                    <FileEdit className="h-4 w-4" />
                                  </Button>

                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          const ordemId = itemOrdem.ordem_carga_id || itemOrdem.ordem_id;
                                          if (ordemId) {
                                            buscarOrdemCompleta(ordemId);
                                          }
                                        }}
                                        title="Imprimir ordem de carga"
                                        disabled={!itemOrdem.ordem_carga_id && !itemOrdem.ordem_id}
                                        className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                      >
                                        <Printer className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>
                                          Impressão - {itemOrdem.numero_ordem || itemOrdem.numero_carregamento || 'Ordem sem número'}
                                        </DialogTitle>
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
                                    onClick={() => {
                                      setSelectedItem(itemOrdem);
                                      setShowDetailsModal(true);
                                      setShowOrdensModal(false);
                                    }}
                                    title="Ver detalhes completos"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    );
                  } else {
                    return (
                      <Card className="border-dashed">
                        <CardContent className="p-8 text-center">
                          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 mb-4">
                            Nenhuma ordem vinculada a este cartão
                          </p>
                          <Button 
                            onClick={() => {
                              setShowVincularOrdemModal(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Vincular Primeira Ordem
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  }
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para Vincular Ordem Existente */}
      <Dialog open={showVincularOrdemModal} onOpenChange={setShowVincularOrdemModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vincular Ordem Existente</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Buscar por número da ordem, remetente, destinatário..."
                value={pesquisaOrdem}
                onChange={(e) => setPesquisaOrdem(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {ordensDisponiveis
                ?.filter((ordem: any) => 
                  !pesquisaOrdem || 
                  (ordem.numero_ordem || ordem.numero_carregamento || '').toLowerCase().includes(pesquisaOrdem.toLowerCase()) ||
                  ordem.remetente_razao_social?.toLowerCase().includes(pesquisaOrdem.toLowerCase()) ||
                  ordem.destinatario_razao_social?.toLowerCase().includes(pesquisaOrdem.toLowerCase())
                )
                .slice(0, 10)
                .map((ordem: any) => (
                  <Card key={ordem.id} className="cursor-pointer hover:bg-gray-50">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{ordem.numero_ordem || ordem.numero_carregamento || 'Ordem sem número'}</h4>
                            <Badge variant="outline">{ordem.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {ordem.remetente_razao_social} → {ordem.destinatario_razao_social}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          disabled={vinculandoOrdem === ordem.id}
                          onClick={async () => {
                            setVinculandoOrdem(ordem.id);
                            try {
                              await apiRequest(`/api/fila-x/${cartaoSelecionado?.id}/vincular-ordem`, {
                                method: 'POST',
                                body: JSON.stringify({ ordem_id: ordem.id })
                              });
                              
                              // Invalidar e refazer todas as queries relevantes para atualização instantânea
                              await Promise.all([
                                queryClient.invalidateQueries({ queryKey: ['/api/fila-x'] }),
                                queryClient.invalidateQueries({ queryKey: ['/api/ordens-carga'] }),
                                queryClient.refetchQueries({ queryKey: ['/api/fila-x'] }),
                                queryClient.refetchQueries({ queryKey: ['/api/ordens-carga'] })
                              ]);
                              
                              // Forçar atualização do cartão específico se temos detalhes abertos
                              if (cartaoSelecionado) {
                                const updatedCartoes = await queryClient.fetchQuery({
                                  queryKey: ['/api/fila-x'],
                                  staleTime: 0 // Forçar busca fresca
                                });
                                const cartaoAtualizado = updatedCartoes.find((c: any) => c.id === cartaoSelecionado.id);
                                if (cartaoAtualizado) {
                                  setCartaoSelecionado(cartaoAtualizado);
                                }
                              }
                              
                              toast({
                                title: "✅ Ordem vinculada com sucesso!",
                                description: `A ordem ${ordem.numero_ordem || ordem.numero_carregamento} foi vinculada ao cartão ${cartaoSelecionado?.titulo_cartao || 'selecionado'}.`,
                                duration: 4000
                              });
                            } catch (error: any) {
                              console.error('Erro ao vincular ordem:', error);
                              
                              // Tratar diferentes tipos de erro
                              if (error?.status === 409) {
                                toast({
                                  title: "⚠️ Ordem já vinculada",
                                  description: `A ordem ${ordem.numero_ordem || ordem.numero_carregamento} já está vinculada a este cartão.`,
                                  variant: "destructive",
                                  duration: 4000
                                });
                              } else if (error?.status === 404) {
                                toast({
                                  title: "❌ Cartão ou ordem não encontrada",
                                  description: "Verifique se o cartão e a ordem ainda existem.",
                                  variant: "destructive",
                                  duration: 4000
                                });
                              } else {
                                toast({
                                  title: "❌ Erro ao vincular ordem",
                                  description: error?.message || "Não foi possível vincular a ordem ao cartão. Tente novamente.",
                                  variant: "destructive",
                                  duration: 5000
                                });
                              }
                            } finally {
                              setVinculandoOrdem(null);
                            }
                          }}
                        >
                          {vinculandoOrdem === ordem.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                              Vinculando...
                            </>
                          ) : (
                            'Vincular'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Editar Ordem de Carga Completo */}
      <Dialog open={showEditOrdemModal} onOpenChange={setShowEditOrdemModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Editar Ordem de Carga: {ordemEditando?.numero_ordem || ordemEditando?.numero_carregamento || 'Ordem sem número'}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowEditOrdemModal(false);
                    setOrdemEditando(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Fechar Edição
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription>
              Edição completa da ordem de carga com todas as notas fiscais e volumes vinculados.
            </DialogDescription>
          </DialogHeader>
          
          {/* Renderizar o componente completo de edição de ordem */}
          {ordemEditando && (
            <div className="mt-4">
              <NovaOrdemIntegrada 
                mode="edit"
                initialData={ordemEditando}
                preloadedNotes={ordemEditando.nfesVinculadas || []}
                onSubmit={() => {
                  setShowEditOrdemModal(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/fila-x'] });
                  queryClient.invalidateQueries({ queryKey: ['/api/ordens-carga'] });
                  toast({
                    title: "Sucesso",
                    description: "Ordem atualizada com sucesso"
                  });
                }}
                onCancel={() => setShowEditOrdemModal(false)}
                title={`Editar Ordem: ${ordemEditando.numero_ordem || ordemEditando.numero_carregamento || 'Ordem sem número'}`}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Arquivamento */}
      <Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-red-600" />
              Confirmar Arquivamento
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {itemToArchive ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Tem certeza que deseja arquivar o item:
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{itemToArchive.titulo_cartao || `Cartão ${itemToArchive.id.substring(0, 8)}`}</p>
                  <p className="text-xs text-gray-500">
                    {itemToArchive.motorista_nome && `Motorista: ${itemToArchive.motorista_nome}`}
                    {itemToArchive.veiculo_placa && ` • Placa: ${itemToArchive.veiculo_placa}`}
                  </p>
                </div>
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Esta ação remove o item da fila ativa
                </p>
              </div>
            ) : stageToArchive ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Tem certeza que deseja arquivar <strong>todos os itens</strong> do estágio:
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium">{etapasConfig[stageToArchive]?.label || stageToArchive}</p>
                  <p className="text-xs text-gray-500">
                    {itemsPorEstagio[stageToArchive]?.length || 0} itens serão arquivados
                  </p>
                </div>
                <p className="text-xs text-red-600 mt-2">
                  ⚠️ Esta ação remove todos os itens deste estágio da fila ativa
                </p>
              </div>
            ) : null}

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowArchiveModal(false);
                  setItemToArchive(null);
                  setStageToArchive(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={confirmArchive}
                disabled={archiveItemMutation.isPending || archiveStageMutation.isPending}
              >
                {(archiveItemMutation.isPending || archiveStageMutation.isPending) ? 'Arquivando...' : 'Arquivar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>


      </div>
    </div>
  );
};

export default FilaX;