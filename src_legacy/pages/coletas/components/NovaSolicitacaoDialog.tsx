
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { NotaFiscalVolume } from '../utils/volumes/types';
import { NovaSolicitacaoDialogProps } from './solicitacao/SolicitacaoTypes';
import SolicitacaoForm from './solicitacao/form';
import { useSolicitacaoForm } from './solicitacao/useSolicitacaoForm';

const NovaSolicitacaoDialog: React.FC<NovaSolicitacaoDialogProps> = ({ 
  isOpen, 
  setIsOpen,
  activeTab,
  setActiveTab
}) => {
  const { 
    isLoading, 
    isImporting,
    currentStep,
    formData, 
    handleInputChange,
    nextStep,
    prevStep,
    handleSubmit,
    handleImportSuccess
  } = useSolicitacaoForm(setIsOpen);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-cross-blue hover:bg-cross-blueDark">
          <Plus className="mr-2 h-4 w-4" /> Nova Solicitação
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Coleta</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para criar uma nova solicitação de coleta.
          </DialogDescription>
        </DialogHeader>
        
        <SolicitacaoForm
          formData={formData}
          handleInputChange={handleInputChange}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isLoading={isLoading || isImporting}
          currentStep={currentStep}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={handleSubmit}
          handleImportSuccess={handleImportSuccess}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>Cancelar</Button>
          <Button 
            className="bg-cross-blue hover:bg-cross-blueDark"
            onClick={handleSubmit}
            disabled={isLoading || isImporting}
          >
            {isLoading || isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
              </>
            ) : (
              'Solicitar Coleta'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NovaSolicitacaoDialog;
