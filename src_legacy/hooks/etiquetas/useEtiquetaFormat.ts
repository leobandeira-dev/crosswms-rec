
// useEtiquetaFormat.ts
import { EtiquetaFormat } from './types';

export const useEtiquetaFormat = () => {
  // Define available label formats
  const getFormats = (): Record<string, EtiquetaFormat> => ({
    '50x100': { width: 100, height: 50, unit: 'mm' },
    '100x100': { width: 100, height: 100, unit: 'mm' },
    '100x150': { width: 150, height: 100, unit: 'mm' },
    '150x100': { width: 150, height: 100, unit: 'mm' },
    '62x42': { width: 62, height: 42, unit: 'mm' },
    'a4': { width: 210, height: 297, unit: 'mm' },
  });

  return { getFormats };
};
