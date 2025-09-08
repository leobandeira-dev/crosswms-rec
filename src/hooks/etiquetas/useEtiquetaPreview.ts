
import { useState, useRef } from 'react';
import { CurrentEtiqueta } from './types';

/**
 * Hook for managing etiqueta preview state
 */
export const useEtiquetaPreview = () => {
  const etiquetaRef = useRef<HTMLDivElement>(null);
  const [currentEtiqueta, setCurrentEtiqueta] = useState<CurrentEtiqueta | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  return {
    etiquetaRef,
    currentEtiqueta,
    setCurrentEtiqueta,
    isGenerating,
    setIsGenerating
  };
};
