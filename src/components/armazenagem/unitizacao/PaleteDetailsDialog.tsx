
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package } from 'lucide-react';
import { PaleteUnitizado } from '@/hooks/useCancelarUnitizacao';

interface PaleteDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  palete: PaleteUnitizado | null;
}

const PaleteDetailsDialog: React.FC<PaleteDetailsDialogProps> = ({
  open,
  onOpenChange,
  palete,
}) => {
  if (!palete) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package size={18} className="text-cross-blue" />
            Detalhes do Palete {palete.id}
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas sobre a unitização deste palete.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">ID do Palete</p>
              <p className="font-medium">{palete.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Data de Unitização</p>
              <p>{palete.dataUnitizacao}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Quantidade de Volumes</p>
              <p>{palete.volumes}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Responsável</p>
              <p>{palete.responsavel}</p>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Volumes no Palete</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Quantidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {palete.itens ? (
                  palete.itens.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.codigo}</TableCell>
                      <TableCell>{item.descricao}</TableCell>
                      <TableCell className="text-right">{item.quantidade}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      Nenhum item disponível
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaleteDetailsDialog;
