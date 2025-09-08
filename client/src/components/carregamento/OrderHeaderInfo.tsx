
import React from 'react';
import { OrdemCarregamento } from './types/order.types';
import { User, Clock } from 'lucide-react';

interface OrderHeaderInfoProps {
  ordem: OrdemCarregamento;
}

const OrderHeaderInfo: React.FC<OrderHeaderInfoProps> = ({ ordem }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mt-2 text-sm text-gray-600">
      <div className="flex items-center">
        <User className="mr-2" size={16} />
        <span className="mr-1">Conferente:</span>
        <strong>{ordem.conferenteResponsavel || 'Não atribuído'}</strong>
      </div>
      
      <div className="flex items-center">
        <Clock className="mr-2" size={16} />
        <div>
          {ordem.inicioConferencia ? (
            <>
              <span className="mr-1">Início:</span>
              <strong>{ordem.inicioConferencia}</strong>
              {ordem.fimConferencia && (
                <>
                  <span className="mx-2">•</span>
                  <span className="mr-1">Fim:</span>
                  <strong>{ordem.fimConferencia}</strong>
                </>
              )}
            </>
          ) : (
            <span>Conferência não iniciada</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHeaderInfo;
