
import React from 'react';
import { formatCurrency, formatNumber } from '@/pages/armazenagem/utils/formatters';
import { TotaisCalculados } from '../../../hooks/faturamento/types';

interface TotaisViagemProps {
  totaisCalculados: TotaisCalculados;
  notasCount: number;
  pesoTotal: number;
  pesoConsiderado: number;
  pesoMinimo: number; // Added pesoMinimo param
}

const TotaisViagem: React.FC<TotaisViagemProps> = ({
  totaisCalculados,
  notasCount,
  pesoTotal,
  pesoConsiderado,
  pesoMinimo, // Added pesoMinimo param
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Totais da Viagem</h3>
      
      <div className="grid grid-cols-1 gap-4 bg-muted/20 p-4 rounded-lg">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Notas Fiscais:</span>
          <span className="font-bold">{notasCount}</span>
        </div>
        
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Peso Total (kg):</span>
          <span className="font-bold">{formatNumber(pesoTotal)}</span>
        </div>
        
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Peso Mínimo (kg):</span>
          <span className="font-bold">{formatNumber(pesoMinimo)}</span>
        </div>
        
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Peso Considerado (kg):</span>
          <span className="font-bold">{formatNumber(pesoConsiderado)}</span>
        </div>
        
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Frete Peso Viagem:</span>
          <span className="font-bold">{formatCurrency(totaisCalculados.fretePesoViagem)}</span>
        </div>
        
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Expresso Viagem:</span>
          <span className="font-bold">{formatCurrency(totaisCalculados.expressoViagem)}</span>
        </div>
        
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Pedágio Viagem:</span>
          <span className="font-bold">{formatCurrency(totaisCalculados.pedagioViagem)}</span>
        </div>
        
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">ICMS Viagem:</span>
          <span className="font-bold">{formatCurrency(totaisCalculados.icmsViagem)}</span>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-foreground/20">
          <span className="font-semibold">Total da Viagem:</span>
          <span className="font-bold text-lg">{formatCurrency(totaisCalculados.totalViagem)}</span>
        </div>
      </div>
    </div>
  );
};

export default TotaisViagem;
