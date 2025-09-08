
import { toast } from '@/hooks/use-toast';
import { Volume } from '../../components/etiquetas/VolumesTable';

/**
 * Hook for managing volume classification
 */
export const useVolumeClassification = () => {
  // Function to save volume classification
  const handleSaveVolumeClassification = (
    classifyVolumeFn: any,
    setVolumesFn: React.Dispatch<React.SetStateAction<Volume[]>>,
    setGeneratedVolumesFn: React.Dispatch<React.SetStateAction<Volume[]>>
  ) => (volume: Volume, formData: any) => {
    // Update both states: volumes and generatedVolumes to ensure UI is consistent
    setVolumesFn(prevVolumes => classifyVolumeFn(volume, formData, prevVolumes));
    setGeneratedVolumesFn(prevVolumes => classifyVolumeFn(volume, formData, prevVolumes));
    
    toast({
      title: "Volume Classificado",
      description: `O volume ${volume.id} foi classificado como ${formData.tipoVolume === 'quimico' ? 'Produto Químico' : 'Carga Geral'}.`,
    });
  };

  return {
    handleSaveVolumeClassification
  };
};
