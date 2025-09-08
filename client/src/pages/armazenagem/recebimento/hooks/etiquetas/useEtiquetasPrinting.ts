
import { Volume } from '../../components/etiquetas/VolumesTable';
import { LayoutStyle } from '@/hooks/etiquetas/types';
import { useEtiquetaCreation } from './useEtiquetaCreation';
import { useEtiquetaPrint } from './useEtiquetaPrint';
import { useEtiquetaUtils } from './useEtiquetaUtils';

/**
 * Hook for handling etiquetas printing operations
 * Composes multiple smaller hooks to provide a unified API
 */
export const useEtiquetasPrinting = () => {
  const { createEtiquetaMae } = useEtiquetaCreation();
  const { isGenerating, printEtiquetas, reimprimirEtiquetas, printEtiquetaMae, createAndPrintEtiquetaMae } = useEtiquetaPrint();
  const { calculateTotalPeso } = useEtiquetaUtils();

  return {
    isGenerating,
    printEtiquetas,
    reimprimirEtiquetas,
    printEtiquetaMae,
    createEtiquetaMae,
    createAndPrintEtiquetaMae,
    calculateTotalPeso
  };
};
