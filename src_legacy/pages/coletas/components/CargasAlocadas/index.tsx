
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SearchFilter from '@/components/common/SearchFilter';
import { filterConfig } from './filterConfig';
import CargasTable from './CargasTable';

interface CargasAlocadasProps {
  cargas: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const CargasAlocadas: React.FC<CargasAlocadasProps> = ({ 
  cargas, 
  currentPage, 
  setCurrentPage 
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [filteredCargas, setFilteredCargas] = useState(cargas);
  const [filters, setFilters] = useState({
    Motorista: 'all',
    Status: 'all'
  });

  // Apply filters whenever cargas, search value or filters change
  useEffect(() => {
    let result = [...cargas];
    
    // Apply text search
    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      result = result.filter(carga => 
        carga.id?.toString().toLowerCase().includes(searchLower) || 
        carga.destino?.toLowerCase().includes(searchLower) ||
        carga.motorista?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply motorista filter
    if (filters.Motorista !== 'all') {
      result = result.filter(carga => {
        if (!carga.motorista) return false;
        
        // Map filter values to motorista names
        const motoristaMap: Record<string, string> = {
          'jose': 'José da Silva',
          'carlos': 'Carlos Santos',
          'pedro': 'Pedro Oliveira',
          'antonio': 'Antônio Ferreira',
          'manuel': 'Manuel Costa',
        };
        
        return carga.motorista === motoristaMap[filters.Motorista];
      });
    }
    
    // Apply status filter
    if (filters.Status !== 'all') {
      result = result.filter(carga => carga.status === filters.Status);
    }
    
    setFilteredCargas(result);
  }, [cargas, searchValue, filters]);

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
      
      <Card>
        <CardHeader>
          <CardTitle>Cargas Alocadas</CardTitle>
        </CardHeader>
        <CardContent>
          <CargasTable 
            cargas={filteredCargas}
            pagination={{
              totalPages: Math.max(1, Math.ceil(filteredCargas.length / 10)),
              currentPage: currentPage,
              onPageChange: setCurrentPage
            }}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default CargasAlocadas;
