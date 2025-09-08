
import React from 'react';
import { Button } from '@/components/ui/button';

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

interface TruckCellProps {
  id: string;
  volumes: Volume[];
  hasSelectedVolumes: boolean;
  onClick: () => void;
  onRemoveVolume: (volumeId: string, cellId: string) => void;
}

const TruckCell: React.FC<TruckCellProps> = ({
  id,
  volumes,
  hasSelectedVolumes,
  onClick,
  onRemoveVolume
}) => {
  // Contar volumes por nota fiscal
  const contarVolumesPorNF = (volumes: Volume[]) => {
    const notasCount: Record<string, { fornecedor: string, count: number }> = {};
    
    volumes.forEach(v => {
      if (!notasCount[v.notaFiscal]) {
        notasCount[v.notaFiscal] = { fornecedor: v.fornecedor, count: 0 };
      }
      notasCount[v.notaFiscal].count += 1;
    });

    return Object.entries(notasCount).map(([nf, info]) => ({
      nf,
      fornecedor: info.fornecedor,
      count: info.count
    }));
  };

  const volumesInfo = contarVolumesPorNF(volumes);

  return (
    <div 
      className={`flex-1 border-r last:border-r-0 p-2 min-h-[80px] ${
        hasSelectedVolumes ? 'hover:bg-blue-50 cursor-pointer' : ''
      } ${volumes.length > 0 ? 'bg-white' : ''}`}
      onClick={onClick}
    >
      {volumesInfo.length > 0 ? (
        <div className="text-xs space-y-1">
          {volumesInfo.map((info, idx) => (
            <div key={idx} className="p-1 border rounded bg-white">
              <div className="font-medium">{info.nf}</div>
              <div className="text-gray-600 truncate">{info.fornecedor}</div>
              <div className="flex justify-between">
                <span>{info.count} vol.</span>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-gray-400 hover:text-red-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    volumes
                      .filter(v => v.notaFiscal === info.nf)
                      .forEach(v => onRemoveVolume(v.id, id));
                  }}
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-xs text-gray-400">
          {hasSelectedVolumes ? 'Clique para alocar' : 'Vazio'}
        </div>
      )}
    </div>
  );
};

export default TruckCell;
