
import { supabase } from "@/integrations/supabase/client";
import { OrdemCarregamento, Carregamento, NotaFiscal, Etiqueta } from "@/types/supabase.types";

const carregamentoService = {
  /**
   * Lista todas as ordens de carregamento
   */
  async listarOrdensCarregamento(filtros?: {
    status?: string;
    dataInicio?: string;
    dataFim?: string;
    termo?: string;
  }): Promise<OrdemCarregamento[]> {
    let query = supabase
      .from('ordens_carregamento')
      .select(`
        *,
        empresa_cliente:empresa_cliente_id(*),
        motorista:motorista_id(*),
        veiculo:veiculo_id(*)
      `);
    
    if (filtros?.status) {
      query = query.eq('status', filtros.status);
    }
    
    if (filtros?.dataInicio) {
      query = query.gte('data_programada', filtros.dataInicio);
    }
    
    if (filtros?.dataFim) {
      query = query.lte('data_programada', filtros.dataFim);
    }
    
    if (filtros?.termo) {
      query = query.or(`
        numero_ordem.ilike.%${filtros.termo}%
      `);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Erro ao listar ordens de carregamento: ${error.message}`);
    }
    
    return (data || []) as unknown as OrdemCarregamento[];
  },

  /**
   * Busca uma ordem de carregamento pelo ID
   */
  async buscarOrdemCarregamentoPorId(id: string): Promise<OrdemCarregamento> {
    const { data, error } = await supabase
      .from('ordens_carregamento')
      .select(`
        *,
        empresa_cliente:empresa_cliente_id(*),
        motorista:motorista_id(*),
        veiculo:veiculo_id(*),
        notas_fiscais:itens_carregamento!ordem_carregamento_id(
          nota_fiscal:nota_fiscal_id(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      throw new Error(`Erro ao buscar ordem de carregamento: ${error.message}`);
    }

    if (!data) {
      throw new Error(`Ordem de carregamento não encontrada: ${id}`);
    }

    // Reorganizar as notas fiscais para o formato esperado
    const notasFiscais = data.notas_fiscais?.map((item: any) => item.nota_fiscal) || [];
    
    return {
      ...data,
      notas_fiscais: notasFiscais
    } as unknown as OrdemCarregamento;
  },

  /**
   * Cria uma nova ordem de carregamento
   */
  async criarOrdemCarregamento(
    ordem: Partial<OrdemCarregamento>, 
    notasFiscaisIds: string[]
  ): Promise<OrdemCarregamento> {
    // Gerar número da ordem
    const numeroOrdem = `OC-${new Date().getTime().toString().substring(5)}`;
    
    // Iniciar uma transação
    const { data, error } = await supabase
      .from('ordens_carregamento')
      .insert({
        ...ordem,
        numero_ordem: numeroOrdem,
        data_criacao: new Date().toISOString(),
        tipo_carregamento: ordem.tipo_carregamento || 'padrao',
        status: 'pendente'
      } as any)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao criar ordem de carregamento: ${error.message}`);
    }

    if (!data) {
      throw new Error('Erro ao criar ordem de carregamento: dados não retornados');
    }
    
    // Vincular as notas fiscais à ordem
    if (notasFiscaisIds.length > 0) {
      const itensCarregamento = notasFiscaisIds.map(notaFiscalId => ({
        ordem_carregamento_id: data.id,
        nota_fiscal_id: notaFiscalId,
        status: 'pendente'
      }));
      
      const { error: errorItens } = await supabase
        .from('itens_carregamento')
        .insert(itensCarregamento as any);
        
      if (errorItens) {
        throw new Error(`Erro ao vincular notas fiscais à ordem: ${errorItens.message}`);
      }
      
      // Atualizar as notas fiscais para referenciar a ordem
      await supabase
        .from('notas_fiscais')
        .update({
          ordem_carregamento_id: data.id
        })
        .in('id', notasFiscaisIds);
    }
    
    return data as unknown as OrdemCarregamento;
  },

  /**
   * Inicia o processo de carregamento
   */
  async iniciarCarregamento(
    ordemId: string,
    responsavelId: string,
    conferenteId?: string
  ): Promise<Carregamento> {
    // Obter a ordem de carregamento
    const { data: ordem, error: errorOrdem } = await supabase
      .from('ordens_carregamento')
      .select('*')
      .eq('id', ordemId)
      .single();
    
    if (errorOrdem) {
      throw new Error(`Erro ao buscar ordem de carregamento: ${errorOrdem.message}`);
    }

    if (!ordem) {
      throw new Error(`Ordem de carregamento não encontrada: ${ordemId}`);
    }
    
    // Obter o total de volumes das notas fiscais desta ordem
    const { data: notasFiscais, error: errorNotas } = await supabase
      .from('notas_fiscais')
      .select('quantidade_volumes')
      .eq('ordem_carregamento_id', ordemId);
    
    if (errorNotas) {
      throw new Error(`Erro ao buscar notas fiscais: ${errorNotas.message}`);
    }
    
    const totalVolumes = (notasFiscais || []).reduce(
      (total, nota) => total + (nota.quantidade_volumes || 0), 
      0
    );
    
    // Criar o carregamento
    const { data, error } = await supabase
      .from('carregamentos')
      .insert({
        ordem_carregamento_id: ordemId,
        data_inicio_carregamento: new Date().toISOString(),
        responsavel_carregamento_id: responsavelId,
        conferente_id: conferenteId,
        quantidade_volumes: totalVolumes,
        status: 'em_andamento'
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao iniciar carregamento: ${error.message}`);
    }

    if (!data) {
      throw new Error('Erro ao iniciar carregamento: dados não retornados');
    }
    
    // Atualizar status da ordem de carregamento
    await supabase
      .from('ordens_carregamento')
      .update({
        status: 'em_carregamento',
        data_inicio: new Date().toISOString()
      })
      .eq('id', ordemId);
    
    return data as unknown as Carregamento;
  },

  /**
   * Registra o endereçamento de um volume no caminhão
   */
  async enderecarVolume(
    carregamentoId: string,
    etiquetaId: string,
    posicao: string,
    ordem?: number
  ) {
    const { data, error } = await supabase
      .from('enderecamento_caminhao')
      .insert({
        carregamento_id: carregamentoId,
        etiqueta_id: etiquetaId,
        posicao,
        ordem
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao endereçar volume: ${error.message}`);
    }
    
    // Atualizar status da etiqueta
    await supabase
      .from('etiquetas')
      .update({
        status: 'carregado'
      })
      .eq('id', etiquetaId);
    
    return data;
  },

  /**
   * Finaliza um carregamento
   */
  async finalizarCarregamento(carregamentoId: string): Promise<Carregamento> {
    const { data: carregamento, error: errorCarregamento } = await supabase
      .from('carregamentos')
      .select('ordem_carregamento_id')
      .eq('id', carregamentoId)
      .single();
    
    if (errorCarregamento) {
      throw new Error(`Erro ao buscar carregamento: ${errorCarregamento.message}`);
    }

    if (!carregamento) {
      throw new Error(`Carregamento não encontrado: ${carregamentoId}`);
    }
    
    // Atualizar carregamento
    const { data, error } = await supabase
      .from('carregamentos')
      .update({
        data_fim_carregamento: new Date().toISOString(),
        status: 'concluido'
      })
      .eq('id', carregamentoId)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Erro ao finalizar carregamento: ${error.message}`);
    }

    if (!data) {
      throw new Error('Erro ao finalizar carregamento: dados não retornados');
    }
    
    // Atualizar ordem de carregamento
    await supabase
      .from('ordens_carregamento')
      .update({
        status: 'concluida',
        data_finalizacao: new Date().toISOString()
      })
      .eq('id', carregamento.ordem_carregamento_id);
    
    // Registrar a saída das notas fiscais
    await supabase
      .from('notas_fiscais')
      .update({
        data_saida: new Date().toISOString(),
        status: 'carregada'
      })
      .eq('ordem_carregamento_id', carregamento.ordem_carregamento_id);
    
    return data as unknown as Carregamento;
  },

  /**
   * Busca os volumes alocados em um carregamento
   */
  async buscarVolumesCarregamento(carregamentoId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('enderecamento_caminhao')
      .select(`
        *,
        etiqueta:etiqueta_id(*)
      `)
      .eq('carregamento_id', carregamentoId)
      .order('ordem', { ascending: true });
    
    if (error) {
      throw new Error(`Erro ao buscar volumes do carregamento: ${error.message}`);
    }
    
    return data || [];
  }
};

export default carregamentoService;
