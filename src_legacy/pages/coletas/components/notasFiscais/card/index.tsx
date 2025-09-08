
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PackageOpen } from 'lucide-react';
import { NotaFiscalVolume, VolumeItem, generateVolumeId, calcularVolume } from '../../../utils/volumes/index';
import NotaFiscalHeader from './NotaFiscalHeader';
import VolumesList from './VolumesList';
import AddVolumeForm from './AddVolumeForm';

interface NotaFiscalCardProps {
  index: number;
  nf: NotaFiscalVolume;
  onRemove: () => void;
  onUpdateNumeroNF: (numeroNF: string) => void;
  onUpdateRemetente: (remetente: string) => void;
  onUpdateDestinatario: (destinatario: string) => void;
  onUpdateValorTotal: (valorTotal: string) => void;
  onUpdateVolumes: (volumes: VolumeItem[]) => void;
  onUpdatePesoTotal: (pesoTotal: string) => void;
  isReadOnly?: boolean;
}

const NotaFiscalCard: React.FC<NotaFiscalCardProps> = ({
  index,
  nf,
  onRemove,
  onUpdateNumeroNF,
  onUpdateRemetente,
  onUpdateDestinatario,
  onUpdateValorTotal,
  onUpdateVolumes,
  onUpdatePesoTotal,
  isReadOnly = false
}) => {
  const handleUpdateVolume = (volumeId: string, field: keyof VolumeItem, value: string) => {
    const updatedVolumes = nf.volumes.map(v => {
      if (v.id === volumeId) {
        const updatedVolume = {
          ...v,
          [field]: parseFloat(value) || 0
        };
        
        // Recalculate cubic volume if needed
        if (['altura', 'largura', 'comprimento', 'quantidade'].includes(field)) {
          updatedVolume.cubicVolume = calcularVolume(updatedVolume);
        }
        
        return updatedVolume;
      }
      return v;
    });
    
    onUpdateVolumes(updatedVolumes);
  };

  const handleRemoveVolume = (volumeId: string) => {
    const updatedVolumes = nf.volumes.filter(v => v.id !== volumeId);
    onUpdateVolumes(updatedVolumes);
  };

  const handleAddVolume = (volume: Omit<VolumeItem, 'id'>) => {
    const newVolume: VolumeItem = {
      ...volume,
      id: generateVolumeId(),
      // Calculate cubic volume for the new volume
      cubicVolume: calcularVolume({
        ...volume,
        id: 'temp-id' // Temporary ID for calculation purposes only
      })
    };
    
    onUpdateVolumes([...nf.volumes, newVolume]);
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <NotaFiscalHeader
          nf={nf}
          onRemove={onRemove}
          onUpdateNumeroNF={onUpdateNumeroNF}
          onUpdateRemetente={onUpdateRemetente}
          onUpdateDestinatario={onUpdateDestinatario}
          onUpdateValorTotal={onUpdateValorTotal}
          onUpdatePesoTotal={onUpdatePesoTotal}
          isReadOnly={isReadOnly}
        />
      </CardHeader>
      <CardContent>
        <h4 className="text-sm font-medium mb-2 flex items-center">
          <PackageOpen className="h-4 w-4 mr-1 text-cross-blue" /> Volumes
        </h4>
        
        {/* Volumes list */}
        <div className="bg-gray-50 p-3 rounded-md mb-4">
          <VolumesList
            volumes={nf.volumes}
            isReadOnly={isReadOnly}
            onUpdateVolume={handleUpdateVolume}
            onRemoveVolume={handleRemoveVolume}
            pesoTotal={nf.pesoTotal}
          />
        </div>
        
        {/* Add volume form */}
        <AddVolumeForm
          onAddVolume={handleAddVolume}
          isReadOnly={isReadOnly}
        />
      </CardContent>
    </Card>
  );
};

export default NotaFiscalCard;
