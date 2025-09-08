
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Box, Package } from 'lucide-react';
import NotaFiscalForm from './NotaFiscalForm';

// Interface for volume data
interface VolumeData {
  volume: number;
  altura: number;
  largura: number;
  comprimento: number;
  m3: number;
}

interface CadastroNotaProps {
  onVolumeDataUpdate?: (volumeData: any) => void;
  onNotaProcessed?: (nota: any) => void;
}

const CadastroNota: React.FC<CadastroNotaProps> = ({ onVolumeDataUpdate, onNotaProcessed }) => {
  const [cubagemModalOpen, setCubagemModalOpen] = useState(false);
  const [volumes, setVolumes] = useState<VolumeData[]>([]);
  const [currentNotaInfo, setCurrentNotaInfo] = useState<any>(null);
  const { toast } = useToast();

  console.log('=== CadastroNota - Props recebidas ===');
  console.log('onNotaProcessed callback existe:', !!onNotaProcessed);

  const handleNotaProcessed = (nota: any) => {
    console.log('=== CadastroNota - handleNotaProcessed chamado ===');
    console.log('Nota recebida:', nota);
    
    if (onNotaProcessed) {
      console.log('Chamando callback onNotaProcessed do pai');
      onNotaProcessed(nota);
    } else {
      console.log('ERRO: onNotaProcessed callback não existe!');
    }
  };

  const handleInformarCubagem = (notaInfo: any) => {
    setCurrentNotaInfo(notaInfo);
    
    // Initialize volumes based on quantidade_volumes
    const quantidadeVolumes = parseInt(notaInfo.quantidadeVolumes) || 1;
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
    setCubagemModalOpen(true);
  };

  const handleVolumeChange = (index: number, field: keyof VolumeData, value: number) => {
    const updatedVolumes = [...volumes];
    updatedVolumes[index] = { ...updatedVolumes[index], [field]: value };
    
    // Calculate m3 for this volume
    if (field === 'altura' || field === 'largura' || field === 'comprimento') {
      const volume = updatedVolumes[index];
      // Convert cm to m and calculate volume in m³
      const alturaM = volume.altura / 100;
      const larguraM = volume.largura / 100;
      const comprimentoM = volume.comprimento / 100;
      volume.m3 = parseFloat((alturaM * larguraM * comprimentoM).toFixed(2));
    }
    
    setVolumes(updatedVolumes);
  };

  const handleSaveCubagem = () => {
    if (!currentNotaInfo) return;
    
    const totalM3 = volumes.reduce((sum, vol) => sum + vol.m3, 0);
    const pesoTotal = parseFloat(currentNotaInfo.pesoBruto) || 0;
    
    const volumeData = {
      notaId: `temp-${Date.now()}`,
      numeroNota: currentNotaInfo.numeroNF,
      volumes: volumes,
      totalM3: totalM3,
      pesoTotal: pesoTotal
    };

    // Call parent callback to update volume data
    if (onVolumeDataUpdate) {
      onVolumeDataUpdate(volumeData);
    }

    toast({
      title: "Cubagem Informada",
      description: `Volumes da NF ${currentNotaInfo.numeroNF} cadastrados com sucesso. Total: ${totalM3.toFixed(2)} m³`,
    });

    setCubagemModalOpen(false);
    setCurrentNotaInfo(null);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <FileText className="mr-2 text-cross-blue" size={20} />
            Cadastro de Nota Fiscal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotaFiscalForm 
            onInformarCubagem={handleInformarCubagem} 
            onNotaProcessed={handleNotaProcessed}
          />
        </CardContent>
      </Card>

      {/* Cubagem Modal */}
      <Dialog open={cubagemModalOpen} onOpenChange={setCubagemModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              Informar Cubagem - NF {currentNotaInfo?.numeroNF}
            </DialogTitle>
            <DialogDescription>
              Informe as dimensões de cada volume. As medidas devem ser em centímetros (cm).
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {volumes.map((volume, index) => (
              <Card key={volume.volume} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Volume {volume.volume}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 items-end">
                    <div>
                      <Label htmlFor={`altura-${index}`}>Altura (cm)</Label>
                      <Input
                        id={`altura-${index}`}
                        type="number"
                        min="0"
                        step="0.1"
                        value={volume.altura || ''}
                        onChange={(e) => handleVolumeChange(index, 'altura', parseFloat(e.target.value) || 0)}
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`largura-${index}`}>Largura (cm)</Label>
                      <Input
                        id={`largura-${index}`}
                        type="number"
                        min="0"
                        step="0.1"
                        value={volume.largura || ''}
                        onChange={(e) => handleVolumeChange(index, 'largura', parseFloat(e.target.value) || 0)}
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`comprimento-${index}`}>Comprimento (cm)</Label>
                      <Input
                        id={`comprimento-${index}`}
                        type="number"
                        min="0"
                        step="0.1"
                        value={volume.comprimento || ''}
                        onChange={(e) => handleVolumeChange(index, 'comprimento', parseFloat(e.target.value) || 0)}
                        placeholder="0.0"
                      />
                    </div>
                    <div>
                      <Label>Volume (m³)</Label>
                      <div className="text-lg font-semibold text-blue-600 py-2">
                        {volume.m3.toFixed(6)} m³
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600">
                    Cálculo: {volume.altura} × {volume.largura} × {volume.comprimento} = {(volume.altura * volume.largura * volume.comprimento).toLocaleString()} cm³
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">Total da Nota Fiscal</h4>
                    <div className="text-sm text-gray-600">
                      {volumes.length} volumes • Peso: {currentNotaInfo?.pesoBruto || '0.00'} kg
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {volumes.reduce((sum, vol) => sum + vol.m3, 0).toFixed(2)} m³
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCubagemModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveCubagem} disabled={volumes.some(vol => vol.altura === 0 || vol.largura === 0 || vol.comprimento === 0)}>
                <Box className="h-4 w-4 mr-2" />
                Salvar Cubagem
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CadastroNota;
