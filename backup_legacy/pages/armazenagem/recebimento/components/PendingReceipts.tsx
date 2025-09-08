
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SearchFilter, { FilterConfig } from '@/components/common/SearchFilter';
import StatusBadge from '@/components/common/StatusBadge';
import DataTable from '@/components/common/DataTable';

// Mock data
const recebimentosPendentes = [
  { id: 'REC-2023-001', tipo: 'Fornecedor', origem: 'Fornecedor ABC', data: '15/05/2023', status: 'pending' },
  { id: 'REC-2023-002', tipo: 'Coleta', origem: 'Cliente XYZ', data: '14/05/2023', status: 'processing' },
  { id: 'REC-2023-003', tipo: 'Filial', origem: 'Filial Rio de Janeiro', data: '14/05/2023', status: 'pending' },
  { id: 'REC-2023-004', tipo: 'Fornecedor', origem: 'Fornecedor DEF', data: '13/05/2023', status: 'completed' },
];

const PendingReceipts: React.FC = () => {
  // Updated filters to match the new interface
  const filters: FilterConfig[] = [
    {
      id: "tipo",
      label: "Tipo",
      options: [
        { id: "fornecedor", label: "Fornecedor" },
        { id: "coleta", label: "Coleta" },
        { id: "filial", label: "Filial" }
      ]
    },
    {
      id: "status",
      label: "Status",
      options: [
        { id: "pending", label: "Pendente" },
        { id: "processing", label: "Em Processamento" },
        { id: "completed", label: "Concluído" }
      ]
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recebimentos Pendentes</CardTitle>
      </CardHeader>
      <CardContent>
        <SearchFilter 
          placeholder="Buscar recebimentos..." 
          filters={filters}
        />
        
        <DataTable
          columns={[
            { header: 'ID', accessor: 'id' },
            { header: 'Tipo', accessor: 'tipo' },
            { header: 'Origem', accessor: 'origem' },
            { header: 'Data', accessor: 'data' },
            { 
              header: 'Status', 
              accessor: 'status',
              cell: (row) => {
                const statusMap: any = {
                  'pending': { type: 'warning', text: 'Pendente' },
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
              cell: () => (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Detalhes</Button>
                  <Button variant="outline" size="sm" className="bg-cross-blue text-white hover:bg-cross-blue/90">
                    Processar
                  </Button>
                </div>
              )
            }
          ]}
          data={recebimentosPendentes}
        />
      </CardContent>
    </Card>
  );
};

export default PendingReceipts;
