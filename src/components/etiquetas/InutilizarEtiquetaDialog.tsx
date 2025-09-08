
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

interface InutilizarEtiquetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  etiqueta: any | null;
  onConfirm: (motivo: string) => void;
  isLoading?: boolean;
}

const InutilizarEtiquetaDialog: React.FC<InutilizarEtiquetaDialogProps> = ({
  open,
  onOpenChange,
  etiqueta,
  onConfirm,
  isLoading = false
}) => {
  const [motivo, setMotivo] = useState('');

  const handleConfirm = () => {
    if (motivo.trim()) {
      onConfirm(motivo.trim());
      setMotivo('');
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setMotivo('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Inutilizar Etiqueta
          </DialogTitle>
          <DialogDescription>
            Você está prestes a inutilizar a etiqueta <strong>{etiqueta?.codigo || etiqueta?.id}</strong>.
            Esta ação não pode ser desfeita. Por favor, informe o motivo da inutilização.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="motivo">Motivo da inutilização *</Label>
            <Textarea
              id="motivo"
              placeholder="Descreva o motivo da inutilização desta etiqueta..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              required
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={!motivo.trim() || isLoading}
          >
            {isLoading ? 'Inutilizando...' : 'Inutilizar Etiqueta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InutilizarEtiquetaDialog;
