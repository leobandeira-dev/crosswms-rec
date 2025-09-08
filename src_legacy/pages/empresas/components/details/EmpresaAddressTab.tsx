
import React from 'react';

interface EmpresaAddressProps {
  empresa: any;
}

const EmpresaAddressTab: React.FC<EmpresaAddressProps> = ({ empresa }) => {
  return (
    <div className="space-y-4 mt-4">
      <div>
        <h4 className="text-sm font-medium text-gray-500">Endereço Completo</h4>
        <p>
          {empresa.logradouro ? `${empresa.logradouro}, ${empresa.numero || 's/n'}` : 'Endereço não informado'}
          {empresa.complemento && ` - ${empresa.complemento}`}
          {empresa.bairro && `, ${empresa.bairro}`}
        </p>
        <p>
          {empresa.cidade && empresa.cidade}
          {empresa.uf && ` - ${empresa.uf}`}
          {empresa.cep && ` - CEP: ${empresa.cep}`}
        </p>
      </div>
    </div>
  );
};

export default EmpresaAddressTab;
