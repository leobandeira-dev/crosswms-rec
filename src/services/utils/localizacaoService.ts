
import { supabase } from "@/integrations/supabase/client";

const localizacaoService = {
  /**
   * Lista localizações disponíveis
   */
  async listarLocalizacoes(filtros: {
    ocupado?: boolean;
    tipo?: string;
    setor?: string;
  } = {}): Promise<any[]> {
    let query = supabase.from('localizacoes').select('*');
    
    if (filtros.ocupado !== undefined) {
      query = query.eq('ocupado', filtros.ocupado);
    }
    
    if (filtros.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }
    
    if (filtros.setor) {
      query = query.eq('setor', filtros.setor);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Erro ao listar localizações: ${error.message}`);
    }
    
    return data || [];
  },
  
  /**
   * Busca localização por ID
   */
  async buscarLocalizacaoPorId(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('localizacoes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(`Erro ao buscar localização: ${error.message}`);
    }
    
    return data;
  },
  
  /**
   * Atualiza status de ocupação da localização
   */
  async atualizarStatusOcupacao(id: string, ocupado: boolean): Promise<void> {
    const { error } = await supabase
      .from('localizacoes')
      .update({ ocupado })
      .eq('id', id);
    
    if (error) {
      throw new Error(`Erro ao atualizar status de ocupação: ${error.message}`);
    }
  }
};

export default localizacaoService;
