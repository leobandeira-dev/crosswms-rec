
import React from 'react';
import { Button } from '@/components/ui/button';
import { Carga } from '../../types/coleta.types';
import { Eye, Truck, AlertCircle } from 'lucide-react';

interface ActionButtonsProps {
  carga: Carga;
  onAlocar: (carga: Carga) => void;
  setSelectedCarga: (carga: Carga) => void;
  onViewCarga?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  carga, 
  onAlocar, 
  setSelectedCarga,
  onViewCarga
}) => {
  return (
    <div className="flex justify-end gap-2">
      {onViewCarga && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewCarga();
          }}
        >
          <Eye className="h-4 w-4 mr-1" /> Ver
        </Button>
      )}
      <Button 
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedCarga(carga);
        }}
      >
        <AlertCircle className="h-4 w-4 mr-1" /> Suporte
      </Button>
      <Button 
        size="sm"
        className="bg-cross-blue hover:bg-cross-blueDark"
        onClick={(e) => {
          e.stopPropagation();
          onAlocar(carga);
        }}
      >
        <Truck className="h-4 w-4 mr-1" /> Alocar
      </Button>
    </div>
  );
};

export default ActionButtons;
