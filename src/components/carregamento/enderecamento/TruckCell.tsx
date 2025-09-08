
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
  onOpenVolumeSelection: (cellId: string, cellPosition: string) => void;
}

const TruckCell: React.FC<TruckCellProps> = ({
  id,
  volumes,
  hasSelectedVolumes,
  onClick,
  onRemoveVolume,
  onOpenVolumeSelection
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

  const handleCellClick = () => {
    // Determinar a posição da célula baseada no ID
    const position = id.replace('cell-', '').replace('-', ' ').toUpperCase();
    onOpenVolumeSelection(id, position);
  };

  return (
    <div 
      className={`flex-1 border-r last:border-r-0 p-4 min-h-[160px] cursor-pointer hover:bg-blue-50 transition-all duration-200 ${
        volumes.length > 0 ? 'bg-white shadow-sm' : 'bg-gray-50'
      }`}
      onClick={handleCellClick}
    >
      {volumesInfo.length > 0 ? (
        <div className="text-sm">
          {/* Cabeçalho da tabela */}
          <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-bold text-gray-700 border-b-2 border-gray-200 pb-2">
            <div className="col-span-3">NF</div>
            <div className="col-span-6">Fornecedor</div>
            <div className="col-span-2">Qtd</div>
            <div className="col-span-1"></div>
          </div>
          
          {/* Linhas de dados */}
          <div className="space-y-2 max-h-[100px] overflow-y-auto">
            {volumesInfo.map((info, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 items-center py-2 hover:bg-gray-50 rounded-lg px-2">
                <div className="col-span-3 font-bold text-blue-600 text-xs">{info.nf}</div>
                <div className="col-span-6 text-gray-700 truncate text-xs" title={info.fornecedor || 'N/A'}>
                  {info.fornecedor && info.fornecedor.length > 20 ? `${info.fornecedor.substring(0, 20)}...` : (info.fornecedor || 'N/A')}
                </div>
                <div className="col-span-2 text-center font-bold text-green-600 text-sm">
                  {info.count}
                </div>
                <div className="col-span-1 flex justify-center">
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full"
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
        <div className="flex items-center justify-center h-full text-base text-gray-400 font-medium">
          <div className="text-center">
            <div className="text-3xl mb-2">📦</div>
            <div>Clique para alocar</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TruckCell;
