
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { handleWhatsAppSupport, problemosComuns } from '../../motoristas/utils/supportHelpers';
import { Carga } from './types/coleta.types';

interface CargasSupportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCarga: Carga | null;
}

const CargasSupportDialog: React.FC<CargasSupportDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedCarga
}) => {
  if (!selectedCarga) return null;

  const handleSupportRequest = (problem: string, description: string) => {
    const cargaInfo = {
      id: selectedCarga.id,
      destino: selectedCarga.destino,
      motorista: selectedCarga.motorista || 'Não alocado',
      veiculo: selectedCarga.veiculo || 'Não alocado',
    };
    
    const messageWithProblem = `${problem} - ${description} - `;
    
    handleWhatsAppSupport({
      ...cargaInfo,
      id: `${cargaInfo.id} - PROBLEMA: ${messageWithProblem}`
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Solicitar Suporte - Carga {selectedCarga.id}</DialogTitle>
          <DialogDescription>
            Selecione o problema que está enfrentando com esta carga:
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {problemosComuns.map((problema, index) => (
            <Button 
              key={index} 
              variant="outline" 
              className="justify-start text-left px-4 py-3 h-auto"
              onClick={() => handleSupportRequest(problema.title, problema.description)}
            >
              <div>
                <div className="font-bold">{problema.title}</div>
                <div className="text-sm text-gray-500">{problema.description}</div>
              </div>
            </Button>
          ))}
          <Button 
            variant="outline" 
            className="justify-start text-left px-4 py-3 h-auto"
            onClick={() => handleWhatsAppSupport({
              id: selectedCarga.id,
              destino: selectedCarga.destino
            })}
          >
            <div>
              <div className="font-bold">Outro Problema</div>
              <div className="text-sm text-gray-500">Problemas não listados acima</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CargasSupportDialog;
