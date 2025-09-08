
import React from 'react';
import { SolicitacaoProgressProps } from './SolicitacaoTypes';

const SolicitacaoProgress: React.FC<SolicitacaoProgressProps> = ({ 
  currentStep,
  onNext,
  onPrev
}) => {
  const steps = [
    { id: 1, name: 'Notas Fiscais e Volumes' },
    { id: 2, name: 'Observações e Resumo' },
  ];
  
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step, i) => (
          <React.Fragment key={step.id}>
            {/* Step */}
            <div
              className={`flex items-center ${i === 0 ? 'justify-start' : i === steps.length - 1 ? 'justify-end' : 'justify-center'} flex-1`}
            >
              <div
                onClick={() => step.id < currentStep && onPrev ? onPrev() : step.id > currentStep && onNext ? onNext() : null}
                className={`h-8 w-8 rounded-full flex items-center justify-center border ${
                  step.id === currentStep
                    ? 'bg-cross-blue text-white border-cross-blue'
                    : step.id < currentStep
                    ? 'bg-green-100 text-green-800 border-green-300 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 border-gray-300'
                }`}
              >
                {step.id < currentStep ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
            </div>
            
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="flex-1">
                <div
                  className={`h-1 ${
                    step.id < currentStep ? 'bg-green-300' : 'bg-gray-300'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      <div className="flex items-center justify-between px-1">
        {steps.map((step, i) => (
          <div
            key={`label-${step.id}`}
            className={`text-xs ${
              i === 0 ? 'text-left' : i === steps.length - 1 ? 'text-right' : 'text-center'
            } ${
              step.id === currentStep
                ? 'text-cross-blue font-medium'
                : step.id < currentStep
                ? 'text-green-800'
                : 'text-gray-500'
            } ${i === 0 ? 'w-1/4' : i === steps.length - 1 ? 'w-1/4' : ''}`}
          >
            {step.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SolicitacaoProgress;
