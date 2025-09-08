
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { NotaFiscalSchemaType } from './notaFiscalSchema';

const InformacoesTransporte: React.FC = () => {
  const { control } = useFormContext<NotaFiscalSchemaType>();
  
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Informações de Coleta e Transporte</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={control}
            name="numeroColeta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da Coleta</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="valorColeta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor da Coleta</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="numeroCteColeta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do CT-e Coleta</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="mt-4">
          <FormItem>
            <FormLabel>Arquivo CT-e Coleta</FormLabel>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                  <Upload className="w-6 h-6 mb-1 text-gray-400" />
                  <p className="text-xs text-gray-500">Clique para fazer upload</p>
                </div>
                <input id="cte-file" type="file" className="hidden" />
              </label>
            </div>
          </FormItem>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FormField
            control={control}
            name="numeroCteViagem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número do CT-e Viagem</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={control}
            name="dataEmbarque"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Embarque</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="mt-4">
          <FormItem>
            <FormLabel>Arquivo CT-e Viagem</FormLabel>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                  <Upload className="w-6 h-6 mb-1 text-gray-400" />
                  <p className="text-xs text-gray-500">Clique para fazer upload</p>
                </div>
                <input id="cte-viagem-file" type="file" className="hidden" />
              </label>
            </div>
          </FormItem>
        </div>
      </CardContent>
    </Card>
  );
};

export default InformacoesTransporte;
