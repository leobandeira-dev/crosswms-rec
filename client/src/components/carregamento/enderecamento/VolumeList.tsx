
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';

import { Volume, SearchType } from '@/types/enderecamento.types';

interface VolumeListProps {
  volumes: Volume[];
  selecionados: string[];
  onSelectionToggle: (id: string) => void;
  onSelectAll: () => void;
}

const VolumeList: React.FC<VolumeListProps> = ({ 
  volumes, 
  selecionados, 
  onSelectionToggle, 
  onSelectAll 
}) => {
  // Only show volumes that are not positioned
  const filteredVolumes = volumes.filter(v => !v.posicionado);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Package className="mr-2 text-cross-blue" size={20} />
          Volumes para Carregamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSelectAll}
          >
            {selecionados.length === filteredVolumes.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </Button>
          <span className="text-sm text-gray-500">
            {selecionados.length} volumes selecionados
          </span>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredVolumes.map(volume => (
            <div 
              key={volume.id}
              className={`p-3 border rounded-md cursor-pointer ${
                selecionados.includes(volume.id) ? 'bg-blue-50 border-cross-blue' : 'hover:bg-gray-50'
              } ${volume.fragil ? 'border-amber-200' : ''}`}
              onClick={() => onSelectionToggle(volume.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      checked={selecionados.includes(volume.id)} 
                      onChange={() => onSelectionToggle(volume.id)}
                      className="mr-2" 
                    />
                    <span className="font-medium">{volume.id}</span>
                    {volume.fragil && (
                      <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Frágil</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{volume.descricao}</p>
                  <p className="text-xs text-gray-500">Peso: {volume.peso}</p>
                  <div className="mt-1 text-xs flex flex-col">
                    <span className="text-gray-600">Etiqueta: {volume.etiquetaMae}</span>
                    <span className="text-gray-600">NF: {volume.notaFiscal}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredVolumes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Não há volumes disponíveis para carregamento.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VolumeList;
