
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SearchFilter, { FilterConfig } from '@/components/common/SearchFilter';
import EmpresasListTable from './EmpresasListTable';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmpresasListTabProps {
  empresas: any[];
  isLoading?: boolean;
  onViewDetails: (empresa: any) => void;
  onSearch?: (term: string, filters?: Record<string, string[]>) => void;
  fetchEmpresas?: () => void;
  isInitialized?: boolean;
}

// Configuração de filtros para empresas
const filterConfig: FilterConfig[] = [
  {
    id: 'perfil',
    name: 'Perfil',
    options: [
      { label: 'Transportadora', value: 'Transportadora' },
      { label: 'Filial', value: 'Filial' },
      { label: 'Cliente', value: 'Cliente' },
      { label: 'Fornecedor', value: 'Fornecedor' },
    ],
  },
  {
    id: 'status',
    name: 'Status',
    options: [
      { label: 'Ativo', value: 'ativo' },
      { label: 'Inativo', value: 'inativo' },
    ],
  },
];

const EmpresasListTab: React.FC<EmpresasListTabProps> = ({ 
  empresas, 
  isLoading = false, 
  onViewDetails,
  onSearch,
  fetchEmpresas,
  isInitialized = false
}) => {
  const [filteredEmpresas, setFilteredEmpresas] = React.useState(empresas);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string[]>>({});

  // Atualiza os dados filtrados quando a lista de empresas mudar
  React.useEffect(() => {
    // Não aplicamos filtros automáticos, apenas inicializamos com a lista completa
    setFilteredEmpresas(empresas);
  }, [empresas]);

  const handleFilterChange = (term: string, filters?: Record<string, string[]>) => {
    console.log('Aplicando filtros:', term, filters);
    setSearchTerm(term);
    setActiveFilters(filters || {});
    
    // Se um callback de busca externo foi fornecido, usamos ele
    if (onSearch) {
      onSearch(term, filters);
    }
    // Caso contrário, filtramos localmente
    else {
      let filtered = [...empresas];
      
      // Filtrar por termo de busca
      if (term) {
        const searchLower = term.toLowerCase();
        filtered = filtered.filter(
          empresa =>
            (empresa.nome && empresa.nome.toLowerCase().includes(searchLower)) ||
            (empresa.razaoSocial && empresa.razaoSocial.toLowerCase().includes(searchLower)) ||
            (empresa.cnpj && empresa.cnpj.includes(searchLower))
        );
      }
      
      // Aplicar filtros
      if (filters) {
        Object.entries(filters).forEach(([key, values]) => {
          if (values.length > 0) {
            filtered = filtered.filter(empresa => {
              // Tratamento especial para o campo "status" que pode estar em diferentes formatos
              if (key === 'status') {
                return values.includes(empresa[key]?.toLowerCase() || '');
              }
              return values.includes(empresa[key]);
            });
          }
        });
      }
      
      setFilteredEmpresas(filtered);
    }
  };

  const handleSearchButtonClick = () => {
    if (fetchEmpresas && !isInitialized) {
      fetchEmpresas();
    } else {
      handleFilterChange(searchTerm, activeFilters);
    }
  };

  // Passar o custom handler para o SearchFilter
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Empresas Cadastradas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <SearchFilter
            placeholder="Buscar por nome ou CNPJ..."
            filterConfig={filterConfig}
            onSearch={handleFilterChange}
            searchButtonHandler={handleSearchButtonClick}
          />
        </div>
        
        {isLoading ? (
          <div className="w-full py-10 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Carregando empresas...</span>
          </div>
        ) : !isInitialized ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>Use o campo de busca acima e clique em "Buscar" para consultar empresas.</p>
          </div>
        ) : (
          <EmpresasListTable 
            empresas={filteredEmpresas} 
            onViewDetails={onViewDetails}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default EmpresasListTab;
