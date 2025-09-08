
import { supabase } from "@/integrations/supabase/client";

/**
 * Deletes a nota fiscal from the database
 */
export const excluirNotaFiscal = async (id: string): Promise<void> => {
  try {
    // First, delete related items
    const { error: itemsError } = await supabase
      .from('itens_nota_fiscal')
      .delete()
      .eq('nota_fiscal_id', id);
    
    if (itemsError) {
      console.warn('Aviso ao excluir itens da nota fiscal:', itemsError.message);
    }
    
    // Then delete the nota fiscal
    const { error } = await supabase
      .from('notas_fiscais')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new Error(`Erro ao excluir nota fiscal: ${error.message}`);
    }
  } catch (error) {
    console.error('Erro ao excluir nota fiscal:', error);
    throw error;
  }
};
