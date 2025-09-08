
import { toast } from '@/hooks/use-toast';
import { Volume } from '../../components/etiquetas/VolumesTable';

/**
 * Hook for managing volume generation
 */
export const useVolumeGeneration = () => {
  // Function to handle volume generation
  const handleGenerateVolumes = (
    generateVolumesFn: any,
    setVolumesFn: React.Dispatch<React.SetStateAction<Volume[]>>,
    setGeneratedVolumesFn: React.Dispatch<React.SetStateAction<Volume[]>>
  ) => (formData: any, notaFiscalData: any) => {
    const notaFiscal = formData.notaFiscal;
    const volumesTotal = parseInt(formData.volumesTotal, 10);
    const pesoTotalBruto = formData.pesoTotalBruto || notaFiscalData?.pesoTotal || '0,00 Kg';
    const tipoVolume = formData.tipoVolume as 'geral' | 'quimico';
    const codigoONU = formData.codigoONU || '';
    const codigoRisco = formData.codigoRisco || '';
    
    const newVolumes = generateVolumesFn(
      notaFiscal, 
      volumesTotal, 
      pesoTotalBruto, 
      notaFiscalData, 
      tipoVolume, 
      codigoONU, 
      codigoRisco
    );
    
    if (newVolumes.length > 0) {
      // Add to existing volumes
      setVolumesFn(prevVolumes => {
        // Remove any existing volumes for this nota fiscal
        const filteredVolumes = prevVolumes.filter(vol => vol.notaFiscal !== notaFiscal);
        // Add the new volumes
        return [...filteredVolumes, ...newVolumes];
      });
      
      setGeneratedVolumesFn(newVolumes);
      
      toast({
        title: "Volumes gerados",
        description: `${volumesTotal} volumes gerados para a nota fiscal ${notaFiscal}.`,
      });
    }
  };

  return {
    handleGenerateVolumes
  };
};
