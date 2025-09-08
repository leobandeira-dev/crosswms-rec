
import React, { useState, useRef } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Package, Calendar, FileText, Search, Plus, Clock, Printer } from 'lucide-react';
import SearchFilter from '@/components/common/SearchFilter';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import PrintLayoutModal from '@/components/carregamento/enderecamento/PrintLayoutModal';

// Mock data
const recebimentosFornecedores = [
  { 
    id: 'RF-2023-001', 
    fornecedor: 'Indústria ABC Ltda', 
    notaFiscal: '12345', 
    data: '10/05/2023', 
    itens: 24,
    status: 'pending' 
  },
  { 
    id: 'RF-2023-002', 
    fornecedor: 'Distribuidora XYZ', 
    notaFiscal: '54321', 
    data: '09/05/2023', 
    itens: 12,
    status: 'processing' 
  },
  { 
    id: 'RF-2023-003', 
    fornecedor: 'Gráfica Moderna', 
    notaFiscal: '98765', 
    data: '08/05/2023', 
    itens: 5,
    status: 'completed' 
  },
];

const RecebimentoFornecedor: React.FC = () => {
  const form = useForm();
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedRecebimento, setSelectedRecebimento] = useState<string>('');
  const recebimentoRef = useRef<HTMLDivElement>(null);
  
  const handlePrintClick = (recebimentoId: string) => {
    setSelectedRecebimento(recebimentoId);
    setPrintModalOpen(true);
  };
  
  const handleSubmit = (data: any) => {
    console.log('Form data submitted:', data);
  };

  return (
    <MainLayout title="Recebimento de Fornecedor">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Recebimento de Fornecedor</h2>
        <p className="text-gray-600">Gerencie recebimentos de mercadorias vindas diretamente de fornecedores</p>
      </div>

      <Tabs defaultValue="cadastrar" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="cadastrar">Cadastrar Recebimento</TabsTrigger>
          <TabsTrigger value="consultar">Consultar Recebimentos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cadastrar">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Package className="mr-2" size={20} />
                Nova Ordem de Recebimento - Fornecedor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="fornecedor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fornecedor</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input placeholder="Buscar fornecedor..." {...field} />
                              </FormControl>
                              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <FormField
                        control={form.control}
                        name="dataRecebimento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data Prevista de Recebimento</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="notaFiscal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número da Nota Fiscal</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input placeholder="Informe o número da NF..." {...field} />
                              </FormControl>
                              <FileText className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <FormField
                        control={form.control}
                        name="horarioAgendado"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Horário Agendado</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <textarea 
                              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              placeholder="Observações sobre o recebimento..."
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <Card className="border-dashed">
                      <CardContent className="p-4">
                        <div className="text-center">
                          <h3 className="font-medium mb-2">Itens da Nota Fiscal</h3>
                          <p className="text-sm text-gray-500 mb-4">Adicione os itens da nota fiscal para recebimento</p>
                          <Button className="bg-cross-blue hover:bg-cross-blue/90">
                            <Plus size={16} className="mr-2" />
                            Adicionar Item
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline">Cancelar</Button>
                    <Button type="submit" className="bg-cross-blue hover:bg-cross-blue/90">
                      Cadastrar Recebimento
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="consultar">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recebimentos de Fornecedores</CardTitle>
            </CardHeader>
            <CardContent>
              <SearchFilter 
                placeholder="Buscar por fornecedor ou NF..." 
                filters={[
                  {
                    name: "Status",
                    options: [
                      { label: "Pendente", value: "pending" },
                      { label: "Em Processamento", value: "processing" },
                      { label: "Concluído", value: "completed" }
                    ]
                  },
                  {
                    name: "Data",
                    options: [
                      { label: "Últimos 7 dias", value: "7days" },
                      { label: "Últimos 30 dias", value: "30days" },
                      { label: "Este mês", value: "thisMonth" }
                    ]
                  }
                ]}
              />
              
              <DataTable
                columns={[
                  { header: 'ID', accessor: 'id' },
                  { header: 'Fornecedor', accessor: 'fornecedor' },
                  { header: 'Nota Fiscal', accessor: 'notaFiscal' },
                  { header: 'Data', accessor: 'data' },
                  { header: 'Itens', accessor: 'itens' },
                  { 
                    header: 'Status', 
                    accessor: 'status',
                    cell: (row) => {
                      const statusMap: any = {
                        'pending': { type: 'warning', text: 'Pendente' },
                        'processing': { type: 'info', text: 'Em Processamento' },
                        'completed': { type: 'success', text: 'Concluído' },
                      };
                      const status = statusMap[row.status];
                      return <StatusBadge status={status.type} text={status.text} />;
                    }
                  },
                  {
                    header: 'Ações',
                    accessor: 'actions',
                    cell: (row) => (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Detalhes</Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handlePrintClick(row.id)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="bg-cross-blue text-white hover:bg-cross-blue/90">
                          Processar
                        </Button>
                      </div>
                    )
                  }
                ]}
                data={recebimentosFornecedores}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Div oculto que servirá como template para impressão do recebimento */}
      <div className="hidden">
        <div ref={recebimentoRef} className="p-4 bg-white">
          <h2 className="text-xl font-bold mb-4">Ordem de Recebimento - {selectedRecebimento}</h2>
          <div className="border p-4">
            <p>Detalhes do Recebimento {selectedRecebimento}</p>
            <div className="mt-4 space-y-2">
              {selectedRecebimento && recebimentosFornecedores.find(rec => rec.id === selectedRecebimento) && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-gray-500">Fornecedor:</p>
                      <p>{recebimentosFornecedores.find(rec => rec.id === selectedRecebimento)?.fornecedor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nota Fiscal:</p>
                      <p>{recebimentosFornecedores.find(rec => rec.id === selectedRecebimento)?.notaFiscal}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Data:</p>
                      <p>{recebimentosFornecedores.find(rec => rec.id === selectedRecebimento)?.data}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total de Itens:</p>
                      <p>{recebimentosFornecedores.find(rec => rec.id === selectedRecebimento)?.itens}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Status:</p>
                    <p>{recebimentosFornecedores.find(rec => rec.id === selectedRecebimento)?.status === 'pending' ? 'Pendente' : 
                       recebimentosFornecedores.find(rec => rec.id === selectedRecebimento)?.status === 'processing' ? 'Em Processamento' : 'Concluído'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <PrintLayoutModal
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
        orderNumber={selectedRecebimento}
        layoutRef={recebimentoRef}
      />
    </MainLayout>
  );
};

export default RecebimentoFornecedor;
