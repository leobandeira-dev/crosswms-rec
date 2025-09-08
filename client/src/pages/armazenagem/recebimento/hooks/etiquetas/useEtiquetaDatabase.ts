
import { useState } from 'react';
import { useEtiquetasDatabase } from '@/hooks/useEtiquetasDatabase';
import { Volume } from '../../components/etiquetas/VolumesTable';
import { toast } from '@/hooks/use-toast';

/**
 * Hook for handling database operations related to etiquetas
 * Follows Single Responsibility Principle - only handles database operations
 */
export const useEtiquetaDatabase = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    marcarComoEtiquetada, 
    buscarEtiquetasPorCodigo, 
    salvarEtiqueta, 
    buscarEtiquetasPorNotaFiscal 
  } = useEtiquetasDatabase();

  /**
   * Prepares etiqueta data for database insertion
   */
  const prepareEtiquetaData = (volume: Volume) => {
    console.log('📋 Preparando dados da etiqueta para volume:', volume.id);
    
    const descricaoVolume = volume.descricao || `Volume ${volume.volumeNumber || 1}/${volume.totalVolumes || 1}`;
    
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
      descricao: descricaoVolume,
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
   * Saves volumes to database
   */
  const saveVolumesToDatabase = async (volumesToSave: Volume[]) => {
    setIsLoading(true);
    let volumesSalvos = 0;
    const erros: string[] = [];

    try {
      for (const volume of volumesToSave) {
        try {
          const etiquetaData = prepareEtiquetaData(volume);
          await salvarEtiqueta(etiquetaData);
          volumesSalvos++;
          console.log(`✅ Etiqueta ${volume.id} salva com sucesso`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          erros.push(`${volume.id}: ${errorMessage}`);
          console.error(`❌ Erro ao gravar ${volume.id}:`, error);
        }
      }
    } finally {
      setIsLoading(false);
    }

    return { volumesSalvos, erros };
  };

  /**
   * Marks volumes as labeled in the database
   */
  const markVolumesAsLabeled = async (volumes: Volume[]) => {
    const successfullyMarked: string[] = [];
    const failedToMark: string[] = [];

    for (const volume of volumes) {
      try {
        console.log(`🏷️ Marcando volume ${volume.id} como etiquetado...`);
        
        const etiquetasEncontradas = await buscarEtiquetasPorCodigo(volume.id);
        
        if (etiquetasEncontradas && etiquetasEncontradas.length > 0) {
          const etiqueta = etiquetasEncontradas[0];
          await marcarComoEtiquetada(etiqueta.id);
          successfullyMarked.push(volume.id);
          console.log(`✅ Volume ${volume.id} marcado como etiquetado`);
        } else {
          console.warn(`⚠️ Etiqueta não encontrada no banco para volume: ${volume.id}`);
          failedToMark.push(volume.id);
        }
      } catch (error) {
        console.error(`❌ Erro ao marcar volume ${volume.id} como etiquetado:`, error);
        failedToMark.push(volume.id);
      }
    }

    return { successfullyMarked, failedToMark };
  };

  /**
   * Checks if volumes exist for a nota fiscal
   */
  const checkExistingVolumes = async (notaFiscal: string) => {
    try {
      const existingVolumes = await buscarEtiquetasPorNotaFiscal(notaFiscal);
      return existingVolumes || [];
    } catch (error) {
      console.error('Erro ao verificar volumes existentes:', error);
      return [];
    }
  };

  return {
    isLoading,
    saveVolumesToDatabase,
    markVolumesAsLabeled,
    checkExistingVolumes,
    prepareEtiquetaData
  };
};
