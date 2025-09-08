
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '../../components/common/DataTable';
import { Ocorrencia } from '@/types/ocorrencias.types';
import { getPrioridadeBadge, getStatusBadge } from '@/utils/ocorrenciasUtils';
import { DollarSign, FileText, Link, Package } from 'lucide-react';

interface OcorrenciasTableProps {
  title: string;
  data: Ocorrencia[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onRowClick: (ocorrencia: Ocorrencia) => void;
  onLinkDocument: (ocorrencia: Ocorrencia) => void;
}

const OcorrenciasTable: React.FC<OcorrenciasTableProps> = ({
  title,
  data,
  currentPage,
  onPageChange,
  onRowClick,
  onLinkDocument,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={[
            { header: 'ID', accessor: 'id' },
            { header: 'Cliente', accessor: 'cliente' },
            { header: 'NF', accessor: 'nf' },
            { 
              header: 'Tipo', 
              accessor: 'tipo',
              cell: (row) => {
                const tipoMap: any = {
                  'extravio': 'Extravio',
                  'avaria': 'Avaria',
                  'atraso': 'Atraso',
                  'divergencia': 'Divergência',
                };
                return tipoMap[row.tipo] || row.tipo;
              }
            },
            { header: 'Data Registro', accessor: 'dataRegistro' },
            { 
              header: 'Doc. Vinculado', 
              accessor: 'documentoVinculado',
              cell: (row) => (
                <div className="flex items-center">
                  {row.documentoVinculado ? (
                    <>
                      {row.tipoDocumento === 'nota' ? <FileText className="mr-1 h-4 w-4" /> : 
                       row.tipoDocumento === 'coleta' ? <Package className="mr-1 h-4 w-4" /> : 
                       <FileText className="mr-1 h-4 w-4" />}
                      <span>{row.documentoVinculado}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
              )
            },
            { 
              header: 'Valor Prejuízo', 
              accessor: 'valorPrejuizo',
              cell: (row) => (
                <div className="flex items-center">
                  {parseFloat(row.valorPrejuizo?.replace(',', '.') || '0') > 0 ? (
                    <>
                      <DollarSign className="mr-1 h-4 w-4 text-red-500" />
                      <span className="text-red-500 font-medium">R$ {row.valorPrejuizo}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">R$ 0,00</span>
                  )}
                </div>
              )
            },
            { 
              header: 'Prioridade', 
              accessor: 'prioridade',
              cell: (row) => getPrioridadeBadge(row.prioridade)
            },
            { 
              header: 'Status', 
              accessor: 'status',
              cell: (row) => getStatusBadge(row.status)
            },
            { 
              header: 'Ações', 
              accessor: '',
              cell: (row) => (
                <div className="flex space-x-2 justify-end">
                  {row.status !== 'resolved' && row.status !== 'closed' && (
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onLinkDocument(row);
                      }}
                      size="sm"
                      variant="outline"
                      title="Vincular a documento"
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRowClick(row);
                    }}
                    size="sm"
                    className={row.status === 'resolved' || row.status === 'closed' ? 'bg-gray-500 hover:bg-gray-600' : 'bg-cross-blue hover:bg-cross-blueDark'}
                  >
                    Detalhes
                  </Button>
                </div>
              )
            }
          ]}
          data={data}
          pagination={{
            totalPages: Math.ceil(data.length / 10),
            currentPage: currentPage,
            onPageChange: onPageChange
          }}
          onRowClick={onRowClick}
        />
      </CardContent>
    </Card>
  );
};

export default OcorrenciasTable;
