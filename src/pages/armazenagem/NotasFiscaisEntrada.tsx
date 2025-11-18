import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useDropzone } from 'react-dropzone';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CubagemManager, { NotaVolumeData, VolumeData as CubagemVolumeData } from '../../components/comum/CubagemManager';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { fetchCNPJData, formatCNPJ, cleanCNPJ } from '@/utils/cnpjApi';
import { useToast } from '@/hooks/use-toast';
import { InlineHelp, QuickHelp } from '@/components/help/InlineHelp';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  Upload,
  Search,
  Package,
  Truck,
  MapPin,
  Calendar,
  DollarSign,
  Weight,
  Hash,
  Building,
  User,
  Phone,
  Mail,
  Plus,
  Edit,
  Trash2,
  Check,
  ExternalLink,
  X,
  AlertCircle,
  Info,
  Loader2,
  Barcode,
  Box,
  Calculator,

  FileX,
  Download,
  Eye,
  Clock,
  Scan,
  Save,
  RefreshCw,
  List,
  Grid3X3,
  Camera,
  AlertTriangle,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
  import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import Webcam from 'react-webcam';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import MobileCameraGuide from '@/components/MobileCameraGuide';
import { useDeviceOrientation } from '@/hooks/useDeviceOrientation';
import Quagga from 'quagga';
// Hook reutilizado para gravar notas no Supabase
import { useFormSubmission } from '@/pages/armazenagem/recebimento/components/forms/hooks/useFormSubmission';

