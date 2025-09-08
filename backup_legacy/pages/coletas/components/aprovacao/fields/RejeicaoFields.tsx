
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

export interface RejeicaoFieldsProps {
  isRejecting: boolean;
  form: UseFormReturn<FormData>;
}

export const RejeicaoFields: React.FC<RejeicaoFieldsProps> = ({ isRejecting, form }) => {
  if (!isRejecting) return null;
  
  return (
    <FormField
      control={form.control}
      name="motivoRecusa"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-destructive font-bold">Motivo da Recusa (obrigatório)</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Informe o motivo detalhado da recusa" 
              {...field}
              className="border-destructive focus:border-destructive"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
