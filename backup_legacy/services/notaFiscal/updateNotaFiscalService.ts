
import { supabase } from "@/integrations/supabase/client";
import { NotaFiscal } from "@/types/supabase.types";

/**
 * Updates a nota fiscal in the database
 */
export const atualizarNotaFiscal = async (id: string, data: Partial<NotaFiscal>): Promise<NotaFiscal> => {
  try {
    const { data: updatedNota, error } = await supabase
      .from('notas_fiscais')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao atualizar nota fiscal: ${error.message}`);
    }
    
    return updatedNota as NotaFiscal;
  } catch (error) {
    console.error('Erro ao atualizar nota fiscal:', error);
    throw error;
  }
};

/**
 * Updates only the status of a nota fiscal
 */
export const atualizarStatusNotaFiscal = async (id: string, status: string): Promise<NotaFiscal> => {
  try {
    const { data: updatedNota, error } = await supabase
      .from('notas_fiscais')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao atualizar status da nota fiscal: ${error.message}`);
    }
    
    return updatedNota as NotaFiscal;
  } catch (error) {
    console.error('Erro ao atualizar status da nota fiscal:', error);
    throw error;
  }
};
