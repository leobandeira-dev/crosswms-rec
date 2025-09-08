
import React from 'react';
import EmpresasListTab from '../EmpresasListTab';
import { useEmpresaSearch } from '../permissoes/useEmpresaSearch';

interface EmpresasListTabWrapperProps {
  empresas: any[];
  isLoading?: boolean;
  onViewDetails: (empresa: any) => void;
}

const EmpresasListTabWrapper: React.FC<EmpresasListTabWrapperProps> = ({ 
  empresas, 
  isLoading: propIsLoading, 
  onViewDetails 
}) => {
  // Usar o hook de pesquisa para gerenciar a busca de empresas
  const {
    filteredEmpresas,
    handleSearch,
    isLoading: hookIsLoading,
    fetchEmpresas,
    isInitialized
  } = useEmpresaSearch();

  // Combinar os dados de loading e empresas
  const combinedEmpresas = isInitialized ? filteredEmpresas : empresas;
  const isLoading = propIsLoading || hookIsLoading;

  return (
    <EmpresasListTab 
      empresas={combinedEmpresas}
      isLoading={isLoading}
      onViewDetails={onViewDetails}
      onSearch={handleSearch}
      fetchEmpresas={fetchEmpresas}
      isInitialized={isInitialized}
    />
  );
};

export default EmpresasListTabWrapper;
