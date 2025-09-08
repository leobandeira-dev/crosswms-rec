
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Truck, Search } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface OrderSelectionFormProps {
  onSubmit: (data: any) => void;
}

const formSchema = z.object({
  numeroOC: z.string().optional(),
  tipoVeiculo: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

const OrderSelectionForm: React.FC<OrderSelectionFormProps> = ({ onSubmit }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      numeroOC: '',
      tipoVeiculo: ''
    }
  });

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Truck className="mr-2 text-cross-blue" size={20} />
          Selecionar Ordem de Carregamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <FormField
                  control={form.control}
                  name="numeroOC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número da OC</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input placeholder="Digite o número da OC" {...field} />
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
                  name="tipoVeiculo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Veículo</FormLabel>
                      <FormControl>
                        <select 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                          {...field}
                        >
                          <option value="">Selecione</option>
                          <option value="truck">Caminhão Truck</option>
                          <option value="toco">Caminhão Toco</option>
                          <option value="carreta">Carreta</option>
                          <option value="van">Van</option>
                        </select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full bg-cross-blue hover:bg-cross-blue/90">
                  Carregar Informações
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default OrderSelectionForm;
