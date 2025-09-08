
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { SolicitacaoColeta } from '../types/coleta.types';
import SolicitacaoProgress from './solicitacao/SolicitacaoProgress';
import { SolicitacaoFormHeader } from './solicitacao/formHeader';
import NotasFiscaisStep from './solicitacao/NotasFiscaisStep';
import ConfirmationStep from './solicitacao/ConfirmationStep';
import SolicitacaoFooter from './solicitacao/SolicitacaoFooter';

interface EditSolicitacaoDialogProps {
  solicitacao: SolicitacaoColeta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (solicitacao: SolicitacaoColeta) => void;
}

const EditSolicitacaoDialog: React.FC<EditSolicitacaoDialogProps> = ({ 
  solicitacao, 
  open, 
  onOpenChange,
  onSave
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update formData when the solicitacao changes
  useEffect(() => {
    if (solicitacao) {
      // Transform the solicitacao to match the format expected by the form components
      setFormData({
        tipoFrete: solicitacao.cliente ? 'FOB' : 'CIF', // Default or use actual value if available
        dataColeta: solicitacao.dataColeta || solicitacao.data || '',
        horaColeta: '',
        observacoes: solicitacao.observacoes || '',
        notasFiscais: [], // Would need to transform existing notes
        remetente: {
          razaoSocial: solicitacao.remetente?.razaoSocial || solicitacao.origem || '',
          cnpj: solicitacao.remetente?.cnpj || '',
          endereco: solicitacao.remetente?.endereco?.logradouro || '',
          numero: solicitacao.remetente?.endereco?.numero || '',
          bairro: solicitacao.remetente?.endereco?.bairro || '',
          cidade: solicitacao.remetente?.endereco?.cidade || '',
          uf: solicitacao.remetente?.endereco?.uf || '',
          cep: solicitacao.remetente?.endereco?.cep || '',
        },
        destinatario: {
          razaoSocial: solicitacao.destinatario?.razaoSocial || solicitacao.destino || '',
          cnpj: solicitacao.destinatario?.cnpj || '',
          endereco: solicitacao.destinatario?.endereco?.logradouro || '',
          numero: solicitacao.destinatario?.endereco?.numero || '',
          bairro: solicitacao.destinatario?.endereco?.bairro || '',
          cidade: solicitacao.destinatario?.endereco?.cidade || '',
          uf: solicitacao.destinatario?.endereco?.uf || '',
          cep: solicitacao.destinatario?.endereco?.cep || '',
        },
        origem: solicitacao.origem || '',
        destino: solicitacao.destino || '',
        // Include any approval or inclusion dates if available
        dataAprovacao: 'dataAprovacao' in solicitacao ? solicitacao.dataAprovacao : '',
        horaAprovacao: '',
        dataInclusao: solicitacao.dataSolicitacao || '',
        horaInclusao: '',
        // Add notas fiscais as empty array for now
        // In a real implementation, we would convert solicitacao.notas to the format expected by NotasFiscaisStep
      });
    }
  }, [solicitacao]);

  if (!formData) return null;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    setCurrentStep(curr => Math.min(curr + 1, 2));
  };

  const prevStep = () => {
    setCurrentStep(curr => Math.max(curr - 1, 1));
  };

  const handleSubmit = () => {
    setIsLoading(true);
    try {
      // Convert formData back to SolicitacaoColeta format
      const updatedSolicitacao = {
        ...solicitacao,
        cliente: formData.cliente,
        data: formData.dataColeta,
        origem: formData.origem || formData.remetente?.razaoSocial,
        destino: formData.destino || formData.destinatario?.razaoSocial,
        observacoes: formData.observacoes,
        // Would need to handle notes conversion here
      };
      
      onSave(updatedSolicitacao as SolicitacaoColeta);
      
      toast({
        title: "Solicitação atualizada",
        description: `Solicitação ${updatedSolicitacao.id} foi atualizada com sucesso.`
      });
      
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Editar Solicitação de Coleta - {solicitacao?.id}</DialogTitle>
        </DialogHeader>
        
        <SolicitacaoProgress currentStep={currentStep} onNext={nextStep} onPrev={prevStep} />
        
        <SolicitacaoFormHeader 
          currentStep={currentStep}
          isLoading={isLoading}
          tipoFrete={formData.tipoFrete}
          dataColeta={formData.dataColeta}
          horaColeta={formData.horaColeta || ''}
          dataAprovacao={formData.dataAprovacao || ''}
          horaAprovacao={formData.horaAprovacao || ''}
          dataInclusao={formData.dataInclusao || ''}
          horaInclusao={formData.horaInclusao || ''}
          onTipoFreteChange={(value) => handleInputChange('tipoFrete', value)}
          onDataColetaChange={(value) => handleInputChange('dataColeta', value)}
          onHoraColetaChange={(value) => handleInputChange('horaColeta', value || '')}
        />
        
        <div>
          {currentStep === 1 && (
            <NotasFiscaisStep 
              formData={formData}
              handleInputChange={handleInputChange}
              handleImportSuccess={() => {}}
              isImporting={false}
            />
          )}
          
          {currentStep === 2 && (
            <ConfirmationStep 
              formData={formData}
              handleInputChange={handleInputChange}
            />
          )}
        </div>
        
        <SolicitacaoFooter 
          currentStep={currentStep}
          onPrev={prevStep}
          onNext={nextStep}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditSolicitacaoDialog;
