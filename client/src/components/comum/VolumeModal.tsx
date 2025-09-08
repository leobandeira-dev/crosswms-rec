import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Calculator, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VolumeData {
  volume: number;
  altura: string | number;
  largura: string | number;
  comprimento: string | number;
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
  notaInfo,
  initialVolumes = [],
  onSave
}) => {
  const { toast } = useToast();
  const [volumes, setVolumes] = useState<VolumeData[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Initialize volumes based on note quantity - only when modal first opens
  useEffect(() => {
    if (isOpen && notaInfo && !initialized) {
      if (initialVolumes.length > 0) {
        setVolumes(initialVolumes);
      } else {
        // Create empty volumes based on quantity
        const newVolumes = Array.from({ length: notaInfo.quantidadeVolumes }, (_, i) => ({
          volume: i + 1,
          altura: '',
          largura: '',
          comprimento: '',
          m3: 0
        }));
        setVolumes(newVolumes);
      }
      setInitialized(true);
    }
    // Reset volumes when modal closes
    if (!isOpen && initialized) {
      setVolumes([]);
      setInitialized(false);
    }
  }, [isOpen, notaInfo?.id, initialized]);

  // Calculate m3 for a volume
  const calculateM3 = (altura: number, largura: number, comprimento: number): number => {
    return altura * largura * comprimento;
  };

  // Update volume dimensions
  const updateVolume = (index: number, field: 'altura' | 'largura' | 'comprimento', value: string) => {
    setVolumes(prev => {
      const newVolumes = [...prev];
      const alturaNum = field === 'altura' ? (parseFloat(value) || 0) : (parseFloat(String(newVolumes[index].altura)) || 0);
      const larguraNum = field === 'largura' ? (parseFloat(value) || 0) : (parseFloat(String(newVolumes[index].largura)) || 0);
      const comprimentoNum = field === 'comprimento' ? (parseFloat(value) || 0) : (parseFloat(String(newVolumes[index].comprimento)) || 0);
      
      newVolumes[index] = {
        ...newVolumes[index],
        [field]: value, // Keep as string for input
        m3: calculateM3(alturaNum, larguraNum, comprimentoNum)
      };
      return newVolumes;
    });
  };

  // Calculate total m3
  const totalM3 = volumes.reduce((sum, volume) => sum + volume.m3, 0);

  // Validate and save
  const handleSave = () => {
    // Check if all volumes have dimensions
    const volumesWithDimensions = volumes.filter(v => 
      parseFloat(String(v.altura)) > 0 && 
      parseFloat(String(v.largura)) > 0 && 
      parseFloat(String(v.comprimento)) > 0
    );
    
    if (volumesWithDimensions.length === 0) {
      toast({
        title: "❌ Dimensões obrigatórias",
        description: "Informe as dimensões de pelo menos um volume"
      });
      return;
    }

    const volumeData: NotaVolumeData = {
      notaId: notaInfo.id,
      numeroNota: notaInfo.numero,
      volumes: volumes,
      totalM3: parseFloat(totalM3.toFixed(2)),
      pesoTotal: notaInfo.peso
    };

    onSave(volumeData);
    
    toast({
      title: "✅ Dimensões salvas",
      description: `Volumes da nota ${notaInfo.numero} atualizados`
    });
    
    onClose();
  };

  // Reset and close
  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Informar Dimensões dos Volumes - Nota {notaInfo.numero}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Note info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações da Nota Fiscal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Número</Label>
                  <p className="font-medium">{notaInfo.numero}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Peso Total</Label>
                  <p className="font-medium">{notaInfo.peso.toFixed(2)} kg</p>
                </div>
                <div>
                  <Label className="text-gray-600">Quantidade de Volumes</Label>
                  <p className="font-medium">{notaInfo.quantidadeVolumes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Volume dimensions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Dimensões por Volume</h3>
              <Badge variant="secondary">
                Total: {totalM3.toFixed(2)} m³
              </Badge>
            </div>

            <div className="grid gap-4">
              {volumes.map((volume, index) => (
                <Card key={volume.volume} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Volume {volume.volume}</span>
                      <Badge variant={volume.m3 > 0 ? "default" : "secondary"}>
                        {volume.m3.toFixed(2)} m³
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor={`altura-${index}`} className="text-sm">
                          Altura (m)
                        </Label>
                        <Input
                          id={`altura-${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={volume.altura || ''}
                          onChange={(e) => updateVolume(index, 'altura', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`largura-${index}`} className="text-sm">
                          Largura (m)
                        </Label>
                        <Input
                          id={`largura-${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={volume.largura || ''}
                          onChange={(e) => updateVolume(index, 'largura', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`comprimento-${index}`} className="text-sm">
                          Comprimento (m)
                        </Label>
                        <Input
                          id={`comprimento-${index}`}
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={volume.comprimento || ''}
                          onChange={(e) => updateVolume(index, 'comprimento', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="flex items-end">
                        <div className="w-full">
                          <Label className="text-sm text-gray-600">Volume (m³)</Label>
                          <div className="mt-1 p-2 bg-gray-50 rounded border text-center font-medium">
                            {volume.m3.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Calculator className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-900">Resumo das Dimensões</h4>
                  <p className="text-blue-700">
                    {volumes.filter(v => v.m3 > 0).length} de {volumes.length} volumes com dimensões informadas
                  </p>
                  <p className="text-lg font-bold text-blue-900">
                    Volume total: {totalM3.toFixed(2)} m³
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Dimensões
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VolumeModal;