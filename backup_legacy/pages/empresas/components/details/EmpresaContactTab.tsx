
import React from 'react';

interface EmpresaContactProps {
  empresa: any;
}

const EmpresaContactTab: React.FC<EmpresaContactProps> = ({ empresa }) => {
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500">E-mail</h4>
          <p>{empresa.email || 'Não informado'}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500">Telefone</h4>
          <p>{empresa.telefone || 'Não informado'}</p>
        </div>
      </div>
    </div>
  );
};

export default EmpresaContactTab;
