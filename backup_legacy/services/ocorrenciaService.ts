// Fix the missing group method issues and type errors
import { supabase } from "@/integrations/supabase/client";
import { Ocorrencia, ComentarioOcorrencia } from "@/types/supabase.types";

// Fix the buscarOcorrencias function to handle types properly
export const buscarOcorrencias = async (filtros?: any): Promise<Ocorrencia[]> => {
  try {
    let query = supabase
      .from('ocorrencias')
      .select(`
        *,
        nota_fiscal:nota_fiscal_id(*),
        coleta:coleta_id(*),
        empresa_cliente:empresa_cliente_id(*),
        usuario_abertura:usuario_abertura_id(*),
        usuario_responsavel:usuario_responsavel_id(*)
      `);
    
    // Apply filters if provided
    if (filtros?.tipo) {
      query = query.eq('tipo', filtros.tipo);
    }
    
    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }
    
    if (filtros?.prioridade) {
      query = query.eq('prioridade', filtros.prioridade);
    }
    
    if (filtros?.empresa_cliente_id) {
      query = query.eq('empresa_cliente_id', filtros.empresa_cliente_id);
    }
    
    if (filtros?.nota_fiscal_id) {
      query = query.eq('nota_fiscal_id', filtros.nota_fiscal_id);
    }
    
    if (filtros?.coleta_id) {
      query = query.eq('coleta_id', filtros.coleta_id);
    }
    
    if (filtros?.usuario_abertura_id) {
      query = query.eq('usuario_abertura_id', filtros.usuario_abertura_id);
    }
    
    if (filtros?.usuario_responsavel_id) {
      query = query.eq('usuario_responsavel_id', filtros.usuario_responsavel_id);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Erro ao buscar ocorrências: ${error.message}`);
    }
    
    // Convert the data to the expected Ocorrencia type
    return data as unknown as Ocorrencia[];
  } catch (error: any) {
    console.error("Erro ao buscar ocorrências:", error);
    throw error;
  }
};

// Fix the criarOcorrencia function to ensure all required fields
export const criarOcorrencia = async (ocorrencia: Partial<Ocorrencia>): Promise<Ocorrencia> => {
  try {
    // Ensure all required fields are present
    const ocorrenciaToInsert = {
      titulo: ocorrencia.titulo || 'Sem título',
      descricao: ocorrencia.descricao || 'Sem descrição',
      tipo: ocorrencia.tipo || 'geral',
      prioridade: ocorrencia.prioridade || 'media',
      status: ocorrencia.status || 'aberto',
      data_abertura: ocorrencia.data_abertura || new Date().toISOString(),
      // Include optional fields
      usuario_abertura_id: ocorrencia.usuario_abertura_id,
      usuario_responsavel_id: ocorrencia.usuario_responsavel_id,
      empresa_cliente_id: ocorrencia.empresa_cliente_id,
      nota_fiscal_id: ocorrencia.nota_fiscal_id,
      coleta_id: ocorrencia.coleta_id,
      carregamento_id: ocorrencia.carregamento_id,
      etiqueta_id: ocorrencia.etiqueta_id,
      data_resolucao: ocorrencia.data_resolucao,
      solucao: ocorrencia.solucao
    };
    
    const { data, error } = await supabase
      .from('ocorrencias')
      .insert(ocorrenciaToInsert)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao criar ocorrência: ${error.message}`);
    }
    
    return data as Ocorrencia;
  } catch (error: any) {
    console.error("Erro ao criar ocorrência:", error);
    throw error;
  }
};

// Fix the group method issues by using alternative approach
export const obterEstatisticasOcorrencias = async (): Promise<any> => {
  try {
    // For status counts, use separate queries instead of group
    const statusCounts = {};
    const statusList = ['aberto', 'em_andamento', 'resolvido', 'fechado'];
    
    for (const status of statusList) {
      const { count } = await supabase
        .from('ocorrencias')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      
      statusCounts[status] = count || 0;
    }
    
    // For priority counts, use separate queries instead of group
    const priorityCounts = {};
    const priorityList = ['baixa', 'media', 'alta', 'critica'];
    
    for (const priority of priorityList) {
      const { count } = await supabase
        .from('ocorrencias')
        .select('*', { count: 'exact', head: true })
        .eq('prioridade', priority);
      
      priorityCounts[priority] = count || 0;
    }
    
    // For type counts, use separate queries instead of group
    const typeCounts = {};
    const typeList = ['produto', 'transporte', 'sistema', 'comercial', 'financeiro', 'outro'];
    
    for (const type of typeList) {
      const { count } = await supabase
        .from('ocorrencias')
        .select('*', { count: 'exact', head: true })
        .eq('tipo', type);
      
      typeCounts[type] = count || 0;
    }
    
    return {
      statusCounts,
      priorityCounts,
      typeCounts
    };
  } catch (error: any) {
    console.error("Erro ao obter estatísticas de ocorrências:", error);
    throw error;
  }
};

export const buscarComentariosOcorrencia = async (ocorrenciaId: string): Promise<ComentarioOcorrencia[]> => {
  try {
    const { data, error } = await supabase
      .from('comentarios_ocorrencia')
      .select(`
        *,
        usuario:usuario_id(*)
      `)
      .eq('ocorrencia_id', ocorrenciaId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new Error(`Erro ao buscar comentários da ocorrência: ${error.message}`);
    }
    
    return data as ComentarioOcorrencia[];
  } catch (error: any) {
    console.error("Erro ao buscar comentários da ocorrência:", error);
    throw error;
  }
};

export const criarComentarioOcorrencia = async (comentario: Partial<ComentarioOcorrencia>): Promise<ComentarioOcorrencia> => {
  try {
    const { data, error } = await supabase
      .from('comentarios_ocorrencia')
      .insert({
        comentario: comentario.comentario,
        ocorrencia_id: comentario.ocorrencia_id,
        usuario_id: comentario.usuario_id
      })
      .select(`
        *,
        usuario:usuario_id(*)
      `)
      .single();
    
    if (error) {
      throw new Error(`Erro ao criar comentário da ocorrência: ${error.message}`);
    }
    
    return data as ComentarioOcorrencia;
  } catch (error: any) {
    console.error("Erro ao criar comentário da ocorrência:", error);
    throw error;
  }
};
