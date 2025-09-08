
import React from 'react';
import { FileText } from 'lucide-react';

interface EmptyNotasFiscaisProps {
  withIcon?: boolean;
}

const EmptyNotasFiscais: React.FC<EmptyNotasFiscaisProps> = ({ withIcon = false }) => {
  return (
    <div className="text-gray-500 text-center py-4">
      {withIcon && (
        <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
      )}
      Nenhuma nota fiscal cadastrada. Clique em "Adicionar Nota Fiscal" para começar.
    </div>
  );
};

export default EmptyNotasFiscais;
