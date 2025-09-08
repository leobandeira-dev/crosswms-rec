
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Archive } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { Volume } from '@/hooks/useEnderecamentoVolumes';

interface MapaEnderecamentoCardProps {
  volumesEndereçados: Volume[];
  handlePrintClick: (volumeId: string) => void;
}

const MapaEnderecamentoCard: React.FC<MapaEnderecamentoCardProps> = ({
  volumesEndereçados,
  handlePrintClick
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Mapa de Endereçamento</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center items-center h-64 border rounded-md bg-gray-50">
          <div className="text-center">
            <Archive size={40} className="mx-auto mb-2 text-cross-blue" />
            <p className="text-gray-600">Visualização do mapa de endereçamento do armazém</p>
            <p className="text-sm text-gray-500">(Funcionalidade em desenvolvimento)</p>
          </div>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Volumes Endereçados</h3>
          <DataTable
            columns={[
              { header: 'ID', accessor: 'id' },
              { header: 'Tipo', accessor: 'tipo' },
              { header: 'Descrição', accessor: 'descricao' },
              { header: 'Nota Fiscal', accessor: 'notaFiscal' },
              { header: 'Endereço', accessor: 'endereco' },
              {
                header: 'Ações',
                accessor: 'actions',
                cell: (row) => (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePrintClick(row.id)}
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                )
              }
            ]}
            data={volumesEndereçados}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MapaEnderecamentoCard;
