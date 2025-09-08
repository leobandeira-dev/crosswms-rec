
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Carga } from '../../types/coleta.types';
import SolicitacaoViewer from '../solicitacao/SolicitacaoViewer';
import { InternalFormData } from '../solicitacao/hooks/solicitacaoFormTypes';
import { Button } from '@/components/ui/button';

interface CargaDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  carga: Carga | null;
  onAlocar?: (carga: Carga) => void;
}

// Convert Carga to InternalFormData format for the SolicitacaoViewer
const mapCargaToFormData = (carga: Carga): InternalFormData => {
  // Extract city and state from destination
  const destinoParts = (carga.destino || '').split(' - ');
  const cidade = destinoParts[0] || '';
  const uf = destinoParts.length > 1 ? destinoParts[1] : '';
  
  return {
    remetente: {
      razaoSocial: carga.origem?.split(' - ')[0] || '',
      cnpj: '',
      endereco: carga.origem || '',
      numero: '',
      bairro: '',
      cidade: carga.origem?.split(' - ')[0] || '',
      uf: '',
      cep: ''
    },
    destinatario: {
      razaoSocial: cidade,
      cnpj: '',
      endereco: carga.destino || '',
      numero: '',
      bairro: '',
      cidade: cidade,
      uf: uf,
      cep: carga.cep || ''
    },
    dataColeta: carga.dataPrevisao || '',
    observacoes: carga.observacoes || '',
    notasFiscais: [],
    tipoFrete: 'CIF', // Assuming default
    origem: carga.origem || '',
    destino: carga.destino || '',
    origemEndereco: carga.origem || '',
    destinoEndereco: carga.destino || '',
    destinoCEP: carga.cep || '',
  };
};

const CargaDetailDialog: React.FC<CargaDetailDialogProps> = ({
  isOpen,
  onClose,
  carga,
  onAlocar
}) => {
  if (!carga) return null;
  
  const formData = mapCargaToFormData(carga);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Carga: {carga.id}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <SolicitacaoViewer 
            formData={formData} 
            readOnly={true}
            showActions={false}
          />
          
          {onAlocar && (
            <div className="flex justify-end mt-6">
              <Button 
                onClick={() => {
                  onAlocar(carga);
                  onClose();
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Alocar Motorista
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CargaDetailDialog;
