
import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import DataTable from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import PrintLayoutModal from './PrintLayoutModal';

const HistoricoLayout: React.FC = () => {
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const layoutRef = useRef<HTMLDivElement>(null);
  
  const handlePrintClick = (orderId: string) => {
    setSelectedOrder(orderId);
    setPrintModalOpen(true);
  };

  return (
    <>
      <Card>
        <DataTable
          columns={[
            { header: 'OC', accessor: 'id' },
            { header: 'Data', accessor: 'data' },
            { header: 'Veículo', accessor: 'veiculo' },
            { header: 'Volumes', accessor: 'volumes' },
            { header: 'Responsável', accessor: 'responsavel' },
            {
              header: 'Ações',
              accessor: 'actions',
              cell: (row) => (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePrintClick(row.id)}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              )
            }
          ]}
          data={[
            { id: 'OC-2023-001', data: '10/05/2023', veiculo: 'Caminhão Truck', volumes: 25, responsavel: 'João Silva' },
            { id: 'OC-2023-002', data: '11/05/2023', veiculo: 'Van', volumes: 12, responsavel: 'Maria Oliveira' },
            { id: 'OC-2023-003', data: '12/05/2023', veiculo: 'Carreta', volumes: 48, responsavel: 'Carlos Santos' },
          ]}
        />
      </Card>
      
      {/* Div oculto que servirá como template para impressão do histórico */}
      <div className="hidden">
        <div ref={layoutRef} className="p-4 bg-white">
          <h2 className="text-xl font-bold mb-4">Layout de Carregamento - {selectedOrder}</h2>
          {/* Aqui seria renderizado o layout histórico real quando implementado */}
          <div className="border p-4">
            <p>Layout do carregamento para a ordem {selectedOrder}</p>
          </div>
        </div>
      </div>
      
      <PrintLayoutModal
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
        orderNumber={selectedOrder}
        layoutRef={layoutRef}
      />
    </>
  );
};

export default HistoricoLayout;
