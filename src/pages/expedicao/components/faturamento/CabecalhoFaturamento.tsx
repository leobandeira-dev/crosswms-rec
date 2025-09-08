
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calculator } from 'lucide-react';

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

interface CabecalhoFaturamentoProps {
  onUpdateCabecalho: (values: HeaderValues) => void;
  cabecalhoValores: HeaderValues;
  ordemCarregamentoId: string | null;
}

const CabecalhoFaturamento: React.FC<CabecalhoFaturamentoProps> = ({
  onUpdateCabecalho,
  cabecalhoValores,
  ordemCarregamentoId
}) => {
  const form = useForm<HeaderValues>({
    resolver: zodResolver(headerSchema),
    defaultValues: cabecalhoValores
  });

  const onSubmit = (data: HeaderValues) => {
    onUpdateCabecalho(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Calculator size={20} className="mr-2 text-cross-blue" />
          Valores para Cálculo de Frete
          {ordemCarregamentoId && (
            <span className="ml-auto text-sm font-normal text-cross-blue">
              Ordem de Carregamento: {ordemCarregamentoId}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            
            <div className="flex justify-end">
              <Button type="submit">
                <Calculator size={16} className="mr-2" />
                Atualizar Valores e Recalcular
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CabecalhoFaturamento;
