
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import InputField from './InputField';

interface TaxesSectionProps {
  form: UseFormReturn<any>;
}

const TaxesSection: React.FC<TaxesSectionProps> = ({ form }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <InputField
        form={form}
        name="pedagio"
        label="Pedágio (R$)"
        type="number"
        step="0.01"
        placeholder="0.00"
      />
      <InputField
        form={form}
        name="aliquotaICMS"
        label="Alíquota ICMS (%)"
        type="number"
        step="0.01"
        placeholder="0.00"
      />
      <InputField
        form={form}
        name="aliquotaExpresso"
        label="Alíquota Expresso (%)"
        type="number"
        step="0.01"
        placeholder="0.00"
      />
    </div>
  );
};

export default TaxesSection;
