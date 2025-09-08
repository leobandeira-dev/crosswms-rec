
import { CreateEtiquetaData } from '@/services/etiquetaService';
import { Volume } from '../../components/etiquetas/VolumesTable';

/**
 * Adapter pattern implementation for etiqueta service
 * Follows Adapter Pattern - provides interface adaptation between different components
 */
export const useEtiquetaServiceAdapter = () => {
  /**
   * Adapts Volume data to CreateEtiquetaData format
   */
  const adaptVolumeToEtiquetaData = (volume: Volume): CreateEtiquetaData => {
    return {
      codigo: volume.id,
      tipo: 'volume',
      area: volume.area || null,
      remetente: volume.remetente || null,
      destinatario: volume.destinatario || null,
      endereco: volume.endereco || null,
      cidade: volume.cidade || null,
      uf: volume.uf || null,
      cep: null,
      descricao: volume.descricao || `Volume ${volume.volumeNumber || 1}/${volume.totalVolumes || 1}`,
      transportadora: volume.transportadora || null,
      chave_nf: volume.chaveNF || volume.notaFiscal || null,
      quantidade: volume.quantidade || 1,
      peso_total_bruto: volume.pesoTotal ? String(volume.pesoTotal) : null,
      numero_pedido: volume.numeroPedido || null,
      volume_numero: volume.volumeNumber || 1,
      total_volumes: volume.totalVolumes || 1,
      codigo_onu: volume.codigoONU || null,
      codigo_risco: volume.codigoRisco || null,
      classificacao_quimica: volume.classificacaoQuimica === 'nao_classificada' ? null : volume.classificacaoQuimica,
      etiqueta_mae_id: volume.etiquetaMae || null,
      status: 'gerada'
    };
  };

  /**
   * Validates etiqueta data before processing
   */
  const validateEtiquetaData = (data: CreateEtiquetaData): boolean => {
    if (!data.codigo || data.codigo.trim() === '') {
      throw new Error('Código da etiqueta é obrigatório');
    }
    
    if (!data.tipo || data.tipo.trim() === '') {
      throw new Error('Tipo da etiqueta é obrigatório');
    }
    
    return true;
  };

  return {
    adaptVolumeToEtiquetaData,
    validateEtiquetaData
  };
};
