
import { supabase } from "@/integrations/supabase/client";
import { Unitizacao } from "@/types/supabase.types";

/**
 * Service for unitization operations
 */
const unitizacaoService = {
  /**
   * Busca uma unitização pelo ID
   */
  async buscarUnitizacaoPorId(id: string): Promise<Unitizacao> {
    const { data, error } = await supabase
      .from('unitizacoes')
      .select(`
        *,
        etiquetas_unitizacao:id(etiqueta_id)
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(`Erro ao buscar unitização: ${error.message}`);
    }
    
    return data as unknown as Unitizacao;
  },
  
  /**
   * Cancela uma unitização
   */
  async cancelarUnitizacao(id: string): Promise<void> {
    const { error } = await supabase
      .from('unitizacoes')
      .update({ status: 'cancelada' })
      .eq('id', id);
    
    if (error) {
      throw new Error(`Erro ao cancelar unitização: ${error.message}`);
    }
  },
  
  /**
   * Lista todas as unitizações
   */
  async listarUnitizacoes(filtros?: {
    status?: string;
    tipo?: string;
  }): Promise<Unitizacao[]> {
    let query = supabase
      .from('unitizacoes')
      .select(`
        *,
        localizacao:localizacao_id(*)
      `);
    
    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }
    
    if (filtros?.tipo) {
      query = query.eq('tipo_unitizacao', filtros.tipo);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Erro ao listar unitizações: ${error.message}`);
    }
    
    return data as unknown as Unitizacao[];
  }
};

export default unitizacaoService;
