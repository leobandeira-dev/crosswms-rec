
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AddressSectionProps } from './types';

const AddressSection: React.FC<AddressSectionProps> = ({
  label,
  cidade,
  uf,
  endereco,
  cep,
  readOnly,
  onCidadeChange,
  onUFChange,
  id
}) => {
  // Handle cidade change and maintain the 'Cidade - UF' format
  const handleCidadeChange = (value: string) => {
    if (onCidadeChange) {
      onCidadeChange(`${value} - ${uf}`);
    }
  };

  // Handle UF change and maintain the 'Cidade - UF' format
  const handleUFChange = (value: string) => {
    if (onUFChange) {
      onUFChange(`${cidade} - ${value}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-3 space-y-2">
          <Label htmlFor={`${id}-cidade`}>Cidade {label}</Label>
          <Input 
            id={`${id}-cidade`} 
            placeholder={`Cidade ${label.toLowerCase()}`} 
            value={cidade}
            onChange={(e) => handleCidadeChange(e.target.value)}
            readOnly={readOnly}
            className={readOnly ? "bg-gray-50" : ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${id}-uf`}>UF</Label>
          <Input 
            id={`${id}-uf`} 
            placeholder="UF" 
            value={uf}
            onChange={(e) => handleUFChange(e.target.value)}
            readOnly={readOnly}
            className={readOnly ? "bg-gray-50 uppercase" : "uppercase"}
            maxLength={2}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`${id}-endereco`}>Endereço {label}</Label>
        <Input 
          id={`${id}-endereco`} 
          placeholder="Endereço completo" 
          value={endereco}
          readOnly={readOnly}
          className={readOnly ? "bg-gray-50" : ""}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`${id}-cep`}>CEP {label}</Label>
        <Input 
          id={`${id}-cep`} 
          placeholder="CEP" 
          value={cep}
          readOnly={readOnly}
          className={readOnly ? "bg-gray-50" : ""}
        />
      </div>
      
      {readOnly && (
        <p className="text-xs text-gray-500 mt-1">Endereço obtido do XML da nota fiscal</p>
      )}
    </div>
  );
};

export default AddressSection;
