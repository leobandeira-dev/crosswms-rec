
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import DatePickerField from './DatePickerField';
import InputField from './InputField';

interface DocumentInfoSectionProps {
  form: UseFormReturn<any>;
}

const DocumentInfoSection: React.FC<DocumentInfoSectionProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <InputField
        form={form}
        name="notaFiscal"
        label="Nota Fiscal"
        placeholder="Número da nota fiscal"
      />
      <InputField
        form={form}
        name="pedido"
        label="Pedido"
        placeholder="Número do pedido"
      />
      <DatePickerField
        form={form}
        name="dataEmissao"
        label="Data Emissão NF"
      />
    </div>
  );
};

export default DocumentInfoSection;
