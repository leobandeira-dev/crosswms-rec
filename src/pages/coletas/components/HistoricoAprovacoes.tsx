
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import SearchFilter from '@/components/common/SearchFilter';
import DocumentPDFGenerator from '@/components/common/DocumentPDFGenerator';
import { SolicitacaoColeta } from '../types/coleta.types';

interface HistoricoAprovacoesProps {
  onSearch: (value: string) => void;
  onFilterChange: (filter: string, value: string) => void;
  onOpenDetail: (row: SolicitacaoColeta) => void;
  renderAprovacaoDocument: (documentId: string) => React.ReactNode;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  solicitacoes: SolicitacaoColeta[];
}

const HistoricoAprovacoes: React.FC<HistoricoAprovacoesProps> = ({
  onSearch,
  onFilterChange,
  onOpenDetail,
  renderAprovacaoDocument,
  currentPage,
  setCurrentPage,
  solicitacoes
}) => {
  const filters = [
    {
      name: 'Status',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Aprovados', value: 'approved' },
        { label: 'Recusados', value: 'rejected' },
      ]
    },
    {
      name: 'Data',
      options: [
        { label: 'Hoje', value: 'today' },
        { label: 'Últimos 7 dias', value: '7days' },
        { label: 'Últimos 30 dias', value: '30days' },
        { label: 'Personalizado', value: 'custom' },
      ]
    }
  ];

  // Filtro para mostrar apenas solicitações aprovadas e recusadas
  const historicoAprovacoes = solicitacoes.filter(s => s.status === 'approved' || s.status === 'rejected');

  return (
    <>
      <SearchFilter 
        placeholder="Buscar por ID, cliente ou notas fiscais..."
        filters={filters}
        onSearch={onSearch}
        onFilterChange={onFilterChange}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Aprovações</CardTitle>
          <CardDescription>
            Solicitações previamente avaliadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { header: 'ID', accessor: 'id' },
              { header: 'Cliente', accessor: 'cliente' },
              { header: 'Solicitante', accessor: 'solicitante' },
              { header: 'Aprovador', accessor: 'aprovador' },
              { header: 'Data Solicitação', accessor: 'data' },
              { header: 'Data Aprovação', accessor: 'dataAprovacao' },
              { 
                header: 'Status', 
                accessor: 'status',
                cell: (row) => {
                  const statusMap: any = {
                    'approved': { type: 'success', text: 'Aprovado' },
                    'rejected': { type: 'error', text: 'Recusado' },
                  };
                  const status = statusMap[row.status];
                  return <StatusBadge status={status.type} text={status.text} />;
                }
              },
              { 
                header: 'Ações', 
                accessor: '',
                cell: (row) => (
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetail(row);
                      }}
                    >
                      Ver
                    </Button>
                    <DocumentPDFGenerator
                      documentId={row.id}
                      documentType="Solicitação de Coleta"
                      renderDocument={renderAprovacaoDocument}
                      buttonText="Imprimir"
                    />
                  </div>
                )
              }
            ]}
            data={historicoAprovacoes}
            pagination={{
              totalPages: Math.ceil(historicoAprovacoes.length / 10),
              currentPage: currentPage,
              onPageChange: setCurrentPage
            }}
            onRowClick={onOpenDetail}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default HistoricoAprovacoes;
