import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Check } from 'lucide-react';

interface PacoteModulosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pacote: any;
}

export const PacoteModulosDialogFixed = ({ open, onOpenChange, pacote }: PacoteModulosDialogProps) => {
  if (!pacote) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Módulos e Funcionalidades do Pacote: {pacote.nome}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Este pacote inclui os seguintes módulos e funcionalidades:
          </p>
          
          {/* Módulos do pacote */}
          <div className="space-y-3">
            <h3 className="font-semibold">Módulos Inclusos:</h3>
            {pacote.modulos_inclusos && pacote.modulos_inclusos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {pacote.modulos_inclusos.map((modulo: string, index: number) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    <span className="capitalize">{modulo}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum módulo específico configurado</p>
            )}
          </div>

          {/* Funcionalidades do pacote */}
          <div className="space-y-3">
            <h3 className="font-semibold">Funcionalidades:</h3>
            {pacote.funcionalidades && pacote.funcionalidades.length > 0 ? (
              <div className="grid grid-cols-1 gap-2">
                {pacote.funcionalidades.map((func: string, index: number) => (
                  <div key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-600 mr-2" />
                    <span>{func}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma funcionalidade específica configurada</p>
            )}
          </div>

          {/* Informações de preço e limites */}
          <div className="space-y-3 border-t pt-4">
            <h3 className="font-semibold">Detalhes do Pacote:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Preço Mensal:</strong> R$ {pacote.preco_mensal || '0,00'}</p>
                <p><strong>Preço Anual:</strong> R$ {pacote.preco_anual || '0,00'}</p>
              </div>
              <div>
                <p><strong>Limite Usuários:</strong> {pacote.limite_usuarios || 'Ilimitado'}</p>
                <p><strong>Limite Filiais:</strong> {pacote.limite_filiais || 'Ilimitado'}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};