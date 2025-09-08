
import { supabase } from "@/integrations/supabase/client";
import { Coleta } from "@/types/supabase.types";

/**
 * Registrar uma coleta realizada
 */
export async function registrarColeta(coleta: Partial<Coleta>): Promise<Coleta> {
  // Gerar número da coleta
  const numeroColeta = `COL-${new Date().getTime().toString().substring(5)}`;
  
  const { data, error } = await supabase
    .from('coletas')
    .insert({
      numero_coleta: numeroColeta,
      solicitacao_id: coleta.solicitacao_id,
      data_realizada: coleta.data_realizada || new Date().toISOString(),
      motorista_id: coleta.motorista_id,
      veiculo_id: coleta.veiculo_id,
      quantidade_volumes: coleta.quantidade_volumes || 0,
      peso_total: coleta.peso_total,
      status: 'coletado',
      observacoes: coleta.observacoes
    } as any)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Erro ao registrar coleta: ${error.message}`);
  }
  
  // Se for uma coleta de uma solicitação, atualiza a solicitação
  if (coleta.solicitacao_id) {
    await supabase
      .from('solicitacoes_coleta')
      .update({
        status: 'coletada',
        data_coleta: coleta.data_realizada || new Date().toISOString()
      })
      .eq('id', coleta.solicitacao_id);
  }
  
  return data as Coleta;
}

/**
 * Lista as coletas realizadas
 */
export async function listarColetas(filtros?: {
  status?: string;
  dataInicio?: string;
  dataFim?: string;
}): Promise<Coleta[]> {
  let query = supabase
    .from('coletas')
    .select(`
      *,
      solicitacao:solicitacao_id(*),
      motorista:motorista_id(*),
      veiculo:veiculo_id(*)
    `);
  
  if (filtros?.status) {
    query = query.eq('status', filtros.status);
  }
  
  if (filtros?.dataInicio) {
    query = query.gte('data_realizada', filtros.dataInicio);
  }
  
  if (filtros?.dataFim) {
    query = query.lte('data_realizada', filtros.dataFim);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Erro ao listar coletas: ${error.message}`);
  }
  
  return data as Coleta[];
}
