
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, UserX, MessageSquare } from 'lucide-react';
import { DialogTrigger } from "@/components/ui/dialog";

interface ActionButtonsProps {
  carga: any;
  onDesalocar: (cargaId: string, motorista: string) => void;
  onFinalizar: (cargaId: string, status: 'delivered' | 'problem') => void;
  setSelectedCarga: (carga: any) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  carga, 
  onDesalocar, 
  onFinalizar, 
  setSelectedCarga 
}) => {
  return (
    <div className="flex space-x-2 justify-end">
      <Button 
        variant="outline"
        size="sm"
        className="bg-green-500 hover:bg-green-600 text-white border-none"
        onClick={() => setSelectedCarga(carga)}
      >
        <MessageSquare className="h-4 w-4 mr-1" /> Suporte
      </Button>
      
      <Button 
        variant="outline"
        size="sm"
      >
        <FileText className="h-4 w-4 mr-1" /> Detalhes
      </Button>
      
      <Button 
        variant="outline"
        size="sm"
        className="text-red-600 border-red-600 hover:bg-red-50"
        onClick={() => onDesalocar(carga.id, carga.motorista)}
      >
        <UserX className="h-4 w-4 mr-1" /> Desalocar
      </Button>

      <Button 
        variant="outline"
        size="sm" 
        className="text-green-600 border-green-600 hover:bg-green-50"
        onClick={() => onFinalizar(carga.id, 'delivered')}
      >
        Finalizar
      </Button>
    </div>
  );
};

export default ActionButtons;
