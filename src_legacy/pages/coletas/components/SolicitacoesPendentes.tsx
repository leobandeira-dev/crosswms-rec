
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import SearchFilter from '@/components/common/SearchFilter';
import DocumentPDFGenerator from '@/components/common/DocumentPDFGenerator';
import { SolicitacaoColeta } from '../types/coleta.types';

interface SolicitacoesPendentesProps {
  onSearch: (value: string) => void;
  onFilterChange: (filter: string, value: string) => void;
  onOpenDetail: (row: SolicitacaoColeta) => void;
  renderAprovacaoDocument: (documentId: string) => React.ReactNode;
  solicitacoes: SolicitacaoColeta[];
}

const SolicitacoesPendentes: React.FC<SolicitacoesPendentesProps> = ({
  onSearch,
  onFilterChange,
  onOpenDetail,
  renderAprovacaoDocument,
  solicitacoes
}) => {
  const filters = [
    {
      name: 'Prioridade',
      options: [
        { label: 'Todas', value: 'all' },
        { label: 'Alta', value: 'high' },
        { label: 'Média', value: 'medium' },
        { label: 'Baixa', value: 'low' },
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

  // Filtro para mostrar apenas solicitações pendentes
  const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'pending');

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
          <CardTitle>Solicitações Pendentes</CardTitle>
          <CardDescription>
            {solicitacoesPendentes.length} solicitações aguardando aprovação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { header: 'ID', accessor: 'id' },
              { header: 'Cliente', accessor: 'cliente' },
              { 
                header: 'Notas Fiscais', 
                accessor: 'notas', 
                cell: (row) => row.notas.join(', ') 
              },
              { header: 'Volumes', accessor: 'volumes', className: 'text-center' },
              { header: 'Peso', accessor: 'peso' },
              { header: 'Data', accessor: 'data' },
              { header: 'Solicitante', accessor: 'solicitante' },
              { 
                header: 'Prioridade', 
                accessor: 'prioridade',
                cell: (row) => {
                  const priorityMap: any = {
                    'Alta': { type: 'error', text: 'Alta' },
                    'Média': { type: 'warning', text: 'Média' },
                    'Baixa': { type: 'info', text: 'Baixa' },
                  };
                  const priority = priorityMap[row.prioridade];
                  return <StatusBadge status={priority.type} text={priority.text} />;
                }
              },
              { 
                header: 'Ações', 
                accessor: '',
                cell: (row) => (
                  <div className="flex space-x-2 justify-end">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetail(row);
                      }}
                      size="sm"
                    >
                      Revisar
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
            data={solicitacoesPendentes}
            onRowClick={onOpenDetail}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default SolicitacoesPendentes;
