
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/common/StatusBadge";

interface UserDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any | null;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ open, onOpenChange, user }) => {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
          <DialogDescription>
            Informações completas do usuário selecionado
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Nome</p>
              <p>{user.nome}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p>{user.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Empresa</p>
              <p>{user.empresa}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">CNPJ</p>
              <p>{user.cnpj}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Perfil</p>
              <p>{user.perfil}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <StatusBadge 
                status={
                  user.status === 'ativo' ? 'success' : 
                  user.status === 'pendente' ? 'warning' : 'error'
                } 
                text={
                  user.status === 'ativo' ? 'Ativo' :
                  user.status === 'pendente' ? 'Pendente' : 'Inativo'
                } 
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsDialog;
