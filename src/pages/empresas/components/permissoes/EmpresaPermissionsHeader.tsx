
import React from 'react';

interface EmpresaPermissionsHeaderProps {
  empresaName: string;
  profileName: string;
}

const EmpresaPermissionsHeader: React.FC<EmpresaPermissionsHeaderProps> = ({ empresaName, profileName }) => {
  return (
    <div className="mb-4 p-4 bg-blue-50 rounded-md">
      <p className="font-medium">Configurando permissões para:</p>
      <p className="text-lg">{empresaName}</p>
      <p className="text-sm text-gray-500">Perfil: {profileName}</p>
    </div>
  );
};

export default EmpresaPermissionsHeader;
