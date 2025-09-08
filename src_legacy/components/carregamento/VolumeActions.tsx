
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Eye, Minus } from 'lucide-react';

interface VolumeActionsProps {
  row: any;
  tipoVisualizacao: 'conferir' | 'emConferencia' | 'conferidas';
  handleVerificarItem: (id: string) => void;
  onRemoveClick?: (id: string) => void;
}

const VolumeActions: React.FC<VolumeActionsProps> = ({
  row,
  tipoVisualizacao,
  handleVerificarItem,
  onRemoveClick
}) => {
  return (
    <div className="flex gap-2 justify-end">
      <Button variant="outline" size="sm">
        <Eye size={16} className="mr-1" />
        Detalhes
      </Button>
      
      {!row.verificado && tipoVisualizacao === 'conferir' && (
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-cross-blue text-white hover:bg-cross-blue/90"
          onClick={() => handleVerificarItem(row.id)}
        >
          <CheckCircle size={16} className="mr-1" />
          Verificar
        </Button>
      )}
      
      {onRemoveClick && (
        <Button 
          variant="outline" 
          size="sm" 
          className="border-red-500 text-red-500 hover:bg-red-50"
          onClick={() => onRemoveClick(row.id)}
        >
          <Minus size={16} className="mr-1" />
          Remover
        </Button>
      )}
    </div>
  );
};

export default VolumeActions;
