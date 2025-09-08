
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Carga } from '../../types/coleta.types';

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

  const handleWhatsAppSupport = (problem: string = '') => {
    // Número fictício para suporte via WhatsApp
    const phoneNumber = "5511912345678";
    const message = `Preciso de suporte com a carga ${selectedCarga.id} com destino a ${selectedCarga.destino}${problem ? ` - Problema: ${problem}` : ''}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    onOpenChange(false);
  };

  const problemosComuns = [
    {
      title: "Erro de Endereçamento",
      description: "Endereço de destino incorreto ou incompleto"
    },
    {
      title: "Problema na Documentação",
      description: "Documentos com inconsistências ou faltantes"
    },
    {
      title: "Questão de Transporte",
      description: "Problemas com veículo ou motorista"
    },
    {
      title: "Verificação de Peso/Volume",
      description: "Divergência nas informações de carga"
    }
  ];

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
              onClick={() => handleWhatsAppSupport(`${problema.title} - ${problema.description}`)}
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
            onClick={() => handleWhatsAppSupport()}
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
