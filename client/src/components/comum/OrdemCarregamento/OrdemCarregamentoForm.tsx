import { useState, useEffect, useRef } from 'react';
import React from 'react';
import PrintDialog from './PrintDialog';
import XMLImportSection from './XMLImportSection';
import CubagemManager, { NotaVolumeData } from '@/components/comum/CubagemManager';
import { useForm } from 'react-hook-form';
import { fetchCNPJData, formatCNPJ, cleanCNPJ, validateCNPJ } from '@/utils/cnpjApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
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
  Calculator
} from 'lucide-react';

// Esquemas de validação
const ordemSchema = z.object({
  tipo: z.enum(['Direta', 'Coleta', 'Armazém'], {
    required_error: 'Tipo de ordem é obrigatório'
  }),
  remetente: z.object({
    cnpj: z.string().min(1, 'CNPJ é obrigatório'),
    razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
    nomeFantasia: z.string().optional(),
    endereco: z.string().min(1, 'Endereço é obrigatório'),
    numero: z.string().min(1, 'Número é obrigatório'),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    uf: z.string().length(2, 'UF deve ter 2 caracteres'),
    cep: z.string().min(1, 'CEP é obrigatório'),
    telefone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal(''))
  }),
  destinatario: z.object({
    cnpj: z.string().min(1, 'CNPJ é obrigatório'),
    razaoSocial: z.string().min(1, 'Razão social é obrigatória'),
    nomeFantasia: z.string().optional(),
    endereco: z.string().min(1, 'Endereço é obrigatório'),
    numero: z.string().min(1, 'Número é obrigatório'),
    bairro: z.string().min(1, 'Bairro é obrigatório'),
    cidade: z.string().min(1, 'Cidade é obrigatória'),
    uf: z.string().length(2, 'UF deve ter 2 caracteres'),
    cep: z.string().min(1, 'CEP é obrigatório'),
    telefone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal(''))
  }),
  observacoes: z.string().optional(),
  dataColeta: z.string().optional(),
  valorFrete: z.number().optional(),
  tipoVeiculo: z.string().optional()
});

type OrdemFormData = z.infer<typeof ordemSchema>;

interface NFe {
  id: string;
  chaveAcesso: string;
  numero: string;
  valorDeclarado: number;
  peso: number;
  volume: number;
  m3: number;
  remetente?: {
    razaoSocial: string;
    cnpj: string;
    uf: string;
    cidade?: string;
  };
  destinatario?: {
    razaoSocial: string;
    cnpj: string;
    uf: string;
    cidade?: string;
  };
}

interface OrdemCarregamentoFormProps {
  mode?: 'create' | 'edit' | 'view';
  initialData?: Partial<OrdemFormData>;
  onSubmit?: (data: OrdemFormData) => void;
  onCancel?: () => void;
  nfes?: NFe[];
}

// Estado adicional para NFes importadas
const useNFeState = (initialNfes: NFe[] = []) => {
  const [nfes, setNfes] = useState<NFe[]>(initialNfes);
  
  const addNfes = (newNfes: NFe[]) => {
    setNfes(prev => [...prev, ...newNfes]);
  };
  
  const removeNfe = (id: string) => {
    setNfes(prev => prev.filter(nfe => nfe.id !== id));
  };
  
  return { nfes, addNfes, removeNfe, setNfes };
};

