
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CabecalhoValores, TotaisCalculados } from '../../hooks/faturamento/types';
import ParametrosCalculo from './cabecalho/ParametrosCalculo';
import TotaisViagem from './cabecalho/TotaisViagem';
import ActionButtons from './cabecalho/ActionButtons';
import HelpInfoBox from './cabecalho/HelpInfoBox';

interface CabecalhoTotaisProps {
  cabecalhoValores: CabecalhoValores;
  totaisCalculados: TotaisCalculados;
  onUpdateCabecalho: (valores: CabecalhoValores) => void;
  onRatear: () => void;
  notasCount: number;
  pesoTotal: number;
}

const CabecalhoTotais: React.FC<CabecalhoTotaisProps> = ({
  cabecalhoValores,
  totaisCalculados,
  onUpdateCabecalho,
  onRatear,
  notasCount,
  pesoTotal
}) => {
  const [valores, setValores] = useState<CabecalhoValores>(cabecalhoValores);

  useEffect(() => {
    setValores(cabecalhoValores);
  }, [cabecalhoValores]);

  const handleChange = (field: keyof CabecalhoValores, value: number) => {
    const newValores = { ...valores, [field]: value };
    setValores(newValores);
  };

  const handleSave = () => {
    onUpdateCabecalho(valores);
  };

  // Calculate considered weight as the greater between total weight and minimum weight
  const pesoConsiderado = Math.max(pesoTotal, valores.pesoMinimo);
  
  return (
    <Card className="border border-muted">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <ParametrosCalculo 
              valores={valores} 
              onChange={handleChange} 
            />
            
            <ActionButtons 
              onSave={handleSave} 
              onRatear={onRatear} 
            />
          </div>
          
          <div className="space-y-4">
            <TotaisViagem 
              totaisCalculados={totaisCalculados}
              notasCount={notasCount}
              pesoTotal={pesoTotal}
              pesoMinimo={valores.pesoMinimo}
              pesoConsiderado={pesoConsiderado}
            />
            
            <HelpInfoBox />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CabecalhoTotais;
