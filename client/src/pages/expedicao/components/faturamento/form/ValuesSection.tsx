
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import InputField from './InputField';

interface ValuesSectionProps {
  form: UseFormReturn<any>;
}

const ValuesSection: React.FC<ValuesSectionProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <InputField
        form={form}
        name="valorNF"
        label="Valor NF (R$)"
        type="number"
        step="0.01"
        placeholder="0.00"
      />
      <InputField
        form={form}
        name="pesoNota"
        label="Peso Nota (kg)"
        type="number"
        step="0.01"
        placeholder="0.00"
      />
      <InputField
        form={form}
        name="fretePorTonelada"
        label="Frete por Tonelada (R$)"
        type="number"
        step="0.01"
        placeholder="0.00"
      />
    </div>
  );
};

export default ValuesSection;
