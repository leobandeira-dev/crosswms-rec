
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Search } from 'lucide-react';

interface OrderSearchFormProps {
  onSubmit: (data: any) => void;
}

const OrderSearchForm: React.FC<OrderSearchFormProps> = ({ onSubmit }) => {
  const form = useForm();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <option value="">Todos</option>
                    <option value="truck">Caminhão</option>
                    <option value="van">Van</option>
                    <option value="car">Carro</option>
                  </select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        
        <Button type="submit" className="w-full bg-cross-blue hover:bg-cross-blue/90">
          Buscar
        </Button>
      </form>
    </Form>
  );
};

export default OrderSearchForm;
