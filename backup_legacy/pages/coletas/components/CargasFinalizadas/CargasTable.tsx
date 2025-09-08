
import React from 'react';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import ActionButtons from './ActionButtons';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { problemosComuns, handleWhatsAppSupport } from '../../../motoristas/utils/supportHelpers';
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
  const [selectedCarga, setSelectedCarga] = React.useState<any>(null);
  const [openSupportDialog, setOpenSupportDialog] = React.useState(false);

  const handleSupportRequest = (problem: string, description: string) => {
    if (!selectedCarga) return;
    
    const localInfo = separarCidadeEstado(selectedCarga.destino);
    const cidade = localInfo?.cidade || '';
    const estado = localInfo?.estado || '';
    
    const cargaInfo = {
      id: selectedCarga.id,
      destino: `${cidade} - ${estado}`,
      motorista: selectedCarga.motorista || 'Não alocado',
      veiculo: selectedCarga.veiculo || 'Não alocado',
    };
    
    const messageWithProblem = `${problem} - ${description} - `;
    
    handleWhatsAppSupport({
      ...cargaInfo,
      id: `${cargaInfo.id} - PROBLEMA: ${messageWithProblem}`
    });
    
    setOpenSupportDialog(false);
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
          { header: 'Data Entrega', accessor: 'dataEntrega', cell: (row) => row.dataEntrega || row.dataPrevisao },
          { header: 'Volumes', accessor: 'volumes' },
          { header: 'Peso', accessor: 'peso' },
          { 
            header: 'Status', 
            accessor: 'status',
            cell: (row) => {
              const statusMap: any = {
                'delivered': { type: 'success', text: 'Entregue' },
                'problem': { type: 'error', text: 'Problema' }
              };
              const status = statusMap[row.status] || { type: 'default', text: 'Finalizado' };
              return <StatusBadge status={status.type} text={status.text} />;
            }
          },
          { 
            header: 'Ações', 
            accessor: 'actions',
            className: "text-right w-[180px]",
            cell: (row) => (
              <ActionButtons 
                carga={row}
                setSelectedCarga={(carga) => {
                  setSelectedCarga(carga);
                  setOpenSupportDialog(true);
                }}
              />
            )
          }
        ]}
        data={cargas}
        pagination={pagination}
        onRowClick={(row) => console.log('Row clicked:', row)}
      />

      {selectedCarga && (
        <Dialog open={openSupportDialog} onOpenChange={setOpenSupportDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Solicitar Suporte - Carga {selectedCarga.id}</DialogTitle>
              <DialogDescription>
                Selecione o problema que está enfrentando com esta carga:
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {problemosComuns.map((problema, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  className="justify-start text-left px-4 py-3 h-auto"
                  onClick={() => handleSupportRequest(problema.title, problema.description)}
                >
                  <div>
                    <div className="font-bold">{problema.title}</div>
                    <div className="text-sm text-gray-500">{problema.description}</div>
                  </div>
                </Button>
              ))}
              <Button 
                variant="outline" 
                className="justify-start text-left px-4 py-3 h-auto"
                onClick={() => {
                  const localInfo = separarCidadeEstado(selectedCarga.destino);
                  const cidade = localInfo?.cidade || '';
                  const estado = localInfo?.estado || '';
                  
                  handleWhatsAppSupport({
                    id: selectedCarga.id,
                    destino: `${cidade} - ${estado}`,
                    motorista: selectedCarga.motorista,
                    veiculo: selectedCarga.veiculo
                  });
                }}
              >
                <div>
                  <div className="font-bold">Outro Problema</div>
                  <div className="text-sm text-gray-500">Problemas não listados acima</div>
                </div>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default CargasTable;
