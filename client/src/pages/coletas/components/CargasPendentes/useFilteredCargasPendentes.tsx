
import { useState, useMemo } from 'react';
import { Carga } from '../../types/coleta.types';

interface UseFilteredCargasPendentesProps {
  cargas: Carga[];
}

export const useFilteredCargasPendentes = ({ cargas }: UseFilteredCargasPendentesProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    Status: 'all',
    Destino: 'all'
  });

  const filteredCargas = useMemo(() => {
    return cargas.filter(carga => {
      // Filter by search value
      const matchesSearch = !searchValue || 
        carga.id.toLowerCase().includes(searchValue.toLowerCase()) || 
        carga.destino.toLowerCase().includes(searchValue.toLowerCase());

      // Filter by status
      const matchesStatus = 
        filters.Status === 'all' || 
        carga.status === filters.Status;

      // Filter by destination
      const matchesDestino = 
        filters.Destino === 'all' || 
        carga.destino.toLowerCase().includes(filters.Destino.toLowerCase());

      return matchesSearch && matchesStatus && matchesDestino;
    });
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

  return {
    filteredCargas,
    searchValue,
    filters,
    handleSearch,
    handleFilterChange
  };
};
