
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface PrintConfigFieldsProps {
  form: UseFormReturn<any>;
}

const PrintConfigFields: React.FC<PrintConfigFieldsProps> = ({ form }) => {
  const { watch } = form;

  return (
    <>
      <div>
        <Label htmlFor="formatoImpressao">Formato de Impressão</Label>
        <Select 
          defaultValue="50x100"
          onValueChange={(value) => form.setValue('formatoImpressao', value)}
          value={watch('formatoImpressao')}
        >
          <SelectTrigger id="formatoImpressao">
            <SelectValue placeholder="Selecione um formato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="50x100">Etiqueta 50x100mm</SelectItem>
            <SelectItem value="150x100">Etiqueta 150x100mm (Retrato)</SelectItem>
            <SelectItem value="a4">Folha A4</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="layoutStyle">Layout da Etiqueta</Label>
        <Select 
          defaultValue="enhanced"
          onValueChange={(value) => form.setValue('layoutStyle', value)}
          value={watch('layoutStyle', 'enhanced')}
        >
          <SelectTrigger id="layoutStyle">
            <SelectValue placeholder="Selecione um layout" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enhanced">Alta Legibilidade (Texto Grande)</SelectItem>
            <SelectItem value="portrait">Retrato (Itens Grandes)</SelectItem>
            <SelectItem value="enhanced_contrast">Alta Legibilidade (Alto Contraste)</SelectItem>
            <SelectItem value="alta_legibilidade_contraste">Alta Legibilidade Contraste (Texto Grande)</SelectItem>
            <SelectItem value="portrait_contrast">Retrato (Alto Contraste)</SelectItem>
            <SelectItem value="transul_enhanced">Transul Alta Legibilidade</SelectItem>
            <SelectItem value="transul_contrast">Transul Alto Contraste</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default PrintConfigFields;
