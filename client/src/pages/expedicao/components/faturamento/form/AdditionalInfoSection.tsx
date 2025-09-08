
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import InputField from './InputField';

interface AdditionalInfoSectionProps {
  form: UseFormReturn<any>;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <InputField
        form={form}
        name="valorColeta"
        label="Valor por Coleta (R$)"
        type="number"
        step="0.01"
        placeholder="0.00"
      />
      <InputField
        form={form}
        name="cteTransferencia"
        label="CTE Nº Transferência"
        placeholder="Número do CTE"
      />
      <InputField
        form={form}
        name="paletizacao"
        label="Paletização (R$)"
        type="number"
        step="0.01"
        placeholder="0.00"
      />
    </div>
  );
};

export default AdditionalInfoSection;
