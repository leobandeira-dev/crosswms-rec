
import React from 'react';
import { Input } from '@/components/ui/input';
import { DollarSign, Weight, Package, Percent, Euro } from 'lucide-react';
import { CabecalhoValores } from '../../../hooks/faturamento/types';

interface ParametrosCalculoProps {
  valores: CabecalhoValores;
  onChange: (field: keyof CabecalhoValores, value: number) => void;
}

const ParametrosCalculo: React.FC<ParametrosCalculoProps> = ({ valores, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Parâmetros do Cálculo</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Frete por Tonelada (R$)
          </label>
          <Input
            type="number"
            step="0.01"
            value={valores.fretePorTonelada}
            onChange={(e) => onChange('fretePorTonelada', parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Weight className="h-4 w-4 text-muted-foreground" />
            Peso Mínimo (kg)
          </label>
          <Input
            type="number"
            step="0.01"
            value={valores.pesoMinimo}
            onChange={(e) => onChange('pesoMinimo', parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            Alíquota ICMS (%)
          </label>
          <Input
            type="number"
            step="0.01"
            value={valores.aliquotaICMS}
            onChange={(e) => onChange('aliquotaICMS', parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Percent className="h-4 w-4 text-muted-foreground" />
            Alíquota Expresso (%)
          </label>
          <Input
            type="number"
            step="0.01"
            value={valores.aliquotaExpresso}
            onChange={(e) => onChange('aliquotaExpresso', parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Euro className="h-4 w-4 text-muted-foreground" />
            Pedágio (R$)
          </label>
          <Input
            type="number"
            step="0.01"
            value={valores.pedagio}
            onChange={(e) => onChange('pedagio', parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            Paletização (R$)
          </label>
          <Input
            type="number"
            step="0.01"
            value={valores.paletizacao}
            onChange={(e) => onChange('paletizacao', parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Valor Frete Transferência (R$)
          </label>
          <Input
            type="number"
            step="0.01"
            value={valores.valorFreteTransferencia}
            onChange={(e) => onChange('valorFreteTransferencia', parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            Valor Coleta (R$)
          </label>
          <Input
            type="number"
            step="0.01"
            value={valores.valorColeta}
            onChange={(e) => onChange('valorColeta', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>
    </div>
  );
};

export default ParametrosCalculo;
