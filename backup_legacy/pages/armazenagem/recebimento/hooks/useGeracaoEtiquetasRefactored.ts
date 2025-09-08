
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { LayoutStyle } from '@/hooks/etiquetas/types';
import { Volume } from '../components/etiquetas/VolumesTable';

// Import refactored hooks
import { useVolumeState } from './etiquetas/useVolumeState';
import { useEtiquetaMaeState } from './etiquetas/useEtiquetaMaeState';
import { usePrintOperations } from './etiquetas/usePrintOperations';
import { useVolumeClassification } from './etiquetas/useVolumeClassification';
import { useVolumeGeneration } from './etiquetas/useVolumeGeneration';
import { useVolumeActions } from './etiquetas/useVolumeActions';
import { useEtiquetasPrinting } from './etiquetas/useEtiquetasPrinting';
import { useDialogState } from './etiquetas/useDialogState';
import { usePrintValidation } from './etiquetas/usePrintValidation';
import { usePrintProcess } from './etiquetas/usePrintProcess';
import { useEtiquetaMaeProcess } from './etiquetas/useEtiquetaMaeProcess';

/**
 * Main hook for etiquetas generation - refactored for better maintainability
 * Follows Dependency Inversion Principle - depends on abstractions, not concretions
 * Follows Interface Segregation Principle - clients depend only on methods they use
 */
