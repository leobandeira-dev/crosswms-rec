
import { toast } from '@/hooks/use-toast';
import { Volume } from '../../components/etiquetas/VolumesTable';

export const useBatchAreaClassification = () => {
  const handleBatchClassifyArea = (
    area: string,
    setVolumesFn: React.Dispatch<React.SetStateAction<Volume[]>>,
    setGeneratedVolumesFn: React.Dispatch<React.SetStateAction<Volume[]>>
  ) => {
    if (!area) {
      toast({
        title: "Erro",
        description: "Selecione uma área antes de classificar.",
        variant: "destructive"
      });
      return;
    }

    // Update both volumes and generatedVolumes
    const updateVolumes = (volumes: Volume[]) => 
      volumes.map(volume => ({
        ...volume,
        area: area
      }));

    setVolumesFn(updateVolumes);
    setGeneratedVolumesFn(updateVolumes);

    toast({
      title: "Volumes Classificados",
      description: `Todos os volumes foram classificados para a Área ${area}.`,
    });
  };

  return {
    handleBatchClassifyArea
  };
};
