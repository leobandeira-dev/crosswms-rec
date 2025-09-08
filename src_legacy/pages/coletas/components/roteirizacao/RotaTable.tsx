
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Carga } from '../../types/coleta.types';

interface RotaTableProps {
  rotaOtimizada: Carga[];
  moverParaCima: (index: number) => void;
  moverParaBaixo: (index: number) => void;
  isLoading?: boolean;
}

const RotaTable: React.FC<RotaTableProps> = ({
  rotaOtimizada,
  moverParaCima,
  moverParaBaixo,
  isLoading
}) => {
  if (isLoading) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="h-24 text-center">
          Calculando a melhor rota...
        </TableCell>
      </TableRow>
    );
  }

  if (rotaOtimizada.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="h-24 text-center">
          Clique em "Otimizar Rota" para calcular a melhor rota
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {rotaOtimizada.map((carga, index) => (
        <TableRow key={carga.id}>
          <TableCell className="font-medium text-center">{index + 1}</TableCell>
          <TableCell>{carga.id}</TableCell>
          <TableCell>{carga.destino}</TableCell>
          <TableCell>{carga.cep || "—"}</TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end space-x-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => moverParaCima(index)}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
                <span className="sr-only">Mover para cima</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => moverParaBaixo(index)}
                disabled={index === rotaOtimizada.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
                <span className="sr-only">Mover para baixo</span>
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default RotaTable;
