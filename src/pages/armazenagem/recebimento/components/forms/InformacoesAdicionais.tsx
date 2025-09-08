
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import { NotaFiscalSchemaType } from './notaFiscalSchema';

const InformacoesAdicionais: React.FC = () => {
  const { control } = useFormContext<NotaFiscalSchemaType>();
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Informações Adicionais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="quantidadeVolumes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade de Volumes</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    placeholder="Quantidade de volumes" 
                    value={field.value || ''} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="valorTotal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Nota Fiscal</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    step="0.01"
                    placeholder="Valor total da nota" 
                    value={field.value || ''} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="pesoBruto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Bruto</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="number"
                    step="0.001"
                    placeholder="Peso bruto em kg" 
                    value={field.value || ''} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <FormField
            control={control}
            name="dataEntradaGalpao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Entrada no Galpão</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="date"
                    placeholder="Data de entrada"
                    value={field.value || ''} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="informacoesComplementares"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Informações Complementares</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Informações adicionais" value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="numeroPedido"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do Pedido</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Número do pedido" value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
          <FormField
            control={control}
            name="tipoFrete"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo Frete</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de frete" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CIF">CIF</SelectItem>
                    <SelectItem value="FOB">FOB</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default InformacoesAdicionais;
