
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume } from '@/hooks/useEnderecamentoVolumes';

interface FoundVolumesCardProps {
  filteredVolumes: Volume[];
  selectedVolumes: Volume[];
  handleVolumeSelect: (volume: Volume) => void;
}

const FoundVolumesCard: React.FC<FoundVolumesCardProps> = ({
  filteredVolumes,
  selectedVolumes,
  handleVolumeSelect
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Volumes Encontrados</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredVolumes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Nenhum volume encontrado</p>
          ) : (
            filteredVolumes.map(volume => (
              <div 
                key={volume.id}
                className={`p-3 border rounded-md cursor-pointer ${
                  selectedVolumes.some(v => v.id === volume.id) ? 'bg-blue-50 border-cross-blue' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleVolumeSelect(volume)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        checked={selectedVolumes.some(v => v.id === volume.id)} 
                        onChange={() => handleVolumeSelect(volume)}
                        className="mr-2" 
                      />
                      <span className="font-medium">{volume.id}</span>
                    </div>
                    <p className="text-sm text-gray-600">{volume.descricao}</p>
                    <p className="text-xs text-gray-500">NF: {volume.notaFiscal}</p>
                    {volume.etiquetaMae && (
                      <p className="text-xs text-gray-500">Etiqueta Mãe: {volume.etiquetaMae}</p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FoundVolumesCard;
