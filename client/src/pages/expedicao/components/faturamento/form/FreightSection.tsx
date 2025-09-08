
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import InputField from './InputField';

interface FreightSectionProps {
  form: UseFormReturn<any>;
}

const FreightSection: React.FC<FreightSectionProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <InputField
        form={form}
        name="pesoMinimo"
        label="Peso Mínimo (kg)"
        type="number"
        step="0.01"
        placeholder="0.00"
      />
      <InputField
        form={form}
        name="valorFreteTransferencia"
        label="Valor Frete Transferência (R$)"
        type="number"
        step="0.01"
        placeholder="0.00"
      />
      <InputField
        form={form}
        name="cteColeta"
        label="CTE Nº Coleta"
        placeholder="Número do CTE"
      />
    </div>
  );
};

export default FreightSection;
