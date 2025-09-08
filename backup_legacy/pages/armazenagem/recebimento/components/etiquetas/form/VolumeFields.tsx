
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UseFormReturn } from 'react-hook-form';

interface VolumeFieldsProps {
  form: UseFormReturn<any>;
}

const VolumeFields: React.FC<VolumeFieldsProps> = ({ form }) => {
  const { register, watch } = form;
  const volumesTotal = watch('volumesTotal', '');

  return (
    <div>
      <Label htmlFor="volumesTotal">Quantidade de Volumes</Label>
      <Input
        id="volumesTotal"
        {...register('volumesTotal')}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        min="1"
        placeholder="Quantidade de volumes"
        value={volumesTotal}
      />
    </div>
  );
};

export default VolumeFields;
