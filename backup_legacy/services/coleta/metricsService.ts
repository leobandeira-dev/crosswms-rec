
import { supabase } from "@/integrations/supabase/client";

/**
 * Calcula métricas de tempo de coleta
 */
export async function calcularTempoColeta(filtros?: {
  dataInicio?: string;
  dataFim?: string;
}) {
  let query = supabase
    .from('solicitacoes_coleta')
    .select('tempo_aprovacao_coleta_horas')
    .not('tempo_aprovacao_coleta_horas', 'is', null);
  
  if (filtros?.dataInicio) {
    query = query.gte('data_aprovacao', filtros.dataInicio);
  }
  
  if (filtros?.dataFim) {
    query = query.lte('data_coleta', filtros.dataFim);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Erro ao calcular tempo de coleta: ${error.message}`);
  }
  
  const tempos = data.map(item => item.tempo_aprovacao_coleta_horas);
  const somaTempo = tempos.reduce((acc, curr) => acc + curr, 0);
  
  return {
    media: tempos.length > 0 ? somaTempo / tempos.length : 0,
    total: somaTempo,
    quantidade: tempos.length
  };
}
