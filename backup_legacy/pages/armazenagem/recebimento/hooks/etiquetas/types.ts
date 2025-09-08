
/**
 * Type definitions for etiquetas module
 * Follows Interface Segregation Principle - defines specific interfaces for different concerns
 */

import { Volume } from '../../components/etiquetas/VolumesTable';
import { LayoutStyle } from '@/hooks/etiquetas/types';

export interface PrintResult {
  status: 'success' | 'error';
  volumes?: Volume[];
  message?: string;
}

export interface PrintOptions {
  formatoImpressao: string;
  layoutStyle: LayoutStyle;
}

export interface DatabaseResult {
  volumesSalvos: number;
  erros: string[];
}

export interface MarkingResult {
  successfullyMarked: string[];
  failedToMark: string[];
}

export interface PrintValidationResult {
  needsConfirmation: boolean;
  volume?: Volume;
  notaFiscalData?: any;
  formatoImpressao?: string;
  layoutStyle?: LayoutStyle;
}

export interface EtiquetaOperations {
  handlePrintEtiquetas: (volume: Volume) => Promise<PrintValidationResult>;
  handleReimprimirEtiquetas: (volume: Volume) => Promise<void>;
  handlePrintEtiquetaMae: (etiquetaMae: any) => Promise<void>;
  handleConfirmPrintWithExistingVolumes: () => Promise<void>;
}

export interface VolumeOperations {
  handleGenerateVolumes: () => Promise<void>;
  handleClassifyVolume: (volume: Volume) => void;
  handleSaveVolumeClassification: (volume: Volume, formData: any) => void;
  handleVincularVolumes: (etiquetaMaeId: string, volumeIds: string[]) => void;
}
