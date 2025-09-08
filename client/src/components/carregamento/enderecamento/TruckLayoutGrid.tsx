
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Printer } from 'lucide-react';
import TruckCell from './TruckCell';

interface Volume {
  id: string;
  descricao: string;
  peso: string;
  fragil: boolean;
  posicionado: boolean;
  etiquetaMae: string;
  notaFiscal: string;
  fornecedor: string;
}

interface CellLayout {
  id: string;
  coluna: 'esquerda' | 'centro' | 'direita';
  linha: number;
  volumes: Volume[];
}

interface TruckLayoutGridProps {
  orderNumber: string;
  layout: CellLayout[];
  totalVolumes: number;
  positionedVolumes: number;
  onCellClick: (cellId: string) => void;
  onRemoveVolume: (volumeId: string, cellId: string) => void;
  hasSelectedVolumes: boolean;
  onSaveLayout: () => void;
  allVolumesPositioned: boolean;
  onPrintLayout: () => void;
}

const TruckLayoutGrid: React.FC<TruckLayoutGridProps> = ({
  orderNumber,
  layout,
  totalVolumes,
  positionedVolumes,
  onCellClick,
  onRemoveVolume,
  hasSelectedVolumes,
  onSaveLayout,
  allVolumesPositioned,
  onPrintLayout
}) => {
  // Agrupar o layout por linhas para exibição
  const layoutPorLinhas = Array.from({ length: 20 }, (_, i) => {
    const linha = i + 1;
    return {
      linha,
      celulas: layout.filter(c => c.linha === linha)
    };
  });
  
  // Referência para o layout que será usado para impressão
  const layoutRef = useRef<HTMLDivElement>(null);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Truck className="mr-2 text-cross-blue" size={20} />
          Layout do Caminhão (Visão por Células)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md p-4 bg-gray-50" ref={layoutRef}>
          <div className="flex justify-between mb-4">
            <div>
              <span className="text-sm font-medium">OC: {orderNumber}</span>
            </div>
            <div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {positionedVolumes} / {totalVolumes} volumes posicionados
              </span>
            </div>
          </div>
          
          <div className="mb-2 overflow-x-auto">
            {/* Cabeçalho */}
            <div className="flex w-full min-w-[600px] mb-2 text-center font-medium border-b pb-2">
              <div className="w-[50px]">Linha</div>
              <div className="flex-1">Esquerda</div>
              <div className="flex-1">Centro</div>
              <div className="flex-1">Direita</div>
            </div>

            {/* Layout */}
            <div className="max-h-[500px] overflow-y-auto">
              {layoutPorLinhas.map(linha => (
                <div key={linha.linha} className="flex w-full min-w-[600px] mb-1 border-b pb-1">
                  <div className="w-[50px] flex items-center justify-center font-medium border-r">
                    {linha.linha}
                  </div>
                  
                  {linha.celulas.map(celula => (
                    <TruckCell
                      key={celula.id}
                      id={celula.id}
                      volumes={celula.volumes}
                      hasSelectedVolumes={hasSelectedVolumes}
                      onClick={() => onCellClick(celula.id)}
                      onRemoveVolume={onRemoveVolume}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end gap-2">
          <Button 
            variant="outline"
            onClick={onPrintLayout}
            disabled={positionedVolumes === 0}
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button 
            className="bg-cross-blue hover:bg-cross-blue/90"
            disabled={!allVolumesPositioned}
            onClick={onSaveLayout}
          >
            Salvar Layout
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TruckLayoutGrid;
