import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Carga } from '../../types/coleta.types';
import PaginationControls from './PaginationControls';
import ActionButtons from './ActionButtons';
import CargasTableHeader from './TableHeader'; // Renamed import to avoid collision
import RoteirizacaoModal from '../RoteirizacaoModal';
import AlocacaoModal from '../AlocacaoModal';
import PreAlocacaoModal from '../PreAlocacaoModal';

interface CargasPendentesCardProps {
  filteredCargas: Carga[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  onAlocarMotorista: (carga: Carga) => void;
  setSelectedCarga: (carga: Carga) => void;
  onViewCarga: (carga: Carga) => void;
  onPreAlocar?: (cargasIds: string[], tipoVeiculoId: string, tipoVeiculoNome: string) => void;
  onGerarPreRomaneio?: (cargasIds: string[], tipoVeiculoId: string, tipoVeiculoNome: string) => void;
  onAlocar?: (cargasIds: string[], motoristaId: string, motoristaName: string, veiculoId: string, veiculoName: string) => void;
}

const CargasPendentesCard: React.FC<CargasPendentesCardProps> = ({
  filteredCargas,
  currentPage,
  setCurrentPage,
  onAlocarMotorista,
  setSelectedCarga,
  onViewCarga,
  onPreAlocar,
  onGerarPreRomaneio,
  onAlocar
}) => {
  const [selectedCargasIds, setSelectedCargasIds] = useState<string[]>([]);
  const [isRoteirizacaoModalOpen, setIsRoteirizacaoModalOpen] = useState(false);
  const [isAlocacaoModalOpen, setIsAlocacaoModalOpen] = useState(false);
  const [isPreAlocacaoModalOpen, setIsPreAlocacaoModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCargas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCargas = filteredCargas.slice(startIndex, endIndex);
  
  // Handle checkbox selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCargasIds(currentCargas.map(carga => carga.id));
    } else {
      setSelectedCargasIds([]);
    }
  };
  
  const handleSelectOne = (cargaId: string, checked: boolean) => {
    if (checked) {
      setSelectedCargasIds(prev => [...prev, cargaId]);
    } else {
      setSelectedCargasIds(prev => prev.filter(id => id !== cargaId));
    }
  };
  
  // Ordenar por CEP
  const sortByCEP = () => {
    // Functionality would be implemented in the parent component
    // This is just a placeholder
  };
  
  // Get selected cargas as objects
  const selectedCargas = filteredCargas.filter(carga => selectedCargasIds.includes(carga.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cargas Pendentes</CardTitle>
        <CargasTableHeader 
          onSearch={setSearchTerm}
          selectedCargasIds={selectedCargasIds}
          setIsRoteirizacaoModalOpen={setIsRoteirizacaoModalOpen}
          setIsAlocacaoModalOpen={setIsAlocacaoModalOpen}
          setIsPreAlocacaoModalOpen={setIsPreAlocacaoModalOpen}
          onSortByCEP={sortByCEP}
          cargas={filteredCargas}
        />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={currentCargas.length > 0 && selectedCargasIds.length === currentCargas.length}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Data Prevista</TableHead>
                <TableHead>Volumes</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentCargas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Nenhuma carga pendente encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                currentCargas.map(carga => (
                  <TableRow key={carga.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedCargasIds.includes(carga.id)}
                        onCheckedChange={(checked) => handleSelectOne(carga.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{carga.destino}</div>
                      <div className="text-sm text-muted-foreground">{carga.id}</div>
                    </TableCell>
                    <TableCell>{carga.origem || "—"}</TableCell>
                    <TableCell>{carga.dataPrevisao}</TableCell>
                    <TableCell>{carga.volumes}</TableCell>
                    <TableCell>{carga.peso}</TableCell>
                    <TableCell className="text-right">
                      <ActionButtons 
                        carga={carga}
                        onAlocar={onAlocarMotorista}
                        setSelectedCarga={setSelectedCarga}
                        onViewCarga={() => onViewCarga(carga)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <PaginationControls 
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={setCurrentPage}
        />
      </CardContent>

      {/* Related modals */}
      <RoteirizacaoModal
        isOpen={isRoteirizacaoModalOpen}
        onClose={() => setIsRoteirizacaoModalOpen(false)}
        cargas={selectedCargas}
      />

      {onAlocar && (
        <AlocacaoModal 
          isOpen={isAlocacaoModalOpen}
          onClose={() => setIsAlocacaoModalOpen(false)}
          cargas={selectedCargas}
          onConfirm={onAlocar}
        />
      )}

      {onPreAlocar && onGerarPreRomaneio && (
        <PreAlocacaoModal
          isOpen={isPreAlocacaoModalOpen}
          onClose={() => setIsPreAlocacaoModalOpen(false)}
          cargas={selectedCargas}
          onPreAlocar={onPreAlocar}
          onGerarPreRomaneio={onGerarPreRomaneio}
        />
      )}
    </Card>
  );
};

export default CargasPendentesCard;
