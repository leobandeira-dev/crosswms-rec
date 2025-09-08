
import { usePDFGeneration } from './usePDFGeneration';
import { LayoutStyle } from './types';

export const useEtiquetaPDF = () => {
  const { generateEtiquetaPDF, generateEtiquetaMasterPDF } = usePDFGeneration();

  // Just forwarding the functions from usePDFGeneration
  // This hook exists to provide a cleaner API and separation of concerns
  return {
    generateEtiquetaPDF,
    generateEtiquetaMasterPDF
  };
};
