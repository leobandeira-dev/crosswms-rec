import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { OrdemCarregamento, NotaFiscal } from "./types";

export const useOrdemCarregamentoReal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [ordensCarregamento, setOrdensCarregamento] = useState<OrdemCarregamento[]>([]);
  const [notasFiscaisDisponiveis, setNotasFiscaisDisponiveis] = useState<NotaFiscal[]>([]);

  // CREATE - Criar nova ordem de carregamento
  const createOrdemCarregamento = useCallback(async (dadosOrdem: any) => {
    setIsLoading(true);
    try {
      console.log('Criando ordem de carregamento:', dadosOrdem);
      
      const { data, error } = await supabase
        .from('ordens_carregamento')
        .insert({
          numero_ordem: `OC-${Date.now()}`,
          tipo_carregamento: dadosOrdem.tipoCarregamento || 'normal',
          empresa_cliente_id: dadosOrdem.clienteId,
          motorista_id: dadosOrdem.motoristaId,
          veiculo_id: dadosOrdem.veiculoId,
          data_programada: dadosOrdem.dataProgramada,
          observacoes: dadosOrdem.observacoes,
          status: 'pendente'
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar ordem:', error);
        throw error;
      }

      console.log('Ordem criada:', data);
      
      toast({
        title: "Ordem de Carregamento criada",
        description: `Ordem ${data.numero_ordem} criada com sucesso.`,
      });

      // Atualizar lista
      await fetchOrdensCarregamento();
      
      return data;
    } catch (error) {
      console.error('Erro ao criar ordem de carregamento:', error);
      toast({
        title: "Erro ao criar Ordem de Carregamento",
        description: "Ocorreu um erro ao criar a ordem de carregamento.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // READ - Buscar ordens de carregamento reais do banco
  const fetchOrdensCarregamento = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Buscando ordens de carregamento...');
      
      const { data, error } = await supabase
        .from('ordens_carregamento')
        .select(`
          *,
          empresa_cliente:empresa_cliente_id(razao_social),
          motorista:motorista_id(nome),
          veiculo:veiculo_id(placa, modelo)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar ordens:', error);
        throw error;
      }

      console.log('Ordens encontradas:', data);

      // Transformar dados para o formato esperado
      const ordensFormatadas: OrdemCarregamento[] = (data || []).map(ordem => ({
        id: ordem.numero_ordem,
        cliente: ordem.empresa_cliente?.razao_social || 'Cliente não identificado',
        tipoCarregamento: ordem.tipo_carregamento || 'normal',
        dataCarregamento: new Date(ordem.data_programada || ordem.created_at).toLocaleDateString('pt-BR'),
        transportadora: 'Transportadora Padrão',
        placaVeiculo: ordem.veiculo?.placa || 'Não definido',
        motorista: ordem.motorista?.nome || 'Não definido',
        status: ordem.status as 'pending' | 'processing' | 'completed',
        volumesTotal: 0, // Será calculado baseado nas etiquetas
        volumesVerificados: 0,
        notasFiscais: []
      }));

      // Para cada ordem, buscar o total de volumes
      for (const ordem of ordensFormatadas) {
        const volumeCount = await contarVolumesOrdem(ordem.id);
        ordem.volumesTotal = volumeCount.total;
        ordem.volumesVerificados = volumeCount.verificados;
      }

      setOrdensCarregamento(ordensFormatadas);
      return ordensFormatadas;
    } catch (error) {
      console.error('Erro ao buscar ordens de carregamento:', error);
      toast({
        title: "Erro ao buscar Ordens de Carregamento",
        description: "Ocorreu um erro ao buscar as ordens de carregamento.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // READ - Contar volumes de uma ordem
  const contarVolumesOrdem = useCallback(async (numeroOrdem: string) => {
    try {
      // Buscar a ordem
      const { data: ordem, error: errorOrdem } = await supabase
        .from('ordens_carregamento')
        .select('id')
        .eq('numero_ordem', numeroOrdem)
        .single();

      if (errorOrdem || !ordem) {
        return { total: 0, verificados: 0 };
      }

      // Buscar notas fiscais da ordem
      const { data: notasFiscais, error: errorNotas } = await supabase
        .from('notas_fiscais')
        .select('id')
        .eq('ordem_carregamento_id', ordem.id);

      if (errorNotas || !notasFiscais) {
        return { total: 0, verificados: 0 };
      }

      const notasFiscaisIds = notasFiscais.map(nf => nf.id);

      if (notasFiscaisIds.length === 0) {
        return { total: 0, verificados: 0 };
      }

      // Contar etiquetas totais
      const { count: totalCount, error: errorTotal } = await supabase
        .from('etiquetas')
        .select('*', { count: 'exact', head: true })
        .in('nota_fiscal_id', notasFiscaisIds)
        .eq('tipo', 'volume');

      // Contar etiquetas verificadas/posicionadas
      const { count: verificadosCount, error: errorVerificados } = await supabase
        .from('etiquetas')
        .select('*', { count: 'exact', head: true })
        .in('nota_fiscal_id', notasFiscaisIds)
        .eq('tipo', 'volume')
        .in('status', ['verificado', 'posicionado']);

      if (errorTotal || errorVerificados) {
        console.error('Erro ao contar volumes:', errorTotal || errorVerificados);
        return { total: 0, verificados: 0 };
      }

      return {
        total: totalCount || 0,
        verificados: verificadosCount || 0
      };
    } catch (error) {
      console.error('Erro ao contar volumes:', error);
      return { total: 0, verificados: 0 };
    }
  }, []);

  // READ - Buscar notas fiscais disponíveis para importação com filtros aprimorados
  const fetchNotasFiscaisDisponiveis = useCallback(async (filtros?: {
    status?: string;
    fornecedor?: string;
    dataInicio?: string;
    dataFim?: string;
    valorMinimo?: number;
    valorMaximo?: number;
    termo?: string;
  }) => {
    setIsLoading(true);
    try {
      console.log('Buscando notas fiscais disponíveis com filtros:', filtros);
      
      let query = supabase
        .from('notas_fiscais')
        .select('*')
        .is('ordem_carregamento_id', null) // Notas que ainda não estão em uma ordem
        .order('data_inclusao', { ascending: false });

      // Aplicar filtros se fornecidos
      if (filtros?.status && filtros.status !== 'all') {
        query = query.eq('status', filtros.status);
      } else {
        query = query.eq('status', 'pendente'); // Default para pendente
      }

      if (filtros?.fornecedor) {
        query = query.ilike('emitente_razao_social', `%${filtros.fornecedor}%`);
      }

      if (filtros?.dataInicio) {
        query = query.gte('data_emissao', filtros.dataInicio);
      }

      if (filtros?.dataFim) {
        query = query.lte('data_emissao', filtros.dataFim);
      }

      if (filtros?.valorMinimo) {
        query = query.gte('valor_total', filtros.valorMinimo);
      }

      if (filtros?.valorMaximo) {
        query = query.lte('valor_total', filtros.valorMaximo);
      }

      if (filtros?.termo) {
        query = query.or(`numero.ilike.%${filtros.termo}%,emitente_razao_social.ilike.%${filtros.termo}%,destinatario_razao_social.ilike.%${filtros.termo}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro ao buscar notas fiscais:', error);
        throw error;
      }

      console.log('Notas fiscais encontradas:', data);

      // Transformar dados para o formato esperado
      const notasFormatadas: NotaFiscal[] = (data || []).map(nota => ({
        id: nota.id,
        numero: nota.numero,
        remetente: nota.emitente_razao_social || 'Remetente não identificado',
        cliente: nota.destinatario_razao_social || 'Cliente não identificado',
        pedido: nota.numero_pedido || '',
        dataEmissao: new Date(nota.data_emissao).toLocaleDateString('pt-BR'),
        valor: nota.valor_total || 0,
        pesoBruto: nota.peso_bruto || 0,
        status: nota.status || 'pendente'
      }));

      setNotasFiscaisDisponiveis(notasFormatadas);
      return notasFormatadas;
    } catch (error) {
      console.error('Erro ao buscar notas fiscais:', error);
      toast({
        title: "Erro ao buscar Notas Fiscais",
        description: "Ocorreu um erro ao buscar as notas fiscais disponíveis.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // UPDATE - Importar notas fiscais para uma ordem
  const importarNotasFiscais = useCallback(async (ordemId: string, notasIds: string[]) => {
    setIsLoading(true);
    try {
      console.log('Importando notas fiscais:', { ordemId, notasIds });
      
      // Buscar a ordem de carregamento real pelo número
      const { data: ordem, error: errorOrdem } = await supabase
        .from('ordens_carregamento')
        .select('id')
        .eq('numero_ordem', ordemId)
        .single();

      if (errorOrdem || !ordem) {
        throw new Error('Ordem de carregamento não encontrada');
      }

      // UPDATE - Atualizar as notas fiscais para referenciar esta ordem
      const { error: errorUpdate } = await supabase
        .from('notas_fiscais')
        .update({ ordem_carregamento_id: ordem.id })
        .in('id', notasIds);

      if (errorUpdate) {
        console.error('Erro ao vincular notas fiscais:', errorUpdate);
        throw errorUpdate;
      }

      // CREATE - Criar itens de carregamento
      const itensCarregamento = notasIds.map(notaId => ({
        ordem_carregamento_id: ordem.id,
        nota_fiscal_id: notaId,
        status: 'pendente'
      }));

      const { error: errorItens } = await supabase
        .from('itens_carregamento')
        .insert(itensCarregamento);

      if (errorItens) {
        console.error('Erro ao criar itens de carregamento:', errorItens);
        throw errorItens;
      }

      toast({
        title: "Notas Fiscais importadas",
        description: `${notasIds.length} notas fiscais foram importadas com sucesso.`,
      });

      // Atualizar listas
      await fetchOrdensCarregamento();
      await fetchNotasFiscaisDisponiveis();

    } catch (error) {
      console.error('Erro ao importar notas fiscais:', error);
      toast({
        title: "Erro ao importar Notas Fiscais",
        description: "Ocorreu um erro ao importar as notas fiscais.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [fetchOrdensCarregamento, fetchNotasFiscaisDisponiveis]);

  // UPDATE - Iniciar carregamento
  const iniciarCarregamento = useCallback(async (ordemNumero: string) => {
    try {
      console.log('Iniciando carregamento para ordem:', ordemNumero);
      
      const { error } = await supabase
        .from('ordens_carregamento')
        .update({ 
          status: 'em_carregamento',
          data_inicio: new Date().toISOString()
        })
        .eq('numero_ordem', ordemNumero);

      if (error) {
        console.error('Erro ao iniciar carregamento:', error);
        throw error;
      }

      toast({
        title: "Carregamento iniciado",
        description: `Carregamento da OC ${ordemNumero} iniciado com sucesso.`,
      });

      // Atualizar estado local
      setOrdensCarregamento(prev => 
        prev.map(oc => {
          if (oc.id === ordemNumero) {
            return { ...oc, status: 'processing' as const };
          }
          return oc;
        })
      );

    } catch (error) {
      console.error('Erro ao iniciar carregamento:', error);
      toast({
        title: "Erro ao iniciar carregamento",
        description: "Ocorreu um erro ao iniciar o carregamento.",
        variant: "destructive",
      });
    }
  }, []);

  // UPDATE - Finalizar carregamento
  const finalizarCarregamento = useCallback(async (ordemNumero: string) => {
    try {
      console.log('Finalizando carregamento para ordem:', ordemNumero);
      
      const { error } = await supabase
        .from('ordens_carregamento')
        .update({ 
          status: 'concluida',
          data_finalizacao: new Date().toISOString()
        })
        .eq('numero_ordem', ordemNumero);

      if (error) {
        console.error('Erro ao finalizar carregamento:', error);
        throw error;
      }

      toast({
        title: "Carregamento finalizado",
        description: `Carregamento da OC ${ordemNumero} finalizado com sucesso.`,
      });

      // Atualizar estado local
      setOrdensCarregamento(prev => 
        prev.map(oc => {
          if (oc.id === ordemNumero) {
            return { ...oc, status: 'completed' as const };
          }
          return oc;
        })
      );

    } catch (error) {
      console.error('Erro ao finalizar carregamento:', error);
      toast({
        title: "Erro ao finalizar carregamento",
        description: "Ocorreu um erro ao finalizar o carregamento.",
        variant: "destructive",
      });
    }
  }, []);

  // DELETE - Cancelar ordem de carregamento
  const cancelarOrdemCarregamento = useCallback(async (ordemNumero: string) => {
    try {
      console.log('Cancelando ordem de carregamento:', ordemNumero);
      
      // Buscar a ordem
      const { data: ordem, error: errorOrdem } = await supabase
        .from('ordens_carregamento')
        .select('id')
        .eq('numero_ordem', ordemNumero)
        .single();

      if (errorOrdem || !ordem) {
        throw new Error('Ordem não encontrada');
      }

      // DELETE - Remover itens de carregamento
      await supabase
        .from('itens_carregamento')
        .delete()
        .eq('ordem_carregamento_id', ordem.id);

      // UPDATE - Liberar notas fiscais
      await supabase
        .from('notas_fiscais')
        .update({ ordem_carregamento_id: null })
        .eq('ordem_carregamento_id', ordem.id);

      // DELETE - Remover a ordem
      const { error } = await supabase
        .from('ordens_carregamento')
        .delete()
        .eq('numero_ordem', ordemNumero);

      if (error) {
        console.error('Erro ao cancelar ordem:', error);
        throw error;
      }

      toast({
        title: "Ordem cancelada",
        description: `Ordem ${ordemNumero} cancelada com sucesso.`,
      });

      // Atualizar listas
      await fetchOrdensCarregamento();
      await fetchNotasFiscaisDisponiveis();

    } catch (error) {
      console.error('Erro ao cancelar ordem:', error);
      toast({
        title: "Erro ao cancelar ordem",
        description: "Ocorreu um erro ao cancelar a ordem.",
        variant: "destructive",
      });
    }
  }, [fetchOrdensCarregamento, fetchNotasFiscaisDisponiveis]);

  // READ - Buscar ordem específica
  const buscarOrdemPorNumero = useCallback(async (numeroOrdem: string) => {
    try {
      const { data, error } = await supabase
        .from('ordens_carregamento')
        .select(`
          *,
          empresa_cliente:empresa_cliente_id(razao_social),
          motorista:motorista_id(nome),
          veiculo:veiculo_id(placa, modelo)
        `)
        .eq('numero_ordem', numeroOrdem)
        .single();

      if (error) {
        console.error('Erro ao buscar ordem:', error);
        return null;
      }

      const ordemFormatada: OrdemCarregamento = {
        id: data.numero_ordem,
        cliente: data.empresa_cliente?.razao_social || 'Cliente não identificado',
        tipoCarregamento: data.tipo_carregamento || 'normal',
        dataCarregamento: new Date(data.data_programada || data.created_at).toLocaleDateString('pt-BR'),
        transportadora: 'Transportadora Padrão',
        placaVeiculo: data.veiculo?.placa || 'Não definido',
        motorista: data.motorista?.nome || 'Não definido',
        status: data.status as 'pending' | 'processing' | 'completed',
        volumesTotal: 0,
        volumesVerificados: 0,
        notasFiscais: []
      };

      const volumeCount = await contarVolumesOrdem(numeroOrdem);
      ordemFormatada.volumesTotal = volumeCount.total;
      ordemFormatada.volumesVerificados = volumeCount.verificados;

      return ordemFormatada;
    } catch (error) {
      console.error('Erro ao buscar ordem por número:', error);
      return null;
    }
  }, [contarVolumesOrdem]);

  return {
    isLoading,
    ordensCarregamento,
    notasFiscaisDisponiveis,
    // READ operations
    fetchOrdensCarregamento,
    fetchNotasFiscaisDisponiveis,
    buscarOrdemPorNumero,
    contarVolumesOrdem,
    // CREATE operations
    createOrdemCarregamento,
    // UPDATE operations
    importarNotasFiscais,
    iniciarCarregamento,
    finalizarCarregamento,
    // DELETE operations
    cancelarOrdemCarregamento
  };
};
