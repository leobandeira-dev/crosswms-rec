
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import DatePickerField from './DatePickerField';
import InputField from './InputField';

interface BasicInfoSectionProps {
  form: UseFormReturn<any>;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <DatePickerField
        form={form}
        name="data"
        label="Data"
      />
      <InputField
        form={form}
        name="remetente"
        label="Remetente"
        placeholder="Nome do remetente"
      />
      <InputField
        form={form}
        name="cliente"
        label="Cliente"
        placeholder="Nome do cliente"
      />
    </div>
  );
};

export default BasicInfoSection;
