
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Printer, Truck } from 'lucide-react';
import { formatCurrency } from '@/pages/armazenagem/utils/formatters';
import { format } from 'date-fns';
import { useFaturamentoDocumentos } from '../../../hooks/faturamento/useFaturamentoDocumentos';

const DocumentosEmTransito: React.FC = () => {
  const { documentosEmTransito, marcarComoEntregue } = useFaturamentoDocumentos();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const paginatedDocumentos = documentosEmTransito.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(documentosEmTransito.length / itemsPerPage);
  
  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Data Saída</TableHead>
              <TableHead>Prev. Chegada</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Transportadora</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDocumentos.length > 0 ? (
              paginatedDocumentos.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.documentNumber}</TableCell>
                  <TableCell>{format(new Date(doc.departureDateTime), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell>{format(new Date(doc.arrivalDateTime), 'dd/MM/yyyy HH:mm')}</TableCell>
                  <TableCell>
                    {doc.documentType === 'inbound' ? 'Fatura Entrada' : 'Fatura Saída'}
                  </TableCell>
                  <TableCell>{doc.transporterName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(doc.totalViagem)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-1" />
                        Imprimir
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => marcarComoEntregue(doc.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Truck className="h-4 w-4 mr-1" />
                        Entregue
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Nenhum documento em trânsito encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentosEmTransito;
