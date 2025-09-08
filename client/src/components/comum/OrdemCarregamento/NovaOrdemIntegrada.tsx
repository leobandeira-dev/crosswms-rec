import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { useLocation } from 'wouter';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuthState } from '@/hooks/useAuthState';
import { authService } from '@/services/authService';
import VolumeModal from '../VolumeModal';
import { extractDataFromXml } from '@/pages/armazenagem/recebimento/utils/notaFiscalExtractor';
import NFEImportManager from '../NFEImportManager';
import { UniversalPrintDialog, usePrintSystem, OrdemCargaLayout, RomaneioExpedicaoLayout } from '@/components/comum/PrintSystem';
import { 
  Plus, 
  Package, 
  MapPin, 
  FileText, 
  Upload,
  Download,
  X,
  CheckCircle,
  AlertTriangle,
  Save,
  ArrowLeft,
  Edit,
  Truck,
  Calendar,
  Tag,
  DollarSign,
  Weight,
  Ruler,
  User,
  Phone,
  Building,
  Loader2,
  Info,
  Search,
  Printer,
  Calculator,
  Box,
  Eye,
  RefreshCw,
  Clock,
  Star,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Home,
  Tags,
  Archive,
  Clipboard
} from 'lucide-react';

// Interfaces
interface NotaFiscalData {
  id: string;
  chave_nota_fiscal: string;
  numero_nota: string;
  serie_nota: string;
  data_hora_emissao: string;
  natureza_operacao: string;
  emitente_cnpj: string;
  emitente_razao_social: string;
  emitente_telefone: string;
  emitente_uf: string;
  emitente_cidade: string;
  emitente_bairro: string;
  emitente_endereco: string;
  emitente_numero: string;
  emitente_cep: string;
  destinatario_cnpj: string;
  destinatario_razao_social: string;
  destinatario_telefone: string;
  destinatario_uf: string;
  destinatario_cidade: string;
  destinatario_bairro: string;
  destinatario_endereco: string;
  destinatario_numero: string;
  destinatario_cep: string;
  quantidade_volumes: string;
  valor_nota_fiscal: string;
  peso_bruto: string;
  informacoes_complementares: string;
  numero_pedido: string;
  operacao: string;
  cliente_retira?: string;
  tipo_frete: string;
  custo_extra: string;
}

interface VolumeData {
  volume: number;
  altura: number;
  largura: number;
  comprimento: number;
  m3: number;
}

interface NotaVolumeData {
  notaId: string;
  numeroNota: string;
  volumes: VolumeData[];
  totalM3: number;
  pesoTotal: number;
}

interface NovaOrdemIntegradaProps {
  mode?: 'create' | 'edit' | 'view';
  initialData?: any;
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  title?: string;
  showBackButton?: boolean;
  preloadedNotes?: NotaFiscalData[];
}

// Schema para validação do formulário
const formSchema = z.object({
  tipo_movimentacao: z.string().min(1, 'Campo obrigatório'),
  subtipo_operacao: z.string().min(1, 'Campo obrigatório'),
  prioridade: z.string().min(1, 'Campo obrigatório'),
  // Novos campos de data conforme layout
  data_prevista_coleta: z.string().optional(),
  data_coleta: z.string().optional(),
  data_prevista_entrada_armazem: z.string().optional(),
  data_entrada_armazem: z.string().optional(),
  data_carregamento: z.string().optional(),
  data_prevista_entrega: z.string().optional(),
  data_chegada_filial_entrega: z.string().optional(),
  data_saida_entrega: z.string().optional(),
  data_chegada_na_entrega: z.string().optional(),
  data_entrega: z.string().optional(),
  observacoes: z.string().optional(),
  peso_bruto_total: z.string().min(1, 'Campo obrigatório'),
  quantidade_volumes_total: z.string().min(1, 'Campo obrigatório'),
  valor_total: z.string().min(1, 'Campo obrigatório'),
});

type FormData = z.infer<typeof formSchema>;

// Função utilitária para converter data para formato datetime-local
const formatDateForInput = (dateValue: string | Date | undefined | null): string => {
  if (!dateValue) return '';
  
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (isNaN(date.getTime())) return '';
  
  // Formatar para YYYY-MM-DDTHH:MM (formato datetime-local)
  return date.toISOString().slice(0, 16);
};

