
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

interface VolumeExistsConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  notaFiscal: string;
  existingVolumesCount: number;
}

const VolumeExistsConfirmDialog: React.FC<VolumeExistsConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  notaFiscal,
  existingVolumesCount
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Volumes já cadastrados
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>
              A nota fiscal <strong>{notaFiscal}</strong> já possui{' '}
              <strong>{existingVolumesCount}</strong> volume(s) cadastrado(s) no sistema.
            </p>
            <p>
              Deseja prosseguir com a impressão das etiquetas mesmo assim?
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="mt-2 sm:mt-0"
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Prosseguir com impressão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VolumeExistsConfirmDialog;
