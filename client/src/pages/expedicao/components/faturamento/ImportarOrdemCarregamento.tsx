
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotaFiscal as OCNotaFiscal, OrdemCarregamento } from '@/components/carregamento/OrderDetailsForm';
import OrderDetailsForm from '@/components/carregamento/OrderDetailsForm';
import FormSection from './form/FormSection';
import { Button } from '@/components/ui/button';
import { FileText, Import, Truck } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

// Schema for header values
const headerSchema = z.object({
  fretePorTonelada: z.coerce.number().min(0.1, {
    message: "O frete por tonelada deve ser maior que 0.",
  }),
  pesoMinimo: z.coerce.number().min(0, {
    message: "O peso mínimo deve ser maior ou igual a 0.",
  }),
  aliquotaICMS: z.coerce.number().min(0).max(100, {
    message: "A alíquota de ICMS deve estar entre 0 e 100.",
  }),
  aliquotaExpresso: z.coerce.number().min(0).max(100, {
    message: "A alíquota de expresso deve estar entre 0 e 100.",
  }),
  valorFreteTransferencia: z.coerce.number().min(0).optional(),
  valorColeta: z.coerce.number().min(0).optional(),
  paletizacao: z.coerce.number().min(0).optional(),
  pedagio: z.coerce.number().min(0).optional(),
});

type HeaderValues = z.infer<typeof headerSchema>;

interface ImportarOrdemCarregamentoProps {
  onImportarNotasOrdemCarregamento: (notas: OCNotaFiscal[], ocId: string) => void;
  onUpdateCabecalho: (values: HeaderValues) => void;
  cabecalhoValores: HeaderValues;
}

const ImportarOrdemCarregamento: React.FC<ImportarOrdemCarregamentoProps> = ({
  onImportarNotasOrdemCarregamento,
  onUpdateCabecalho,
  cabecalhoValores
}) => {
  const [ordemSelecionada, setOrdemSelecionada] = useState<OrdemCarregamento | null>(null);
  
  const form = useForm<HeaderValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: cabecalhoValores
  });

  const onSubmit = (data: HeaderValues) => {
    onUpdateCabecalho(data);
  };
  
  const handleBuscarOrdem = (data: any) => {
    // Simulate API call
    setTimeout(() => {
      const mockOrdem: OrdemCarregamento = {
        id: data.numeroOC || 'OC-2023-001',
        cliente: 'Distribuidor ABC',
        destinatario: 'São Paulo, SP',
        dataCarregamento: '15/05/2023',
        volumesTotal: 25,
        volumesVerificados: 25,
        status: 'completed',
        notasFiscais: [],
        // Add the missing required properties
        tipoCarregamento: 'entrega',
        transportadora: 'Transportadora XYZ',
        placaVeiculo: 'ABC-1234',
        motorista: 'João da Silva'
      };
      
      setOrdemSelecionada(mockOrdem);
    }, 500);
  };
  
  const handleImportarNotas = (notas: OCNotaFiscal[]) => {
    if (ordemSelecionada) {
      onImportarNotasOrdemCarregamento(notas, ordemSelecionada.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Import size={20} className="mr-2 text-cross-blue" />
          Importar Notas Fiscais de Ordem de Carregamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1">
            <OrderDetailsForm 
              onSubmit={handleBuscarOrdem} 
              ordemSelecionada={ordemSelecionada} 
              onImportInvoices={handleImportarNotas}
              showImportButton={true}
            />
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormSection title="Valores do Cabeçalho para Cálculo" description="Estes valores serão aplicados para todas as notas importadas">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fretePorTonelada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frete por Tonelada (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="pesoMinimo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso Mínimo (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="aliquotaICMS"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota ICMS (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" max="100" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="aliquotaExpresso"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota Expresso (%)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" max="100" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </FormSection>
                
                <FormSection title="Valores Adicionais" description="Estes valores serão rateados proporcionalmente entre as notas importadas">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="valorFreteTransferencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Frete Transferência (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="valorColeta"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor por Coleta (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="paletizacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Paletização (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="pedagio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pedágio (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </FormSection>
                
                <div className="flex justify-end">
                  <Button type="submit">
                    <Truck size={16} className="mr-2" />
                    Atualizar Valores do Cabeçalho
                  </Button>
                </div>
              </form>
            </Form>
            
            {!ordemSelecionada && (
              <div className="mt-6 border rounded-md p-8 text-center">
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">Nenhuma ordem selecionada</h3>
                <p className="text-gray-500 mb-4">
                  Busque uma ordem de carregamento para importar suas notas fiscais para o faturamento
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportarOrdemCarregamento;
