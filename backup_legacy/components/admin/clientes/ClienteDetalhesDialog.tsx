
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ClienteDetalhesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any | null;
};

export const ClienteDetalhesDialog = ({ open, onOpenChange, cliente }: ClienteDetalhesDialogProps) => {
  if (!cliente) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes do Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-sm">Razão Social</h3>
              <p>{cliente.razaoSocial}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm">Nome Fantasia</h3>
              <p>{cliente.nomeFantasia || '-'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm">CNPJ</h3>
              <p>{cliente.cnpj}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm">Status</h3>
              <p className={cliente.status === 'ativo' ? 'text-green-600' : 'text-gray-500'}>
                {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm">E-mail</h3>
              <p>{cliente.email}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm">Telefone</h3>
              <p>{cliente.telefone || '-'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm">Cidade/UF</h3>
              <p>{cliente.cidade || '-'}/{cliente.estado || '-'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm">Endereço</h3>
              <p>{cliente.endereco || '-'}</p>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm">Data de Cadastro</h3>
              <p>01/01/2023</p> {/* Mock date - would come from cliente data */}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
