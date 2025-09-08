
// Define the basic volume item structure
export interface VolumeItem {
  id: string;
  altura: number;
  largura: number;
  comprimento: number;
  quantidade: number;
  peso: number;
  cubicVolume?: number; // Added to store calculated volume
}

// Define a note fiscal with volumes
export interface NotaFiscalVolume {
  numeroNF: string;
  chaveNF?: string;
  dataEmissao?: string;
  remetente: string;
  destinatario: string;
  valorTotal: number;
  pesoTotal: number;
  volumes: VolumeItem[];
  emitenteCNPJ?: string; // Add missing property
  totalCubicVolume?: number; // Add for explicit cubic volume storage
}

// Function to generate a unique volume ID
export const generateVolumeId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

// FOB/CIF type
export type TipoFrete = 'FOB' | 'CIF';
