
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { handleWhatsAppSupport, problemosComuns } from '../../../motoristas/utils/supportHelpers';

interface SupportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  cargaInfo: {
    id: string;
    destino: string;
    motorista?: string;
    veiculo?: string;
  };
}

const SupportDialog: React.FC<SupportDialogProps> = ({
  isOpen,
  onOpenChange,
  cargaInfo
}) => {
  const handleSupportRequest = (problem: string, description: string) => {
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
          <DialogTitle>Solicitar Suporte - Carga {cargaInfo.id}</DialogTitle>
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
              id: cargaInfo.id,
              destino: cargaInfo.destino,
              motorista: cargaInfo.motorista,
              veiculo: cargaInfo.veiculo
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

export default SupportDialog;
