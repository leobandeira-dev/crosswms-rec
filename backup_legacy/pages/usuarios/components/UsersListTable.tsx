
import React from 'react';
import { Eye } from 'lucide-react';
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";

interface User {
  id: string | number;
  nome: string;
  email: string;
  empresa: string;
  cnpj: string;
  perfil: string;
  status: string;
}

interface UsersListTableProps {
  users: User[];
  onViewDetails: (user: User) => void;
}

const UsersListTable: React.FC<UsersListTableProps> = ({ users, onViewDetails }) => {
  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum usuário encontrado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Nome</th>
            <th className="text-left py-3 px-4">Email</th>
            <th className="text-left py-3 px-4">Empresa</th>
            <th className="text-left py-3 px-4">CNPJ</th>
            <th className="text-left py-3 px-4">Perfil</th>
            <th className="text-left py-3 px-4">Status</th>
            <th className="text-left py-3 px-4">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">{user.nome}</td>
              <td className="py-3 px-4">{user.email}</td>
              <td className="py-3 px-4">{user.empresa}</td>
              <td className="py-3 px-4">{user.cnpj}</td>
              <td className="py-3 px-4">{user.perfil}</td>
              <td className="py-3 px-4">
                <StatusBadge 
                  status={
                    user.status === 'ativo' ? 'success' : 
                    user.status === 'pendente' ? 'warning' : 'error'
                  } 
                  text={
                    user.status === 'ativo' ? 'Ativo' :
                    user.status === 'pendente' ? 'Pendente' : 'Inativo'
                  } 
                />
              </td>
              <td className="py-3 px-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onViewDetails(user)}
                  className="flex items-center gap-1"
                >
                  <Eye size={14} />
                  Ver detalhes
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-sm text-gray-500">
        Total: {users.length} usuário(s)
      </div>
    </div>
  );
};

export default UsersListTable;
