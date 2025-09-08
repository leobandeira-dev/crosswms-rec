
import React from 'react';
import { Button } from '@/components/ui/button';

interface Volume {
  id: string;
  codigo: string;
  notaFiscal: string;
  produto: string;
  peso: string;
  dimensoes: string;
  fragil: boolean;
  posicaoAtual?: string;
  descricao: string;
  posicionado: boolean;
  etiquetaMae: string;
  fornecedor: string;
  quantidade: number;
  etiquetado: boolean;
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
      const notaFiscal = v.notaFiscal || 'N/A';
      const fornecedor = v.fornecedor || 'Fornecedor não informado';
      
      if (!notasCount[notaFiscal]) {
        notasCount[notaFiscal] = { fornecedor, count: 0 };
      }
      notasCount[notaFiscal].count += 1;
    });

    return Object.entries(notasCount).map(([nf, info]) => ({
      nf: nf || 'N/A',
      fornecedor: info.fornecedor || 'Fornecedor não informado',
      count: info.count || 0
    }));
  };

  const volumesInfo = contarVolumesPorNF(volumes);

  return (
    <div 
      className={`flex-1 border-r last:border-r-0 p-2 min-h-[120px] ${
        hasSelectedVolumes ? 'hover:bg-blue-50 cursor-pointer' : ''
      } ${volumes.length > 0 ? 'bg-white' : ''}`}
      onClick={onClick}
    >
      {volumesInfo.length > 0 ? (
        <div className="text-xs">
          {/* Cabeçalho da tabela */}
          <div className="grid grid-cols-12 gap-1 mb-1 text-[10px] font-semibold text-gray-600 border-b pb-1">
            <div className="col-span-3">NF</div>
            <div className="col-span-6">Fornecedor</div>
            <div className="col-span-2">Qtd</div>
            <div className="col-span-1"></div>
          </div>
          
          {/* Linhas de dados */}
          <div className="space-y-1 max-h-[80px] overflow-y-auto">
            {volumesInfo.map((info, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-1 items-center py-1 hover:bg-gray-50 rounded">
                <div className="col-span-3 font-medium text-blue-600">{info.nf}</div>
                <div className="col-span-6 text-gray-700 truncate" title={info.fornecedor || 'N/A'}>
                  {info.fornecedor && info.fornecedor.length > 15 ? `${info.fornecedor.substring(0, 15)}...` : (info.fornecedor || 'N/A')}
                </div>
                <div className="col-span-2 text-center font-semibold text-green-600">
                  {info.count}
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
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
