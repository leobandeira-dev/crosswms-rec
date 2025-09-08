
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SearchFilter, { FilterConfig } from '@/components/common/SearchFilter';
import { UserWithProfile } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';

interface UserSelectorProps {
  users: UserWithProfile[];
  selectedUser: string;
  onUserChange: (value: string) => void;
  onSearch: (term: string, activeFilters?: Record<string, string[]>) => void;
  allProfiles: string[];
  isLoading?: boolean;
}

const UserSelector: React.FC<UserSelectorProps> = ({
  users,
  selectedUser,
  onUserChange,
  onSearch,
  allProfiles,
  isLoading = false
}) => {
  // Filter configs
  const filterConfigs: FilterConfig[] = [
    {
      id: 'perfil',
      label: 'Perfil',
      options: allProfiles.map(profile => ({ id: profile, label: profile }))
    }
  ];

  if (isLoading) {
    return (
      <div className="mb-6">
        <Label htmlFor="usuario-search" className="mb-2 block">Buscar Usuário</Label>
        <Skeleton className="h-10 w-full mb-4" />
        
        <Label htmlFor="usuario-select" className="mb-2 block">Selecione o Usuário</Label>
        <Skeleton className="h-10 w-full md:w-[400px]" />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Label htmlFor="usuario-search" className="mb-2 block">Buscar Usuário</Label>
      <SearchFilter
        placeholder="Buscar por nome ou email..."
        onSearch={onSearch}
        filters={filterConfigs}
        className="mb-4"
      />
      
      <Label htmlFor="usuario-select" className="mb-2 block">Selecione o Usuário</Label>
      <Select value={selectedUser} onValueChange={onUserChange}>
        <SelectTrigger id="usuario-select" className="w-full md:w-[400px]">
          <SelectValue placeholder="Selecione um usuário" />
        </SelectTrigger>
        <SelectContent>
          {users.length === 0 ? (
            <SelectItem value="no-users" disabled>Nenhum usuário encontrado</SelectItem>
          ) : (
            users.map(usuario => (
              <SelectItem key={usuario.id} value={usuario.id}>
                {usuario.nome} - {usuario.email} ({usuario.perfil})
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {users.length > 0 && (
        <div className="mt-2 text-sm text-gray-500">
          Total de {users.length} usuário(s) encontrado(s)
        </div>
      )}
    </div>
  );
};

export default UserSelector;
