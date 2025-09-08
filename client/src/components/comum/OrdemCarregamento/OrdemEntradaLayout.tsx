import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { useDropzone } from 'react-dropzone';
import { 
  Edit,
  Upload,
  Search,
  Plus,
  X,
  Package,
  FileText,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Building,
  MapPin,
  Phone,
  Weight,
  DollarSign,
  Calculator
} from 'lucide-react';

interface OrdemEntradaLayoutProps {
  form: any;
  empresaData: any;
  notasFiscais: any[];
  batchVolumeData: any[];
  isProcessing: boolean;
  xmlFiles: File[];
  collectedKeys: string[];
  chaveNFeInput: string;
  isApiLoading: boolean;
  duplicateWarning: boolean;
  showSuccessAnimation: boolean;
  onXmlDrop: any;
  onXmlInput: any;
  isDragActive: boolean;
  onChaveChange: (value: string) => void;
  onAdicionarChave: () => void;
  onImportarAPI: () => void;
  onCriarManual: () => void;
  onAbrirVolumes: (numeroNota: string) => void;
  onRemoverNota: (notaId: string) => void;
  onFinalizar: () => void;
}

export default function OrdemEntradaLayout({
  form,
  empresaData,
  notasFiscais,
  batchVolumeData,
  isProcessing,
  xmlFiles,
  collectedKeys,
  chaveNFeInput,
  isApiLoading,
  duplicateWarning,
  showSuccessAnimation,
  onXmlDrop,
  onXmlInput,
  isDragActive,
  onChaveChange,
  onAdicionarChave,
  onImportarAPI,
  onCriarManual,
  onAbrirVolumes,
  onRemoverNota,
  onFinalizar
}: OrdemEntradaLayoutProps) {

  // Função para buscar dados do CNPJ
  const buscarDadosCNPJ = async (cnpj: string, tipo: 'remetente' | 'destinatario') => {
    if (!cnpj || cnpj.length < 14) return;
    
    try {
      const cnpjLimpo = cnpj.replace(/\D/g, '');
      console.log(`Buscando CNPJ ${tipo}:`, cnpjLimpo);
      
      const response = await fetch(`/api/lookup-cnpj/${cnpjLimpo}`);
      const result = await response.json();
      
      console.log(`Resposta da API para ${tipo}:`, result);
      
      if (result.success && result.data) {
        const data = result.data;
        
        if (tipo === 'remetente') {
          form.setValue('remetente_razao_social', data.razaoSocial || data.nome || '');
          form.setValue('remetente_telefone', data.telefone || '');
          form.setValue('remetente_uf', data.uf || '');
          form.setValue('remetente_cidade', data.cidade || '');
          form.setValue('remetente_bairro', data.bairro || '');
          form.setValue('remetente_endereco', data.endereco || data.logradouro || '');
          form.setValue('remetente_numero', data.numero || '');
          form.setValue('remetente_cep', data.cep || '');
        } else {
          form.setValue('destinatario_razao_social', data.razaoSocial || data.nome || '');
          form.setValue('destinatario_telefone', data.telefone || '');
          form.setValue('destinatario_uf', data.uf || '');
          form.setValue('destinatario_cidade', data.cidade || '');
          form.setValue('destinatario_bairro', data.bairro || '');
          form.setValue('destinatario_endereco', data.endereco || data.logradouro || '');
          form.setValue('destinatario_numero', data.numero || '');
          form.setValue('destinatario_cep', data.cep || '');
        }
        
        // Toast de sucesso
        import('sonner').then(({ toast }) => {
          toast.success(`Dados do ${tipo} preenchidos automaticamente!`);
        });
      } else {
        console.error(`Erro na busca CNPJ ${tipo}:`, result.error);
        import('sonner').then(({ toast }) => {
          toast.error(result.error || 'CNPJ não encontrado ou inválido');
        });
      }
    } catch (error) {
      console.error(`Erro ao buscar CNPJ ${tipo}:`, error);
      import('sonner').then(({ toast }) => {
        toast.error('Erro ao consultar CNPJ');
      });
    }
  };

  const calcularTotais = () => {
    const totalVolumes = (notasFiscais || []).reduce((sum: number, nf: any) => sum + parseInt(nf.quantidade_volumes || '0'), 0);
    const totalPeso = (notasFiscais || []).reduce((sum: number, nf: any) => sum + parseFloat(nf.peso_bruto || '0'), 0);
    const totalValor = (notasFiscais || []).reduce((sum: number, nf: any) => sum + parseFloat(nf.valor_nota_fiscal || '0'), 0);
    const totalM3 = (batchVolumeData || []).reduce((sum: number, vol: any) => sum + (vol.totalM3 || 0), 0);

    return { totalVolumes, totalPeso, totalValor, totalM3 };
  };

  const totais = calcularTotais();

  // Obter remetentes e destinatários únicos
  const remetentesUnicos = Array.from(new Set(
    (notasFiscais || []).map(nf => nf.emitente_cnpj)
  )).map(cnpj => {
    const nota = (notasFiscais || []).find(nf => nf.emitente_cnpj === cnpj);
    return {
      cnpj: nota?.emitente_cnpj || '',
      razaoSocial: nota?.emitente_razao_social || '',
      endereco: nota?.emitente_endereco || '',
      cidade: nota?.emitente_cidade || '',
      uf: nota?.emitente_uf || '',
      telefone: nota?.emitente_telefone || ''
    };
  });

  const destinatariosUnicos = Array.from(new Set(
    (notasFiscais || []).map(nf => nf.destinatario_cnpj)
  )).map(cnpj => {
    const nota = (notasFiscais || []).find(nf => nf.destinatario_cnpj === cnpj);
    return {
      cnpj: nota?.destinatario_cnpj || '',
      razaoSocial: nota?.destinatario_razao_social || '',
      endereco: nota?.destinatario_endereco || '',
      cidade: nota?.destinatario_cidade || '',
      uf: nota?.destinatario_uf || '',
      telefone: nota?.destinatario_telefone || ''
    };
  });

  return (
    <div className="space-y-6">
      {/* 1. Classificação do Documento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            1. Classificação do Documento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="tipo_movimentacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Movimentação</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Entrada">Entrada</SelectItem>
                        <SelectItem value="Saída">Saída</SelectItem>
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
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Recebimento">Recebimento</SelectItem>
                        <SelectItem value="Coleta">Coleta</SelectItem>
                        <SelectItem value="Devolucao">Devolução</SelectItem>
                        <SelectItem value="Transferencia">Transferência</SelectItem>
                        <SelectItem value="Armazem">Armazém</SelectItem>
                        <SelectItem value="Direta">Direta</SelectItem>
                        <SelectItem value="Entrega">Entrega</SelectItem>
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
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Baixa">Baixa</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="data_operacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Operação</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </CardContent>
      </Card>

      {/* 2. Métodos de Preenchimento */}
      <Card>
        <CardHeader>
          <CardTitle>2. Métodos de Preenchimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Manual */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer">
              <CardHeader className="text-center">
                <Edit className="h-8 w-8 mx-auto text-gray-500" />
                <CardTitle className="text-sm">1. Manual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Dados da Carga */}
                <div className="border rounded-lg p-3 bg-gray-50">
                  <h4 className="font-medium text-sm mb-3">Dados da Carga</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Peso (kg)</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={form.watch('peso_bruto_total') || ''}
                        onChange={(e) => form.setValue('peso_bruto_total', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Volumes</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={form.watch('quantidade_volumes_total') || ''}
                        onChange={(e) => form.setValue('quantidade_volumes_total', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Valor (R$)</Label>
                      <Input
                        type="text"
                        placeholder="0,00"
                        value={form.watch('valor_total') || ''}
                        onChange={(e) => {
                          // Formatação de moeda
                          let value = e.target.value.replace(/\D/g, '');
                          value = value.replace(/(\d)(\d{2})$/, '$1,$2');
                          value = value.replace(/(?=(\d{3})+(\D))\B/g, '.');
                          form.setValue('valor_total', value);
                        }}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Remetente */}
                <div className="border rounded-lg p-3 bg-blue-50">
                  <h4 className="font-medium text-sm mb-3 text-blue-700">Remetente</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="CNPJ Remetente"
                        value={form.watch('remetente_cnpj') || ''}
                        onChange={(e) => form.setValue('remetente_cnpj', e.target.value)}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => buscarDadosCNPJ(form.watch('remetente_cnpj'), 'remetente')}
                        disabled={!form.watch('remetente_cnpj') || form.watch('remetente_cnpj').length < 14}
                      >
                        <Search className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Razão Social"
                      value={form.watch('remetente_razao_social') || ''}
                      onChange={(e) => form.setValue('remetente_razao_social', e.target.value)}
                      className="text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Telefone"
                        value={form.watch('remetente_telefone') || ''}
                        onChange={(e) => form.setValue('remetente_telefone', e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        placeholder="UF"
                        value={form.watch('remetente_uf') || ''}
                        onChange={(e) => form.setValue('remetente_uf', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Cidade"
                        value={form.watch('remetente_cidade') || ''}
                        onChange={(e) => form.setValue('remetente_cidade', e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Bairro"
                        value={form.watch('remetente_bairro') || ''}
                        onChange={(e) => form.setValue('remetente_bairro', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Endereço"
                        value={form.watch('remetente_endereco') || ''}
                        onChange={(e) => form.setValue('remetente_endereco', e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Número"
                        value={form.watch('remetente_numero') || ''}
                        onChange={(e) => form.setValue('remetente_numero', e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        placeholder="CEP"
                        value={form.watch('remetente_cep') || ''}
                        onChange={(e) => form.setValue('remetente_cep', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Destinatário */}
                <div className="border rounded-lg p-3 bg-green-50">
                  <h4 className="font-medium text-sm mb-3 text-green-700">Destinatário</h4>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="CNPJ Destinatário"
                        value={form.watch('destinatario_cnpj') || ''}
                        onChange={(e) => form.setValue('destinatario_cnpj', e.target.value)}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => buscarDadosCNPJ(form.watch('destinatario_cnpj'), 'destinatario')}
                        disabled={!form.watch('destinatario_cnpj') || form.watch('destinatario_cnpj').length < 14}
                      >
                        <Search className="h-3 w-3" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Razão Social"
                      value={form.watch('destinatario_razao_social') || ''}
                      onChange={(e) => form.setValue('destinatario_razao_social', e.target.value)}
                      className="text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Telefone"
                        value={form.watch('destinatario_telefone') || ''}
                        onChange={(e) => form.setValue('destinatario_telefone', e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        placeholder="UF"
                        value={form.watch('destinatario_uf') || ''}
                        onChange={(e) => form.setValue('destinatario_uf', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Cidade"
                        value={form.watch('destinatario_cidade') || ''}
                        onChange={(e) => form.setValue('destinatario_cidade', e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Bairro"
                        value={form.watch('destinatario_bairro') || ''}
                        onChange={(e) => form.setValue('destinatario_bairro', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Endereço"
                        value={form.watch('destinatario_endereco') || ''}
                        onChange={(e) => form.setValue('destinatario_endereco', e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Número"
                        value={form.watch('destinatario_numero') || ''}
                        onChange={(e) => form.setValue('destinatario_numero', e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        placeholder="CEP"
                        value={form.watch('destinatario_cep') || ''}
                        onChange={(e) => form.setValue('destinatario_cep', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={onCriarManual}
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Criar Nota Manual
                </Button>
              </CardContent>
            </Card>

            {/* Upload XML */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-green-500 transition-colors">
              <CardHeader className="text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-500" />
                <CardTitle className="text-sm">2. Upload XML (Lote)</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  {...onXmlDrop()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'
                  }`}
                >
                  <input {...onXmlInput()} />
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {isDragActive
                      ? 'Solte os arquivos XML aqui...'
                      : 'Arraste XMLs ou clique para selecionar'
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Aceita múltiplos arquivos .xml
                  </p>
                </div>
                {xmlFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Arquivos selecionados:</p>
                    <ul className="text-xs text-gray-600">
                      {xmlFiles.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Busca API */}
            <Card className="border-2 border-dashed border-gray-300 hover:border-orange-500 transition-colors">
              <CardHeader className="text-center">
                <Search className="h-8 w-8 mx-auto text-gray-500" />
                <CardTitle className="text-sm">3. Importar NFe</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Chave NFe (44 dígitos)</Label>
                  <Input
                    placeholder="Cole ou digite a chave de 44 dígitos"
                    value={chaveNFeInput}
                    onChange={(e) => onChaveChange(e.target.value)}
                    className={duplicateWarning ? 'border-orange-500 bg-orange-50' : ''}
                    onKeyPress={(e) => e.key === 'Enter' && onAdicionarChave()}
                  />
                </div>
                
                <Button 
                  onClick={onAdicionarChave}
                  className="w-full"
                  disabled={!chaveNFeInput || chaveNFeInput.length !== 44}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>

                {collectedKeys.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Chaves coletadas ({collectedKeys.length})
                    </Label>
                    <div className="max-h-20 overflow-y-auto space-y-1">
                      {collectedKeys.map((key, index) => (
                        <div key={index} className="text-xs bg-gray-50 p-1 rounded">
                          {key.substring(0, 8)}...{key.substring(-8)}
                        </div>
                      ))}
                    </div>
                    <Button 
                      onClick={onImportarAPI}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isApiLoading}
                    >
                      {isApiLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Importar NFe
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* 3. Dados Remetente/Destinatário */}
      {(remetentesUnicos.length > 0 || destinatariosUnicos.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Remetentes */}
          {remetentesUnicos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Building className="h-5 w-5" />
                  Remetentes ({remetentesUnicos.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {remetentesUnicos.map((remetente, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>CNPJ:</strong> {remetente.cnpj}</div>
                      <div><strong>Telefone:</strong> {remetente.telefone}</div>
                      <div className="col-span-2"><strong>Razão Social:</strong> {remetente.razaoSocial}</div>
                      <div><strong>UF:</strong> {remetente.uf}</div>
                      <div><strong>Cidade:</strong> {remetente.cidade}</div>
                      <div className="col-span-2">
                        <strong>Endereço:</strong> {remetente.endereco}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Destinatários */}
          {destinatariosUnicos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <MapPin className="h-5 w-5" />
                  Destinatários ({destinatariosUnicos.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {destinatariosUnicos.map((destinatario, index) => (
                  <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>CNPJ:</strong> {destinatario.cnpj}</div>
                      <div><strong>Telefone:</strong> {destinatario.telefone}</div>
                      <div className="col-span-2"><strong>Razão Social:</strong> {destinatario.razaoSocial}</div>
                      <div><strong>UF:</strong> {destinatario.uf}</div>
                      <div><strong>Cidade:</strong> {destinatario.cidade}</div>
                      <div className="col-span-2">
                        <strong>Endereço:</strong> {destinatario.endereco}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 4. Extrato de Volumes */}
      {notasFiscais.length > 0 && (
        <Card data-section="extrato-volumes">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              4. Extrato de Volumes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-2 text-left">Número</th>
                    <th className="border border-gray-300 p-2 text-left">Série</th>
                    <th className="border border-gray-300 p-2 text-left">Emitente</th>
                    <th className="border border-gray-300 p-2 text-left">Destinatário</th>
                    <th className="border border-gray-300 p-2 text-center">Vols</th>
                    <th className="border border-gray-300 p-2 text-center">Peso (kg)</th>
                    <th className="border border-gray-300 p-2 text-center">Valor (R$)</th>
                    <th className="border border-gray-300 p-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {notasFiscais.map((nota, index) => {
                    const volumeInfo = batchVolumeData.find(v => v.notaId === nota.id);
                    const temDimensoes = volumeInfo?.volumes?.some(v => v.m3 > 0);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 p-2">{nota.numero_nota}</td>
                        <td className="border border-gray-300 p-2">{nota.serie_nota}</td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {nota.emitente_razao_social}
                          <br />
                          <span className="text-gray-500">{nota.emitente_cnpj}</span>
                        </td>
                        <td className="border border-gray-300 p-2 text-sm">
                          {nota.destinatario_razao_social}
                          <br />
                          <span className="text-gray-500">{nota.destinatario_cnpj}</span>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">{nota.quantidade_volumes}</td>
                        <td className="border border-gray-300 p-2 text-center">{parseFloat(nota.peso_bruto || '0').toFixed(2)}</td>
                        <td className="border border-gray-300 p-2 text-center">R$ {(parseFloat(nota.valor_nota_fiscal || '0')).toFixed(2)}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          <div className="flex gap-1 justify-center">
                            <Button
                              size="sm"
                              variant={temDimensoes ? "default" : "destructive"}
                              onClick={() => onAbrirVolumes(nota.numero_nota)}
                              className={temDimensoes ? "" : "bg-red-50 border-red-200 text-red-700"}
                            >
                              <Package className="h-3 w-3 mr-1" />
                              {temDimensoes ? "Dimensões OK" : "⚠️ Sem Dimensões"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onRemoverNota(nota.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Resumo dos totais */}
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{totais.totalVolumes}</div>
                <div className="text-sm text-gray-600">Total Volumes</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{totais.totalPeso.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Peso (kg)</div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{totais.totalM3.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total m³</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">R$ {totais.totalValor.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Valor</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. Observações */}
      <Card>
        <CardHeader>
          <CardTitle>5. Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações Gerais</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Digite observações sobre a ordem..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Form>
        </CardContent>
      </Card>

      {/* 6. Finalização */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end space-x-4">
            <Button
              onClick={onFinalizar}
              disabled={notasFiscais.length === 0 || isProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Finalizar Ordem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Animação de sucesso */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-lg font-semibold">Operação realizada com sucesso!</h3>
          </div>
        </div>
      )}
    </div>
  );
}