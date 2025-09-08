
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import UsersListTable from './UsersListTable';
import SearchFilter from '@/components/common/SearchFilter';
import { FilterConfig } from '@/components/common/SearchFilter';

interface UsersListTabProps {
  users: any[];
  onViewDetails: (user: any) => void;
}

const UsersListTab: React.FC<UsersListTabProps> = ({ users, onViewDetails }) => {
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [searchTerm, setSearchTerm] = useState('');

  // Extract unique perfil values for filter options
  const uniquePerfis = [...new Set(users.map(user => user.perfil).filter(Boolean))];

  const filterConfigs: FilterConfig[] = [
    {
      id: 'status',
      label: 'Status',
      options: [
        { id: 'ativo', label: 'Ativo' },
        { id: 'inativo', label: 'Inativo' },
        { id: 'pendente', label: 'Pendente' },
        { id: 'rejeitado', label: 'Rejeitado' }
      ]
    },
    {
      id: 'perfil',
      label: 'Perfil',
      options: uniquePerfis.map(perfil => ({ id: perfil, label: perfil }))
    }
  ];

  const handleSearch = (term: string, activeFilters?: Record<string, string[]>) => {
    setSearchTerm(term);
    
    let results = users;
    
    // Apply search term filter
    if (term) {
      const searchLower = term.toLowerCase();
      results = results.filter(user => 
        (user.nome?.toLowerCase().includes(searchLower) || false) ||
        (user.email?.toLowerCase().includes(searchLower) || false) ||
        (user.empresa?.toLowerCase().includes(searchLower) || false) ||
        (user.cnpj?.includes(term) || false)
      );
    }
    
    // Apply status filters
    if (activeFilters && activeFilters.status && activeFilters.status.length > 0) {
      results = results.filter(user => activeFilters.status.includes(user.status));
    }
    
    // Apply perfil filters
    if (activeFilters && activeFilters.perfil && activeFilters.perfil.length > 0) {
      results = results.filter(user => activeFilters.perfil.includes(user.perfil));
    }
    
    setFilteredUsers(results);
  };

  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Users className="mr-2 text-cross-blue" size={20} />
          Listagem de Usuários
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SearchFilter 
          placeholder="Buscar por nome, email, empresa ou CNPJ..." 
          onSearch={handleSearch}
          filters={filterConfigs}
        />
        <UsersListTable users={filteredUsers} onViewDetails={onViewDetails} />
      </CardContent>
    </Card>
  );
};

export default UsersListTab;
