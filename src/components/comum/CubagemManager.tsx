import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Box, Calculator, Edit, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FormFieldHelp } from '@/components/ui/contextual-help';

export interface VolumeData {
  volume: number;
  altura: number;
  largura: number;
  comprimento: number;
  m3: number;
}

export interface NotaVolumeData {
  notaId: string;
  numeroNota: string;
  volumes: VolumeData[];
  totalM3: number;
  pesoTotal: number;
}

interface CubagemManagerProps {
  open: boolean;
  onClose: () => void;
  onSave: (volumeData: NotaVolumeData) => void;
  notaInfo: {
    id: string;
    numero: string;
    peso: number;
    quantidadeVolumes?: number;
  } | null;
  existingVolumes?: VolumeData[];
}

const CubagemManager: React.FC<CubagemManagerProps> = ({
  open,
  onClose,
  onSave,
  notaInfo,
  existingVolumes = []
}) => {
  const [volumes, setVolumes] = useState<VolumeData[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    if (open && notaInfo) {
      if (existingVolumes.length > 0) {
        setVolumes(existingVolumes);
      } else {
        // Initialize volumes based on quantidade_volumes
        const quantidadeVolumes = notaInfo.quantidadeVolumes || 1;
        const initialVolumes: VolumeData[] = [];
        
        for (let i = 1; i <= quantidadeVolumes; i++) {
          initialVolumes.push({
            volume: i,
            altura: 0,
            largura: 0,
            comprimento: 0,
            m3: 0
          });
        }
        
        setVolumes(initialVolumes);
      }
    }
  }, [open, notaInfo, existingVolumes]);

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

  const handleAddVolume = () => {
    const newVolume: VolumeData = {
      volume: volumes.length + 1,
      altura: 0,
      largura: 0,
      comprimento: 0,
      m3: 0
    };
    setVolumes([...volumes, newVolume]);
    
    toast({
      title: "Volume Adicionado",
      description: `Novo volume ${volumes.length + 1} adicionado. Total: ${volumes.length + 1} volumes`,
    });
  };

  const handleRemoveVolume = (index: number) => {
    if (volumes.length === 1) {
      toast({
        title: "Atenção",
        description: "É necessário manter pelo menos 1 volume",
        variant: "destructive"
      });
      return;
    }
    
    const updatedVolumes = volumes.filter((_, i) => i !== index);
    // Renumber volumes
    updatedVolumes.forEach((vol, i) => {
      vol.volume = i + 1;
    });
    setVolumes(updatedVolumes);
    
    toast({
      title: "Volume Removido",
      description: `Volume ${index + 1} removido. Total: ${updatedVolumes.length} volumes`,
    });
  };

  const handleSaveCubagem = () => {
    if (!notaInfo) return;
    
    const totalM3 = volumes.reduce((sum, vol) => sum + vol.m3, 0);
    const pesoTotal = notaInfo.peso || 0;
    
    const notaVolumeData: NotaVolumeData = {
      notaId: notaInfo.id,
      numeroNota: notaInfo.numero,
      volumes: volumes,
      totalM3: totalM3,
      pesoTotal: pesoTotal
    };

    onSave(notaVolumeData);

    toast({
      title: "Cubagem Salva",
      description: `Volumes da NF ${notaInfo.numero} cadastrados com sucesso. Total: ${totalM3.toFixed(2)} m³`,
    });

    onClose();
  };

  const totalM3 = volumes.reduce((sum, vol) => sum + vol.m3, 0);
  const isValid = volumes.every(vol => vol.altura > 0 && vol.largura > 0 && vol.comprimento > 0);

  if (!notaInfo) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Atualizar Cubagem - NF {notaInfo.numero}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">NFe: {notaInfo.numero}</h4>
                  <div className="text-sm text-gray-600">
                    Volumes: {volumes.length} | Peso: {notaInfo.peso.toFixed(2)} kg
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">Total m³</div>
                  <div className="text-lg font-bold text-blue-600">
                    {totalM3.toFixed(2)} m³
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Volumes</h3>
            <Button
              onClick={handleAddVolume}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Volume
            </Button>
          </div>

          <div className="space-y-3">
            {volumes.map((volume, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Volume {volume.volume}</h4>
                    {volumes.length > 1 && (
                      <Button
                        onClick={() => handleRemoveVolume(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor={`altura-${index}`}>Altura (m)</Label>
                        <FormFieldHelp
                          fieldName="Altura"
                          description="Medida vertical do volume em metros, considerando a maior dimensão vertical da embalagem."
                          examples={[
                            "0.50 (50 centímetros)",
                            "1.20 (1 metro e 20 centímetros)",
                            "2.80 (altura de pallet)"
                          ]}
                          tips={[
                            "Use ponto decimal (ex: 1.50)",
                            "Considere altura total incluindo embalagem",
                            "Meça sempre a maior dimensão vertical"
                          ]}
                          variant="popover"
                        />
                      </div>
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
                      <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor={`largura-${index}`}>Largura (m)</Label>
                        <FormFieldHelp
                          fieldName="Largura"
                          description="Medida horizontal do volume em metros, considerando a dimensão transversal da embalagem."
                          examples={[
                            "0.40 (40 centímetros)",
                            "1.00 (1 metro)",
                            "1.20 (largura padrão de pallet)"
                          ]}
                          tips={[
                            "Use ponto decimal (ex: 0.80)",
                            "Meça a dimensão lateral da embalagem",
                            "Para pallets, considere largura total"
                          ]}
                          variant="popover"
                        />
                      </div>
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
                      <div className="flex items-center gap-2 mb-1">
                        <Label htmlFor={`comprimento-${index}`}>Comprimento (m)</Label>
                        <FormFieldHelp
                          fieldName="Comprimento"
                          description="Medida longitudinal do volume em metros, considerando a maior dimensão horizontal da embalagem."
                          examples={[
                            "0.60 (60 centímetros)",
                            "1.50 (1 metro e 50 centímetros)",
                            "1.80 (comprimento de pallet)"
                          ]}
                          tips={[
                            "Use ponto decimal (ex: 1.25)",
                            "Meça sempre a maior dimensão horizontal",
                            "Para pallets padrão, use 1.20m x 1.00m"
                          ]}
                          variant="popover"
                        />
                      </div>
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
                  </div>

                  <div className="bg-blue-50 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        Cálculo: {volume.altura} × {volume.largura} × {volume.comprimento} = {volume.m3.toFixed(2)} m³
                      </div>
                      <div className="text-lg font-semibold text-blue-600">
                        {volume.m3.toFixed(2)} m³
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">Total da Nota Fiscal</h4>
                  <div className="text-sm text-gray-600">
                    {volumes.length} volumes • Peso: {notaInfo.peso.toFixed(2)} kg
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

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveCubagem} 
              disabled={!isValid}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Box className="h-4 w-4 mr-2" />
              Salvar Cubagem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CubagemManager;