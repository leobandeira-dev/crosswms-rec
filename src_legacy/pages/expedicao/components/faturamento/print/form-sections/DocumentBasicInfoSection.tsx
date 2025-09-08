
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { DocumentInfo } from '../schema/documentSchema';
import DocumentTypeField from './DocumentTypeField';
import DateTimePickerField from './DateTimePickerField';

interface DocumentBasicInfoSectionProps {
  form: UseFormReturn<DocumentInfo>;
}

const DocumentBasicInfoSection: React.FC<DocumentBasicInfoSectionProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="documentNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número do documento</FormLabel>
            <FormControl>
              <Input {...field} readOnly className="bg-muted" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <DocumentTypeField
        form={form}
        name="documentType"
        label="Tipo de documento"
      />

      <DateTimePickerField
        form={form}
        name="departureDateTime"
        label="Previsão de saída"
      />
      
      <DateTimePickerField
        form={form}
        name="arrivalDateTime"
        label="Previsão de chegada"
      />
    </div>
  );
};

export default DocumentBasicInfoSection;
