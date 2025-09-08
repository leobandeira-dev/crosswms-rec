
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { PaleteUnitizado } from '@/hooks/useCancelarUnitizacao';

interface CancelarUnitizacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  palete: PaleteUnitizado | null;
  onConfirm: () => void;
}

const CancelarUnitizacaoDialog: React.FC<CancelarUnitizacaoDialogProps> = ({
  open,
  onOpenChange,
  palete,
  onConfirm
}) => {
  if (!palete) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Cancelar Unitização
          </DialogTitle>
          <DialogDescription>
            Você está prestes a cancelar a unitização do palete {palete.id}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 my-4">
          <p className="text-amber-800 text-sm">
            <strong>Atenção:</strong> Esta ação não pode ser desfeita. Todos os {palete.volumes} volumes 
            associados a este palete serão desvinculados e voltarão a estar disponíveis 
            para nova unitização.
          </p>
        </div>
        
        <div className="space-y-2 mb-4">
          <p><strong>ID do Palete:</strong> {palete.id}</p>
          <p><strong>Volumes:</strong> {palete.volumes}</p>
          <p><strong>Produtos:</strong> {palete.produtos}</p>
          <p><strong>Responsável:</strong> {palete.responsavel}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
          >
            Confirmar Cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CancelarUnitizacaoDialog;
