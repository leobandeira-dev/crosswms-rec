
import { useState, useEffect } from 'react';

interface UseFilteredCargasProps {
  cargas: any[];
  searchValue: string;
  filters: {
    Motorista: string;
    Status: string;
    [key: string]: string;
  };
}

export const useFilteredCargas = ({ cargas, searchValue, filters }: UseFilteredCargasProps) => {
  const [filteredCargas, setFilteredCargas] = useState(cargas);

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

    // Apply other filters
    Object.entries(filters).forEach(([key, value]) => {
      if (key !== 'Motorista' && key !== 'Status' && value !== 'all') {
        // Apply additional filters based on key and value
        result = result.filter(carga => {
          // Implement specific filter logic for each key if needed
          return true; // Placeholder, implement specific logic as needed
        });
      }
    });
    
    setFilteredCargas(result);
  }, [cargas, searchValue, filters]);

  return { filteredCargas };
};
