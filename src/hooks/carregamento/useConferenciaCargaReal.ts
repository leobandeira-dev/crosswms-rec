
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

interface ItemConferencia {
  id: string;
  produto: string;
  quantidade: number;
  verificado: boolean;
  etiquetaMae: string;
  notaFiscal: string;
  peso?: number;
  descricao?: string;
}

interface OrdemConferencia {
  id: string;
  cliente: string;
  destinatario: string;
  dataCarregamento: string;
  volumesTotal: number;
  volumesVerificados: number;
  status: 'pending' | 'processing' | 'completed';
  inicioConferencia?: string;
  fimConferencia?: string;
  conferenteResponsavel?: string;
}

export const useConferenciaCargaReal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [ordemSelecionada, setOrdemSelecionada] = useState<OrdemConferencia | null>(null);
  const [itensConferencia, setItensConferencia] = useState<ItemConferencia[]>([]);
  const [ordensEmConferencia, setOrdensEmConferencia] = useState<OrdemConferencia[]>([]);
  const [ordensConferidas, setOrdensConferidas] = useState<OrdemConferencia[]>([]);

  // READ - Buscar ordem por número para conferência
  const buscarOrdemParaConferencia = useCallback(async (numeroOrdem: string) => {
    setIsLoading(true);
    try {
      console.log('Buscando ordem para conferência:', numeroOrdem);

      // Buscar a ordem
      const { data: ordem, error: errorOrdem } = await supabase
        .from('ordens_carregamento')
        .select(`
          *,
          empresa_cliente:empresa_cliente_id(razao_social)
        `)
        .eq('numero_ordem', numeroOrdem)
        .single();

      if (errorOrdem || !ordem) {
        throw new Error('Ordem de carregamento não encontrada');
      }

      // Buscar notas fiscais da ordem
      const { data: notasFiscais, error: errorNotas } = await supabase
        .from('notas_fiscais')
        .select('id, numero, destinatario_razao_social, destinatario_cidade, destinatario_uf')
        .eq('ordem_carregamento_id', ordem.id);

      if (errorNotas) {
        throw errorNotas;
      }

      if (!notasFiscais || notasFiscais.length === 0) {
        setItensConferencia([]);
        setOrdemSelecionada(null);
        toast({
          title: "Nenhuma nota fiscal encontrada",
          description: "Esta ordem não possui notas fiscais vinculadas.",
          variant: "destructive",
        });
        return;
      }

      const notasFiscaisIds = notasFiscais.map(nf => nf.id);

      // Buscar etiquetas (volumes) das notas fiscais
      const { data: etiquetas, error: errorEtiquetas } = await supabase
        .from('etiquetas')
        .select('*')
        .in('nota_fiscal_id', notasFiscaisIds)
        .eq('tipo', 'volume');

      if (errorEtiquetas) {
        throw errorEtiquetas;
      }

      // Transformar dados para o formato de conferência
      const itensFormatados: ItemConferencia[] = (etiquetas || []).map(etiqueta => {
        const notaFiscal = notasFiscais.find(nf => nf.id === etiqueta.nota_fiscal_id);
        
        return {
          id: etiqueta.id,
          produto: etiqueta.descricao || 'Produto não especificado',
          quantidade: etiqueta.quantidade || 1,
          verificado: etiqueta.status === 'verificado' || etiqueta.status === 'posicionado',
          etiquetaMae: etiqueta.etiqueta_mae_id || etiqueta.codigo,
          notaFiscal: notaFiscal?.numero || '',
          peso: etiqueta.peso || 0,
          descricao: etiqueta.descricao
        };
      });

      const ordemFormatada: OrdemConferencia = {
        id: ordem.numero_ordem,
        cliente: ordem.empresa_cliente?.razao_social || 'Cliente não identificado',
        destinatario: notasFiscais[0]?.destinatario_razao_social || 'Destinatário não identificado',
        dataCarregamento: new Date(ordem.data_programada || ordem.created_at).toLocaleDateString('pt-BR'),
        volumesTotal: itensFormatados.length,
        volumesVerificados: itensFormatados.filter(item => item.verificado).length,
        status: ordem.status === 'pendente' ? 'pending' : 
                ordem.status === 'em_carregamento' ? 'processing' : 'completed',
        inicioConferencia: ordem.data_inicio ? new Date(ordem.data_inicio).toLocaleString('pt-BR') : undefined,
        fimConferencia: ordem.data_finalizacao ? new Date(ordem.data_finalizacao).toLocaleString('pt-BR') : undefined,
        conferenteResponsavel: 'Sistema' // Pode ser expandido para incluir usuário real
      };

      setOrdemSelecionada(ordemFormatada);
      setItensConferencia(itensFormatados);

    } catch (error) {
      console.error('Erro ao buscar ordem para conferência:', error);
      toast({
        title: "Erro ao buscar ordem",
        description: "Ocorreu um erro ao buscar a ordem para conferência.",
        variant: "destructive",
      });
      setOrdemSelecionada(null);
      setItensConferencia([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // UPDATE - Verificar item por volume
  const verificarItemPorVolume = useCallback(async (codigoVolume: string) => {
    try {
      // Buscar etiqueta pelo código
      const { data: etiqueta, error: errorEtiqueta } = await supabase
        .from('etiquetas')
        .select('*')
        .eq('codigo', codigoVolume)
        .single();

      if (errorEtiqueta || !etiqueta) {
        toast({
          title: "Volume não encontrado",
          description: "O código informado não corresponde a nenhum volume registrado.",
          variant: "destructive"
        });
        return false;
      }

      // Verificar se o volume pertence à ordem atual
      if (!ordemSelecionada) {
        toast({
          title: "Nenhuma ordem selecionada",
          description: "Selecione uma ordem antes de verificar volumes.",
          variant: "destructive"
        });
        return false;
      }

      const itemExistente = itensConferencia.find(item => item.id === etiqueta.id);

      if (!itemExistente) {
        toast({
          title: "Volume não pertence à ordem",
          description: "Este volume não faz parte da ordem atual.",
          variant: "destructive"
        });
        return false;
      }

      // UPDATE - Marcar etiqueta como verificada
      const { error: errorUpdate } = await supabase
        .from('etiquetas')
        .update({ status: 'verificado' })
        .eq('id', etiqueta.id);

      if (errorUpdate) {
        console.error('Erro ao atualizar status da etiqueta:', errorUpdate);
        throw errorUpdate;
      }

      // Atualizar estado local
      setItensConferencia(prev => 
        prev.map(item => 
          item.id === etiqueta.id ? { ...item, verificado: true } : item
        )
      );

      toast({
        title: "Volume verificado",
        description: `Volume ${codigoVolume} verificado com sucesso.`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao verificar volume:', error);
      toast({
        title: "Erro ao verificar volume",
        description: "Ocorreu um erro ao verificar o volume.",
        variant: "destructive",
      });
      return false;
    }
  }, [ordemSelecionada, itensConferencia]);

  // UPDATE - Verificar itens por nota fiscal
  const verificarItensPorNF = useCallback(async (numeroNF: string) => {
    try {
      if (!ordemSelecionada) {
        toast({
          title: "Nenhuma ordem selecionada",
          description: "Selecione uma ordem antes de verificar notas fiscais.",
          variant: "destructive"
        });
        return false;
      }

      // Buscar nota fiscal
      const { data: notaFiscal, error: errorNF } = await supabase
        .from('notas_fiscais')
        .select('id')
        .eq('numero', numeroNF)
        .single();

      if (errorNF || !notaFiscal) {
        toast({
          title: "Nota fiscal não encontrada",
          description: "O número informado não corresponde a nenhuma NF registrada.",
          variant: "destructive"
        });
        return false;
      }

      // Buscar etiquetas da nota fiscal
      const { data: etiquetas, error: errorEtiquetas } = await supabase
        .from('etiquetas')
        .select('id')
        .eq('nota_fiscal_id', notaFiscal.id)
        .eq('tipo', 'volume');

      if (errorEtiquetas) {
        throw errorEtiquetas;
      }

      if (!etiquetas || etiquetas.length === 0) {
        toast({
          title: "Nenhum volume encontrado",
          description: "Esta nota fiscal não possui volumes registrados.",
          variant: "destructive"
        });
        return false;
      }

      // Verificar se alguma etiqueta pertence à ordem atual
      const etiquetasNaOrdem = etiquetas.filter(etq => 
        itensConferencia.some(item => item.id === etq.id)
      );

      if (etiquetasNaOrdem.length === 0) {
        toast({
          title: "NF não pertence à ordem",
          description: "Esta nota fiscal não faz parte da ordem atual.",
          variant: "destructive"
        });
        return false;
      }

      // UPDATE - Marcar todas as etiquetas como verificadas
      const { error: errorUpdate } = await supabase
        .from('etiquetas')
        .update({ status: 'verificado' })
        .in('id', etiquetasNaOrdem.map(etq => etq.id));

      if (errorUpdate) {
        console.error('Erro ao atualizar status das etiquetas:', errorUpdate);
        throw errorUpdate;
      }

      // Atualizar estado local
      setItensConferencia(prev => 
        prev.map(item => 
          etiquetasNaOrdem.some(etq => etq.id === item.id) 
            ? { ...item, verificado: true } 
            : item
        )
      );

      toast({
        title: "Conferência por Nota Fiscal",
        description: `${etiquetasNaOrdem.length} volumes verificados com sucesso pela NF ${numeroNF}.`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao verificar por NF:', error);
      toast({
        title: "Erro ao verificar por NF",
        description: "Ocorreu um erro ao verificar os volumes por nota fiscal.",
        variant: "destructive",
      });
      return false;
    }
  }, [ordemSelecionada, itensConferencia]);

  // UPDATE - Verificar itens por etiqueta mãe
  const verificarItensPorEtiquetaMae = useCallback(async (codigoEtiquetaMae: string) => {
    try {
      if (!ordemSelecionada) {
        toast({
          title: "Nenhuma ordem selecionada",
          description: "Selecione uma ordem antes de verificar etiquetas mãe.",
          variant: "destructive"
        });
        return false;
      }

      // Buscar etiquetas com a etiqueta mãe
      const { data: etiquetas, error: errorEtiquetas } = await supabase
        .from('etiquetas')
        .select('id')
        .eq('etiqueta_mae_id', codigoEtiquetaMae)
        .eq('tipo', 'volume');

      if (errorEtiquetas) {
        throw errorEtiquetas;
      }

      if (!etiquetas || etiquetas.length === 0) {
        toast({
          title: "Etiqueta não encontrada",
          description: "O código informado não corresponde a nenhuma etiqueta registrada.",
          variant: "destructive"
        });
        return false;
      }

      // Verificar se alguma etiqueta pertence à ordem atual
      const etiquetasNaOrdem = etiquetas.filter(etq => 
        itensConferencia.some(item => item.id === etq.id)
      );

      if (etiquetasNaOrdem.length === 0) {
        toast({
          title: "Etiqueta não pertence à ordem",
          description: "Esta etiqueta mãe não faz parte da ordem atual.",
          variant: "destructive"
        });
        return false;
      }

      // UPDATE - Marcar todas as etiquetas como verificadas
      const { error: errorUpdate } = await supabase
        .from('etiquetas')
        .update({ status: 'verificado' })
        .in('id', etiquetasNaOrdem.map(etq => etq.id));

      if (errorUpdate) {
        console.error('Erro ao atualizar status das etiquetas:', errorUpdate);
        throw errorUpdate;
      }

      // Atualizar estado local
      setItensConferencia(prev => 
        prev.map(item => 
          etiquetasNaOrdem.some(etq => etq.id === item.id) 
            ? { ...item, verificado: true } 
            : item
        )
      );

      toast({
        title: "Conferência por Etiqueta Mãe",
        description: `${etiquetasNaOrdem.length} volumes verificados com sucesso pela etiqueta ${codigoEtiquetaMae}.`,
      });

      return true;
    } catch (error) {
      console.error('Erro ao verificar por etiqueta mãe:', error);
      toast({
        title: "Erro ao verificar por etiqueta mãe",
        description: "Ocorreu um erro ao verificar os volumes por etiqueta mãe.",
        variant: "destructive",
      });
      return false;
    }
  }, [ordemSelecionada, itensConferencia]);

  // READ - Buscar ordens em conferência
  const buscarOrdensEmConferencia = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ordens_carregamento')
        .select(`
          *,
          empresa_cliente:empresa_cliente_id(razao_social)
        `)
        .eq('status', 'em_carregamento');

      if (error) {
        throw error;
      }

      const ordensFormatadas: OrdemConferencia[] = (data || []).map(ordem => ({
        id: ordem.numero_ordem,
        cliente: ordem.empresa_cliente?.razao_social || 'Cliente não identificado',
        destinatario: 'Destinatário', // Pode ser expandido
        dataCarregamento: new Date(ordem.data_programada || ordem.created_at).toLocaleDateString('pt-BR'),
        volumesTotal: 0, // Será calculado
        volumesVerificados: 0, // Será calculado
        status: 'processing',
        inicioConferencia: ordem.data_inicio ? new Date(ordem.data_inicio).toLocaleString('pt-BR') : undefined,
        conferenteResponsavel: 'Sistema'
      }));

      setOrdensEmConferencia(ordensFormatadas);
    } catch (error) {
      console.error('Erro ao buscar ordens em conferência:', error);
    }
  }, []);

  // READ - Buscar ordens conferidas
  const buscarOrdensConferidas = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('ordens_carregamento')
        .select(`
          *,
          empresa_cliente:empresa_cliente_id(razao_social)
        `)
        .eq('status', 'concluida')
        .order('data_finalizacao', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      const ordensFormatadas: OrdemConferencia[] = (data || []).map(ordem => ({
        id: ordem.numero_ordem,
        cliente: ordem.empresa_cliente?.razao_social || 'Cliente não identificado',
        destinatario: 'Destinatário', // Pode ser expandido
        dataCarregamento: new Date(ordem.data_programada || ordem.created_at).toLocaleDateString('pt-BR'),
        volumesTotal: 0, // Será calculado
        volumesVerificados: 0, // Será calculado
        status: 'completed',
        inicioConferencia: ordem.data_inicio ? new Date(ordem.data_inicio).toLocaleString('pt-BR') : undefined,
        fimConferencia: ordem.data_finalizacao ? new Date(ordem.data_finalizacao).toLocaleString('pt-BR') : undefined,
        conferenteResponsavel: 'Sistema'
      }));

      setOrdensConferidas(ordensFormatadas);
    } catch (error) {
      console.error('Erro ao buscar ordens conferidas:', error);
    }
  }, []);

  // DELETE - Remover item da conferência
  const removerItemConferencia = useCallback(async (itemId: string) => {
    try {
      // UPDATE - Voltar status do volume para disponível
      const { error: errorUpdate } = await supabase
        .from('etiquetas')
        .update({ status: 'disponivel' })
        .eq('id', itemId);

      if (errorUpdate) {
        throw errorUpdate;
      }

      // Atualizar estado local
      setItensConferencia(prev => prev.filter(item => item.id !== itemId));

      toast({
        title: "Item removido",
        description: "Item removido da conferência com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover item:', error);
      toast({
        title: "Erro ao remover item",
        description: "Ocorreu um erro ao remover o item da conferência.",
        variant: "destructive",
      });
    }
  }, []);

  return {
    isLoading,
    ordemSelecionada,
    itensConferencia,
    ordensEmConferencia,
    ordensConferidas,
    // Funções CRUD
    buscarOrdemParaConferencia,
    verificarItemPorVolume,
    verificarItensPorNF,
    verificarItensPorEtiquetaMae,
    buscarOrdensEmConferencia,
    buscarOrdensConferidas,
    removerItemConferencia,
    // Funções auxiliares
    setOrdemSelecionada,
    setItensConferencia
  };
};
