
import { supabase } from "@/integrations/supabase/client";
import { Localizacao, Movimentacao } from "@/types/supabase/armazem.types";

/**
 * Service for etiqueta movements operations
 */
const movimentacaoService = {
  /**
   * Registra a movimentação de uma etiqueta
   */
  async registrarMovimentacao(
    etiquetaId: string,
    localizacaoOrigemId: string | null,
    localizacaoDestinoId: string,
    tipoMovimentacao: string,
    observacoes?: string
  ): Promise<Movimentacao> {
    const { data, error } = await supabase
      .from('movimentacoes')
      .insert({
        etiqueta_id: etiquetaId,
        localizacao_origem_id: localizacaoOrigemId,
        localizacao_destino_id: localizacaoDestinoId,
        tipo_movimentacao: tipoMovimentacao,
        data_movimentacao: new Date().toISOString(),
        observacoes
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao registrar movimentação: ${error.message}`);
    }
    
    // Atualizar o status da localização de destino
    await supabase
      .from('localizacoes')
      .update({
        ocupado: true
      })
      .eq('id', localizacaoDestinoId);
    
    // Se tiver origem, atualizar status dela também
    if (localizacaoOrigemId) {
      const { count } = await supabase
        .from('movimentacoes')
        .select('*', { count: 'exact', head: true })
        .eq('localizacao_destino_id', localizacaoOrigemId);
      
      // Se não houver mais volumes nesta localização, marca como desocupada
      if (count === 0) {
        await supabase
          .from('localizacoes')
          .update({
            ocupado: false
          })
          .eq('id', localizacaoOrigemId);
      }
    }
    
    return data as Movimentacao;
  },

  /**
   * Busca o histórico de movimentações de uma etiqueta
   */
  async buscarHistoricoMovimentacoes(etiquetaId: string): Promise<Movimentacao[]> {
    const { data, error } = await supabase
      .from('movimentacoes')
      .select(`
        *,
        etiqueta:etiqueta_id(*),
        localizacao_origem:localizacao_origem_id(*),
        localizacao_destino:localizacao_destino_id(*),
        usuario:usuario_id(*)
      `)
      .eq('etiqueta_id', etiquetaId)
      .order('data_movimentacao', { ascending: false });
    
    if (error) {
      throw new Error(`Erro ao buscar histórico de movimentações: ${error.message}`);
    }
    
    return data as unknown as Movimentacao[];
  },

  /**
   * Busca a localização atual de uma etiqueta
   */
  async buscarLocalizacaoAtual(etiquetaId: string): Promise<Localizacao | null> {
    const { data, error } = await supabase
      .from('movimentacoes')
      .select(`
        localizacao_destino:localizacao_destino_id(*)
      `)
      .eq('etiqueta_id', etiquetaId)
      .order('data_movimentacao', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Não encontrou nenhuma movimentação
        return null;
      }
      throw new Error(`Erro ao buscar localização atual: ${error.message}`);
    }
    
    return data.localizacao_destino as unknown as Localizacao;
  }
};

export default movimentacaoService;
