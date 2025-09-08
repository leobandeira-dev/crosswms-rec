
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Carga } from '../../types/coleta.types';

interface ModalFooterProps {
  rotaOtimizada: Carga[];
  onClose: () => void;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ rotaOtimizada, onClose }) => {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>Fechar</Button>
      <Button
        disabled={rotaOtimizada.length === 0}
        onClick={() => {
          // Aqui salvaria a rota otimizada
          toast({
            title: "Rota salva com sucesso!",
            description: "A ordem das coletas foi salva e pode ser visualizada no mapa.",
          });
          onClose();
        }}
      >
        Salvar Rota
      </Button>
    </DialogFooter>
  );
};

export default ModalFooter;
