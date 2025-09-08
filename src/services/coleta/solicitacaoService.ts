
import { supabase } from "@/integrations/supabase/client";
import { SolicitacaoColeta } from "@/types/supabase/coleta.types"; // Updated import path

/**
 * Lista todas as solicitações de coleta
 */
export async function listarSolicitacoes(filtros?: {
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  termo?: string;
}): Promise<SolicitacaoColeta[]> {
  let query = supabase
    .from('solicitacoes_coleta')
    .select(`
      *,
      empresa_solicitante:empresa_solicitante_id(*)
    `);
  
  if (filtros?.status) {
    query = query.eq('status', filtros.status);
  }
  
  if (filtros?.dataInicio) {
    query = query.gte('data_solicitacao', filtros.dataInicio);
  }
  
  if (filtros?.dataFim) {
    query = query.lte('data_solicitacao', filtros.dataFim);
  }
  
  if (filtros?.termo) {
    query = query.or(`
      numero_solicitacao.ilike.%${filtros.termo}%,
      contato_nome.ilike.%${filtros.termo}%
    `);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Erro ao listar solicitações de coleta: ${error.message}`);
  }
  
  return data as SolicitacaoColeta[];
}

/**
 * Busca uma solicitação de coleta pelo ID
 */
export async function buscarSolicitacaoPorId(id: string): Promise<SolicitacaoColeta> {
  const { data, error } = await supabase
    .from('solicitacoes_coleta')
    .select(`
      *,
      empresa_solicitante:empresa_solicitante_id(*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error(`Erro ao buscar solicitação de coleta: ${error.message}`);
  }
  
  return data as SolicitacaoColeta;
}

/**
 * Cria uma nova solicitação de coleta
 */
export async function criarSolicitacao(solicitacao: Partial<SolicitacaoColeta>): Promise<SolicitacaoColeta> {
  // Gerar número da solicitação
  const numeroSolicitacao = `SOL-${new Date().getTime().toString().substring(5)}`;
  
  const { data, error } = await supabase
    .from('solicitacoes_coleta')
    .insert({
      numero_solicitacao: numeroSolicitacao,
      data_solicitacao: new Date().toISOString(),
      tipo_coleta: solicitacao.tipo_coleta || 'padrao',
      status: 'pendente',
      empresa_solicitante_id: solicitacao.empresa_solicitante_id,
      endereco_coleta: solicitacao.endereco_coleta,
      cidade_coleta: solicitacao.cidade_coleta,
      estado_coleta: solicitacao.estado_coleta,
      cep_coleta: solicitacao.cep_coleta,
      contato_nome: solicitacao.contato_nome,
      contato_telefone: solicitacao.contato_telefone,
      observacoes: solicitacao.observacoes
    } as any)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Erro ao criar solicitação de coleta: ${error.message}`);
  }
  
  return data as SolicitacaoColeta;
}

/**
 * Aprovar uma solicitação de coleta
 */
export async function aprovarSolicitacao(id: string): Promise<SolicitacaoColeta> {
  const { data, error } = await supabase
    .from('solicitacoes_coleta')
    .update({
      status: 'aprovada',
      data_aprovacao: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Erro ao aprovar solicitação de coleta: ${error.message}`);
  }
  
  return data as SolicitacaoColeta;
}
