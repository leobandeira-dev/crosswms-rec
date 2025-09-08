
import React from 'react';

interface UserPermissionsHeaderProps {
  userName: string;
  profileName: string;
}

const UserPermissionsHeader: React.FC<UserPermissionsHeaderProps> = ({ userName, profileName }) => {
  return (
    <div className="mb-4 p-4 bg-blue-50 rounded-md">
      <p className="font-medium">Configurando permissões para:</p>
      <p className="text-lg">{userName}</p>
      <p className="text-sm text-gray-500">Perfil: {profileName}</p>
    </div>
  );
};

export default UserPermissionsHeader;
