
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import { Volume } from '@/hooks/useEnderecamentoVolumes';

interface VolumesRecentesCardProps {
  volumesEndereçados: Volume[];
  handlePrintClick: (volumeId: string) => void;
}

const VolumesRecentesCard: React.FC<VolumesRecentesCardProps> = ({
  volumesEndereçados,
  handlePrintClick
}) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">Volumes Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={[
            { header: 'ID', accessor: 'id' },
            { header: 'Tipo', accessor: 'tipo' },
            { header: 'Descrição', accessor: 'descricao' },
            { header: 'Nota Fiscal', accessor: 'notaFiscal' },
            { 
              header: 'Endereço', 
              accessor: 'endereco',
              cell: (row) => {
                return row.endereco ? 
                  <span>{row.endereco}</span> : 
                  <StatusBadge status="warning" text="Não endereçado" />;
              }
            },
            {
              header: 'Ações',
              accessor: 'actions',
              cell: (row) => (
                <div className="flex gap-2">
                  {row.endereco && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePrintClick(row.id)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )
            }
          ]}
          data={volumesEndereçados}
        />
      </CardContent>
    </Card>
  );
};

export default VolumesRecentesCard;
