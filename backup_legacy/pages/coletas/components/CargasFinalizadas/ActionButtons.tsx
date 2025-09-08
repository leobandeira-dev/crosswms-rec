
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, MoreHorizontal, Trash2 } from 'lucide-react';
import { Carga } from '../../types/coleta.types';

export interface ActionButtonsProps {
  carga: Carga;
  onDetalhes?: (carga: Carga) => void;
  onExcluir?: (cargaId: string) => void;
  setSelectedCarga?: (carga: Carga) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ carga, onDetalhes, onExcluir, setSelectedCarga }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onDetalhes && (
          <DropdownMenuItem onClick={() => onDetalhes(carga)}>
            <FileText className="mr-2 h-4 w-4" />
            Ver detalhes
          </DropdownMenuItem>
        )}
        {setSelectedCarga && (
          <DropdownMenuItem onClick={() => setSelectedCarga(carga)}>
            <FileText className="mr-2 h-4 w-4" />
            Ver detalhes
          </DropdownMenuItem>
        )}
        {onExcluir && (
          <DropdownMenuItem onClick={() => onExcluir(carga.id)} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActionButtons;
