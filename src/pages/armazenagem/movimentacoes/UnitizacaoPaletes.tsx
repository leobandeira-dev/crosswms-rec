
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '../../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Package, Search, Barcode, PackageOpen, Save } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { useEtiquetasPrinting } from '@/pages/armazenagem/recebimento/hooks/etiquetas/useEtiquetasPrinting';
import DataTable from '@/components/common/DataTable';

// Mock data
const volumesDisponiveis = [
  { id: 'VOL-2023-001', produto: 'Caixa de papelão 30x20x15', quantidade: 10, peso: '2.5kg' },
  { id: 'VOL-2023-002', produto: 'Caixa de papelão 40x30x25', quantidade: 5, peso: '4.2kg' },
  { id: 'VOL-2023-003', produto: 'Envelope plástico 50x40', quantidade: 20, peso: '0.5kg' },
  { id: 'VOL-2023-004', produto: 'Caixa de papelão 60x40x30', quantidade: 3, peso: '8.1kg' },
];

const paletiizacoesRecentes = [
  { 
    id: 'PAL-2023-001', 
    volumes: 12, 
    operador: 'João Silva', 
    data: '12/05/2023',
    destino: 'Setor A, Rua 3, Nivel 2'
  },
  { 
    id: 'PAL-2023-002', 
    volumes: 8, 
    operador: 'Maria Oliveira', 
    data: '11/05/2023',
    destino: 'Setor B, Rua 1, Nivel 1'
  },
  { 
    id: 'PAL-2023-003', 
    volumes: 15, 
    operador: 'Carlos Santos', 
    data: '10/05/2023',
    destino: 'Setor C, Rua 2, Nivel 3'
  },
];

