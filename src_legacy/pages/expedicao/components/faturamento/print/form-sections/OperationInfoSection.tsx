
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { DocumentInfo } from '../schema/documentSchema';

interface OperationInfoSectionProps {
  form: UseFormReturn<DocumentInfo>;
}

const OperationInfoSection: React.FC<OperationInfoSectionProps> = ({ form }) => {
  return (
    <div className="border-t pt-4">
      <h3 className="text-lg font-medium mb-4">Dados da operação</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="issuerUser"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuário emissor</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="checkerUser"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Usuário conferente</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transporterName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Transportadora</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="transporterLogo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL do logo da transportadora</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Opcional" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default OperationInfoSection;
