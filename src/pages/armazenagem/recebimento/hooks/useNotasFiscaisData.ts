
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotaFiscal } from '@/types/supabase/fiscal.types';
import { 
  buscarNotasFiscais, 
  buscarNotaFiscalPorChave 
} from '@/services/notaFiscal/fetchNotaFiscalService';
import { 
  atualizarNotaFiscal, 
  atualizarStatusNotaFiscal 
} from '@/services/notaFiscal/updateNotaFiscalService';
import { excluirNotaFiscal } from '@/services/notaFiscal/deleteNotaFiscalService';
import { useToast } from '@/hooks/use-toast';

interface FiltrosNotas {
  status?: string;
  fornecedor?: string;
  dataInicio?: string;
  dataFim?: string;
  termo?: string;
}

export const useNotasFiscaisData = () => {
  const [filtros, setFiltros] = useState<FiltrosNotas>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para buscar notas fiscais da tabela notas_fiscais com ordenação por data
  const {
    data: notasFiscais = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notas-fiscais', filtros],
    queryFn: () => {
      console.log('Buscando notas fiscais da tabela notas_fiscais com filtros:', filtros);
      return buscarNotasFiscais(filtros);
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Log dos dados carregados
  useEffect(() => {
    if (notasFiscais.length > 0) {
      console.log('Notas fiscais carregadas:', notasFiscais);
    }
  }, [notasFiscais]);

  // Mutation para atualizar nota fiscal
  const updateNotaMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NotaFiscal> }) =>
      atualizarNotaFiscal(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast({
        title: "✅ Nota Atualizada",
        description: "Nota fiscal atualizada com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao Atualizar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  // Mutation para atualizar status da nota fiscal
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      atualizarStatusNotaFiscal(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast({
        title: "✅ Status Atualizado",
        description: "Status da nota fiscal atualizado com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao Atualizar Status",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  // Mutation para excluir nota fiscal
  const deleteNotaMutation = useMutation({
    mutationFn: (id: string) => excluirNotaFiscal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast({
        title: "✅ Nota Excluída",
        description: "Nota fiscal excluída com sucesso."
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Erro ao Excluir",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  });

  // Função para buscar nota por chave
  const buscarPorChave = async (chave: string): Promise<NotaFiscal | null> => {
    try {
      return await buscarNotaFiscalPorChave(chave);
    } catch (error) {
      toast({
        title: "❌ Erro ao Buscar",
        description: error instanceof Error ? error.message : "Erro ao buscar nota",
        variant: "destructive"
      });
      return null;
    }
  };

  // Função para aplicar filtros
  const aplicarFiltros = (novosFiltros: FiltrosNotas) => {
    console.log('Aplicando filtros:', novosFiltros);
    setFiltros(novosFiltros);
  };

  // Função para limpar filtros
  const limparFiltros = () => {
    setFiltros({});
  };

  return {
    // Dados
    notasFiscais,
    isLoading,
    error,
    filtros,
    
    // Ações
    refetch,
    aplicarFiltros,
    limparFiltros,
    buscarPorChave,
    
    // Mutations
    updateNota: updateNotaMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    deleteNota: deleteNotaMutation.mutate,
    
    // Estados das mutations
    isUpdating: updateNotaMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isDeleting: deleteNotaMutation.isPending,
  };
};
