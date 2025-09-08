
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SolicitacaoColeta } from '../types/coleta.types';
import SolicitacaoViewer from './solicitacao/SolicitacaoViewer';
import AprovacaoForm from './aprovacao/AprovacaoForm';
import { InternalFormData } from './solicitacao/hooks/solicitacaoFormTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DetalhesAprovacaoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  solicitacao: SolicitacaoColeta | null;
  onApprove: (id: string, observacoes?: string) => void;
  onReject: (id: string, motivoRecusa: string, observacoes: string) => void;
}

const mapSolicitacaoToFormData = (solicitacao: SolicitacaoColeta): InternalFormData => {
  return {
    remetente: {
      razaoSocial: solicitacao.remetente?.razaoSocial || '',
      cnpj: solicitacao.remetente?.cnpj || '',
      endereco: solicitacao.remetente?.endereco?.logradouro || '',
      numero: solicitacao.remetente?.endereco?.numero || '',
      bairro: solicitacao.remetente?.endereco?.bairro || '',
      cidade: solicitacao.remetente?.endereco?.cidade || '',
      uf: solicitacao.remetente?.endereco?.uf || '',
      cep: solicitacao.remetente?.endereco?.cep || ''
    },
    destinatario: {
      razaoSocial: solicitacao.destinatario?.razaoSocial || '',
      cnpj: solicitacao.destinatario?.cnpj || '',
      endereco: solicitacao.destinatario?.endereco?.logradouro || '',
      numero: solicitacao.destinatario?.endereco?.numero || '',
      bairro: solicitacao.destinatario?.endereco?.bairro || '',
      cidade: solicitacao.destinatario?.endereco?.cidade || '',
      uf: solicitacao.destinatario?.endereco?.uf || '',
      cep: solicitacao.destinatario?.endereco?.cep || ''
    },
    dataColeta: solicitacao.dataColeta || '',
    notasFiscais: solicitacao.notasFiscais || [],
    observacoes: solicitacao.observacoes || '',
    tipoFrete: solicitacao.cliente ? 'FOB' : 'CIF',
    origem: solicitacao.origem || '',
    destino: solicitacao.destino || '',
    origemEndereco: solicitacao.remetente?.endereco?.logradouro || '',
    origemCEP: solicitacao.remetente?.endereco?.cep || '',
    destinoEndereco: solicitacao.destinatario?.endereco?.logradouro || '',
    destinoCEP: solicitacao.destinatario?.endereco?.cep || '',
  };
};

const DetalhesAprovacaoDialog: React.FC<DetalhesAprovacaoDialogProps> = ({
  isOpen,
  onClose,
  solicitacao,
  onApprove,
  onReject
}) => {
  const [activeTab, setActiveTab] = useState('visualizar');
  
  if (!solicitacao) return null;
  
  const formData = mapSolicitacaoToFormData(solicitacao);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Solicitação de Coleta #{solicitacao.id}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visualizar">Visualizar Solicitação</TabsTrigger>
            <TabsTrigger value="aprovacao">Aprovação</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visualizar" className="pt-4">
            <SolicitacaoViewer 
              formData={formData} 
              readOnly={true}
              showActions={false}
            />
          </TabsContent>
          
          <TabsContent value="aprovacao" className="pt-4">
            <AprovacaoForm 
              solicitacaoId={solicitacao.id}
              onApprove={(id, observacoes) => {
                onApprove(id, observacoes);
                onClose();
              }}
              onReject={(id, motivoRecusa, observacoes) => {
                onReject(id, motivoRecusa, observacoes);
                onClose();
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DetalhesAprovacaoDialog;
