
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../formSchema';

export interface ObservacoesFieldProps {
  form: UseFormReturn<FormData>;
}

export const ObservacoesField: React.FC<ObservacoesFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="observacoes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Observações (opcional)</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Adicione observações sobre esta aprovação" 
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