// Volume calculation interfaces
interface VolumeData {
  volume: number;
  altura: number;
  largura: number;
  comprimento: number;
  m3: number;
}

  const NotasFiscaisEntrada = () => {
  const [, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isPortrait, isLandscape, isMobile } = useDeviceOrientation();
  
  // Camera and barcode scanning states
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showCameraGuide, setShowCameraGuide] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [continuousScanning, setContinuousScanning] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const [scanningInterval, setScanningInterval] = useState<NodeJS.Timeout | null>(null);
  
  // QuaggaJS specific states
  const [quaggaInitialized, setQuaggaInitialized] = useState(false);
  const quaggaContainerRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);

  // Shared manual fields that apply to all invoices
  const [sharedFields, setSharedFields] = useState({
    operacao: '',
    cliente_retira: '',
    tipo_frete: 'CIF',
    custo_extra: ''
  });

  // Multiple invoices state
  const [invoiceBatch, setInvoiceBatch] = useState<any[]>([]);
  const [batchInvoices, setBatchInvoices] = useState<any[]>([]);
  const [currentInvoiceIndex, setCurrentInvoiceIndex] = useState(0);
  // Auto add: ao bipar a chave, busca e adiciona automaticamente ao lote
  const [autoAddToBatch, setAutoAddToBatch] = useState(false);
  // Batch mode removido do fluxo de UI (manter off)
  const [batchMode, setBatchMode] = useState(false);
  const [scannedKeys, setScannedKeys] = useState<string[]>([]);

  // Ao colar/teclar no campo de chave quando Auto adicionar está ativo, capturar automaticamente
  const handlePasteNFeKey = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!autoAddToBatch) return;
    const text = e.clipboardData.getData('text') || '';
    const cleaned = text.replace(/\D/g, '').trim();
    if (cleaned.length === 44) {
      e.preventDefault();
      setFormData(prev => ({ ...prev, chave_nota_fiscal: cleaned }));
      void autoFetchAndAddToBatch(cleaned);
    }
  };

  const handleKeyDownNFeInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!autoAddToBatch) return;
    if (e.key === 'Enter') {
      const current = (formData.chave_nota_fiscal || '').replace(/\D/g, '').trim();
      if (current.length === 44) {
        e.preventDefault();
        void autoFetchAndAddToBatch(current);
      }
    }
  };
  
  // Dialog states for invoice actions
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  // Current single invoice form (for compatibility with existing functions)
  const [formData, setFormData] = useState({
    // Dados da Nota Fiscal
    chave_nota_fiscal: '',
    data_hora_emissao: '',
    numero_nota: '',
    serie_nota: '',
    natureza_operacao: '',
    operacao: '',
    cliente_retira: '',
    
    // Dados do Emitente
    emitente_cnpj: '',
    emitente_razao_social: '',
    emitente_telefone: '',
    emitente_uf: '',
    emitente_cidade: '',
    emitente_bairro: '',
    emitente_endereco: '',
    emitente_numero: '',
    emitente_cep: '',
    
    // Dados do Destinatário
    destinatario_cnpj: '',
    destinatario_razao_social: '',
    destinatario_telefone: '',
    destinatario_uf: '',
    destinatario_cidade: '',
    destinatario_bairro: '',
    destinatario_endereco: '',
    destinatario_numero: '',
    destinatario_cep: '',
    
    // Informações Adicionais
    quantidade_volumes: '',
    valor_nota_fiscal: '',
    peso_bruto: '',
    informacoes_complementares: '',
    numero_pedido: '',
    tipo_frete: 'CIF',
    custo_extra: ''
  });

  // Multiple XML files for batch processing
  const [xmlFiles, setXmlFiles] = useState<File[]>([]);
  const [batchProcessingStatus, setBatchProcessingStatus] = useState<{[key: string]: 'pending' | 'processing' | 'completed' | 'error'}>({});

  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [xmlFile, setXmlFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('cadastro');
  const [processedInvoices, setProcessedInvoices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderType, setSelectedOrderType] = useState('Coleta');
  const [isEditingNFe, setIsEditingNFe] = useState(false);
  const [editingNotaId, setEditingNotaId] = useState<string>('');

  // CNPJ API states
  const [cnpjEmitenteLoading, setCnpjEmitenteLoading] = useState(false);
  const [cnpjDestinatarioLoading, setCnpjDestinatarioLoading] = useState(false);
  const [cnpjEmitenteError, setCnpjEmitenteError] = useState<string | null>(null);
  const [cnpjDestinatarioError, setCnpjDestinatarioError] = useState<string | null>(null);

  const { toast } = useToast();

  // Load editing NFe data from localStorage
  React.useEffect(() => {
    const editingNotaData = localStorage.getItem('editingNotaFiscal');
    if (editingNotaData) {
      try {
        const nota = JSON.parse(editingNotaData);
        console.log('Carregando NFe para edição:', nota);
        
        // Populate form with NFe data
        setFormData({
          chave_nota_fiscal: nota.chave_nota_fiscal || '',
          data_hora_emissao: nota.data_hora_emissao || '',
          numero_nota: nota.numero_nota || '',
          serie_nota: nota.serie_nota || '',
          natureza_operacao: nota.natureza_operacao || '',
          operacao: nota.operacao || '',
          cliente_retira: nota.cliente_retira || '',
          
          // Dados do Emitente
          emitente_cnpj: nota.emitente_cnpj || '',
          emitente_razao_social: nota.emitente_razao_social || '',
          emitente_telefone: nota.emitente_telefone || '',
          emitente_uf: nota.emitente_uf || '',
          emitente_cidade: nota.emitente_cidade || '',
          emitente_bairro: nota.emitente_bairro || '',
          emitente_endereco: nota.emitente_endereco || '',
          emitente_numero: nota.emitente_numero || '',
          emitente_cep: nota.emitente_cep || '',
          
          // Dados do Destinatário
          destinatario_cnpj: nota.destinatario_cnpj || '',
          destinatario_razao_social: nota.destinatario_razao_social || '',
          destinatario_telefone: nota.destinatario_telefone || '',
          destinatario_uf: nota.destinatario_uf || '',
          destinatario_cidade: nota.destinatario_cidade || '',
          destinatario_bairro: nota.destinatario_bairro || '',
          destinatario_endereco: nota.destinatario_endereco || '',
          destinatario_numero: nota.destinatario_numero || '',
          destinatario_cep: nota.destinatario_cep || '',
          
          // Informações Adicionais
          quantidade_volumes: nota.quantidade_volumes || '',
          valor_nota_fiscal: nota.valor_nota_fiscal || '',
          peso_bruto: nota.peso_bruto || '',
          informacoes_complementares: nota.informacoes_complementares || '',
          numero_pedido: nota.numero_pedido || '',
          tipo_frete: nota.tipo_frete || 'CIF',
          custo_extra: nota.custo_extra || ''
        });
        
        // Load volumes data if available
        if (nota.volumes && Array.isArray(nota.volumes)) {
          const volumeData: NotaVolumeData = {
            notaId: nota.id || Date.now().toString(),
            numeroNota: nota.numero_nota || '',
            volumes: nota.volumes.map((vol: any, index: number) => ({
              volume: index + 1,
              altura: vol.altura || 0,
              largura: vol.largura || 0,
              comprimento: vol.comprimento || 0,
              m3: vol.m3 || 0
            })),
            totalM3: nota.volumes.reduce((sum: number, vol: any) => sum + (vol.m3 || 0), 0),
            pesoTotal: parseFloat(nota.peso_bruto || '0')
          };
          
          // Save to localStorage for volume modal
          localStorage.setItem('volumesData', JSON.stringify([volumeData]));
        }
        
        // Set editing mode
        setIsEditingNFe(true);
        setEditingNotaId(nota.id || Date.now().toString());
        
        // Set active tab to show data
        setActiveTab('cadastro');
        
        // Clear the editing data after loading
        localStorage.removeItem('editingNotaFiscal');
        
      } catch (error) {
        console.error('Erro ao carregar dados da NFe para edição:', error);
      }
    }
    
  // Clear all cached invoice data for fresh start
  localStorage.removeItem('processedInvoices');
  setProcessedInvoices([]);
}, []);

// DEBUG: Monitor formData changes
useEffect(() => {
  console.log('[DEBUG FORM] formData atualizado:', formData);
  console.log('[DEBUG FORM] Campos específicos:');
  console.log('[DEBUG FORM] - numero_nota:', formData.numero_nota);
  console.log('[DEBUG FORM] - serie_nota:', formData.serie_nota);
  console.log('[DEBUG FORM] - data_hora_emissao:', formData.data_hora_emissao);
  console.log('[DEBUG FORM] - valor_nota_fiscal:', formData.valor_nota_fiscal);
}, [formData]);



  // Filter processed invoices based on search query
  const filteredInvoices = processedInvoices.filter(invoice => 
    invoice.numero_nota?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.chave_nota_fiscal?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.emitente_razao_social?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.destinatario_razao_social?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle label generation for a specific invoice
  const handleGenerateLabels = (invoice: any) => {
    // Store invoice data in sessionStorage for label generation
    sessionStorage.setItem('xmlData', JSON.stringify(invoice));
    setLocation('/armazenagem/geracao-etiquetas');
  };

  // Handler functions for invoice actions
  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleEditInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setEditDialogOpen(true);
  };

  // CNPJ search functions
  const buscarDadosEmitente = async (cnpj: string) => {
    setCnpjEmitenteLoading(true);
    setCnpjEmitenteError(null);
    
    try {
      const data = await fetchCNPJData(cnpj);
      
      if (data && data.data) {
        setFormData(prev => ({
          ...prev,
          emitente_razao_social: data.data?.razaoSocial || '',
          emitente_telefone: data.data?.telefone || '',
          emitente_endereco: data.data?.endereco || '',
          emitente_numero: data.data?.numero || '',
          emitente_bairro: data.data?.bairro || '',
          emitente_cidade: data.data?.cidade || '',
          emitente_uf: data.data?.uf || '',
          emitente_cep: data.data?.cep || ''
        }));
        
        // Sucesso silencioso ao preencher dados do emitente
      }
    } catch (error) {
      setCnpjEmitenteError('Erro ao buscar dados do CNPJ');
      toast({
        title: "Erro",
        description: "Erro ao buscar dados do CNPJ do emitente",
        variant: "destructive"
      });
    } finally {
      setCnpjEmitenteLoading(false);
    }
  };

  const buscarDadosDestinatario = async (cnpj: string) => {
    setCnpjDestinatarioLoading(true);
    setCnpjDestinatarioError(null);
    
    try {
      const data = await fetchCNPJData(cnpj);
      
      if (data && data.data) {
        setFormData(prev => ({
          ...prev,
          destinatario_razao_social: data.data?.razaoSocial || '',
          destinatario_telefone: data.data?.telefone || '',
          destinatario_endereco: data.data?.endereco || '',
          destinatario_numero: data.data?.numero || '',
          destinatario_bairro: data.data?.bairro || '',
          destinatario_cidade: data.data?.cidade || '',
          destinatario_uf: data.data?.uf || '',
          destinatario_cep: data.data?.cep || ''
        }));
        
        // Sucesso silencioso ao preencher dados do destinatário
      }
    } catch (error) {
      setCnpjDestinatarioError('Erro ao buscar dados do CNPJ');
      toast({
        title: "Erro",
        description: "Erro ao buscar dados do CNPJ do destinatário",
        variant: "destructive"
      });
    } finally {
      setCnpjDestinatarioLoading(false);
    }
  };

  const handleDeleteInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteInvoice = () => {
    if (selectedInvoice) {
      setProcessedInvoices(prev => 
        prev.filter(inv => inv.id !== selectedInvoice.id && inv.chave_nota_fiscal !== selectedInvoice.chave_nota_fiscal)
      );
      setDeleteDialogOpen(false);
      setSelectedInvoice(null);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Process XML file from file input or drag-and-drop
  const processXMLFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xml')) {
      alert('Por favor, selecione apenas arquivos XML.');
      return;
    }

    setXmlFile(file);
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
          const xmlText = e.target?.result as string;
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
          
          // Extract data using the provided XML mapping
          const extractedData = {
            // Dados da Nota Fiscal
            chave_nota_fiscal: extractNFeKey(xmlDoc) || '',
            data_hora_emissao: getXMLValue(xmlDoc, 'dhEmi') || '',
  numero_nota: getXMLValue(xmlDoc, 'ide nNF') || getXMLValue(xmlDoc, 'nNF') || '',
            serie_nota: getXMLValue(xmlDoc, 'serie') || '',
            natureza_operacao: getXMLValue(xmlDoc, 'natOp') || '',
            operacao: 'Coleta TRANSUL',
            cliente_retira: 'Selecione',
            
            // Dados do Emitente
            emitente_cnpj: getXMLValue(xmlDoc, 'emit CNPJ') || '',
            emitente_razao_social: getXMLValue(xmlDoc, 'emit xNome') || '',
            emitente_telefone: getXMLValue(xmlDoc, 'enderEmit fone') || '',
            emitente_uf: getXMLValue(xmlDoc, 'enderEmit UF') || '',
            emitente_cidade: getXMLValue(xmlDoc, 'enderEmit xMun') || '',
            emitente_bairro: getXMLValue(xmlDoc, 'enderEmit xBairro') || '',
            emitente_endereco: getXMLValue(xmlDoc, 'enderEmit xLgr') || '',
            emitente_numero: getXMLValue(xmlDoc, 'enderEmit nro') || '',
            emitente_cep: getXMLValue(xmlDoc, 'enderEmit CEP') || '',
            
            // Dados do Destinatário
            destinatario_cnpj: getXMLValue(xmlDoc, 'dest CNPJ') || '',
            destinatario_razao_social: getXMLValue(xmlDoc, 'dest xNome') || '',
            destinatario_telefone: getXMLValue(xmlDoc, 'enderDest fone') || '',
            destinatario_uf: getXMLValue(xmlDoc, 'enderDest UF') || '',
            destinatario_cidade: getXMLValue(xmlDoc, 'enderDest xMun') || '',
            destinatario_bairro: getXMLValue(xmlDoc, 'enderDest xBairro') || '',
            destinatario_endereco: getXMLValue(xmlDoc, 'enderDest xLgr') || '',
            destinatario_numero: getXMLValue(xmlDoc, 'enderDest nro') || '',
            destinatario_cep: getXMLValue(xmlDoc, 'enderDest CEP') || '',
            
            // Informações Adicionais
            quantidade_volumes: getXMLValue(xmlDoc, 'vol qVol') || '',
            valor_nota_fiscal: getXMLValue(xmlDoc, 'ICMSTot vNF') || '',
            peso_bruto: getXMLValue(xmlDoc, 'vol pesoB') || '',
            informacoes_complementares: getXMLValue(xmlDoc, 'infAdic infCpl') || '',
            numero_pedido: extractPedidoNumber(getXMLValue(xmlDoc, 'infAdic infCpl') || ''),
            tipo_frete: 'CIF', // Não extraído do XML, mantém padrão
            custo_extra: '' // Campo manual, não extraído do XML
          };
          
          setFormData(extractedData);
          
          // Processar automaticamente e conectar aos volumes (para arquivo individual)
          const processedInvoice = {
            ...extractedData,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            data_processamento: new Date().toISOString(),
            processedAt: new Date().toISOString(),
            operacao: extractedData.operacao || sharedFields.operacao,
            cliente_retira: extractedData.cliente_retira || sharedFields.cliente_retira,
            tipo_frete: extractedData.tipo_frete || sharedFields.tipo_frete,
            custo_extra: extractedData.custo_extra || sharedFields.custo_extra,
            status: 'pendente'
          };

          // Add to volume extract automatically
          const existingVolumeData = batchVolumeData.find(item => item.numeroNota === extractedData.numero_nota);
          if (!existingVolumeData) {
            const notaVolumeData: NotaVolumeData = {
              notaId: processedInvoice.id,
              numeroNota: extractedData.numero_nota,
              volumes: [],
              totalM3: 0,
              pesoTotal: parseFloat(extractedData.peso_bruto || '0') || 0
            };
            setBatchVolumeData(prev => [...prev, notaVolumeData]);
          }

          // Store in temporary batch for document generation
          setBatchInvoices(prev => [...prev, processedInvoice]);
          
          // Store processed invoices for marketplace use
          const existingProcessed = JSON.parse(localStorage.getItem('processedInvoices') || '[]');
          const updatedProcessed = [...existingProcessed, processedInvoice];
          localStorage.setItem('processedInvoices', JSON.stringify(updatedProcessed));
          setProcessedInvoices(updatedProcessed);
          
          setShowSuccessAnimation(true);
          setTimeout(() => setShowSuccessAnimation(false), 3000);
          
          setIsProcessing(false);
        } catch (error) {
          console.error('Erro ao processar XML:', error);
          alert('Erro ao processar o arquivo XML. Verifique se o arquivo está válido.');
          setIsProcessing(false);
        }
      };
      
      reader.readAsText(file);
  };

  // Handle XML file upload from file input
  const handleXMLUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processXMLFile(file);
    }
  };

  // Setup drag and drop functionality
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      processXMLFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        if (acceptedFiles.length === 1) {
          // Single file processing (maintain compatibility)
          setXmlFile(acceptedFiles[0]);
          processXMLFile(acceptedFiles[0]);
        } else {
          // Multiple files processing - processa automaticamente
          setXmlFiles(acceptedFiles);
          processBatchXmlFiles(acceptedFiles);
        }
      }
    },
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml']
    },
    multiple: true
  });

  // Helper function to extract values from XML with namespace support
  const getXMLValue = (xmlDoc: Document, tagPath: string): string => {
    const tags = tagPath.split(' ');
    let element: any = xmlDoc;
    
    for (const tag of tags) {
      // Try with and without namespace
      let found = element.querySelector ? element.querySelector(tag) : null;
      if (!found && element.querySelector) {
        // Try with wildcard namespace
        found = element.querySelector(`*|${tag}, ${tag}`);
      }
      if (!found) {
        return '';
      }
      element = found;
    }
    
    return element.textContent || '';
  };

  // Enhanced function to extract NFe key from XML
  const extractNFeKey = (xmlDoc: Document): string => {
    // Method 1: Look for chNFe tag
    let chaveElement = xmlDoc.querySelector('chNFe');
    if (chaveElement && chaveElement.textContent) {
      const chave = chaveElement.textContent.trim();
      if (chave.length === 44) {
        return chave;
      }
    }
    
    // Method 2: Look in infNFe Id attribute
    const infNFeElement = xmlDoc.querySelector('infNFe');
    if (infNFeElement) {
      const id = infNFeElement.getAttribute('Id');
      if (id && id.startsWith('NFe')) {
        const chave = id.substring(3); // Remove 'NFe' prefix
        if (chave.length === 44) {
          return chave;
        }
      }
    }
    
    // Method 3: Look for any element with 44-digit content
    const allElements = Array.from(xmlDoc.querySelectorAll('*'));
    for (const element of allElements) {
      const text = element.textContent?.trim();
      if (text && text.length === 44 && /^\d{44}$/.test(text)) {
        return text;
      }
    }
    
    // Method 4: Search in attributes
    for (const element of allElements) {
      const attributes = Array.from(element.attributes);
      for (const attr of attributes) {
        const value = attr.value?.trim();
        if (value && value.length === 44 && /^\d{44}$/.test(value)) {
          return value;
        }
        // Check if it's an Id attribute with NFe prefix
        if (attr.name === 'Id' && value && value.startsWith('NFe') && value.length === 47) {
          const chave = value.substring(3);
          return chave;
        }
      }
    }
    
    return '';
  };

  // Helper function to extract pedido number from infCpl
  const extractPedidoNumber = (infCpl: string): string => {
    const pedidoMatch = infCpl.match(/PEDIDO[:\s]*(\d+)/i);
    return pedidoMatch ? pedidoMatch[1] : '';
  };

  // Batch processing for multiple XML files
  const processBatchXmlFiles = async (files: File[]) => {
    setIsProcessing(true);
    const newBatch: any[] = [];
    const newStatus: {[key: string]: 'pending' | 'processing' | 'completed' | 'error'} = {};

    for (const file of files) {
      newStatus[file.name] = 'pending';
    }
    setBatchProcessingStatus(newStatus);

    for (const file of files) {
      try {
        setBatchProcessingStatus(prev => ({ ...prev, [file.name]: 'processing' }));
        
        const xmlContent = await readFileAsText(file);
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
        
        if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
          throw new Error('XML inválido');
        }

        const extractedData = extractDataFromXml(xmlDoc);
        
        const invoiceData = {
          ...extractedData,
          fileName: file.name,
          xmlContent: xmlContent,
          processedAt: new Date().toISOString(),
          // Apply shared fields
          operacao: sharedFields.operacao,
          cliente_retira: sharedFields.cliente_retira,
          tipo_frete: sharedFields.tipo_frete
        };

        newBatch.push(invoiceData);
        setBatchProcessingStatus(prev => ({ ...prev, [file.name]: 'completed' }));
      } catch (error) {
        console.error(`Erro ao processar ${file.name}:`, error);
        setBatchProcessingStatus(prev => ({ ...prev, [file.name]: 'error' }));
      }
    }

    // Processa automaticamente as notas e conecta aos volumes
    if (newBatch.length > 0) {
      // Add processed invoices to volume extract 
      const processedBatch = newBatch.map(invoice => {
        const processedInvoice = {
          ...invoice,
          id: invoice.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          data_processamento: new Date().toISOString(),
          processedAt: new Date().toISOString(),
          operacao: invoice.operacao || sharedFields.operacao,
          cliente_retira: invoice.cliente_retira || sharedFields.cliente_retira,
          tipo_frete: invoice.tipo_frete || sharedFields.tipo_frete,
          custo_extra: invoice.custo_extra || sharedFields.custo_extra,
          status: 'pendente'
        };

        // Add to volume extract with correct volume count (XML upload)
        const existingVolumeData = batchVolumeData.find(item => item.numeroNota === invoice.numero_nota);
        if (!existingVolumeData) {
          const quantidadeVolumes = parseInt(invoice.quantidade_volumes || '1') || 1;
          const volumes = Array.from({ length: quantidadeVolumes }, (_, index) => ({
            volume: index + 1,
            altura: 0,
            largura: 0,
            comprimento: 0,
            m3: 0
          }));
          
          const notaVolumeData: NotaVolumeData = {
            notaId: processedInvoice.id,
            numeroNota: invoice.numero_nota,
            volumes: volumes,
            totalM3: 0,
            pesoTotal: parseFloat(invoice.peso_bruto || '0') || 0
          };
          setBatchVolumeData(prev => [...prev, notaVolumeData]);
        }

        return processedInvoice;
      });

      // Store in temporary batch for document generation
      setBatchInvoices(processedBatch);
      
      // Store processed invoices for marketplace use
      const existingProcessed = JSON.parse(localStorage.getItem('processedInvoices') || '[]');
      const updatedProcessed = [...existingProcessed, ...processedBatch];
      localStorage.setItem('processedInvoices', JSON.stringify(updatedProcessed));
      setProcessedInvoices(updatedProcessed);
      
      // Clear XML processing states
      setInvoiceBatch([]);
      setBatchProcessingStatus({});
      setXmlFiles([]);
      setXmlFile(null);
      
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 3000);
    }
    
    setIsProcessing(false);
  };

  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target?.result as string);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  // Extract data from XML document
  const extractDataFromXml = (xmlDoc: Document) => {
    return {
      chave_nota_fiscal: extractNFeKey(xmlDoc),
  numero_nota: getXMLValue(xmlDoc, 'ide nNF') || getXMLValue(xmlDoc, 'nNF'),
      serie_nota: getXMLValue(xmlDoc, 'ide serie'),
      data_hora_emissao: getXMLValue(xmlDoc, 'ide dhEmi'),
      natureza_operacao: getXMLValue(xmlDoc, 'ide natOp'),
      emitente_cnpj: getXMLValue(xmlDoc, 'emit CNPJ'),
      emitente_razao_social: getXMLValue(xmlDoc, 'emit xNome'),
      emitente_uf: getXMLValue(xmlDoc, 'enderEmit UF'),
      emitente_cidade: getXMLValue(xmlDoc, 'enderEmit xMun'),
      emitente_bairro: getXMLValue(xmlDoc, 'enderEmit xBairro'),
      emitente_endereco: getXMLValue(xmlDoc, 'enderEmit xLgr'),
      emitente_numero: getXMLValue(xmlDoc, 'enderEmit nro'),
      emitente_cep: getXMLValue(xmlDoc, 'enderEmit CEP'),
      destinatario_cnpj: getXMLValue(xmlDoc, 'dest CNPJ'),
      destinatario_razao_social: getXMLValue(xmlDoc, 'dest xNome'),
      destinatario_uf: getXMLValue(xmlDoc, 'enderDest UF'),
      destinatario_cidade: getXMLValue(xmlDoc, 'enderDest xMun'),
      destinatario_bairro: getXMLValue(xmlDoc, 'enderDest xBairro'),
      destinatario_endereco: getXMLValue(xmlDoc, 'enderDest xLgr'),
      destinatario_numero: getXMLValue(xmlDoc, 'enderDest nro'),
      destinatario_cep: getXMLValue(xmlDoc, 'enderDest CEP'),
      valor_nota_fiscal: getXMLValue(xmlDoc, 'ICMSTot vNF'),
      quantidade_volumes: getXMLValue(xmlDoc, 'vol qVol'),
      peso_bruto: getXMLValue(xmlDoc, 'vol pesoB'),
      informacoes_complementares: getXMLValue(xmlDoc, 'infAdic infCpl'),
      numero_pedido: extractPedidoNumber(getXMLValue(xmlDoc, 'infAdic infCpl')),
      operacao: '',
      cliente_retira: '',
      emitente_telefone: '',
      destinatario_telefone: '',
      tipo_frete: 'CIF',
      custo_extra: ''
    };
  };

  // (Removido) processBatchNSDocsKeys

  // Processamento em lote (sem fallback). Em caso de erro, apenas avisar.
  const processBatchMeuDanfeKeys = async (keys: string[]) => {
    setIsApiLoading(true);

    try {
      // Marcar todos como processing durante a chamada
      const processingStatus: { [key: string]: 'pending' | 'processing' | 'completed' | 'error' } = {};
      for (const key of keys) processingStatus[key] = 'processing';
      setBatchProcessingStatus(processingStatus);

      const response = await fetch('/api/xml/fetch-from-meudanfe/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys })
      });

      if (!response.ok) {
        console.error('[MeuDanfe] Erro HTTP no batch:', response.status);
        const errorStatus: { [key: string]: 'pending' | 'processing' | 'completed' | 'error' } = {};
        for (const key of keys) errorStatus[key] = 'error';
        setBatchProcessingStatus(errorStatus);
        toast({
          title: 'Erro ao processar em lote',
          description: `Falha na consulta ao Meu Danfe (HTTP ${response.status}). Tente novamente mais tarde.`,
          variant: 'destructive'
        });
      } else {
        const result = await response.json();
        console.log('[Frontend] Resposta Meu Danfe (batch):', result);

        const items: Array<{ key: string; success: boolean; xml_content?: string; error?: string; status?: string }> = result.items || [];

        if (!items.length) {
          const errorStatus: { [key: string]: 'pending' | 'processing' | 'completed' | 'error' } = {};
          for (const key of keys) errorStatus[key] = 'error';
          setBatchProcessingStatus(errorStatus);
          toast({
            title: 'Batch retornou vazio',
            description: 'Nenhuma resposta foi recebida para as chaves informadas.',
            variant: 'destructive'
          });
        } else {
          let okCount = 0;
          let errCount = 0;
          for (const item of items) {
            if (item.success && item.xml_content) {
              await processXMLContent(item.xml_content);
              setBatchProcessingStatus(prev => ({ ...prev, [item.key]: 'completed' }));
              okCount++;
            } else {
              setBatchProcessingStatus(prev => ({ ...prev, [item.key]: 'error' }));
              errCount++;
            }
          }
          toast({
            title: 'Processamento em lote concluído',
            description: `Sucesso: ${okCount} • Erros: ${errCount}`
          });
        }
      }
    } catch (error) {
      console.error('[MeuDanfe] Erro no batch (exception):', error);
      const errorStatus: { [key: string]: 'pending' | 'processing' | 'completed' | 'error' } = {};
      for (const key of keys) errorStatus[key] = 'error';
      setBatchProcessingStatus(errorStatus);
      toast({
        title: 'Erro ao processar em lote',
        description: 'Ocorreu uma exceção durante o processamento. Verifique conexão e configuração da API.',
        variant: 'destructive'
      });
    }

    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 3000);
    setIsApiLoading(false);
  };

  // Handle shared fields changes
  const handleSharedFieldChange = (field: string, value: string) => {
    setSharedFields(prev => ({ ...prev, [field]: value }));
    
    // Update all invoices in batch with new shared field value
    setInvoiceBatch(prev => prev.map(invoice => ({ ...invoice, [field]: value })));
    
    // Update current form data as well
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add invoice to batch (for manual entry)
  const addInvoiceToBatch = () => {
    const newInvoice = {
      ...formData,
      // Apply shared fields
      operacao: sharedFields.operacao,
      cliente_retira: sharedFields.cliente_retira,
      tipo_frete: sharedFields.tipo_frete,
      custo_extra: sharedFields.custo_extra,
      id: Date.now().toString(),
      source: 'manual',
      processedAt: new Date().toISOString()
    };
    
    setInvoiceBatch(prev => [...prev, newInvoice]);
  };

  // Remove invoice from batch
  const removeInvoiceFromBatch = (index: number) => {
    setInvoiceBatch(prev => prev.filter((_, i) => i !== index));
  };

  // Move a nota atual do formulário para o mockup (batchInvoices) sem limpar o formulário
  const enqueueCurrentInvoiceToBatch = () => {
    const hasCurrent = (formData.numero_nota && formData.numero_nota.trim() !== '') ||
      (formData.chave_nota_fiscal && formData.chave_nota_fiscal.trim().length === 44);
    if (!hasCurrent) return;

    const processedInvoice = {
      ...formData,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      data_processamento: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      operacao: formData.operacao || sharedFields.operacao,
      cliente_retira: formData.cliente_retira || sharedFields.cliente_retira,
      tipo_frete: formData.tipo_frete || sharedFields.tipo_frete,
      custo_extra: formData.custo_extra || sharedFields.custo_extra,
      status: 'pendente'
    };

    // Garantir estrutura de cubagem
    const existingVolumeData = batchVolumeData.find(item => item.numeroNota === formData.numero_nota);
    if (!existingVolumeData) {
      const quantidadeVolumes = parseInt(formData.quantidade_volumes || '1') || 1;
      const volumes = Array.from({ length: quantidadeVolumes }, (_, index) => ({
        volume: index + 1,
        altura: 0,
        largura: 0,
        comprimento: 0,
        m3: 0
      }));

      const notaVolumeData: NotaVolumeData = {
        notaId: processedInvoice.id,
        numeroNota: formData.numero_nota,
        volumes: volumes,
        totalM3: 0,
        pesoTotal: parseFloat(formData.peso_bruto || '0') || 0
      };
      setBatchVolumeData(prev => [...prev, notaVolumeData]);
    }

    setBatchInvoices(prev => [...prev, processedInvoice]);
    const existingProcessed = JSON.parse(localStorage.getItem('processedInvoices') || '[]');
    const updatedProcessed = [...existingProcessed, processedInvoice];
    localStorage.setItem('processedInvoices', JSON.stringify(updatedProcessed));
    setProcessedInvoices(updatedProcessed);

    toast({ title: 'Nota adicionada ao mockup', description: `NF ${formData.numero_nota || formData.chave_nota_fiscal}` });
  };

  // Process all invoices in batch
  const processBatchInvoices = () => {
    if (invoiceBatch.length === 0) {
      alert('Nenhuma nota fiscal no lote para processar');
      return;
    }

    // Add processed invoices to volume extract without saving to system yet
    const processedBatch = invoiceBatch.map(invoice => {
      const processedInvoice = {
        ...invoice,
        id: invoice.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        data_processamento: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        operacao: invoice.operacao || sharedFields.operacao,
        cliente_retira: invoice.cliente_retira || sharedFields.cliente_retira,
        tipo_frete: invoice.tipo_frete || sharedFields.tipo_frete,
        custo_extra: invoice.custo_extra || sharedFields.custo_extra,
        status: 'pendente' // Not saved to system yet
      };

      // Add to volume extract even without cubagem
      const existingVolumeData = batchVolumeData.find(item => item.numeroNota === invoice.numero_nota);
      if (!existingVolumeData) {
        const notaVolumeData: NotaVolumeData = {
          notaId: processedInvoice.id,
          numeroNota: invoice.numero_nota,
          volumes: [],
          totalM3: 0,
          pesoTotal: parseFloat(invoice.peso_bruto || '0') || 0
        };
        setBatchVolumeData(prev => [...prev, notaVolumeData]);
      }

      return processedInvoice;
    });

    // Store in temporary batch for document generation
    setBatchInvoices(processedBatch);
    
    // Store processed invoices for marketplace use (CRITICAL FOR API FLOW)
    const existingProcessed = JSON.parse(localStorage.getItem('processedInvoices') || '[]');
    const updatedProcessed = [...existingProcessed, ...processedBatch];
    localStorage.setItem('processedInvoices', JSON.stringify(updatedProcessed));
    setProcessedInvoices(updatedProcessed);
    
    // Clear XML processing
    setInvoiceBatch([]);
    setBatchProcessingStatus({});
    setXmlFiles([]);
    setXmlFile(null);
    
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 3000);
    
    alert(`${processedBatch.length} nota(s) fiscal(is) adicionada(s) ao extrato de volumes!\n\nUse "Gerar Coleta" ou "Gerar OR" para finalizar o processamento.`);
  };



  // (Removido) runNSDocsDiagnostics

  // Logística da Informação API integration function
  const fetchXmlWithLogisticaInfo = async () => {
    if (!formData.chave_nota_fiscal || formData.chave_nota_fiscal.length !== 44) {
      alert('Por favor, insira uma chave de nota fiscal válida (44 dígitos)');
      return;
    }

    setIsApiLoading(true);
    
    try {
      console.log(`[Frontend] Iniciando busca Logística da Informação para: ${formData.chave_nota_fiscal}`);
      
      const response = await fetch('/api/xml/fetch-from-logistica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chaveNotaFiscal: formData.chave_nota_fiscal,
          cnpj: '34579341000185',
          token: '5K7WUNCGES1GNIP6DW65JAIW54H111'
        })
      });

      console.log('[Frontend] HTTP Status da API Logística:', response.status);

      const result = await response.json();
      
      console.log('[Frontend] Resposta da API Logística da Informação:', {
        success: result.success,
        hasData: !!result.data,
        hasXml: !!result.xml_content,
        source: result.source
      });

      if (!response.ok) {
        alert(`Erro HTTP na API Logística: ${response.status}`);
        return;
      }

      // Log básico para debug
      console.log('[DEBUG] Result completo:', result);
      console.log('[DEBUG] result.success:', result.success);
      console.log('[DEBUG] result.data:', result.data);
      console.log('[DEBUG] typeof result.success:', typeof result.success);
      console.log('[DEBUG] typeof result.data:', typeof result.data);
      
      // Verificar se result.success é exatamente true
      console.log('[DEBUG] result.success === true:', result.success === true);
      console.log('[DEBUG] result.success == true:', result.success == true);
      console.log('[DEBUG] !!result.success:', !!result.success);

      console.log('[DEBUG] Verificação antes do if:', {
        'result.success': result.success,
        'result.data': result.data,
        'typeof result.success': typeof result.success,
        'typeof result.data': typeof result.data
      });

      console.log('[DEBUG] Resposta da API recebida:', result);
      console.log('[DEBUG] result.success:', result.success);
      console.log('[DEBUG] result.data:', result.data);

      if (result.success && result.data) {
        console.log('[DEBUG] Dados recebidos da API:', result.data);
        console.log('[DEBUG] Tipo de result.data:', typeof result.data);
        console.log('[DEBUG] Chaves de result.data:', Object.keys(result.data || {}));
        console.log('[DEBUG] Campos específicos da API:', {
          chave_nota_fiscal: result.data.chave_nota_fiscal,
          numero_nf: result.data.numero_nf,
          serie: result.data.serie,
          data_emissao: result.data.data_emissao,
          valor_total: result.data.valor_total
        });
        
        // Log específico para valor_nota_fiscal
        console.log('[DEBUG] VALOR DA NOTA FISCAL:', result.data.valor_total);
        
        // Map API response to form fields properly - ensure all values are strings
        const mappedData = {
          chave_nota_fiscal: result.data.chave_nota_fiscal || '',
          numero_nota: result.data.numero_nf || '',
          serie_nota: result.data.serie || '',
          data_hora_emissao: result.data.data_emissao ? new Date(result.data.data_emissao).toISOString().split('T')[0] : '',
          natureza_operacao: result.data.natureza_operacao || '',
          // Emitente fields
          emitente_cnpj: result.data.emitente_cnpj || '',
          emitente_razao_social: result.data.emitente_razao_social || '',
          emitente_telefone: result.data.emitente_telefone || '',
          emitente_uf: result.data.emitente_uf || '',
          emitente_cidade: result.data.emitente_cidade || '',
          emitente_bairro: result.data.emitente_bairro || '',
          emitente_endereco: result.data.emitente_endereco || '',
          emitente_numero: result.data.emitente_numero || '',
          emitente_cep: result.data.emitente_cep || '',
          // Destinatário fields  
          destinatario_cnpj: result.data.destinatario_cnpj || '',
          destinatario_razao_social: result.data.destinatario_razao_social || '',
          destinatario_telefone: result.data.destinatario_telefone || '',
          destinatario_uf: result.data.destinatario_uf || '',
          destinatario_cidade: result.data.destinatario_cidade || '',
          destinatario_bairro: result.data.destinatario_bairro || '',
          destinatario_endereco: result.data.destinatario_endereco || '',
          destinatario_numero: result.data.destinatario_numero || '',
          destinatario_cep: result.data.destinatario_cep || '',
          // Financial data
          valor_nota_fiscal: result.data.valor_total || '',
          valor_produtos: result.data.valor_total || '',
          // Volume data
          quantidade_volumes: result.data.quantidade_volumes || '',
          peso_bruto: result.data.peso_bruto || '',
          peso_liquido: result.data.peso_liquido || '',
          // Additional info
          informacoes_complementares: result.data.informacoes_complementares || '',
          numero_pedido: result.data.numero_pedido || ''
        };

        console.log('[DEBUG] Dados mapeados para o formulário:', mappedData);
        console.log('[DEBUG] Campos específicos mapeados:', {
          numero_nota: mappedData.numero_nota,
          serie_nota: mappedData.serie_nota,
          data_hora_emissao: mappedData.data_hora_emissao,
          valor_nota_fiscal: mappedData.valor_nota_fiscal
        });
        
        // Log específico para valor_nota_fiscal no mapeamento
        console.log('[DEBUG] VALOR DA NOTA FISCAL - Mapeamento:');
        console.log('  - result.data.valor_total:', result.data.valor_total);
        console.log('  - mappedData.valor_nota_fiscal:', mappedData.valor_nota_fiscal);
        console.log('  - typeof mappedData.valor_nota_fiscal:', typeof mappedData.valor_nota_fiscal);
        console.log('[DEBUG] Campos específicos:', {
          numero_nota: mappedData.numero_nota,
          serie_nota: mappedData.serie_nota,
          data_hora_emissao: mappedData.data_hora_emissao,
          valor_nota_fiscal: mappedData.valor_nota_fiscal
        });
        
        // Populate form with mapped data
        console.log('[DEBUG] Atualizando estado do formulário com dados mapeados...');
        setFormData(prevData => {
          const newData = {
            ...prevData,
            ...mappedData
          };
          console.log('[DEBUG] Novo estado do formulário:', newData);
          console.log('[DEBUG] Campos específicos no novo estado:', {
            numero_nota: newData.numero_nota,
            serie_nota: newData.serie_nota,
            data_hora_emissao: newData.data_hora_emissao,
            valor_nota_fiscal: newData.valor_nota_fiscal
          });
          
          // Verificar se os campos estão sendo definidos corretamente
          console.log('[DEBUG] Verificação individual dos campos:');
          console.log('  - numero_nota:', mappedData.numero_nota, '->', newData.numero_nota);
          console.log('  - serie_nota:', mappedData.serie_nota, '->', newData.serie_nota);
          console.log('  - data_hora_emissao:', mappedData.data_hora_emissao, '->', newData.data_hora_emissao);
          console.log('  - valor_nota_fiscal:', mappedData.valor_nota_fiscal, '->', newData.valor_nota_fiscal);
          
          // Log específico para valor_nota_fiscal no estado
          console.log('[DEBUG] VALOR DA NOTA FISCAL - Estado do formulário:');
          console.log('  - mappedData.valor_nota_fiscal:', mappedData.valor_nota_fiscal);
          console.log('  - newData.valor_nota_fiscal:', newData.valor_nota_fiscal);
          console.log('  - typeof newData.valor_nota_fiscal:', typeof newData.valor_nota_fiscal);
          console.log('  - newData.valor_nota_fiscal === mappedData.valor_nota_fiscal:', newData.valor_nota_fiscal === mappedData.valor_nota_fiscal);
          
          return newData;
        });

        // Sucesso silencioso ao carregar dados da NFe via Logística da Informação

        // Store data in sessionStorage for other components
        sessionStorage.setItem('nfeData', JSON.stringify(result.data));
        
      } else if (result.nfe_not_found) {
        toast({
          title: "ℹ️ NFe não encontrada",
          description: "A NFe não foi encontrada na base da Logística da Informação. Tente com outra API ou upload manual."
        });
      } else if (result.invalid_xml) {
        toast({
          title: "⚠️ XML inválido",
          description: "O XML retornado não é válido. Tente com outra API."
        });
      } else {
        throw new Error(result.error || 'Erro desconhecido na API Logística da Informação');
      }
    } catch (error: any) {
      console.error('[Frontend] Erro na busca Logística da Informação:', error);
      
      toast({
        title: "❌ Erro na API Logística da Informação",
        description: error.message || 'Erro ao conectar com a API Logística da Informação'
      });
    } finally {
      setIsApiLoading(false);
    }
  };

  // Integração com Meu Danfe: PUT /fd/add/{Chave-Acesso}
  const fetchNFeWithMeuDanfe = async (options?: { addToBatch?: boolean }) => {
    const chave = (formData.chave_nota_fiscal || '').replace(/\D/g, '').trim();
    if (!chave || chave.length !== 44) {
      toast({ title: 'Chave inválida', description: 'Informe 44 dígitos', variant: 'destructive' });
      return;
    }

    setIsApiLoading(true);
    try {
      const apiKey = (import.meta as any).env?.VITE_MEUDANFE_API_KEY || '05077f2a-0bc0-42a5-9ee8-4eff64b5c642';
      const url = `https://api.meudanfe.com.br/v2/fd/add/${chave}`;

      const callApi = async () => {
        const res = await fetch(url, {
          method: 'PUT',
          headers: {
            'Api-Key': apiKey,
            'Accept': 'application/json'
          }
        });
        const json = await res.json();
        console.log('[MeuDanfe] Resposta:', res.status, json);
        return { res, json };
      };

      const { res, json } = await callApi();
      if (!res.ok) {
        if (res.status === 402) {
          toast({ title: 'Saldo insuficiente (402)', description: 'Verifique créditos do Meu Danfe', variant: 'destructive' });
          return;
        }
        if (res.status === 401 || res.status === 403) {
          toast({ title: 'API Key inválida', description: 'Verifique VITE_MEUDANFE_API_KEY', variant: 'destructive' });
          return;
        }
        toast({ title: `Erro HTTP ${res.status}`, description: 'Falha ao adicionar a NFe', variant: 'destructive' });
        return;
      }

      const status = json?.status;
      const statusMessage = json?.statusMessage || '';

      if (status === 'WAITING' || status === 'SEARCHING') {
        await new Promise(r => setTimeout(r, 1100));
        const { res: res2, json: json2 } = await callApi();
        const status2 = json2?.status;
        const msg2 = json2?.statusMessage || '';

        if (status2 === 'OK') {
          // Aguardar um pouco para evitar bloqueio por múltiplas requisições e garantir indexação
          await new Promise(r => setTimeout(r, 1200));
          await fetchXmlFromMeuDanfeAPI(chave, { addToBatch: options?.addToBatch ?? true });
        } else if (status2 === 'NOT_FOUND') {
          toast({ title: 'NFe não encontrada', description: 'Meu Danfe não localizou a NFe', variant: 'destructive' });
        } else if (status2 === 'ERROR') {
          toast({ title: 'Erro Meu Danfe', description: msg2 || 'Falha ao consultar', variant: 'destructive' });
        } else {
          console.log('[MeuDanfe] Solicitação em andamento:', status2 || 'desconhecido');
        }
        return;
      }

      if (status === 'OK') {
        // Após confirmar que a NFe foi adicionada, baixar XML diretamente da Área do Cliente
        await new Promise(r => setTimeout(r, 1200));
        await fetchXmlFromMeuDanfeAPI(chave, { addToBatch: options?.addToBatch ?? true });
      } else if (status === 'NOT_FOUND') {
        toast({ title: 'NFe não encontrada', description: 'Meu Danfe não localizou a NFe', variant: 'destructive' });
      } else if (status === 'ERROR') {
        toast({ title: 'Erro Meu Danfe', description: statusMessage || 'Falha ao consultar', variant: 'destructive' });
      } else {
        console.log('[MeuDanfe] Status não reconhecido:', status || 'desconhecido');
      }
    } catch (error) {
      console.error('[MeuDanfe] Erro na integração:', error);
      toast({ title: 'Erro de conexão', description: 'Falha ao conectar ao Meu Danfe', variant: 'destructive' });
    } finally {
      setIsApiLoading(false);
    }
  };
  // (Removido) fetchXmlWithNSDocs
  
  // Enhanced XML file drop zone with RPA integration
  const handleRPAXmlDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.name.toLowerCase().endsWith('.xml')) {
        processXMLFile(file);
      } else {
        alert('Por favor, selecione apenas arquivos XML baixados do meudanfe.com.br');
      }
    }
  };

  // Process XML content received as text (e.g., via backend scraping)
  const processXMLContent = async (xmlText: string, options?: { addToBatch?: boolean }) => {
    try {
      setIsProcessing(true);
      const addToBatch = options?.addToBatch ?? true;

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

      const extractedData = {
        // Dados da Nota Fiscal
        chave_nota_fiscal: extractNFeKey(xmlDoc) || formData.chave_nota_fiscal || '',
        data_hora_emissao: getXMLValue(xmlDoc, 'dhEmi') || '',
  numero_nota: getXMLValue(xmlDoc, 'ide nNF') || getXMLValue(xmlDoc, 'nNF') || '',
        serie_nota: getXMLValue(xmlDoc, 'serie') || '',
        natureza_operacao: getXMLValue(xmlDoc, 'natOp') || '',
        operacao: sharedFields.operacao || 'Entrada',
        cliente_retira: sharedFields.cliente_retira || 'Não',

        // Dados do Emitente
        emitente_cnpj: getXMLValue(xmlDoc, 'emit CNPJ') || '',
        emitente_razao_social: getXMLValue(xmlDoc, 'emit xNome') || '',
        emitente_telefone: getXMLValue(xmlDoc, 'enderEmit fone') || '',
        emitente_uf: getXMLValue(xmlDoc, 'enderEmit UF') || '',
        emitente_cidade: getXMLValue(xmlDoc, 'enderEmit xMun') || '',
        emitente_bairro: getXMLValue(xmlDoc, 'enderEmit xBairro') || '',
        emitente_endereco: getXMLValue(xmlDoc, 'enderEmit xLgr') || '',
        emitente_numero: getXMLValue(xmlDoc, 'enderEmit nro') || '',
        emitente_cep: getXMLValue(xmlDoc, 'enderEmit CEP') || '',

        // Dados do Destinatário
        destinatario_cnpj: getXMLValue(xmlDoc, 'dest CNPJ') || getXMLValue(xmlDoc, 'dest CPF') || '',
        destinatario_razao_social: getXMLValue(xmlDoc, 'dest xNome') || '',
        destinatario_telefone: getXMLValue(xmlDoc, 'enderDest fone') || '',
        destinatario_uf: getXMLValue(xmlDoc, 'enderDest UF') || '',
        destinatario_cidade: getXMLValue(xmlDoc, 'enderDest xMun') || '',
        destinatario_bairro: getXMLValue(xmlDoc, 'enderDest xBairro') || '',
        destinatario_endereco: getXMLValue(xmlDoc, 'enderDest xLgr') || '',
        destinatario_numero: getXMLValue(xmlDoc, 'enderDest nro') || '',
        destinatario_cep: getXMLValue(xmlDoc, 'enderDest CEP') || '',

        // Informações Adicionais
        quantidade_volumes: getXMLValue(xmlDoc, 'vol qVol') || getXMLValue(xmlDoc, 'transp qVol') || '',
        valor_nota_fiscal: getXMLValue(xmlDoc, 'ICMSTot vNF') || '',
        peso_bruto: getXMLValue(xmlDoc, 'vol pesoB') || '',
        informacoes_complementares: getXMLValue(xmlDoc, 'infAdic infCpl') || '',
        numero_pedido: getXMLValue(xmlDoc, 'det prod xPed') || '',
        tipo_frete: getXMLValue(xmlDoc, 'transp modFrete') || sharedFields.tipo_frete || 'CIF',
        custo_extra: sharedFields.custo_extra || ''
      };

      setFormData(extractedData);

      // Atualiza notas já existentes no lote com o XML, mesmo quando addToBatch = false
      try {
        const matchKey = extractedData.chave_nota_fiscal || extractedData.numero_nota || '';
        if (matchKey) {
          setBatchInvoices(prev => prev.map(inv => {
            const invMatchKey = inv.chave_nota_fiscal || inv.numero_nota || '';
            if (invMatchKey === matchKey) {
              return {
                ...inv,
                // Preenche campos vazios com dados extraídos
                numero_nota: inv.numero_nota || extractedData.numero_nota,
                serie_nota: inv.serie_nota || extractedData.serie_nota,
                data_hora_emissao: inv.data_hora_emissao || extractedData.data_hora_emissao,
                emitente_cnpj: inv.emitente_cnpj || extractedData.emitente_cnpj,
                destinatario_cnpj: inv.destinatario_cnpj || extractedData.destinatario_cnpj,
                quantidade_volumes: inv.quantidade_volumes || extractedData.quantidade_volumes,
                valor_nota_fiscal: inv.valor_nota_fiscal || extractedData.valor_nota_fiscal,
                peso_bruto: inv.peso_bruto || extractedData.peso_bruto,
                informacoes_complementares: inv.informacoes_complementares || extractedData.informacoes_complementares,
                // Armazena XML bruto para permitir download
                xmlContent: xmlText,
                xml_content: xmlText
              };
            }
            return inv;
          }));

          // Também atualiza array auxiliar invoiceBatch, se estiver em uso
          setInvoiceBatch(prev => prev.map(inv => {
            const invMatchKey = inv.chave_nota_fiscal || inv.numero_nota || '';
            if (invMatchKey === matchKey) {
              return {
                ...inv,
                xmlContent: xmlText,
                xml_content: xmlText
              };
            }
            return inv;
          }));
        }
      } catch (e) {
        console.warn('Falha ao atualizar lote com XML obtido:', e);
      }

      const processedInvoice = {
        ...extractedData,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        data_processamento: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        xmlContent: xmlText,
        xml_content: xmlText,
        operacao: extractedData.operacao || sharedFields.operacao,
        cliente_retira: extractedData.cliente_retira || sharedFields.cliente_retira,
        tipo_frete: extractedData.tipo_frete || sharedFields.tipo_frete,
        custo_extra: extractedData.custo_extra || sharedFields.custo_extra,
        status: 'pendente'
      };

      if (addToBatch) {
        const existingVolumeData = batchVolumeData.find(item => item.numeroNota === extractedData.numero_nota);
        if (!existingVolumeData) {
          const quantidadeVolumes = parseInt(extractedData.quantidade_volumes || '1') || 1;
          const volumes = Array.from({ length: quantidadeVolumes }, (_, index) => ({
            volume: index + 1,
            altura: 0,
            largura: 0,
            comprimento: 0,
            m3: 0
          }));

          const notaVolumeData: NotaVolumeData = {
            notaId: processedInvoice.id,
            numeroNota: extractedData.numero_nota,
            volumes: volumes,
            totalM3: 0,
            pesoTotal: parseFloat(extractedData.peso_bruto || '0') || 0
          };
          setBatchVolumeData(prev => [...prev, notaVolumeData]);
        }

        setBatchInvoices(prev => [...prev, processedInvoice]);

        const existingProcessed = JSON.parse(localStorage.getItem('processedInvoices') || '[]');
        const updatedProcessed = [...existingProcessed, processedInvoice];
        localStorage.setItem('processedInvoices', JSON.stringify(updatedProcessed));
        setProcessedInvoices(updatedProcessed);

        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 3000);
      } else {
        // preenchimento silencioso do formulário
      }
    } catch (error) {
      console.error('[MeuDanfe] Falha ao processar XML:', error);
      toast({ title: 'Erro ao processar XML', description: 'Falha ao processar conteúdo do Meu Danfe', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Fetch XML via backend scraper endpoint and process it
  const fetchXmlFromMeuDanfeBackend = async (overrideKey?: string, options?: { addToBatch?: boolean }) => {
    const chave = (overrideKey || formData.chave_nota_fiscal || '').replace(/\D/g, '').trim();
    if (!chave || chave.length !== 44) {
      toast({ title: 'Chave inválida', description: 'Informe 44 dígitos', variant: 'destructive' });
      return;
    }

    try {
      console.log('[Frontend] Solicitando XML via backend scraper Meu Danfe para chave:', chave);
      const response = await fetch('/api/xml/fetch-from-meudanfe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chaveNotaFiscal: chave })
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('[Frontend] Resposta do scraper Meu Danfe:', result);

      if (result.success && result.xml_content) {
        await processXMLContent(result.xml_content, { addToBatch: options?.addToBatch ?? true });
      } else {
        toast({ title: 'Erro ao obter XML', description: result.error || 'Não foi possível obter o XML via Meu Danfe', variant: 'destructive' });
      }
    } catch (error) {
      console.error('[MeuDanfe] Erro ao buscar XML via backend:', error);
      toast({ title: 'Erro de conexão (backend)', description: 'Falha ao obter XML do Meu Danfe via backend', variant: 'destructive' });
    }
  };

  // Extract XML string from variable JSON response shapes from Meu Danfe
  const extractXmlFromMeuDanfeResponse = (json: any): string | null => {
    if (!json) return null;
    const candidates: any[] = [
      json?.xml,
      json?.xml_content,
      json?.content,
      json?.xmlText,
      json?.data?.xml,
      json?.data?.xml_content,
      json?.payload?.xml
    ];
    for (const val of candidates) {
      if (typeof val === 'string' && val.includes('<?xml')) return val;
    }
    // Fallback: scan all string fields
    try {
      for (const [key, value] of Object.entries(json)) {
        if (typeof value === 'string' && value.includes('<?xml')) return value;
        if (typeof value === 'object' && value) {
          const nested = extractXmlFromMeuDanfeResponse(value);
          if (nested) return nested;
        }
      }
    } catch {}
    return null;
  };

  // Official Meu Danfe GET to download XML from Customer Area
  const fetchXmlFromMeuDanfeAPI = async (overrideKey?: string, options?: { addToBatch?: boolean }) => {
    const chave = (overrideKey || formData.chave_nota_fiscal || '').replace(/\D/g, '').trim();
    if (!chave || chave.length !== 44) {
      toast({ title: 'Chave inválida', description: 'Informe 44 dígitos', variant: 'destructive' });
      return;
    }

    try {
      const apiKey = (import.meta as any).env?.VITE_MEUDANFE_API_KEY || '05077f2a-0bc0-42a5-9ee8-4eff64b5c642';
      const url = `https://api.meudanfe.com.br/v2/fd/get/xml/${chave}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Api-Key': apiKey,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) {
        throw new Error(`Erro HTTP Meu Danfe GET: ${res.status}`);
      }

      const json = await res.json();
      console.log('[MeuDanfe] GET xml response:', json);
      const xml = extractXmlFromMeuDanfeResponse(json);
      if (xml && xml.includes('<?xml')) {
        await processXMLContent(xml, { addToBatch: options?.addToBatch ?? true });
      } else {
        toast({ title: 'Sem XML na resposta', description: 'Meu Danfe não retornou XML', variant: 'destructive' });
      }
    } catch (error) {
      console.error('[MeuDanfe] Erro no GET xml:', error);
      toast({ title: 'Erro ao baixar XML', description: 'Falha na API Meu Danfe', variant: 'destructive' });
    }
  };

  // Fluxo automático: busca XML e adiciona ao lote, sem popups
  const autoFetchAndAddToBatch = async (key: string) => {
    try {
      setIsApiLoading(true);
      handleInputChange('chave_nota_fiscal', key);
      // Se houver uma nota atual no formulário, mover para o mockup antes de preencher a nova
      enqueueCurrentInvoiceToBatch();
      // Adicionar a NFe via Meu Danfe e baixar o XML, preenchendo apenas o formulário
      await fetchNFeWithMeuDanfe({ addToBatch: false });
    } finally {
      setIsApiLoading(false);
    }
  };

  // Simplified barcode detection using Tesseract.js OCR
  const detectBarcodeFromCanvas = async (imageSrc: string): Promise<string | null> => {
    try {
      console.log('🔍 Starting OCR detection...');
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('eng');
      
      await worker.setParameters({
        tessedit_char_whitelist: '0123456789'
      });

      const { data: { text } } = await worker.recognize(imageSrc);
      await worker.terminate();

      console.log('📝 OCR extracted text:', text);
      
      // Look for 44-digit sequences in the extracted text
      const numbers = text.replace(/\D/g, '');
      console.log('🔢 Numeric sequence found:', numbers);
      
      if (numbers.length >= 44) {
        // Extract the first 44 digits
        const nfeKey = numbers.substring(0, 44);
        console.log('✅ Found 44-digit NFe key via OCR:', nfeKey);
        return nfeKey;
      }
      
      return null;
    } catch (error) {
      console.log('❌ OCR detection failed:', error);
      return null;
    }
  };

  // Haptic feedback utility function
  const triggerHapticFeedback = (pattern: number[] = [200, 100, 200]) => {
    // Trigger haptic vibration on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
    
    // Visual feedback for devices without haptic support
    const flashElement = document.createElement('div');
    flashElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(34, 197, 94, 0.3);
      z-index: 9999;
      pointer-events: none;
      animation: flashSuccess 0.6s ease-out;
    `;
    
    // Add CSS animation if not already present
    if (!document.getElementById('haptic-styles')) {
      const style = document.createElement('style');
      style.id = 'haptic-styles';
      style.textContent = `
        @keyframes flashSuccess {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(flashElement);
    setTimeout(() => {
      document.body.removeChild(flashElement);
    }, 600);
  };

  // QuaggaJS initialization optimized for CODE-128 barcode scanning
  const initQuaggaScanner = () => {
    if (!quaggaContainerRef.current) {
      console.error('QuaggaJS container not found');
      setCameraError('Erro: Container da câmera não encontrado');
      return;
    }

    console.log('Initializing QuaggaJS scanner for CODE-128...');

    const config = {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: quaggaContainerRef.current,
        constraints: {
          width: 640,
          height: 480,
          facingMode: "environment"
        }
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: 4,
      frequency: 10,
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader", 
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader"
        ]
      },
      locate: true
    };

    Quagga.init(config, (err: any) => {
      if (err) {
        console.error('QuaggaJS initialization failed:', err);
        setCameraError('QuaggaJS não suportado. Usando câmera padrão...');
        setQuaggaInitialized(false);
        setTimeout(() => {
          setCameraError(null);
          startContinuousScanning();
        }, 1000);
        return;
      }
      
      console.log('✅ QuaggaJS initialized successfully');
      console.log('📹 Starting QuaggaJS camera...');
      setQuaggaInitialized(true);
      setCameraError(null);
      
      try {
        Quagga.start();
        console.log('✅ QuaggaJS camera started successfully');
        console.log('🔍 QuaggaJS is now scanning for barcodes...');
        console.log('📊 Supported formats:', config.decoder.readers);
        
        // Add a test callback to see if scanning is working
        setTimeout(() => {
          console.log('🔍 QuaggaJS status check: Camera should be active and scanning');
        }, 2000);
        
      } catch (startError) {
        console.error('QuaggaJS start failed:', startError);
        setCameraError('Câmera não disponível. Tentando método alternativo...');
        setQuaggaInitialized(false);
        setTimeout(() => {
          setCameraError(null);
          startContinuousScanning();
        }, 1000);
      }
    });

    // Set up detection handler
    Quagga.onDetected(handleQuaggaDetection);
  };

  // Enhanced QuaggaJS detection handler with comprehensive barcode support
  const handleQuaggaDetection = (result: any) => {
    const code = result.codeResult.code;
    const format = result.codeResult.format;
    
    console.log('🔍 QuaggaJS detected:', {
      code,
      format,
      length: code?.length || 0,
      rawResult: result
    });
    
    if (!code) return;
    
    const codeString = String(code).trim();
    
    // Log every detection for debugging
    console.log(`📊 Barcode detected: "${codeString}" (${format}) - Length: ${codeString.length}`);
    
    // Handle different types of barcodes that might contain NFe data
    
    // 1. Direct 44-digit NFe key
    if (codeString.length === 44 && /^\d+$/.test(codeString)) {
      if (codeString === lastScannedCode) {
        console.log('⚠️ Duplicate detection ignored');
        return;
      }
      
      setLastScannedCode(codeString);
      console.log('✅ Perfect 44-digit NFe key detected:', codeString);
      
      triggerHapticFeedback();
      if (autoAddToBatch) {
        // Não parar o scanner: adiciona automaticamente ao lote
        void autoFetchAndAddToBatch(codeString);
      } else {
        // Preenche o campo e mantém controle manual
        handleInputChange('chave_nota_fiscal', codeString);
        toast({ title: 'Código NFe detectado', description: codeString });
        // Buscar automaticamente na API Meu Danfe para preencher o formulário
        void fetchNFeWithMeuDanfe({ addToBatch: false });
      }
      return;
    }
    
    // 2. Look for 44-digit sequences within longer codes
    const nfeMatch = codeString.match(/\d{44}/);
    if (nfeMatch) {
      const extractedKey = nfeMatch[0];
      if (extractedKey === lastScannedCode) {
        console.log('⚠️ Duplicate extraction ignored');
        return;
      }
      
      setLastScannedCode(extractedKey);
      console.log('✅ NFe key extracted from longer code:', extractedKey);
      
      triggerHapticFeedback();
      if (autoAddToBatch) {
        void autoFetchAndAddToBatch(extractedKey);
      } else {
        handleInputChange('chave_nota_fiscal', extractedKey);
        toast({ title: 'Chave NFe extraída', description: extractedKey });
        // Buscar automaticamente na API Meu Danfe para preencher o formulário
        void fetchNFeWithMeuDanfe({ addToBatch: false });
      }
      return;
    }
    
    // 3. Handle codes close to 44 digits (potential partial reads)
    if (codeString.length >= 35 && codeString.length <= 50 && /^\d+$/.test(codeString)) {
      console.log(`🔍 Potential partial NFe key (${codeString.length} digits):`, codeString);
      
      // If it's 43 or 45 digits, might be missing/extra digit
      if (codeString.length === 43) {
        console.log('⚠️ 43-digit code detected - might be missing one digit');
      } else if (codeString.length === 45) {
        console.log('⚠️ 45-digit code detected - might have one extra digit');
      }
    }
    
    // 4. Log all other detections for analysis
    if (codeString.length > 10) {
      console.log(`📝 Other code detected: Format=${format}, Length=${codeString.length}, Content="${codeString.substring(0, 20)}..."`);
    } else {
      console.log(`📝 Short code detected: "${codeString}" (${format})`);
    }
    
    // Continue scanning for more codes
  };

  // Stop QuaggaJS scanner
  const stopQuaggaScanner = () => {
    if (quaggaInitialized) {
      Quagga.stop();
      Quagga.offDetected(handleQuaggaDetection);
      setQuaggaInitialized(false);
    }
  };

  // Start QuaggaJS scanner
  const startQuaggaScanner = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    setLastScannedCode('');
    
    // Check camera permissions first
    try {
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
        .then(stream => {
          // Stop the test stream
          stream.getTracks().forEach(track => track.stop());
        });
    } catch (permissionError) {
      console.error('Camera permission error:', permissionError);
      setCameraError('Acesso à câmera negado. Verifique as permissões do navegador.');
      setIsCameraOpen(false);
      return;
    }
    
    // Initialize QuaggaJS after ensuring permissions
    setTimeout(() => {
      initQuaggaScanner();
    }, 300);
  };

  // Check camera permissions
  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (error) {
      setHasPermission(false);
      return false;
    }
  };

  // Barcode scanning functions
  const startBarcodeScanning = async () => {
    await startContinuousScanning();
  };

  const stopBarcodeScanning = () => {
    stopContinuousScanning();
    setIsCameraOpen(false);
    setIsScanning(false);
  };

  // Cleanup scanning interval and QuaggaJS on component unmount
  useEffect(() => {
    return () => {
      if (scanningInterval) {
        clearInterval(scanningInterval);
      }
      stopQuaggaScanner();
    };
  }, [scanningInterval]);

  // Continuous QR/barcode scanning with automatic processing
  const performContinuousScanning = async () => {
    if (!webcamRef.current || !continuousScanning) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      console.log('❌ No image captured from webcam');
      return;
    }
    
    console.log('📸 Captured image for scanning');
    
    try {
      let detectedCode: string | null = null;

          // Enhanced detection with multiple formats for all mobile devices (Android/iOS)
          if ('BarcodeDetector' in window) {
            console.log('🔍 Using BarcodeDetector API...');
            const barcodeDetector = new (window as any).BarcodeDetector({
              formats: ['code_128', 'qr_code', 'ean_13', 'ean_8', 'code_39', 'code_93', 'itf', 'pdf417', 'data_matrix']
            });
            
            const img = new Image();
            await new Promise((resolve) => {
              img.onload = async () => {
                try {
                  const barcodes = await barcodeDetector.detect(img);
                  console.log('🔍 BarcodeDetector found:', barcodes?.length || 0, 'codes');
                  
                  if (barcodes && barcodes.length > 0) {
                    for (let i = 0; i < barcodes.length; i++) {
                      console.log(`📊 Barcode ${i + 1}:`, barcodes[i]?.rawValue, 'Format:', barcodes[i]?.format);
                    }
                    if (barcodes[0]?.rawValue) {
                      detectedCode = String(barcodes[0].rawValue);
                    }
                  }
                } catch (error) {
                  console.log('❌ BarcodeDetector failed:', error);
                }
                resolve(true);
              };
              img.onerror = () => {
                console.log('❌ Image load error');
                resolve(true);
              };
              img.src = imageSrc;
            });
          } else {
            console.log('❌ BarcodeDetector not supported in this browser');
          }

          // Method 2: Advanced Canvas-based barcode detection for CODE-128
          if (!detectedCode) {
            try {
              console.log('🔍 Trying advanced canvas detection...');
              detectedCode = await detectBarcodeFromCanvas(imageSrc);
              if (detectedCode) {
                console.log('✅ Canvas detection found:', detectedCode);
              } else {
                console.log('❌ Canvas detection found no codes');
              }
            } catch (error) {
              console.log('❌ Canvas detection failed:', error instanceof Error ? error.message : String(error));
            }
          }

          // Method 3: Legacy ZXing library as additional fallback
          if (!detectedCode) {
            try {
              console.log('🔍 Trying legacy ZXing library...');
              const { BrowserMultiFormatReader } = await import('@zxing/library');
              const codeReader = new BrowserMultiFormatReader();
              
              const img = document.createElement('img');
              img.crossOrigin = 'anonymous';
              
              await new Promise((resolve) => {
                img.onload = async () => {
                  try {
                    const result = await codeReader.decodeFromImageElement(img);
                    if (result && result.getText()) {
                      detectedCode = result.getText();
                      console.log('✅ Legacy ZXing detected:', detectedCode);
                    } else {
                      console.log('❌ Legacy ZXing found no codes');
                    }
                  } catch (error) {
                    console.log('❌ Legacy ZXing detection failed:', error instanceof Error ? error.message : String(error));
                  }
                  resolve(true);
                };
                img.onerror = () => {
                  console.log('❌ Legacy ZXing image load error');
                  resolve(true);
                };
                img.src = imageSrc;
              });
            } catch (importError) {
              console.log('❌ Legacy ZXing library import failed:', importError);
            }
          }

          // Debug: Log all detection attempts
          console.log('🔍 Scanning attempt - Code detected:', detectedCode, 'Type:', typeof detectedCode);
          if (detectedCode) {
            console.log('🔍 Code length:', String(detectedCode).length, 'Content:', String(detectedCode).substring(0, 20) + '...');
          }

          // Process detected code
          if (detectedCode && detectedCode !== lastScannedCode) {
            setLastScannedCode(detectedCode);
            console.log('✅ New code detected, processing...', detectedCode);
            
            const codeString = String(detectedCode).trim();
            
            // Validate NFe key format (44 digits)
            if (codeString.length === 44 && /^\d+$/.test(codeString)) {
              console.log('✅ Valid 44-digit NFe key detected:', codeString);
              
              // Trigger haptic feedback for successful scan
              triggerHapticFeedback();
              
              if (batchMode) {
                addScannedKey(codeString);
                // permanece escaneando continuamente
              } else {
                stopContinuousScanning();
                setIsCameraOpen(false);
                handleInputChange('chave_nota_fiscal', codeString);
                alert('✅ Código detectado e preenchido automaticamente!');
                // Optionally trigger automatic XML fetch
                if (window.confirm('Deseja buscar automaticamente os dados da NFe com este código?')) {
                  setTimeout(() => {
                    fetchXmlFromMeuDanfeAPI(codeString);
                  }, 500);
                }
              }
            } else if (codeString.length > 10) {
              console.log('🔍 Searching for NFe key in longer code:', codeString);
              // Handle QR codes that might contain NFe data
              const nfeMatch = codeString.match(/\d{44}/);
              if (nfeMatch) {
                const extractedKey = nfeMatch[0];
                console.log('✅ NFe key extracted:', extractedKey);
                
                // Trigger haptic feedback for successful extraction
                triggerHapticFeedback();
                
                if (batchMode) {
                  addScannedKey(extractedKey);
                } else {
                  stopContinuousScanning();
                  setIsCameraOpen(false);
                  handleInputChange('chave_nota_fiscal', extractedKey);
                  alert('✅ Chave NFe extraída do código e preenchida automaticamente!');
                  if (window.confirm('Deseja buscar automaticamente os dados da NFe?')) {
                    setTimeout(() => {
                      fetchXmlFromMeuDanfeAPI(extractedKey);
                    }, 500);
                  }
                }
              } else {
                console.log('❌ No 44-digit sequence found in code:', codeString);
                alert('Código detectado mas não contém chave NFe válida: ' + codeString.substring(0, 30));
              }
            } else {
              console.log('❌ Code too short:', codeString);
              alert('Código muito curto detectado: ' + codeString);
            }
          } else if (detectedCode) {
            console.log('🔄 Same code detected again, ignoring to prevent duplicates');
          } else {
            console.log('❌ No code detected in this scan attempt');
          }
    } catch (error) {
      console.error('Scanning error:', error);
    }
  };

  // Start continuous scanning
  const startContinuousScanning = async () => {
    const hasAccess = await checkCameraPermission();
    if (hasAccess) {
      setIsCameraOpen(true);
      setContinuousScanning(true);
      setLastScannedCode('');
      
      // Start scanning after a brief delay to allow camera to initialize
      setTimeout(() => {
        const interval = setInterval(performContinuousScanning, 100); // Scan every 100ms for much faster detection
        setScanningInterval(interval);
      }, 1000);
    } else {
      alert('Acesso à câmera negado. Verifique as permissões do navegador.');
    }
  };

  // Stop continuous scanning
  const stopContinuousScanning = () => {
    setContinuousScanning(false);
    if (scanningInterval) {
      clearInterval(scanningInterval);
      setScanningInterval(null);
    }
  };

  // Legacy manual capture function (kept for fallback)
  const captureAndScanBarcode = async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        try {
          setIsScanning(true);
          
          // Enhanced detection logic with debug logging
          let detectedCode: string | null = null;
          console.log('📸 Manual capture initiated, processing image...');

          // Method 1: Native BarcodeDetector API
          if ('BarcodeDetector' in window) {
            console.log('🔍 Using BarcodeDetector API...');
            const barcodeDetector = new (window as any).BarcodeDetector({
              formats: ['code_128', 'qr_code', 'ean_13', 'ean_8', 'code_39', 'code_93', 'itf', 'pdf417', 'data_matrix']
            });
            
            const img = new Image();
            await new Promise((resolve) => {
              img.onload = async () => {
                try {
                  const barcodes = await barcodeDetector.detect(img);
                  console.log('🔍 BarcodeDetector results:', barcodes);
                  if (barcodes && barcodes.length > 0 && barcodes[0]?.rawValue) {
                    detectedCode = String(barcodes[0].rawValue);
                    console.log('✅ BarcodeDetector found code:', detectedCode);
                  }
                } catch (error) {
                  console.log('❌ BarcodeDetector failed:', error);
                }
                resolve(true);
              };
              img.src = imageSrc;
            });
          }

          // Method 2: ZXing fallback
          if (!detectedCode) {
            try {
              console.log('🔍 Using ZXing fallback...');
              const { BrowserMultiFormatReader } = await import('@zxing/library');
              const codeReader = new BrowserMultiFormatReader();
              
              const img = document.createElement('img');
              img.crossOrigin = 'anonymous';
              
              await new Promise((resolve) => {
                img.onload = async () => {
                  try {
                    const result = await codeReader.decodeFromImageElement(img);
                    if (result && result.getText()) {
                      detectedCode = result.getText();
                      console.log('✅ ZXing found code:', detectedCode);
                    }
                  } catch (error) {
                    console.log('❌ ZXing detection failed:', error);
                  }
                  resolve(true);
                };
                img.onerror = () => {
                  console.log('❌ Image load error');
                  resolve(true);
                };
                img.src = imageSrc;
              });
            } catch (importError) {
              console.log('❌ ZXing library not available:', importError);
            }
          }

          setIsScanning(false);
          console.log('📊 Final detection result:', detectedCode);

          if (detectedCode && typeof detectedCode === 'string') {
            const codeString = String(detectedCode).trim();
            console.log('📋 Processing detected code:', codeString, 'Length:', codeString.length);
            
            if (codeString.length === 44 && /^\d+$/.test(codeString)) {
              console.log('✅ Valid 44-digit NFe key - manual capture');
              
              // Trigger haptic feedback for successful manual scan
              triggerHapticFeedback();
              
              handleInputChange('chave_nota_fiscal', codeString);
              setIsCameraOpen(false);
              // Sucesso silencioso ao inserir chave lida
            } else {
              const nfeMatch = codeString.match(/\d{44}/);
              if (nfeMatch) {
                console.log('✅ NFe key extracted from longer code - manual capture');
                
                // Trigger haptic feedback for successful extraction
                triggerHapticFeedback();
                
                handleInputChange('chave_nota_fiscal', nfeMatch[0]);
                setIsCameraOpen(false);
                // Sucesso silencioso ao extrair e inserir chave
              } else {
                console.log('❌ No valid NFe key found in detected code');
                // Silencioso: não exibir popup
              }
            }
          } else {
            console.log('❌ No code detected in manual capture');
            // Silencioso: não exibir popup
          }
        } catch (error) {
          setIsScanning(false);
          // Silencioso: não exibir popup
        }
      }
    }
  };



  // Handle form submission with validation and animations
  const handleSubmit = () => {
    const errors: Record<string, boolean> = {};
    
    // Validate required fields
    if (!formData.numero_nota) errors.numero_nota = true;
    if (!formData.chave_nota_fiscal) errors.chave_nota_fiscal = true;
    if (!formData.emitente_cnpj) errors.emitente_cnpj = true;
    if (!formData.destinatario_cnpj) errors.destinatario_cnpj = true;
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      // Trigger shake animation for error fields
      setTimeout(() => setFormErrors({}), 600);
      return;
    }
    
    // Show success animation
    setShowSuccessAnimation(true);
    
    if (isEditingNFe) {
      console.log('Salvando edição da NFe:', formData);
      
      // Save edited NFe back to main system
      const editedNota = {
        ...formData,
        id: editingNotaId,
        data_processamento: new Date().toISOString(),
        status: 'editada'
      };
      
      // Save volumes data if available
      const volumesData = localStorage.getItem('volumesData');
      if (volumesData) {
        const volumes = JSON.parse(volumesData);
        if (volumes.length > 0) {
          (editedNota as any).volumes = volumes[0].volumes;
        }
      }
      
      // Persiste no Supabase (update se id disponível; senão, cria)
      (async () => {
        try {
          const payload = mapFormToSchema(editedNota as any);
          if (editingNotaId) {
            try {
              await supabaseUpdate(String(editingNotaId), payload);
            } catch {
              await supabaseCreate(payload);
            }
          } else {
            await supabaseCreate(payload);
          }
          setShowSuccessAnimation(false);
          toast({ title: 'Edição salva', description: 'Nota fiscal salva no banco de dados.' });
          setLocation('/coletas/nova-ordem');
        } catch (e: any) {
          setShowSuccessAnimation(false);
          toast({ title: 'Erro ao salvar edição', description: e?.message || 'Falha ao salvar no banco', variant: 'destructive' });
        }
      })();
      
    } else {
      console.log('Salvando nova nota fiscal:', formData);
      
      // Salva no Supabase e mantém busca local
      (async () => {
        try {
          const payload = mapFormToSchema(formData);
          const inserted = await supabaseCreate(payload);
          const savedInvoices = JSON.parse(localStorage.getItem('processedInvoices') || '[]');
          const newInvoice = {
            ...formData,
            id: inserted?.id || `NF-${Date.now()}`,
            data_processamento: new Date().toISOString(),
            status: 'processada'
          };
          const updated = [...savedInvoices, newInvoice];
          localStorage.setItem('processedInvoices', JSON.stringify(updated));
          setProcessedInvoices(updated);
          setShowSuccessAnimation(false);
          handleClearForm();
          toast({ title: 'Nota salva', description: 'Nota fiscal salva no banco e listada para consulta.' });
        } catch (e: any) {
          setShowSuccessAnimation(false);
          toast({ title: 'Erro ao salvar', description: e?.message || 'Falha ao salvar nota.', variant: 'destructive' });
        }
      })();
    }
  };

  // Clear form
  const handleClearForm = () => {
    setFormData({
      // Dados da Nota Fiscal
      chave_nota_fiscal: '',
      data_hora_emissao: '',
      numero_nota: '',
      serie_nota: '',
      natureza_operacao: '',
      operacao: '',
      cliente_retira: '',
      
      // Dados do Emitente
      emitente_cnpj: '',
      emitente_razao_social: '',
      emitente_telefone: '',
      emitente_uf: '',
      emitente_cidade: '',
      emitente_bairro: '',
      emitente_endereco: '',
      emitente_numero: '',
      emitente_cep: '',
      
      // Dados do Destinatário
      destinatario_cnpj: '',
      destinatario_razao_social: '',
      destinatario_telefone: '',
      destinatario_uf: '',
      destinatario_cidade: '',
      destinatario_bairro: '',
      destinatario_endereco: '',
      destinatario_numero: '',
      destinatario_cep: '',
      
      // Informações Adicionais
      quantidade_volumes: '',
      valor_nota_fiscal: '',
      peso_bruto: '',
      informacoes_complementares: '',
      numero_pedido: '',
      tipo_frete: 'CIF',
      custo_extra: ''
    });
    setXmlFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Volume/Cubage state management

  const [batchVolumeData, setBatchVolumeData] = useState<NotaVolumeData[]>([]);
    const [showVolumeModal, setShowVolumeModal] = useState(false);
    // Ajuda contextual: colapsada por padrão
    const [showXmlBatchHelp, setShowXmlBatchHelp] = useState(false);
    const [showApiHelp, setShowApiHelp] = useState(false);
  const [currentVolumeNota, setCurrentVolumeNota] = useState<string>('');

  const [consultaViewMode, setConsultaViewMode] = useState<'list' | 'cards'>('list');

  // Submissão para Supabase
  const { handleSubmit: supabaseCreate, handleUpdate: supabaseUpdate } = useFormSubmission();

  // Mapeia dados do formulário atual para o schema do hook
  const mapFormToSchema = (data: typeof formData) => {
    return {
      numeroNF: data.numero_nota || '',
      serieNF: data.serie_nota || '',
      chaveNF: data.chave_nota_fiscal || '',
      valorTotal: data.valor_nota_fiscal || '',
      pesoBruto: data.peso_bruto || '',
      quantidadeVolumes: data.quantidade_volumes || '',
      dataEmissao: data.data_hora_emissao || '',
      tipoOperacao: data.natureza_operacao || data.operacao || '',

      emitenteCnpj: data.emitente_cnpj || '',
      emitenteRazaoSocial: data.emitente_razao_social || '',
      emitenteTelefone: data.emitente_telefone || '',
      emitenteUf: data.emitente_uf || '',
      emitenteCidade: data.emitente_cidade || '',
      emitenteBairro: data.emitente_bairro || '',
      emitenteEndereco: data.emitente_endereco || '',
      emitenteNumero: data.emitente_numero || '',
      emitenteCep: data.emitente_cep || '',

      destinatarioCnpj: data.destinatario_cnpj || '',
      destinatarioRazaoSocial: data.destinatario_razao_social || '',
      destinatarioTelefone: data.destinatario_telefone || '',
      destinatarioUf: data.destinatario_uf || '',
      destinatarioCidade: data.destinatario_cidade || '',
      destinatarioBairro: data.destinatario_bairro || '',
      destinatarioEndereco: data.destinatario_endereco || '',
      destinatarioNumero: data.destinatario_numero || '',
      destinatarioCep: data.destinatario_cep || '',

      numeroPedido: data.numero_pedido || '',
      informacoesComplementares: data.informacoes_complementares || '',
      fobCif: data.tipo_frete || '',

      quimico: 'nao',
      fracionado: 'nao',
      observacoes: ''
    } as any;
  };

  // Mapeia item do lote para o schema
  const mapInvoiceToSchema = (invoice: any) => {
    return {
      numeroNF: invoice.numero_nota || '',
      serieNF: invoice.serie_nota || '',
      chaveNF: invoice.chave_nota_fiscal || '',
      valorTotal: invoice.valor_nota_fiscal || '',
      pesoBruto: invoice.peso_bruto || '',
      quantidadeVolumes: invoice.quantidade_volumes || invoice.volumes_totais || '',
      dataEmissao: invoice.data_hora_emissao || '',
      tipoOperacao: invoice.natureza_operacao || invoice.operacao || '',

      emitenteCnpj: invoice.emitente_cnpj || '',
      emitenteRazaoSocial: invoice.emitente_razao_social || '',
      emitenteTelefone: invoice.emitente_telefone || '',
      emitenteUf: invoice.emitente_uf || '',
      emitenteCidade: invoice.emitente_cidade || '',
      emitenteBairro: invoice.emitente_bairro || '',
      emitenteEndereco: invoice.emitente_endereco || '',
      emitenteNumero: invoice.emitente_numero || '',
      emitenteCep: invoice.emitente_cep || '',

      destinatarioCnpj: invoice.destinatario_cnpj || '',
      destinatarioRazaoSocial: invoice.destinatario_razao_social || '',
      destinatarioTelefone: invoice.destinatario_telefone || '',
      destinatarioUf: invoice.destinatario_uf || '',
      destinatarioCidade: invoice.destinatario_cidade || '',
      destinatarioBairro: invoice.destinatario_bairro || '',
      destinatarioEndereco: invoice.destinatario_endereco || '',
      destinatarioNumero: invoice.destinatario_numero || '',
      destinatarioCep: invoice.destinatario_cep || '',

      numeroPedido: invoice.numero_pedido || '',
      informacoesComplementares: invoice.informacoes_complementares || '',
      fobCif: invoice.tipo_frete || '',

      quimico: 'nao',
      fracionado: 'nao'
    } as any;
  };

  // Salva uma nota do lote no Supabase e atualiza status
  const saveInvoiceToSupabase = async (invoice: any) => {
    const key = invoice.numero_nota || invoice.chave_nota_fiscal || `NF-${Date.now()}`;
    setBatchProcessingStatus(prev => ({ ...prev, [key]: 'processing' }));
    try {
      const payload = mapInvoiceToSchema(invoice);
      const result = await supabaseCreate(payload);
      setBatchInvoices(prev => prev.map(inv => {
        const match = (inv.numero_nota || inv.chave_nota_fiscal) === (invoice.numero_nota || invoice.chave_nota_fiscal);
        return match ? { ...inv, supabase_id: result?.id } : inv;
      }));
      setBatchProcessingStatus(prev => ({ ...prev, [key]: 'completed' }));
      toast({ title: 'Nota salva', description: `NF ${invoice.numero_nota} salva no banco.` });
    } catch (err: any) {
      setBatchProcessingStatus(prev => ({ ...prev, [key]: 'error' }));
      toast({ title: 'Erro ao salvar', description: err?.message || 'Falha ao salvar nota', variant: 'destructive' });
    }
  };

  // Salva todo o lote
  const saveBatchToSupabase = async () => {
    if (!batchInvoices || batchInvoices.length === 0) {
      alert('Nenhuma nota no lote para salvar.');
      return;
    }
    const initialStatus: any = {};
    batchInvoices.forEach(inv => {
      const key = inv.numero_nota || inv.chave_nota_fiscal || `NF-${Date.now()}`;
      initialStatus[key] = 'pending';
    });
    setBatchProcessingStatus(initialStatus);
    for (const inv of batchInvoices) {
      await saveInvoiceToSupabase(inv);
    }
  };

  // Volume calculation functions
  const openVolumeModal = (numeroNota: string) => {
    setCurrentVolumeNota(numeroNota);
    setShowVolumeModal(true);
  };

  const addVolumeToNota = (volumeData: NotaVolumeData) => {
    setBatchVolumeData(prev => {
      const existingIndex = prev.findIndex(item => item.numeroNota === volumeData.numeroNota);
      if (existingIndex >= 0) {
        // Update existing note
        const updated = [...prev];
        updated[existingIndex] = volumeData;
        return updated;
      } else {
        // Add new note
        return [...prev, volumeData];
      }
    });

    setShowVolumeModal(false);
    setCurrentVolumeNota('');
    
    toast({
      title: "Cubagem salva",
      description: `Dimensões informadas para NF ${volumeData.numeroNota}`,
    });
  };

  const removeVolumeData = (numeroNota: string) => {
    if (window.confirm(`Deseja remover a nota fiscal ${numeroNota} do extrato de volumes?`)) {
      setBatchVolumeData(prev => prev.filter(item => item.numeroNota !== numeroNota));
      setBatchInvoices(prev => prev.filter(invoice => invoice.numero_nota !== numeroNota));
      
      toast({
        title: "Nota Removida",
        description: `NFe ${numeroNota} removida do extrato de volumes`,
        variant: "default"
      });
    }
  };

  // Download XML for a single invoice
  const downloadXmlForInvoice = (invoice: any) => {
    try {
      const xml: string | undefined = invoice?.xmlContent || invoice?.xml_content;
      if (!xml || typeof xml !== 'string' || !xml.includes('<')) {
        toast({ title: 'XML não disponível', description: 'Esta nota não possui XML carregado.', variant: 'destructive' });
        return;
      }
      const safeName = (invoice.numero_nota || invoice.chave_nota_fiscal || 'nota').toString().replace(/[^\w\-]/g, '_');
      const fileName = `NFe-${safeName}.xml`;
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: 'XML baixado', description: `Arquivo ${fileName} gerado com sucesso.` });
    } catch (err) {
      console.error('Erro ao baixar XML individual:', err);
      toast({ title: 'Erro ao baixar XML', description: 'Falha ao gerar o arquivo XML.', variant: 'destructive' });
    }
  };

  // Download XML for all invoices in batch (multiple files)
  const downloadXmlForBatch = () => {
    try {
      const invoicesWithXml = batchInvoices.filter(inv => (inv.xmlContent && typeof inv.xmlContent === 'string') || (inv.xml_content && typeof inv.xml_content === 'string'));
      if (invoicesWithXml.length === 0) {
        toast({ title: 'Sem XML no lote', description: 'Nenhuma nota do lote possui XML carregado.', variant: 'destructive' });
        return;
      }
      invoicesWithXml.forEach((inv) => {
        const xml = inv.xmlContent || inv.xml_content;
        const safeName = (inv.numero_nota || inv.chave_nota_fiscal || 'nota').toString().replace(/[^\w\-]/g, '_');
        const fileName = `NFe-${safeName}.xml`;
        const blob = new Blob([xml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      });
      toast({ title: 'XMLs baixados', description: `${invoicesWithXml.length} arquivo(s) XML iniciados para download.` });
    } catch (err) {
      console.error('Erro ao baixar XML em lote:', err);
      toast({ title: 'Erro no lote', description: 'Falha ao baixar XMLs do lote.', variant: 'destructive' });
    }
  };

  const generateColetaDocument = () => {
    if (batchVolumeData.length === 0) {
      alert('Nenhuma nota fiscal no extrato para gerar coleta');
      return;
    }

    const totalCubagem = batchVolumeData.reduce((sum, nota) => sum + nota.totalM3, 0);
    const totalPeso = batchVolumeData.reduce((sum, nota) => sum + nota.pesoTotal, 0);
    
    // Save notes to system with "Coleta" origin
    const savedInvoices = JSON.parse(localStorage.getItem('processedInvoices') || '[]');
    const finalizedInvoices = batchInvoices.map(invoice => ({
      ...invoice,
      origem: 'Coleta',
      status: 'processada',
      documento_gerado: `COL-${Date.now()}`,
      data_finalizacao: new Date().toISOString()
    }));
    
    const updatedInvoices = [...savedInvoices, ...finalizedInvoices];
    localStorage.setItem('processedInvoices', JSON.stringify(updatedInvoices));
    setProcessedInvoices(updatedInvoices);
    
    // Clear volume extract and batch
    setBatchVolumeData([]);
    setBatchInvoices([]);
    
    alert(`Documento de Coleta gerado com sucesso!\n\nResumo:\n• ${batchVolumeData.length} nota(s) fiscal(is)\n• Cubagem total: ${totalCubagem.toFixed(2)} m³\n• Peso total: ${totalPeso.toFixed(2)} kg\n\nNotas salvas no sistema com origem "Coleta"`);
  };

  const generateORDocument = () => {
    if (batchVolumeData.length === 0) {
      alert('Nenhuma nota fiscal no extrato para gerar OR');
      return;
    }

    const totalCubagem = batchVolumeData.reduce((sum, nota) => sum + nota.totalM3, 0);
    const totalPeso = batchVolumeData.reduce((sum, nota) => sum + nota.pesoTotal, 0);
    
    // Save notes to system with "Ordem de Recebimento" origin
    const savedInvoices = JSON.parse(localStorage.getItem('processedInvoices') || '[]');
    const finalizedInvoices = batchInvoices.map(invoice => ({
      ...invoice,
      origem: 'Ordem de Recebimento',
      status: 'processada',
      documento_gerado: `OR-${Date.now()}`,
      data_finalizacao: new Date().toISOString()
    }));
    
    const updatedInvoices = [...savedInvoices, ...finalizedInvoices];
    localStorage.setItem('processedInvoices', JSON.stringify(updatedInvoices));
    setProcessedInvoices(updatedInvoices);
    
    // Clear volume extract and batch
    setBatchVolumeData([]);
    setBatchInvoices([]);
    
    alert(`Ordem de Recebimento (OR) gerada com sucesso!\n\nResumo:\n• ${batchVolumeData.length} nota(s) fiscal(is)\n• Cubagem total: ${totalCubagem.toFixed(2)} m³\n• Peso total: ${totalPeso.toFixed(2)} kg\n\nNotas salvas no sistema com origem "Ordem de Recebimento"`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processada': return 'bg-green-100 text-green-800';
      case 'aguardando': return 'bg-yellow-100 text-yellow-800';
      case 'erro': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSolicitarCarregamento = (tipoOrdem: string) => {
    if (batchVolumeData.length === 0) {
      alert('Nenhuma nota fiscal no extrato para solicitar carregamento');
      return;
    }

    const totalCubagem = batchVolumeData.reduce((sum, nota) => sum + nota.totalM3, 0);
    const totalPeso = batchVolumeData.reduce((sum, nota) => sum + nota.pesoTotal, 0);
    
    // Store NFe data for order creation
    const nfeData = batchInvoices.map(invoice => ({
      id: invoice.chave_nota_fiscal,
      chaveAcesso: invoice.chave_nota_fiscal,
      numero: invoice.numero_nota,
      valorDeclarado: parseFloat(invoice.valor_nota_fiscal || '0'),
      peso: parseFloat(invoice.peso_bruto || '0'),
      volume: parseInt(invoice.quantidade_volumes || '1'),
      remetente: {
        razaoSocial: invoice.emitente_razao_social,
        cnpj: invoice.emitente_cnpj,
        cidade: invoice.emitente_municipio,
        uf: invoice.emitente_uf
      },
      destinatario: {
        razaoSocial: invoice.destinatario_razao_social,
        cnpj: invoice.destinatario_cnpj,
        cidade: invoice.destinatario_municipio,
        uf: invoice.destinatario_uf
      },
      m3: batchVolumeData.find(v => v.numeroNota === invoice.numero_nota)?.totalM3 || 0
    }));

    // Store order data in localStorage for form pre-population
    const orderData = {
      tipo: tipoOrdem,
      nfes: nfeData,
      totalCubagem,
      totalPeso,
      origem: 'armazenagem'
    };

    localStorage.setItem('orderData', JSON.stringify(orderData));
    
    // Navigate to order creation page
    setLocation('/marketplace/criacao-ordem');
  };

  // Nova função para criar ordem de coleta integrada
  const handleCriarOrdemColeta = () => {
    if (batchInvoices.length === 0) {
      alert('Nenhuma nota fiscal processada para criar ordem de coleta');
      return;
    }

    // Preparar dados das notas para o módulo de coletas
    const notasParaColeta = batchInvoices.map(invoice => ({
      ...invoice,
      processedAt: new Date().toISOString(),
      status: 'pendente',
      modulo_origem: 'armazenagem'
    }));

    // Salvar no localStorage para carregar no módulo de coletas
    localStorage.setItem('processedInvoices', JSON.stringify(notasParaColeta));
    
    // Dados de volume também
    if (batchVolumeData.length > 0) {
      localStorage.setItem('volumeData', JSON.stringify(batchVolumeData));
    }

    // Navegar para nova ordem de coleta
    setLocation('/coletas/nova-ordem');
  };

  return (
    <MainLayout title="Entrada de Notas Fiscais">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Entrada de Notas Fiscais</h2>
        <p className="text-gray-600">Recebimento e processamento de documentos fiscais para armazenagem</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="cadastro">Cadastrar Nota</TabsTrigger>
          <TabsTrigger value="consultar">Consultar Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="cadastro" className="mt-6">
          {/* Sistema de Ajuda Contextual */}
          <div className="mb-6">
            <InlineHelp
              title="Entrada de Notas Fiscais - Guia Rápido"
              description="Aprenda como processar notas fiscais de forma eficiente usando os diferentes métodos disponíveis"
              videoUrl="https://www.youtube.com/watch?v=demo-nfe-entrada"
              duration="Tutorial"
              tips={[
                "Use o método API para importação automática quando tiver apenas a chave da NFe",
                "Upload XML é ideal quando você já possui o arquivo baixado",
                "Preenchimento manual permite maior controle sobre os dados inseridos",
                "Sempre confira os dados do emitente e destinatário após importação"
              ]}
              variant="compact"
              defaultOpen={false}
            />
          </div>

          {/* Métodos de Preenchimento - Versão Aprimorada */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-6 text-gray-800">Métodos de Preenchimento</h3>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Edit className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="font-semibold text-gray-800">1. Manual</div>
                </div>
                <div className="text-sm text-gray-600">Digitação completa dos dados da NFe</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Upload className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="font-semibold text-gray-800">2. Upload XML</div>
                </div>
                <div className="text-sm text-gray-600">Envio de arquivo XML da NFe</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Search className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="font-semibold text-gray-800">3. Busca API</div>
                </div>
                <div className="text-sm text-gray-600">Importação automática via chave</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Invoice Entry Form - Coluna maior (2/3 do espaço) */}
            <div className="flex-2">
              <div className="crosswms-card p-8 bg-gray-50 shadow-lg rounded-lg border border-gray-200">
                <div className="bg-[#0098DA]/5 px-8 py-6 -mx-8 -mt-8 mb-8 border-b border-[#0098DA]/10">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#0098DA]" />
                    Cadastro de Nota Fiscal
                  </h3>
                </div>
                
                <div className="space-y-8">
                  {/* Shared Fields Section */}
                  <div className="p-4 border border-[#0098DA]/20 bg-[#0098DA]/5 rounded-lg">
                    <div className="pb-3">
                      <h4 className="text-lg flex items-center gap-2 text-[#0098DA] font-semibold">
                        <Edit className="h-5 w-5" />
                        Campos de Preenchimento Manual
                      </h4>
                      <p className="text-sm text-[#0098DA]/80">
                        Estes campos serão aplicados a todas as notas fiscais do lote
                      </p>
                    </div>
                    <div className="space-y-4 mt-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shared_operacao">Operação</Label>
                    <Select 
                      value={sharedFields.operacao} 
                      onValueChange={(value) => handleSharedFieldChange('operacao', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Coleta no fornecedor">Coleta no fornecedor</SelectItem>
                        <SelectItem value="Coleta na rota">Coleta na rota</SelectItem>
                        <SelectItem value="Coleta por transportadora">Coleta por transportadora</SelectItem>
                        <SelectItem value="Redespacho">Redespacho</SelectItem>
                        <SelectItem value="Devolução">Devolução</SelectItem>
                        <SelectItem value="Entregue por fornecedor">Entregue por fornecedor</SelectItem>
                        <SelectItem value="Nfe Recusada">Nfe Recusada</SelectItem>
                        <SelectItem value="DI">DI</SelectItem>
                        <SelectItem value="DTA">DTA</SelectItem>
                        <SelectItem value="Aéreo">Aéreo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shared_cliente_retira">Cliente Retira</Label>
                    <Select 
                      value={sharedFields.cliente_retira} 
                      onValueChange={(value) => handleSharedFieldChange('cliente_retira', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sim">Sim</SelectItem>
                        <SelectItem value="nao">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shared_tipo_frete">Tipo Frete</Label>
                    <Select 
                      value={sharedFields.tipo_frete} 
                      onValueChange={(value) => handleSharedFieldChange('tipo_frete', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="CIF" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CIF">CIF</SelectItem>
                        <SelectItem value="FOB">FOB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shared_custo_extra">Custo Extra</Label>
                    <Select 
                      value={sharedFields.custo_extra} 
                      onValueChange={(value) => handleSharedFieldChange('custo_extra', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Munck">Munck</SelectItem>
                        <SelectItem value="Guindaste">Guindaste</SelectItem>
                        <SelectItem value="Empilhadeira">Empilhadeira</SelectItem>
                        <SelectItem value="Ajudante">Ajudante</SelectItem>
                        <SelectItem value="Balsa">Balsa</SelectItem>
                        <SelectItem value="Transbordo">Transbordo</SelectItem>
                        <SelectItem value="Licença">Licença</SelectItem>
                        <SelectItem value="Escolta">Escolta</SelectItem>
                        <SelectItem value="Acessorios">Acessorios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                    </div>
                  </div>

            {/* Batch Status Display */}
            {invoiceBatch.length > 0 && (
              <Card className="mb-6 border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                    <Package className="h-5 w-5" />
                    Lote de Notas Fiscais ({invoiceBatch.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {invoiceBatch.map((invoice, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                        <div className="text-sm">
                          <span className="font-medium">
                            NF {invoice.numero_nota} - {invoice.emitente_razao_social}
                          </span>
                          <div className="text-xs text-gray-500">
                            {invoice.source === 'manual' ? 'Manual' : 
                             (typeof invoice.source === 'string' && invoice.source.includes('meudanfe')) ? 'Meu Danfe' : 'XML'}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInvoiceFromBatch(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 mt-4">
                    {/* Status do processamento automático */}
                    <div className="flex items-center justify-center p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <Info className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-blue-700 text-sm">
                        Arquivos são processados automaticamente após o upload
                      </span>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="default"
                        onClick={() => goToNextInvoice()}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <ChevronRight className="h-4 w-4 mr-2" />
                        Próxima
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setInvoiceBatch([]);
                          setBatchProcessingStatus({});
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Limpar Lote
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced XML Import Section for Batch Processing */}
            <div className="space-y-4">
              {/* Cabeçalho discreto com botão de ajuda */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-yellow-800">Dica: Processamento em Lote de XML</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowXmlBatchHelp(v => !v)}
                        className="h-6 w-6"
                        aria-label="Ajuda sobre processamento em lote de XML"
                      >
                        <HelpCircle className="h-4 w-4 text-yellow-700" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Ajuda</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {showXmlBatchHelp && (
                <div className="mb-4">
                  <InlineHelp
                    title="Dica: Processamento em Lote de XML"
                    description="Acelere seu trabalho processando múltiplos arquivos XML de uma só vez"
                    videoUrl="https://www.youtube.com/watch?v=demo-xml-batch"
                    tips={[
                      "Selecione vários arquivos XML simultaneamente para processamento em lote",
                      "Todos os campos compartilhados serão aplicados automaticamente às notas",
                      "Arquivos com erro são ignorados, mantendo os válidos no lote"
                    ]}
                    variant="tip"
                    dismissible={true}
                  />
                </div>
              )}

              {/* Instructions */}
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                <strong>Importação em Lote:</strong> Você pode selecionar múltiplos arquivos XML ou usar múltiplas chaves NFe. Os campos manuais serão aplicados a todas as notas do lote.
              </div>

              {/* XML Drop Zone */}
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-6 card-micro color-transition cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-green-400 bg-green-50' 
                    : xmlFiles.length > 0 || xmlFile 
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  {xmlFiles.length > 0 ? (
                    <>
                      <Check className="mx-auto h-8 w-8 mb-2 text-green-500" />
                      <p className="text-sm font-medium mb-1 text-green-800">
                        {xmlFiles.length} XML(s) Carregado(s)!
                      </p>
                      <div className="text-xs text-green-600 mb-3 space-y-1 max-h-20 overflow-y-auto">
                        {xmlFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span>{file.name}</span>
                            {batchProcessingStatus[file.name] && (
                              <Badge 
                                variant={
                                  batchProcessingStatus[file.name] === 'completed' ? 'default' :
                                  batchProcessingStatus[file.name] === 'processing' ? 'secondary' :
                                  batchProcessingStatus[file.name] === 'error' ? 'destructive' : 'outline'
                                }
                                className="ml-2"
                              >
                                {batchProcessingStatus[file.name] === 'completed' ? '✓' :
                                 batchProcessingStatus[file.name] === 'processing' ? '⟳' :
                                 batchProcessingStatus[file.name] === 'error' ? '✗' : '⏳'}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : xmlFile ? (
                    <>
                      <Check className="mx-auto h-8 w-8 mb-2 text-green-500" />
                      <p className="text-sm font-medium mb-1 text-green-800">XML Carregado!</p>
                      <p className="text-xs text-green-600 mb-3">
                        Arquivo: {xmlFile.name}
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className={`mx-auto h-8 w-8 mb-2 icon-rotate ${
                        isDragActive ? 'text-green-500' : 'text-gray-400'
                      }`} />
                      <p className="text-sm font-medium mb-1">
                        {isDragActive ? 'Solte os XML(s) aqui...' : 'Importe XML(s) ou arraste'}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Múltiplos arquivos XML suportados
                      </p>
                    </>
                  )}
                  
                  {isProcessing && (
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Processando lote de XMLs...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comprehensive Form Layout */}
            <div className="space-y-6">
              {/* Ajuda contextual para busca por API - colapsada por padrão */}
              {showApiHelp && (
                <div className="mb-2">
                  <InlineHelp
                    title="Busca Automática por API"
                    description="Importe dados da NFe automaticamente usando apenas a chave de acesso"
                    videoUrl="https://www.youtube.com/watch?v=demo-api-search"
                    tips={[
                      "Cole a chave de 44 dígitos diretamente do e-mail ou DANFE",
                      "Para múltiplas notas, separe as chaves com vírgula",
                      "Use o scanner de código de barras para captura automática",
                      "API oficial da Receita Federal - dados sempre atualizados"
                    ]}
                    variant="tip"
                    dismissible={true}
                  />
                </div>
              )}

              {/* Chave da Nota Fiscal - Otimizada */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
            <Label htmlFor="chave_nota_fiscal" className="text-sm font-medium">Chave da Nota Fiscal</Label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="auto_add_to_batch"
                          checked={autoAddToBatch}
                          onCheckedChange={(v) => setAutoAddToBatch(!!v)}
                        />
                        <Label htmlFor="auto_add_to_batch" className="text-xs text-gray-700">Auto adicionar ao lote</Label>
                      </div>
                      {/* Botão de busca individual na API Meu Danfe */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fetchNFeWithMeuDanfe({ addToBatch: false })}
            disabled={isApiLoading || !((formData.chave_nota_fiscal || '').replace(/\D/g, '').trim().length === 44)}
                        className="text-xs"
                        title="Buscar pela chave na API Meu Danfe"
                      >
                        Buscar Meu Danfe
                      </Button>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setShowApiHelp(v => !v)}
                              className="h-6 w-6"
                              aria-label="Ajuda de busca automática por API"
                            >
                              <HelpCircle className="h-4 w-4 text-yellow-700" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Ajuda</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  {/* Input em linha separada para melhor legibilidade */}
                  <div className="w-full">
                    <Input
                      id="chave_nota_fiscal"
                      value={formData.chave_nota_fiscal}
                      onChange={(e) => handleInputChange('chave_nota_fiscal', e.target.value)}
                      onPaste={handlePasteNFeKey}
                      onKeyDown={handleKeyDownNFeInput}
                      placeholder="Digite a chave de 44 dígitos"
                      className={`w-full font-mono text-sm px-3 py-2 ${formErrors.chave_nota_fiscal ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} rounded-md`}
                    />
                  </div>
                  
                  {/* Ações simplificadas: manter apenas botão de câmera */}
                  <div className="flex gap-2 pt-1">
                    <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={startBarcodeScanning}
                          className="px-2 py-1.5 bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 text-xs"
                          title="Escanear código de barras da NFe"
                        >
                          <Camera className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Camera className="h-5 w-5" />
                                Scanner de Código de Barras NFe
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowCameraGuide(true)}
                                className="text-blue-600 hover:text-blue-700"
                                title="Guia de uso"
                              >
                                <Info className="h-4 w-4" />
                              </Button>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {/* Mobile-optimized instructions with orientation warning */}
                            {isMobile && isPortrait && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <div className="text-sm text-yellow-800 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4" />
                                  <span>
                                    <strong>Atenção:</strong> Para melhor resultado, gire o celular para modo horizontal (paisagem).
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {isMobile && isLandscape && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="text-sm text-green-800 flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4" />
                                  <span>
                                    <strong>Perfeito!</strong> Posicione o código de barras CODE-128 da DANFE dentro da área vermelha.
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {!isMobile && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="text-sm text-blue-800">
                                  <strong>Desktop:</strong> Posicione o código de barras CODE-128 da DANFE dentro da área vermelha.
                                </div>
                              </div>
                            )}
                            
                            {/* Universal device compatibility info */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <div className="text-sm text-gray-700">
                                <strong>Scanner Padrão:</strong> Detecção automática com múltiplas bibliotecas (BarcodeDetector + ZXing). 
                                <br />
                                <strong>Scanner QuaggaJS:</strong> Biblioteca especializada para códigos de barras de Notas Fiscais.
                                <br />
                                <strong>Formatos:</strong> CODE-128 (DANFE), EAN-13, EAN-8, Code 39, UPC, Codabar.
                                <br />
                                <strong>Feedback:</strong> Vibração + flash visual + fechamento automático da janela.
                              </div>
                            </div>
                            
                            {/* Camera Error Display */}
                            {cameraError && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <div className="text-sm text-red-800 flex items-center gap-2">
                                  <X className="h-4 w-4" />
                                  <span>{cameraError}</span>
                                </div>
                              </div>
                            )}
                            
                            {/* Hybrid Camera Scanner */}
                            <div className="relative bg-black rounded-lg overflow-hidden">
                              {!quaggaInitialized ? (
                                /* Standard Webcam with Enhanced Detection */
                                <>
                                  <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{
                                      width: { min: 640, ideal: 1280, max: 1920 },
                                      height: { min: 480, ideal: 720, max: 1080 },
                                      facingMode: { exact: "environment" },
                                      aspectRatio: 16/9,
                                      frameRate: { ideal: 30, max: 60 }
                                    }}
                                    className="w-full h-auto"
                                    onUserMediaError={(error) => {
                                      console.error('Camera error:', error);
                                      setCameraError('Erro ao acessar a câmera. Verifique as permissões do navegador.');
                                    }}
                                    onUserMedia={() => {
                                      setCameraError(null);
                                      setHasPermission(true);
                                    }}
                                  />
                                  
                                  {/* Enhanced scanning overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="relative">
                                      <div className="border-2 border-red-500 border-dashed w-80 h-20 bg-red-500/10 rounded-lg animate-pulse"></div>
                                      <div className="absolute -top-6 left-0 text-white text-xs bg-red-500 px-2 py-1 rounded">
                                        Posicione o código CODE-128 aqui
                                      </div>
                                      {continuousScanning && (
                                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-xs bg-blue-600 px-3 py-1 rounded-full animate-bounce">
                                          Detectando...
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Corner guides */}
                                  <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-white"></div>
                                  <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-white"></div>
                                  <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-white"></div>
                                  <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-white"></div>
                                </>
                              ) : (
                                /* QuaggaJS Scanner */
                                <>
                                  <div 
                                    ref={quaggaContainerRef}
                                    className="w-full h-96 bg-black flex items-center justify-center"
                                    style={{ minHeight: '400px' }}
                                  >
                                    {!quaggaInitialized && (
                                      <div className="text-white text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                                        <p>Iniciando QuaggaJS...</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* QuaggaJS scanning overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="relative">
                                      <div className="border-2 border-green-400 border-dashed w-80 h-24 bg-green-400/10 rounded-lg"></div>
                                      <div className="absolute -top-6 left-0 text-white text-xs bg-green-500 px-2 py-1 rounded">
                                        QuaggaJS - Código CODE-128
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* QuaggaJS status indicator */}
                                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                                    Scanner QuaggaJS Ativo
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {/* Enhanced Action Buttons with Continuous Scanning */}
                            <div className="flex flex-col gap-2">
                              {/* QuaggaJS Scanning Status Indicator */}
                              {quaggaInitialized && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                                  <div className="text-sm text-green-800 flex items-center justify-center gap-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="font-medium">Scanner QuaggaJS Ativo</span>
                                  </div>
                                  <div className="text-xs text-green-600 mt-1">
                                    Posicione o código CODE-128 da DANFE na área verde
                                  </div>
                                  <div className="text-xs text-green-500 mt-1 font-mono">
                                    Detectando códigos em tempo real...
                                  </div>
                                </div>
                              )}
                              
                              {/* Manual scanning indicator */}
                              {isScanning && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-center">
                                  <div className="text-sm text-blue-800 flex items-center justify-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-spin"></div>
                                    <span className="font-medium">Processando imagem capturada...</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex gap-2 justify-center">
                                {!continuousScanning && !quaggaInitialized ? (
                                  <>
                                    <Button
                                      onClick={startContinuousScanning}
                                      className="bg-blue-600 hover:bg-blue-700 text-white flex-1 sm:flex-none"
                                    >
                                      <Scan className="h-4 w-4 mr-2" />
                                      Scanner Padrão
                                    </Button>
                                    <Button
                                      onClick={startQuaggaScanner}
                                      variant="outline"
                                      className="flex-1 sm:flex-none"
                                    >
                                      <Camera className="h-4 w-4 mr-2" />
                                      Tentar QuaggaJS
                                    </Button>
                                    <Button
                                      onClick={captureAndScanBarcode}
                                      disabled={isScanning}
                                      variant="secondary"
                                      className="flex-1 sm:flex-none"
                                    >
                                      {isScanning ? (
                                        <>
                                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                          Processando...
                                        </>
                                      ) : (
                                        <>
                                          <Camera className="h-4 w-4 mr-2" />
                                          Captura Manual
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        const testCode = "12345678901234567890123456789012345678901234";
                                        console.log('🧪 Testing barcode detection flow with code:', testCode);
                                        console.log('🧪 Current form data before:', formData.chave_nota_fiscal);
                                        
                                        // Simulate the exact flow that QuaggaJS would trigger
                                        const simulatedResult = {
                                          codeResult: {
                                            code: testCode,
                                            format: 'CODE_128'
                                          }
                                        };
                                        
                                        console.log('🧪 Simulating QuaggaJS detection...');
                                        handleQuaggaDetection(simulatedResult);
                                      }}
                                      variant="outline"
                                      className="flex-1 sm:flex-none text-xs"
                                    >
                                      🧪 Testar Detecção
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    onClick={() => {
                                      if (continuousScanning) {
                                        stopContinuousScanning();
                                      }
                                      if (quaggaInitialized) {
                                        stopQuaggaScanner();
                                      }
                                      setIsCameraOpen(false);
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Parar Scanner
                                  </Button>
                                )}
                              </div>
                              
                              {/* Fallback manual input */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const manualInput = prompt('Digite a chave de 44 dígitos da NFe:');
                                  if (manualInput && manualInput.length === 44 && /^\d+$/.test(manualInput)) {
                                    handleInputChange('chave_nota_fiscal', manualInput);
                                    setIsCameraOpen(false);
                                    // Sucesso silencioso na entrada manual
                                  } else if (manualInput) {
                                    // Silencioso: não exibir popup de erro
                                  }
                                }}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Entrada Manual
                              </Button>
                            </div>
                            
                            <div className="text-xs text-gray-500 text-center space-y-1">
                              <p>Certifique-se de que o código de barras esteja bem iluminado e dentro da área verde</p>
                              <p>Clique no ícone de ajuda acima para ver o guia completo</p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  {batchMode && scannedKeys.length > 0 && (
                    <div className="mt-2 text-xs text-green-700">
                      {scannedKeys.length} chave(s) no lote: {scannedKeys.slice(-3).join(', ')}{scannedKeys.length > 3 ? '...' : ''}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Insira a chave completa (44 dígitos) e clique em "Importar NFe" para buscar e processar o XML automaticamente
                  </p>
                </div>
              </div>

              {/* Dados da Nota Fiscal */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Dados da Nota Fiscal
                </h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numero_nota">Número da Nota</Label>
                    <Input
                      id="numero_nota"
                      value={formData.numero_nota}
                      onChange={(e) => handleInputChange('numero_nota', e.target.value)}
                      placeholder=""
                      className={`input-micro color-transition ${formErrors.numero_nota ? 'field-error' : ''}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="serie_nota">Série da Nota</Label>
                    <Input
                      id="serie_nota"
                      value={formData.serie_nota}
                      onChange={(e) => handleInputChange('serie_nota', e.target.value)}
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_hora_emissao">Data de Emissão</Label>
                    <Input
                      id="data_hora_emissao"
                      value={formData.data_hora_emissao}
                      onChange={(e) => handleInputChange('data_hora_emissao', e.target.value)}
                      placeholder="dd/mm/aaaa ---"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="natureza_operacao">Natureza Operação</Label>
                  <Input
                    id="natureza_operacao"
                    value={formData.natureza_operacao}
                    onChange={(e) => handleInputChange('natureza_operacao', e.target.value)}
                    placeholder=""
                  />
                </div>
              </div>

              {/* Dados do Emitente e Destinatário - Layout Lado a Lado */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Dados do Emitente - Coluna Esquerda */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Dados do Emitente
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emitente_cnpj">CNPJ</Label>
                      <div className="flex gap-2">
                        <Input
                          id="emitente_cnpj"
                          value={formData.emitente_cnpj}
                          onChange={(e) => handleInputChange('emitente_cnpj', e.target.value)}
                          placeholder=""
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const clean = cleanCNPJ(formData.emitente_cnpj);
                            if (clean.length === 14) {
                              buscarDadosEmitente(clean);
                            } else {
                              toast({
                                title: "CNPJ Inválido",
                                description: "Digite um CNPJ válido com 14 dígitos",
                                variant: "destructive"
                              });
                            }
                          }}
                          disabled={cnpjEmitenteLoading}
                          className="px-3"
                        >
                          {cnpjEmitenteLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {cnpjEmitenteError && (
                        <p className="text-sm text-red-500">{cnpjEmitenteError}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emitente_razao_social">Razão Social</Label>
                      <Input
                        id="emitente_razao_social"
                        value={formData.emitente_razao_social}
                        onChange={(e) => handleInputChange('emitente_razao_social', e.target.value)}
                        placeholder=""
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emitente_telefone">Telefone</Label>
                      <Input
                        id="emitente_telefone"
                        value={formData.emitente_telefone}
                        onChange={(e) => handleInputChange('emitente_telefone', e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emitente_uf">UF</Label>
                      <Input
                        id="emitente_uf"
                        value={formData.emitente_uf}
                        onChange={(e) => handleInputChange('emitente_uf', e.target.value)}
                        placeholder=""
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emitente_cidade">Cidade</Label>
                      <Input
                        id="emitente_cidade"
                        value={formData.emitente_cidade}
                        onChange={(e) => handleInputChange('emitente_cidade', e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emitente_bairro">Bairro</Label>
                      <Input
                        id="emitente_bairro"
                        value={formData.emitente_bairro}
                        onChange={(e) => handleInputChange('emitente_bairro', e.target.value)}
                        placeholder=""
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emitente_endereco">Endereço</Label>
                      <Input
                        id="emitente_endereco"
                        value={formData.emitente_endereco}
                        onChange={(e) => handleInputChange('emitente_endereco', e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emitente_numero">Número</Label>
                      <Input
                        id="emitente_numero"
                        value={formData.emitente_numero}
                        onChange={(e) => handleInputChange('emitente_numero', e.target.value)}
                        placeholder=""
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emitente_cep">CEP</Label>
                      <Input
                        id="emitente_cep"
                        value={formData.emitente_cep}
                        onChange={(e) => handleInputChange('emitente_cep', e.target.value)}
                        placeholder=""
                      />
                    </div>
                  </div>
                </div>

                {/* Dados do Destinatário - Coluna Direita */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Dados do Destinatário
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="destinatario_cnpj">CNPJ</Label>
                      <div className="flex gap-2">
                        <Input
                          id="destinatario_cnpj"
                          value={formData.destinatario_cnpj}
                          onChange={(e) => handleInputChange('destinatario_cnpj', e.target.value)}
                          placeholder=""
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const clean = cleanCNPJ(formData.destinatario_cnpj);
                            if (clean.length === 14) {
                              buscarDadosDestinatario(clean);
                            } else {
                              toast({
                                title: "CNPJ Inválido",
                                description: "Digite um CNPJ válido com 14 dígitos",
                                variant: "destructive"
                              });
                            }
                          }}
                          disabled={cnpjDestinatarioLoading}
                          className="px-3"
                        >
                          {cnpjDestinatarioLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {cnpjDestinatarioError && (
                        <p className="text-sm text-red-500">{cnpjDestinatarioError}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destinatario_razao_social">Razão Social</Label>
                      <Input
                        id="destinatario_razao_social"
                        value={formData.destinatario_razao_social}
                        onChange={(e) => handleInputChange('destinatario_razao_social', e.target.value)}
                        placeholder=""
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="destinatario_telefone">Telefone</Label>
                      <Input
                        id="destinatario_telefone"
                        value={formData.destinatario_telefone}
                        onChange={(e) => handleInputChange('destinatario_telefone', e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destinatario_uf">UF</Label>
                      <Input
                        id="destinatario_uf"
                        value={formData.destinatario_uf}
                        onChange={(e) => handleInputChange('destinatario_uf', e.target.value)}
                        placeholder=""
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="destinatario_cidade">Cidade</Label>
                      <Input
                        id="destinatario_cidade"
                        value={formData.destinatario_cidade}
                        onChange={(e) => handleInputChange('destinatario_cidade', e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destinatario_bairro">Bairro</Label>
                      <Input
                        id="destinatario_bairro"
                        value={formData.destinatario_bairro}
                        onChange={(e) => handleInputChange('destinatario_bairro', e.target.value)}
                        placeholder=""
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="destinatario_endereco">Endereço</Label>
                      <Input
                        id="destinatario_endereco"
                        value={formData.destinatario_endereco}
                        onChange={(e) => handleInputChange('destinatario_endereco', e.target.value)}
                        placeholder=""
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destinatario_numero">Número</Label>
                      <Input
                        id="destinatario_numero"
                        value={formData.destinatario_numero}
                        onChange={(e) => handleInputChange('destinatario_numero', e.target.value)}
                        placeholder=""
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="destinatario_cep">CEP</Label>
                      <Input
                        id="destinatario_cep"
                        value={formData.destinatario_cep}
                        onChange={(e) => handleInputChange('destinatario_cep', e.target.value)}
                        placeholder=""
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Informações Adicionais
                </h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantidade_volumes">Quantidade de Volumes</Label>
                    <Input
                      id="quantidade_volumes"
                      value={formData.quantidade_volumes}
                      onChange={(e) => handleInputChange('quantidade_volumes', e.target.value)}
                      placeholder="Quantidade de volumes"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor_nota_fiscal">Valor da Nota Fiscal</Label>
                    <Input
                      id="valor_nota_fiscal"
                      value={formData.valor_nota_fiscal}
                      onChange={(e) => handleInputChange('valor_nota_fiscal', e.target.value)}
                      placeholder="Valor total da nota"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peso_bruto">Peso Bruto</Label>
                    <Input
                      id="peso_bruto"
                      value={formData.peso_bruto}
                      onChange={(e) => handleInputChange('peso_bruto', e.target.value)}
                      placeholder="Peso bruto em kg"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="informacoes_complementares">Informações Complementares</Label>
                    <Textarea
                      id="informacoes_complementares"
                      value={formData.informacoes_complementares}
                      onChange={(e) => handleInputChange('informacoes_complementares', e.target.value)}
                      placeholder="Informações adicionais"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero_pedido">Número do Pedido</Label>
                    <Input
                      id="numero_pedido"
                      value={formData.numero_pedido}
                      onChange={(e) => handleInputChange('numero_pedido', e.target.value)}
                      placeholder="Número do pedido"
                    />
                  </div>
                </div>
              </div>
            </div>

              {/* Action Buttons (simplificado: sem "Adicionar ao Lote") */}
              <div className="flex gap-3 pt-6 border-t">
                <Button 
                  onClick={handleSubmit} 
                  variant="outline"
                  className="btn-micro btn-ripple scale-click"
                  disabled={showSuccessAnimation}
                >
                  {showSuccessAnimation ? (
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Individual
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClearForm}
                  className="btn-micro scale-click color-transition"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
                <Button 
                  onClick={() => openVolumeModal(formData.numero_nota || 'Nova Nota')}
                  disabled={!formData.numero_nota}
                  className="bg-[#0098DA] hover:bg-blue-600 text-white transition-colors"
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Informar Cubagem
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Invoices and Statistics */}
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="crosswms-card p-4">
              <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                Aguardando
              </div>
              <div className="text-3xl font-bold text-yellow-600">8</div>
              <p className="text-xs text-gray-500">Para conferência</p>
            </div>

            <div className="crosswms-card p-4">
              <div className="text-sm font-medium text-gray-600 mb-2 flex items-center">
                <Check className="mr-2 h-4 w-4 text-green-500" />
                Processadas
              </div>
              <div className="text-3xl font-bold text-green-600">24</div>
              <p className="text-xs text-gray-500">Hoje</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="crosswms-card">
            <div className="bg-[#0098DA]/5 px-6 py-4 -mx-6 -mt-6 mb-6 border-b border-[#0098DA]/10">
              <h4 className="text-lg font-semibold text-gray-800">Ações Rápidas</h4>
            </div>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setLocation('/armazenagem/conferencia')}
              >
                <Package className="h-4 w-4 mr-2" />
                Conferência de Mercadorias
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setLocation('/armazenagem/posicionamento')}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Posicionamento no Estoque
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  // Store form data in sessionStorage for label generation
                  sessionStorage.setItem('notaFiscalData', JSON.stringify(formData));
                  
                  // Store origin information for back navigation
                  const ordemOrigem = {
                    numero_ordem: 'Notas Fiscais de Entrada',
                    tipo: 'entrada',
                    data: formData,
                    rota_origem: '/armazenagem/recebimento'
                  };
                  sessionStorage.setItem('ordem_origem_etiqueta', JSON.stringify(ordemOrigem));
                  
                  setLocation('/armazenagem/geracao-etiquetas');
                }}
                disabled={!formData.numero_nota || !formData.quantidade_volumes}
              >
                <Barcode className="h-4 w-4 mr-2" />
                Imprimir Etiquetas
              </Button>
            </div>
          </div>

          {/* Volume Extract Display - replaces "Notas Fiscais Recentes" */}
          <div className="crosswms-card">
            <div className="bg-[#0098DA]/5 px-6 py-4 -mx-6 -mt-6 mb-6 border-b border-[#0098DA]/10">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Box className="h-5 w-5 text-[#0098DA]" />
                  Extrato de Volumes - Cubagem ({batchVolumeData.length} notas)
                </h4>
              </div>
            </div>
            
            <div>
              {batchVolumeData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Box className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Nenhuma nota com cubagem informada</p>
                  <p className="text-xs">Use o botão "Informar Cubagem" para adicionar volumes</p>
                </div>
              ) : (
                <div>
                  {/* List View Header */}
                  <div className="grid grid-cols-6 gap-3 p-3 bg-gray-50 rounded-t-lg text-xs font-medium text-gray-700 border">
                    <div>Número</div>
                    <div>Volumes</div>
                    <div>Total m³</div>
                    <div>Peso (kg)</div>
                    <div>Status</div>
                    <div className="text-center">Ações</div>
                  </div>
                  
                  {/* List View Items */}
                  <div className="divide-y border-x border-b rounded-b-lg">
                    {batchInvoices
                      .sort((a, b) => new Date(a.processedAt || 0).getTime() - new Date(b.processedAt || 0).getTime())
                      .map((invoice) => {
                        const notaCubagem = batchVolumeData.find(item => item.numeroNota === invoice.numero_nota);
                        const temCubagem = notaCubagem && notaCubagem.volumes && notaCubagem.volumes.some(vol => vol.altura > 0 && vol.largura > 0 && vol.comprimento > 0);
                        
                        return (
                          <div 
                            key={invoice.id} 
                            className={`grid grid-cols-6 gap-3 p-3 text-xs items-center hover:bg-gray-50 ${
                              !temCubagem ? 'bg-red-50' : 'bg-green-50'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3 text-blue-600" />
                              <span className="font-medium">
                                {invoice.numero_nota || (invoice as any).numero || (invoice as any).numero_nf || (invoice as any).notaFiscal || 'N/A'}
                              </span>
                            </div>
                            
                            <div>
                              <span className="font-medium">
                                {notaCubagem?.volumes?.length || invoice.quantidade_volumes || '-'}
                              </span>
                            </div>
                            
                            <div>
                              {temCubagem && notaCubagem ? (
                                <span className="font-medium text-green-600">
                                  {notaCubagem.totalM3.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}
                                </span>
                              ) : (
                                <span className="text-red-500 font-medium">0,000</span>
                              )}
                            </div>
                            
                            <div>
                              <span className="font-medium">
                                {parseFloat(invoice.peso_bruto || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            
                            <div>
                              {temCubagem ? (
                                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 text-xs">
                                  Dimensões OK
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 text-xs">
                                  Pendente
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex gap-1 justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openVolumeModal(invoice.numero_nota)}
                                className={`h-6 px-2 text-xs whitespace-nowrap ${!temCubagem ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' : ''}`}
                              >
                                Informar Dimensões
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadXmlForInvoice(invoice)}
                                className="h-6 px-2 text-xs"
                                title="Baixar XML desta nota"
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Baixar XML
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => saveInvoiceToSupabase(invoice)}
                                className="h-6 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                title="Salvar esta nota no banco de dados"
                              >
                                Salvar no BD
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeVolumeData(invoice.numero_nota)}
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                  
                  {/* Summary Footer for List View */}
                  <div className="border border-t-0 rounded-b-lg bg-gray-50 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium">
                        Total: {batchVolumeData.reduce((sum, nota) => sum + nota.totalM3, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m³
                      </div>
                      <div className="text-sm text-gray-500">
                        {batchInvoices.length} nota(s) | {batchVolumeData.filter(n => n.volumes.length > 0).length} com cubagem
                      </div>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Tipo de Ordem:</div>
                        <Select value={selectedOrderType} onValueChange={setSelectedOrderType}>
                          <SelectTrigger className="w-full h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Coleta">Coleta</SelectItem>
                            <SelectItem value="Direta">Direta</SelectItem>
                            <SelectItem value="Armazém">Armazém</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={saveBatchToSupabase}
                          className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={batchInvoices.length === 0}
                        >
                          <Save className="h-3 w-3 mr-1" />
                          Salvar Lote no BD
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={handleCriarOrdemColeta}
                          className="h-8 bg-[#0098DA] hover:bg-blue-600 text-white"
                          disabled={batchInvoices.length === 0}
                        >
                          <Truck className="h-3 w-3 mr-1" />
                          Criar Ordem
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadXmlForBatch}
                          className="h-8"
                          disabled={batchInvoices.length === 0}
                          title="Baixar XML de todas as notas do lote"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Baixar XML (Lote)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSolicitarCarregamento(selectedOrderType)}
                          className="h-8"
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Solicitar {selectedOrderType}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </TabsContent>

    <TabsContent value="consultar" className="mt-6">
      <div className="space-y-6">
        {/* Search Header */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5" />
                  Buscar Notas Fiscais Processadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar por número, chave, remetente ou destinatário..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="input-micro color-transition"
                    />
                  </div>
                  <Button variant="outline" className="px-6">
                    <Search className="h-4 w-4 mr-2" />
                    Buscar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Resultados da Busca ({filteredInvoices.length} {filteredInvoices.length === 1 ? 'nota' : 'notas'})
                  </CardTitle>
                  
                  <div className="flex items-center gap-3">
                    {filteredInvoices.length > 0 && searchQuery && (
                      <div className="text-sm text-gray-500">
                        Filtrado por: "{searchQuery}"
                      </div>
                    )}
                    
                    {filteredInvoices.length > 0 && (
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                        <Button
                          variant={consultaViewMode === 'cards' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setConsultaViewMode('cards')}
                          className="h-8 px-2"
                        >
                          <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={consultaViewMode === 'list' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setConsultaViewMode('list')}
                          className="h-8 px-2"
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-12">
                    <FileX className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchQuery ? 'Nenhuma nota encontrada' : 'Nenhuma nota processada'}
                    </h3>
                    <p className="text-gray-500">
                      {searchQuery 
                        ? 'Tente ajustar os critérios de busca ou verificar a ortografia'
                        : 'Quando você processar notas fiscais, elas aparecerão aqui'}
                    </p>
                  </div>
                ) : consultaViewMode === 'list' ? (
                  <div>
                    {/* List View Header */}
                    <div className="grid grid-cols-10 gap-2 p-3 bg-gray-50 rounded-t-lg text-xs font-medium text-gray-700 border">
                      <div>Número</div>
                      <div className="col-span-2">Remetente</div>
                      <div className="col-span-2">Destinatário</div>
                      <div>Valor</div>
                      <div>Peso</div>
                      <div>Nº Ordem</div>
                      <div>Tipo Ordem</div>
                      <div>Ações</div>
                    </div>
                    
                    {/* List View Items */}
                    <div className="divide-y border-x border-b rounded-b-lg">
                      {filteredInvoices.map((invoice, index) => (
                        <div 
                          key={invoice.id || invoice.chave_nota_fiscal || `invoice-${index}`}
                          className="grid grid-cols-10 gap-2 p-3 text-xs items-center hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3 text-blue-600" />
                            <span className="font-medium text-blue-600">{invoice.numero_nota || 'N/A'}</span>
                          </div>
                          
                          <div className="col-span-2">
                            <div className="font-medium truncate">{invoice.emitente_razao_social || 'Não informado'}</div>
                            <div className="text-gray-500 text-xs">
                              {invoice.origem || 'Manual'}
                            </div>
                          </div>
                          
                          <div className="col-span-2">
                            <div className="font-medium truncate">{invoice.destinatario_razao_social || 'Não informado'}</div>
                            <div className="text-gray-500 text-xs">
                              {invoice.data_hora_emissao ? new Date(invoice.data_hora_emissao).toLocaleDateString('pt-BR') : 'N/A'}
                            </div>
                          </div>
                          
                          <div>
                            <span className="font-medium text-green-600">
                              R$ {parseFloat(invoice.valor_nota_fiscal || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          
                          <div>
                            <span className="font-medium">
                              {invoice.peso_total_bruto || invoice.peso_bruto || '1,00 Kg'}
                            </span>
                          </div>
                          
                          <div>
                            <span className="font-medium text-blue-600">
                              {invoice.numero_ordem || '-'}
                            </span>
                          </div>
                          
                          <div>
                            <Badge variant="outline" className="text-xs">
                              {invoice.tipo_ordem || 'Pendente'}
                            </Badge>
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const mappedData = {
                                  numero_nota: invoice.numero_nota,
                                  quantidade_volumes: invoice.quantidade_volumes || invoice.volumes_totais || '1',
                                  emitente_razao_social: invoice.emitente_razao_social,
                                  destinatario_razao_social: invoice.destinatario_razao_social,
                                  peso_bruto: invoice.peso_total_bruto || invoice.peso_bruto || '1',
                                  chave_nota_fiscal: invoice.chave_nota_fiscal
                                };
                                localStorage.setItem('invoiceData', JSON.stringify(mappedData));
                                setLocation('/armazenagem/geracao-etiquetas');
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <Barcode className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setViewDialogOpen(true);
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const idx = batchInvoices.findIndex(inv => (inv.id || inv.chave_nota_fiscal) === (invoice.id || invoice.chave_nota_fiscal));
                                handleEditInvoice(invoice, idx >= 0 ? idx : 0);
                              }}
                              className="h-6 px-2 text-xs"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredInvoices.map((invoice, index) => (
                      <div 
                        key={invoice.id || invoice.chave_nota_fiscal || `invoice-${index}`}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold text-blue-600">{invoice.numero_nota || 'N/A'}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {invoice.origem || 'Manual'}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div>
                            <div className="text-xs text-gray-500">Remetente</div>
                            <div className="text-sm font-medium truncate">{invoice.emitente_razao_social || 'Não informado'}</div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-500">Destinatário</div>
                            <div className="text-sm font-medium truncate">{invoice.destinatario_razao_social || 'Não informado'}</div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-gray-500">Valor</div>
                              <div className="text-sm font-semibold text-green-600">
                                R$ {parseFloat(invoice.valor_nota_fiscal || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Peso</div>
                              <div className="text-sm font-medium">
                                {invoice.peso_total_bruto || invoice.peso_bruto || '1,00 Kg'}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-xs text-gray-500">Data Emissão</div>
                            <div className="text-sm">
                              {invoice.data_hora_emissao ? new Date(invoice.data_hora_emissao).toLocaleDateString('pt-BR') : 'N/A'}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const mappedData = {
                                numero_nota: invoice.numero_nota,
                                quantidade_volumes: invoice.quantidade_volumes || invoice.volumes_totais || '1',
                                emitente_razao_social: invoice.emitente_razao_social,
                                destinatario_razao_social: invoice.destinatario_razao_social,
                                peso_bruto: invoice.peso_total_bruto || invoice.peso_bruto || '1',
                                chave_nota_fiscal: invoice.chave_nota_fiscal
                              };
                              localStorage.setItem('invoiceData', JSON.stringify(mappedData));
                              setLocation('/armazenagem/geracao-etiquetas');
                            }}
                            className="h-7 px-2 text-xs"
                          >
                            <Barcode className="h-3 w-3 mr-1" />
                            Etiquetas
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setViewDialogOpen(true);
                            }}
                            className="h-7 px-2 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const idx = batchInvoices.findIndex(inv => (inv.id || inv.chave_nota_fiscal) === (invoice.id || invoice.chave_nota_fiscal));
                              handleEditInvoice(invoice, idx >= 0 ? idx : 0);
                            }}
                            className="h-7 px-2 text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
      </div>
    </TabsContent>
    </Tabs>

      {/* Modal de Cubagem */}
      <CubagemManager
        open={showVolumeModal}
        onClose={() => setShowVolumeModal(false)}
        onSave={addVolumeToNota}
        notaInfo={currentVolumeNota ? (() => {
          const invoice = batchInvoices.find(inv => inv.numero_nota === currentVolumeNota);
          return invoice ? {
            id: invoice.id || currentVolumeNota,
            numero: currentVolumeNota,
            peso: parseFloat(invoice.peso_bruto || '0'),
            quantidadeVolumes: parseInt(invoice.quantidade_volumes || '1')
          } : null;
        })() : null}
        existingVolumes={
          batchVolumeData.find(item => item.numeroNota === currentVolumeNota)?.volumes || []
        }
      />
    </MainLayout>
  );
};

export default NotasFiscaisEntrada;
  // Adiciona chave escaneada ao lote
  const addScannedKey = (key: string) => {
    const cleaned = key.replace(/\D/g, '');
    if (cleaned.length !== 44) {
      return;
    }
    setScannedKeys(prev => (prev.includes(cleaned) ? prev : [...prev, cleaned]));
    setFormData(prev => {
      const existing = (prev.chave_nota_fiscal || '')
        .split(',')
        .map(k => k.trim())
        .filter(k => k.length === 44);
      const nextValue = [...new Set([...existing, cleaned])].join(',');
      return { ...prev, chave_nota_fiscal: nextValue };
    });
    toast({
      title: 'Chave adicionada ao lote',
      description: cleaned,
    });
  };

  // Preenche o formulário com a nota selecionada
  const applyInvoiceToForm = (nota: any) => {
    setFormData({
      chave_nota_fiscal: nota.chave_nota_fiscal || nota.chaveNF || '',
      data_hora_emissao: nota.data_hora_emissao || nota.data_emissao || '',
      numero_nota: nota.numero_nota || nota.numero || '',
      serie_nota: nota.serie_nota || nota.serie || '',
      natureza_operacao: nota.natureza_operacao || '',
      operacao: nota.operacao || sharedFields.operacao || '',
      cliente_retira: nota.cliente_retira || sharedFields.cliente_retira || '',
      emitente_cnpj: nota.emitente_cnpj || '',
      emitente_razao_social: nota.emitente_razao_social || '',
      emitente_telefone: nota.emitente_telefone || '',
      emitente_uf: nota.emitente_uf || '',
      emitente_cidade: nota.emitente_cidade || '',
      emitente_bairro: nota.emitente_bairro || '',
      emitente_endereco: nota.emitente_endereco || '',
      emitente_numero: nota.emitente_numero || '',
      emitente_cep: nota.emitente_cep || '',
      destinatario_cnpj: nota.destinatario_cnpj || '',
      destinatario_razao_social: nota.destinatario_razao_social || '',
      destinatario_telefone: nota.destinatario_telefone || '',
      destinatario_uf: nota.destinatario_uf || '',
      destinatario_cidade: nota.destinatario_cidade || '',
      destinatario_bairro: nota.destinatario_bairro || '',
      destinatario_endereco: nota.destinatario_endereco || '',
      destinatario_numero: nota.destinatario_numero || '',
      destinatario_cep: nota.destinatario_cep || '',
      quantidade_volumes: String(nota.quantidade_volumes || ''),
      valor_nota_fiscal: String(nota.valor_nota_fiscal || ''),
      peso_bruto: String(nota.peso_bruto || ''),
      informacoes_complementares: nota.informacoes_complementares || '',
      numero_pedido: nota.numero_pedido || '',
      tipo_frete: nota.tipo_frete || sharedFields.tipo_frete || 'CIF',
      custo_extra: nota.custo_extra || sharedFields.custo_extra || ''
    });
    setActiveTab('cadastro');
  };

  const handleEditInvoice = (nota: any, index: number) => {
    setCurrentInvoiceIndex(index);
    applyInvoiceToForm(nota);
    toast({ title: 'Nota carregada para edição', description: `NF ${nota.numero_nota || nota.numero}` });
  };

  const goToNextInvoice = () => {
    if (invoiceBatch.length === 0) {
      toast({ title: 'Lote vazio', description: 'Nenhuma nota processada.' });
      return;
    }
    const nextIndex = Math.min(currentInvoiceIndex + 1, invoiceBatch.length - 1);
    if (nextIndex === currentInvoiceIndex) {
      toast({ title: 'Fim do lote', description: 'Não há próxima nota.' });
      return;
    }
    handleEditInvoice(invoiceBatch[nextIndex], nextIndex);
  };