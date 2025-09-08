import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CubagemManager from '../../components/comum/CubagemManager';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
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
  Plus,
  Edit,
  Trash2,
  Save,
  ArrowLeft,
  Box,
  Calculator,
  Eye,
  AlertTriangle,
  Search,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { fetchCNPJData, formatCNPJ, cleanCNPJ, type CNPJData } from '../../utils/cnpjApi';

// Volume calculation interfaces 
import { VolumeData, NotaVolumeData } from '../../components/comum/CubagemManager';

interface VolumeDataLocal {
  volume: number;
  altura: number;
  largura: number;
  comprimento: number;
  m3: number;
}

interface NotaVolumeDataLocal {
  notaId: string;
  numeroNota: string;
  volumes: VolumeData[];
  totalM3: number;
  pesoTotal: number;
  processOrder?: number;
}

interface NotaFiscalData {
  id: string;
  chave_nota_fiscal: string;
  data_hora_emissao: string;
  data_entrada_galpao: string;
  numero_nota: string;
  serie_nota: string;
  natureza_operacao: string;
  operacao: string;
  cliente_retira: string;
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
  valor_total: string;
  peso_bruto: string;
  observacoes: string;
  volumes?: VolumeData[];
}

const EditarNotaFiscal = () => {
  const [, setLocation] = useLocation();
  const [isVolumeModalOpen, setIsVolumeModalOpen] = useState(false);
  const [isEditingVolume, setIsEditingVolume] = useState(false);
  const [editingVolumeIndex, setEditingVolumeIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para busca de CNPJ
  const [isLoadingEmitenteCNPJ, setIsLoadingEmitenteCNPJ] = useState(false);
  const [isLoadingDestinatarioCNPJ, setIsLoadingDestinatarioCNPJ] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState<NotaFiscalData>({
    id: '',
    chave_nota_fiscal: '',
    data_hora_emissao: '',
    data_entrada_galpao: '',
    numero_nota: '',
    serie_nota: '',
    natureza_operacao: '',
    operacao: '',
    cliente_retira: '',
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
    quantidade_volumes: '',
    valor_nota_fiscal: '',
    valor_total: '',
    peso_bruto: '',
    observacoes: '',
    volumes: []
  });

  const [notaVolumeData, setNotaVolumeData] = useState<NotaVolumeData>({
    notaId: '',
    numeroNota: '',
    volumes: [],
    totalM3: 0,
    pesoTotal: 0
  });

  // Carrega dados da nota fiscal do localStorage ao montar o componente
  useEffect(() => {
    const savedEditData = localStorage.getItem('editingNFeData');
    if (savedEditData) {
      try {
        const parsedData = JSON.parse(savedEditData);
        console.log('Carregando NFe para edição:', parsedData);
        
        setFormData(parsedData);
        
        // Buscar volumes com dimensões do estado salvo da ordem
        const estadoOrdem = localStorage.getItem('estadoOrdemCarregamento');
        let volumesComDimensoes: VolumeData[] = [];
        
        if (estadoOrdem) {
          try {
            const estado = JSON.parse(estadoOrdem);
            console.log('Buscando volumes do estado da ordem:', estado);
            
            // Procurar volumes desta nota no batchVolumeData
            if (estado.batchVolumeData && estado.batchVolumeData.length > 0) {
              const volumeDataNota = estado.batchVolumeData.find((volumeData: any) => 
                volumeData.notaId === (parsedData.id || parsedData.chave_nota_fiscal) ||
                volumeData.numeroNota === parsedData.numero_nota
              );
              
              if (volumeDataNota && volumeDataNota.volumes) {
                volumesComDimensoes = volumeDataNota.volumes;
                console.log('Volumes encontrados com dimensões:', volumesComDimensoes);
              }
            }
          } catch (error) {
            console.error('Erro ao buscar volumes do estado:', error);
          }
        }
        
        // Configura dados de volume se existirem volumes com dimensões
        if (volumesComDimensoes.length > 0) {
          setNotaVolumeData({
            notaId: parsedData.id || parsedData.chave_nota_fiscal,
            numeroNota: parsedData.numero_nota,
            volumes: volumesComDimensoes,
            totalM3: volumesComDimensoes.reduce((sum: number, vol: VolumeData) => sum + vol.m3, 0),
            pesoTotal: parseFloat(parsedData.peso_bruto) || 0
          });
          console.log('Carregando volumes existentes com dimensões');
        } else if (parsedData.volumes && parsedData.volumes.length > 0) {
          setNotaVolumeData({
            notaId: parsedData.id || parsedData.chave_nota_fiscal,
            numeroNota: parsedData.numero_nota,
            volumes: parsedData.volumes,
            totalM3: parsedData.volumes.reduce((sum: number, vol: VolumeData) => sum + vol.m3, 0),
            pesoTotal: parseFloat(parsedData.peso_bruto) || 0
          });
          console.log('Carregando volumes da nota fiscal');
        } else {
          // Inicializa volumes baseados na quantidade se não houver volumes pré-definidos
          const quantidadeVolumes = parseInt(parsedData.quantidade_volumes) || 1;
          const volumesIniciais: VolumeData[] = [];
          
          for (let i = 1; i <= quantidadeVolumes; i++) {
            volumesIniciais.push({
              volume: i,
              altura: 0,
              largura: 0,
              comprimento: 0,
              m3: 0
            });
          }
          
          setNotaVolumeData({
            notaId: parsedData.id || parsedData.chave_nota_fiscal,
            numeroNota: parsedData.numero_nota,
            volumes: volumesIniciais,
            totalM3: 0,
            pesoTotal: parseFloat(parsedData.peso_bruto) || 0
          });
          
          console.log(`Inicializando ${quantidadeVolumes} volumes para nota ${parsedData.numero_nota}`);
        }
      } catch (error) {
        console.error('Erro ao carregar dados da NFe:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da nota fiscal.",
          variant: "destructive"
        });
        setLocation('/armazenagem/recebimento');
      }
    } else {
      // Se não há dados para editar, redireciona
      setLocation('/armazenagem/recebimento');
    }
  }, [setLocation]);

  // Handlers para inputs
  const handleInputChange = (field: keyof NotaFiscalData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Volume management functions
  const handleAddVolume = (volumeData: VolumeData) => {
    if (isEditingVolume && editingVolumeIndex !== null) {
      const updatedVolumes = [...notaVolumeData.volumes];
      updatedVolumes[editingVolumeIndex] = volumeData;
      
      setNotaVolumeData(prev => ({
        ...prev,
        volumes: updatedVolumes,
        totalM3: updatedVolumes.reduce((sum, vol) => sum + vol.m3, 0)
      }));
      
      setIsEditingVolume(false);
      setEditingVolumeIndex(null);
    } else {
      setNotaVolumeData(prev => ({
        ...prev,
        volumes: [...prev.volumes, volumeData],
        totalM3: prev.totalM3 + volumeData.m3
      }));
    }
    
    setIsVolumeModalOpen(false);
  };

  const handleEditVolume = (index: number) => {
    setEditingVolumeIndex(index);
    setIsEditingVolume(true);
    setIsVolumeModalOpen(true);
  };

  const handleDeleteVolume = (index: number) => {
    const volumeToDelete = notaVolumeData.volumes[index];
    setNotaVolumeData(prev => ({
      ...prev,
      volumes: prev.volumes.filter((_, i) => i !== index),
      totalM3: prev.totalM3 - volumeToDelete.m3
    }));
  };

  const handleSaveNota = async () => {
    setIsLoading(true);
    
    try {
      // Atualiza os dados da nota com os volumes editados
      const updatedData = {
        ...formData,
        volumes: notaVolumeData.volumes,
        quantidade_volumes: notaVolumeData.volumes.length.toString()
      };

      // Salva os dados editados no localStorage para serem recuperados pelo componente pai
      localStorage.setItem('editedNFeData', JSON.stringify(updatedData));
      
      toast({
        title: "Sucesso",
        description: "Nota fiscal editada com sucesso!",
        variant: "default"
      });

      // Remove dados de edição do localStorage
      localStorage.removeItem('editingNFeData');
      
      // Redireciona para a página de origem ou fallback
      const originPage = localStorage.getItem('editOriginPage') || '/armazenagem/recebimento';
      localStorage.removeItem('editOriginPage');
      setLocation(originPage);
      
    } catch (error) {
      console.error('Erro ao salvar nota:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar a nota fiscal.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para salvar cubagem
  const handleSaveCubagem = (data: NotaVolumeData) => {
    setNotaVolumeData(data);
    
    // Atualiza automaticamente o campo "Quantidade de Volumes" no formulário
    setFormData(prev => ({
      ...prev,
      quantidade_volumes: data.volumes.length.toString()
    }));
    
    setIsVolumeModalOpen(false);
    
    toast({
      title: "Sucesso",
      description: `Dimensões atualizadas! ${data.volumes.length} volumes, Total: ${data.totalM3.toFixed(2)} m³`,
      variant: "default"
    });
  };

  const handleCancel = () => {
    localStorage.removeItem('editingNFeData');
    
    // Redireciona para a página de origem ou fallback
    const originPage = localStorage.getItem('editOriginPage') || '/armazenagem/recebimento';
    localStorage.removeItem('editOriginPage');
    setLocation(originPage);
  };

  // Funções de busca de CNPJ
  const buscarDadosEmitente = async () => {
    const cnpj = cleanCNPJ(formData.emitente_cnpj);
    if (cnpj.length !== 14) {
      toast({
        title: "CNPJ Inválido",
        description: "Digite um CNPJ válido com 14 dígitos",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingEmitenteCNPJ(true);
    try {
      const result = await fetchCNPJData(cnpj);
      
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          emitente_cnpj: formatCNPJ(result.data!.cnpj),
          emitente_razao_social: result.data!.razaoSocial,
          emitente_telefone: result.data!.telefone,
          emitente_uf: result.data!.uf,
          emitente_cidade: result.data!.cidade,
          emitente_bairro: result.data!.bairro,
          emitente_endereco: result.data!.endereco,
          emitente_numero: result.data!.numero,
          emitente_cep: result.data!.cep
        }));
        
        toast({
          title: "Sucesso",
          description: "Dados do emitente preenchidos automaticamente",
          variant: "default"
        });
      } else {
        toast({
          title: "CNPJ não encontrado",
          description: result.error || "Não foi possível encontrar os dados do CNPJ",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: "Erro ao consultar CNPJ. Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsLoadingEmitenteCNPJ(false);
    }
  };

  const buscarDadosDestinatario = async () => {
    const cnpj = cleanCNPJ(formData.destinatario_cnpj);
    if (cnpj.length !== 14) {
      toast({
        title: "CNPJ Inválido",
        description: "Digite um CNPJ válido com 14 dígitos",
        variant: "destructive"
      });
      return;
    }

    setIsLoadingDestinatarioCNPJ(true);
    try {
      const result = await fetchCNPJData(cnpj);
      
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          destinatario_cnpj: formatCNPJ(result.data!.cnpj),
          destinatario_razao_social: result.data!.razaoSocial,
          destinatario_telefone: result.data!.telefone,
          destinatario_uf: result.data!.uf,
          destinatario_cidade: result.data!.cidade,
          destinatario_bairro: result.data!.bairro,
          destinatario_endereco: result.data!.endereco,
          destinatario_numero: result.data!.numero,
          destinatario_cep: result.data!.cep
        }));
        
        toast({
          title: "Sucesso",
          description: "Dados do destinatário preenchidos automaticamente",
          variant: "default"
        });
      } else {
        toast({
          title: "CNPJ não encontrado",
          description: result.error || "Não foi possível encontrar os dados do CNPJ",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro na consulta",
        description: "Erro ao consultar CNPJ. Tente novamente",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDestinatarioCNPJ(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div>
              <h2 className="text-2xl font-heading">Editar Nota Fiscal</h2>
              <p className="text-gray-600">Edição de dados da nota fiscal e volumes cadastrados</p>
            </div>
          </div>
          
          {formData.numero_nota && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <FileText className="h-5 w-5" />
                <span className="font-medium">
                  Editando: NF {formData.numero_nota} - {formData.emitente_razao_social}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de Edição */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Dados da Nota Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                      className="input-micro color-transition"
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
                      placeholder="dd/mm/aaaa"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data_entrada_galpao">Data de Entrada no Galpão</Label>
                    <Input
                      id="data_entrada_galpao"
                      type="date"
                      value={formData.data_entrada_galpao}
                      onChange={(e) => handleInputChange('data_entrada_galpao', e.target.value)}
                      className="input-micro color-transition"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor_total">Valor Total (R$)</Label>
                    <Input
                      id="valor_total"
                      value={formData.valor_total}
                      onChange={(e) => handleInputChange('valor_total', e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="natureza_operacao">Natureza da Operação</Label>
                    <Input
                      id="natureza_operacao"
                      value={formData.natureza_operacao}
                      onChange={(e) => handleInputChange('natureza_operacao', e.target.value)}
                      placeholder=""
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="operacao">Operação</Label>
                    <Select value={formData.operacao} onValueChange={(value) => handleInputChange('operacao', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a operação" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Coleta TRANSUL">Coleta TRANSUL</SelectItem>
                        <SelectItem value="Entrega Direta">Entrega Direta</SelectItem>
                        <SelectItem value="Armazenagem">Armazenagem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chave_nota_fiscal">Chave de Acesso da Nota Fiscal</Label>
                  <Input
                    id="chave_nota_fiscal"
                    value={formData.chave_nota_fiscal}
                    onChange={(e) => handleInputChange('chave_nota_fiscal', e.target.value)}
                    placeholder="44 dígitos"
                    maxLength={44}
                    className="font-mono text-sm"
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
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emitente_cnpj">CNPJ</Label>
                      <div className="flex gap-2">
                        <Input
                          id="emitente_cnpj"
                          value={formData.emitente_cnpj}
                          onChange={(e) => handleInputChange('emitente_cnpj', e.target.value)}
                          placeholder="00.000.000/0000-00"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={buscarDadosEmitente}
                          disabled={isLoadingEmitenteCNPJ}
                          className="px-3"
                        >
                          {isLoadingEmitenteCNPJ ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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
                    <div className="space-y-2">
                      <Label htmlFor="emitente_telefone">Telefone</Label>
                      <Input
                        id="emitente_telefone"
                        value={formData.emitente_telefone}
                        onChange={(e) => handleInputChange('emitente_telefone', e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emitente_uf">UF</Label>
                      <Input
                        id="emitente_uf"
                        value={formData.emitente_uf}
                        onChange={(e) => handleInputChange('emitente_uf', e.target.value)}
                        placeholder=""
                        maxLength={2}
                      />
                    </div>
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

                  <div className="grid grid-cols-3 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="emitente_cep">CEP</Label>
                      <Input
                        id="emitente_cep"
                        value={formData.emitente_cep}
                        onChange={(e) => handleInputChange('emitente_cep', e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                </div>

                {/* Dados do Destinatário - Coluna Direita */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dados do Destinatário
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="destinatario_cnpj">CNPJ</Label>
                      <div className="flex gap-2">
                        <Input
                          id="destinatario_cnpj"
                          value={formData.destinatario_cnpj}
                          onChange={(e) => handleInputChange('destinatario_cnpj', e.target.value)}
                          placeholder="00.000.000/0000-00"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={buscarDadosDestinatario}
                          disabled={isLoadingDestinatarioCNPJ}
                          className="px-3"
                        >
                          {isLoadingDestinatarioCNPJ ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Search className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
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
                    <div className="space-y-2">
                      <Label htmlFor="destinatario_telefone">Telefone</Label>
                      <Input
                        id="destinatario_telefone"
                        value={formData.destinatario_telefone}
                        onChange={(e) => handleInputChange('destinatario_telefone', e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="destinatario_uf">UF</Label>
                      <Input
                        id="destinatario_uf"
                        value={formData.destinatario_uf}
                        onChange={(e) => handleInputChange('destinatario_uf', e.target.value)}
                        placeholder=""
                        maxLength={2}
                      />
                    </div>
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

                  <div className="grid grid-cols-3 gap-4">
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
                    <div className="space-y-2">
                      <Label htmlFor="destinatario_cep">CEP</Label>
                      <Input
                        id="destinatario_cep"
                        value={formData.destinatario_cep}
                        onChange={(e) => handleInputChange('destinatario_cep', e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Dados Adicionais */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Dados Adicionais
                </h4>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantidade_volumes">Quantidade de Volumes</Label>
                    <Input
                      id="quantidade_volumes"
                      value={formData.quantidade_volumes}
                      onChange={(e) => handleInputChange('quantidade_volumes', e.target.value)}
                      placeholder="0"
                      type="number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor_nota_fiscal">Valor da Nota Fiscal</Label>
                    <Input
                      id="valor_nota_fiscal"
                      value={formData.valor_nota_fiscal}
                      onChange={(e) => handleInputChange('valor_nota_fiscal', e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="peso_bruto">Peso Bruto (kg)</Label>
                    <Input
                      id="peso_bruto"
                      value={formData.peso_bruto}
                      onChange={(e) => handleInputChange('peso_bruto', e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    placeholder="Observações adicionais..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveNota}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Extrato de Volumes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Extrato de Volumes - Cubagem ({notaVolumeData.volumes.length} {notaVolumeData.volumes.length === 1 ? 'nota' : 'notas'})
                </div>
                <Button
                  onClick={() => setIsVolumeModalOpen(true)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  Informar Dimensões
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {notaVolumeData.volumes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Box className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhum volume cadastrado</p>
                  <p className="text-sm">Clique em "Adicionar Volume" para começar</p>
                </div>
              ) : (
                <>
                  {/* Lista de Volumes */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {notaVolumeData.volumes.map((volume, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              Volume {index + 1}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              Volume: {volume.m3.toFixed(2)} m³
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="font-medium">Dimensões:</span><br />
                              {volume.altura} × {volume.largura} × {volume.comprimento} m
                            </div>
                            <div>
                              <span className="font-medium">Volume:</span><br />
                              {volume.m3.toFixed(2)} m³
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Resumo */}
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {notaVolumeData.volumes.length}
                          </div>
                          <div className="text-xs text-blue-600">Volumes</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {notaVolumeData.totalM3.toFixed(2)}
                          </div>
                          <div className="text-xs text-blue-600">m³ Total</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-blue-600">
                            {notaVolumeData.pesoTotal.toFixed(2)}
                          </div>
                          <div className="text-xs text-blue-600">kg Total</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cubagem Manager */}
        {isVolumeModalOpen && (
          <CubagemManager
            open={isVolumeModalOpen}
            onClose={() => {
              setIsVolumeModalOpen(false);
              setIsEditingVolume(false);
              setEditingVolumeIndex(null);
            }}
            onSave={handleSaveCubagem}
            notaInfo={{
              id: formData.chave_nota_fiscal,
              numero: formData.numero_nota,
              peso: parseFloat(formData.peso_bruto || '0'),
              quantidadeVolumes: parseInt(formData.quantidade_volumes || '0')
            }}
            existingVolumes={notaVolumeData.volumes}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default EditarNotaFiscal;