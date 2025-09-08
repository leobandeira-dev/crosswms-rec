import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, Plus, Trash2 } from 'lucide-react';

interface VolumeData {
  volume: number;
  altura: number;
  largura: number;
  comprimento: number;
  m3: number;
}

interface NotaVolumeData {
  notaId: string;
  numeroNota: string;
  volumes: VolumeData[];
  totalM3: number;
  pesoTotal: number;
}

interface VolumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  notaInfo: {
    id: string;
    numero: string;
    peso: number;
    quantidadeVolumes: number;
  };
  initialVolumes?: VolumeData[];
  onSave: (volumeData: NotaVolumeData) => void;
}

const VolumeModal: React.FC<VolumeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  notaInfo,
  initialVolumes = []
}) => {
  const [volumes, setVolumes] = useState<VolumeData[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialVolumes.length > 0) {
        setVolumes(initialVolumes);
      } else {
        // Initialize with correct number of volumes based on NFe data
        const volumeCount = notaInfo.quantidadeVolumes || 1;
        const initialVolumeData = Array.from({ length: volumeCount }, (_, index) => ({
          volume: index + 1,
          altura: 0,
          largura: 0,
          comprimento: 0,
          m3: 0
        }));
        setVolumes(initialVolumeData);
      }
    }
  }, [isOpen, initialVolumes, notaInfo.quantidadeVolumes]);

  const handleVolumeChange = (index: number, field: keyof VolumeData, value: number) => {
    const updatedVolumes = [...volumes];
    updatedVolumes[index] = { ...updatedVolumes[index], [field]: value };
    
    // Calculate m3 for this volume (direct calculation as inputs are in meters)
    if (field === 'altura' || field === 'largura' || field === 'comprimento') {
      const volume = updatedVolumes[index];
      volume.m3 = parseFloat((volume.altura * volume.largura * volume.comprimento).toFixed(2));
    }
    
    setVolumes(updatedVolumes);
  };

  const addVolume = () => {
    const newVolumeNumber = volumes.length + 1;
    setVolumes([...volumes, {
      volume: newVolumeNumber,
      altura: 0,
      largura: 0,
      comprimento: 0,
      m3: 0
    }]);
  };

  const removeVolume = (index: number) => {
    if (volumes.length > 1) {
      const updatedVolumes = volumes.filter((_, i) => i !== index);
      // Renumber volumes
      const renumberedVolumes = updatedVolumes.map((vol, i) => ({
        ...vol,
        volume: i + 1
      }));
      setVolumes(renumberedVolumes);
    }
  };

  const handleSave = () => {
    // Validate that all dimensions are filled
    const allFilled = volumes.every(vol => vol.altura > 0 && vol.largura > 0 && vol.comprimento > 0);
    
    if (!allFilled) {
      alert('Por favor, preencha todas as dimensões dos volumes (altura, largura e comprimento).');
      return;
    }

    // Create complete NotaVolumeData object
    const notaVolumeData: NotaVolumeData = {
      notaId: notaInfo.id,
      numeroNota: notaInfo.numero,
      volumes: volumes,
      totalM3: totalM3,
      pesoTotal: notaInfo.peso
    };

    onSave(notaVolumeData);
    onClose();
  };

  const totalM3 = volumes.reduce((sum, vol) => sum + vol.m3, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-y-auto w-full mx-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Gerenciar Dimensões - Nota {notaInfo.numero}
          </h2>
          <p className="text-gray-600">
            Informe as dimensões de cada volume em metros
          </p>
        </div>

        <div className="space-y-6">
          {volumes.map((volume, index) => (
            <Card key={volume.volume} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Volume {volume.volume}</span>
                  {volumes.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVolume(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 items-end">
                  <div>
                    <Label htmlFor={`altura-${index}`}>Altura (m)</Label>
                    <Input
                      id={`altura-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={volume.altura || ''}
                      onChange={(e) => handleVolumeChange(index, 'altura', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`largura-${index}`}>Largura (m)</Label>
                    <Input
                      id={`largura-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={volume.largura || ''}
                      onChange={(e) => handleVolumeChange(index, 'largura', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`comprimento-${index}`}>Comprimento (m)</Label>
                    <Input
                      id={`comprimento-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={volume.comprimento || ''}
                      onChange={(e) => handleVolumeChange(index, 'comprimento', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label>Cubagem (m³)</Label>
                    <div className="h-10 flex items-center px-3 border rounded-md bg-gray-50">
                      <span className="text-sm font-medium">
                        {volume.m3.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 text-sm text-gray-600">
                  Cálculo: {volume.altura} × {volume.largura} × {volume.comprimento} = {volume.m3.toFixed(2)} m³
                </div>
              </CardContent>
            </Card>
          ))}
          
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={addVolume}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Volume
            </Button>
            
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Total da Nota Fiscal</h4>
                    <div className="text-sm text-gray-600">
                      {volumes.length} volumes
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {totalM3.toFixed(2)} m³
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={volumes.some(vol => vol.altura === 0 || vol.largura === 0 || vol.comprimento === 0)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Box className="h-4 w-4 mr-2" />
              Salvar Cubagem
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolumeModal;