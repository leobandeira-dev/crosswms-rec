
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Route, Tag, Truck, Map, SortDesc } from 'lucide-react';
import SearchFilter from '@/components/common/SearchFilter';
import { filterConfig } from './filterConfig';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Carga } from '../../types/coleta.types';
import { generateGoogleMapsDirectionsUrl } from '../mapa/utils';

interface TableHeaderProps {
  onSearch: (value: string) => void;
  selectedCargasIds: string[];
  setIsRoteirizacaoModalOpen: (isOpen: boolean) => void;
  setIsAlocacaoModalOpen: (isOpen: boolean) => void;
  setIsPreAlocacaoModalOpen?: (isOpen: boolean) => void;
  onSortByCEP?: () => void;
  cargas?: Carga[];
}

const TableHeader: React.FC<TableHeaderProps> = ({
  onSearch,
  selectedCargasIds,
  setIsRoteirizacaoModalOpen,
  setIsAlocacaoModalOpen,
  setIsPreAlocacaoModalOpen,
  onSortByCEP,
  cargas = []
}) => {
  const [isMapLinksDialogOpen, setIsMapLinksDialogOpen] = useState(false);
  
  // Filter cargas based on selected IDs or show all if none selected
  const cargasToShow = selectedCargasIds.length > 0
    ? cargas.filter(carga => selectedCargasIds.includes(carga.id))
    : cargas;

  // Generate individual Google Maps link for a location
  const generateGoogleMapsLink = (carga: Carga): string => {
    const address = `${carga.destino}, ${carga.cep || ''}, Brasil`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <SearchFilter
          placeholder="Buscar por destino, origem ou número da coleta..."
          onSearch={onSearch}
          filters={filterConfig}
        />
        
        <div className="flex gap-2 w-full sm:w-auto flex-wrap">
          <Button 
            variant="outline" 
            className="flex-1 sm:flex-none"
            onClick={() => setIsRoteirizacaoModalOpen(true)}
            disabled={selectedCargasIds.length === 0}
          >
            <Route className="mr-2 h-4 w-4" /> Roteirizar
          </Button>
          
          {setIsPreAlocacaoModalOpen && (
            <Button 
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => setIsPreAlocacaoModalOpen(true)}
              disabled={selectedCargasIds.length === 0}
            >
              <Truck className="mr-2 h-4 w-4" /> Pré-Alocar Veículo
            </Button>
          )}
          
          <Button 
            className="flex-1 sm:flex-none"
            onClick={() => setIsAlocacaoModalOpen(true)}
            disabled={selectedCargasIds.length === 0}
          >
            <Tag className="mr-2 h-4 w-4" /> Alocar Motorista
          </Button>

          <Button 
            variant="outline"
            className="flex-1 sm:flex-none"
            onClick={() => setIsMapLinksDialogOpen(true)}
          >
            <Map className="mr-2 h-4 w-4" /> Ver Mapa
          </Button>

          {onSortByCEP && (
            <Button 
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={onSortByCEP}
            >
              <SortDesc className="mr-2 h-4 w-4" /> Ordenar por CEP
            </Button>
          )}
        </div>
      </div>

      {/* Map Links Dialog */}
      <Dialog open={isMapLinksDialogOpen} onOpenChange={setIsMapLinksDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Localização das Coletas</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            {cargasToShow.length === 0 ? (
              <p className="text-muted-foreground">Nenhuma coleta selecionada para visualização.</p>
            ) : (
              <>
                <div className="mb-4">
                  <Button 
                    onClick={() => window.open(generateGoogleMapsDirectionsUrl(cargasToShow), '_blank')} 
                    className="w-full"
                    disabled={cargasToShow.length < 2}
                  >
                    <Route className="mr-2 h-4 w-4" /> 
                    Ver Rota Completa no Google Maps
                  </Button>
                </div>
                
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {cargasToShow.map((carga, index) => (
                    <div key={carga.id} className="flex justify-between items-center border rounded-md p-3 bg-muted/30">
                      <div>
                        <p className="font-medium">
                          {index + 1}. {carga.destino}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {carga.id} • {carga.cep || "Sem CEP"}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => window.open(generateGoogleMapsLink(carga), '_blank')}
                      >
                        <Map className="h-4 w-4 mr-1" /> Abrir
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMapLinksDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TableHeader;
