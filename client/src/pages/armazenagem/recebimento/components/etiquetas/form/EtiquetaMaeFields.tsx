
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';

interface EtiquetaMaeFieldsProps {
  form: UseFormReturn<any>;
}

const EtiquetaMaeFields: React.FC<EtiquetaMaeFieldsProps> = ({ form }) => {
  const { register } = form;

  return (
    <div>
      <Label htmlFor="etiquetaMaeId">ID da Etiqueta Mãe</Label>
      <Input
        id="etiquetaMaeId"
        {...register('etiquetaMaeId')}
        placeholder="ID será gerado automaticamente"
        disabled
        className="bg-gray-100"
      />
    </div>
  );
};

export default EtiquetaMaeFields;
