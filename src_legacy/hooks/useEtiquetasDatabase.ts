
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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

export const useEtiquetasDatabase = () => {
  const [etiquetas, setEtiquetas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const buscarEtiquetas = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Buscando etiquetas no banco de dados...');

      const { data, error } = await supabase
        .from('etiquetas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar etiquetas:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} etiquetas encontradas`);
      setEtiquetas(data || []);
      return data || [];
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar etiquetas:', error);
      toast({
        title: "❌ Erro ao Buscar Etiquetas",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const salvarEtiqueta = async (etiquetaData: CreateEtiquetaData) => {
    try {
      console.log('💾 Salvando etiqueta:', etiquetaData.codigo);

      const { data, error } = await supabase
        .from('etiquetas')
        .insert([etiquetaData])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao salvar etiqueta:', error);
        throw error;
      }

      console.log('✅ Etiqueta salva com sucesso:', data.id);
      return data;
    } catch (error) {
      console.error('💥 Erro inesperado ao salvar etiqueta:', error);
      throw error;
    }
  };

  const buscarEtiquetasPorCodigo = async (codigo: string) => {
    try {
      console.log('🔍 Buscando etiqueta por código:', codigo);

      const { data, error } = await supabase
        .from('etiquetas')
        .select('*')
        .eq('codigo', codigo);

      if (error) {
        console.error('❌ Erro ao buscar por código:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} etiquetas encontradas para código ${codigo}`);
      return data || [];
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar por código:', error);
      throw error;
    }
  };

  const buscarEtiquetasPorNotaFiscal = async (notaFiscal: string) => {
    try {
      console.log('🔍 Buscando etiquetas por nota fiscal:', notaFiscal);

      const { data, error } = await supabase
        .from('etiquetas')
        .select('*')
        .eq('chave_nf', notaFiscal);

      if (error) {
        console.error('❌ Erro ao buscar por nota fiscal:', error);
        throw error;
      }

      console.log(`✅ ${data?.length || 0} etiquetas encontradas para NF ${notaFiscal}`);
      return data || [];
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar por nota fiscal:', error);
      throw error;
    }
  };

  const marcarComoEtiquetada = async (etiquetaId: string) => {
    try {
      console.log('🏷️ Marcando etiqueta como etiquetada:', etiquetaId);

      const { data, error } = await supabase
        .from('etiquetas')
        .update({ 
          etiquetado: true,
          data_impressao: new Date().toISOString()
        })
        .eq('id', etiquetaId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao marcar como etiquetada:', error);
        throw error;
      }

      console.log('✅ Etiqueta marcada como etiquetada:', data.id);
      return data;
    } catch (error) {
      console.error('💥 Erro inesperado ao marcar como etiquetada:', error);
      throw error;
    }
  };

  const inutilizarEtiqueta = async (etiquetaId: string, dados: { motivo_inutilizacao: string }) => {
    try {
      console.log('🗑️ Inutilizando etiqueta:', etiquetaId);

      const { data, error } = await supabase
        .from('etiquetas')
        .update({ 
          status: 'inutilizada',
          motivo_inutilizacao: dados.motivo_inutilizacao,
          data_inutilizacao: new Date().toISOString()
        })
        .eq('id', etiquetaId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao inutilizar etiqueta:', error);
        throw error;
      }

      console.log('✅ Etiqueta inutilizada com sucesso:', data.id);
      
      // Atualizar lista local
      setEtiquetas(prev => prev.map(etq => 
        etq.id === etiquetaId 
          ? { ...etq, status: 'inutilizada', motivo_inutilizacao: dados.motivo_inutilizacao }
          : etq
      ));

      toast({
        title: "✅ Etiqueta Inutilizada",
        description: "A etiqueta foi inutilizada com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('💥 Erro inesperado ao inutilizar etiqueta:', error);
      toast({
        title: "❌ Erro ao Inutilizar",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
      throw error;
    }
  };

  const excluirEtiqueta = async (etiquetaId: string) => {
    try {
      console.log('🗑️ Excluindo etiqueta:', etiquetaId);

      const { error } = await supabase
        .from('etiquetas')
        .delete()
        .eq('id', etiquetaId);

      if (error) {
        console.error('❌ Erro ao excluir etiqueta:', error);
        throw error;
      }

      console.log('✅ Etiqueta excluída com sucesso:', etiquetaId);
      
      // Atualizar lista local
      setEtiquetas(prev => prev.filter(etq => etq.id !== etiquetaId));

      toast({
        title: "✅ Etiqueta Excluída",
        description: "A etiqueta foi excluída com sucesso.",
      });

    } catch (error) {
      console.error('💥 Erro inesperado ao excluir etiqueta:', error);
      toast({
        title: "❌ Erro ao Excluir",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    buscarEtiquetas();
  }, []);

  return {
    etiquetas,
    isLoading,
    buscarEtiquetas,
    salvarEtiqueta,
    buscarEtiquetasPorCodigo,
    buscarEtiquetasPorNotaFiscal,
    marcarComoEtiquetada,
    inutilizarEtiqueta,
    excluirEtiqueta
  };
};
