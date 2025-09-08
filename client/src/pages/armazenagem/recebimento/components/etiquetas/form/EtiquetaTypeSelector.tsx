
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface EtiquetaTypeSelectorProps {
  form: UseFormReturn<any>;
}

const EtiquetaTypeSelector: React.FC<EtiquetaTypeSelectorProps> = ({ form }) => {
  const { watch } = form;
  const watchTipoEtiqueta = watch('tipoEtiqueta', 'volume');

  return (
    <div className="md:col-span-2">
      <Label htmlFor="tipoEtiqueta">Tipo de Etiqueta</Label>
      <Select 
        defaultValue="volume"
        onValueChange={(value) => form.setValue('tipoEtiqueta', value)}
        value={watchTipoEtiqueta}
      >
        <SelectTrigger id="tipoEtiqueta">
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="volume">Etiqueta de Volume</SelectItem>
          <SelectItem value="mae">Etiqueta Mãe</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default EtiquetaTypeSelector;
