import { supabase } from "@/integrations/supabase/client";
import { Etiqueta } from "@/types/supabase/armazem.types";

export interface CreateEtiquetaData {
  codigo: string;
  tipo: string;
  area?: string | null;
  remetente?: string | null;
  destinatario?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  uf?: string | null;
  cep?: string | null;
  descricao?: string | null;
  transportadora?: string | null;
  chave_nf?: string | null;
  quantidade?: number;
  peso_total_bruto?: string | null;
  numero_pedido?: string | null;
  volume_numero?: number;
  total_volumes?: number;
  codigo_onu?: string | null;
  codigo_risco?: string | null;
  classificacao_quimica?: string | null;
  etiqueta_mae_id?: string | null;
  status?: string;
}

export interface InutilizarEtiquetaData {
  motivo_inutilizacao: string;
  usuario_inutilizacao_id?: string;
}

const etiquetaService = {
  /**
   * Busca todas as etiquetas (READ)
   */
  async buscarEtiquetas(): Promise<Etiqueta[]> {
    try {
      console.log('🔍 Buscando etiquetas...');
      
      const { data, error } = await supabase
        .from('etiquetas')
        .select('*')
        .order('data_geracao', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao buscar etiquetas:', error);
        throw new Error(`Erro ao buscar etiquetas: ${error.message}`);
      }
      
      console.log(`✅ ${data?.length || 0} etiquetas encontradas`);
      return data || [];
    } catch (error) {
      console.error('💥 Erro no serviço buscarEtiquetas:', error);
      throw error;
    }
  },

  /**
   * Busca uma etiqueta por ID (READ)
   */
  async buscarEtiquetaPorId(id: string): Promise<Etiqueta> {
    try {
      console.log(`🔍 Buscando etiqueta por ID: ${id}`);
      
      if (!id || id.trim() === '') {
        throw new Error('ID da etiqueta é obrigatório');
      }

      const { data, error } = await supabase
        .from('etiquetas')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('❌ Erro no Supabase ao buscar etiqueta por ID:', error);
        throw new Error(`Erro ao buscar etiqueta por ID: ${error.message}`);
      }
      
      if (!data) {
        throw new Error(`Etiqueta com ID ${id} não encontrada`);
      }
      
      console.log('✅ Etiqueta encontrada:', data);
      return data;
    } catch (error) {
      console.error('💥 Erro no serviço buscarEtiquetaPorId:', error);
      throw error;
    }
  },

  /**
   * Busca etiquetas por código (READ)
   */
  async buscarEtiquetasPorCodigo(codigo: string): Promise<Etiqueta[]> {
    try {
      const { data, error } = await supabase
        .from('etiquetas')
        .select('*')
        .ilike('codigo', `%${codigo}%`)
        .order('data_geracao', { ascending: false });
      
      if (error) {
        throw new Error(`Erro ao buscar etiquetas por código: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('💥 Erro no serviço buscarEtiquetasPorCodigo:', error);
      throw error;
    }
  },

  /**
   * Cria uma nova etiqueta (CREATE)
   */
  async criarEtiqueta(etiquetaData: CreateEtiquetaData): Promise<Etiqueta> {
    try {
      console.log('💾 Criando etiqueta:', etiquetaData.codigo);
      console.log('📋 Dados recebidos:', etiquetaData);
      
      // Validações básicas
      if (!etiquetaData.codigo || etiquetaData.codigo.trim() === '') {
        throw new Error('Código da etiqueta é obrigatório');
      }
      
      if (!etiquetaData.tipo) {
        throw new Error('Tipo da etiqueta é obrigatório');
      }

      // Preparar descrição no novo formato se for volume
      let descricaoFormatada = etiquetaData.descricao;
      if (etiquetaData.tipo === 'volume' && etiquetaData.volume_numero && etiquetaData.total_volumes) {
        descricaoFormatada = `Volume ${etiquetaData.volume_numero}/${etiquetaData.total_volumes}`;
      }

      // Preparar dados para inserção, removendo campos undefined
      const etiquetaToInsert = {
        codigo: etiquetaData.codigo,
        tipo: etiquetaData.tipo,
        area: etiquetaData.area,
        remetente: etiquetaData.remetente,
        destinatario: etiquetaData.destinatario,
        endereco: etiquetaData.endereco,
        cidade: etiquetaData.cidade,
        uf: etiquetaData.uf,
        cep: etiquetaData.cep,
        descricao: descricaoFormatada,
        transportadora: etiquetaData.transportadora,
        chave_nf: etiquetaData.chave_nf,
        quantidade: etiquetaData.quantidade || 1,
        peso_total_bruto: etiquetaData.peso_total_bruto,
        numero_pedido: etiquetaData.numero_pedido,
        volume_numero: etiquetaData.volume_numero || 1,
        total_volumes: etiquetaData.total_volumes || 1,
        codigo_onu: etiquetaData.codigo_onu,
        codigo_risco: etiquetaData.codigo_risco,
        classificacao_quimica: etiquetaData.classificacao_quimica,
        etiqueta_mae_id: etiquetaData.etiqueta_mae_id,
        status: etiquetaData.status || 'gerada',
        etiquetado: false,
        fragil: false
      };

      console.log('📤 Enviando para Supabase:', etiquetaToInsert);

      const { data, error } = await supabase
        .from('etiquetas')
        .insert(etiquetaToInsert)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro do Supabase:', error);
        console.error('📋 Detalhes:', error.details);
        console.error('💡 Sugestão:', error.hint);
        throw new Error(`Erro ao criar etiqueta: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Etiqueta criada mas dados não retornados');
      }
      
      console.log('✅ Etiqueta criada com sucesso:', data.id);
      return data;
    } catch (error) {
      console.error('💥 Erro no serviço criarEtiqueta:', error);
      throw error;
    }
  },

  /**
   * Atualiza uma etiqueta existente usando ID como chave primária (UPDATE)
   */
  async atualizarEtiqueta(id: string, etiquetaData: Partial<CreateEtiquetaData>): Promise<Etiqueta> {
    try {
      console.log(`🔄 Atualizando etiqueta com ID: ${id}`, etiquetaData);
      
      // Validação de ID
      if (!id || id.trim() === '') {
        throw new Error('ID da etiqueta é obrigatório para atualização');
      }

      // Verificar se a etiqueta existe usando o ID como chave primária
      const etiquetaExistente = await this.buscarEtiquetaPorId(id);
      if (!etiquetaExistente) {
        throw new Error(`Etiqueta com ID ${id} não encontrada`);
      }

      const updateData = {
        ...etiquetaData,
        updated_at: new Date().toISOString()
      };

      console.log('📤 Dados para atualização:', updateData);

      const { data, error } = await supabase
        .from('etiquetas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro no Supabase ao atualizar etiqueta:', error);
        throw new Error(`Erro ao atualizar etiqueta: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Etiqueta atualizada mas dados não retornados');
      }
      
      console.log('✅ Etiqueta atualizada com sucesso:', data);
      return data;
    } catch (error) {
      console.error('💥 Erro no serviço atualizarEtiqueta:', error);
      throw error;
    }
  },

  /**
   * Exclui uma etiqueta usando ID como chave primária (DELETE)
   */
  async excluirEtiqueta(id: string): Promise<void> {
    try {
      console.log(`🗑️ Excluindo etiqueta com ID: ${id}`);
      
      // Validação de ID
      if (!id || id.trim() === '') {
        throw new Error('ID da etiqueta é obrigatório para exclusão');
      }

      // Verificar se a etiqueta existe usando o ID como chave primária
      const etiquetaExistente = await this.buscarEtiquetaPorId(id);
      if (!etiquetaExistente) {
        throw new Error(`Etiqueta com ID ${id} não encontrada`);
      }

      // Verificar se a etiqueta pode ser excluída (não está etiquetada)
      if (etiquetaExistente.etiquetado) {
        throw new Error('Não é possível excluir uma etiqueta que já foi impressa. Use a função de inutilizar.');
      }

      const { error } = await supabase
        .from('etiquetas')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ Erro no Supabase ao excluir etiqueta:', error);
        throw new Error(`Erro ao excluir etiqueta: ${error.message}`);
      }
      
      console.log('✅ Etiqueta excluída com sucesso');
    } catch (error) {
      console.error('💥 Erro no serviço excluirEtiqueta:', error);
      throw error;
    }
  },

  /**
   * Marca etiqueta como etiquetada (impressa) usando ID como chave primária (UPDATE)
   */
  async marcarComoEtiquetada(id: string): Promise<void> {
    try {
      console.log(`🖨️ Marcando etiqueta como etiquetada - ID: ${id}`);
      
      if (!id || id.trim() === '') {
        throw new Error('ID da etiqueta é obrigatório');
      }

      const updateData = {
        status: 'etiquetada',
        etiquetado: true,
        data_impressao: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('etiquetas')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error('❌ Erro no Supabase ao marcar etiqueta como etiquetada:', error);
        throw new Error(`Erro ao marcar etiqueta como etiquetada: ${error.message}`);
      }
      
      console.log('✅ Etiqueta marcada como etiquetada com sucesso');
    } catch (error) {
      console.error('💥 Erro no serviço marcarComoEtiquetada:', error);
      throw error;
    }
  },

  /**
   * Inutiliza uma etiqueta usando ID como chave primária (UPDATE)
   */
  async inutilizarEtiqueta(id: string, dados: InutilizarEtiquetaData): Promise<void> {
    try {
      console.log(`❌ Inutilizando etiqueta com ID: ${id}`, dados);
      
      if (!id || id.trim() === '') {
        throw new Error('ID da etiqueta é obrigatório');
      }

      if (!dados.motivo_inutilizacao || dados.motivo_inutilizacao.trim() === '') {
        throw new Error('Motivo de inutilização é obrigatório');
      }

      const updateData = {
        status: 'inutilizada',
        motivo_inutilizacao: dados.motivo_inutilizacao,
        data_inutilizacao: new Date().toISOString(),
        usuario_inutilizacao_id: dados.usuario_inutilizacao_id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('etiquetas')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error('❌ Erro no Supabase ao inutilizar etiqueta:', error);
        throw new Error(`Erro ao inutilizar etiqueta: ${error.message}`);
      }
      
      console.log('✅ Etiqueta inutilizada com sucesso');
    } catch (error) {
      console.error('💥 Erro no serviço inutilizarEtiqueta:', error);
      throw error;
    }
  },

  /**
   * Cria uma unitização (etiqueta mãe) (CREATE)
   */
  async criarUnitizacao(dados: {
    codigo: string;
    tipo_unitizacao: string;
    observacoes?: string;
  }) {
    try {
      if (!dados.codigo) {
        throw new Error('Código da unitização é obrigatório');
      }

      if (!dados.tipo_unitizacao) {
        throw new Error('Tipo de unitização é obrigatório');
      }

      const { data, error } = await supabase
        .from('unitizacoes')
        .insert({
          ...dados,
          data_unitizacao: new Date().toISOString(),
          status: 'ativo'
        })
        .select()
        .single();
      
      if (error) {
        throw new Error(`Erro ao criar unitização: ${error.message}`);
      }
      
      return data;
    } catch (error) {
      console.error('Erro no serviço criarUnitizacao:', error);
      throw error;
    }
  },

  /**
   * Vincula etiquetas a uma unitização (CREATE)
   */
  async vincularEtiquetasUnitizacao(unitizacaoId: string, etiquetaIds: string[]): Promise<void> {
    try {
      if (!unitizacaoId) {
        throw new Error('ID da unitização é obrigatório');
      }

      if (!etiquetaIds || etiquetaIds.length === 0) {
        throw new Error('Lista de IDs de etiquetas é obrigatória');
      }

      const vinculos = etiquetaIds.map(etiquetaId => ({
        unitizacao_id: unitizacaoId,
        etiqueta_id: etiquetaId,
        data_inclusao: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('etiquetas_unitizacao')
        .insert(vinculos);
      
      if (error) {
        throw new Error(`Erro ao vincular etiquetas à unitização: ${error.message}`);
      }

      // Atualizar status das etiquetas para unitizadas
      const { error: updateError } = await supabase
        .from('etiquetas')
        .update({
          status: 'unitizada',
          etiqueta_mae_id: unitizacaoId,
          updated_at: new Date().toISOString()
        })
        .in('id', etiquetaIds);

      if (updateError) {
        throw new Error(`Erro ao atualizar status das etiquetas: ${updateError.message}`);
      }
    } catch (error) {
      console.error('Erro no serviço vincularEtiquetasUnitizacao:', error);
      throw error;
    }
  }
};

export default etiquetaService;
