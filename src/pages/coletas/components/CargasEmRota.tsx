
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Carga } from '../types/coleta.types';
import { Check, Map, X } from 'lucide-react';
import SearchFilter from '@/components/common/SearchFilter';
import { Badge } from '@/components/ui/badge';
import MapaRotaModal from './MapaRotaModal';

interface CargasEmRotaProps {
  cargas: Carga[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onFinalizar: (cargaId: string, status: 'delivered' | 'problem') => void;
}

const CargasEmRota: React.FC<CargasEmRotaProps> = ({ 
  cargas, 
  currentPage, 
  setCurrentPage, 
  onFinalizar 
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState({
    Motorista: 'all'
  });
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedMotorista, setSelectedMotorista] = useState<string | null>(null);

  // Agrupar cargas por motorista
  const cargasAgrupadas = useMemo(() => {
    const grupos = cargas.reduce((acc, carga) => {
      if (!carga.motorista) return acc;
      
      if (!acc[carga.motorista]) {
        acc[carga.motorista] = [];
      }
      
      acc[carga.motorista].push(carga);
      return acc;
    }, {} as Record<string, Carga[]>);
    
    return grupos;
  }, [cargas]);

  // Lista de motoristas únicos para o filtro
  const motoristas = useMemo(() => {
    return Object.keys(cargasAgrupadas);
  }, [cargasAgrupadas]);

  // Filtra com base na busca e nos filtros selecionados
  const cargasFiltradas = useMemo(() => {
    let resultado = [...cargas];
    
    // Aplicar filtro de texto
    if (searchValue) {
      const termoBusca = searchValue.toLowerCase();
      resultado = resultado.filter(carga => 
        carga.id.toLowerCase().includes(termoBusca) || 
        carga.destino.toLowerCase().includes(termoBusca) ||
        carga.origem?.toLowerCase().includes(termoBusca) ||
        carga.motorista?.toLowerCase().includes(termoBusca)
      );
    }
    
    // Aplicar filtro de motorista
    if (filters.Motorista !== 'all') {
      resultado = resultado.filter(carga => 
        carga.motorista === filters.Motorista
      );
    }
    
    return resultado;
  }, [cargas, searchValue, filters]);
  
  // Paginar os resultados
  const itemsPerPage = 10;
  const totalPages = Math.ceil(cargasFiltradas.length / itemsPerPage);
  const currentItems = cargasFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Configuração dos filtros para o componente SearchFilter
  const filterConfig = useMemo(() => [
    {
      name: "Motorista",
      options: [
        { label: "Todos", value: "all" },
        ...motoristas.map(motorista => ({
          label: motorista,
          value: motorista
        }))
      ]
    }
  ], [motoristas]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };
  
  const handleFilterChange = (filter: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filter]: value
    }));
    setCurrentPage(1);
  };
  
  const handleVerMapa = (motorista: string) => {
    setSelectedMotorista(motorista);
    setIsMapModalOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SearchFilter 
            placeholder="Buscar por motorista, destino ou coleta..."
            onSearch={handleSearch}
            filters={filterConfig}
            onFilterChange={handleFilterChange}
          />
        </div>
        
        {motoristas.length === 0 ? (
          <Card>
            <CardHeader className="py-4">
              <CardTitle>Cargas em Rota</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">Não há cargas em rota no momento.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          Object.entries(cargasAgrupadas).map(([motorista, cargasMotorista]) => {
            // Se houver filtro de motorista e não for este motorista, pular
            if (filters.Motorista !== 'all' && filters.Motorista !== motorista) {
              return null;
            }
            
            // Se houver busca de texto, filtrar as cargas do motorista
            const cargasFiltradas = searchValue 
              ? cargasMotorista.filter(carga => 
                  carga.id.toLowerCase().includes(searchValue.toLowerCase()) || 
                  carga.destino.toLowerCase().includes(searchValue.toLowerCase()) ||
                  carga.origem?.toLowerCase().includes(searchValue.toLowerCase())
                ) 
              : cargasMotorista;
              
            if (cargasFiltradas.length === 0) return null;
            
            return (
              <Card key={motorista} className="mb-6 last:mb-0">
                <CardHeader className="py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{motorista}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {cargasMotorista[0]?.veiculo || "Veículo não especificado"} • 
                        {cargasFiltradas.length} coleta{cargasFiltradas.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleVerMapa(motorista)}
                    >
                      <Map className="mr-2 h-4 w-4" /> Ver Rota
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Número</TableHead>
                          <TableHead>Origem</TableHead>
                          <TableHead>Destino</TableHead>
                          <TableHead>CEP</TableHead>
                          <TableHead className="text-center">Volumes</TableHead>
                          <TableHead>Peso</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cargasFiltradas.map((carga) => (
                          <TableRow key={carga.id}>
                            <TableCell className="font-medium">{carga.id}</TableCell>
                            <TableCell>{carga.origem || "—"}</TableCell>
                            <TableCell>{carga.destino}</TableCell>
                            <TableCell>{carga.cep || "—"}</TableCell>
                            <TableCell className="text-center">{carga.volumes}</TableCell>
                            <TableCell>{carga.peso}</TableCell>
                            <TableCell>
                              <Badge variant={
                                carga.status === 'transit' ? "default" :
                                carga.status === 'loading' ? "outline" : 
                                "secondary"
                              }>
                                {carga.status === 'transit' ? "Em trânsito" :
                                 carga.status === 'loading' ? "Em carregamento" :
                                 "Agendada"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-8 px-2 text-green-600 border-green-600 hover:bg-green-50"
                                  onClick={() => onFinalizar(carga.id, 'delivered')}
                                >
                                  <Check className="h-4 w-4" />
                                  <span className="sr-only">Entregue</span>
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-8 px-2 text-red-600 border-red-600 hover:bg-red-50"
                                  onClick={() => onFinalizar(carga.id, 'problem')}
                                >
                                  <X className="h-4 w-4" />
                                  <span className="sr-only">Problema</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
        
        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button 
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <MapaRotaModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        motorista={selectedMotorista}
        cargas={selectedMotorista ? cargasAgrupadas[selectedMotorista] || [] : []}
      />
    </>
  );
};

export default CargasEmRota;
