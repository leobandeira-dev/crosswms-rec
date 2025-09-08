
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';

interface VolumeTypeFieldsProps {
  form: UseFormReturn<any>;
}

const VolumeTypeFields: React.FC<VolumeTypeFieldsProps> = ({ form }) => {
  const { register, watch } = form;
  const watchTipoVolume = watch('tipoVolume', 'geral');

  return (
    <>
      <div>
        <Label htmlFor="tipoVolume">Tipo de Volume</Label>
        <Select 
          defaultValue="geral"
          onValueChange={(value) => form.setValue('tipoVolume', value)}
          value={watchTipoVolume}
        >
          <SelectTrigger id="tipoVolume">
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="geral">Carga Geral</SelectItem>
            <SelectItem value="quimico">Produto Químico</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {watchTipoVolume === 'quimico' && (
        <>
          <div>
            <Label htmlFor="codigoONU">Código ONU</Label>
            <Input
              id="codigoONU"
              {...register('codigoONU')}
              placeholder="Ex: 1170"
            />
          </div>
          <div>
            <Label htmlFor="codigoRisco">Código de Risco</Label>
            <Input
              id="codigoRisco"
              {...register('codigoRisco')}
              placeholder="Ex: 33"
            />
          </div>
          <div>
            <Label htmlFor="classificacaoQuimica">Classificação</Label>
            <Select 
              defaultValue="nao_classificada"
              onValueChange={(value) => form.setValue('classificacaoQuimica', value)}
              value={form.watch('classificacaoQuimica', 'nao_classificada')}
            >
              <SelectTrigger id="classificacaoQuimica">
                <SelectValue placeholder="Selecione a classificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nao_perigosa">Cargas Não Perigosas</SelectItem>
                <SelectItem value="perigosa">Cargas Perigosas</SelectItem>
                <SelectItem value="nao_classificada">Cargas Não Classificadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </>
  );
};

export default VolumeTypeFields;
