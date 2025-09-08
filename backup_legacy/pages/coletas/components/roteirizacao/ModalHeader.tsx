
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw, Route } from 'lucide-react';

interface ModalHeaderProps {
  cargas: any[];
  isLoading: boolean;
  calcularRota: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ cargas, isLoading, calcularRota }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center">
          <Route className="mr-2 h-5 w-5" />
          Roteirização de Coletas
        </DialogTitle>
      </DialogHeader>
      
      <div className="py-4">
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {cargas.length} coleta{cargas.length !== 1 ? 's' : ''} selecionada{cargas.length !== 1 ? 's' : ''}
          </p>
          
          <Button 
            onClick={calcularRota} 
            disabled={cargas.length <= 1 || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Otimizar Rota
          </Button>
        </div>
      </div>
    </>
  );
};

export default ModalHeader;
