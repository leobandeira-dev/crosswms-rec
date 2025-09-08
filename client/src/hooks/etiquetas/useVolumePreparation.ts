
import { Volume } from '@/pages/armazenagem/recebimento/hooks/etiquetas/useVolumeState';
import { VolumeData as EtiquetaVolumeData } from './types';

// We'll use the VolumeData from types.ts, not define a new one
export type VolumeData = EtiquetaVolumeData;

export const useVolumePreparation = () => {
  // The existing function to prepare volume data
  const prepareVolumeData = (volume: any): VolumeData => {
    // Extract transportadora from volume or from nested nota_fiscal if it exists
    const transportadora = volume.transportadora || 
      (volume.nota_fiscal && volume.nota_fiscal.transportadora) ||
      'Transportadora não especificada';
    
    // Convert the volume data to a standard format
    return {
      id: volume.id || volume.codigo || '',
      notaFiscal: volume.notaFiscal || volume.nota_fiscal?.numero || '',
      descricao: volume.descricao || '',
      quantidade: volume.quantidade || 1,
      etiquetado: volume.etiquetado || false,
      remetente: volume.remetente || volume.nota_fiscal?.emitente_nome || '',
      destinatario: volume.destinatario || volume.nota_fiscal?.destinatario_nome || '',
      endereco: volume.endereco || volume.nota_fiscal?.destinatario_endereco || '',
      cidade: volume.cidade || volume.nota_fiscal?.destinatario_cidade || '',
      cidadeCompleta: volume.cidadeCompleta || volume.nota_fiscal?.destinatario_cidade_completa || '',
      uf: volume.uf || volume.nota_fiscal?.destinatario_uf || '',
      pesoTotal: volume.pesoTotal || volume.nota_fiscal?.peso_total || '0 Kg',
      chaveNF: volume.chaveNF || volume.nota_fiscal?.chave || '',
      etiquetaMae: volume.etiquetaMae || volume.etiqueta_mae_id || '',
      tipoEtiquetaMae: volume.tipoEtiquetaMae || 'geral',
      tipoVolume: volume.tipoVolume || 'geral',
      codigoONU: volume.codigoONU || '',
      codigoRisco: volume.codigoRisco || '',
      transportadora: transportadora,
      classificacaoQuimica: volume.classificacaoQuimica || 'nao_classificada',
      // Garantir que a área seja capturada corretamente do volume original
      area: volume.area || '01',
      // Garantir que os números de volume sejam capturados corretamente
      volumeNumber: volume.volumeNumber || 1,
      totalVolumes: volume.totalVolumes || 1
    };
  };

  // Add the missing prepareVolume function
  const prepareVolume = async (volume: VolumeData): Promise<VolumeData> => {
    // This function can be used for any additional processing needed
    // before using the volume data, such as API calls or transformations
    return prepareVolumeData(volume);
  };

  return {
    prepareVolumeData,
    prepareVolume
  };
};
