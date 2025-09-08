import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Package, 
  MapPin, 
  FileText, 
  Truck, 
  Calendar,
  DollarSign,
  Weight,
  Ruler,
  User,
  Phone,
  Building
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { InteractiveButton } from '@/components/ui/interactive-button';

const ordemSchema = z.object({
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  enderecoOrigem: z.string().min(1, 'Endereço de origem é obrigatório'),
  enderecoDestino: z.string().min(1, 'Endereço de destino é obrigatório'),
  contatoOrigem: z.string().min(1, 'Contato de origem é obrigatório'),
  contatoDestino: z.string().min(1, 'Contato de destino é obrigatório'),
  telefoneOrigem: z.string().min(1, 'Telefone de origem é obrigatório'),
  telefoneDestino: z.string().min(1, 'Telefone de destino é obrigatório'),
  instrucoes: z.string().optional(),
  prazoEntrega: z.string().min(1, 'Prazo de entrega é obrigatório'),
  valorFrete: z.string().min(1, 'Valor do frete é obrigatório')
});

const nfeSchema = z.object({
  chaveAcesso: z.string().length(44, 'Chave de acesso deve ter 44 dígitos'),
  numero: z.string().min(1, 'Número da NFe é obrigatório'),
  valorDeclarado: z.string().min(1, 'Valor declarado é obrigatório'),
  peso: z.string().min(1, 'Peso é obrigatório'),
  volume: z.string().min(1, 'Volume é obrigatório')
});

