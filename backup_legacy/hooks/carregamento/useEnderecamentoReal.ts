
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Volume {
  id: string;
  codigo: string;
  notaFiscal: string;
  produto: string;
  peso: number;
  dimensoes: string;
  fragil: boolean;
  posicaoAtual?: string;
}

interface PosicaoEnderecamento {
  id: string;
  posicao: string;
  ocupada: boolean;
  volumeId?: string;
}

export const useEnderecamentoReal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [posicoes, setPosicoes] = useState<PosicaoEnderecamento[]>([]);

  // Buscar volumes para endereçamento de uma ordem
  const buscarVolumesParaEnderecamento = useCallback(async (numeroOrdem: string) => {
    setIsLoading(true);
    try {
      console.log('Buscando volumes para endereçamento da ordem:', numeroOrdem);
      
      // Buscar a ordem de carregamento
      const { data: ordem, error: errorOrdem } = await supabase
        .from('ordens_carregamento')
        .select('id')
        .eq('numero_ordem', numeroOrdem)
        .single();

      if (errorOrdem || !ordem) {
        throw new Error('Ordem de carregamento não encontrada');
      }

      // Buscar notas fiscais da ordem
      const { data: notasFiscais, error: errorNotas } = await supabase
        .from('notas_fiscais')
        .select('id, numero')
        .eq('ordem_carregamento_id', ordem.id);

      if (errorNotas || !notasFiscais) {
        throw new Error('Erro ao buscar notas fiscais da ordem');
      }

      const notasFiscaisIds = notasFiscais.map(nf => nf.id);

      if (notasFiscaisIds.length === 0) {
        setVolumes([]);
        return [];
      }

      // Buscar etiquetas (volumes) das notas fiscais
      const { data: etiquetas, error: errorEtiquetas } = await supabase
        .from('etiquetas')
        .select(`
          id,
          codigo,
          peso,
          altura,
          largura,
          comprimento,
          fragil,
          descricao,
          nota_fiscal_id,
          status
        `)
        .in('nota_fiscal_id', notasFiscaisIds)
        .eq('tipo', 'volume')
        .in('status', ['verificado', 'posicionado']);

      if (errorEtiquetas) {
        throw new Error(`Erro ao buscar volumes: ${errorEtiquetas.message}`);
      }

      // Transformar dados para o formato esperado
      const volumesFormatados: Volume[] = (etiquetas || []).map(etiqueta => {
        const notaFiscal = notasFiscais.find(nf => nf.id === etiqueta.nota_fiscal_id);
        return {
          id: etiqueta.id,
          codigo: etiqueta.codigo,
          notaFiscal: notaFiscal?.numero || 'N/A',
          produto: etiqueta.descricao || 'Produto não especificado',
          peso: etiqueta.peso || 0,
          dimensoes: `${etiqueta.altura || 0}x${etiqueta.largura || 0}x${etiqueta.comprimento || 0}cm`,
          fragil: etiqueta.fragil || false,
          posicaoAtual: etiqueta.status === 'posicionado' ? 'Posicionado' : undefined
        };
      });

      setVolumes(volumesFormatados);
      return volumesFormatados;
    } catch (error) {
      console.error('Erro ao buscar volumes para endereçamento:', error);
      toast({
        title: "Erro ao buscar volumes",
        description: "Ocorreu um erro ao buscar os volumes para endereçamento.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Buscar posições disponíveis no caminhão
  const buscarPosicoesDisponiveis = useCallback(async (carregamentoId: string) => {
    try {
      console.log('Buscando posições disponíveis para carregamento:', carregamentoId);
      
      const { data: enderecamentos, error } = await supabase
        .from('enderecamento_caminhao')
        .select('*')
        .eq('carregamento_id', carregamentoId);

      if (error) {
        throw new Error(`Erro ao buscar endereçamentos: ${error.message}`);
      }

      // Gerar layout padrão de posições (simulado)
      const posicoesLayout: PosicaoEnderecamento[] = [];
      
      // Criar posições A1-A10, B1-B10, C1-C10
      ['A', 'B', 'C'].forEach(letra => {
        for (let i = 1; i <= 10; i++) {
          const posicao = `${letra}${i}`;
          const enderecamento = enderecamentos?.find(e => e.posicao === posicao);
          
          posicoesLayout.push({
            id: `pos-${posicao}`,
            posicao,
            ocupada: !!enderecamento,
            volumeId: enderecamento?.etiqueta_id
          });
        }
      });

      setPosicoes(posicoesLayout);
      return posicoesLayout;
    } catch (error) {
      console.error('Erro ao buscar posições:', error);
      toast({
        title: "Erro ao buscar posições",
        description: "Ocorreu um erro ao buscar as posições do caminhão.",
        variant: "destructive",
      });
      return [];
    }
  }, []);

  // Endereçar volume em uma posição
  const endercarVolume = useCallback(async (volumeId: string, posicao: string, carregamentoId: string) => {
    try {
      console.log('Endereçando volume:', { volumeId, posicao, carregamentoId });
      
      // Verificar se a posição já está ocupada
      const { data: existente, error: errorVerificacao } = await supabase
        .from('enderecamento_caminhao')
        .select('id')
        .eq('carregamento_id', carregamentoId)
        .eq('posicao', posicao)
        .single();

      if (existente) {
        throw new Error('Posição já está ocupada');
      }

      // Criar o endereçamento
      const { error: errorInsert } = await supabase
        .from('enderecamento_caminhao')
        .insert({
          carregamento_id: carregamentoId,
          etiqueta_id: volumeId,
          posicao: posicao,
          ordem: parseInt(posicao.substring(1)) // Extrair número da posição
        });

      if (errorInsert) {
        throw new Error(`Erro ao endereçar volume: ${errorInsert.message}`);
      }

      // Atualizar status da etiqueta para 'posicionado'
      const { error: errorUpdate } = await supabase
        .from('etiquetas')
        .update({ status: 'posicionado' })
        .eq('id', volumeId);

      if (errorUpdate) {
        console.warn('Aviso ao atualizar status da etiqueta:', errorUpdate.message);
      }

      toast({
        title: "Volume endereçado",
        description: `Volume posicionado com sucesso na posição ${posicao}.`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao endereçar volume:', error);
      toast({
        title: "Erro ao endereçar volume",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao endereçar o volume.",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  // Atualizar status do volume
  const atualizarStatusVolume = useCallback(async (volumeId: string, novoStatus: string) => {
    try {
      console.log('Atualizando status do volume:', { volumeId, novoStatus });
      
      const { error } = await supabase
        .from('etiquetas')
        .update({ status: novoStatus })
        .eq('id', volumeId);

      if (error) {
        throw new Error(`Erro ao atualizar status: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do volume:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status do volume.",
        variant: "destructive",
      });
      return false;
    }
  }, []);

  return {
    isLoading,
    volumes,
    posicoes,
    buscarVolumesParaEnderecamento,
    buscarPosicoesDisponiveis,
    endercarVolume,
    atualizarStatusVolume
  };
};