const UnitizacaoPaletes: React.FC = () => {
  const form = useForm();
  const [location, setLocation] = useLocation();
  const [selectedVolumes, setSelectedVolumes] = useState<any[]>([]);
  const { createEtiquetaMae } = useEtiquetasPrinting();
  const [etiquetasMaePalete, setEtiquetasMaePalete] = useState<any[]>([]);
  const [loadingEtiquetas, setLoadingEtiquetas] = useState(true);
  
  // Simulating fetching etiquetas mãe from API
  useEffect(() => {
    // This would be replaced by a real API call in a production app
    setTimeout(() => {
      // Mock data - in a real app this would come from an API
      setEtiquetasMaePalete([
        { id: 'MASTER-1684195200000', descricao: 'Palete Setor A', tipo: 'palete', quantidadeVolumes: 0 },
        { id: 'MASTER-1684281600000', descricao: 'Palete Exportação', tipo: 'palete', quantidadeVolumes: 4 },
      ]);
      setLoadingEtiquetas(false);
    }, 1000);
  }, []);
  
  const handleSubmit = (data: any) => {
    console.log('Form data submitted:', data, 'Selected volumes:', selectedVolumes);
    
    if (!data.idPalete) {
      toast({
        title: "Erro",
        description: "É necessário informar um ID de etiqueta mãe.",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedVolumes.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um volume para unitizar.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Unitização realizada",
      description: `${selectedVolumes.length} volumes foram unitizados no palete ${data.idPalete}.`
    });
  };

  const handleAddVolume = () => {
    const randomIndex = Math.floor(Math.random() * volumesDisponiveis.length);
    const volumeToAdd = volumesDisponiveis[randomIndex];
    setSelectedVolumes([...selectedVolumes, volumeToAdd]);
  };

  const handleRemoveVolume = (id: string) => {
    setSelectedVolumes(selectedVolumes.filter(vol => vol.id !== id));
  };

  const handleGenerateEtiquetaMae = () => {
    // Navigate to the etiquetas mãe page
    setLocation('/armazenagem/recebimento/etiquetas');
  };

  const handleSelectEtiqueta = (etiquetaId: string) => {
    form.setValue('idPalete', etiquetaId);
  };

  return (
    <MainLayout title="Unitização de Paletes">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Unitização de Paletes</h2>
        <p className="text-gray-600">Organize e agrupe volumes em paletes para facilitar o armazenamento e movimentação</p>
      </div>

      <Tabs defaultValue="criar" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="criar">Criar Unitização</TabsTrigger>
          <TabsTrigger value="consultar">Unitizações Recentes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="criar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <PackageOpen className="mr-2 text-cross-blue" size={20} />
                    ID etiqueta Mãe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <FormField
                            control={form.control}
                            name="idPalete"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ID da Etiqueta Mãe</FormLabel>
                                <div className="relative">
                                  <FormControl>
                                    <Input placeholder="Selecione ou gere uma etiqueta mãe" {...field} />
                                  </FormControl>
                                  <Barcode className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          <FormField
                            control={form.control}
                            name="tipoUnitizacao"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tipo de Unitização</FormLabel>
                                <FormControl>
                                  <select 
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                                    {...field}
                                  >
                                    <option value="">Selecione um tipo</option>
                                    <option value="mono">Mono Produto</option>
                                    <option value="multi">Multi Produto</option>
                                    <option value="especial">Carga Especial</option>
                                  </select>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <FormLabel>Etiquetas Mãe Disponíveis:</FormLabel>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleGenerateEtiquetaMae}
                          className="border-dashed"
                        >
                          <PackageOpen size={16} className="mr-2" />
                          Gerar Nova Etiqueta Mãe
                        </Button>
                      </div>
                      
                      <div className="border rounded-md p-4 max-h-[150px] overflow-y-auto">
                        {loadingEtiquetas ? (
                          <p className="text-center text-gray-400 py-4">Carregando etiquetas...</p>
                        ) : etiquetasMaePalete.length === 0 ? (
                          <div className="text-center text-gray-400 py-4">
                            <p>Nenhuma etiqueta mãe tipo palete disponível</p>
                            <p className="text-sm">Clique em "Gerar Nova Etiqueta Mãe" para criar uma</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {etiquetasMaePalete.map(etiqueta => (
                              <div 
                                key={etiqueta.id}
                                className="flex justify-between items-center p-2 border rounded-md hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleSelectEtiqueta(etiqueta.id)}
                              >
                                <div>
                                  <p className="font-medium">{etiqueta.id}</p>
                                  <p className="text-sm text-gray-500">{etiqueta.descricao}</p>
                                </div>
                                <Button 
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleSelectEtiqueta(etiqueta.id)}
                                >
                                  Selecionar
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <FormField
                          control={form.control}
                          name="localDestino"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Local de Destino</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input placeholder="Endereço de destino no armazém" {...field} />
                                </FormControl>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div>
                        <FormLabel>Volumes Selecionados</FormLabel>
                        <div className="border rounded-md p-4 min-h-[200px]">
                          {selectedVolumes.length === 0 ? (
                            <div className="text-center text-gray-400 py-8">
                              <Package size={40} className="mx-auto mb-2" />
                              <p>Nenhum volume selecionado</p>
                              <p className="text-sm">Use o leitor de código de barras ou busque volumes para adicionar</p>
                            </div>
                          ) : (
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-2">ID</th>
                                  <th className="text-left py-2">Produto</th>
                                  <th className="text-left py-2">Qtd</th>
                                  <th className="text-left py-2">Peso</th>
                                  <th className="text-right py-2">Ação</th>
                                </tr>
                              </thead>
                              <tbody>
                                {selectedVolumes.map((volume) => (
                                  <tr key={volume.id} className="border-b">
                                    <td className="py-2">{volume.id}</td>
                                    <td className="py-2">{volume.produto}</td>
                                    <td className="py-2">{volume.quantidade}</td>
                                    <td className="py-2">{volume.peso}</td>
                                    <td className="py-2 text-right">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-red-500"
                                        onClick={() => handleRemoveVolume(volume.id)}
                                      >
                                        Remover
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={handleAddVolume}
                          className="border-dashed"
                        >
                          <Package size={16} className="mr-2" />
                          Adicionar Volume
                        </Button>
                        
                        <div className="flex gap-2">
                          <Button type="button" variant="outline">Cancelar</Button>
                          <Button 
                            type="submit" 
                            className="bg-cross-blue hover:bg-cross-blue/90"
                          >
                            <Save size={16} className="mr-2" />
                            Salvar Unitização
                          </Button>
                        </div>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Volumes Disponíveis</CardTitle>
                  <CardDescription>Volumes não unitizados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative mb-4">
                    <Input placeholder="Buscar volumes..." />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                  
                  <div className="space-y-2">
                    {volumesDisponiveis.map((volume) => (
                      <div 
                        key={volume.id}
                        className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                        onClick={() => {
                          if (!selectedVolumes.some(v => v.id === volume.id)) {
                            setSelectedVolumes([...selectedVolumes, volume]);
                          }
                        }}
                      >
                        <div>
                          <p className="font-medium">{volume.id}</p>
                          <p className="text-sm text-gray-500">{volume.produto}</p>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Package size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="consultar">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Unitizações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { header: 'ID Palete', accessor: 'id' },
                  { header: 'Volumes', accessor: 'volumes' },
                  { header: 'Operador', accessor: 'operador' },
                  { header: 'Data', accessor: 'data' },
                  { header: 'Destino', accessor: 'destino' },
                  {
                    header: 'Ações',
                    accessor: 'actions',
                    cell: () => (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Detalhes</Button>
                        <Button variant="outline" size="sm">Imprimir</Button>
                      </div>
                    )
                  }
                ]}
                data={paletiizacoesRecentes}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default UnitizacaoPaletes;
