import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { useLocation } from 'wouter';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import CubagemManager, { NotaVolumeData } from '@/components/comum/CubagemManager';
import PrintDialog from './PrintDialog';
import ExportInsightsButton from './ExportInsightsButton';
import OrdemCargaLayout from './OrdemCargaLayout';
import { FormFieldHelp } from '@/components/ui/contextual-help';
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
  cliente_retira: string;
  tipo_frete: string;
  custo_extra: string;
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

// Schema de validação
const ordemSchema = z.object({
  tipo_movimentacao: z.string().min(1, 'Tipo de movimentação é obrigatório'),
  subtipo_operacao: z.string().min(1, 'Subtipo de operação é obrigatório'),
  prioridade: z.string().min(1, 'Prioridade é obrigatória'),
  data_operacao: z.string().min(1, 'Data de operação é obrigatória'),
  observacoes: z.string().optional(),
  peso_bruto_total: z.string().optional(),
  quantidade_volumes_total: z.string().optional(),
  valor_total: z.string().optional()
});

const NovaOrdemIntegrada: React.FC<NovaOrdemIntegradaProps> = ({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  title = "Ordem de Carga",
  showBackButton = false,
  preloadedNotes = []
}) => {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  // Estados principais
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscalData[]>(preloadedNotes);
  const [batchVolumeData, setBatchVolumeData] = useState<NotaVolumeData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Estados para XML upload
  const [xmlFiles, setXmlFiles] = useState<File[]>([]);
  const [batchProcessingStatus, setBatchProcessingStatus] = useState<{[key: string]: 'pending' | 'processing' | 'completed' | 'error'}>({});
  
  // Estados para API search
  const [chaveNFeInput, setChaveNFeInput] = useState('');
  const [collectedKeys, setCollectedKeys] = useState<string[]>([]);
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [showAddAnotherDialog, setShowAddAnotherDialog] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  
  // Estados para modal de volumes
  const [showVolumeModal, setShowVolumeModal] = useState(false);
  const [currentVolumeNota, setCurrentVolumeNota] = useState('');
  
  // Estados para diagnósticos
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [diagnosticsData, setDiagnosticsData] = useState<any>({});

  // Form para dados manuais
  const form = useForm({
    resolver: zodResolver(ordemSchema),
    defaultValues: {
      tipo_movimentacao: '',
      subtipo_operacao: '',
      prioridade: '',
      data_operacao: new Date().toISOString().split('T')[0],
      observacoes: '',
      peso_bruto_total: '',
      quantidade_volumes_total: '',
      valor_total: ''
    }
  });

  // Query para dados de empresa
  const { data: empresaData } = useQuery({
    queryKey: ['/api/me'],
    enabled: true
  });

  // Função para ler arquivo como texto
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  // Função para extrair dados do XML
  const extractDataFromXml = (xmlDoc: Document): NotaFiscalData | null => {
    try {
      const chaveNFe = xmlDoc.querySelector('infNFe')?.getAttribute('Id')?.replace('NFe', '') || '';
      const numeroNota = xmlDoc.querySelector('nNF')?.textContent || '';
      const serieNota = xmlDoc.querySelector('serie')?.textContent || '';
      
      // Emitente
      const emitCNPJ = xmlDoc.querySelector('emit CNPJ')?.textContent || '';
      const emitRazaoSocial = xmlDoc.querySelector('emit xNome')?.textContent || '';
      const emitFone = xmlDoc.querySelector('emit fone')?.textContent || '';
      const emitUF = xmlDoc.querySelector('emit enderEmit UF')?.textContent || '';
      const emitCidade = xmlDoc.querySelector('emit enderEmit xMun')?.textContent || '';
      const emitBairro = xmlDoc.querySelector('emit enderEmit xBairro')?.textContent || '';
      const emitEndereco = xmlDoc.querySelector('emit enderEmit xLgr')?.textContent || '';
      const emitNumero = xmlDoc.querySelector('emit enderEmit nro')?.textContent || '';
      const emitCEP = xmlDoc.querySelector('emit enderEmit CEP')?.textContent || '';
      
      // Destinatário
      const destCNPJ = xmlDoc.querySelector('dest CNPJ')?.textContent || '';
      const destRazaoSocial = xmlDoc.querySelector('dest xNome')?.textContent || '';
      const destFone = xmlDoc.querySelector('dest fone')?.textContent || '';
      const destUF = xmlDoc.querySelector('dest enderDest UF')?.textContent || '';
      const destCidade = xmlDoc.querySelector('dest enderDest xMun')?.textContent || '';
      const destBairro = xmlDoc.querySelector('dest enderDest xBairro')?.textContent || '';
      const destEndereco = xmlDoc.querySelector('dest enderDest xLgr')?.textContent || '';
      const destNumero = xmlDoc.querySelector('dest enderDest nro')?.textContent || '';
      const destCEP = xmlDoc.querySelector('dest enderDest CEP')?.textContent || '';
      
      // Dados do produto/transporte
      const valorNF = xmlDoc.querySelector('vNF')?.textContent || '0';
      const pesoBruto = xmlDoc.querySelector('vol qVol')?.textContent || '1';
      const dataEmissao = xmlDoc.querySelector('dhEmi')?.textContent || '';
      const naturezaOp = xmlDoc.querySelector('natOp')?.textContent || '';
      
      return {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        chave_nota_fiscal: chaveNFe,
        numero_nota: numeroNota,
        serie_nota: serieNota,
        data_hora_emissao: dataEmissao,
        natureza_operacao: naturezaOp,
        emitente_cnpj: emitCNPJ,
        emitente_razao_social: emitRazaoSocial,
        emitente_telefone: emitFone,
        emitente_uf: emitUF,
        emitente_cidade: emitCidade,
        emitente_bairro: emitBairro,
        emitente_endereco: emitEndereco,
        emitente_numero: emitNumero,
        emitente_cep: emitCEP,
        destinatario_cnpj: destCNPJ,
        destinatario_razao_social: destRazaoSocial,
        destinatario_telefone: destFone,
        destinatario_uf: destUF,
        destinatario_cidade: destCidade,
        destinatario_bairro: destBairro,
        destinatario_endereco: destEndereco,
        destinatario_numero: destNumero,
        destinatario_cep: destCEP,
        quantidade_volumes: pesoBruto,
        valor_nota_fiscal: valorNF,
        peso_bruto: pesoBruto,
        informacoes_complementares: '',
        numero_pedido: '',
        operacao: 'Coleta TRANSUL',
        cliente_retira: 'Selecione',
        tipo_frete: 'CIF',
        custo_extra: '0'
      };
    } catch (error) {
      console.error('Erro ao extrair dados do XML:', error);
      return null;
    }
  };

  // Função para processar um único arquivo XML
  const processXMLFile = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const xmlText = await readFileAsText(file);
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const extractedData = extractDataFromXml(xmlDoc);
      
      if (extractedData) {
        // Adicionar à lista de notas
        setNotasFiscais(prev => [...prev, extractedData]);
        
        // Criar volumes automaticamente baseado na quantidade
        const quantidadeVolumes = parseInt(extractedData.quantidade_volumes) || 1;
        const volumes = Array.from({ length: quantidadeVolumes }, (_, index) => ({
          volume: index + 1,
          altura: 0,
          largura: 0,
          comprimento: 0,
          m3: 0
        }));
        
        const notaVolumeData: NotaVolumeData = {
          notaId: extractedData.id,
          numeroNota: extractedData.numero_nota,
          volumes: volumes,
          totalM3: 0,
          pesoTotal: parseFloat(extractedData.peso_bruto) || 0
        };
        setBatchVolumeData(prev => [...prev, notaVolumeData]);
        
        setShowSuccessAnimation(true);
        setTimeout(() => setShowSuccessAnimation(false), 3000);
        
        toast({
          title: "Sucesso",
          description: "XML processado e nota adicionada à ordem."
        });
      }
      
    } catch (error) {
      console.error('Erro ao processar XML:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar o arquivo XML.",
        variant: "destructive"
      });
    }
    
    setIsProcessing(false);
  };

  // Função para processar arquivos XML em lote
  const processBatchXMLFiles = async (files: File[]) => {
    setIsProcessing(true);
    const newBatch: any[] = [];
    const newStatus: {[key: string]: 'pending' | 'processing' | 'completed' | 'error'} = {};

    for (const file of files) {
      newStatus[file.name] = 'pending';
    }
    setBatchProcessingStatus(newStatus);

    for (const file of files) {
      setBatchProcessingStatus(prev => ({
        ...prev,
        [file.name]: 'processing'
      }));

      try {
        await processXMLFile(file);
        
        setBatchProcessingStatus(prev => ({
          ...prev,
          [file.name]: 'completed'
        }));
        
      } catch (error) {
        setBatchProcessingStatus(prev => ({
          ...prev,
          [file.name]: 'error'
        }));
      }
    }
    
    setIsProcessing(false);
  };

  // Função para adicionar chave NFe manualmente
  const adicionarChaveNFe = () => {
    if (!chaveNFeInput || chaveNFeInput.length !== 44) {
      toast({
        title: "Chave inválida",
        description: "A chave da NFe deve conter exatamente 44 dígitos",
        variant: "destructive"
      });
      return;
    }

    // Verificar duplicatas na lista de coleta
    if (collectedKeys.includes(chaveNFeInput)) {
      setDuplicateWarning(true);
      
      toast({
        title: "⚠️ Chave Duplicada",
        description: "Nota fiscal já está relacionada, caso finalizado clique em Importar NFe",
        variant: "default"
      });
      
      // Animação de aviso no input
      const inputElement = document.querySelector('input[placeholder="Cole ou digite a chave de 44 dígitos"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.style.animation = 'bounce 0.6s ease-in-out';
        inputElement.style.borderColor = '#f97316';
        
        setTimeout(() => {
          inputElement.style.animation = '';
          inputElement.style.borderColor = '';
          setDuplicateWarning(false);
        }, 2000);
      }
      return;
    }

    // Verificar se já existe nas notas processadas
    const jaExiste = notasFiscais.some(nf => nf.chave_nota_fiscal === chaveNFeInput);
    if (jaExiste) {
      setDuplicateWarning(true);
      
      toast({
        title: "⚠️ Chave Duplicada", 
        description: "Nota fiscal já está relacionada, caso finalizado clique em Importar NFe",
        variant: "default"
      });
      
      // Animação de aviso no input
      const inputElement = document.querySelector('input[placeholder="Cole ou digite a chave de 44 dígitos"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.style.animation = 'shake 0.6s ease-in-out';
        inputElement.style.borderColor = '#f97316';
        inputElement.style.backgroundColor = '#fef3c7';
        
        setTimeout(() => {
          inputElement.style.animation = '';
          inputElement.style.borderColor = '';
          inputElement.style.backgroundColor = '';
          setDuplicateWarning(false);
        }, 2000);
      }
      return;
    }

    // Adicionar à lista de coleta
    setCollectedKeys(prev => [...prev, chaveNFeInput]);
    setChaveNFeInput('');
    
    toast({
      title: "Chave adicionada",
      description: `${collectedKeys.length + 1} chave(s) coletada(s). Adicione mais ou clique em "Importar NFe"`,
    });

    setShowAddAnotherDialog(true);
  };

  // Função para importar NFe via API
  const importarNFesViaAPI = async () => {
    if (collectedKeys.length === 0) {
      toast({
        title: "Nenhuma chave coletada",
        description: "Adicione pelo menos uma chave NFe antes de importar",
        variant: "destructive"
      });
      return;
    }

    setIsApiLoading(true);
    let sucessos = 0;

    for (const chave of collectedKeys) {
      try {
        const response = await fetch(`/api/nfe/${chave}`);
        const data = await response.json();
        
        if (data.success && data.nfeData) {
          const processedNote: NotaFiscalData = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            chave_nota_fiscal: data.nfeData.chave_nota_fiscal || chave,
            numero_nota: data.nfeData.numero_nota || '',
            serie_nota: data.nfeData.serie_nota || '',
            data_hora_emissao: data.nfeData.data_hora_emissao || '',
            natureza_operacao: data.nfeData.natureza_operacao || '',
            emitente_cnpj: data.nfeData.emitente_cnpj || '',
            emitente_razao_social: data.nfeData.emitente_razao_social || '',
            emitente_telefone: data.nfeData.emitente_telefone || '',
            emitente_uf: data.nfeData.emitente_uf || '',
            emitente_cidade: data.nfeData.emitente_cidade || '',
            emitente_bairro: data.nfeData.emitente_bairro || '',
            emitente_endereco: data.nfeData.emitente_endereco || '',
            emitente_numero: data.nfeData.emitente_numero || '',
            emitente_cep: data.nfeData.emitente_cep || '',
            destinatario_cnpj: data.nfeData.destinatario_cnpj || '',
            destinatario_razao_social: data.nfeData.destinatario_razao_social || '',
            destinatario_telefone: data.nfeData.destinatario_telefone || '',
            destinatario_uf: data.nfeData.destinatario_uf || '',
            destinatario_cidade: data.nfeData.destinatario_cidade || '',
            destinatario_bairro: data.nfeData.destinatario_bairro || '',
            destinatario_endereco: data.nfeData.destinatario_endereco || '',
            destinatario_numero: data.nfeData.destinatario_numero || '',
            destinatario_cep: data.nfeData.destinatario_cep || '',
            quantidade_volumes: data.nfeData.quantidade_volumes || '1',
            valor_nota_fiscal: data.nfeData.valor_nota_fiscal || '0',
            peso_bruto: data.nfeData.peso_bruto || '0',
            informacoes_complementares: data.nfeData.informacoes_complementares || '',
            numero_pedido: data.nfeData.numero_pedido || '',
            operacao: 'Coleta TRANSUL',
            cliente_retira: 'Selecione',
            tipo_frete: 'CIF',
            custo_extra: '0'
          };

          setNotasFiscais(prev => [...prev, processedNote]);

          // Criar volumes automaticamente
          const quantidadeVolumes = parseInt(processedNote.quantidade_volumes) || 1;
          const volumes = Array.from({ length: quantidadeVolumes }, (_, index) => ({
            volume: index + 1,
            altura: 0,
            largura: 0,
            comprimento: 0,
            m3: 0
          }));

          const notaVolumeData: NotaVolumeData = {
            notaId: processedNote.id,
            numeroNota: processedNote.numero_nota,
            volumes: volumes,
            totalM3: 0,
            pesoTotal: parseFloat(processedNote.peso_bruto) || 0
          };
          setBatchVolumeData(prev => [...prev, notaVolumeData]);
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

    setIsApiLoading(false);
  };

  // Configuração do dropzone para XML
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/xml': ['.xml'],
      'application/xml': ['.xml']
    },
    onDrop: (acceptedFiles: File[]) => {
      setXmlFiles(acceptedFiles);
      processBatchXMLFiles(acceptedFiles);
    }
  });

  // Função para criar nota manual
  const criarNotaManual = () => {
    const formData = form.getValues();
    
    if (!formData.peso_bruto_total || !formData.quantidade_volumes_total || !formData.valor_total) {
      toast({
        title: "Dados incompletos",
        description: "Preencha os dados da carga para criar a nota manual",
        variant: "destructive"
      });
      return;
    }

    const novaNotaManual: NotaFiscalData = {
      id: `ORD-${Date.now()}`,
      chave_nota_fiscal: `MANUAL-${Date.now()}`,
      numero_nota: `ORD-${Date.now()}`,
      serie_nota: '1',
      data_hora_emissao: new Date().toISOString(),
      natureza_operacao: 'Ordem de Carregamento Manual',
      emitente_cnpj: '',
      emitente_razao_social: '',
      emitente_telefone: '',
      emitente_uf: '',
      emitente_cidade: '',
      emitente_bairro: '',
      emitente_endereco: '',
      emitente_numero: '',
      emitente_cep: '',
      destinatario_cnpj: '',
      destinatario_razao_social: '',
      destinatario_telefone: '',
      destinatario_uf: '',
      destinatario_cidade: '',
      destinatario_bairro: '',
      destinatario_endereco: '',
      destinatario_numero: '',
      destinatario_cep: '',
      quantidade_volumes: formData.quantidade_volumes_total || '1',
      valor_nota_fiscal: formData.valor_total || '0',
      peso_bruto: formData.peso_bruto_total || '0',
      informacoes_complementares: formData.observacoes || '',
      numero_pedido: '',
      operacao: formData.subtipo_operacao || 'Manual',
      cliente_retira: 'Selecione',
      tipo_frete: 'CIF',
      custo_extra: '0'
    };

    setNotasFiscais(prev => [...prev, novaNotaManual]);

    // Criar volumes
    const quantidadeVolumes = parseInt(novaNotaManual.quantidade_volumes) || 1;
    const volumes = Array.from({ length: quantidadeVolumes }, (_, index) => ({
      volume: index + 1,
      altura: 0,
      largura: 0,
      comprimento: 0,
      m3: 0
    }));

    const notaVolumeData: NotaVolumeData = {
      notaId: novaNotaManual.id,
      numeroNota: novaNotaManual.numero_nota,
      volumes: volumes,
      totalM3: 0,
      pesoTotal: parseFloat(novaNotaManual.peso_bruto) || 0
    };
    setBatchVolumeData(prev => [...prev, notaVolumeData]);

    toast({
      title: "Nota criada",
      description: "Nota manual criada com sucesso. Informe as dimensões dos volumes."
    });
  };

  // Função para abrir modal de volumes
  const abrirModalVolumes = (numeroNota: string) => {
    setCurrentVolumeNota(numeroNota);
    setShowVolumeModal(true);
  };

  // Função para atualizar volumes
  const handleVolumeUpdate = (numeroNota: string, volumeData: NotaVolumeData) => {
    setBatchVolumeData(prev => prev.map(item => 
      item.numeroNota === numeroNota ? volumeData : item
    ));
    setShowVolumeModal(false);
    
    toast({
      title: "Volumes atualizados",
      description: `Dimensões dos volumes da nota ${numeroNota} foram atualizadas`
    });
  };

  // Função para remover nota
  const removerNota = (notaId: string) => {
    setBatchVolumeData(prev => prev.filter(item => item.notaId !== notaId));
    setNotasFiscais(prev => prev.filter(nota => nota.id !== notaId));
    
    toast({
      title: "Nota removida",
      description: "Nota fiscal removida da ordem"
    });
  };

  // Função para finalizar ordem
  const finalizarOrdem = async () => {
    if (notasFiscais.length === 0) {
      toast({
        title: "Ordem vazia",
        description: "Adicione pelo menos uma nota fiscal para finalizar a ordem",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Calcular totais
      const totalM3 = batchVolumeData.reduce((sum, nota) => sum + nota.totalM3, 0);
      const totalPeso = batchVolumeData.reduce((sum, nota) => sum + nota.pesoTotal, 0);
      const totalValor = notasFiscais.reduce((sum, nota) => sum + parseFloat(nota.valor_nota_fiscal || '0'), 0);

      const ordemData = {
        ...form.getValues(),
        notasFiscais,
        volumeData: batchVolumeData,
        totalNotas: notasFiscais.length,
        totalM3: parseFloat(totalM3.toFixed(2)),
        totalPeso: parseFloat(totalPeso.toFixed(2)),
        totalValor: parseFloat(totalValor.toFixed(2))
      };

      if (onSubmit) {
        onSubmit(ordemData);
      } else {
        // Navegar para lista de ordens ou página de sucesso
        setLocation('/coletas/nova-ordem?tab=lista');
        
        toast({
          title: "Ordem criada com sucesso",
          description: `Ordem criada com ${notasFiscais.length} nota(s) fiscal(is)`,
        });
      }

      setShowSuccessAnimation(true);
      
    } catch (error) {
      console.error('Erro ao finalizar ordem:', error);
      toast({
        title: "Erro",
        description: "Erro ao finalizar ordem",
        variant: "destructive"
      });
    }
    
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation('/coletas')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <PrintDialog
            notasFiscais={notasFiscais}
            volumeData={batchVolumeData}
            disabled={notasFiscais.length === 0}
          />
          <ExportInsightsButton
            notasFiscais={notasFiscais}
            volumeData={batchVolumeData}
            disabled={notasFiscais.length === 0}
          />
        </div>
      </div>

      {/* Layout da ordem */}
      <OrdemCargaLayout
        form={form}
        empresaData={empresaData}
        notasFiscais={notasFiscais}
        batchVolumeData={batchVolumeData}
        isProcessing={isProcessing}
        xmlFiles={xmlFiles}
        collectedKeys={collectedKeys}
        chaveNFeInput={chaveNFeInput}
        isApiLoading={isApiLoading}
        duplicateWarning={duplicateWarning}
        showSuccessAnimation={showSuccessAnimation}
        onXmlDrop={getRootProps}
        onXmlInput={getInputProps}
        isDragActive={isDragActive}
        onChaveChange={setChaveNFeInput}
        onAdicionarChave={adicionarChaveNFe}
        onImportarAPI={importarNFesViaAPI}
        onCriarManual={criarNotaManual}
        onAbrirVolumes={abrirModalVolumes}
        onRemoverNota={removerNota}
        onFinalizar={finalizarOrdem}
      />

      {/* Modal de volumes */}
      <Dialog open={showVolumeModal} onOpenChange={setShowVolumeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Informar Dimensões dos Volumes</DialogTitle>
          </DialogHeader>
          {currentVolumeNota && (
            <CubagemManager
              notaId={currentVolumeNota}
              initialVolumes={batchVolumeData.find(v => v.numeroNota === currentVolumeNota)?.volumes || []}
              onSave={(volumeData: NotaVolumeData) => handleVolumeUpdate(currentVolumeNota, volumeData)}
              onCancel={() => setShowVolumeModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NovaOrdemIntegrada;