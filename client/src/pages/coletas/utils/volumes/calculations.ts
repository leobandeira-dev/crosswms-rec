
import { VolumeItem } from './types';

// Calculate total volume (m³) for a single volume item
export const calcularVolume = (volume: VolumeItem): number => {
  // Formula: altura * largura * comprimento * quantidade (no longer dividing by 1,000,000)
  const volumeTotal = volume.altura * volume.largura * volume.comprimento * volume.quantidade;
  return volumeTotal;
};

// Calculate totals for a single invoice
export const calcularTotaisNota = (volumes: VolumeItem[], pesoTotal?: number): { 
  qtdVolumes: number; 
  volumeTotal: number; 
  pesoTotal: number;
  pesoCubadoTotal: number;
} => {
  let totalVolumes = 0;
  let totalVolumeM3 = 0;
  
  volumes.forEach(volume => {
    totalVolumes += volume.quantidade;
    totalVolumeM3 += calcularVolume(volume);
  });
  
  // Calculate cubic weight (300kg per cubic meter)
  const pesoCubado = totalVolumeM3 * 300;
  
  return {
    qtdVolumes: totalVolumes,
    volumeTotal: totalVolumeM3,
    pesoTotal: pesoTotal || volumes.reduce((sum, vol) => sum + (vol.peso * vol.quantidade), 0),
    pesoCubadoTotal: pesoCubado
  };
};

// Calculate totals for a collection of invoices
export const calcularTotaisColeta = (notasFiscais: any[]): {
  qtdVolumes: number;
  volumeTotal: number;
  pesoTotal: number;
  pesoCubadoTotal: number;
  valorTotal: number;
} => {
  let totalVolumes = 0;
  let totalVolumeM3 = 0;
  let totalPeso = 0;
  let valorTotal = 0;
  
  if (!notasFiscais || notasFiscais.length === 0) {
    return {
      qtdVolumes: 0,
      volumeTotal: 0,
      pesoTotal: 0,
      pesoCubadoTotal: 0,
      valorTotal: 0
    };
  }
  
  notasFiscais.forEach(nf => {
    if (nf && nf.volumes && Array.isArray(nf.volumes)) {
      const totaisNota = calcularTotaisNota(nf.volumes, nf.pesoTotal);
      totalVolumes += totaisNota.qtdVolumes;
      totalVolumeM3 += totaisNota.volumeTotal;
      totalPeso += nf.pesoTotal || totaisNota.pesoTotal;
      valorTotal += nf.valorTotal || 0;
    }
  });
  
  // Calculate cubic weight (300kg per cubic meter)
  const pesoCubado = totalVolumeM3 * 300;
  
  return {
    qtdVolumes: totalVolumes,
    volumeTotal: totalVolumeM3,
    pesoTotal: totalPeso,
    pesoCubadoTotal: pesoCubado,
    valorTotal: valorTotal
  };
};
