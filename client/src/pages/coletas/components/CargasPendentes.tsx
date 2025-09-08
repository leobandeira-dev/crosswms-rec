
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carga } from '../types/coleta.types';
import { useMemo } from 'react';
import TableHeader from './CargasPendentes/TableHeader';
import CargasList from './CargasPendentes/CargasList';
import PaginationControls from './CargasPendentes/PaginationControls';
import AlocacaoModal from './AlocacaoModal';
import RoteirizacaoModal from './RoteirizacaoModal';
import PreAlocacaoModal from './PreAlocacaoModal';
import { toast } from '@/hooks/use-toast';

interface CargasPendentesProps {
  cargas: Carga[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onAlocar?: (cargasIds: string[], motoristaId: string, motoristaName: string, veiculoId: string, veiculoName: string) => void;
  onPreAlocar?: (cargasIds: string[], tipoVeiculoId: string, tipoVeiculoNome: string) => void;
  onGerarPreRomaneio?: (cargasIds: string[], tipoVeiculoId: string, tipoVeiculoNome: string) => void;
}

const CargasPendentes: React.FC<CargasPendentesProps> = ({ 
  cargas, 
  currentPage, 
  setCurrentPage,
  onAlocar,
  onPreAlocar,
  onGerarPreRomaneio
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedCargasIds, setSelectedCargasIds] = useState<string[]>([]);
  const [isAlocacaoModalOpen, setIsAlocacaoModalOpen] = useState(false);
  const [isPreAlocacaoModalOpen, setIsPreAlocacaoModalOpen] = useState(false);
  const [isRoteirizacaoModalOpen, setIsRoteirizacaoModalOpen] = useState(false);
  const [sortByCEP, setSortByCEP] = useState(false);

  const filteredCargas = useMemo(() => {
    if (!searchValue) return cargas;
    
    const searchLower = searchValue.toLowerCase();
    return cargas.filter(carga => 
      carga.id.toLowerCase().includes(searchLower) || 
      carga.destino.toLowerCase().includes(searchLower) ||
      carga.origem?.toLowerCase().includes(searchLower)
    );
  }, [cargas, searchValue]);

  // Sorted cargas
  const sortedCargas = useMemo(() => {
    if (!sortByCEP) return filteredCargas;
    
    return [...filteredCargas].sort((a, b) => {
      if (!a.cep && !b.cep) return 0;
      if (!a.cep) return 1;
      if (!b.cep) return -1;
      return a.cep.localeCompare(b.cep);
    });
  }, [filteredCargas, sortByCEP]);

  // Reset selected cargas when the cargas list changes
  useEffect(() => {
    setSelectedCargasIds([]);
  }, [cargas]);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };
  
  const toggleSelectCarga = (cargaId: string) => {
    setSelectedCargasIds(prev => 
      prev.includes(cargaId) 
        ? prev.filter(id => id !== cargaId) 
        : [...prev, cargaId]
    );
  };
  
  const toggleSelectAll = () => {
    if (selectedCargasIds.length === filteredCargas.length) {
      setSelectedCargasIds([]);
    } else {
      setSelectedCargasIds(filteredCargas.map(c => c.id));
    }
  };
  
  // Handle sorting by CEP
  const handleSortByCEP = () => {
    setSortByCEP(prev => !prev);
    if (!sortByCEP) {
      toast({
        title: "Ordenação aplicada",
        description: "Cargas ordenadas por CEP para facilitar a roteirização."
      });
    }
  };
  
  // Gerenciar pré-alocação de veículo
  const handlePreAlocar = (cargasIds: string[], tipoVeiculoId: string, tipoVeiculoNome: string) => {
    if (onPreAlocar) {
      onPreAlocar(cargasIds, tipoVeiculoId, tipoVeiculoNome);
    } else {
      toast({
        title: "Pré-alocação concluída",
        description: `${cargasIds.length} carga(s) pré-alocada(s) para veículo tipo ${tipoVeiculoNome}.`
      });
    }
  };
  
  // Gerenciar geração de pré-romaneio
  const handleGerarPreRomaneio = (cargasIds: string[], tipoVeiculoId: string, tipoVeiculoNome: string) => {
    if (onGerarPreRomaneio) {
      onGerarPreRomaneio(cargasIds, tipoVeiculoId, tipoVeiculoNome);
    } else {
      toast({
        title: "Pré-romaneio gerado",
        description: `${cargasIds.length} carga(s) agrupada(s) em um pré-romaneio.`
      });
    }
  };
  
  // Pagination
  const itemsPerPage = 5;
  const totalPages = Math.ceil(sortedCargas.length / itemsPerPage);
  const currentItems = sortedCargas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <>
      <div className="space-y-4">
        <TableHeader 
          onSearch={handleSearch}
          selectedCargasIds={selectedCargasIds}
          setIsRoteirizacaoModalOpen={setIsRoteirizacaoModalOpen}
          setIsAlocacaoModalOpen={setIsAlocacaoModalOpen}
          setIsPreAlocacaoModalOpen={setIsPreAlocacaoModalOpen}
          onSortByCEP={handleSortByCEP}
        />

        <Card>
          <CardHeader className="py-4">
            <CardTitle>Coletas Pendentes de Alocação {sortByCEP && '(Ordenadas por CEP)'}</CardTitle>
          </CardHeader>
          <CardContent>
            <CargasList 
              currentItems={currentItems}
              selectedCargasIds={selectedCargasIds}
              toggleSelectCarga={toggleSelectCarga}
              toggleSelectAll={toggleSelectAll}
              filteredCargas={sortedCargas}
            />

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          </CardContent>
        </Card>
      </div>

      <AlocacaoModal
        isOpen={isAlocacaoModalOpen}
        onClose={() => setIsAlocacaoModalOpen(false)}
        cargas={cargas.filter(carga => selectedCargasIds.includes(carga.id))}
        onConfirm={(cargasIds, motoristaId, motoristaName, veiculoId, veiculoName) => {
          if (onAlocar) {
            onAlocar(selectedCargasIds, motoristaId, motoristaName, veiculoId, veiculoName);
          }
          setIsAlocacaoModalOpen(false);
        }}
      />

      <PreAlocacaoModal
        isOpen={isPreAlocacaoModalOpen}
        onClose={() => setIsPreAlocacaoModalOpen(false)}
        cargas={cargas.filter(carga => selectedCargasIds.includes(carga.id))}
        onPreAlocar={handlePreAlocar}
        onGerarPreRomaneio={handleGerarPreRomaneio}
      />

      <RoteirizacaoModal
        isOpen={isRoteirizacaoModalOpen}
        onClose={() => setIsRoteirizacaoModalOpen(false)}
        cargas={cargas.filter(carga => selectedCargasIds.includes(carga.id))}
      />
    </>
  );
};

export default CargasPendentes;
