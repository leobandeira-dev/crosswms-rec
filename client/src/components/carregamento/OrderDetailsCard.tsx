
import React from 'react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/common/StatusBadge';
import { OrdemCarregamento, NotaFiscal } from './types/order.types';
import { Truck } from 'lucide-react';

interface OrderDetailsCardProps {
  order: OrdemCarregamento;
  onImportInvoices?: (notas: NotaFiscal[]) => void;
  showImportButton?: boolean;
  loading?: boolean;
}

const OrderDetailsCard: React.FC<OrderDetailsCardProps> = ({ 
  order,
  onImportInvoices,
  showImportButton = false,
  loading = false
}) => {
  const handleImportInvoices = () => {
    if (!onImportInvoices) return;
    // Import functionality is handled by parent component
    onImportInvoices([]);
  };

  return (
    <div className="mt-4 border rounded-md p-4">
      <h3 className="font-medium mb-2">Detalhes da Ordem</h3>
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-gray-500">OC:</dt>
          <dd>{order.id}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Cliente:</dt>
          <dd>{order.cliente}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Destinatário:</dt>
          <dd>{order.destinatario}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Data:</dt>
          <dd>{order.dataCarregamento}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Volumes:</dt>
          <dd>{order.volumesVerificados} / {order.volumesTotal}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-gray-500">Status:</dt>
          <dd>
            <StatusBadge 
              status={
                order.status === 'pending' ? 'warning' : 
                order.status === 'processing' ? 'info' : 'success'
              } 
              text={
                order.status === 'pending' ? 'Pendente' : 
                order.status === 'processing' ? 'Em Conferência' : 'Concluído'
              } 
            />
          </dd>
        </div>
      </dl>
      
      {showImportButton && onImportInvoices && (
        <div className="mt-4">
          <Button 
            onClick={handleImportInvoices} 
            className="w-full"
            disabled={loading}
          >
            <Truck size={16} className="mr-2" />
            {loading ? "Importando..." : "Importar Notas Fiscais para Faturamento"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsCard;