const OrdemCarregamentoForm: React.FC<OrdemCarregamentoFormProps> = ({
  mode = 'create',
  initialData,
  onSubmit,
  onCancel,
  nfes: initialNfes = []
}) => {
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [cnpjRemetenteLoading, setCnpjRemetenteLoading] = useState(false);
  const [cnpjRemetenteError, setCnpjRemetenteError] = useState<string | null>(null);
  const [cnpjDestinatarioLoading, setCnpjDestinatarioLoading] = useState(false);
  const [cnpjDestinatarioError, setCnpjDestinatarioError] = useState<string | null>(null);
  
  // Estado para NFes importadas
  const { nfes, addNfes, removeNfe } = useNFeState(initialNfes);
  
  // Estado para cubagem
  const [showCubagemModal, setShowCubagemModal] = useState(false);
  const [selectedNotaForCubagem, setSelectedNotaForCubagem] = useState<NFe | null>(null);
  const [volumeData, setVolumeData] = useState<{ [nfeId: string]: NotaVolumeData }>({});
  const { toast } = useToast();

  const ordemForm = useForm<OrdemFormData>({
    resolver: zodResolver(ordemSchema),
    defaultValues: {
      tipo: 'Coleta',
      remetente: {
        cnpj: '',
        razaoSocial: '',
        nomeFantasia: '',
        endereco: '',
        numero: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: '',
        telefone: '',
        email: ''
      },
      destinatario: {
        cnpj: '',
        razaoSocial: '',
        nomeFantasia: '',
        endereco: '',
        numero: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: '',
        telefone: '',
        email: ''
      },
      observacoes: '',
      dataColeta: '',
      valorFrete: 0,
      tipoVeiculo: '',
      ...initialData
    }
  });

  const buscarDadosRemetente = async (cnpj: string) => {
    setCnpjRemetenteLoading(true);
    setCnpjRemetenteError(null);
    
    try {
      const data = await fetchCNPJData(cnpj);
      
      if (data && data.data) {
        ordemForm.setValue('remetente.razaoSocial', data.data.razaoSocial || '');
        ordemForm.setValue('remetente.nomeFantasia', data.data.nomeFantasia || '');
        ordemForm.setValue('remetente.endereco', data.data.endereco || '');
        ordemForm.setValue('remetente.numero', data.data.numero || '');
        ordemForm.setValue('remetente.bairro', data.data.bairro || '');
        ordemForm.setValue('remetente.cidade', data.data.cidade || '');
        ordemForm.setValue('remetente.uf', data.data.uf || '');
        ordemForm.setValue('remetente.cep', data.data.cep || '');
        ordemForm.setValue('remetente.telefone', data.data.telefone || '');
        ordemForm.setValue('remetente.email', data.data.email || '');
      }
    } catch (error) {
      setCnpjRemetenteError('Erro ao buscar dados do CNPJ');
    } finally {
      setCnpjRemetenteLoading(false);
    }
  };

  const buscarDadosDestinatario = async (cnpj: string) => {
    setCnpjDestinatarioLoading(true);
    setCnpjDestinatarioError(null);
    
    try {
      const data = await fetchCNPJData(cnpj);
      
      if (data && data.data) {
        ordemForm.setValue('destinatario.razaoSocial', data.data.razaoSocial || '');
        ordemForm.setValue('destinatario.nomeFantasia', data.data.nomeFantasia || '');
        ordemForm.setValue('destinatario.endereco', data.data.endereco || '');
        ordemForm.setValue('destinatario.numero', data.data.numero || '');
        ordemForm.setValue('destinatario.bairro', data.data.bairro || '');
        ordemForm.setValue('destinatario.cidade', data.data.cidade || '');
        ordemForm.setValue('destinatario.uf', data.data.uf || '');
        ordemForm.setValue('destinatario.cep', data.data.cep || '');
        ordemForm.setValue('destinatario.telefone', data.data.telefone || '');
        ordemForm.setValue('destinatario.email', data.data.email || '');
      }
    } catch (error) {
      setCnpjDestinatarioError('Erro ao buscar dados do CNPJ');
    } finally {
      setCnpjDestinatarioLoading(false);
    }
  };

  const calcularTotais = () => {
    // Priorizar dados de cubagem sobre dados originais das NFes
    return nfes.reduce((acc, nfe) => {
      const cubagemInfo = volumeData[nfe.id];
      return {
        volumes: acc.volumes + (nfe.volume || 0),
        peso: acc.peso + (cubagemInfo?.pesoTotal || nfe.peso || 0),
        valor: acc.valor + (nfe.valorDeclarado || 0),
        m3: acc.m3 + (cubagemInfo?.totalM3 || nfe.m3 || 0)
      };
    }, { volumes: 0, peso: 0, valor: 0, m3: 0 });
  };

  // Handlers para preenchimento automático dos dados
  const handleRemetenteData = (remetenteData: any) => {
    if (remetenteData) {
      const cnpjFormatado = remetenteData.cnpj ? 
        remetenteData.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '';
      
      ordemForm.setValue('remetente.razaoSocial', remetenteData.razaoSocial || remetenteData.xnome || '');
      ordemForm.setValue('remetente.cnpj', cnpjFormatado);
      ordemForm.setValue('remetente.nomeFantasia', remetenteData.nomeFantasia || remetenteData.xfant || '');
      ordemForm.setValue('remetente.endereco', remetenteData.endereco || remetenteData.xlgr || '');
      ordemForm.setValue('remetente.numero', remetenteData.numero || remetenteData.nro || '');
      ordemForm.setValue('remetente.bairro', remetenteData.bairro || remetenteData.xbairro || '');
      ordemForm.setValue('remetente.cidade', remetenteData.cidade || remetenteData.xmun || '');
      ordemForm.setValue('remetente.uf', remetenteData.uf || '');
      ordemForm.setValue('remetente.cep', remetenteData.cep || '');
      ordemForm.setValue('remetente.telefone', remetenteData.telefone || remetenteData.fone || '');
    }
  };

  const handleDestinatarioData = (destinatarioData: any) => {
    if (destinatarioData) {
      const cnpjFormatado = destinatarioData.cnpj ? 
        destinatarioData.cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') : '';
      
      ordemForm.setValue('destinatario.razaoSocial', destinatarioData.razaoSocial || destinatarioData.xnome || '');
      ordemForm.setValue('destinatario.cnpj', cnpjFormatado);
      ordemForm.setValue('destinatario.nomeFantasia', destinatarioData.nomeFantasia || destinatarioData.xfant || '');
      ordemForm.setValue('destinatario.endereco', destinatarioData.endereco || destinatarioData.xlgr || '');
      ordemForm.setValue('destinatario.numero', destinatarioData.numero || destinatarioData.nro || '');
      ordemForm.setValue('destinatario.bairro', destinatarioData.bairro || destinatarioData.xbairro || '');
      ordemForm.setValue('destinatario.cidade', destinatarioData.cidade || destinatarioData.xmun || '');
      ordemForm.setValue('destinatario.uf', destinatarioData.uf || '');
      ordemForm.setValue('destinatario.cep', destinatarioData.cep || '');
      ordemForm.setValue('destinatario.telefone', destinatarioData.telefone || destinatarioData.fone || '');
    }
  };

  // Funções para gerenciar cubagem
  const handleInformarCubagem = (nfe: NFe) => {
    setSelectedNotaForCubagem(nfe);
    setShowCubagemModal(true);
  };

  const handleSaveCubagem = (cubagemData: NotaVolumeData) => {
    setVolumeData(prev => ({
      ...prev,
      [cubagemData.notaId]: cubagemData
    }));
    
    toast({
      title: "Cubagem Atualizada",
      description: `Volumes da NFe ${cubagemData.numeroNota} atualizados com sucesso. Total: ${cubagemData.totalM3.toFixed(2)} m³`,
    });
  };

  const handleFormSubmit = (data: OrdemFormData) => {
    console.log('Dados da ordem:', data);
    console.log('NFes anexadas:', nfes);
    console.log('Dados de cubagem:', volumeData);
    
    if (onSubmit) {
      onSubmit(data);
    }
  };

  const totais = calcularTotais();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Nova Ordem de Carregamento' : 
             mode === 'edit' ? 'Editar Ordem de Carregamento' : 
             'Visualizar Ordem de Carregamento'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' ? 'Crie uma nova solicitação de carregamento' :
             mode === 'edit' ? 'Edite os dados da ordem de carregamento' :
             'Visualize os detalhes da ordem de carregamento'}
          </p>
        </div>
        <div className="flex gap-2">
          {mode !== 'create' && (
            <Button 
              onClick={() => setShowPrintDialog(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
          )}
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
        </div>
      </div>

      <Form {...ordemForm}>
        <form onSubmit={ordemForm.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Tipo de Ordem */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                Tipo de Ordem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={ordemForm.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Solicitação</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={mode === 'view'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de ordem" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Direta">Direta</SelectItem>
                        <SelectItem value="Coleta">Coleta</SelectItem>
                        <SelectItem value="Armazém">Armazém</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Seção de Importação de NFes */}
          {mode !== 'view' && (
            <XMLImportSection 
              onNFesImported={addNfes}
              onRemetenteData={handleRemetenteData}
              onDestinatarioData={handleDestinatarioData}
            />
          )}

          {/* Dados do Remetente e Destinatário - Layout em Colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dados do Remetente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Building className="w-5 h-5 text-green-500" />
                  Dados do Remetente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={ordemForm.control}
                  name="remetente.cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="00.000.000/0000-00" 
                          {...field}
                          disabled={mode === 'view'}
                          className="flex-1"
                          onChange={(e) => {
                            const formatted = formatCNPJ(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const clean = cleanCNPJ(field.value);
                            if (clean.length === 14) {
                              buscarDadosRemetente(clean);
                            } else {
                              toast({
                                title: "CNPJ Inválido",
                                description: "Digite um CNPJ válido com 14 dígitos",
                                variant: "destructive"
                              });
                            }
                          }}
                          disabled={cnpjRemetenteLoading || mode === 'view'}
                          className="px-3"
                        >
                          {cnpjRemetenteLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    {cnpjRemetenteError && (
                      <p className="text-sm text-red-500">{cnpjRemetenteError}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={ordemForm.control}
                  name="remetente.razaoSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome da empresa" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ordemForm.control}
                  name="remetente.telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(00) 00000-0000" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={ordemForm.control}
                  name="remetente.endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua, Avenida, etc...</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Endereço completo" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ordemForm.control}
                  name="remetente.numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Número" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ordemForm.control}
                  name="remetente.bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Bairro" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={ordemForm.control}
                  name="remetente.cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Cidade" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ordemForm.control}
                  name="remetente.uf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="UF" 
                          {...field} 
                          disabled={mode === 'view'}
                          maxLength={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ordemForm.control}
                  name="remetente.cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="00000-000" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <FormField
                  control={ordemForm.control}
                  name="remetente.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email@empresa.com" 
                          {...field} 
                          disabled={mode === 'view'}
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              </CardContent>
            </Card>

            {/* Dados do Destinatário */}
            <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                Dados do Destinatário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={ordemForm.control}
                name="destinatario.cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="00.000.000/0000-00" 
                          {...field}
                          disabled={mode === 'view'}
                          className="flex-1"
                          onChange={(e) => {
                            const formatted = formatCNPJ(e.target.value);
                            field.onChange(formatted);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const clean = cleanCNPJ(field.value);
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
                          disabled={cnpjDestinatarioLoading || mode === 'view'}
                          className="px-3"
                        >
                          {cnpjDestinatarioLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    {cnpjDestinatarioError && (
                      <p className="text-sm text-red-500">{cnpjDestinatarioError}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={ordemForm.control}
                  name="destinatario.razaoSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razão Social</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome da empresa" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ordemForm.control}
                  name="destinatario.nomeFantasia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Fantasia</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome fantasia" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={ordemForm.control}
                  name="destinatario.endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua, Avenida, etc...</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Endereço completo" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ordemForm.control}
                  name="destinatario.numero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Número" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ordemForm.control}
                  name="destinatario.bairro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Bairro" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={ordemForm.control}
                  name="destinatario.cidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Cidade" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ordemForm.control}
                  name="destinatario.uf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="UF" 
                          {...field} 
                          disabled={mode === 'view'}
                          maxLength={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ordemForm.control}
                  name="destinatario.cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="00000-000" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={ordemForm.control}
                  name="destinatario.telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(00) 00000-0000" 
                          {...field} 
                          disabled={mode === 'view'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={ordemForm.control}
                  name="destinatario.email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="email@empresa.com" 
                          {...field} 
                          disabled={mode === 'view'}
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            </Card>
          </div>

          {/* NFes Adicionadas */}
          {nfes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-500" />
                  NFes Adicionadas ({nfes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Total de Volumes</div>
                    <div className="text-2xl font-bold text-blue-800">{totais.volumes}</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Peso Total</div>
                    <div className="text-2xl font-bold text-green-800">{totais.peso.toFixed(2)} kg</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">M³ Total</div>
                    <div className="text-2xl font-bold text-yellow-800">{totais.m3.toFixed(2)}</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Valor Total</div>
                    <div className="text-2xl font-bold text-purple-800">R$ {totais.valor.toFixed(2)}</div>
                  </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {nfes.map((nfe, index) => {
                    const cubagemInfo = volumeData[nfe.id];
                    const hasCubagem = !!cubagemInfo;
                    
                    return (
                      <div key={index} className={`p-3 rounded-lg border ${!hasCubagem ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">NFe: {nfe.numero}</div>
                            <div className="text-sm text-gray-600">Chave: {nfe.chaveAcesso}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Remetente:</span> {nfe.remetente?.razaoSocial}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Destinatário:</span> {nfe.destinatario?.razaoSocial}
                            </div>
                            
                            {hasCubagem ? (
                              <div className="mt-2 text-xs text-green-600 bg-green-50 p-2 rounded">
                                <div className="font-medium">Dimensões informadas:</div>
                                <div>Volumes: {cubagemInfo.volumes.length} | M³: {cubagemInfo.totalM3.toFixed(2)}</div>
                              </div>
                            ) : (
                              <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                                <div className="font-medium">⚠️ Dimensões não informadas</div>
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm mb-2">
                              <div>Vol: {nfe.volume}</div>
                              <div>Peso: {(cubagemInfo?.pesoTotal || nfe.peso).toFixed(2)} kg</div>
                              <div>Valor: R$ {nfe.valorDeclarado.toFixed(2)}</div>
                              {hasCubagem && (
                                <div className="text-green-600 font-medium">M³: {cubagemInfo.totalM3.toFixed(2)}</div>
                              )}
                            </div>
                            
                            <Button
                              onClick={() => handleInformarCubagem(nfe)}
                              variant={hasCubagem ? "outline" : "default"}
                              size="sm"
                              className={`flex items-center gap-1 ${!hasCubagem ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}
                            >
                              Informar Dimensões
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informações Complementares */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Informações Complementares
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={ordemForm.control}
                name="observacoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações adicionais sobre a ordem de carregamento"
                        {...field}
                        disabled={mode === 'view'}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPrintDialog(true)}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Demonstrar Layouts de Impressão
              </Button>
            </div>
            
            {mode !== 'view' && (
              <div className="flex gap-4">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit" className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {mode === 'create' ? 'Criar Ordem' : 'Salvar Alterações'}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>

      {/* Modal de Impressão */}
      <PrintDialog 
        open={showPrintDialog}
        onClose={() => setShowPrintDialog(false)}
        formData={ordemForm.getValues()}
        nfes={nfes}
      />

      {/* Modal de Cubagem */}
      <CubagemManager
        open={showCubagemModal}
        onClose={() => setShowCubagemModal(false)}
        onSave={handleSaveCubagem}
        notaInfo={selectedNotaForCubagem ? {
          id: selectedNotaForCubagem.id,
          numero: selectedNotaForCubagem.numero,
          peso: selectedNotaForCubagem.peso,
          quantidadeVolumes: selectedNotaForCubagem.volume
        } : null}
        existingVolumes={selectedNotaForCubagem ? volumeData[selectedNotaForCubagem.id]?.volumes : undefined}
      />
    </div>
  );
};

export default OrdemCarregamentoForm;