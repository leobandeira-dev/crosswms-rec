
import React from 'react';
import { calcularTotaisColeta, calcularTotaisNota, formatarNumero, formatarMoeda } from '../../utils/volumes/index';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { NotaFiscalVolume } from '../../utils/volumes/types';

interface NotasFiscaisSummaryProps {
  notasFiscais: NotaFiscalVolume[];
}

const NotasFiscaisSummaryItem = ({ label, value }: { label: string, value: string }) => {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm font-medium text-gray-600">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
};

const NotasFiscaisSummary: React.FC<NotasFiscaisSummaryProps> = ({ notasFiscais }) => {
  const totais = calcularTotaisColeta(notasFiscais);
  
  // Skip rendering if no notas fiscais
  if (notasFiscais.length === 0) {
    return null;
  }
  
  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold mb-4">Resumo da Coleta</h3>
        
        {/* Table showing each NF with its totals */}
        <div className="overflow-auto mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Nota Fiscal</TableHead>
                <TableHead>Remetente</TableHead>
                <TableHead>Destinatário</TableHead>
                <TableHead className="text-right">Qtd Volumes</TableHead>
                <TableHead className="text-right">Peso Total (kg)</TableHead>
                <TableHead className="text-right">Volume Total (m³)</TableHead>
                <TableHead className="text-right">Valor NF (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notasFiscais.map((nf, index) => {
                const nfTotais = calcularTotaisNota(nf.volumes);
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{nf.numeroNF || `NF ${index + 1}`}</TableCell>
                    <TableCell>{nf.remetente || '-'}</TableCell>
                    <TableCell>{nf.destinatario || '-'}</TableCell>
                    <TableCell className="text-right">{nfTotais.qtdVolumes}</TableCell>
                    <TableCell className="text-right">{formatarNumero(nfTotais.pesoTotal)}</TableCell>
                    <TableCell className="text-right">{formatarNumero(nfTotais.volumeTotal)}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(nf.valorTotal || 0)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <NotasFiscaisSummaryItem 
              label="Total de Notas Fiscais" 
              value={notasFiscais.length.toString()} 
            />
            <NotasFiscaisSummaryItem 
              label="Total de Volumes" 
              value={totais.qtdVolumes.toString()}
            />
            <NotasFiscaisSummaryItem 
              label="Volume Total (m³)" 
              value={formatarNumero(totais.volumeTotal)}
            />
            <NotasFiscaisSummaryItem 
              label="Valor Total das NFs" 
              value={formatarMoeda(notasFiscais.reduce((sum, nf) => sum + (nf.valorTotal || 0), 0))}
            />
          </div>
          
          <div className="space-y-2">
            <NotasFiscaisSummaryItem 
              label="Peso Real Total (kg)" 
              value={formatarNumero(totais.pesoTotal)}
            />
            <NotasFiscaisSummaryItem 
              label="Peso Cubado Total (kg)" 
              value={formatarNumero(totais.pesoCubadoTotal)}
            />
            <NotasFiscaisSummaryItem 
              label="Peso Considerado (kg)" 
              value={formatarNumero(Math.max(totais.pesoTotal, totais.pesoCubadoTotal))}
            />
            <div className="pt-1 text-sm text-gray-500 italic">
              <p>O peso considerado é o maior entre o peso real e o peso cubado</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotasFiscaisSummary;
