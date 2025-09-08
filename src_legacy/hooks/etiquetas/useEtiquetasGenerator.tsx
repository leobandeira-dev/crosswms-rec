
import { useState } from 'react';
import { LayoutStyle, EtiquetaGenerationResult } from './types';
import { useVolumeGeneration } from './useVolumeGeneration';
import { useEtiquetaMaeGeneration } from './useEtiquetaMaeGeneration';

export const useEtiquetasGenerator = () => {
  const { isGenerating: isGeneratingVolumes, generateEtiquetasPDF } = useVolumeGeneration();
  const { isGenerating: isGeneratingMae, generateEtiquetaMaePDF } = useEtiquetaMaeGeneration();
  
  // Combine the loading states
  const isGenerating = isGeneratingVolumes || isGeneratingMae;

  return {
    isGenerating,
    generateEtiquetasPDF,
    generateEtiquetaMaePDF
  };
};

export * from './types';