const NovaOrdemIntegrada: React.FC<NovaOrdemIntegradaProps> = ({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  title = 'Nova Ordem de Carregamento',
  showBackButton = false,
  preloadedNotes = []
}) => {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuthState();
  const queryClient = useQueryClient();

  // Estados para dados de partes (declarados primeiro para evitar erro de inicialização)
  const [remetenteData, setRemetenteData] = useState({
    cnpj: '',
    razao_social: '',
    telefone: '',
    uf: '',
    cidade: '',
    bairro: '',
    endereco: '',
    numero: '',
    complemento: '',
    cep: ''
  });

  const [destinatarioData, setDestinatarioData] = useState({
    cnpj: '',
    razao_social: '',
    telefone: '',
    uf: '',
    cidade: '',
    bairro: '',
    endereco: '',
    numero: '',
    complemento: '',
    cep: ''
  });

  // Estado para número da ordem - dinâmico baseado na classificação
  const [numeroOrdemFixo, setNumeroOrdemFixo] = useState<string>(() => {
    if (initialData?.numero_ordem) {
      return initialData.numero_ordem;
    }
    // Gera número inicial padrão - será atualizado quando classificação for definida
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const timestamp = `${day}${month}${year}${hour}${minute}${second}`;
    return `ORD-${timestamp}`;
  });

  // Função para determinar campos de data visíveis baseado no tipo de operação
  const getVisibleDateFields = () => {
    const tipoMovimentacao = form.watch('tipo_movimentacao');
    const subtipoOperacao = form.watch('subtipo_operacao');
    
    // Mapeamento de campos por tipo de operação
    const dateFieldsConfig = {
      // ENTRADA
      'Entrada-Recebimento': [
        'data_prevista_entrada_armazem',
        'data_entrada_armazem',
        'data_carregamento',
        'data_prevista_entrega'
      ],
      'Entrada-Coleta': [
        'data_prevista_coleta',
        'data_coleta',
        'data_prevista_entrada_armazem',
        'data_entrada_armazem',
        'data_carregamento',
        'data_prevista_entrega'
      ],
      'Entrada-Devolucao': [
        'data_prevista_coleta',
        'data_coleta',
        'data_entrada_armazem',
        'data_carregamento'
      ],
      'Entrada-Transferencia': [
        'data_entrada_armazem',
        'data_carregamento',
        'data_prevista_entrega'
      ],
      
      // SAÍDA
      'Saida-Armazem': [
        'data_carregamento',
        'data_saida_entrega',
        'data_prevista_entrega',
        'data_chegada_na_entrega',
        'data_entrega'
      ],
      'Saida-Direta': [
        'data_prevista_coleta',
        'data_coleta',
        'data_saida_entrega',
        'data_chegada_na_entrega',
        'data_entrega'
      ],
      'Saida-Entrega': [
        'data_carregamento',
        'data_saida_entrega',
        'data_chegada_filial_entrega',
        'data_prevista_entrega',
        'data_chegada_na_entrega',
        'data_entrega'
      ],
      'Saida-Devolucao': [
        'data_prevista_coleta',
        'data_coleta',
        'data_carregamento',
        'data_saida_entrega',
        'data_chegada_na_entrega',
        'data_entrega'
      ],
      'Saida-Transferencia': [
        'data_carregamento',
        'data_saida_entrega',
        'data_chegada_filial_entrega',
        'data_prevista_entrega'
      ],
      
      // TRANSFERÊNCIA
      'Transferencia-Transferencia': [
        'data_carregamento',
        'data_saida_entrega',
        'data_chegada_filial_entrega',
        'data_entrada_armazem'
      ]
    };
    
    const key = `${tipoMovimentacao}-${subtipoOperacao}`;
    return dateFieldsConfig[key] || [];
  };

  // Função para preencher data/hora atual (Brasil/São Paulo)
  const fillCurrentDateTime = (fieldName: string) => {
    const now = new Date();
    
    // Obtém o horário de São Paulo usando Intl.DateTimeFormat
    const saoPauloFormatter = new Intl.DateTimeFormat('sv-SE', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const saoPauloTimeString = saoPauloFormatter.format(now);
    // Resultado será no formato: "YYYY-MM-DD HH:mm"
    const currentDateTime = saoPauloTimeString.replace(' ', 'T');
    
    form.setValue(fieldName as any, currentDateTime);
    toast({
      title: "Data preenchida",
      description: `Campo preenchido com horário de São Paulo`,
    });
  };

  // Handler para tecla H em campos de data
  const handleDateKeyDown = (e: React.KeyboardEvent, fieldName: string) => {
    if (e.key.toLowerCase() === 'h') {
      e.preventDefault();
      fillCurrentDateTime(fieldName);
    }
  };

  // Estados do formulário
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo_movimentacao: initialData?.tipo_movimentacao || '',
      subtipo_operacao: initialData?.subtipo_operacao || '',
      prioridade: initialData?.prioridade || 'Normal',
      // Novos campos de data conforme layout
      data_prevista_coleta: formatDateForInput(initialData?.data_prevista_coleta),
      data_coleta: formatDateForInput(initialData?.data_coleta),
      data_prevista_entrada_armazem: formatDateForInput(initialData?.data_prevista_entrada_armazem),
      data_entrada_armazem: formatDateForInput(initialData?.data_entrada_armazem),
      data_carregamento: formatDateForInput(initialData?.data_carregamento),
      data_prevista_entrega: formatDateForInput(initialData?.data_prevista_entrega),
      data_chegada_filial_entrega: formatDateForInput(initialData?.data_chegada_filial_entrega),
      data_saida_entrega: formatDateForInput(initialData?.data_saida_entrega),
      data_chegada_na_entrega: formatDateForInput(initialData?.data_chegada_na_entrega),
      data_entrega: formatDateForInput(initialData?.data_entrega),
      observacoes: initialData?.observacoes || '',
      peso_bruto_total: initialData?.peso_bruto_total || '',
      quantidade_volumes_total: initialData?.quantidade_volumes_total || '',
      valor_total: initialData?.valor_total || '',
    }
  });

  // Estados para notas fiscais e processamento
  // Inicializar notas fiscais considerando tanto preloadedNotes quanto initialData.notasFiscais
  const initialNotes = Array.isArray(preloadedNotes) ? preloadedNotes : (Array.isArray(initialData?.notasFiscais) ? initialData.notasFiscais : []);
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscalData[]>(initialNotes);
  const [uniqueIdCounter, setUniqueIdCounter] = useState(0);

  // Estados para controle de mudanças e salvamento
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSavedState, setLastSavedState] = useState<string>('');
  const [ordemId, setOrdemId] = useState<string | null>(initialData?.id || null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Função para limpar todas as notas fiscais
  const limparTodasNotas = () => {
    setNotasFiscais([]);
    setVolumeData([]);
    setEtiquetasGeradas(new Set());
    setUniqueIdCounter(0);
    
    toast({
      title: "✅ Lista limpa",
      description: "Todas as notas fiscais foram removidas da ordem",
    });
  };
  const [volumeData, setVolumeData] = useState<NotaVolumeData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [isAddingToFila, setIsAddingToFila] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ordemSalva, setOrdemSalva] = useState<any>(null);
  const [carregandoOrdemCompleta, setCarregandoOrdemCompleta] = useState(false);
  const printSystem = usePrintSystem();
  const [showFilaXModal, setShowFilaXModal] = useState(false);
  const [driverInfo, setDriverInfo] = useState({
    motorista_nome: '',
    veiculo_placa: '',
    doca_designada: ''
  });

  // Estados para entrada de dados
  const [chaveInput, setChaveInput] = useState('');
  const [collectedKeys, setCollectedKeys] = useState<string[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [xmlFiles, setXmlFiles] = useState<File[]>([]);
  
  // Estado para rastrear etiquetas geradas - inicializar com etiquetas existentes se for edição
  const [etiquetasGeradas, setEtiquetasGeradas] = useState<Set<string>>(() => {
    if (mode === 'edit' && initialData?.volumes && Array.isArray(initialData.volumes)) {
      // Se existem volumes na ordem, assumir que as etiquetas já foram geradas
      const notasComEtiquetas = new Set<string>();
      initialData.volumes.forEach((volume: any) => {
        if (volume.codigo_etiqueta && volume.nota_fiscal_id) {
          // Encontrar a NFE correspondente para obter o número da nota
          const nfe = initialNotes.find((n: any) => n.id === volume.nota_fiscal_id);
          if (nfe?.numero_nota) {
            notasComEtiquetas.add(nfe.numero_nota);
          }
        }
      });
      return notasComEtiquetas;
    }
    return new Set();
  });

  // Estado para rastrear etiquetas impressas
  const [etiquetasImpressas, setEtiquetasImpressas] = useState<Set<string>>(new Set());
  
  // Effect para sincronizar etiquetas impressas do localStorage
  useEffect(() => {
    const etiquetasImpressasStorage = JSON.parse(localStorage.getItem('etiquetas_impressas') || '[]');
    setEtiquetasImpressas(new Set(etiquetasImpressasStorage));
  }, []);
  
  // Effect para escutar mudanças no localStorage (etiquetas impressas)
  useEffect(() => {
    const handleStorageChange = () => {
      const etiquetasImpressasStorage = JSON.parse(localStorage.getItem('etiquetas_impressas') || '[]');
      setEtiquetasImpressas(new Set(etiquetasImpressasStorage));
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Verificar a cada segundo para mudanças locais
    const interval = setInterval(handleStorageChange, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Effect para rastrear mudanças no formulário, notas fiscais e dados das partes
  useEffect(() => {
    // Durante inicialização, não verificar mudanças
    if (isInitializing) {
      const timeoutId = setTimeout(() => {
        // Após um tempo, definir o estado inicial como baseline
        const currentState = JSON.stringify({
          formData: form.getValues(),
          notasFiscais: notasFiscais,
          volumeData: volumeData,
          remetente: remetenteData,
          destinatario: destinatarioData
        });
        
        setLastSavedState(currentState);
        setHasUnsavedChanges(false);
        setIsInitializing(false);
      }, 1000); // 1 segundo para completar inicialização
      
      return () => clearTimeout(timeoutId);
    }
    
    // Após inicialização, rastrear mudanças normalmente
    const timeoutId = setTimeout(() => {
      const currentState = JSON.stringify({
        formData: form.getValues(),
        notasFiscais: notasFiscais,
        volumeData: volumeData,
        remetente: remetenteData,
        destinatario: destinatarioData
      });
      
      if (currentState !== lastSavedState) {
        // Só marcar mudança se houver dados significativos alterados
        const hasSignificantData = notasFiscais.length > 0 || 
          remetenteData.razao_social.trim() !== '' || 
          destinatarioData.razao_social.trim() !== '';
        
        if (hasSignificantData) {
          setHasUnsavedChanges(true);
        }
      } else {
        // Estado igual ao último salvo - remover flag de mudanças
        setHasUnsavedChanges(false);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [form.getValues(), notasFiscais, volumeData, remetenteData, destinatarioData, lastSavedState, isInitializing]);

  // Função para gerar número da ordem baseado no subtipo
  const generateOrderNumber = (subtipoOperacao: string) => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2);
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    
    const timestamp = `${day}${month}${year}${hour}${minute}${second}`;
    
    const prefixMap: { [key: string]: string } = {
      'Recebimento': 'REC',
      'Coleta': 'COL',
      'Devolucao': 'DEV',
      'Transferencia': 'TRA',
      'Armazem': 'ARM',
      'Direta': 'DIR',
      'Entrega': 'ENT'
    };
    
    const prefix = prefixMap[subtipoOperacao] || 'ORD';
    return `${prefix}-${timestamp}`;
  };

  // Atualizar número da ordem quando classificação mudar (apenas para novas ordens)
  useEffect(() => {
    // Só atualizar se não estiver em modo de edição (preservar número existente)
    if (mode === 'edit' && initialData?.numero_ordem) {
      return;
    }

    const subscription = form.watch((values) => {
      const { subtipo_operacao } = values;
      
      if (subtipo_operacao) {
        const novoNumero = generateOrderNumber(subtipo_operacao);
        setNumeroOrdemFixo(novoNumero);
      }
    });

    return () => subscription.unsubscribe();
  }, [form, mode, initialData?.numero_ordem]);

  const [cargoData, setCargoData] = useState({
    peso_bruto: '',
    quantidade_volumes: '',
    valor_total: ''
  });

  // Estados para nota manual
  const [manualNoteData, setManualNoteData] = useState({
    numero_nota: '',
    serie_nota: '1',
    natureza_operacao: 'Venda',
    data_emissao: new Date().toISOString().split('T')[0],
    informacoes_complementares: ''
  });

  // Estados para modal de volume
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [currentVolumeNota, setCurrentVolumeNota] = useState<string>('');

  // Estado para mostrar formulário manual
  const [showManualForm, setShowManualForm] = useState(false);
  
  // Estado para NFEImportManager
  const [showNFEImportManager, setShowNFEImportManager] = useState(false);
  
  // Estado para modal de pesquisa de NFe
  const [showNFESearchModal, setShowNFESearchModal] = useState(false);
  const [nfeSearchResults, setNfeSearchResults] = useState<NotaFiscalData[]>([]);
  const [nfeSearchLoading, setNfeSearchLoading] = useState(false);
  const [selectedNFEs, setSelectedNFEs] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('numero'); // Tipo de pesquisa selecionado
  const [dataInicioPeriodo, setDataInicioPeriodo] = useState('');
  const [dataFimPeriodo, setDataFimPeriodo] = useState('');

  // useEffect para atualizar dados quando initialData mudar (importante para modo de edição)
  useEffect(() => {
    console.log('NovaOrdemIntegrada: UseEffect executado - mode:', mode, 'initialData existe:', !!initialData);
    
    if (mode === 'edit' && initialData) {
      console.log('NovaOrdemIntegrada: InitialData completo:', initialData);
      console.log('NovaOrdemIntegrada: InitialData keys:', Object.keys(initialData));
      
      // Carregar notas fiscais
      if (initialData?.notasFiscais) {
        console.log('NovaOrdemIntegrada: Carregando notas fiscais do initialData:', initialData.notasFiscais);
        setNotasFiscais(initialData.notasFiscais);
      }
      
      // Carregar dados do remetente
      console.log('NovaOrdemIntegrada: Verificando remetente_razao_social:', initialData.remetente_razao_social);
      console.log('NovaOrdemIntegrada: Verificando remetente_cnpj:', initialData.remetente_cnpj);
      
      if (initialData.remetente_razao_social) {
        console.log('NovaOrdemIntegrada: Carregando dados do remetente:', {
          cnpj: initialData.remetente_cnpj,
          razao_social: initialData.remetente_razao_social,
          telefone: initialData.remetente_telefone
        });
        setRemetenteData({
          cnpj: initialData.remetente_cnpj || '',
          razao_social: initialData.remetente_razao_social || '',
          telefone: initialData.remetente_telefone || '',
          uf: initialData.remetente_uf || '',
          cidade: initialData.remetente_cidade || '',
          bairro: initialData.remetente_bairro || '',
          endereco: initialData.remetente_endereco || '',
          numero: initialData.remetente_numero || '',
          complemento: initialData.remetente_complemento || '',
          cep: initialData.remetente_cep || ''
        });
      }
      
      // Carregar dados do destinatário
      if (initialData.destinatario_razao_social) {
        setDestinatarioData({
          cnpj: initialData.destinatario_cnpj || '',
          razao_social: initialData.destinatario_razao_social || '',
          telefone: initialData.destinatario_telefone || '',
          uf: initialData.destinatario_uf || '',
          cidade: initialData.destinatario_cidade || '',
          bairro: initialData.destinatario_bairro || '',
          endereco: initialData.destinatario_endereco || '',
          numero: initialData.destinatario_numero || '',
          complemento: initialData.destinatario_complemento || '',
          cep: initialData.destinatario_cep || ''
        });
      }
      
      // Processar volumes existentes se houver
      if (initialData?.volumes && initialData.volumes.length > 0) {
        console.log('NovaOrdemIntegrada: Processando volumes existentes:', initialData.volumes);
        
        // Agrupar volumes por nota fiscal
        const volumesPorNota: { [notaId: string]: any[] } = {};
        
        initialData.volumes.forEach((volume: any) => {
          if (!volumesPorNota[volume.nota_fiscal_id]) {
            volumesPorNota[volume.nota_fiscal_id] = [];
          }
          volumesPorNota[volume.nota_fiscal_id].push(volume);
        });
        
        // Criar estrutura de volume data para cada nota
        const volumeDataExistente: NotaVolumeData[] = [];
        
        initialData.notasFiscais.forEach((nota: any) => {
          const volumesNota = volumesPorNota[nota.id] || [];
          const numeroNota = nota.numero_nota || nota.numero_nf;
          
          if (volumesNota.length > 0) {
            const volumeData: NotaVolumeData = {
              notaId: nota.id,
              numeroNota: numeroNota,
              volumes: volumesNota.map((vol: any, index: number) => ({
                volume: index + 1,
                altura: parseFloat(vol.altura_cm) / 100 || 0, // Converter cm para m
                largura: parseFloat(vol.largura_cm) / 100 || 0,
                comprimento: parseFloat(vol.comprimento_cm) / 100 || 0,
                m3: parseFloat(vol.volume_m3) || 0
              })),
              totalM3: volumesNota.reduce((total: number, vol: any) => total + (parseFloat(vol.volume_m3) || 0), 0),
              pesoTotal: parseFloat(nota.peso_bruto) || 0
            };
            
            volumeDataExistente.push(volumeData);
            console.log('NovaOrdemIntegrada: Volume data criado para nota', numeroNota, ':', volumeData);
          }
        });
        
        setVolumeData(volumeDataExistente);
        console.log('NovaOrdemIntegrada: Volume data total carregado:', volumeDataExistente);
      }
    }
  }, [mode, initialData]);

  // Função para preparar NFEs para impressão
  const prepararNFEsParaImpressao = (notasFiscais: any[], volumes: any[]) => {
    if (!Array.isArray(notasFiscais)) return [];
    
    return notasFiscais.map((nfe: any) => ({
      id: nfe.id,
      numero: nfe.numero_nota || nfe.numero_nf,
      chaveAcesso: nfe.chave_nota || nfe.chave_acesso,
      valorDeclarado: parseFloat(nfe.valor_nota_fiscal || nfe.valor_total || '0'),
      peso: parseFloat(nfe.peso_bruto || '0'),
      volume: parseInt(nfe.volumes || '1'),
      m3: 0, // Calcular a partir dos volumes se necessário
      remetente: {
        razaoSocial: nfe.emitente_razao_social || remetenteData.razao_social,
        cnpj: nfe.emitente_cnpj || remetenteData.cnpj,
        uf: nfe.emitente_uf || remetenteData.uf,
        cidade: nfe.emitente_cidade || remetenteData.cidade
      },
      destinatario: {
        razaoSocial: nfe.destinatario_razao_social || destinatarioData.razao_social,
        cnpj: nfe.destinatario_cnpj || destinatarioData.cnpj,
        uf: nfe.destinatario_uf || destinatarioData.uf,
        cidade: nfe.destinatario_cidade || destinatarioData.cidade
      }
    }));
  };

  // Função para ler arquivo como texto
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Função para converter XMLDocument em objeto JavaScript
  const parseXMLToObject = (xmlDoc: Document): any => {
    const xmlToObject = (node: Element): any => {
      const obj: any = {};
      
      // Processar atributos
      if (node.attributes && node.attributes.length > 0) {
        obj['@attributes'] = {};
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          obj['@attributes'][attr.name] = attr.value;
        }
      }
      
      // Processar filhos
      if (node.childNodes && node.childNodes.length > 0) {
        for (let i = 0; i < node.childNodes.length; i++) {
          const child = node.childNodes[i];
          
          if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim();
            if (text) {
              obj['#text'] = text;
            }
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const childElement = child as Element;
            const childName = childElement.nodeName.toLowerCase();
            const childObj = xmlToObject(childElement);
            
            if (obj[childName]) {
              if (!Array.isArray(obj[childName])) {
                obj[childName] = [obj[childName]];
              }
              obj[childName].push(childObj);
            } else {
              obj[childName] = childObj;
            }
          }
        }
      }
      
      // Se só tem texto, retornar diretamente o texto
      if (Object.keys(obj).length === 1 && obj['#text']) {
        return obj['#text'];
      }
      
      return obj;
    };
    
    return xmlToObject(xmlDoc.documentElement);
  };

  // Função para extrair valor de XML
  const getXMLValue = (xmlDoc: Document, selector: string): string => {
    const element = xmlDoc.querySelector(selector);
    return element?.textContent?.trim() || '';
  };

  // Função para extrair chave da NFe do XML
  const extractNFeKey = (xmlDoc: Document): string => {
    const chaveElement = xmlDoc.querySelector('infNFe');
    return chaveElement?.getAttribute('Id')?.replace('NFe', '') || '';
  };

  // Função para extrair dados do XML
  const extractDataFromXml = (xmlDoc: Document): NotaFiscalData | null => {
    try {
      const chaveNFe = extractNFeKey(xmlDoc);
      
      if (!chaveNFe || chaveNFe.length !== 44) {
        throw new Error('Chave da NFe não encontrada ou inválida');
      }

      return {
        id: chaveNFe,
        chave_nota_fiscal: chaveNFe,
        numero_nota: getXMLValue(xmlDoc, 'ide nNF'),
        serie_nota: getXMLValue(xmlDoc, 'ide serie'),
        data_hora_emissao: getXMLValue(xmlDoc, 'ide dhEmi'),
        natureza_operacao: getXMLValue(xmlDoc, 'ide natOp'),
        emitente_cnpj: getXMLValue(xmlDoc, 'emit CNPJ'),
        emitente_razao_social: getXMLValue(xmlDoc, 'emit xNome'),
        emitente_telefone: getXMLValue(xmlDoc, 'emit enderEmit fone'),
        emitente_uf: getXMLValue(xmlDoc, 'emit enderEmit UF'),
        emitente_cidade: getXMLValue(xmlDoc, 'emit enderEmit xMun'),
        emitente_bairro: getXMLValue(xmlDoc, 'emit enderEmit xBairro'),
        emitente_endereco: getXMLValue(xmlDoc, 'emit enderEmit xLgr'),
        emitente_numero: getXMLValue(xmlDoc, 'emit enderEmit nro'),
        emitente_cep: getXMLValue(xmlDoc, 'emit enderEmit CEP'),
        destinatario_cnpj: getXMLValue(xmlDoc, 'dest CNPJ'),
        destinatario_razao_social: getXMLValue(xmlDoc, 'dest xNome'),
        destinatario_telefone: getXMLValue(xmlDoc, 'dest enderDest fone'),
        destinatario_uf: getXMLValue(xmlDoc, 'dest enderDest UF'),
        destinatario_cidade: getXMLValue(xmlDoc, 'dest enderDest xMun'),
        destinatario_bairro: getXMLValue(xmlDoc, 'dest enderDest xBairro'),
        destinatario_endereco: getXMLValue(xmlDoc, 'dest enderDest xLgr'),
        destinatario_numero: getXMLValue(xmlDoc, 'dest enderDest nro'),
        destinatario_cep: getXMLValue(xmlDoc, 'dest enderDest CEP'),
        quantidade_volumes: getXMLValue(xmlDoc, 'transp vol qVol') || '1',
        valor_nota_fiscal: getXMLValue(xmlDoc, 'total ICMSTot vNF'),
        peso_bruto: getXMLValue(xmlDoc, 'transp vol pesoB'),
        informacoes_complementares: getXMLValue(xmlDoc, 'infAdic infCpl'),
        numero_pedido: getXMLValue(xmlDoc, 'det prod xPed'),
        operacao: 'Entrada',
        cliente_retira: 'N',
        tipo_frete: getXMLValue(xmlDoc, 'transp modFrete'),
        custo_extra: '0'
      };
    } catch (error) {
      console.error('Erro ao extrair dados do XML:', error);
      return null;
    }
  };

  // Função para processar arquivo XML (sem verificação de duplicata - feita no handleXmlUpload)
  const processXMLFile = async (file: File) => {
    try {
      const xmlContent = await readFileAsText(file);
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

      console.log('XML parseado:', xmlDoc);
      
      // USAR EXTRAÇÃO SIMPLES DIRETAMENTE DO XMLDocument (como na NSDocs)
      const getValue = (selector: string): string => {
        const element = xmlDoc.querySelector(selector);
        return element?.textContent?.trim() || '';
      };
      
      // Extrair dados básicos da NFe
      const chaveNF = getValue('infNFe') ? xmlDoc.querySelector('infNFe')?.getAttribute('Id')?.replace('NFe', '') || '' : '';
      const numeroNF = getValue('nNF') || '';
      const serieNF = getValue('serie') || '';
      const dataEmissao = getValue('dhEmi') || getValue('dEmi') || '';
      const naturezaOperacao = getValue('natOp') || '';
      const valorTotal = getValue('vNF') || '';
      
      // Emitente
      const emitenteCnpj = getValue('emit cnpj') || getValue('emit CNPJ') || '';
      const emitenteRazao = getValue('emit xNome') || '';
      const emitenteFone = getValue('enderEmit fone') || '';
      const emitenteUf = getValue('enderEmit UF') || '';
      const emitenteCidade = getValue('enderEmit xMun') || '';
      const emitenteBairro = getValue('enderEmit xBairro') || '';
      const emitenteEndereco = getValue('enderEmit xLgr') || '';
      const emitenteNumero = getValue('enderEmit nro') || '';
      const emitenteCep = getValue('enderEmit CEP') || '';
      
      // Destinatário
      const destinatarioCnpj = getValue('dest cnpj') || getValue('dest CNPJ') || '';
      const destinatarioRazao = getValue('dest xNome') || '';
      const destinatarioFone = getValue('enderDest fone') || '';
      const destinatarioUf = getValue('enderDest UF') || '';
      const destinatarioCidade = getValue('enderDest xMun') || '';
      const destinatarioBairro = getValue('enderDest xBairro') || '';
      const destinatarioEndereco = getValue('enderDest xLgr') || '';
      const destinatarioNumero = getValue('enderDest nro') || '';
      const destinatarioCep = getValue('enderDest CEP') || '';
      
      // Transporte
      const pesoBruto = getValue('vol pesoB') || getValue('transp vol pesoB') || '';
      const qtdVolumes = getValue('vol qVol') || getValue('transp vol qVol') || '1';
      
      // Informações complementares
      const informacoesComplementares = getValue('infCpl') || '';
      
      console.log('Dados extraídos:', {
        chaveNF, numeroNF, serieNF, emitenteCnpj, emitenteRazao, destinatarioCnpj, destinatarioRazao
      });

      // MAPEAMENTO DE CAMPOS: Converter para formato esperado
      const extractedData = {
        id: chaveNF || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        chave_nota_fiscal: chaveNF,
        numero_nota: numeroNF,
        serie_nota: serieNF,
        data_hora_emissao: dataEmissao,
        natureza_operacao: naturezaOperacao,
        emitente_cnpj: emitenteCnpj,
        emitente_razao_social: emitenteRazao,
        emitente_telefone: emitenteFone,
        emitente_uf: emitenteUf,
        emitente_cidade: emitenteCidade,
        emitente_bairro: emitenteBairro,
        emitente_endereco: emitenteEndereco,
        emitente_numero: emitenteNumero,
        emitente_cep: emitenteCep,
        destinatario_cnpj: destinatarioCnpj,
        destinatario_razao_social: destinatarioRazao,
        destinatario_telefone: destinatarioFone,
        destinatario_uf: destinatarioUf,
        destinatario_cidade: destinatarioCidade,
        destinatario_bairro: destinatarioBairro,
        destinatario_endereco: destinatarioEndereco,
        destinatario_numero: destinatarioNumero,
        destinatario_cep: destinatarioCep,
        quantidade_volumes: qtdVolumes,
        valor_nota_fiscal: valorTotal,
        peso_bruto: pesoBruto,
        informacoes_complementares: informacoesComplementares,
        numero_pedido: '',
        operacao: 'Entrada',
        cliente_retira: 'N',
        tipo_frete: '0',
        custo_extra: '0'
      };
      
      console.log('Dados finais mapeados:', extractedData);
      
      if (!extractedData.chave_nota_fiscal && !extractedData.numero_nota) {
        throw new Error('XML não contém dados válidos de NFe');
      }

      // INCLUIR CONTEÚDO XML COMPLETO nos dados extraídos
      const enrichedData = {
        ...extractedData,
        xml_content: xmlContent, // Salvar XML completo
        xml_source: 'upload' // Marcar fonte como upload
      };

      // Adicionar nota com XML completo (verificar duplicata)
      setNotasFiscais(prev => {
        // Verificar duplicata antes de adicionar
        if (prev.some(nota => nota.chave_nota_fiscal === enrichedData.chave_nota_fiscal)) {
          console.log(`Nota ${enrichedData.numero_nota} já existe, não adicionando duplicata`);
          return prev;
        }
        return [...prev, enrichedData];
      });

      // Atualizar dados de remetente e destinatário com a primeira nota se não existirem
      setRemetenteData(prev => {
        if (!prev.cnpj && extractedData.emitente_cnpj) {
          return {
            cnpj: extractedData.emitente_cnpj,
            razao_social: extractedData.emitente_razao_social,
            telefone: extractedData.emitente_telefone,
            uf: extractedData.emitente_uf,
            cidade: extractedData.emitente_cidade,
            bairro: extractedData.emitente_bairro,
            endereco: extractedData.emitente_endereco,
            numero: extractedData.emitente_numero,
            complemento: '',
            cep: extractedData.emitente_cep
          };
        }
        return prev;
      });

      setDestinatarioData(prev => {
        if (!prev.cnpj && extractedData.destinatario_cnpj) {
          return {
            cnpj: extractedData.destinatario_cnpj,
            razao_social: extractedData.destinatario_razao_social,
            telefone: extractedData.destinatario_telefone,
            uf: extractedData.destinatario_uf,
            cidade: extractedData.destinatario_cidade,
            bairro: extractedData.destinatario_bairro,
            endereco: extractedData.destinatario_endereco,
            numero: extractedData.destinatario_numero,
            complemento: '',
            cep: extractedData.destinatario_cep
          };
        }
        return prev;
      });

      // Criar dados de volume
      const quantidadeVolumesNum = parseInt(qtdVolumes) || 1;
      const pesoTotal = parseFloat(pesoBruto) || 0;
      
      const notaVolumeData: NotaVolumeData = {
        notaId: extractedData.id,
        numeroNota: extractedData.numero_nota,
        volumes: Array.from({ length: quantidadeVolumesNum }, (_, i) => ({
          volume: i + 1,
          altura: 0,
          largura: 0,
          comprimento: 0,
          m3: 0
        })),
        totalM3: 0,
        pesoTotal
      };

      setVolumeData(prev => {
        // Verificar duplicata por número da nota (XML upload)
        if (prev.some(vol => vol.numeroNota === extractedData.numero_nota)) {
          console.log(`Volume para nota ${extractedData.numero_nota} já existe, não adicionando duplicata`);
          return prev;
        }
        return [...prev, notaVolumeData];
      });

      toast({
        title: "✅ XML processado",
        description: `Nota fiscal ${extractedData.numero_nota} adicionada`
      });

    } catch (error) {
      console.error('Erro ao processar XML:', error);
      toast({
        title: "❌ Erro no XML",
        description: "Arquivo XML inválido ou corrompido"
      });
    }
  };

  // Função para upload de XMLs
  const handleXmlUpload = async (files: File[]) => {
    const processedKeys = new Set<string>();
    const currentKeys = new Set(notasFiscais.map(nota => nota.chave_nota_fiscal?.trim()).filter(Boolean));
    
    for (const file of files) {
      const xmlContent = await readFileAsText(file);
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      const extractedData = extractDataFromXml(xmlDoc);
      if (!extractedData) continue;
      
      const chaveNotaFiscal = extractedData.chave_nota_fiscal?.trim();
      const numeroNota = extractedData.numero_nota?.trim();
      
      // Verificar duplicatas contra notas existentes e dentro do lote atual
      if (currentKeys.has(chaveNotaFiscal) || processedKeys.has(chaveNotaFiscal)) {
        toast({
          title: "⚠️ Nota Fiscal Duplicada",
          description: `A nota fiscal ${numeroNota || chaveNotaFiscal} já foi importada - ignorando duplicata`,
          variant: "destructive"
        });
        continue;
      }
      
      // Processar arquivo se não for duplicata
      await processXMLFile(file);
      processedKeys.add(chaveNotaFiscal);
    }
  };

  // Configuração do dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml']
    },
    onDrop: handleXmlUpload
  });

  // Função para validar chave NFe
  const isValidNFeKey = (key: string): boolean => {
    return /^\d{44}$/.test(key.replace(/\s/g, ''));
  };

  // Função para adicionar chave à lista
  const adicionarChave = () => {
    const cleanKey = chaveInput.replace(/\s/g, '');
    
    if (!isValidNFeKey(cleanKey)) {
      toast({
        title: "❌ Chave inválida",
        description: "A chave deve ter exatamente 44 dígitos"
      });
      return;
    }

    // Verificar duplicatas na lista coletada
    if (collectedKeys.includes(cleanKey)) {
      toast({
        title: "⚠️ Chave duplicada",
        description: "Esta chave já foi adicionada à lista"
      });
      return;
    }

    // Verificar duplicatas em notas já importadas
    if (notasFiscais.some(nota => nota.chave_nota_fiscal === cleanKey)) {
      toast({
        title: "⚠️ Nota já importada",
        description: "Nota fiscal já está relacionada, caso finalizado clique em Importar NFe"
      });
      return;
    }

    setCollectedKeys(prev => [...prev, cleanKey]);
    setChaveInput('');
    
    toast({
      title: "✅ Chave adicionada",
      description: "Chave coletada com sucesso"
    });
  };

  // Função para importar NFes via API
  const importarNFesViaAPI = async () => {
    if (collectedKeys.length === 0) {
      toast({
        title: "❌ Nenhuma chave",
        description: "Adicione pelo menos uma chave antes de importar"
      });
      return;
    }

    setIsApiLoading(true);
    let sucessos = 0;

    try {
      for (const chave of collectedKeys) {
        try {
          // Get authentication token from localStorage (mesma implementação funcionando)
          const authToken = localStorage.getItem('token');
          if (!authToken) {
            throw new Error('Token de autenticação não encontrado');
          }

          const response = await fetch('/api/xml/fetch-from-nsdocs', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ chaveNotaFiscal: chave })
          });

          if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
          }

          const result = await response.json();

          if (result.success && result.data) {
            // Verificar duplicata antes de processar (evita duplicação visual)
            const alreadyExists = notasFiscais.some(nota => nota.chave_nota_fiscal === chave);
            if (alreadyExists) {
              console.log(`Chave ${chave} já existe na lista, pulando processamento`);
              continue;
            }

            const processedNote: NotaFiscalData = {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              chave_nota_fiscal: chave,
              numero_nota: result.data.numero_nota || '',
              serie_nota: result.data.serie_nota || '1',
              data_hora_emissao: result.data.data_hora_emissao || '',
              natureza_operacao: result.data.natureza_operacao || '',
              emitente_cnpj: result.data.emitente_cnpj || '',
              emitente_razao_social: result.data.emitente_razao_social || '',
              emitente_telefone: result.data.emitente_telefone || '',
              emitente_uf: result.data.emitente_uf || '',
              emitente_cidade: result.data.emitente_cidade || '',
              emitente_bairro: result.data.emitente_bairro || '',
              emitente_endereco: result.data.emitente_endereco || '',
              emitente_numero: result.data.emitente_numero || '',
              emitente_cep: result.data.emitente_cep || '',
              destinatario_cnpj: result.data.destinatario_cnpj || '',
              destinatario_razao_social: result.data.destinatario_razao_social || '',
              destinatario_telefone: result.data.destinatario_telefone || '',
              destinatario_uf: result.data.destinatario_uf || '',
              destinatario_cidade: result.data.destinatario_cidade || '',
              destinatario_bairro: result.data.destinatario_bairro || '',
              destinatario_endereco: result.data.destinatario_endereco || '',
              destinatario_numero: result.data.destinatario_numero || '',
              destinatario_cep: result.data.destinatario_cep || '',
              quantidade_volumes: result.data.quantidade_volumes || '1',
              valor_nota_fiscal: result.data.valor_nota_fiscal || '0',
              peso_bruto: result.data.peso_bruto || '0',
              informacoes_complementares: result.data.informacoes_complementares || '',
              numero_pedido: result.data.numero_pedido || '',
              operacao: 'Entrada',
              cliente_retira: 'N',
              tipo_frete: result.data.tipo_frete || '0',
              custo_extra: '0'
            };

            setNotasFiscais(prev => {
              // Verificação adicional no state updater para garantia
              if (prev.some(nota => 
                nota.chave_nota_fiscal === chave || 
                nota.numero_nota === processedNote.numero_nota ||
                nota.id === processedNote.id
              )) {
                console.log(`Nota ${processedNote.numero_nota} (chave: ${chave}) já existe no estado atual, não adicionando duplicata`);
                return prev;
              }
              
              // Garantir ID único baseado na chave de acesso
              const notaComIdUnico = {
                ...processedNote,
                id: chave || `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
              };
              
              return [...prev, notaComIdUnico];
            });

            // Atualizar dados de remetente e destinatário com a primeira nota se não existirem
            setRemetenteData(prev => {
              if (!prev.cnpj && processedNote.emitente_cnpj) {
                return {
                  cnpj: processedNote.emitente_cnpj,
                  razao_social: processedNote.emitente_razao_social,
                  telefone: processedNote.emitente_telefone,
                  uf: processedNote.emitente_uf,
                  cidade: processedNote.emitente_cidade,
                  bairro: processedNote.emitente_bairro,
                  endereco: processedNote.emitente_endereco,
                  numero: processedNote.emitente_numero,
                  complemento: '',
                  cep: processedNote.emitente_cep
                };
              }
              return prev;
            });

            setDestinatarioData(prev => {
              if (!prev.cnpj && processedNote.destinatario_cnpj) {
                return {
                  cnpj: processedNote.destinatario_cnpj,
                  razao_social: processedNote.destinatario_razao_social,
                  telefone: processedNote.destinatario_telefone,
                  uf: processedNote.destinatario_uf,
                  cidade: processedNote.destinatario_cidade,
                  bairro: processedNote.destinatario_bairro,
                  endereco: processedNote.destinatario_endereco,
                  numero: processedNote.destinatario_numero,
                  complemento: '',
                  cep: processedNote.destinatario_cep
                };
              }
              return prev;
            });

            // Criar volumes automaticamente
            const quantidadeVolumes = parseInt(processedNote.volumes) || 1;
            const volumes = Array.from({ length: quantidadeVolumes }, (_, index) => ({
              volume: index + 1,
              altura: 0,
              largura: 0,
              comprimento: 0,
              m3: 0
            }));

            const notaVolumeData: NotaVolumeData = {
              notaId: processedNote.id, // Este será o ID temporário, será atualizado na finalização
              numeroNota: processedNote.numero_nota,
              volumes: volumes,
              totalM3: 0,
              pesoTotal: parseFloat(processedNote.peso_bruto) || 0
            };
            setVolumeData(prev => {
              // Verificar duplicata por número da nota
              if (prev.some(vol => vol.numeroNota === processedNote.numero_nota)) {
                console.log(`Volume para nota ${processedNote.numero_nota} já existe, não adicionando duplicata`);
                return prev;
              }
              return [...prev, notaVolumeData];
            });
            sucessos++;
          }
        } catch (error) {
          console.error(`Erro ao processar chave ${chave}:`, error);
        }
      }

      if (sucessos > 0) {
        toast({
          title: "✅ Importação realizada com sucesso!",
          description: `${sucessos} de ${collectedKeys.length} NFe(s) processada(s). Agora informe as dimensões dos volumes no "Extrato de Volumes" abaixo.`
        });
        
        // Limpar lista de chaves após processamento
        setCollectedKeys([]);
      } else {
        toast({
          title: "Erro",
          description: "Nenhuma NFe foi encontrada",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Erro na API:', error);
      toast({
        title: "❌ Erro na importação",
        description: "Falha ao buscar dados via API",
        variant: "destructive"
      });
    } finally {
      setIsApiLoading(false);
    }
  };

  // Função para buscar CNPJ
  const buscarCNPJ = async (cnpj: string, tipo: 'remetente' | 'destinatario') => {
    if (!cnpj || cnpj.length < 14) return;

    try {
      const response = await fetch(`/api/lookup-cnpj/${cnpj}`);
      if (!response.ok) return;

      const data = await response.json();
      
      if (data.success && data.data) {
        const empresaData = {
          cnpj: cnpj,
          razao_social: data.data.razaoSocial || data.data.nome || '',
          telefone: data.data.telefone || '',
          uf: data.data.uf || '',
          cidade: data.data.cidade || data.data.municipio || '',
          bairro: data.data.bairro || '',
          endereco: data.data.endereco || data.data.logradouro || '',
          numero: data.data.numero || '',
          complemento: '',
          cep: data.data.cep || ''
        };

        if (tipo === 'remetente') {
          setRemetenteData(empresaData);
        } else {
          setDestinatarioData(empresaData);
        }

        // Reduzir notificações - apenas feedback visual
      }
    } catch (error) {
      console.error('Erro ao buscar CNPJ:', error);
    }
  };

  // Função para adicionar nota manual
  const adicionarNotaManual = () => {
    setShowManualForm(true);
  };

  // Função para gerar número da nota baseado no tipo de ordem
  const gerarNumeroNota = () => {
    const formData = form.getValues();
    const tipoMovimentacao = formData.tipo_movimentacao;
    const subtipoOperacao = formData.subtipo_operacao;
    const timestamp = Date.now();
    
    // Padrão de numeração baseado no tipo de ordem
    let prefixo = '';
    
    if (tipoMovimentacao === 'Entrada') {
      switch(subtipoOperacao) {
        case 'Recebimento':
          prefixo = 'REC';
          break;
        case 'Coleta':
          prefixo = 'COL';
          break;
        case 'Devolucao':
          prefixo = 'DEV';
          break;
        case 'Transferencia':
          prefixo = 'TRF';
          break;
        default:
          prefixo = 'ENT';
      }
    } else if (tipoMovimentacao === 'Saida') {
      switch(subtipoOperacao) {
        case 'Armazem':
          prefixo = 'ARM';
          break;
        case 'Transferencia':
          prefixo = 'TRF';
          break;
        case 'Direta':
          prefixo = 'DIR';
          break;
        case 'Entrega':
          prefixo = 'ENT';
          break;
        case 'Devolucao':
          prefixo = 'DEV';
          break;
        default:
          prefixo = 'SAI';
      }
    } else {
      prefixo = 'ORD';
    }
    
    return `${prefixo}-${timestamp}`;
  };

  // Função para criar nota manual após preenchimento
  const criarNotaManualComDados = () => {
    if (!remetenteData.cnpj || !destinatarioData.cnpj || !cargoData.peso_bruto || !cargoData.valor_total) {
      // Apenas retornar sem toast para evitar interferir com botão
      return;
    }

    // Gerar número da nota baseado no tipo de ordem
    const numeroNota = gerarNumeroNota();
    const noteId = numeroNota;
    
    const novaNotaManual: NotaFiscalData = {
      id: noteId,
      chave_nota_fiscal: noteId,
      numero_nota: manualNoteData.numero_nota || numeroNota,
      serie_nota: manualNoteData.serie_nota,
      data_hora_emissao: manualNoteData.data_emissao,
      natureza_operacao: manualNoteData.natureza_operacao,
      emitente_cnpj: remetenteData.cnpj,
      emitente_razao_social: remetenteData.razao_social,
      emitente_telefone: remetenteData.telefone,
      emitente_uf: remetenteData.uf,
      emitente_cidade: remetenteData.cidade,
      emitente_bairro: remetenteData.bairro,
      emitente_endereco: remetenteData.endereco,
      emitente_numero: remetenteData.numero,
      emitente_cep: remetenteData.cep,
      destinatario_cnpj: destinatarioData.cnpj,
      destinatario_razao_social: destinatarioData.razao_social,
      destinatario_telefone: destinatarioData.telefone,
      destinatario_uf: destinatarioData.uf,
      destinatario_cidade: destinatarioData.cidade,
      destinatario_bairro: destinatarioData.bairro,
      destinatario_endereco: destinatarioData.endereco,
      destinatario_numero: destinatarioData.numero,
      destinatario_cep: destinatarioData.cep,
      quantidade_volumes: cargoData.quantidade_volumes || '1',
      valor_nota_fiscal: cargoData.valor_total || '0',
      peso_bruto: cargoData.peso_bruto || '0',
      informacoes_complementares: manualNoteData.informacoes_complementares,
      numero_pedido: '',
      operacao: 'Entrada',
      cliente_retira: 'N',
      tipo_frete: '0',
      custo_extra: '0'
    };

    setNotasFiscais(prev => [...prev, novaNotaManual]);

    // Marcar como tendo mudanças não salvas
    setHasUnsavedChanges(true);

    // Criar dados de volume
    const quantidadeVolumes = parseInt(cargoData.quantidade_volumes) || 1;
    const pesoTotal = parseFloat(cargoData.peso_bruto) || 0;
    
    const notaVolumeData: NotaVolumeData = {
      notaId: noteId,
      numeroNota: manualNoteData.numero_nota,
      volumes: Array.from({ length: quantidadeVolumes }, (_, i) => ({
        volume: i + 1,
        altura: 0,
        largura: 0,
        comprimento: 0,
        m3: 0
      })),
      totalM3: 0,
      pesoTotal
    };

    setVolumeData(prev => [...prev, notaVolumeData]);

    // Limpar formulário
    setManualNoteData({
      numero_nota: '',
      serie_nota: '1',
      natureza_operacao: 'Venda',
      data_emissao: new Date().toISOString().split('T')[0],
      informacoes_complementares: ''
    });

    toast({
      title: "✅ Nota adicionada",
      description: "Nota manual criada com sucesso"
    });
  };

  // Função para criar nota manual
  const criarNotaManual = () => {
    // Verificar se os dados básicos estão preenchidos
    if (!cargoData.peso_bruto || !cargoData.quantidade_volumes || !cargoData.valor_total) {
      toast({
        title: "Dados incompletos",
        description: "Preencha os dados da carga para criar a nota manual",
        variant: "destructive"
      });
      return;
    }

    // Gerar ID para nota manual
    const noteId = `ORD-${Date.now()}`;
    
    const novaNotaManual: NotaFiscalData = {
      id: noteId,
      chave_nota_fiscal: noteId,
      numero_nota: manualNoteData.numero_nota || `ORD-${Date.now()}`,
      serie_nota: manualNoteData.serie_nota || '1',
      data_hora_emissao: manualNoteData.data_emissao || new Date().toISOString(),
      natureza_operacao: manualNoteData.natureza_operacao || 'Ordem de Carregamento Manual',
      emitente_cnpj: remetenteData.cnpj || '',
      emitente_razao_social: remetenteData.razao_social || '',
      emitente_telefone: remetenteData.telefone || '',
      emitente_uf: remetenteData.uf || '',
      emitente_cidade: remetenteData.cidade || '',
      emitente_bairro: remetenteData.bairro || '',
      emitente_endereco: remetenteData.endereco || '',
      emitente_numero: remetenteData.numero || '',
      emitente_cep: remetenteData.cep || '',
      destinatario_cnpj: destinatarioData.cnpj || '',
      destinatario_razao_social: destinatarioData.razao_social || '',
      destinatario_telefone: destinatarioData.telefone || '',
      destinatario_uf: destinatarioData.uf || '',
      destinatario_cidade: destinatarioData.cidade || '',
      destinatario_bairro: destinatarioData.bairro || '',
      destinatario_endereco: destinatarioData.endereco || '',
      destinatario_numero: destinatarioData.numero || '',
      destinatario_cep: destinatarioData.cep || '',
      quantidade_volumes: cargoData.quantidade_volumes || '1',
      valor_nota_fiscal: cargoData.valor_total || '0',
      peso_bruto: cargoData.peso_bruto || '0',
      informacoes_complementares: manualNoteData.informacoes_complementares || '',
      numero_pedido: '',
      operacao: 'Manual',
      cliente_retira: 'N',
      tipo_frete: '0',
      custo_extra: '0'
    };

    setNotasFiscais(prev => [...prev, novaNotaManual]);

    // Marcar como tendo mudanças não salvas
    setHasUnsavedChanges(true);

    // Criar dados de volume
    const quantidadeVolumes = parseInt(cargoData.quantidade_volumes) || 1;
    const pesoTotal = parseFloat(cargoData.peso_bruto) || 0;
    
    const notaVolumeData: NotaVolumeData = {
      notaId: noteId,
      numeroNota: novaNotaManual.numero_nota,
      volumes: Array.from({ length: quantidadeVolumes }, (_, i) => ({
        volume: i + 1,
        altura: 0,
        largura: 0,
        comprimento: 0,
        m3: 0
      })),
      totalM3: 0,
      pesoTotal
    };

    setVolumeData(prev => [...prev, notaVolumeData]);

    // Limpar apenas dados da nota, mantendo remetente/destinatário para próximas notas
    setManualNoteData({
      numero_nota: '',
      serie_nota: '1',
      natureza_operacao: 'Venda',
      data_emissao: new Date().toISOString().split('T')[0],
      informacoes_complementares: ''
    });
    
    setCargoData({
      peso_bruto: '',
      quantidade_volumes: '',
      valor_total: ''
    });

    // Fechar formulário manual
    setShowManualForm(false);

    // Reduzir notificações - apenas feedback visual sem toast
  };

  // Função para remover nota
  const removerNota = (notaId: string) => {
    // Encontrar a nota que será removida para obter o número
    const notaParaRemover = notasFiscais.find(nota => nota.id === notaId);
    const numeroNota = notaParaRemover?.numero_nota;
    
    setNotasFiscais(prev => prev.filter(nota => nota.id !== notaId));
    setVolumeData(prev => prev.filter(volume => volume.numeroNota !== numeroNota));
    
    // Marcar como tendo mudanças não salvas
    setHasUnsavedChanges(true);
    
    toast({
      title: "✅ Nota removida",
      description: "Nota fiscal removida da ordem"
    });
  };

  // Função para gerar etiqueta usando a rotina existente /armazenagem/geracao-etiquetas
  const gerarEtiqueta = (nota: NotaFiscalData) => {
    // Verificar se há mudanças não salvas
    if (hasUnsavedChanges) {
      toast({
        title: "⚠️ Salvamento obrigatório",
        description: "É necessário salvar as alterações da ordem antes de imprimir etiquetas. Clique em 'Salvar Ordem' primeiro.",
        variant: "destructive"
      });
      return;
    }

    // Verificar se a ordem foi salva anteriormente
    if (mode === 'create' || !ordemId) {
      toast({
        title: "⚠️ Ordem não salva",
        description: "É necessário salvar a ordem antes de gerar etiquetas. Os volumes precisam estar gravados no banco de dados.",
        variant: "destructive"
      });
      return;
    }

    // Debug: Log da nota sendo processada
    console.log('gerarEtiqueta: Processando nota:', nota);
    
    // Preparar dados para a página de geração de etiquetas
    const etiquetaData = {
      chave_nota: (nota as any).chave_nota || nota.chave_nota_fiscal || '',
      numero_nota: nota.numero_nota || '',
      emitente: nota.emitente_razao_social || '',
      destinatario: nota.destinatario_razao_social || '',
      volumes: nota.quantidade_volumes || '1',
      numero_pedido: nota.numero_pedido || nota.numero_nota || '',
      peso_total: nota.peso_bruto || '0'
    };
    
    console.log('gerarEtiqueta: Dados preparados:', etiquetaData);
    
    // Capturar informações detalhadas da origem para navegação precisa
    const currentFormData = form.getValues();
    const currentPath = window.location.pathname;
    
    console.log('gerarEtiqueta: Contexto atual detectado:', {
      pathname: currentPath,
      search: window.location.search,
      mode,
      initialData: initialData?.id
    });
    
    // Determinar rota de origem com base no contexto real
    let rotaOrigemReal = '/armazenagem/carregamento';
    
    if (currentPath.includes('/fila-x')) {
      rotaOrigemReal = `/armazenagem/fila-x`;
    } else if (currentPath.includes('/recebimento')) {
      rotaOrigemReal = `/armazenagem/recebimento/ordemrecebimento`;
    } else if (currentPath.includes('/carregamento') && initialData?.id) {
      rotaOrigemReal = `/armazenagem/carregamento?id=${initialData.id}&mode=edit`;
    }
    
    const ordemOrigem = {
      numero_ordem: initialData?.numero_ordem || initialData?.numero_referencia || currentFormData.tipo_movimentacao || 'Ordem sem número',
      tipo: mode,
      ordem_id: initialData?.id,
      rota_origem_real: rotaOrigemReal,
      rota_completa: window.location.pathname + window.location.search,
      timestamp: Date.now()
    };
    
    console.log('gerarEtiqueta: Dados da origem armazenados:', ordemOrigem);
    sessionStorage.setItem('ordem_origem_etiqueta', JSON.stringify(ordemOrigem));
    
    // Marcar etiqueta como gerada
    setEtiquetasGeradas(prev => new Set(prev.add(nota.numero_nota)));
    
    // Codificar dados como parâmetros de URL
    const params = new URLSearchParams(etiquetaData);
    const urlFinal = `/armazenagem/geracao-etiquetas?${params.toString()}`;
    
    console.log('gerarEtiqueta: URL final gerada:', urlFinal);
    
    // Navegar para a página de geração de etiquetas com dados pré-carregados
    setLocation(urlFinal);
    
    toast({
      title: "🏷️ Gerando etiqueta",
      description: `Redirecionando para geração de etiqueta da nota ${nota.numero_nota}`,
    });
  };

  // Função para atualizar volume apenas localmente (sem salvar no banco)
  const handleVolumeUpdate = (numeroNota: string, volumeData: NotaVolumeData) => {
    // Atualizar apenas o estado local - não salvar no banco ainda
    setVolumeData(prev => 
      prev.map(item => 
        item.numeroNota === numeroNota ? volumeData : item
      )
    );
    
    toast({
      title: "✅ Dimensões atualizadas",
      description: `Volumes da nota ${numeroNota} atualizados localmente`
    });
    
    setShowVolumeModal(false);
  };

  // Handlers para NFEImportManager - com validação de duplicatas
  const handleNotasImported = (notas: NotaFiscalData[]) => {
    if (!notas || notas.length === 0) return;
    
    console.log('=== INÍCIO DA IMPORTAÇÃO VIA API ===');
    console.log('Notas recebidas para importação:', notas.length);
    console.log('Notas existentes antes da importação:', notasFiscais.length);
    
    // IMPORTANTE: Para importação via API, substituir completamente a lista
    // Isso resolve o problema de acúmulo visual
    const notasComIdsUnicos = notas.map((nota, index) => ({
      ...nota,
      id: nota.chave_nota_fiscal || `nfe_${Date.now()}_${uniqueIdCounter + index}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    // Atualizar contador para próximas notas
    setUniqueIdCounter(prev => prev + notas.length);
    
    // Substituir completamente a lista de notas (não adicionar)
    setNotasFiscais(notasComIdsUnicos);
    console.log('Nova lista de notas após SUBSTITUIÇÃO:', notasComIdsUnicos.length);
    
    // Limpar dados de volume existentes e recriar
    setVolumeData([]);
    
    // Criar dados de volume para todas as notas importadas
    const novosVolumes = notasComIdsUnicos.map(nota => {
      const quantidadeVolumes = parseInt(nota.volumes) || 1;
      const pesoTotal = parseFloat(nota.peso_bruto) || 0;
      
      return {
        notaId: nota.id,
        numeroNota: nota.numero_nota,
        volumes: Array.from({ length: quantidadeVolumes }, (_, i) => ({
          volume: i + 1,
          altura: 0,
          largura: 0,
          comprimento: 0,
          m3: 0
        })),
        totalM3: 0,
        pesoTotal
      };
    });
    
    // Substituir completamente os dados de volume
    setVolumeData(novosVolumes);
    console.log('Dados de volume recriados para', novosVolumes.length, 'notas');
    
    toast({
      title: "✅ NFe importadas via API",
      description: `${notasComIdsUnicos.length} nota(s) fiscal(is) importada(s) com sucesso`,
    });
    
    console.log('=== FIM DA IMPORTAÇÃO VIA API ===');
  };

  // Função para obter placeholder baseado no tipo de pesquisa
  const getSearchPlaceholder = (type: string): string => {
    const placeholders: { [key: string]: string } = {
      'numero': 'Digite o número da NFe (ex: 448942)',
      'chave': 'Digite a chave de acesso (44 dígitos)',
      'remetente': 'Digite o nome do remetente/fornecedor',
      'destinatario': 'Digite o nome do destinatário/cliente',
      'cidade_origem': 'Digite a cidade de origem',
      'uf_origem': 'Digite a UF de origem (ex: SP)',
      'cidade_destino': 'Digite a cidade de destino',
      'uf_destino': 'Digite a UF de destino (ex: RJ)',
      'estagio': 'Selecione: Pendente Coleta, Recebido, Armazenado, etc.',
      'status': 'Selecione: Recebido, Disponível, Bloqueada, etc.',
      'prioridade': 'Selecione: Normal, Prioridade, Expressa'
    };
    return placeholders[type] || 'Digite o termo de pesquisa...';
  };

  // Função para pesquisar NFe no banco de dados
  const searchNFEInDatabase = async (term: string) => {
    // Validação específica para filtro de data
    if (searchType === 'data_inclusao') {
      if (!dataInicioPeriodo || !dataFimPeriodo) {
        toast({
          title: "❌ Período incompleto",
          description: "Preencha tanto a data de início quanto a data de fim"
        });
        return;
      }
    } else {
      if (!term || term.trim().length < 3) {
        toast({
          title: "❌ Termo muito curto",
          description: "Digite pelo menos 3 caracteres para pesquisar"
        });
        return;
      }
    }

    setNfeSearchLoading(true);
    try {
      const authToken = localStorage.getItem('token');
      
      // Preparar parâmetros baseados no tipo de pesquisa
      let searchParams = new URLSearchParams();
      searchParams.append('type', searchType);
      
      if (searchType === 'data_inclusao') {
        searchParams.append('data_inicio', dataInicioPeriodo);
        searchParams.append('data_fim', dataFimPeriodo);
      } else {
        searchParams.append('q', term.trim());
      }
      
      const response = await fetch(`/api/search/notas-fiscais?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao pesquisar notas fiscais');
      }

      const data = await response.json();
      console.log('Resultado da pesquisa NFe:', data);
      
      if (data.success && data.notas) {
        setNfeSearchResults(data.notas);
        if (data.notas.length === 0) {
          toast({
            title: "ℹ️ Nenhuma nota encontrada",
            description: `Nenhuma NFe encontrada com o termo: "${term}"`
          });
        } else {
          toast({
            title: "✅ Notas encontradas",
            description: `${data.notas.length} nota(s) encontrada(s)`
          });
        }
      } else {
        setNfeSearchResults([]);
        toast({
          title: "ℹ️ Nenhuma nota encontrada",
          description: `Nenhuma NFe encontrada com o termo: "${term}"`
        });
      }
    } catch (error) {
      console.error('Erro na pesquisa de NFe:', error);
      toast({
        title: "❌ Erro na pesquisa",
        description: "Erro ao pesquisar notas fiscais no banco de dados"
      });
      setNfeSearchResults([]);
    } finally {
      setNfeSearchLoading(false);
    }
  };

  // Função para alternar seleção de NFe
  const toggleNFESelection = (nfeId: string) => {
    setSelectedNFEs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nfeId)) {
        newSet.delete(nfeId);
      } else {
        newSet.add(nfeId);
      }
      return newSet;
    });
  };

  // Função para adicionar NFes selecionadas à ordem
  const addSelectedNFEsToOrder = () => {
    if (selectedNFEs.size === 0) {
      toast({
        title: "❌ Nenhuma NFe selecionada",
        description: "Selecione pelo menos uma nota fiscal para adicionar"
      });
      return;
    }

    const selectedNFEsArray = nfeSearchResults.filter(nfe => selectedNFEs.has(nfe.id));
    
    // Filtrar NFes que já não existem na ordem atual
    const nfesNaoExistentes = selectedNFEsArray.filter(novaNfe => {
      return !notasFiscais.some(existente => 
        existente.chave_nota_fiscal === novaNfe.chave_nota_fiscal ||
        existente.numero_nota === novaNfe.numero_nota ||
        existente.id === novaNfe.id
      );
    });

    if (nfesNaoExistentes.length === 0) {
      toast({
        title: "ℹ️ NFes já existem",
        description: "Todas as NFes selecionadas já estão na ordem atual"
      });
      return;
    }

    // Adicionar as novas NFes
    setNotasFiscais(prev => [...prev, ...nfesNaoExistentes]);

    // Marcar como tendo mudanças não salvas
    setHasUnsavedChanges(true);

    // Criar dados de volume para as novas NFes
    nfesNaoExistentes.forEach(nota => {
      const quantidadeVolumes = parseInt(nota.volumes) || 1;
      const pesoTotal = parseFloat(nota.peso_bruto) || 0;
      
      const notaVolumeData: NotaVolumeData = {
        notaId: nota.id,
        numeroNota: nota.numero_nota,
        volumes: Array.from({ length: quantidadeVolumes }, (_, i) => ({
          volume: i + 1,
          altura: 0,
          largura: 0,
          comprimento: 0,
          m3: 0
        })),
        totalM3: 0,
        pesoTotal
      };
      
      setVolumeData(prev => [...prev, notaVolumeData]);
    });

    toast({
      title: "✅ NFes adicionadas",
      description: `${nfesNaoExistentes.length} nota(s) fiscal(is) adicionada(s) à ordem`
    });

    // Limpar seleções e fechar modal
    setSelectedNFEs(new Set());
    setShowNFESearchModal(false);
    setSearchTerm('');
    setNfeSearchResults([]);
    setDataInicioPeriodo('');
    setDataFimPeriodo('');
  };

  const handleVolumeDataChanged = (newVolumeData: NotaVolumeData[]) => {
    if (!newVolumeData || newVolumeData.length === 0) return;
    
    setVolumeData(prev => {
      // Criar uma cópia do array existente
      const updated = [...prev];
      
      // Processar cada novo dado de volume
      newVolumeData.forEach(newData => {
        // Verificar se já existe esse dados (evitar duplicatas)
        const existingIndex = updated.findIndex(item => 
          item.notaId === newData.notaId || 
          item.numeroNota === newData.numeroNota
        );
        
        if (existingIndex >= 0) {
          // Se já existe, verificar se os dados são diferentes antes de atualizar
          const existing = updated[existingIndex];
          const isDifferent = 
            existing.totalM3 !== newData.totalM3 ||
            existing.pesoTotal !== newData.pesoTotal ||
            existing.volumes.length !== newData.volumes.length;
            
          if (isDifferent) {
            updated[existingIndex] = newData;
          }
        } else {
          // Se não existe, adicionar
          updated.push(newData);
        }
      });
      
      return updated;
    });
  };

  // Função para finalizar ordem com salvamento completo no banco de dados
  const onFinalizar = async () => {
    if (notasFiscais.length === 0) {
      toast({
        title: "❌ Nenhuma nota",
        description: "Adicione pelo menos uma nota fiscal"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const authToken = localStorage.getItem('token');
      
      // Verificar se está em modo de edição
      const isEditMode = mode === 'edit' && initialData;
      
      let notasComIds = [];
      
      if (isEditMode) {
        // MODO EDIÇÃO: separar notas existentes de novas notas
        toast({
          title: "✏️ Atualizando ordem...",
          description: "Processando notas fiscais e volumes"
        });
        
        const notasExistentes = [];
        const notasNovas = [];
        
        // Separar notas existentes (têm UUID) de novas (têm ID temporário)
        for (const nota of notasFiscais) {
          const isExistingNote = nota.id && nota.id.length === 36 && nota.id.includes('-');
          
          if (isExistingNote) {
            notasExistentes.push({
              ...nota,
              id_unico: nota.id
            });
          } else {
            notasNovas.push(nota);
          }
        }
        
        // Usar IDs existentes das notas fiscais já salvas
        notasComIds = [...notasExistentes];
        
        // Salvar novas notas no banco
        if (notasNovas.length > 0) {
          console.log(`Salvando ${notasNovas.length} novas notas em modo edição`);
          
          const notaIdMapping: { [numeroNota: string]: string } = {};
          
          for (const notaFiscal of notasNovas) {
            const notaResponse = await fetch('/api/notas-fiscais', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
              },
              body: JSON.stringify({
                ...notaFiscal,
                empresa_id: user?.empresa_id
              })
            });

            const notaResult = await notaResponse.json();
            if (!notaResult.success) {
              throw new Error(`Erro ao salvar nota fiscal ${notaFiscal.numero_nota}`);
            }

            notasComIds.push({
              ...notaFiscal,
              id_unico: notaResult.id
            });

            notaIdMapping[notaFiscal.numero_nota] = notaResult.id;
          }
          
          // Atualizar volumeData com os IDs corretos das novas notas
          setVolumeData(prevVolumeData => 
            prevVolumeData.map(volData => {
              const realId = notaIdMapping[volData.numeroNota];
              return realId ? { ...volData, notaId: realId } : volData;
            })
          );
        }
      } else {
        // MODO CRIAÇÃO: criar novas notas fiscais
        toast({
          title: "💾 Salvando notas fiscais...",
          description: "Processando notas fiscais no banco de dados"
        });
        
        // Mapa para associar número da nota com ID do banco
        const notaIdMapping: { [numeroNota: string]: string } = {};
        
        for (const notaFiscal of notasFiscais) {
          // Gerar ID único para cada nota fiscal
          const notaResponse = await fetch('/api/notas-fiscais', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              ...notaFiscal,
              empresa_id: user?.empresa_id
            })
          });

          const notaResult = await notaResponse.json();
          if (!notaResult.success) {
            throw new Error(`Erro ao salvar nota fiscal ${notaFiscal.numero_nota}`);
          }

          notasComIds.push({
            ...notaFiscal,
            id_unico: notaResult.id
          });

          // Armazenar mapeamento para usar depois
          notaIdMapping[notaFiscal.numero_nota] = notaResult.id;
        }

        // Atualizar volumeData com os IDs corretos de uma vez
        setVolumeData(prevVolumeData => 
          prevVolumeData.map(volData => {
            const realId = notaIdMapping[volData.numeroNota];
            return realId ? { ...volData, notaId: realId } : volData;
          })
        );
      }

      // 2. Salvar dimensões dos volumes para cada nota
      toast({
        title: "📦 Salvando dimensões dos volumes...",
        description: "Processando dimensões no banco de dados"
      });

      console.log("Debug: notasComIds recebidos:", notasComIds);
      console.log("Debug: volumeData atual:", volumeData);

      // Filtrar apenas notas que têm UUID válido (foram salvas no banco)
      const notasValidas = notasComIds.filter(nota => {
        const isValidUuid = nota.id_unico && nota.id_unico.length === 36 && nota.id_unico.includes('-');
        if (!isValidUuid) {
          console.warn(`Nota ${nota.numero_nota} não tem UUID válido: ${nota.id_unico}. Será ignorada no salvamento de volumes.`);
        }
        return isValidUuid;
      });

      console.log(`Debug: Processando volumes para ${notasValidas.length} de ${notasComIds.length} notas válidas`);

      for (const notaComId of notasValidas) {
        const volumeInfo = volumeData.find(v => v.numeroNota === notaComId.numero_nota);
        
        if (volumeInfo && volumeInfo.volumes.length > 0) {
          // Preparar dados dos volumes
          const volumesParaSalvar = volumeInfo.volumes.map((volume, index) => ({
            volume: index + 1,
            altura: volume.altura,
            largura: volume.largura,
            comprimento: volume.comprimento,
            peso: (volumeInfo.pesoTotal / volumeInfo.volumes.length) || 0,
            m3: volume.m3
          }));

          const notaFiscalId = notaComId.id_unico;

          // Salvar dimensões no banco (funciona para criação e atualização)
          const volumeResponse = await fetch('/api/volumes/dimensoes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              nota_fiscal_id: notaFiscalId,
              empresa_id: user?.empresa_id,
              volumes: volumesParaSalvar
            })
          });

          const volumeResult = await volumeResponse.json();
          if (!volumeResult.success) {
            throw new Error(`Erro ao salvar dimensões da nota ${notaComId.numero_nota}`);
          }
        }
      }

      // 3. Calcular totais finais
      const totalM3 = volumeData.reduce((sum, nota) => sum + nota.totalM3, 0);
      const totalPeso = volumeData.reduce((sum, nota) => sum + nota.pesoTotal, 0);
      const totalValor = notasFiscais.reduce((sum, nota) => sum + parseFloat(nota.valor_nota_fiscal || '0'), 0);

      // 4. Salvar ordem de carregamento completa
      toast({
        title: "🚛 Finalizando ordem...",
        description: "Salvando ordem de carregamento"
      });

      // Otimizar dados das notas fiscais para evitar payload muito grande
      const notasFiscaisOtimizadas = notasComIds.map(nota => {
        // Remover xml_content para reduzir tamanho do payload
        const { xml_content, ...notaOtimizada } = nota;
        return notaOtimizada;
      });

      const orderData = {
        ...form.getValues(),
        numero_ordem: numeroOrdemFixo,
        notasFiscais: notasFiscaisOtimizadas,
        volumeData,
        totalM3: totalM3.toFixed(2),
        totalPeso: totalPeso.toFixed(2),
        totalValor: totalValor.toFixed(2),
        peso_total: totalPeso.toFixed(2),
        volume_total: Math.ceil(totalM3).toString(),
        valor_total_frete: totalValor.toFixed(2),
        tipo_carregamento: form.getValues().subtipo_operacao || 'coleta',
        
        // Dados editáveis do Remetente
        remetente_razao_social: remetenteData.razao_social,
        remetente_cnpj: remetenteData.cnpj,
        remetente_telefone: remetenteData.telefone,
        remetente_endereco: remetenteData.endereco,
        remetente_numero: remetenteData.numero,
        remetente_complemento: remetenteData.complemento,
        remetente_bairro: remetenteData.bairro,
        remetente_cidade: remetenteData.cidade,
        remetente_uf: remetenteData.uf,
        remetente_cep: remetenteData.cep,
        
        // Dados editáveis do Destinatário
        destinatario_razao_social: destinatarioData.razao_social,
        destinatario_cnpj: destinatarioData.cnpj,
        destinatario_telefone: destinatarioData.telefone,
        destinatario_endereco: destinatarioData.endereco,
        destinatario_numero: destinatarioData.numero,
        destinatario_complemento: destinatarioData.complemento,
        destinatario_bairro: destinatarioData.bairro,
        destinatario_cidade: destinatarioData.cidade,
        destinatario_uf: destinatarioData.uf,
        destinatario_cep: destinatarioData.cep,
        
        // Campos de datas - novos campos conforme layout
        data_prevista_coleta: form.getValues().data_prevista_coleta,
        data_coleta: form.getValues().data_coleta,
        data_prevista_entrada_armazem: form.getValues().data_prevista_entrada_armazem,
        data_entrada_armazem: form.getValues().data_entrada_armazem,
        data_carregamento: form.getValues().data_carregamento,
        data_prevista_entrega: form.getValues().data_prevista_entrega,
        data_chegada_filial_entrega: form.getValues().data_chegada_filial_entrega,
        data_saida_entrega: form.getValues().data_saida_entrega,
        data_chegada_na_entrega: form.getValues().data_chegada_na_entrega,
        data_entrega: form.getValues().data_entrega
      };

      console.log('NovaOrdemIntegrada: Dados do remetente sendo enviados:', {
        razao_social: remetenteData.razao_social,
        cnpj: remetenteData.cnpj,
        telefone: remetenteData.telefone
      });
      
      console.log('NovaOrdemIntegrada: Dados do destinatário sendo enviados:', {
        razao_social: destinatarioData.razao_social,
        cnpj: destinatarioData.cnpj,
        telefone: destinatarioData.telefone
      });

      console.log('NovaOrdemIntegrada: Dados de classificação sendo enviados:', {
        tipo_movimentacao: form.getValues().tipo_movimentacao,
        subtipo_operacao: form.getValues().subtipo_operacao,
        prioridade: form.getValues().prioridade,
        observacoes: form.getValues().observacoes
      });

      console.log('NovaOrdemIntegrada: Verificando numero_ordem:', {
        numeroOrdemFixo: numeroOrdemFixo,
        isEditMode: isEditMode,
        initialDataNumeroOrdem: initialData?.numero_ordem,
        orderDataNumeroOrdem: orderData.numero_ordem
      });

      // Salvar ordem na API (POST para criação, PUT para atualização)
      let response;
      if (isEditMode && initialData?.id) {
        // MODO EDIÇÃO: atualizar ordem existente
        response = await fetch(`/api/ordens-carga/${initialData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(orderData)
        });
      } else {
        // MODO CRIAÇÃO: criar nova ordem
        response = await fetch('/api/ordens-carga', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(orderData)
        });
      }

      // Verificar se ordem foi salva checando se ela existe no banco (mesmo com erro 500)
      console.log('Verificando se ordem foi salva no banco...');
      const verifyResponse = await fetch('/api/ordens-carga', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      const allOrders = await verifyResponse.json();
      const savedOrder = allOrders.find((order: any) => order.numero_ordem === orderData.numero_ordem);
      
      if (savedOrder) {
        // Ordem foi salva com sucesso - mostrar popup de sucesso
        const actionText = isEditMode ? "atualizada" : "criada";
        toast({
          title: `✅ Ordem ${actionText} com sucesso`,
          description: `Ordem ${actionText} com ${notasFiscais.length} nota(s) fiscal(is) e todas as dimensões salvas no banco de dados`
        });

        // Definir dados da ordem salva para uso no modal de sucesso
        setOrdemSalva({
          ...savedOrder,
          notasFiscais: notasComIds,
          volumes: volumeData
        });

        // Marcar como salvo (sem mudanças pendentes)
        setHasUnsavedChanges(false);
        setOrdemId(savedOrder.id);
        
        // Atualizar estado salvo para refletir as mudanças
        const currentState = JSON.stringify({
          formData: form.getValues(),
          notasFiscais: notasFiscais,
          volumeData: volumeData,
          remetente: remetenteData,
          destinatario: destinatarioData
        });
        setLastSavedState(currentState);

        // Chamar callback personalizado se existir
        if (onSubmit) {
          await onSubmit(orderData);
        }

        // NÃO fechar o modal - permitir que usuário continue editando
        // setShowSuccessModal(true); // Removido para evitar fechar modal

      } else {
        // Ordem realmente não foi salva
        let result;
        try {
          result = await response.json();
        } catch (jsonError) {
          result = { error: 'Erro de comunicação com servidor' };
        }
        throw new Error(result.error || 'Erro ao salvar ordem');
      }

    } catch (error) {
      console.error('Erro ao finalizar ordem:', error);
      toast({
        title: "❌ Erro ao finalizar ordem",
        description: error instanceof Error ? error.message : "Falha ao salvar dados no banco",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Função para buscar ordem completa para impressão (igual ao ListaOrdensCarregamento)
  const buscarOrdemCompleta = async (ordemId: string) => {
    if (!ordemId) return;
    
    setCarregandoOrdemCompleta(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/ordens-carga/${ordemId}/completa`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const ordemCompleta = await response.json();
        setOrdemSalva(ordemCompleta);
      } else {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados completos da ordem",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar ordem completa:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados para impressão",
        variant: "destructive"
      });
    } finally {
      setCarregandoOrdemCompleta(false);
    }
  };

  // Função para enviar por email (placeholder)
  const enviarPorEmail = () => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "O envio por e-mail será implementado em breve",
    });
  };

  // Função para sair do modal de sucesso
  const sairDoModal = () => {
    setShowSuccessModal(false);
    setOrdemSalva(null);
    setCarregandoOrdemCompleta(false);
    
    // Se não tem onSubmit (não é modo de edição), redireciona
    if (!onSubmit) {
      setLocation('/armazenagem/recebimento');
    } else {
      // Se tem onSubmit, chama a função de callback
      onSubmit?.(ordemSalva);
    }
  };

  // Função para adicionar à Fila FilaX
  const adicionarAFilaX = async () => {
    if (!driverInfo.motorista_nome || !driverInfo.veiculo_placa || !ordemSalva) {
      toast({
        title: "Erro",
        description: "Nome do motorista e placa do veículo são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (isAddingToFila) {
      console.log('Botão já está processando, ignorando clique');
      return; // Evitar múltiplos cliques
    }
    
    setIsAddingToFila(true);
    console.log('Iniciando adição à FilaX...');

    try {
      console.log('Adicionando à FilaX:', {
        ordem_id: ordemSalva.id,
        motorista_nome: driverInfo.motorista_nome,
        veiculo_placa: driverInfo.veiculo_placa,
        doca_designada: driverInfo.doca_designada
      });

      const response = await fetch('/api/fila-x', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          ordem_id: ordemSalva.id,
          tipo_operacao: ordemSalva.tipo_movimentacao || 'carga',
          prioridade: 'normal',
          motorista_nome: driverInfo.motorista_nome,
          veiculo_placa: driverInfo.veiculo_placa,
          doca_designada: driverInfo.doca_designada || null,
          observacoes: 'Adicionado via modal de criação de ordem'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      console.log('Resposta da FilaX:', result);

      // Invalidar queries do FilaX para atualização instantânea
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['/api/fila-x'] });
        queryClient.refetchQueries({ queryKey: ['/api/fila-x'] });
        queryClient.invalidateQueries({ queryKey: ['/api/ordens-carga'] });
        console.log('Queries invalidadas para atualização da FilaX');
      }
      
      // Fechar modal imediatamente
      setShowFilaXModal(false);
      setDriverInfo({ motorista_nome: '', veiculo_placa: '', doca_designada: '' });
      
      toast({
        title: "Adicionado à Fila!",
        description: `Motorista ${driverInfo.motorista_nome} (${driverInfo.veiculo_placa}) foi adicionado à FilaX com sucesso.`,
      });
      
      // Fechar modal principal da ordem após sucesso
      setTimeout(() => {
        sairDoModal();
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao adicionar à Fila FilaX:', error);
      
      // Não mostrar erro se a resposta foi bem-sucedida mas houve erro no processamento das queries
      const isQueryError = error?.message?.includes('queryClient') || 
                           error?.message?.includes('is not defined');
      
      if (!isQueryError) {
        toast({
          title: "Erro",
          description: error?.message || "Falha ao adicionar ordem à Fila FilaX.",
          variant: "destructive"
        });
      } else {
        // Se foi apenas erro de query, ainda assim fechar modal e dar feedback positivo
        setShowFilaXModal(false);
        setDriverInfo({ motorista_nome: '', veiculo_placa: '', doca_designada: '' });
        
        toast({
          title: "Adicionado à Fila!",
          description: `Motorista ${driverInfo.motorista_nome} (${driverInfo.veiculo_placa}) foi adicionado à FilaX.`,
        });
        
        setTimeout(() => {
          sairDoModal();
        }, 1500);
      }
    } finally {
      // Sempre resetar o estado de loading
      setTimeout(() => {
        setIsAddingToFila(false);
      }, 100);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {showBackButton && (
        <Button
          variant="outline"
          onClick={onCancel}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            disabled={notasFiscais.length === 0}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button 
            variant="outline" 
            disabled={notasFiscais.length === 0}
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Header com Número da Ordem */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6" />
                <div>
                  <h1 className="text-xl font-bold">ORDEM DE CARGA</h1>
                  <p className="text-blue-100 text-sm">Sistema de Gestão Logística</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-blue-100">Número da Ordem</div>
                <div className="text-2xl font-bold">{numeroOrdemFixo}</div>
              </div>
            </div>
          </div>

          {/* Classificação do Documento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Archive className="w-5 h-5 mr-2" />
                1. Classificação do Documento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="tipo_movimentacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Movimentação</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Entrada">Entrada</SelectItem>
                          <SelectItem value="Saida">Saída</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subtipo_operacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subtipo de Operação</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.watch('tipo_movimentacao') === 'Entrada' ? (
                            <>
                              <SelectItem value="Recebimento">Recebimento</SelectItem>
                              <SelectItem value="Coleta">Coleta</SelectItem>
                              <SelectItem value="Devolucao">Devolução</SelectItem>
                              <SelectItem value="Transferencia">Transferência (Filial x Armazém)</SelectItem>
                            </>
                          ) : (
                            <>
                              <SelectItem value="Armazem">Armazém</SelectItem>
                              <SelectItem value="Transferencia">Transferência</SelectItem>
                              <SelectItem value="Direta">Direta</SelectItem>
                              <SelectItem value="Entrega">Entrega</SelectItem>
                              <SelectItem value="Devolucao">Devolução</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="prioridade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridade</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Baixa">Baixa</SelectItem>
                          <SelectItem value="Normal">Normal</SelectItem>
                          <SelectItem value="Alta">Alta</SelectItem>
                          <SelectItem value="Expressa">Expressa</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </div>
            </CardContent>
          </Card>

          {/* Métodos de Preenchimento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Edit className="w-5 h-5 mr-2" />
                2. Métodos de Preenchimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Manual */}
                <Card className="border-dashed border-2 hover:border-blue-300 transition-colors cursor-pointer" onClick={adicionarNotaManual}>
                  <CardContent className="p-4 text-center">
                    <Edit className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-medium">Manual</h3>
                    <p className="text-sm text-gray-600">Criar ordem manualmente</p>
                  </CardContent>
                </Card>

                {/* Upload XML */}
                <Card className="border-dashed border-2 hover:border-green-300 transition-colors cursor-pointer">
                  <CardContent className="p-4 text-center" {...getRootProps()}>
                    <input {...getInputProps()} />
                    <Upload className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-medium">Upload XML</h3>
                    <p className="text-sm text-gray-600">
                      {isDragActive ? 'Solte os arquivos aqui' : 'Arrastar arquivos XML'}
                    </p>
                  </CardContent>
                </Card>

                {/* NFE Import Manager - Avançado */}
                <Card className="border-dashed border-2 hover:border-purple-300 transition-colors cursor-pointer" onClick={() => setShowNFEImportManager(true)}>
                  <CardContent className="p-4 text-center">
                    <Star className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-medium">Importação Avançada</h3>
                    <p className="text-sm text-gray-600">Importação de XML em lote via chave</p>
                  </CardContent>
                </Card>

                {/* Pesquisa de NFe no Banco */}
                <Card className="border-dashed border-2 hover:border-orange-300 transition-colors cursor-pointer" onClick={() => setShowNFESearchModal(true)}>
                  <CardContent className="p-4 text-center">
                    <Search className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                    <h3 className="font-medium">Pesquisar NFe</h3>
                    <p className="text-sm text-gray-600">Buscar notas fiscais no banco</p>
                  </CardContent>
                </Card>
              </div>

              {/* Entrada de chave NFe */}
              <div className="mt-6 space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite a chave de 44 dígitos da NFe"
                    value={chaveInput}
                    onChange={(e) => setChaveInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && adicionarChave()}
                    maxLength={44}
                  />
                  <Button 
                    type="button" 
                    onClick={adicionarChave}
                    disabled={!chaveInput}
                  >
                    Adicionar
                  </Button>
                </div>

                {/* Lista de chaves coletadas */}
                {collectedKeys.length > 0 && (
                  <div className="space-y-2">
                    <Label>Chaves coletadas ({collectedKeys.length}):</Label>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {collectedKeys.map((key, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="font-mono text-sm">{key}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCollectedKeys(prev => prev.filter((_, i) => i !== index))}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <Button 
                      type="button" 
                      onClick={importarNFesViaAPI}
                      disabled={isApiLoading}
                      className="w-full"
                    >
                      {isApiLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Importar NFe
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Formulário Manual */}
          {showManualForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center justify-between text-blue-700">
                  <div className="flex items-center">
                    <Edit className="w-5 h-5 mr-2" />
                    Criação Manual de Nota Fiscal
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowManualForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Dados da Nota */}
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    📄 Dados da Nota Fiscal
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="numero_nota">Número da Nota *</Label>
                      <div className="flex gap-2">
                        <Input
                          id="numero_nota"
                          placeholder="Será gerado automaticamente"
                          value={manualNoteData.numero_nota}
                          onChange={(e) => setManualNoteData(prev => ({...prev, numero_nota: e.target.value}))}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const numeroGerado = gerarNumeroNota();
                            setManualNoteData(prev => ({...prev, numero_nota: numeroGerado}));
                            toast({
                              title: "✅ Número gerado",
                              description: `Número: ${numeroGerado}`
                            });
                          }}
                          title="Gerar número baseado no tipo de ordem"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Padrão: {(() => {
                          const formData = form.getValues();
                          const tipo = formData.tipo_movimentacao;
                          const subtipo = formData.subtipo_operacao;
                          if (!tipo || !subtipo) return "Selecione tipo e subtipo primeiro";
                          
                          let prefixo = '';
                          if (tipo === 'Entrada') {
                            switch(subtipo) {
                              case 'Recebimento': prefixo = 'REC'; break;
                              case 'Coleta': prefixo = 'COL'; break;
                              case 'Devolucao': prefixo = 'DEV'; break;
                              case 'Transferencia': prefixo = 'TRF'; break;
                              default: prefixo = 'ENT';
                            }
                          } else if (tipo === 'Saida') {
                            switch(subtipo) {
                              case 'Armazem': prefixo = 'ARM'; break;
                              case 'Transferencia': prefixo = 'TRF'; break;
                              case 'Direta': prefixo = 'DIR'; break;
                              case 'Entrega': prefixo = 'ENT'; break;
                              case 'Devolucao': prefixo = 'DEV'; break;
                              default: prefixo = 'SAI';
                            }
                          } else {
                            prefixo = 'ORD';
                          }
                          return `${prefixo}-[timestamp]`;
                        })()}
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="serie_nota">Série</Label>
                      <Input
                        id="serie_nota"
                        placeholder="Ex: 1"
                        value={manualNoteData.serie_nota}
                        onChange={(e) => setManualNoteData(prev => ({...prev, serie_nota: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="natureza_operacao">Natureza da Operação</Label>
                      <Input
                        id="natureza_operacao"
                        placeholder="Ex: Venda"
                        value={manualNoteData.natureza_operacao}
                        onChange={(e) => setManualNoteData(prev => ({...prev, natureza_operacao: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="data_emissao">Data de Emissão</Label>
                      <Input
                        id="data_emissao"
                        type="date"
                        value={manualNoteData.data_emissao}
                        onChange={(e) => setManualNoteData(prev => ({...prev, data_emissao: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>

                {/* Dados do Remetente */}
                <div>
                  <Label className="text-sm font-medium text-blue-700 mb-3 block">
                    🏢 Dados do Remetente
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="CNPJ do Remetente *"
                        value={remetenteData.cnpj}
                        onChange={(e) => setRemetenteData(prev => ({...prev, cnpj: e.target.value}))}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => buscarCNPJ(remetenteData.cnpj, 'remetente')}
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Razão Social *"
                      value={remetenteData.razao_social}
                      onChange={(e) => setRemetenteData(prev => ({...prev, razao_social: e.target.value}))}
                    />
                    <Input
                      placeholder="Telefone"
                      value={remetenteData.telefone}
                      onChange={(e) => setRemetenteData(prev => ({...prev, telefone: e.target.value}))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <Input
                      placeholder="UF"
                      value={remetenteData.uf}
                      onChange={(e) => setRemetenteData(prev => ({...prev, uf: e.target.value}))}
                    />
                    <Input
                      placeholder="Cidade"
                      value={remetenteData.cidade}
                      onChange={(e) => setRemetenteData(prev => ({...prev, cidade: e.target.value}))}
                    />
                    <Input
                      placeholder="Bairro"
                      value={remetenteData.bairro}
                      onChange={(e) => setRemetenteData(prev => ({...prev, bairro: e.target.value}))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <Input
                      placeholder="Endereço"
                      value={remetenteData.endereco}
                      onChange={(e) => setRemetenteData(prev => ({...prev, endereco: e.target.value}))}
                    />
                    <Input
                      placeholder="Número"
                      value={remetenteData.numero}
                      onChange={(e) => setRemetenteData(prev => ({...prev, numero: e.target.value}))}
                    />
                    <Input
                      placeholder="CEP"
                      value={remetenteData.cep}
                      onChange={(e) => setRemetenteData(prev => ({...prev, cep: e.target.value}))}
                    />
                  </div>
                </div>

                {/* Dados do Destinatário */}
                <div>
                  <Label className="text-sm font-medium text-green-700 mb-3 block">
                    🏬 Dados do Destinatário
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="CNPJ do Destinatário *"
                        value={destinatarioData.cnpj}
                        onChange={(e) => setDestinatarioData(prev => ({...prev, cnpj: e.target.value}))}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => buscarCNPJ(destinatarioData.cnpj, 'destinatario')}
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Razão Social *"
                      value={destinatarioData.razao_social}
                      onChange={(e) => setDestinatarioData(prev => ({...prev, razao_social: e.target.value}))}
                    />
                    <Input
                      placeholder="Telefone"
                      value={destinatarioData.telefone}
                      onChange={(e) => setDestinatarioData(prev => ({...prev, telefone: e.target.value}))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <Input
                      placeholder="UF"
                      value={destinatarioData.uf}
                      onChange={(e) => setDestinatarioData(prev => ({...prev, uf: e.target.value}))}
                    />
                    <Input
                      placeholder="Cidade"
                      value={destinatarioData.cidade}
                      onChange={(e) => setDestinatarioData(prev => ({...prev, cidade: e.target.value}))}
                    />
                    <Input
                      placeholder="Bairro"
                      value={destinatarioData.bairro}
                      onChange={(e) => setDestinatarioData(prev => ({...prev, bairro: e.target.value}))}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                    <Input
                      placeholder="Endereço"
                      value={destinatarioData.endereco}
                      onChange={(e) => setDestinatarioData(prev => ({...prev, endereco: e.target.value}))}
                    />
                    <Input
                      placeholder="Número"
                      value={destinatarioData.numero}
                      onChange={(e) => setDestinatarioData(prev => ({...prev, numero: e.target.value}))}
                    />
                    <Input
                      placeholder="CEP"
                      value={destinatarioData.cep}
                      onChange={(e) => setDestinatarioData(prev => ({...prev, cep: e.target.value}))}
                    />
                  </div>
                </div>

                {/* Dados da Carga */}
                <div>
                  <Label className="text-sm font-medium text-orange-700 mb-3 block">
                    📦 Dados da Carga
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="peso_bruto">Peso Bruto (kg) *</Label>
                      <Input
                        id="peso_bruto"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 25.50"
                        value={cargoData.peso_bruto}
                        onChange={(e) => setCargoData(prev => ({...prev, peso_bruto: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quantidade_volumes">Qtd. Volumes *</Label>
                      <Input
                        id="quantidade_volumes"
                        type="number"
                        placeholder="Ex: 5"
                        value={cargoData.quantidade_volumes}
                        onChange={(e) => setCargoData(prev => ({...prev, quantidade_volumes: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="valor_total">Valor Total (R$) *</Label>
                      <Input
                        id="valor_total"
                        type="number"
                        step="0.01"
                        placeholder="Ex: 1250.99"
                        value={cargoData.valor_total}
                        onChange={(e) => setCargoData(prev => ({...prev, valor_total: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>

                {/* Informações Complementares */}
                <div>
                  <Label htmlFor="informacoes_complementares">Informações Complementares</Label>
                  <Textarea
                    id="informacoes_complementares"
                    placeholder="Observações adicionais sobre a nota fiscal..."
                    value={manualNoteData.informacoes_complementares}
                    onChange={(e) => setManualNoteData(prev => ({...prev, informacoes_complementares: e.target.value}))}
                    rows={3}
                  />
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    onClick={criarNotaManualComDados}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Nota Manual
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowManualForm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dados do Remetente e Destinatário */}
          {(remetenteData.cnpj || destinatarioData.cnpj) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Remetente */}
              {remetenteData.cnpj && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center text-blue-700">
                      <Building className="w-5 h-5 mr-2" />
                      Dados do Remetente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">CNPJ</Label>
                        <Input
                          value={remetenteData.cnpj}
                          onChange={(e) => setRemetenteData(prev => ({ ...prev, cnpj: e.target.value }))}
                          placeholder="00.000.000/0000-00"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Telefone</Label>
                        <Input
                          value={remetenteData.telefone}
                          onChange={(e) => setRemetenteData(prev => ({ ...prev, telefone: e.target.value }))}
                          placeholder="(00) 00000-0000"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Razão Social</Label>
                      <Input
                        value={remetenteData.razao_social}
                        onChange={(e) => setRemetenteData(prev => ({ ...prev, razao_social: e.target.value }))}
                        placeholder="Nome da empresa"
                        className="text-sm font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">UF</Label>
                        <Input
                          value={remetenteData.uf}
                          onChange={(e) => setRemetenteData(prev => ({ ...prev, uf: e.target.value }))}
                          placeholder="SP"
                          className="text-sm"
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Cidade</Label>
                        <Input
                          value={remetenteData.cidade}
                          onChange={(e) => setRemetenteData(prev => ({ ...prev, cidade: e.target.value }))}
                          placeholder="Nome da cidade"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Bairro</Label>
                        <Input
                          value={remetenteData.bairro}
                          onChange={(e) => setRemetenteData(prev => ({ ...prev, bairro: e.target.value }))}
                          placeholder="Nome do bairro"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label className="text-sm font-medium text-gray-600">Endereço</Label>
                        <Input
                          value={remetenteData.endereco}
                          onChange={(e) => setRemetenteData(prev => ({ ...prev, endereco: e.target.value }))}
                          placeholder="Nome da rua/avenida"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Número</Label>
                        <Input
                          value={remetenteData.numero}
                          onChange={(e) => setRemetenteData(prev => ({ ...prev, numero: e.target.value }))}
                          placeholder="Número"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">CEP</Label>
                      <Input
                        value={remetenteData.cep}
                        onChange={(e) => setRemetenteData(prev => ({ ...prev, cep: e.target.value }))}
                        placeholder="00000-000"
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Destinatário */}
              {destinatarioData.cnpj && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center text-green-700">
                      <MapPin className="w-5 h-5 mr-2" />
                      Dados do Destinatário
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">CNPJ</Label>
                        <Input
                          value={destinatarioData.cnpj}
                          onChange={(e) => setDestinatarioData(prev => ({ ...prev, cnpj: e.target.value }))}
                          placeholder="00.000.000/0000-00"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Telefone</Label>
                        <Input
                          value={destinatarioData.telefone}
                          onChange={(e) => setDestinatarioData(prev => ({ ...prev, telefone: e.target.value }))}
                          placeholder="(00) 00000-0000"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Razão Social</Label>
                      <Input
                        value={destinatarioData.razao_social}
                        onChange={(e) => setDestinatarioData(prev => ({ ...prev, razao_social: e.target.value }))}
                        placeholder="Nome da empresa"
                        className="text-sm font-medium"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">UF</Label>
                        <Input
                          value={destinatarioData.uf}
                          onChange={(e) => setDestinatarioData(prev => ({ ...prev, uf: e.target.value }))}
                          placeholder="SP"
                          className="text-sm"
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Cidade</Label>
                        <Input
                          value={destinatarioData.cidade}
                          onChange={(e) => setDestinatarioData(prev => ({ ...prev, cidade: e.target.value }))}
                          placeholder="Nome da cidade"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Bairro</Label>
                        <Input
                          value={destinatarioData.bairro}
                          onChange={(e) => setDestinatarioData(prev => ({ ...prev, bairro: e.target.value }))}
                          placeholder="Nome do bairro"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <Label className="text-sm font-medium text-gray-600">Endereço</Label>
                        <Input
                          value={destinatarioData.endereco}
                          onChange={(e) => setDestinatarioData(prev => ({ ...prev, endereco: e.target.value }))}
                          placeholder="Nome da rua/avenida"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Número</Label>
                        <Input
                          value={destinatarioData.numero}
                          onChange={(e) => setDestinatarioData(prev => ({ ...prev, numero: e.target.value }))}
                          placeholder="Número"
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">CEP</Label>
                      <Input
                        value={destinatarioData.cep}
                        onChange={(e) => setDestinatarioData(prev => ({ ...prev, cep: e.target.value }))}
                        placeholder="00000-000"
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Extrato de Volumes */}
          {notasFiscais.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                  <div className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    4. Extrato de Volumes ({notasFiscais.length} nota{notasFiscais.length !== 1 ? 's' : ''})
                  </div>
                  {notasFiscais.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                      onClick={limparTodasNotas}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Limpar Todas
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2 text-left">Nota</th>
                        <th className="border border-gray-300 p-2 text-left">Remetente</th>
                        <th className="border border-gray-300 p-2 text-left">Destinatário</th>
                        <th className="border border-gray-300 p-2 text-center">Vols</th>
                        <th className="border border-gray-300 p-2 text-center">Peso (kg)</th>
                        <th className="border border-gray-300 p-2 text-center">Valor (R$)</th>
                        <th className="border border-gray-300 p-2 text-center">Dimensões</th>
                        <th className="border border-gray-300 p-2 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notasFiscais.map((nota, index) => {
                        const volumeInfo = volumeData.find(v => v.numeroNota === nota.numero_nota);
                        const hasVolumeDimensions = volumeInfo?.volumes.some(v => v.m3 > 0);
                        
                        return (
                          <tr key={`nfe-${nota.chave_nota_fiscal || nota.id}-${index}-${nota.numero_nota}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 p-2">
                              <div className="text-sm">
                                <div className="font-medium">{nota.numero_nota}</div>
                                <div className="text-gray-500">Série {nota.serie_nota}</div>
                              </div>
                            </td>
                            <td className="border border-gray-300 p-2">
                              <div className="text-sm">
                                <div className="font-medium">{nota.emitente_razao_social}</div>
                                <div className="text-gray-500">{nota.emitente_cnpj}</div>
                              </div>
                            </td>
                            <td className="border border-gray-300 p-2">
                              <div className="text-sm">
                                <div className="font-medium">{nota.destinatario_razao_social}</div>
                                <div className="text-gray-500">{nota.destinatario_cnpj}</div>
                              </div>
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {nota.quantidade_volumes || nota.volumes}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {parseFloat(nota.peso_bruto || '0').toFixed(2)}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              R$ {parseFloat(nota.valor_nota_fiscal || '0').toFixed(2)}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {hasVolumeDimensions ? (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Dimensões OK
                                </Badge>
                              ) : (
                                <div className="space-y-1">
                                  <Badge variant="secondary" className="bg-red-100 text-red-800">
                                    ⚠️ Sem Dimensões
                                  </Badge>
                                  <div className="text-xs text-gray-500">
                                    Max: A:0m L:0m C:0m
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              <div className="flex gap-1 justify-center">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className={hasVolumeDimensions ? '' : 'bg-red-50 border-red-200 text-red-700'}
                                  onClick={() => {
                                    setCurrentVolumeNota(nota.numero_nota);
                                    setShowVolumeModal(true);
                                  }}
                                >
                                  Informar Dimensões
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => gerarEtiqueta(nota)}
                                  disabled={mode === 'create' || !initialData?.id}
                                  title={
                                    mode === 'create' || !initialData?.id
                                      ? "Salve a ordem primeiro para gerar etiquetas"
                                      : etiquetasImpressas.has(nota.numero_nota) 
                                      ? "Etiqueta impressa - Clique para imprimir novamente" 
                                      : etiquetasGeradas.has(nota.numero_nota) 
                                      ? "Etiqueta gerada - Clique para imprimir" 
                                      : "Gerar Etiqueta"
                                  }
                                  className={
                                    mode === 'create' || !initialData?.id
                                      ? "opacity-50 cursor-not-allowed" // Desabilitado para ordem não salva
                                      : etiquetasImpressas.has(nota.numero_nota)
                                      ? "bg-blue-100 border-blue-400 text-blue-700 hover:bg-blue-200" // Azul para impressa
                                      : etiquetasGeradas.has(nota.numero_nota) 
                                      ? "bg-green-100 border-green-400 text-green-700 hover:bg-green-200" // Verde para gerada
                                      : "" // Padrão para não gerada
                                  }
                                >
                                  <Tag className="w-4 h-4" />
                                  {etiquetasImpressas.has(nota.numero_nota) && (
                                    <span className="ml-1 text-xs">🖨️</span>
                                  )}
                                  {etiquetasGeradas.has(nota.numero_nota) && !etiquetasImpressas.has(nota.numero_nota) && (
                                    <span className="ml-1 text-xs">✓</span>
                                  )}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removerNota(nota.id)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Totais */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-sm text-blue-600">Total de Volumes</div>
                    <div className="text-lg font-semibold">
                      {notasFiscais.reduce((sum, nota) => sum + parseInt(nota.quantidade_volumes || nota.volumes || '0'), 0)}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-sm text-green-600">Peso Total (kg)</div>
                    <div className="text-lg font-semibold">
                      {notasFiscais.reduce((sum, nota) => sum + parseFloat(nota.peso_bruto || '0'), 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded">
                    <div className="text-sm text-purple-600">Valor Total (R$)</div>
                    <div className="text-lg font-semibold">
                      R$ {notasFiscais.reduce((sum, nota) => sum + parseFloat(nota.valor_nota_fiscal || '0'), 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <div className="text-sm text-orange-600">Maiores Dimensões (m)</div>
                    <div className="text-xs font-semibold">
                      {(() => {
                        // Usar os mesmos dados do banco que são usados na lista de ordens
                        if (mode === 'edit' && initialData?.volumes && Array.isArray(initialData.volumes) && initialData.volumes.length > 0) {
                          const volumes = initialData.volumes;
                          
                          // Converter de cm para metros (igual à lista de ordens)
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
                        
                        // Para novas ordens, usar volumeData local
                        let maiorAltura = 0;
                        let maiorLargura = 0;
                        let maiorComprimento = 0;
                        let temDimensoes = false;
                        
                        volumeData.forEach(item => {
                          item.volumes.forEach(volume => {
                            const altura = Number(volume.altura) || 0;
                            const largura = Number(volume.largura) || 0;
                            const comprimento = Number(volume.comprimento) || 0;
                            
                            if (altura > 0 || largura > 0 || comprimento > 0) {
                              temDimensoes = true;
                            }
                            if (altura > maiorAltura) maiorAltura = altura;
                            if (largura > maiorLargura) maiorLargura = largura;
                            if (comprimento > maiorComprimento) maiorComprimento = comprimento;
                          });
                        });
                        
                        if (!temDimensoes) {
                          return "Dimensões não informadas";
                        }
                        
                        return `A: ${maiorAltura.toFixed(2)} | L: ${maiorLargura.toFixed(2)} | C: ${maiorComprimento.toFixed(2)}`;
                      })()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}



          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                5. Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Informações adicionais sobre a ordem..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 3. Controle de Datas - Campos dinâmicos baseados no tipo de operação */}
          {(() => {
            const visibleFields = getVisibleDateFields();
            const tipoMovimentacao = form.watch('tipo_movimentacao');
            const subtipoOperacao = form.watch('subtipo_operacao');
            
            if (!tipoMovimentacao || !subtipoOperacao || visibleFields.length === 0) {
              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      3. Controle de Datas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Selecione o tipo de movimentação e operação para ver os campos de datas relevantes</p>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            // Definir labels amigáveis para cada campo
            const fieldLabels = {
              'data_prevista_coleta': 'Data prevista coleta',
              'data_coleta': 'Data da coleta',
              'data_prevista_entrada_armazem': 'Data prevista entrada armazém',
              'data_entrada_armazem': 'Data entrada armazém',
              'data_carregamento': 'Data carregamento',
              'data_saida_entrega': 'Data saída para entrega',
              'data_prevista_entrega': 'Data prevista entrega',
              'data_chegada_filial_entrega': 'Data chegada filial de entrega',
              'data_chegada_na_entrega': 'Data chegada na entrega',
              'data_entrega': 'Data da entrega'
            };

            // Organizar campos em colunas de forma equilibrada
            const fieldsPerColumn = Math.ceil(visibleFields.length / 3);
            const columns = [];
            for (let i = 0; i < 3; i++) {
              const start = i * fieldsPerColumn;
              const end = Math.min(start + fieldsPerColumn, visibleFields.length);
              if (start < visibleFields.length) {
                columns.push(visibleFields.slice(start, end));
              }
            }

            return (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    3. Controle de Datas
                    <Badge variant="secondary" className="ml-2">
                      {tipoMovimentacao} - {subtipoOperacao}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`grid gap-6 ${columns.length === 1 ? 'grid-cols-1' : columns.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
                    {columns.map((columnFields, columnIndex) => (
                      <div key={columnIndex} className="space-y-4">
                        {columnFields.map((fieldName) => (
                          <FormField
                            key={fieldName}
                            control={form.control}
                            name={fieldName as any}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-sm font-medium">
                                  {fieldLabels[fieldName]} 
                                  <span className="text-xs text-gray-500 ml-1">(pressione H para hora atual)</span>
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    type="datetime-local" 
                                    {...field} 
                                    placeholder="dd/mm/aaaa --:--"
                                    onKeyDown={(e) => handleDateKeyDown(e, fieldName)}
                                    className="text-sm"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  
                  {/* Indicador de campos visíveis */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{visibleFields.length} campo(s) de data relevante(s) para esta operação</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Campos otimizados por tipo</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })()}

          {/* Botões de ação */}
          <div className="flex justify-end gap-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button
              type="button"
              disabled={isProcessing || notasFiscais.length === 0}
              className={`min-w-[120px] ${hasUnsavedChanges ? 'bg-orange-600 hover:bg-orange-700 text-white' : ''}`}
              onClick={onFinalizar}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {hasUnsavedChanges ? '⚠️ Salvar Alterações' : 'Salvar Ordem'}
            </Button>
          </div>
        </form>
      </Form>
      {/* Modal de Volume */}
      <Dialog open={showVolumeModal} onOpenChange={setShowVolumeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Informar Dimensões - Nota {currentVolumeNota}</DialogTitle>
            <DialogDescription>
              Configure as dimensões físicas dos volumes para cálculo do m³
            </DialogDescription>
          </DialogHeader>
          <VolumeModal
            isOpen={showVolumeModal}
            onClose={() => setShowVolumeModal(false)}
            notaInfo={{
              id: currentVolumeNota,
              numero: currentVolumeNota,
              peso: volumeData.find(v => v.numeroNota === currentVolumeNota)?.pesoTotal || 0,
              quantidadeVolumes: parseInt((Array.isArray(notasFiscais) ? notasFiscais.find(n => n.numero_nota === currentVolumeNota) : null)?.quantidade_volumes || (Array.isArray(notasFiscais) ? notasFiscais.find(n => n.numero_nota === currentVolumeNota) : null)?.volumes || '1')
            }}
            initialVolumes={volumeData.find(v => v.numeroNota === currentVolumeNota)?.volumes || []}
            onSave={(volumeData: NotaVolumeData) => handleVolumeUpdate(currentVolumeNota, volumeData)}
          />
        </DialogContent>
      </Dialog>
      {/* Modal de NFE Import Manager */}
      <Dialog open={showNFEImportManager} onOpenChange={setShowNFEImportManager}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Busca Avançada de NFe via API</DialogTitle>
            <DialogDescription>
              Sistema de busca com 3 APIs: NSDocs (azul), CrossXML (verde) e Logística da Informação (laranja)
            </DialogDescription>
          </DialogHeader>
          <NFEImportManager
            onNotasImported={handleNotasImported}
            onClose={() => setShowNFEImportManager(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal de Pesquisa de NFe no Banco */}
      <Dialog open={showNFESearchModal} onOpenChange={setShowNFESearchModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-600">
              <Search className="w-5 h-5" />
              Pesquisar NFe no Banco de Dados
            </DialogTitle>
            <DialogDescription>
              Busque notas fiscais já cadastradas por chave, número ou fornecedor
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Filtros de pesquisa */}
            <div className="flex gap-2 mb-4">
              <div className="w-48">
                <Label htmlFor="search-type" className="text-sm font-medium text-gray-700">
                  Pesquisar por
                </Label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numero">Número da NFe</SelectItem>
                    <SelectItem value="chave">Chave de Acesso</SelectItem>
                    <SelectItem value="remetente">Remetente</SelectItem>
                    <SelectItem value="destinatario">Destinatário</SelectItem>
                    <SelectItem value="cidade_origem">Cidade Origem</SelectItem>
                    <SelectItem value="uf_origem">UF Origem</SelectItem>
                    <SelectItem value="cidade_destino">Cidade Destino</SelectItem>
                    <SelectItem value="uf_destino">UF Destino</SelectItem>
                    <SelectItem value="estagio">Estágio</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="prioridade">Prioridade</SelectItem>
                    <SelectItem value="data_inclusao">Data de Inclusão</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Campo de pesquisa dinâmico */}
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700">
                  {['estagio', 'status', 'prioridade'].includes(searchType) ? 'Selecione a opção' : 
                   searchType === 'data_inclusao' ? 'Data de inclusão (dd/mm/aaaa)' : 'Termo de pesquisa'}
                </Label>
                <div className="flex gap-2">
                  {/* Campo de seleção para filtros específicos */}
                  {searchType === 'estagio' && (
                    <Select value={searchTerm} onValueChange={setSearchTerm}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione o estágio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendente">Pendente Coleta</SelectItem>
                        <SelectItem value="recebido">Recebido</SelectItem>
                        <SelectItem value="armazenado">Armazenado</SelectItem>
                        <SelectItem value="carregado">Carregado</SelectItem>
                        <SelectItem value="transito">Em Trânsito</SelectItem>
                        <SelectItem value="filial">Filial Destino</SelectItem>
                        <SelectItem value="rota">Rota Entrega</SelectItem>
                        <SelectItem value="aguardando">Aguardando Descarga</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  
                  {searchType === 'status' && (
                    <Select value={searchTerm} onValueChange={setSearchTerm}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recebido">Recebido</SelectItem>
                        <SelectItem value="disponivel">Disponível</SelectItem>
                        <SelectItem value="bloqueada">Bloqueada</SelectItem>
                        <SelectItem value="avariada">Avariada</SelectItem>
                        <SelectItem value="extraviado">Extraviado</SelectItem>
                        <SelectItem value="carregado">Carregado</SelectItem>
                        <SelectItem value="transito">Em Trânsito</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  
                  {searchType === 'prioridade' && (
                    <Select value={searchTerm} onValueChange={setSearchTerm}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="prioridade">Prioridade</SelectItem>
                        <SelectItem value="expressa">Expressa</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  
                  {/* Campos de período para filtro de data de inclusão */}
                  {searchType === 'data_inclusao' && (
                    <div className="flex gap-2 flex-1">
                      <div className="flex-1">
                        <Label className="text-xs text-gray-500 mb-1">Data Início</Label>
                        <Input
                          type="date"
                          value={dataInicioPeriodo}
                          onChange={(e) => setDataInicioPeriodo(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs text-gray-500 mb-1">Data Fim</Label>
                        <Input
                          type="date"
                          value={dataFimPeriodo}
                          onChange={(e) => setDataFimPeriodo(e.target.value)}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Campo de texto livre para outros filtros */}
                  {!['estagio', 'status', 'prioridade', 'data_inclusao'].includes(searchType) && (
                    <Input
                      placeholder={getSearchPlaceholder(searchType)}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchNFEInDatabase(searchTerm)}
                      className="flex-1"
                    />
                  )}
                  
                  <Button 
                    onClick={() => searchNFEInDatabase(searchTerm)}
                    disabled={nfeSearchLoading || (searchType === 'data_inclusao' ? (!dataInicioPeriodo || !dataFimPeriodo) : !searchTerm.trim())}
                  >
                    {nfeSearchLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Pesquisar
                  </Button>
                </div>
              </div>
            </div>

            {/* Resultados */}
            {nfeSearchResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Resultados encontrados ({nfeSearchResults.length})
                  </Label>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const allIds = new Set(nfeSearchResults.map(nfe => nfe.id));
                        setSelectedNFEs(allIds);
                      }}
                    >
                      Selecionar Todas
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedNFEs(new Set())}
                    >
                      Limpar Seleção
                    </Button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  <div className="space-y-1 p-2">
                    {nfeSearchResults.map((nfe) => (
                      <div 
                        key={nfe.id} 
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                          selectedNFEs.has(nfe.id) ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                        }`}
                        onClick={() => toggleNFESelection(nfe.id)}
                      >
                        <div className="flex items-center mt-1">
                          <input
                            type="checkbox"
                            checked={selectedNFEs.has(nfe.id)}
                            onChange={() => toggleNFESelection(nfe.id)}
                            className="w-4 h-4 text-orange-600 rounded border-gray-300"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-gray-900">
                              NFe {nfe.numero_nota} - Série {nfe.serie}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {new Date(nfe.data_emissao).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          
                          <div className="mt-1 space-y-1">
                            <p className="text-sm text-gray-600">
                              <strong>Remetente:</strong> {nfe.emitente_razao_social}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Destinatário:</strong> {nfe.destinatario_razao_social}
                            </p>
                            {nfe.natureza_operacao && (
                              <p className="text-sm text-gray-600">
                                <strong>Natureza:</strong> {nfe.natureza_operacao}
                              </p>
                            )}
                          </div>
                          
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span>Peso: {nfe.peso_bruto || 0} kg</span>
                            <span>Volumes: {nfe.quantidade_volumes || 1}</span>
                            <span>Valor: R$ {parseFloat(nfe.valor_total || '0').toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
                          </div>
                          
                          {nfe.chave_nota_fiscal && (
                            <div className="mt-1">
                              <code className="text-xs text-gray-500 bg-gray-100 px-1 py-0.5 rounded">
                                {nfe.chave_nota_fiscal}
                              </code>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-gray-600">
                    {selectedNFEs.size} nota(s) selecionada(s)
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setShowNFESearchModal(false);
                        setSearchTerm('');
                        setNfeSearchResults([]);
                        setSelectedNFEs(new Set());
                        setDataInicioPeriodo('');
                        setDataFimPeriodo('');
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={addSelectedNFEsToOrder}
                      disabled={selectedNFEs.size === 0}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar à Ordem ({selectedNFEs.size})
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Estado vazio */}
            {nfeSearchResults.length === 0 && !nfeSearchLoading && searchTerm.trim() && (
              <div className="text-center py-8 text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma nota fiscal encontrada</p>
                <p className="text-sm">Tente pesquisar por outro termo</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Modal de Sucesso com Opções */}
      <Dialog open={showSuccessModal} onOpenChange={() => setShowSuccessModal(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Ordem Criada com Sucesso!
            </DialogTitle>
            <DialogDescription>
              A ordem {ordemSalva?.numero_ordem} foi salva com {Array.isArray(notasFiscais) ? notasFiscais.length : 0} nota(s) fiscal(is). 
              Escolha uma das opções abaixo:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            {/* Botão Imprimir Ordem */}
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-center border-blue-600 text-blue-600 hover:bg-blue-50"
              onClick={() => {
                if (ordemSalva) {
                  buscarOrdemCompleta(ordemSalva.id);
                  // Usar o novo sistema de impressão universal
                  const printData = {
                    formData: ordemSalva,
                    nfesToDisplay: prepararNFEsParaImpressao(ordemSalva.notasFiscais || [], ordemSalva.volumes || [])
                  };
                  const printLayouts = [
                    {
                      id: 'ordem',
                      name: 'Ordem de Carga (Tabular)',
                      description: 'Layout tabular com informações detalhadas das NFEs',
                      icon: '📋',
                      component: OrdemCargaLayout
                    },
                    {
                      id: 'expedicao',
                      name: 'Romaneio Expedição (Códigos de Barras)',
                      description: 'Layout com códigos de barras para expedição',
                      icon: '📊',
                      component: RomaneioExpedicaoLayout
                    }
                  ];
                  printSystem.openPrint(printData, printLayouts, 'ordem');
                }
              }}
            >
              <Printer className="w-4 h-4" />
              Imprimir Ordem
            </Button>

            {/* Botão Gerar Etiquetas - NOVO */}
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-center border-green-600 text-green-600 hover:bg-green-50"
              onClick={async () => {
                if (ordemSalva?.notasFiscais && ordemSalva.notasFiscais.length > 0) {
                  try {
                    // Primeiro, salvar a nota no banco de dados
                    const primeiraNota = ordemSalva.notasFiscais[0];
                    console.log('Salvando nota fiscal antes de gerar etiquetas:', primeiraNota.numero_nota);
                    
                    const response = await fetch('/api/notas-fiscais', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        ...primeiraNota,
                        empresa_id: user?.empresa_id
                      })
                    });

                    if (!response.ok) {
                      throw new Error('Erro ao salvar nota fiscal');
                    }

                    const result = await response.json();
                    console.log('Nota fiscal salva/verificada:', result);

                    // Após salvar, redirecionar para página de geração de etiquetas
                    const queryParams = new URLSearchParams({
                      chave_nota: primeiraNota.chave_nota_fiscal || '',
                      numero_nota: primeiraNota.numero_nota || '',
                      emitente: primeiraNota.emitente_razao_social || '',
                      destinatario: primeiraNota.destinatario_razao_social || '',
                      volumes: primeiraNota.quantidade_volumes || '1',
                      numero_pedido: ordemSalva.numero_ordem || '',
                      peso_total: primeiraNota.peso_bruto || '0'
                    });
                    
                    // Abrir em nova aba para manter o modal aberto
                    window.open(`/armazenagem/geracao-etiquetas?${queryParams.toString()}`, '_blank');
                    
                  } catch (error) {
                    console.error('Erro ao processar nota fiscal:', error);
                    toast({
                      title: "Erro",
                      description: "Erro ao salvar nota fiscal antes de gerar etiquetas",
                      variant: "destructive"
                    });
                  }
                }
              }}
            >
              <Tags className="w-4 h-4" />
              Gerar Etiquetas
            </Button>

            {/* Botão Enviar por E-mail */}
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-center"
              onClick={enviarPorEmail}
            >
              <FileText className="w-4 h-4" />
              Enviar por E-mail
            </Button>

            {/* Botão Adicionar à Fila FilaX */}
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-center border-orange-600 text-orange-600 hover:bg-orange-50"
              onClick={() => {
                setShowSuccessModal(false);
                setShowFilaXModal(true);
              }}
            >
              <Truck className="w-4 h-4" />
              Adicionar à Fila FilaX
            </Button>

            {/* Botão Sair */}
            <Button
              className="w-full flex items-center gap-2 justify-center bg-green-600 hover:bg-green-700"
              onClick={sairDoModal}
            >
              <CheckCircle className="w-4 h-4" />
              Concluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para Dados do Motorista - FilaX */}
      <Dialog open={showFilaXModal} onOpenChange={setShowFilaXModal}>
        <DialogContent className="max-w-md" aria-describedby="fila-x-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Adicionar à Fila FilaX
            </DialogTitle>
            <DialogDescription id="fila-x-description">
              Informe os dados do motorista para adicionar esta ordem à fila de operações.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="motorista-nome">Nome do Motorista *</Label>
              <Input
                id="motorista-nome"
                placeholder="Nome completo do motorista"
                value={driverInfo.motorista_nome}
                onChange={(e) => setDriverInfo({ ...driverInfo, motorista_nome: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="veiculo-placa">Placa do Veículo *</Label>
              <Input
                id="veiculo-placa"
                placeholder="ABC1234"
                value={driverInfo.veiculo_placa}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  setDriverInfo({ ...driverInfo, veiculo_placa: value });
                }}
                maxLength={7}
              />
              <p className="text-xs text-gray-500 mt-1">
                Digite apenas 7 caracteres (3 letras + 4 números, ex: ABC1234)
              </p>
            </div>
            
            <div>
              <Label htmlFor="doca-designada">Doca (Opcional)</Label>
              <Input
                id="doca-designada"
                placeholder="Ex: Doca 01, A1, etc."
                value={driverInfo.doca_designada}
                onChange={(e) => setDriverInfo({ ...driverInfo, doca_designada: e.target.value })}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowFilaXModal(false);
                  setDriverInfo({ motorista_nome: '', veiculo_placa: '', doca_designada: '' });
                }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={adicionarAFilaX}
                disabled={!driverInfo.motorista_nome || !driverInfo.veiculo_placa || isAddingToFila}
              >
                {isAddingToFila ? 'Adicionando...' : 'Adicionar à Fila'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sistema de impressão universal */}
      <UniversalPrintDialog
        open={printSystem.isOpen}
        onOpenChange={printSystem.closePrint}
        title="Impressão de Documentos"
        data={printSystem.printData}
        layouts={printSystem.layouts}
        defaultLayout={printSystem.defaultLayout}
      />
      {/* Animação de sucesso */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Ordem Finalizada!</h3>
            <p className="text-gray-600">Ordem criada com sucesso</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NovaOrdemIntegrada;