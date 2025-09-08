
import { supabase } from "@/integrations/supabase/client";
import { Etiqueta } from "@/types/supabase/armazem.types";

/**
 * Service for etiqueta mãe (master label) operations
 */
const etiquetaMaeService = {
  /**
   * Cria uma etiqueta mãe
   */
  async criarEtiquetaMae(etiqueta: Partial<Etiqueta>): Promise<Etiqueta> {
    // Gerar código único para a etiqueta mãe
    const codigo = `ETQM-${new Date().getTime().toString().substring(5)}`;
    
    const { data, error } = await supabase
      .from('etiquetas')
      .insert({
        ...etiqueta,
        codigo,
        tipo: 'etiqueta_mae',
        data_geracao: new Date().toISOString(),
        status: 'gerada'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao criar etiqueta mãe: ${error.message}`);
    }
    
    return data as Etiqueta;
  },

  /**
   * Vincula uma etiqueta a uma etiqueta mãe
   */
  async vincularEtiquetaMae(etiquetaId: string, etiquetaMaeId: string): Promise<Etiqueta> {
    const { data, error } = await supabase
      .from('etiquetas')
      .update({
        etiqueta_mae_id: etiquetaMaeId
      })
      .eq('id', etiquetaId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao vincular etiqueta mãe: ${error.message}`);
    }
    
    return data as Etiqueta;
  }
};

export default etiquetaMaeService;
