
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { 
  VolumeItem, 
  calcularVolume, 
  formatarNumero 
} from '../../utils/volumeCalculations';
import VolumesTotals from './VolumesTotals';

interface VolumesTableProps {
  volumes: VolumeItem[];
  onRemoveVolume: (index: number) => void;
  readOnly?: boolean;
  pesoTotal?: number;
}

const VolumesTable: React.FC<VolumesTableProps> = ({ 
  volumes, 
  onRemoveVolume,
  readOnly = false,
  pesoTotal
}) => {
  if (volumes.length === 0) {
    return null;
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="bg-gray-50 text-xs">
          <tr>
            <th className="p-2 text-left">Altura (cm)</th>
            <th className="p-2 text-left">Largura (cm)</th>
            <th className="p-2 text-left">Comprimento (cm)</th>
            <th className="p-2 text-left">Qtd</th>
            <th className="p-2 text-left">Volume (m³)</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {volumes.map((volume, index) => {
            const volumeCalculado = calcularVolume(volume);
            
            return (
              <tr key={volume.id || index} className="border-t">
                <td className="p-2">{volume.altura.toFixed(2)}</td>
                <td className="p-2">{volume.largura.toFixed(2)}</td>
                <td className="p-2">{volume.comprimento.toFixed(2)}</td>
                <td className="p-2">{volume.quantidade}</td>
                <td className="p-2">{formatarNumero(volumeCalculado)}</td>
                <td className="p-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onRemoveVolume(index)}
                    disabled={readOnly}
                    className="h-8 w-8 text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            );
          })}
          
          {volumes.length > 0 && <VolumesTotals volumes={volumes} pesoTotal={pesoTotal} />}
        </tbody>
      </table>
    </div>
  );
};

export default VolumesTable;