export const useGeracaoEtiquetasRefactored = () => {
  const location = useLocation();
  const notaFiscalData = location.state || {};
  
  // State management hooks
  const { volumes, generatedVolumes, setVolumes, setGeneratedVolumes } = useVolumeState();
  const { 
    tipoEtiqueta, 
    etiquetasMae, 
    setTipoEtiqueta, 
    setEtiquetasMae, 
    handleCreateEtiquetaMae, 
    handleVincularVolumes 
  } = useEtiquetaMaeState();
  
  // Dialog management
  const {
    classifyDialogOpen,
    selectedVolume,
    setClassifyDialogOpen,
    openClassifyDialog
  } = useDialogState();
  
  const {
    volumeExistsDialogOpen,
    pendingPrintVolume,
    existingVolumesCount,
    setVolumeExistsDialogOpen
  } = usePrintValidation();
  
  // Business logic hooks
  const { generateVolumes, classifyVolume, vincularVolumes } = useVolumeActions();
  const {
    isGenerating,
    printEtiquetas,
    reimprimirEtiquetas,
    printEtiquetaMae,
    createEtiquetaMae
  } = useEtiquetasPrinting();
  
  // Operation hooks
  const { handlePrintEtiquetas, handleReimprimirEtiquetas, handlePrintEtiquetaMae } = usePrintOperations();
  const { handleSaveVolumeClassification } = useVolumeClassification();
  const { handleGenerateVolumes: generateVolumesHandler } = useVolumeGeneration();
  
  // Process hooks
  const {
    handlePrintEtiquetasWithValidation,
    confirmPrintWithExistingVolumes,
    handleReimprimirEtiquetasWithMarking
  } = usePrintProcess(
    volumes,
    setVolumes,
    printEtiquetas,
    reimprimirEtiquetas,
    handlePrintEtiquetas,
    handleReimprimirEtiquetas
  );
  
  const { handlePrintEtiquetaMaeWithMarking } = useEtiquetaMaeProcess(
    printEtiquetaMae,
    handlePrintEtiquetaMae
  );
  
  // Form management
  const form = useForm({
    defaultValues: {
      notaFiscal: '',
      tipoEtiqueta: 'volume',
      volumesTotal: '',
      formatoImpressao: '50x100',
      layoutStyle: 'enhanced' as LayoutStyle,
      tipoVolume: 'geral',
      codigoONU: '',
      codigoRisco: '',
      etiquetaMaeId: '',
      tipoEtiquetaMae: 'geral',
      descricaoEtiquetaMae: '',
      pesoTotalBruto: ''
    }
  });

  // Main operations
  const handleGenerateVolumesImpl = () => {
    return generateVolumesHandler(generateVolumes, setVolumes, setGeneratedVolumes)(form.getValues(), notaFiscalData);
  };

  const handlePrintEtiquetasImpl = async (volume: Volume) => {
    const currentFormValues = form.getValues();
    const formatoImpressao = currentFormValues.formatoImpressao;
    const layoutStyle = currentFormValues.layoutStyle as LayoutStyle;
    
    return await handlePrintEtiquetasWithValidation(
      volume,
      notaFiscalData,
      formatoImpressao,
      layoutStyle
    );
  };

  const handleReimprimirEtiquetasImpl = async (volume: Volume) => {
    const currentFormValues = form.getValues();
    const formatoImpressao = currentFormValues.formatoImpressao;
    const layoutStyle = currentFormValues.layoutStyle as LayoutStyle;
    
    await handleReimprimirEtiquetasWithMarking(
      volume,
      notaFiscalData,
      formatoImpressao,
      layoutStyle
    );
  };

  const handleCreateEtiquetaMaeImpl = () => {
    const etiquetaMae = handleCreateEtiquetaMae(createEtiquetaMae)(form.getValues());
    form.setValue('descricaoEtiquetaMae', '');
    return etiquetaMae;
  };

  const handlePrintEtiquetaMaeImpl = async (etiquetaMae: any) => {
    const currentFormValues = form.getValues();
    const formatoImpressao = currentFormValues.formatoImpressao;
    const layoutStyle = currentFormValues.layoutStyle as LayoutStyle;
    
    await handlePrintEtiquetaMaeWithMarking(
      etiquetaMae,
      volumes,
      formatoImpressao,
      layoutStyle
    );
  };

  const handleClassifyVolume = (volume: Volume) => {
    openClassifyDialog(volume);
  };

  const handleSaveVolumeClassificationImpl = (volume: Volume, formData: any) => {
    handleSaveVolumeClassification(classifyVolume, setVolumes, setGeneratedVolumes)(volume, formData);
  };

  const handleVincularVolumesImpl = (etiquetaMaeId: string, volumeIds: string[]) => {
    setVolumes(handleVincularVolumes(vincularVolumes)(etiquetaMaeId, volumeIds, volumes));
  };

  const handleConfirmPrintWithExistingVolumesImpl = async () => {
    const currentFormValues = form.getValues();
    const formatoImpressao = currentFormValues.formatoImpressao;
    const layoutStyle = currentFormValues.layoutStyle as LayoutStyle;
    
    await confirmPrintWithExistingVolumes(notaFiscalData, formatoImpressao, layoutStyle);
  };

  return {
    // Form and data
    form,
    notaFiscalData,
    
    // State
    tipoEtiqueta,
    generatedVolumes,
    volumes,
    etiquetasMae,
    
    // Dialog state
    classifyDialogOpen,
    selectedVolume,
    volumeExistsDialogOpen,
    pendingPrintVolume,
    existingVolumesCount,
    
    // Loading state
    isGenerating,
    
    // State setters
    setTipoEtiqueta,
    setVolumes,
    setGeneratedVolumes,
    setEtiquetasMae,
    setClassifyDialogOpen,
    setVolumeExistsDialogOpen,
    
    // Operations
    handleGenerateVolumes: handleGenerateVolumesImpl,
    handlePrintEtiquetas: handlePrintEtiquetasImpl,
    handleReimprimirEtiquetas: handleReimprimirEtiquetasImpl,
    handlePrintEtiquetaMae: handlePrintEtiquetaMaeImpl,
    handleCreateEtiquetaMae: handleCreateEtiquetaMaeImpl,
    handleClassifyVolume,
    handleSaveVolumeClassification: handleSaveVolumeClassificationImpl,
    handleVincularVolumes: handleVincularVolumesImpl,
    handleConfirmPrintWithExistingVolumes: handleConfirmPrintWithExistingVolumesImpl
  };
};
