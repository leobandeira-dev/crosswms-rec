
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Printer, CheckSquare } from 'lucide-react';
import { formatCurrency } from '@/pages/armazenagem/utils/formatters';
import { format } from 'date-fns';
import { useFaturamentoDocumentos } from '../../../hooks/faturamento/useFaturamentoDocumentos';
import FaturaDocumentPDFViewer from '../print/FaturaDocumentPDFViewer';
import { useFaturamento } from '../../../hooks/useFaturamento';

const DocumentosAConferir: React.FC = () => {
  const { documentosAConferir, marcarComoConferido } = useFaturamentoDocumentos();
  const { cabecalhoValores, totaisCalculados, notas } = useFaturamento();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const paginatedDocumentos = documentosAConferir.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(documentosAConferir.length / itemsPerPage);
  
  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Data Emissão</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Transportadora</TableHead>
              <TableHead>Motorista</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedDocumentos.length > 0 ? (
              paginatedDocumentos.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.documentNumber}</TableCell>
                  <TableCell>{format(new Date(doc.dataEmissao), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    {doc.documentType === 'inbound' ? 'Fatura Entrada' : 'Fatura Saída'}
                  </TableCell>
                  <TableCell>{doc.transporterName}</TableCell>
                  <TableCell>{doc.driverName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(doc.totalViagem)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <FaturaDocumentPDFViewer
                        documentInfo={doc}
                        notas={notas}
                        cabecalhoValores={cabecalhoValores}
                        totaisCalculados={totaisCalculados}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => marcarComoConferido(doc.id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Conferir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Nenhum documento a conferir encontrado.
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

export default DocumentosAConferir;
