
import { toast } from '@/hooks/use-toast';
import { Volume } from '../../components/etiquetas/VolumesTable';
import { LayoutStyle } from '@/hooks/etiquetas/types';
import { useEtiquetaDatabase } from './useEtiquetaDatabase';
import { usePrintValidation } from './usePrintValidation';

/**
 * Hook for handling the complete print process
 * Follows Open/Closed Principle - can be extended without modification
 */
export const usePrintProcess = (
  volumes: Volume[],
  setVolumes: React.Dispatch<React.SetStateAction<Volume[]>>,
  printEtiquetas: any,
  reimprimirEtiquetas: any,
  handlePrintEtiquetas: any,
  handleReimprimirEtiquetas: any
) => {
  const { 
    saveVolumesToDatabase, 
    markVolumesAsLabeled, 
    checkExistingVolumes 
  } = useEtiquetaDatabase();
  
  const { 
    showExistingVolumesDialog, 
    getPendingVolume, 
    closeDialog 
  } = usePrintValidation();

  /**
   * Processes the actual printing after validation
   */
  const processPrintVolumes = async (
    volume: Volume, 
    notaFiscalData: any, 
    formatoImpressao: string, 
    layoutStyle: LayoutStyle
  ) => {
    try {
      // 1. Get all volumes for the nota fiscal
      const volumesNota = volumes.filter(vol => vol.notaFiscal === volume.notaFiscal);
      console.log(`📦 Processando ${volumesNota.length} volumes para NF ${volume.notaFiscal}`);

      // 2. Save volumes to database
      const { volumesSalvos, erros } = await saveVolumesToDatabase(volumesNota);
      
      if (erros.length > 0) {
        console.warn('⚠️ Alguns volumes tiveram erro ao gravar:', erros);
      }

      if (volumesSalvos > 0) {
        console.log(`✅ ${volumesSalvos} volumes gravados na base`);
      }

      // 3. Proceed with printing
      console.log('🖨️ Imprimindo com layout:', layoutStyle);
      
      const result = handlePrintEtiquetas(printEtiquetas)(
        volume, 
        volumes, 
        notaFiscalData, 
        formatoImpressao, 
        layoutStyle
      );
      
      if (result && typeof result.then === 'function') {
        result.then(async (res: any) => {
          if (res && res.status === 'success' && res.volumes) {
            // Update local state
            setVolumes(prevVolumes => 
              prevVolumes.map(vol => {
                const updatedVol = res.volumes!.find((v: Volume) => v.id === vol.id);
                return updatedVol || vol;
              })
            );
            
            // Mark volumes as labeled in database
            const { successfullyMarked, failedToMark } = await markVolumesAsLabeled(volumesNota);
            
            // Show success toast
            toast({
              title: "✅ Etiquetas Impressas com Sucesso",
              description: `${volumesNota.length} etiqueta(s) para NF ${volume.notaFiscal} foram impressas e gravadas.`,
            });
          }
        });
      }
      
    } catch (error) {
      console.error('💥 Erro no processo de impressão:', error);
      toast({
        title: "❌ Erro na Impressão",
        description: error instanceof Error ? error.message : "Erro inesperado durante a impressão",
        variant: "destructive",
      });
    }
  };

  /**
   * Handles the complete print flow with validation
   */
  const handlePrintEtiquetasWithValidation = async (
    volume: Volume,
    notaFiscalData: any,
    formatoImpressao: string,
    layoutStyle: LayoutStyle
  ) => {
    try {
      console.log('🖨️ Iniciando processo de impressão para volume:', volume.id);
      
      // 1. Check if volumes already exist for this nota fiscal
      const existingVolumes = await checkExistingVolumes(volume.notaFiscal);
      
      if (existingVolumes && existingVolumes.length > 0) {
        console.log(`⚠️ Encontrados ${existingVolumes.length} volumes existentes para NF ${volume.notaFiscal}`);
        showExistingVolumesDialog(volume, existingVolumes.length);
        return { needsConfirmation: true, volume, notaFiscalData, formatoImpressao, layoutStyle };
      }

      // 2. Proceed with normal printing
      await processPrintVolumes(volume, notaFiscalData, formatoImpressao, layoutStyle);
      return { needsConfirmation: false };
      
    } catch (error) {
      console.error('💥 Erro no processo de impressão:', error);
      toast({
        title: "❌ Erro na Impressão",
        description: error instanceof Error ? error.message : "Erro inesperado durante a impressão",
        variant: "destructive",
      });
      return { needsConfirmation: false };
    }
  };

  /**
   * Confirms printing when volumes already exist
   */
  const confirmPrintWithExistingVolumes = async (
    notaFiscalData: any,
    formatoImpressao: string,
    layoutStyle: LayoutStyle
  ) => {
    const pendingVolume = getPendingVolume();
    if (pendingVolume) {
      await processPrintVolumes(pendingVolume, notaFiscalData, formatoImpressao, layoutStyle);
      closeDialog();
    }
  };

  /**
   * Handles reprinting with database marking
   */
  const handleReimprimirEtiquetasWithMarking = async (
    volume: Volume,
    notaFiscalData: any,
    formatoImpressao: string,
    layoutStyle: LayoutStyle
  ) => {
    console.log('Reprinting with layout style:', layoutStyle);
    
    const volumesNota = volumes.filter(vol => vol.notaFiscal === volume.notaFiscal);
    const { successfullyMarked, failedToMark } = await markVolumesAsLabeled(volumesNota);
    
    handleReimprimirEtiquetas(reimprimirEtiquetas)(
      volume, 
      volumes, 
      notaFiscalData, 
      formatoImpressao, 
      layoutStyle
    );
    
    if (successfullyMarked.length > 0 && failedToMark.length === 0) {
      toast({
        title: "✅ Etiquetas Reimpressas e Marcadas",
        description: `${successfullyMarked.length} etiqueta(s) para NF ${volume.notaFiscal} foram reimpressas e marcadas como etiquetadas.`,
      });
    } else if (successfullyMarked.length > 0 && failedToMark.length > 0) {
      toast({
        title: "⚠️ Etiquetas Reimpressas com Problemas",
        description: `${successfullyMarked.length} etiquetas reimpressas, ${failedToMark.length} não puderam ser marcadas no banco.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "⚠️ Etiquetas Reimpressas",
        description: `Etiquetas para NF ${volume.notaFiscal} foram reimpressas, mas houve problemas ao marcar no banco.`,
        variant: "destructive",
      });
    }
  };

  return {
    handlePrintEtiquetasWithValidation,
    confirmPrintWithExistingVolumes,
    handleReimprimirEtiquetasWithMarking,
    processPrintVolumes
  };
};
