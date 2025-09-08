
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Printer } from 'lucide-react';
import { NotaFiscal } from '../../../Faturamento';
import { toast } from '@/hooks/use-toast';
import { generateDANFEFromXML, createPDFDataUrl } from '@/pages/armazenagem/recebimento/utils/danfeAPI';
import { formatNumber } from '@/pages/armazenagem/utils/formatters';

interface NotasTableProps {
  notasLote: Partial<NotaFiscal>[];
  onUpdateNota: (index: number, field: keyof NotaFiscal, value: any) => void;
  onRemoveNota: (index: number) => void;
}

const NotasTable: React.FC<NotasTableProps> = ({ notasLote, onUpdateNota, onRemoveNota }) => {
  if (notasLote.length === 0) return null;

  const handlePrintDANFE = async (nota: Partial<NotaFiscal>, index: number) => {
    if (!nota.xmlContent) {
      toast({
        title: "Erro ao gerar DANFE",
        description: "XML da nota fiscal não disponível para impressão.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      toast({
        title: "Gerando DANFE",
        description: "Aguarde enquanto processamos o documento.",
      });
      
      console.log("Conteúdo XML enviado:", nota.xmlContent.slice(0, 100) + "...");
      
      const pdfBase64 = await generateDANFEFromXML(nota.xmlContent);
      if (pdfBase64) {
        // Open the PDF in a new window
        const dataUrl = createPDFDataUrl(pdfBase64);
        const newWindow = window.open(dataUrl, '_blank');
        
        if (!newWindow) {
          toast({
            title: "Aviso",
            description: "O bloqueador de pop-ups pode ter impedido a abertura do DANFE. Verifique as configurações do navegador.",
            // Change "warning" to "default" since "warning" is not an allowed variant
            variant: "default"
          });
        } else {
          toast({
            title: "DANFE gerado com sucesso",
            description: "O documento foi aberto em uma nova janela.",
          });
        }
      } else {
        throw new Error("Falha ao gerar o PDF do DANFE");
      }
    } catch (error) {
      console.error("Erro ao imprimir DANFE:", error);
      toast({
        title: "Erro ao gerar DANFE",
        description: "Não foi possível gerar o documento. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table className="border">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Data</TableHead>
            <TableHead className="whitespace-nowrap">Remetente</TableHead>
            <TableHead className="whitespace-nowrap">Cliente</TableHead>
            <TableHead className="whitespace-nowrap">Nota Fiscal</TableHead>
            <TableHead className="whitespace-nowrap">Pedido</TableHead>
            <TableHead className="whitespace-nowrap">Peso (kg)</TableHead>
            <TableHead className="whitespace-nowrap">Valor NF (R$)</TableHead>
            <TableHead className="whitespace-nowrap">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notasLote.map((nota, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input 
                  type="date" 
                  value={nota.data ? nota.data.toISOString().split('T')[0] : ''}
                  onChange={(e) => onUpdateNota(index, 'data', new Date(e.target.value))}
                />
              </TableCell>
              <TableCell>
                <Input 
                  value={nota.remetente || ''}
                  onChange={(e) => onUpdateNota(index, 'remetente', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input 
                  value={nota.cliente || ''}
                  onChange={(e) => onUpdateNota(index, 'cliente', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input 
                  value={nota.notaFiscal || ''}
                  onChange={(e) => onUpdateNota(index, 'notaFiscal', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input 
                  value={nota.pedido || ''}
                  onChange={(e) => onUpdateNota(index, 'pedido', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="text" 
                  value={formatNumber(nota.pesoNota || 0, true)}
                  onChange={(e) => {
                    const value = e.target.value.replace(',', '.');
                    onUpdateNota(index, 'pesoNota', parseFloat(value) || 0);
                  }}
                />
              </TableCell>
              <TableCell>
                <Input 
                  type="number" 
                  step="0.01"
                  value={nota.valorNF || 0}
                  onChange={(e) => onUpdateNota(index, 'valorNF', parseFloat(e.target.value))}
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {nota.xmlContent && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => handlePrintDANFE(nota, index)}
                      title="Imprimir DANFE"
                    >
                      <Printer className="h-4 w-4" />
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onRemoveNota(index)}
                    title="Remover nota"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default NotasTable;
