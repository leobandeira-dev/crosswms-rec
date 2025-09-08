
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { CheckCircle, X } from 'lucide-react';

export interface AprovacaoActionsProps {
  isRejecting: boolean;
  setIsRejecting: (value: boolean) => void;
  onClose: () => void;
  handleApproveClick: () => void;
}

export const AprovacaoActions: React.FC<AprovacaoActionsProps> = ({
  isRejecting,
  setIsRejecting,
  onClose,
  handleApproveClick
}) => {
  return (
    <DialogFooter className="mt-4">
      <Button variant="outline" type="button" onClick={onClose}>Fechar</Button>
      {!isRejecting && (
        <>
          <Button 
            variant="destructive" 
            type="button" 
            onClick={() => {
              setIsRejecting(true);
              (window as any).isRejecting = true;
            }}
          >
            <X className="mr-2 h-4 w-4" /> Recusar
          </Button>
          <Button 
            type="button" 
            className="bg-green-600 hover:bg-green-700"
            onClick={handleApproveClick}
          >
            <CheckCircle className="mr-2 h-4 w-4" /> Aprovar
          </Button>
        </>
      )}
      {isRejecting && (
        <Button 
          type="submit" 
          className="bg-destructive hover:bg-destructive/90"
        >
          <X className="mr-2 h-4 w-4" /> Confirmar Recusa
        </Button>
      )}
    </DialogFooter>
  );
};