function OrdemCarregamento() {
  const [activeTab, setActiveTab] = useState('dados-gerais');
  const [nfes, setNfes] = useState<any[]>([]);
  const [showNfeDialog, setShowNfeDialog] = useState(false);

  const ordemForm = useForm({
    resolver: zodResolver(ordemSchema),
    defaultValues: {
      tipo: '',
      enderecoOrigem: '',
      enderecoDestino: '',
      contatoOrigem: '',
      contatoDestino: '',
      telefoneOrigem: '',
      telefoneDestino: '',
      instrucoes: '',
      prazoEntrega: '',
      valorFrete: ''
    }
  });

  const nfeForm = useForm({
    resolver: zodResolver(nfeSchema),
    defaultValues: {
      chaveAcesso: '',
      numero: '',
      valorDeclarado: '',
      peso: '',
      volume: ''
    }
  });

  const onSubmitOrdem = (data: any) => {
    console.log('Ordem de Carregamento:', data);
    console.log('NFes:', nfes);
    // Here would integrate with backend API
  };

  const onSubmitNfe = (data: any) => {
    setNfes([...nfes, { ...data, id: Date.now() }]);
    nfeForm.reset();
    setShowNfeDialog(false);
  };

  const removeNfe = (id: number) => {
    setNfes(nfes.filter(nfe => nfe.id !== id));
  };

  const calcularTotais = () => {
    const totalPeso = nfes.reduce((sum, nfe) => sum + parseFloat(nfe.peso || 0), 0);
    const totalVolume = nfes.reduce((sum, nfe) => sum + parseFloat(nfe.volume || 0), 0);
    const totalValor = nfes.reduce((sum, nfe) => sum + parseFloat(nfe.valorDeclarado || 0), 0);
    
    return { totalPeso, totalVolume, totalValor };
  };

  const { totalPeso, totalVolume, totalValor } = calcularTotais();

  return (
    <MainLayout title="Nova Ordem de Carregamento">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nova Ordem de Carregamento</h1>
            <p className="text-gray-600 mt-2">Crie uma nova ordem de carregamento com múltiplas NFes</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">Cancelar</Button>
            <Button onClick={ordemForm.handleSubmit(onSubmitOrdem)}>
              <Package className="w-4 h-4 mr-2" />
              Criar Ordem
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dados-gerais">Dados Gerais</TabsTrigger>
                <TabsTrigger value="enderecos">Endereços</TabsTrigger>
                <TabsTrigger value="nfes">Notas Fiscais</TabsTrigger>
              </TabsList>

              {/* Dados Gerais Tab */}
              <TabsContent value="dados-gerais">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Informações Gerais
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Form {...ordemForm}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={ordemForm.control}
                          name="tipo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Ordem</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="direta">Direta</SelectItem>
                                  <SelectItem value="coleta">Coleta</SelectItem>
                                  <SelectItem value="transferencia">Transferência</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={ordemForm.control}
                          name="prazoEntrega"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prazo de Entrega</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={ordemForm.control}
                          name="valorFrete"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valor do Frete (R$)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={ordemForm.control}
                        name="instrucoes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instruções Especiais</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Instruções para coleta, entrega ou manuseio especial..."
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
              </TabsContent>

              {/* Endereços Tab */}
              <TabsContent value="enderecos">
                <div className="space-y-6">
                  {/* Origem */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-green-500" />
                        Endereço de Origem
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Form {...ordemForm}>
                        <FormField
                          control={ordemForm.control}
                          name="enderecoOrigem"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço Completo</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Rua, número, bairro, cidade, estado, CEP"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={ordemForm.control}
                            name="contatoOrigem"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Contato</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={ordemForm.control}
                            name="telefoneOrigem"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Form>
                    </CardContent>
                  </Card>

                  {/* Destino */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-red-500" />
                        Endereço de Destino
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Form {...ordemForm}>
                        <FormField
                          control={ordemForm.control}
                          name="enderecoDestino"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Endereço Completo</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Rua, número, bairro, cidade, estado, CEP"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={ordemForm.control}
                            name="contatoDestino"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome do Contato</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={ordemForm.control}
                            name="telefoneDestino"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Telefone</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Form>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* NFes Tab */}
              <TabsContent value="nfes">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Notas Fiscais
                      </CardTitle>
                      <Dialog open={showNfeDialog} onOpenChange={setShowNfeDialog}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar NFe
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Adicionar Nota Fiscal</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <Form {...nfeForm}>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={nfeForm.control}
                                  name="chaveAcesso"
                                  render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                      <FormLabel>Chave de Acesso (44 dígitos)</FormLabel>
                                      <FormControl>
                                        <Input {...field} maxLength={44} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={nfeForm.control}
                                  name="numero"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Número da NFe</FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={nfeForm.control}
                                  name="valorDeclarado"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Valor Declarado (R$)</FormLabel>
                                      <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={nfeForm.control}
                                  name="peso"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Peso (kg)</FormLabel>
                                      <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={nfeForm.control}
                                  name="volume"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Volume (m³)</FormLabel>
                                      <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </Form>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowNfeDialog(false)}>
                                Cancelar
                              </Button>
                              <Button onClick={nfeForm.handleSubmit(onSubmitNfe)}>
                                Adicionar NFe
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {nfes.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhuma nota fiscal adicionada</p>
                        <p className="text-sm">Clique em "Adicionar NFe" para começar</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {nfes.map((nfe) => (
                          <div key={nfe.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium">NFe {nfe.numero}</h4>
                                <p className="text-sm text-gray-600 font-mono">
                                  {nfe.chaveAcesso}
                                </p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => removeNfe(nfe.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remover
                              </Button>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Valor:</span>
                                <span className="ml-2 font-medium">R$ {nfe.valorDeclarado}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Peso:</span>
                                <span className="ml-2 font-medium">{nfe.peso} kg</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Volume:</span>
                                <span className="ml-2 font-medium">{nfe.volume} m³</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Resumo da Ordem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div>
                  <Badge variant="outline" className="mb-4">
                    Rascunho
                  </Badge>
                </div>

                {/* NFes Summary */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-900">Notas Fiscais</h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quantidade:</span>
                      <span className="font-medium">{nfes.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Peso Total:</span>
                      <span className="font-medium">{totalPeso.toFixed(2)} kg</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Volume Total:</span>
                      <span className="font-medium">{totalVolume.toFixed(2)} m³</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                      <span className="text-gray-600">Valor Total:</span>
                      <span className="font-medium">R$ {totalValor.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <Button className="w-full" onClick={ordemForm.handleSubmit(onSubmitOrdem)}>
                    <Package className="w-4 h-4 mr-2" />
                    Criar Ordem
                  </Button>
                  <Button variant="outline" className="w-full">
                    Salvar Rascunho
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default OrdemCarregamento;