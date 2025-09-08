
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash } from 'lucide-react';
import { VolumeItem, formatarNumero } from '../../../utils/volumes/index';

interface VolumesListProps {
  volumes: VolumeItem[];
  isReadOnly?: boolean;
  onUpdateVolume: (volumeId: string, field: keyof VolumeItem, value: string) => void;
  onRemoveVolume: (volumeId: string) => void;
  pesoTotal: number;
}

const VolumesList: React.FC<VolumesListProps> = ({
  volumes,
  isReadOnly = false,
  onUpdateVolume,
  onRemoveVolume,
  pesoTotal
}) => {
  // Calculate total volume in m³
  const totalVolumeM3 = volumes.reduce((sum, v) => {
    return sum + (v.cubicVolume || (v.altura * v.largura * v.comprimento * v.quantidade));
  }, 0);
  
  // Calculate distribution of weight across volumes
  const handlePesoDistribution = () => {
    if (volumes.length === 0 || !pesoTotal) return;
    
    // Distribute weight by volume ratio
    const totalVolumeCubic = totalVolumeM3;
    
    if (totalVolumeCubic <= 0) return;
    
    volumes.forEach(volume => {
      const volumeCubic = (volume.cubicVolume || (volume.altura * volume.largura * volume.comprimento * volume.quantidade));
      const volumeRatio = volumeCubic / totalVolumeCubic;
      const distributedPeso = (pesoTotal * volumeRatio).toFixed(2);
      
      onUpdateVolume(volume.id, 'peso', distributedPeso);
    });
  };

  if (volumes.length === 0) {
    return <div className="text-sm text-gray-500 py-2">Nenhum volume cadastrado.</div>;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-1">Altura (cm)</th>
              <th className="px-2 py-1">Largura (cm)</th>
              <th className="px-2 py-1">Comp. (cm)</th>
              <th className="px-2 py-1">Qtd.</th>
              <th className="px-2 py-1">Peso (kg)</th>
              <th className="px-2 py-1">Volume (m³)</th>
              <th className="px-2 py-1">
                {!isReadOnly && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handlePesoDistribution}
                    className="text-xs"
                  >
                    Distribuir Peso
                  </Button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {volumes.map((volume) => {
              // Calculate cubic volume for this specific volume
              const cubicVolume = volume.cubicVolume || (volume.altura * volume.largura * volume.comprimento * volume.quantidade);
              
              return (
                <tr key={volume.id} className="border-b">
                  <td className="px-2 py-1">
                    <Input
                      type="number"
                      value={volume.altura || 0}
                      onChange={(e) => onUpdateVolume(volume.id, 'altura', e.target.value)}
                      className="h-7 text-xs"
                      step="0.01"
                      disabled={isReadOnly}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <Input
                      type="number"
                      value={volume.largura || 0}
                      onChange={(e) => onUpdateVolume(volume.id, 'largura', e.target.value)}
                      className="h-7 text-xs"
                      step="0.01"
                      disabled={isReadOnly}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <Input
                      type="number"
                      value={volume.comprimento || 0}
                      onChange={(e) => onUpdateVolume(volume.id, 'comprimento', e.target.value)}
                      className="h-7 text-xs"
                      step="0.01"
                      disabled={isReadOnly}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <Input
                      type="number"
                      value={volume.quantidade || 0}
                      onChange={(e) => onUpdateVolume(volume.id, 'quantidade', e.target.value)}
                      className="h-7 text-xs"
                      min="1"
                      disabled={isReadOnly}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <Input
                      type="number"
                      value={volume.peso || 0}
                      onChange={(e) => onUpdateVolume(volume.id, 'peso', e.target.value)}
                      className="h-7 text-xs"
                      step="0.01"
                      disabled={isReadOnly}
                    />
                  </td>
                  <td className="px-2 py-1">
                    <Input
                      type="text"
                      value={formatarNumero(cubicVolume)}
                      className="h-7 text-xs bg-gray-50"
                      readOnly
                    />
                  </td>
                  <td className="px-2 py-1">
                    {!isReadOnly && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onRemoveVolume(volume.id)}
                        className="h-7 w-7 p-0"
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-gray-100">
            <tr>
              <td colSpan={4} className="px-2 py-1 text-right font-medium">
                Total:
              </td>
              <td className="px-2 py-1 font-medium">
                {formatarNumero(pesoTotal)} kg
              </td>
              <td className="px-2 py-1 font-medium">
                {formatarNumero(totalVolumeM3)} m³
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default VolumesList;
