
import { supabase } from "@/integrations/supabase/client";
import { Etiqueta } from "@/types/supabase/armazem.types";

/**
 * Service for basic etiqueta operations
 */
const etiquetaBasicService = {
  /**
   * Lista todas as etiquetas
   */
  async listarEtiquetas(filtros?: {
    tipo?: string;
    status?: string;
    termo?: string;
  }): Promise<Etiqueta[]> {
    let query = supabase
      .from('etiquetas')
      .select(`
        *,
        nota_fiscal:nota_fiscal_id(*),
        etiqueta_mae:etiqueta_mae_id(*)
      `);
    
    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }
    
    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }
    
    if (filtros?.termo) {
      query = query.ilike('codigo', `%${filtros.termo}%`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Erro ao listar etiquetas: ${error.message}`);
    }
    
    return data as Etiqueta[];
  },

  /**
   * Busca uma etiqueta pelo código
   */
  async buscarEtiquetaPorCodigo(codigo: string): Promise<Etiqueta> {
    const { data, error } = await supabase
      .from('etiquetas')
      .select(`
        *,
        nota_fiscal:nota_fiscal_id(*),
        etiqueta_mae:etiqueta_mae_id(*)
      `)
      .eq('codigo', codigo)
      .single();
    
    if (error) {
      throw new Error(`Erro ao buscar etiqueta: ${error.message}`);
    }
    
    return data as Etiqueta;
  },

  /**
   * Cria uma nova etiqueta
   */
  async criarEtiqueta(etiqueta: Partial<Etiqueta>): Promise<Etiqueta> {
    // Gerar código único para a etiqueta se não foi fornecido
    const codigo = etiqueta.codigo || `ETQ-${new Date().getTime().toString().substring(5)}`;
    
    const { data, error } = await supabase
      .from('etiquetas')
      .insert({
        codigo,
        tipo: etiqueta.tipo || 'volume',
        data_geracao: new Date().toISOString(),
        // Use type-safe optional properties
        altura: etiqueta.altura,
        largura: etiqueta.largura,
        comprimento: etiqueta.comprimento,
        peso: etiqueta.peso,
        fragil: etiqueta.fragil ?? false,
        nota_fiscal_id: etiqueta.nota_fiscal_id,
        etiqueta_mae_id: etiqueta.etiqueta_mae_id,
        status: 'gerada'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao criar etiqueta: ${error.message}`);
    }
    
    return data as Etiqueta;
  },
  
  /**
   * Atualiza o status de várias etiquetas
   */
  async atualizarEtiquetas(etiquetasIds: string[], atualizacoes: Partial<Etiqueta>): Promise<void> {
    const { error } = await supabase
      .from('etiquetas')
      .update(atualizacoes)
      .in('id', etiquetasIds);
    
    if (error) {
      throw new Error(`Erro ao atualizar etiquetas: ${error.message}`);
    }
  }
};

export default etiquetaBasicService;
