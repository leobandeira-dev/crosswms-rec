
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { converterParaUF } from '@/utils/estadoUtils';
import { EnderecoFormProps } from './empresaTypes';

const EnderecoForm: React.FC<EnderecoFormProps> = ({ 
  endereco, 
  readOnly, 
  tipo,
  onEnderecoChange
}) => {
  return (
    <div className="pt-2">
      <h4 className="text-sm font-medium mb-2">Endereço</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${tipo}-logradouro`}>Logradouro</Label>
          <Input 
            id={`${tipo}-logradouro`}
            placeholder="Rua/Avenida" 
            value={endereco.logradouro || ''}
            onChange={(e) => onEnderecoChange('logradouro', e.target.value)}
            readOnly={readOnly}
            className={readOnly ? "bg-gray-100" : ""}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor={`${tipo}-numero`}>Número</Label>
            <Input 
              id={`${tipo}-numero`}
              placeholder="Número" 
              value={endereco.numero || ''}
              onChange={(e) => onEnderecoChange('numero', e.target.value)}
              readOnly={readOnly}
              className={readOnly ? "bg-gray-100" : ""}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${tipo}-complemento`}>Complemento</Label>
            <Input 
              id={`${tipo}-complemento`}
              placeholder="Complemento" 
              value={endereco.complemento || ''}
              onChange={(e) => onEnderecoChange('complemento', e.target.value)}
              readOnly={readOnly}
              className={readOnly ? "bg-gray-100" : ""}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${tipo}-bairro`}>Bairro</Label>
          <Input 
            id={`${tipo}-bairro`}
            placeholder="Bairro" 
            value={endereco.bairro || ''}
            onChange={(e) => onEnderecoChange('bairro', e.target.value)}
            readOnly={readOnly}
            className={readOnly ? "bg-gray-100" : ""}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <Label htmlFor={`${tipo}-cidade`}>Cidade</Label>
            <Input 
              id={`${tipo}-cidade`}
              placeholder="Cidade" 
              value={endereco.cidade || ''}
              onChange={(e) => onEnderecoChange('cidade', e.target.value)}
              readOnly={readOnly}
              className={readOnly ? "bg-gray-100" : ""}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={`${tipo}-uf`}>UF</Label>
            <Input 
              id={`${tipo}-uf`}
              placeholder="UF" 
              value={converterParaUF(endereco.uf) || ''}
              onChange={(e) => onEnderecoChange('uf', e.target.value)}
              readOnly={readOnly}
              maxLength={2}
              className={readOnly ? "bg-gray-100 uppercase" : "uppercase"}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor={`${tipo}-cep`}>CEP</Label>
          <Input 
            id={`${tipo}-cep`}
            placeholder="00000-000" 
            value={endereco.cep || ''}
            onChange={(e) => onEnderecoChange('cep', e.target.value)}
            readOnly={readOnly}
            className={readOnly ? "bg-gray-100" : ""}
          />
        </div>
      </div>
    </div>
  );
};

export default EnderecoForm;
