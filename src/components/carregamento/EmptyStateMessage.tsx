
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface EmptyStateMessageProps {
  tipoVisualizacao: 'conferir' | 'emConferencia' | 'conferidas';
}

const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({ tipoVisualizacao }) => {
  let message = "Selecione uma ordem de carregamento para iniciar a conferência";
  
  if (tipoVisualizacao === 'emConferencia') {
    message = "Não há ordens em conferência no momento";
  } else if (tipoVisualizacao === 'conferidas') {
    message = "Não há ordens conferidas para exibir";
  }
  
  return (
    <div className="text-center py-8 text-gray-500">
      <CheckCircle size={40} className="mx-auto mb-4 opacity-30" />
      <p>{message}</p>
    </div>
  );
};

export default EmptyStateMessage;
