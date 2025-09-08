
import { useState, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

interface Volume {
  id: string;
  codigo: string;
  notaFiscal: string;
  destinatario: string;
  cidade: string;
  peso: string;
  status: string;
  posicao?: string;
}

interface CaminhaoLayout {
  [key: string]: Volume | null;
}

// Dados mock para demonstração
const mockVolumes: Volume[] = [
  {
    id: "1",
    codigo: "VOL-001-2025",
    notaFiscal: "12345",
    destinatario: "TechCorp Ltda",
    cidade: "São Paulo - SP",
    peso: "5.2",
    status: "pendente",
    posicao: undefined
  },
  {
    id: "2",
    codigo: "VOL-002-2025",
    notaFiscal: "12346",
    destinatario: "OfficeSupply S.A.",
    cidade: "Rio de Janeiro - RJ",
    peso: "2.8",
    status: "pendente",
    posicao: undefined
  },
  {
    id: "3",
    codigo: "VOL-003-2025",
    notaFiscal: "12347",
    destinatario: "PharmaCorp",
    cidade: "Belo Horizonte - MG",
    peso: "1.5",
    status: "pendente",
    posicao: undefined
  },
  {
    id: "4",
    codigo: "VOL-004-2025",
    notaFiscal: "12348",
    destinatario: "FashionStore",
    cidade: "Porto Alegre - RS",
    peso: "3.2",
    status: "pendente",
    posicao: undefined
  },
  {
    id: "5",
    codigo: "VOL-005-2025",
    notaFiscal: "12349",
    destinatario: "ToolMaster Ind.",
    cidade: "Salvador - BA",
    peso: "8.5",
    status: "pendente",
    posicao: undefined
  },
  {
    id: "6",
    codigo: "VOL-006-2025",
    notaFiscal: "12350",
    destinatario: "ElectroTech",
    cidade: "Brasília - DF",
    peso: "4.1",
    status: "pendente",
    posicao: undefined
  }
];

const mockCaminhaoLayout: CaminhaoLayout = {
  "E1": {
    id: "7",
    codigo: "VOL-007-2025",
    notaFiscal: "12351",
    destinatario: "AutoParts Corp",
    cidade: "Curitiba - PR",
    peso: "6.3",
    status: "posicionado",
    posicao: "E1"
  },
  "C2": {
    id: "8",
    codigo: "VOL-008-2025",
    notaFiscal: "12352",
    destinatario: "FoodSupply Ltd",
    cidade: "Fortaleza - CE",
    peso: "2.1",
    status: "posicionado",
    posicao: "C2"
  },
  "D3": {
    id: "9",
    codigo: "VOL-009-2025",
    notaFiscal: "12353",
    destinatario: "MedEquip S.A.",
    cidade: "Recife - PE",
    peso: "3.7",
    status: "posicionado",
    posicao: "D3"
  }
};

export const useEnderecamentoReal = () => {
  const [ordemSelecionada, setOrdemSelecionada] = useState<string>('ORD-2025-001');
  const [volumes, setVolumes] = useState<Volume[]>(mockVolumes);
  const [volumesFiltrados, setVolumesFiltrados] = useState<Volume[]>(mockVolumes);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [caminhaoLayout, setCaminhaoLayout] = useState<CaminhaoLayout>(mockCaminhaoLayout);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [numeroLinhas, setNumeroLinhas] = useState<number>(20);

  // Função para gerar layout dinâmico baseado no número de linhas
  const gerarLayoutDinamico = useCallback((linhas: number, layoutAtual: CaminhaoLayout = caminhaoLayout) => {
    const novoLayout: any[] = [];
    const colunas: Array<'esquerda' | 'centro' | 'direita'> = ['esquerda', 'centro', 'direita'];
    
    for (let linha = 1; linha <= linhas; linha++) {
      for (const coluna of colunas) {
        const cellId = `${coluna.charAt(0).toUpperCase()}${linha}`;
        novoLayout.push({
          id: cellId,
          coluna,
          linha,
          volumes: layoutAtual[cellId] ? [layoutAtual[cellId]] : []
        });
      }
    }
    
    return novoLayout;
  }, [caminhaoLayout]);

  // Função para atualizar número de linhas
  const atualizarNumeroLinhas = useCallback((novoNumeroLinhas: number) => {
    setNumeroLinhas(novoNumeroLinhas);
    // Limpar posições que excedem o novo número de linhas
    const novoCaminhaoLayout: CaminhaoLayout = {};
    Object.entries(caminhaoLayout).forEach(([posicao, volume]) => {
      const linha = parseInt(posicao.substring(1));
      if (linha <= novoNumeroLinhas) {
        novoCaminhaoLayout[posicao] = volume;
      }
    });
    setCaminhaoLayout(novoCaminhaoLayout);
  }, [caminhaoLayout]);

  // CREATE - Criar nova ordem de carregamento (se necessário)
  const criarOrdemCarregamento = useCallback(async (dadosOrdem: any) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ordens_carregamento')
        .insert({
          numero_ordem: dadosOrdem.numeroOrdem,
          tipo_carregamento: dadosOrdem.tipoCarregamento || 'normal',
          empresa_cliente_id: dadosOrdem.clienteId,
          status: 'pendente'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Ordem criada",
        description: `Ordem ${dadosOrdem.numeroOrdem} criada com sucesso.`,
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar ordem:', error);
      toast({
        title: "Erro ao criar ordem",
        description: "Ocorreu um erro ao criar a ordem de carregamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // READ - Buscar volumes de uma ordem de carregamento
  const buscarVolumesOrdem = useCallback(async (numeroOrdem: string) => {
    setIsLoading(true);
    try {
      console.log('Buscando volumes para ordem:', numeroOrdem);

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
        .select('id, numero, destinatario_razao_social, destinatario_cidade, destinatario_uf, peso_bruto')
        .eq('ordem_carregamento_id', ordem.id);

      if (errorNotas) {
        throw errorNotas;
      }

      if (!notasFiscais || notasFiscais.length === 0) {
        setVolumes([]);
        setVolumesFiltrados([]);
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

      console.log('Etiquetas encontradas:', etiquetas);

      // Transformar dados para o formato esperado
      const volumesFormatados: Volume[] = (etiquetas || []).map(etiqueta => {
        const notaFiscal = notasFiscais.find(nf => nf.id === etiqueta.nota_fiscal_id);
        
        return {
          id: etiqueta.id,
          codigo: etiqueta.codigo,
          notaFiscal: notaFiscal?.numero || '',
          destinatario: notaFiscal?.destinatario_razao_social || etiqueta.destinatario || '',
          cidade: notaFiscal?.destinatario_cidade ? 
            `${notaFiscal.destinatario_cidade} - ${notaFiscal.destinatario_uf}` : 
            `${etiqueta.cidade} - ${etiqueta.uf}`,
          peso: etiqueta.peso?.toString() || notaFiscal?.peso_bruto?.toString() || '0',
          status: etiqueta.status || 'disponivel'
        };
      });

      console.log('Volumes formatados:', volumesFormatados);
      setVolumes(volumesFormatados);
      setVolumesFiltrados(volumesFormatados);

      // Buscar layout existente se houver
      await buscarLayoutExistente(ordem.id);

    } catch (error) {
      console.error('Erro ao buscar volumes:', error);
      toast({
        title: "Erro ao buscar volumes",
        description: "Ocorreu um erro ao buscar os volumes da ordem.",
        variant: "destructive",
      });
      setVolumes([]);
      setVolumesFiltrados([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // READ - Buscar layout existente do carregamento
  const buscarLayoutExistente = useCallback(async (ordemId: string) => {
    try {
      // Buscar carregamento da ordem
      const { data: carregamento, error: errorCarregamento } = await supabase
        .from('carregamentos')
        .select('id')
        .eq('ordem_carregamento_id', ordemId)
        .maybeSingle();

      if (errorCarregamento || !carregamento) {
        return;
      }

      // Buscar endereçamentos do carregamento
      const { data: enderecamentos, error: errorEnderecamentos } = await supabase
        .from('enderecamento_caminhao')
        .select(`
          posicao,
          etiqueta_id,
          etiquetas (
            id,
            codigo,
            nota_fiscal_id,
            destinatario,
            cidade,
            uf,
            peso
          )
        `)
        .eq('carregamento_id', carregamento.id);

      if (errorEnderecamentos) {
        throw errorEnderecamentos;
      }

      if (enderecamentos && enderecamentos.length > 0) {
        const layoutExistente: CaminhaoLayout = {};
        
        enderecamentos.forEach(end => {
          if (end.etiquetas) {
            const etiqueta = end.etiquetas as any;
            layoutExistente[end.posicao] = {
              id: etiqueta.id,
              codigo: etiqueta.codigo,
              notaFiscal: '', // Será preenchido se necessário
              destinatario: etiqueta.destinatario || '',
              cidade: etiqueta.cidade ? `${etiqueta.cidade} - ${etiqueta.uf}` : '',
              peso: etiqueta.peso?.toString() || '0',
              status: 'posicionado',
              posicao: end.posicao
            };
          }
        });

        setCaminhaoLayout(layoutExistente);
      }
    } catch (error) {
      console.error('Erro ao buscar layout existente:', error);
    }
  }, []);

  // UPDATE - Atualizar status da ordem
  const atualizarStatusOrdem = useCallback(async (numeroOrdem: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('ordens_carregamento')
        .update({ status: novoStatus })
        .eq('numero_ordem', numeroOrdem);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: `Status da ordem ${numeroOrdem} atualizado para ${novoStatus}.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Ocorreu um erro ao atualizar o status da ordem.",
        variant: "destructive",
      });
    }
  }, []);

  // UPDATE - Atualizar status do volume
  const atualizarStatusVolume = useCallback(async (volumeId: string, novoStatus: string) => {
    // Para dados mock, apenas simular a atualização sem chamada real
    const isMockVolume = mockVolumes.some(mv => mv.id === volumeId);
    if (isMockVolume) {
      console.log(`Status do volume ${volumeId} atualizado para ${novoStatus} (modo mock)`);
      return;
    }

    try {
      const { error } = await supabase
        .from('etiquetas')
        .update({ status: novoStatus })
        .eq('id', volumeId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao atualizar status do volume:', error);
    }
  }, []);

  // DELETE - Remover endereçamento
  const removerEnderecamento = useCallback(async (carregamentoId: string, etiquetaId: string) => {
    try {
      const { error } = await supabase
        .from('enderecamento_caminhao')
        .delete()
        .eq('carregamento_id', carregamentoId)
        .eq('etiqueta_id', etiquetaId);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao remover endereçamento:', error);
    }
  }, []);

  // Submeter formulário de ordem
  const handleOrderFormSubmit = useCallback(async (data: any) => {
    console.log('Submetendo formulário de ordem:', data);
    const numeroOrdem = data.numeroOC || data.orderNumber || 'ORD-2025-001';
    
    setOrdemSelecionada(numeroOrdem);
    
    // Para demonstração, usar dados mock
    setVolumes(mockVolumes);
    setVolumesFiltrados(mockVolumes);
    setCaminhaoLayout(mockCaminhaoLayout);
    
    toast({
      title: "Ordem carregada",
      description: `Ordem ${numeroOrdem} carregada com dados de demonstração.`,
    });
  }, []);

  // Filtrar volumes
  const filtrarVolumes = useCallback((filtro: string) => {
    const volumesFiltrados = volumes.filter(volume => 
      volume.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
      volume.notaFiscal.toLowerCase().includes(filtro.toLowerCase()) ||
      volume.destinatario.toLowerCase().includes(filtro.toLowerCase()) ||
      volume.cidade.toLowerCase().includes(filtro.toLowerCase())
    );
    setVolumesFiltrados(volumesFiltrados);
  }, [volumes]);

  // Toggle seleção de volume
  const toggleSelecao = useCallback((volumeId: string) => {
    setSelecionados(prev => 
      prev.includes(volumeId)
        ? prev.filter(id => id !== volumeId)
        : [...prev, volumeId]
    );
  }, []);

  // Selecionar todos os volumes
  const selecionarTodos = useCallback(() => {
    const todosIds = volumesFiltrados.map(v => v.id);
    setSelecionados(todosIds);
  }, [volumesFiltrados]);

  // Mover volumes selecionados para posição no caminhão
  const moverVolumesSelecionados = useCallback((posicao: string) => {
    if (selecionados.length === 0) return;

    const novoLayout = { ...caminhaoLayout };
    
    selecionados.forEach((volumeId, index) => {
      const volume = volumes.find(v => v.id === volumeId);
      if (volume) {
        const posicaoFinal = selecionados.length > 1 ? `${posicao}-${index + 1}` : posicao;
        novoLayout[posicaoFinal] = { ...volume, posicao: posicaoFinal };
        // Atualizar status do volume
        atualizarStatusVolume(volumeId, 'posicionado');
      }
    });

    setCaminhaoLayout(novoLayout);
    setSelecionados([]);

    toast({
      title: "Volumes posicionados",
      description: `${selecionados.length} volume(s) posicionado(s) em ${posicao}.`,
    });
  }, [selecionados, volumes, caminhaoLayout, atualizarStatusVolume]);

  // Remover volume do caminhão
  const removerVolume = useCallback((posicao: string) => {
    const volume = caminhaoLayout[posicao];
    if (volume) {
      // Atualizar status do volume
      atualizarStatusVolume(volume.id, 'disponivel');
    }

    const novoLayout = { ...caminhaoLayout };
    delete novoLayout[posicao];
    setCaminhaoLayout(novoLayout);

    toast({
      title: "Volume removido",
      description: `Volume removido da posição ${posicao}.`,
    });
  }, [caminhaoLayout, atualizarStatusVolume]);

  // CREATE/UPDATE - Salvar layout no banco de dados
  const saveLayout = useCallback(async () => {
    if (!ordemSelecionada) {
      toast({
        title: "Ordem não selecionada",
        description: "Selecione uma ordem antes de salvar o layout.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Salvando layout:', caminhaoLayout);

      // Para dados mock, simular salvamento sem chamada real
      const hasMockVolumes = volumes.length > 0 && volumes.some(v => mockVolumes.some(mv => mv.id === v.id));
      if (hasMockVolumes) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
        toast({
          title: "Layout salvo",
          description: "Layout salvo com sucesso (modo demonstração).",
        });
        setIsLoading(false);
        return;
      }

      // Buscar a ordem de carregamento
      const { data: ordem, error: errorOrdem } = await supabase
        .from('ordens_carregamento')
        .select('id')
        .eq('numero_ordem', ordemSelecionada)
        .single();

      if (errorOrdem || !ordem) {
        throw new Error('Ordem de carregamento não encontrada');
      }

      // Criar ou buscar o carregamento
      const { data: carregamento, error: errorCarregamento } = await supabase
        .from('carregamentos')
        .select('id')
        .eq('ordem_carregamento_id', ordem.id)
        .maybeSingle();

      let carregamentoId = carregamento?.id;

      if (!carregamentoId) {
        // CREATE - Criar novo carregamento
        const { data: novoCarregamento, error: errorNovoCarregamento } = await supabase
          .from('carregamentos')
          .insert({
            ordem_carregamento_id: ordem.id,
            quantidade_volumes: Object.keys(caminhaoLayout).length,
            status: 'em_andamento'
          })
          .select('id')
          .single();

        if (errorNovoCarregamento) {
          throw errorNovoCarregamento;
        }

        carregamentoId = novoCarregamento.id;
      } else {
        // UPDATE - Atualizar carregamento existente
        await supabase
          .from('carregamentos')
          .update({
            quantidade_volumes: Object.keys(caminhaoLayout).length,
            status: 'em_andamento'
          })
          .eq('id', carregamentoId);
      }

      // DELETE - Limpar endereçamentos anteriores
      await supabase
        .from('enderecamento_caminhao')
        .delete()
        .eq('carregamento_id', carregamentoId);

      // CREATE - Inserir novos endereçamentos
      const enderecamentos = Object.entries(caminhaoLayout).map(([posicao, volume], index) => ({
        carregamento_id: carregamentoId,
        etiqueta_id: volume!.id,
        posicao,
        ordem: index + 1
      }));

      if (enderecamentos.length > 0) {
        const { error: errorEnderecamento } = await supabase
          .from('enderecamento_caminhao')
          .insert(enderecamentos);

        if (errorEnderecamento) {
          throw errorEnderecamento;
        }
      }

      // UPDATE - Atualizar status da ordem para em carregamento
      await atualizarStatusOrdem(ordemSelecionada, 'em_carregamento');

      toast({
        title: "Layout salvo",
        description: "Layout do carregamento salvo com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao salvar layout:', error);
      toast({
        title: "Erro ao salvar layout",
        description: "Ocorreu um erro ao salvar o layout do carregamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [ordemSelecionada, caminhaoLayout, atualizarStatusOrdem]);

  // DELETE - Cancelar carregamento
  const cancelarCarregamento = useCallback(async (numeroOrdem: string) => {
    setIsLoading(true);
    try {
      // Buscar a ordem
      const { data: ordem, error: errorOrdem } = await supabase
        .from('ordens_carregamento')
        .select('id')
        .eq('numero_ordem', numeroOrdem)
        .single();

      if (errorOrdem || !ordem) {
        throw new Error('Ordem não encontrada');
      }

      // Buscar carregamento
      const { data: carregamento, error: errorCarregamento } = await supabase
        .from('carregamentos')
        .select('id')
        .eq('ordem_carregamento_id', ordem.id)
        .maybeSingle();

      if (carregamento) {
        // DELETE - Remover todos os endereçamentos
        await supabase
          .from('enderecamento_caminhao')
          .delete()
          .eq('carregamento_id', carregamento.id);

        // DELETE - Remover carregamento
        await supabase
          .from('carregamentos')
          .delete()
          .eq('id', carregamento.id);
      }

      // UPDATE - Voltar status da ordem para pendente
      await atualizarStatusOrdem(numeroOrdem, 'pendente');

      // Limpar layout local
      setCaminhaoLayout({});
      
      toast({
        title: "Carregamento cancelado",
        description: "O carregamento foi cancelado com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao cancelar carregamento:', error);
      toast({
        title: "Erro ao cancelar",
        description: "Ocorreu um erro ao cancelar o carregamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [atualizarStatusOrdem]);

  // Verificar se todos os volumes estão posicionados
  const allVolumesPositioned = volumes.length > 0 && 
    Object.keys(caminhaoLayout).length === volumes.length;

  return {
    ordemSelecionada,
    volumes,
    volumesFiltrados,
    selecionados,
    caminhaoLayout,
    confirmDialogOpen,
    isLoading,
    numeroLinhas,
    setConfirmDialogOpen,
    handleOrderFormSubmit,
    filtrarVolumes,
    toggleSelecao,
    selecionarTodos,
    moverVolumesSelecionados,
    removerVolume,
    saveLayout,
    allVolumesPositioned,
    gerarLayoutDinamico,
    atualizarNumeroLinhas,
    // Novas funções CRUD
    criarOrdemCarregamento,
    buscarVolumesOrdem,
    atualizarStatusOrdem,
    atualizarStatusVolume,
    cancelarCarregamento,
    buscarLayoutExistente
  };
};
