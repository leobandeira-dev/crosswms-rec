
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { DocumentInfo } from '../schema/documentSchema';

interface DriverInfoSectionProps {
  form: UseFormReturn<DocumentInfo>;
}

const DriverInfoSection: React.FC<DriverInfoSectionProps> = ({ form }) => {
  return (
    <div className="border-t pt-4">
      <h3 className="text-lg font-medium mb-4">Dados do motorista</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="driverName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do motorista</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="truckId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cavalo</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trailer1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carreta 1</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trailer2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Carreta 2</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Opcional" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trailerType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de carroceria</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ex: Aberta, Sider, etc" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default DriverInfoSection;
