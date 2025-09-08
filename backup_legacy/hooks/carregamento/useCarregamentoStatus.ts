
import { useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface StatusCarregamento {
  ordensTotal: number;
  ordensPendentes: number;
  ordensEmAndamento: number;
  ordensConcluidas: number;
  volumesTotais: number;
  volumesVerificados: number;
  volumesPosicionados: number;
  percentualConclusao: number;
  ultimaAtualizacao: string;
}

export const useCarregamentoStatus = () => {
  const [status, setStatus] = useState<StatusCarregamento>({
    ordensTotal: 0,
    ordensPendentes: 0,
    ordensEmAndamento: 0,
    ordensConcluidas: 0,
    volumesTotais: 0,
    volumesVerificados: 0,
    volumesPosicionados: 0,
    percentualConclusao: 0,
    ultimaAtualizacao: new Date().toLocaleString('pt-BR')
  });
  const [isLoading, setIsLoading] = useState(false);

  // READ - Buscar status geral do carregamento
  const buscarStatusCarregamento = useCallback(async () => {
    setIsLoading(true);
    try {
      // Buscar estatísticas das ordens
      const { data: ordens, error: errorOrdens } = await supabase
        .from('ordens_carregamento')
        .select('status, id');

      if (errorOrdens) {
        throw errorOrdens;
      }

      const ordensTotal = ordens?.length || 0;
      const ordensPendentes = ordens?.filter(o => o.status === 'pendente').length || 0;
      const ordensEmAndamento = ordens?.filter(o => o.status === 'em_carregamento').length || 0;
      const ordensConcluidas = ordens?.filter(o => o.status === 'concluida').length || 0;

      // Buscar estatísticas dos volumes
      const ordensIds = ordens?.map(o => o.id) || [];
      
      let volumesTotais = 0;
      let volumesVerificados = 0;
      let volumesPosicionados = 0;

      if (ordensIds.length > 0) {
        // Buscar notas fiscais das ordens
        const { data: notasFiscais, error: errorNotas } = await supabase
          .from('notas_fiscais')
          .select('id')
          .in('ordem_carregamento_id', ordensIds);

        if (!errorNotas && notasFiscais) {
          const notasIds = notasFiscais.map(nf => nf.id);

          if (notasIds.length > 0) {
            // Contar volumes totais
            const { count: totalCount, error: errorTotal } = await supabase
              .from('etiquetas')
              .select('*', { count: 'exact', head: true })
              .in('nota_fiscal_id', notasIds)
              .eq('tipo', 'volume');

            // Contar volumes verificados
            const { count: verificadosCount, error: errorVerificados } = await supabase
              .from('etiquetas')
              .select('*', { count: 'exact', head: true })
              .in('nota_fiscal_id', notasIds)
              .eq('tipo', 'volume')
              .eq('status', 'verificado');

            // Contar volumes posicionados
            const { count: posicionadosCount, error: errorPosicionados } = await supabase
              .from('etiquetas')
              .select('*', { count: 'exact', head: true })
              .in('nota_fiscal_id', notasIds)
              .eq('tipo', 'volume')
              .eq('status', 'posicionado');

            if (!errorTotal && !errorVerificados && !errorPosicionados) {
              volumesTotais = totalCount || 0;
              volumesVerificados = verificadosCount || 0;
              volumesPosicionados = posicionadosCount || 0;
            }
          }
        }
      }

      const percentualConclusao = volumesTotais > 0 
        ? Math.round(((volumesVerificados + volumesPosicionados) / volumesTotais) * 100)
        : 0;

      const novoStatus: StatusCarregamento = {
        ordensTotal,
        ordensPendentes,
        ordensEmAndamento,
        ordensConcluidas,
        volumesTotais,
        volumesVerificados,
        volumesPosicionados,
        percentualConclusao,
        ultimaAtualizacao: new Date().toLocaleString('pt-BR')
      };

      setStatus(novoStatus);
      return novoStatus;

    } catch (error) {
      console.error('Erro ao buscar status do carregamento:', error);
      return status;
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  // Buscar status ao montar o hook
  useEffect(() => {
    buscarStatusCarregamento();
  }, []);

  // Função para refresh manual do status
  const refreshStatus = useCallback(() => {
    return buscarStatusCarregamento();
  }, [buscarStatusCarregamento]);

  // Função para monitorar mudanças em tempo real (opcional)
  const iniciarMonitoramentoRealTime = useCallback(() => {
    const channel = supabase
      .channel('carregamento_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ordens_carregamento'
        },
        () => {
          console.log('Mudança detectada em ordens_carregamento');
          buscarStatusCarregamento();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'etiquetas'
        },
        () => {
          console.log('Mudança detectada em etiquetas');
          buscarStatusCarregamento();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [buscarStatusCarregamento]);

  return {
    status,
    isLoading,
    refreshStatus,
    buscarStatusCarregamento,
    iniciarMonitoramentoRealTime
  };
};
