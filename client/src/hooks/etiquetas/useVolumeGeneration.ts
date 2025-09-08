
import { useState } from 'react';
import { EtiquetaGenerationResult, LayoutStyle } from './types';
import { useEtiquetaPDF } from './useEtiquetaPDF';

export const useVolumeGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { generateEtiquetaPDF } = useEtiquetaPDF();
  
  // Função para gerar etiquetas de volume
  const generateEtiquetasPDF = async (
    volumes: any[], 
    notaData: any, 
    formatoImpressao: string,
    tipoEtiqueta: 'volume' | 'mae' = 'volume',
    layoutStyle: LayoutStyle = 'enhanced'
  ): Promise<EtiquetaGenerationResult> => {
    setIsGenerating(true);
    try {
      // Gerar o PDF
      await generateEtiquetaPDF(volumes, notaData, formatoImpressao, tipoEtiqueta, layoutStyle);
      
      // Marcar etiquetas como geradas no volume se for volume
      if (tipoEtiqueta === 'volume') {
        const volumesAtualizados = volumes.map(vol => ({...vol, etiquetado: true}));
        return {
          status: 'success',
          volumes: volumesAtualizados
        };
      }
      
      return {
        status: 'success'
      };
    } catch (error) {
      console.error('Erro ao gerar etiquetas:', error);
      return {
        status: 'error',
        message: 'Erro ao gerar etiquetas. Tente novamente.'
      };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateEtiquetasPDF
  };
};
