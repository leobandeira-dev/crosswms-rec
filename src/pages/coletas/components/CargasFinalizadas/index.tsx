
import React, { useState } from 'react';
import SearchFilter from '@/components/common/SearchFilter';
import { filterConfig } from './filterConfig';
import { useFilteredCargas } from './useFilteredCargas';
import CargasFinalizadasCard from './CargasFinalizadasCard';

interface CargasFinalizadasProps {
  cargas: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const CargasFinalizadas: React.FC<CargasFinalizadasProps> = ({ 
  cargas, 
  currentPage, 
  setCurrentPage 
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    Motorista: 'all',
    Status: 'all'
  });

  const { filteredCargas } = useFilteredCargas({ 
    cargas,
    searchValue,
    filters
  });

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };
  
  const handleFilterChange = (filter: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
  };

  return (
    <>
      <SearchFilter 
        placeholder="Buscar por ID, motorista ou destino..."
        filters={filterConfig}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
      
      <CargasFinalizadasCard 
        filteredCargas={filteredCargas}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </>
  );
};

export default CargasFinalizadas;
