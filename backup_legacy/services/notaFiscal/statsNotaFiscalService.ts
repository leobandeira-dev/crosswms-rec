
import { supabase } from "@/integrations/supabase/client";

/**
 * Gets statistics about notas fiscais
 */
export const obterEstatisticasNotasFiscais = async (): Promise<any> => {
  try {
    // Total de notas fiscais
    const { count: totalNotas } = await supabase
      .from('notas_fiscais')
      .select('*', { count: 'exact', head: true });
    
    // Notas fiscais por status
    const statusList = ['pendente', 'em_processamento', 'conferida', 'divergente', 'finalizada'];
    const statusCounts = {};
    
    for (const status of statusList) {
      const { count } = await supabase
        .from('notas_fiscais')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      
      statusCounts[status] = count || 0;
    }
    
    // Valor total das notas fiscais - using a direct sum query
    const { data: notasFiscaisValores } = await supabase
      .from('notas_fiscais')
      .select('valor');
    
    const valorTotal = notasFiscaisValores?.reduce((acc, nf) => acc + (nf.valor || 0), 0) || 0;
    
    return {
      totalNotas,
      statusCounts,
      valorTotal
    };
  } catch (error: any) {
    console.error('Erro ao obter estatísticas de notas fiscais:', error);
    throw error;
  }
};
