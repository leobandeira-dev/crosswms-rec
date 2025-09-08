
import { NotaFiscalVolume, VolumeItem } from './types';
import { generateVolumeId } from './types';

// Utility function to ensure volumes have id property and calculate cubic volume
export const convertVolumesToVolumeItems = (volumes: any[]): VolumeItem[] => {
  return volumes.map((volume) => {
    const quantidade = volume.quantidade || 1;
    const altura = volume.altura || 0;
    const largura = volume.largura || 0;
    const comprimento = volume.comprimento || 0;
    const peso = volume.peso || 0;
    
    // Calculate cubic volume (m³) - no division by 1,000,000
    const cubicVolume = altura * largura * comprimento * quantidade;
    
    return {
      id: volume.id || generateVolumeId(),
      quantidade: quantidade,
      altura: altura,
      largura: largura,
      comprimento: comprimento,
      peso: peso,
      cubicVolume: parseFloat(cubicVolume.toFixed(6)) // Round to 6 decimal places for precision
    };
  });
};

// Ensure all required fields are present in a nota fiscal
export const ensureCompleteNotaFiscal = (nf: any): NotaFiscalVolume => {
  const volumes = Array.isArray(nf.volumes) ? convertVolumesToVolumeItems(nf.volumes) : [];
  
  // Calculate total cubic volume across all volumes
  const totalCubicVolume = volumes.reduce((total, volume) => total + (volume.cubicVolume || 0), 0);
  
  return {
    numeroNF: nf.numeroNF || '',
    chaveNF: nf.chaveNF || '',
    dataEmissao: nf.dataEmissao || new Date().toISOString().split('T')[0],
    volumes: volumes,
    remetente: nf.remetente || '',
    destinatario: nf.destinatario || '',
    valorTotal: nf.valorTotal || 0,
    pesoTotal: nf.pesoTotal || 0,
    emitenteCNPJ: nf.emitenteCNPJ || '',
    totalCubicVolume: parseFloat(totalCubicVolume.toFixed(6)) // Round to 6 decimal places
  };
};
