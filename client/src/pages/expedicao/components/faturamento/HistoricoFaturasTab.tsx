
import React from 'react';
import { useHistoricoFaturas } from '../../hooks/useHistoricoFaturas';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Printer, Eye } from 'lucide-react';
import { getDateFromDocumentNumber } from '../../utils/documentUtils';

const HistoricoFaturasTab: React.FC = () => {
  const { faturas, loading, handleViewFatura, handlePrintFatura } = useHistoricoFaturas();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Histórico de faturas</h2>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableCaption>Lista de faturas emitidas</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Nº Documento</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Transportadora</TableHead>
              <TableHead>Motorista</TableHead>
              <TableHead className="text-right">Notas fiscais</TableHead>
              <TableHead className="text-right">Valor total</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  Carregando histórico de faturas...
                </TableCell>
              </TableRow>
            ) : faturas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  Nenhuma fatura emitida ainda
                </TableCell>
              </TableRow>
            ) : (
              faturas.map((fatura) => (
                <TableRow key={fatura.id}>
                  <TableCell className="font-medium">{fatura.documentoNumero}</TableCell>
                  <TableCell>
                    {fatura.data instanceof Date 
                      ? format(fatura.data, 'dd/MM/yyyy')
                      : getDateFromDocumentNumber(fatura.documentoNumero || '') 
                        ? format(getDateFromDocumentNumber(fatura.documentoNumero || '')!, 'dd/MM/yyyy')
                        : 'Data inválida'}
                  </TableCell>
                  <TableCell>
                    {fatura.documentoTipo === 'inbound' ? 'Entrada' : 'Saída'}
                  </TableCell>
                  <TableCell>{fatura.transportadora || 'N/A'}</TableCell>
                  <TableCell>{fatura.motorista || 'N/A'}</TableCell>
                  <TableCell className="text-right">{fatura.notasCount || 0}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('pt-BR', { 
                      style: 'currency', 
                      currency: 'BRL' 
                    }).format(fatura.valorTotal || 0)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewFatura(fatura.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handlePrintFatura(fatura.id)}
                      >
                        <Printer className="h-4 w-4 mr-1" />
                        Imprimir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default HistoricoFaturasTab;
