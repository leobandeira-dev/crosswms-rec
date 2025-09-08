
import React from 'react';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Check, Truck } from 'lucide-react';

interface ColetaTableProps {
  data: any[];
  filter: string;
  onAcceptColeta: (coletaId: string) => void;
}

const ColetaTable: React.FC<ColetaTableProps> = ({ 
  data, 
  filter, 
  onAcceptColeta 
}) => {
  // Filter data based on the selected tab
  const filteredData = data.filter(r => {
    if (filter === 'pendentes') {
      return r.status !== 'completed';
    } else {
      return r.status === 'completed';
    }
  });

  return (
    <DataTable
      columns={[
        { header: 'ID', accessor: 'id' },
        { header: 'Cliente', accessor: 'cliente' },
        { header: 'Nº Coleta', accessor: 'numColeta' },
        { header: 'Data', accessor: 'data' },
        { 
          header: 'Status', 
          accessor: 'status',
          cell: (row) => {
            const statusMap: any = {
              'pending': { type: 'warning', text: 'Pendente de Aceite' },
              'processing': { type: 'info', text: 'Em Processamento' },
              'completed': { type: 'success', text: 'Concluído' },
            };
            const status = statusMap[row.status];
            return <StatusBadge status={status.type} text={status.text} />;
          }
        },
        {
          header: 'Ações',
          accessor: 'actions',
          cell: (row) => (
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Detalhes</Button>
              
              {row.status === 'pending' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-green-600 border-green-600 hover:bg-green-50"
                  onClick={() => onAcceptColeta(row.id)}
                >
                  <Check className="h-4 w-4 mr-1" /> Aceitar
                </Button>
              )}
              
              {row.status === 'processing' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-cross-blue text-white hover:bg-cross-blue/90"
                >
                  <Truck className="h-4 w-4 mr-1" /> Receber
                </Button>
              )}
            </div>
          )
        }
      ]}
      data={filteredData}
    />
  );
};

export default ColetaTable;
