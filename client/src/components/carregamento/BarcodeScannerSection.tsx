
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Package } from 'lucide-react';
import { OrdemCarregamento } from '@/hooks/carregamento/types';

export interface BarcodeScannerSectionProps {
  codigoVolume: string;
  setCodigoVolume: (codigo: string) => void;
  codigoNF: string;
  setCodigoNF: (codigo: string) => void;
  onScanVolume: (codigo: string) => void;
  onScanNF: (codigo: string) => void;
  ordemSelecionada: OrdemCarregamento;
}

const BarcodeScannerSection: React.FC<BarcodeScannerSectionProps> = ({
  codigoVolume,
  setCodigoVolume,
  codigoNF,
  setCodigoNF,
  onScanVolume,
  onScanNF,
  ordemSelecionada
}) => {
  const handleScanVolume = () => {
    if (codigoVolume.trim()) {
      onScanVolume(codigoVolume);
    }
  };

  const handleScanNF = () => {
    if (codigoNF.trim()) {
      onScanNF(codigoNF);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <QrCode className="mr-2 text-cross-blue" size={20} />
          Leitura de Códigos de Barras
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="codigoVolume">Código do Volume</Label>
              <div className="flex gap-2">
                <Input
                  id="codigoVolume"
                  placeholder="Escaneie ou digite o código do volume"
                  value={codigoVolume}
                  onChange={(e) => setCodigoVolume(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleScanVolume()}
                />
                <Button 
                  onClick={handleScanVolume}
                  disabled={!codigoVolume.trim()}
                  className="bg-cross-blue hover:bg-cross-blue/90"
                >
                  <Package className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="codigoNF">Código da Nota Fiscal</Label>
              <div className="flex gap-2">
                <Input
                  id="codigoNF"
                  placeholder="Escaneie ou digite o código da NF"
                  value={codigoNF}
                  onChange={(e) => setCodigoNF(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleScanNF()}
                />
                <Button 
                  onClick={handleScanNF}
                  disabled={!codigoNF.trim()}
                  className="bg-cross-blue hover:bg-cross-blue/90"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 border rounded-lg bg-blue-50">
          <p className="text-sm text-gray-600">
            <strong>Ordem selecionada:</strong> {ordemSelecionada.id} - {ordemSelecionada.cliente}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BarcodeScannerSection;
