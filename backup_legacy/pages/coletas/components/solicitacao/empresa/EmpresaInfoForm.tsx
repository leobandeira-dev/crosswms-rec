
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { EnderecoCompleto, DadosEmpresa } from '../SolicitacaoTypes';

interface EmpresaInfoFormProps {
  tipo: 'remetente' | 'destinatario';
  dados?: DadosEmpresa;
  onDadosChange: (dados: DadosEmpresa) => void;
  label?: string;
  readOnly?: boolean;
}

const EmpresaInfoForm: React.FC<EmpresaInfoFormProps> = ({
  tipo,
  dados,
  onDadosChange,
  label = 'Empresa',
  readOnly = false
}) => {
  // Default empty data if none provided
  const empresaData = dados || {
    cnpj: '',
    razaoSocial: '',
    nomeFantasia: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: ''
    },
    enderecoFormatado: ''
  };

  const handleChange = (field: keyof DadosEmpresa, value: string) => {
    if (readOnly) return;
    
    onDadosChange({
      ...empresaData,
      [field]: value
    });
  };

  const handleEnderecoChange = (field: keyof EnderecoCompleto, value: string) => {
    if (readOnly) return;
    
    const newEndereco = {
      ...empresaData.endereco,
      [field]: value
    };
    
    // Update formatted address too
    const enderecoFormatado = `${newEndereco.logradouro}, ${newEndereco.numero}${newEndereco.complemento ? ', ' + newEndereco.complemento : ''}, ${newEndereco.bairro}, ${newEndereco.cidade}/${newEndereco.uf}, CEP: ${newEndereco.cep}`;
    
    onDadosChange({
      ...empresaData,
      endereco: newEndereco,
      enderecoFormatado
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Label htmlFor={`${tipo}-cnpj`} className="text-xs text-gray-600">CNPJ</Label>
          <Input
            id={`${tipo}-cnpj`}
            value={empresaData.cnpj}
            onChange={(e) => handleChange('cnpj', e.target.value)}
            placeholder="00.000.000/0000-00"
            className="mt-1"
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>
        {!readOnly && (
          <Button type="button" variant="outline" className="mt-4">
            <Search className="h-4 w-4 mr-1" /> Buscar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${tipo}-razaoSocial`} className="text-xs text-gray-600">Razão Social</Label>
          <Input
            id={`${tipo}-razaoSocial`}
            value={empresaData.razaoSocial}
            onChange={(e) => handleChange('razaoSocial', e.target.value)}
            placeholder="Razão Social"
            className="mt-1"
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>
        <div>
          <Label htmlFor={`${tipo}-nomeFantasia`} className="text-xs text-gray-600">Nome Fantasia</Label>
          <Input
            id={`${tipo}-nomeFantasia`}
            value={empresaData.nomeFantasia}
            onChange={(e) => handleChange('nomeFantasia', e.target.value)}
            placeholder="Nome Fantasia"
            className="mt-1"
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>
      </div>

      <div>
        <Label htmlFor={`${tipo}-logradouro`} className="text-xs text-gray-600">Endereço</Label>
        <Input
          id={`${tipo}-logradouro`}
          value={empresaData.endereco.logradouro}
          onChange={(e) => handleEnderecoChange('logradouro', e.target.value)}
          placeholder="Rua, Avenida, etc."
          className="mt-1"
          readOnly={readOnly}
          disabled={readOnly}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor={`${tipo}-numero`} className="text-xs text-gray-600">Número</Label>
          <Input
            id={`${tipo}-numero`}
            value={empresaData.endereco.numero}
            onChange={(e) => handleEnderecoChange('numero', e.target.value)}
            placeholder="Número"
            className="mt-1"
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>
        <div>
          <Label htmlFor={`${tipo}-complemento`} className="text-xs text-gray-600">Complemento</Label>
          <Input
            id={`${tipo}-complemento`}
            value={empresaData.endereco.complemento}
            onChange={(e) => handleEnderecoChange('complemento', e.target.value)}
            placeholder="Complemento"
            className="mt-1"
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>
        <div>
          <Label htmlFor={`${tipo}-bairro`} className="text-xs text-gray-600">Bairro</Label>
          <Input
            id={`${tipo}-bairro`}
            value={empresaData.endereco.bairro}
            onChange={(e) => handleEnderecoChange('bairro', e.target.value)}
            placeholder="Bairro"
            className="mt-1"
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor={`${tipo}-cidade`} className="text-xs text-gray-600">Cidade</Label>
          <Input
            id={`${tipo}-cidade`}
            value={empresaData.endereco.cidade}
            onChange={(e) => handleEnderecoChange('cidade', e.target.value)}
            placeholder="Cidade"
            className="mt-1"
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>
        <div>
          <Label htmlFor={`${tipo}-uf`} className="text-xs text-gray-600">UF</Label>
          <Input
            id={`${tipo}-uf`}
            value={empresaData.endereco.uf}
            onChange={(e) => handleEnderecoChange('uf', e.target.value)}
            placeholder="UF"
            className="mt-1"
            readOnly={readOnly}
            disabled={readOnly}
            maxLength={2}
          />
        </div>
        <div>
          <Label htmlFor={`${tipo}-cep`} className="text-xs text-gray-600">CEP</Label>
          <Input
            id={`${tipo}-cep`}
            value={empresaData.endereco.cep}
            onChange={(e) => handleEnderecoChange('cep', e.target.value)}
            placeholder="00000-000"
            className="mt-1"
            readOnly={readOnly}
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );
};

export default EmpresaInfoForm;
