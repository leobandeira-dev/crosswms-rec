
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';
import { SolicitacaoFooterProps } from './SolicitacaoTypes';

const SolicitacaoFooter: React.FC<SolicitacaoFooterProps> = ({
  currentStep,
  onPrev,
  onNext,
  onSubmit,
  isLoading = false
}) => {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === 2;
  
  return (
    <div className="flex justify-between mt-6">
      <Button 
        variant="outline" 
        onClick={onPrev}
        disabled={isFirstStep || isLoading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>
      
      <div className="flex gap-2">
        {!isLastStep ? (
          <Button 
            onClick={onNext}
            disabled={isLoading}
          >
            Avançar <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={onSubmit}
            disabled={isLoading}
            className="bg-cross-blue hover:bg-cross-blueDark"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Finalizar
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SolicitacaoFooter;
