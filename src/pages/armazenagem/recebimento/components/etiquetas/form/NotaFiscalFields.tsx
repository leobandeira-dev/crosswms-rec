
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';

interface NotaFiscalFieldsProps {
  form: UseFormReturn<any>;
}

const NotaFiscalFields: React.FC<NotaFiscalFieldsProps> = ({ form }) => {
  const { register } = form;

  return (
    <>
      <div>
        <Label htmlFor="notaFiscal">Nota Fiscal</Label>
        <Input
          id="notaFiscal"
          {...register('notaFiscal')}
          placeholder="Número da nota fiscal"
        />
      </div>
      
      <div>
        <Label htmlFor="pesoTotalBruto">Peso Total</Label>
        <Input
          id="pesoTotalBruto"
          {...register('pesoTotalBruto')}
          placeholder="Ex: 250,5 Kg"
        />
      </div>
    </>
  );
};

export default NotaFiscalFields;
