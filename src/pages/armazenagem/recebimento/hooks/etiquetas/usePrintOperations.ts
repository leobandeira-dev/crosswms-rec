
import { toast } from '@/hooks/use-toast';
import { Volume } from '../../components/etiquetas/VolumesTable';
import { LayoutStyle } from '@/hooks/etiquetas/types';

/**
 * Hook for managing print operations
 */
export const usePrintOperations = () => {
  // Function to handle printing etiquetas
  const handlePrintEtiquetas = (printEtiquetasFn: any) => (volume: Volume, volumes: Volume[], notaFiscalData: any, formatoImpressao: string, layoutStyle: LayoutStyle) => {
    // Generate etiquetas for the selected volume
    const result = printEtiquetasFn(volume, volumes, notaFiscalData, formatoImpressao, layoutStyle);
    
    return result;
  };

  // Function to handle reprinting etiquetas
  const handleReimprimirEtiquetas = (reimprimirEtiquetasFn: any) => (volume: Volume, volumes: Volume[], notaFiscalData: any, formatoImpressao: string, layoutStyle: LayoutStyle) => {
    reimprimirEtiquetasFn(volume, volumes, notaFiscalData, formatoImpressao, layoutStyle);
  };
  
  // Function to handle printing master etiqueta
  const handlePrintEtiquetaMae = (printEtiquetaMaeFn: any) => (etiquetaMae: any, volumes: Volume[], formatoImpressao: string, layoutStyle: LayoutStyle) => {
    printEtiquetaMaeFn(etiquetaMae, volumes, formatoImpressao, layoutStyle);
  };

  return {
    handlePrintEtiquetas,
    handleReimprimirEtiquetas,
    handlePrintEtiquetaMae
  };
};
