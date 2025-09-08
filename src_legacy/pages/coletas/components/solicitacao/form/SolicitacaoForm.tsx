
import React from 'react';
import { NotaFiscalVolume } from '../../../utils/volumes/types';
import NotasFiscaisStep from '../NotasFiscaisStep';
import ObservacoesStep from '../ObservacoesStep';
import SolicitacaoProgress from '../SolicitacaoProgress';
import SolicitacaoFooter from '../SolicitacaoFooter';
import { InternalFormData } from '../hooks/solicitacaoFormTypes';

interface SolicitacaoFormProps {
  formData: InternalFormData;
  handleInputChange: <K extends keyof InternalFormData>(field: K, value: InternalFormData[K]) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  handleImportSuccess: (notasFiscais: NotaFiscalVolume[], remetenteInfo?: any, destinatarioInfo?: any) => void;
}

const SolicitacaoForm: React.FC<SolicitacaoFormProps> = ({
  formData,
  handleInputChange,
  activeTab,
  setActiveTab,
  isLoading,
  currentStep,
  onNext,
  onPrev,
  onSubmit,
  handleImportSuccess
}) => {
  return (
    <div className="grid gap-6 py-4">
      <SolicitacaoProgress 
        currentStep={currentStep}
        onNext={onNext}
        onPrev={onPrev}
      />
      
      {currentStep === 1 ? (
        <NotasFiscaisStep
          formData={formData}
          handleInputChange={handleInputChange}
          handleImportSuccess={handleImportSuccess}
          isImporting={isLoading}
        />
      ) : (
        <ObservacoesStep 
          formData={formData}
          handleInputChange={handleInputChange}
        />
      )}
      
      <SolicitacaoFooter
        currentStep={currentStep}
        onNext={onNext}
        onPrev={onPrev}
        onSubmit={onSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default SolicitacaoForm;
