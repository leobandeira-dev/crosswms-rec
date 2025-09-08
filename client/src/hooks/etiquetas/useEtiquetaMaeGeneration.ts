
import { useState } from 'react';
import { EtiquetaGenerationResult, LayoutStyle } from './types';
import { useEtiquetaPDF } from './useEtiquetaPDF';

export const useEtiquetaMaeGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateEtiquetaMasterPDF } = useEtiquetaPDF();
  
  // Função para gerar etiqueta mãe
  const generateEtiquetaMaePDF = async (
    masterVolume: any[],
    notaData: any,
    formatoImpressao: string,
    etiquetaMaeId: string,
    layoutStyle: LayoutStyle = 'enhanced'
  ): Promise<EtiquetaGenerationResult> => {
    setIsGenerating(true);
    try {
      // Gerar o PDF para etiqueta mãe
      await generateEtiquetaMasterPDF(masterVolume, notaData, formatoImpressao, etiquetaMaeId, layoutStyle);
      
      return {
        status: 'success'
      };
    } catch (error) {
      console.error('Erro ao gerar etiqueta mãe:', error);
      return {
        status: 'error',
        message: 'Erro ao gerar etiqueta mãe. Tente novamente.'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateEtiquetaMaePDF
  };
};
