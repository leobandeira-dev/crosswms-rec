
import React, { useState } from 'react';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import ActionButtons from './ActionButtons';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from "sonner";
import { separarCidadeEstado } from '@/utils/estadoUtils';

interface CargasTableProps {
  cargas: any[];
  pagination: {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
  };
}

const CargasTable: React.FC<CargasTableProps> = ({ cargas, pagination }) => {
  const [selectedCarga, setSelectedCarga] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleDesalocar = (cargaId: string, motorista: string) => {
    toast.success(`Carga ${cargaId} desalocada do motorista ${motorista}`);
    console.log("Desalocando carga:", cargaId, "do motorista:", motorista);
    // Implementação real aqui
  };
  
  const handleFinalizar = (cargaId: string, status: 'delivered' | 'problem') => {
    toast.success(`Carga ${cargaId} finalizada com status: ${status}`);
    console.log("Finalizando carga:", cargaId, "com status:", status);
    // Implementação real aqui
  };

  return (
    <>
      <DataTable
        columns={[
          { header: 'ID', accessor: 'id' },
          { 
            header: 'Cidade', 
            accessor: 'cidade',
            cell: (row) => {
              const localInfo = separarCidadeEstado(row.destino);
              return localInfo?.cidade || '';
            }
          },
          {
            header: 'UF',
            accessor: 'uf',
            cell: (row) => {
              const localInfo = separarCidadeEstado(row.destino);
              return localInfo?.estado || '';
            }
          },
          { header: 'Motorista', accessor: 'motorista' },
          { header: 'Veículo', accessor: 'veiculo' },
          { header: 'Data Previsão', accessor: 'dataPrevisao' },
          { header: 'Volumes', accessor: 'volumes' },
          { header: 'Peso', accessor: 'peso' },
          { 
            header: 'Status', 
            accessor: 'status',
            cell: (row) => {
              const statusMap: any = {
                'transit': { type: 'warning', text: 'Em Trânsito' },
                'loading': { type: 'info', text: 'Em Carregamento' },
                'scheduled': { type: 'default', text: 'Agendada' }
              };
              const status = statusMap[row.status] || { type: 'default', text: 'Em Andamento' };
              return <StatusBadge status={status.type} text={status.text} />;
            }
          },
          { 
            header: 'Ações', 
            accessor: 'actions',
            className: "text-right w-[100px]",
            cell: (row) => (
              <ActionButtons 
                carga={row} 
                onDesalocar={handleDesalocar}
                onFinalizar={handleFinalizar}
                setSelectedCarga={(carga) => {
                  setSelectedCarga(carga);
                  setDialogOpen(true);
                }}
              />
            )
          }
        ]}
        data={cargas}
        pagination={pagination}
        onRowClick={(row) => console.log('Row clicked:', row)}
      />
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          {selectedCarga && (
            <div className="p-4">
              <h3 className="text-lg font-bold mb-4">Suporte para Carga #{selectedCarga.id}</h3>
              <p>Esta funcionalidade será implementada em breve.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CargasTable;
