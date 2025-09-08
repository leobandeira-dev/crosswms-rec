
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '../../../components/common/DataTable';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchFilter from '../../../components/common/SearchFilter';

interface HistoricalLoadsProps {
  historicoCargas: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const HistoricalLoads: React.FC<HistoricalLoadsProps> = ({ 
  historicoCargas, 
  currentPage, 
  setCurrentPage 
}) => {
  const filters = [
    {
      name: 'Motorista',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'José da Silva', value: 'jose' },
        { label: 'Carlos Santos', value: 'carlos' },
        { label: 'Pedro Oliveira', value: 'pedro' },
        { label: 'Antônio Ferreira', value: 'antonio' },
        { label: 'Manuel Costa', value: 'manuel' },
      ]
    },
    {
      name: 'Status',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Entregues', value: 'delivered' },
        { label: 'Com Problemas', value: 'problem' },
      ]
    }
  ];

  const handleSearch = (value: string) => {
    console.log('Search:', value);
    // Implementar lógica de busca
  };
  
  const handleFilterChange = (filter: string, value: string) => {
    console.log(`Filter ${filter} changed to ${value}`);
    // Implementar lógica de filtro
  };

  return (
    <>
      <SearchFilter 
        placeholder="Buscar por ID, motorista ou destino..."
        filters={filters}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Cargas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { header: 'ID', accessor: 'id' },
              { header: 'Destino', accessor: 'destino' },
              { header: 'Motorista', accessor: 'motorista' },
              { header: 'Veículo', accessor: 'veiculo' },
              { header: 'Data Entrega', accessor: 'dataEntrega' },
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
                  const status = statusMap[row.status];
                  return <StatusBadge status={status.type} text={status.text} />;
                }
              },
              { 
                header: 'Ações', 
                accessor: 'actions',
                cell: () => (
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      variant="outline"
                      size="sm"
                    >
                      <FileText className="h-4 w-4 mr-1" /> Detalhes
                    </Button>
                  </div>
                )
              }
            ]}
            data={historicoCargas}
            pagination={{
              totalPages: Math.ceil(historicoCargas.length / 10),
              currentPage: currentPage,
              onPageChange: setCurrentPage
            }}
            onRowClick={(row) => console.log('Row clicked:', row)}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default HistoricalLoads;
