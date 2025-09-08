
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, MapPin, Biohazard, LinkIcon } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';

export interface Volume {
  id: string;
  notaFiscal: string;
  volumeNumber: number;
  totalVolumes: number;
  descricao: string;
  pesoTotal: string;
  remetente: string;
  destinatario: string;
  endereco: string;
  cidade: string;
  cidadeCompleta?: string;
  uf: string;
  transportadora: string;
  chaveNF: string;
  numeroPedido: string;
  quantidade: number;
  area: string;
  classificacaoQuimica: 'nao_perigosa' | 'perigosa' | 'nao_classificada';
  codigoONU: string;
  codigoRisco: string;
  etiquetado: boolean;
  impresso: boolean;
  dataGeracao: string;
  etiquetaMae?: string;
  tipoEtiquetaMae?: 'geral' | 'palete';
  tipoVolume?: 'geral' | 'quimico';
}

interface VolumesTableProps {
  volumes: Volume[];
  onPrintEtiquetas: (volume: Volume) => void;
  onClassifyVolume: (volume: Volume) => void;
  showEtiquetaMaeColumn?: boolean;
}

const VolumesTable: React.FC<VolumesTableProps> = ({
  volumes,
  onPrintEtiquetas,
  onClassifyVolume,
  showEtiquetaMaeColumn = false
}) => {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Volumes Gerados</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={[
            { header: 'Código', accessor: 'id' },
            { header: 'Nota Fiscal', accessor: 'notaFiscal' },
            { 
              header: 'Volume', 
              accessor: 'descricao',
              cell: (row) => {
                return (
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold text-center">
                    {row.volumeNumber}/{row.totalVolumes}
                  </div>
                );
              }
            },
            { 
              header: 'Tipo', 
              accessor: 'classificacaoQuimica',
              cell: (row) => {
                return row.classificacaoQuimica === 'perigosa' ? 
                  <div className="flex items-center">
                    <Biohazard size={16} className="text-red-500 mr-1" />
                    <span>Químico</span>
                  </div> : 
                  <span>Carga Geral</span>;
              }
            },
            { 
              header: 'Área', 
              accessor: 'area',
              cell: (row) => {
                return row.area ? 
                  <div className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded font-bold text-center">
                    {row.area}
                  </div> : 
                  <span>-</span>;
              }
            },
            { 
              header: 'Quantidade', 
              accessor: 'quantidade',
              cell: (row) => {
                return (
                  <div className="bg-green-100 text-green-800 px-2 py-1 rounded font-bold text-center">
                    {row.quantidade}
                  </div>
                );
              }
            },
            { 
              header: 'Status', 
              accessor: 'etiquetado',
              cell: (row) => (
                <StatusBadge 
                  status={row.etiquetado ? 'success' : 'pending'} 
                  text={row.etiquetado ? 'Etiquetado' : 'Pendente'} 
                />
              )
            },
            ...(showEtiquetaMaeColumn ? [{
              header: 'Etiqueta Mãe', 
              accessor: 'etiquetaMae' as keyof Volume,
              cell: (row: Volume) => {
                return row.etiquetaMae ? 
                  <div className="flex items-center">
                    <LinkIcon size={16} className="text-purple-500 mr-1" />
                    <span className="text-purple-600">{row.etiquetaMae}</span>
                  </div> : 
                  <span>-</span>;
              }
            }] : []),
            {
              header: 'Ações',
              accessor: 'actions',
              cell: (row) => (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onPrintEtiquetas(row)}
                  >
                    <Printer size={16} className="mr-1" />
                    Imprimir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onClassifyVolume(row)}
                  >
                    <MapPin size={16} className="mr-1" />
                    Classificar
                  </Button>
                </div>
              )
            }
          ]}
          data={volumes}
        />
      </CardContent>
    </Card>
  );
};

export default VolumesTable;
