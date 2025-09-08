
import { useEtiquetasDatabase } from '@/hooks/useEtiquetasDatabase';
import { LayoutStyle } from '@/hooks/etiquetas/types';

/**
 * Hook for handling etiqueta mãe (master label) processes
 * Follows Single Responsibility Principle - only handles master label operations
 */
export const useEtiquetaMaeProcess = (
  printEtiquetaMae: any,
  handlePrintEtiquetaMae: any
) => {
  const { buscarEtiquetasPorCodigo, marcarComoEtiquetada } = useEtiquetasDatabase();

  /**
   * Handles printing of etiqueta mãe with database marking
   */
  const handlePrintEtiquetaMaeWithMarking = async (
    etiquetaMae: any,
    volumes: any[],
    formatoImpressao: string,
    layoutStyle: LayoutStyle
  ) => {
    console.log('Printing master label with layout style:', layoutStyle);
    
    try {
      // Mark etiqueta mãe as labeled in database
      const etiquetasEncontradas = await buscarEtiquetasPorCodigo(etiquetaMae.id);
      
      if (etiquetasEncontradas && etiquetasEncontradas.length > 0) {
        const etiqueta = etiquetasEncontradas[0];
        await marcarComoEtiquetada(etiqueta.id);
        console.log(`✅ Etiqueta mãe ${etiquetaMae.id} marcada como etiquetada`);
      }
    } catch (error) {
      console.error(`❌ Erro ao marcar etiqueta mãe ${etiquetaMae.id} como etiquetada:`, error);
    }
    
    // Proceed with printing
    handlePrintEtiquetaMae(printEtiquetaMae)(etiquetaMae, volumes, formatoImpressao, layoutStyle);
  };

  return {
    handlePrintEtiquetaMaeWithMarking
  };
};
