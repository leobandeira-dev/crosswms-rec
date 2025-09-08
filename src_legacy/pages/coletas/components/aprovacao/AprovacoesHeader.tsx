
import React from 'react';

interface AprovacoesHeaderProps {
  pendingCount?: number;
}

const AprovacoesHeader: React.FC<AprovacoesHeaderProps> = ({ pendingCount }) => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h2 className="text-xl font-heading">Gestão de Aprovações</h2>
        <p className="text-gray-500">
          {pendingCount ? `${pendingCount} solicitações aguardando aprovação` : 'Aprove ou recuse solicitações de coleta pendentes'}
        </p>
      </div>
    </div>
  );
};

export default AprovacoesHeader;
