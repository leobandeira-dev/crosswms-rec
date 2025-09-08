
import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carga } from '../types/coleta.types';
import { Map, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CargaCards from './mapa/CargaCards';
import MapaContainer from './mapa/MapaContainer';
import RotaInfo from './mapa/RotaInfo';
import MapaLegenda from './mapa/MapaLegenda';
import { generateGoogleMapsDirectionsUrl } from './mapa/utils'; // Updated import path

interface MapaRotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  motorista: string | null;
  cargas: Carga[];
}

const MapaRotaModal: React.FC<MapaRotaModalProps> = ({
  isOpen,
  onClose,
  motorista,
  cargas
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<boolean>(false);
  
  // Set up map visibility when the modal opens or closes
  useEffect(() => {
    if (isOpen) {
      // Reset closing state
      closingRef.current = false;
      
      setSelectedCardId(null);
      
      // Delay map initialization to ensure DOM is ready
      const timer = setTimeout(() => {
        if (!closingRef.current) {
          setMapVisible(true);
        }
      }, 500); // Increased delay for safer initialization
      
      return () => {
        clearTimeout(timer);
      };
    } else {
      // When modal closes, hide the map first
      setMapVisible(false);
      closingRef.current = true;
    }
  }, [isOpen]);
  
  // Reset selected card when cargas change
  useEffect(() => {
    if (isOpen) {
      setSelectedCardId(null);
    }
  }, [cargas, isOpen]);
  
  // Function to open Google Maps with an address
  const openGoogleMaps = (carga: Carga) => {
    const address = `${carga.destino}, ${carga.cep}, Brasil`;
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    
    // Highlight the selected card
    setSelectedCardId(carga.id);
  };
  
  // Function to open Google Maps with the complete route
  const openGoogleMapsRoute = () => {
    const url = generateGoogleMapsDirectionsUrl(cargas);
    window.open(url, '_blank');
  };
  
  // Handle close with cleanup
  const handleClose = () => {
    // Mark that we're in closing process
    closingRef.current = true;
    
    // Set map visibility to false first, allowing the map component to clean up
    setMapVisible(false);
    
    // Delay the actual closing to allow React to process state changes
    setTimeout(() => {
      onClose();
    }, 500);  // Increased delay for safer cleanup
  };
  
  // Handle Dialog open change
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[90vw] w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Map className="mr-2 h-5 w-5" />
              {motorista ? `Rota de ${motorista}` : "Visualização das Coletas"}
            </div>
            
            {cargas.length > 1 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2" 
                onClick={openGoogleMapsRoute}
              >
                <ExternalLink className="h-4 w-4" />
                Abrir rota no Google Maps
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4" ref={modalContentRef}>
          {isOpen && (
            <>
              <CargaCards 
                cargas={cargas} 
                selectedCardId={selectedCardId} 
                onCardSelect={openGoogleMaps} 
              />

              {mapVisible && (
                <MapaContainer 
                  cargas={cargas} 
                  selectedCardId={selectedCardId} 
                  setSelectedCardId={setSelectedCardId} 
                />
              )}

              <RotaInfo 
                showInfo={cargas.length > 1} 
                cargasCount={cargas.length} 
              />
              
              <MapaLegenda />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapaRotaModal;
