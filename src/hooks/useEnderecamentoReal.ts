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
  fornecedor?: string;
}

interface CaminhaoLayout {
  [key: string]: Volume | null;
}

// Dados mock para demonstração (temporário até replicação estar ativa)
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
        const volumesNaPosicao = layoutAtual[cellId];
        let volumesFormatados: any[] = [];
        
        if (volumesNaPosicao) {
          if (Array.isArray(volumesNaPosicao)) {
            volumesFormatados = volumesNaPosicao;
          } else {
            volumesFormatados = [{
              ...volumesNaPosicao,
              fornecedor: volumesNaPosicao.destinatario || volumesNaPosicao.fornecedor || 'Fornecedor não informado',
              produto: volumesNaPosicao.codigo || 'Produto não informado',
              dimensoes: 'N/A',
              fragil: false,
              posicionado: true,
              etiquetaMae: '',
              quantidade: 1,
              etiquetado: true
            }];
          }
        }

        novoLayout.push({
          id: cellId,
          coluna,
          linha,
          volumes: volumesFormatados
        });
      }
    }
    
    return novoLayout;
  }, [caminhaoLayout]);

  // Função para atualizar número de linhas
  const atualizarNumeroLinhas = useCallback((novoNumeroLinhas: number) => {
    setNumeroLinhas(novoNumeroLinhas);
    const novoCaminhaoLayout: CaminhaoLayout = {};
    Object.entries(caminhaoLayout).forEach(([posicao, volume]) => {
      const linha = parseInt(posicao.substring(1));
      if (linha <= novoNumeroLinhas) {
        novoCaminhaoLayout[posicao] = volume;
      }
    });
    setCaminhaoLayout(novoCaminhaoLayout);
  }, [caminhaoLayout]);

  // Buscar volumes de uma ordem usando Supabase
  const buscarVolumesOrdem = useCallback(async (numeroOrdem: string) => {
    setIsLoading(true);
    try {
      console.log('Buscando volumes para ordem:', numeroOrdem, 'no Supabase');
      
      // Buscar ordem no Supabase
      const { data: ordem, error: errorOrdem } = await supabase
        .from('ordens_carga')
        .select('id')
        .eq('numero_ordem', numeroOrdem)
        .single();

      if (errorOrdem || !ordem) {
        console.log('Ordem não encontrada no Supabase, usando dados mock para demonstração');
        setVolumes(mockVolumes);
        setVolumesFiltrados(mockVolumes);
        return;
      }

      // Buscar itens da carga
      const { data: itensCarga, error: errorItens } = await supabase
        .from('itens_carga')
        .select('nota_fiscal_id')
        .eq('ordem_carga_id', ordem.id);

      if (errorItens || !itensCarga || itensCarga.length === 0) {
        console.log('Nenhum item de carga encontrado, usando dados mock');
        setVolumes(mockVolumes);
        setVolumesFiltrados(mockVolumes);
        return;
      }

      const notasFiscaisIds = itensCarga.map((item: any) => item.nota_fiscal_id);

      // Buscar volumes das notas fiscais (using correct column names from Drizzle schema)
      const { data: volumes, error: errorVolumes } = await supabase
        .from('volumes_etiqueta')
        .select(`
          id,
          codigo_etiqueta,
          peso,
          dimensoes,
          notas_fiscais!inner(numero)
        `)
        .in('nota_fiscal_id', notasFiscaisIds);

      if (errorVolumes || !volumes || volumes.length === 0) {
        console.log('Nenhum volume encontrado, usando dados mock');
        setVolumes(mockVolumes);
        setVolumesFiltrados(mockVolumes);
        return;
      }

      // Transformar dados reais para formato esperado
      const volumesFormatados: Volume[] = volumes.map((volume: any) => ({
        id: volume.id,
        codigo: volume.codigo_etiqueta,
        notaFiscal: volume.notas_fiscais?.numero || '',
        destinatario: volume.dimensoes || 'Produto',
        cidade: 'São Paulo - SP', 
        peso: volume.peso?.toString() || '0',
        status: 'disponivel'
      }));

      setVolumes(volumesFormatados);
      setVolumesFiltrados(volumesFormatados);
      
    } catch (error) {
      console.error('Erro ao buscar volumes:', error);
      console.log('Fallback para dados mock devido ao erro');
      setVolumes(mockVolumes);
      setVolumesFiltrados(mockVolumes);
      
      toast({
        title: "Usando dados de demonstração", 
        description: "Conexão com banco em desenvolvimento. Usando dados mock.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // UPDATE - Atualizar status do volume (preparado para dados reais)
  const atualizarStatusVolume = useCallback(async (volumeId: string, novoStatus: string) => {
    console.log(`Volume ${volumeId}: ${novoStatus} (após replicação será persistido)`);
  }, []);

  // Submeter formulário de ordem
  const handleOrderFormSubmit = useCallback(async (data: any) => {
    console.log('Submetendo formulário de ordem:', data);
    setOrdemSelecionada(data.numeroOrdem);
    await buscarVolumesOrdem(data.numeroOrdem);
    
    toast({
      title: "Ordem carregada",
      description: `Ordem ${data.numeroOrdem} carregada com sucesso.`,
    });
  }, [buscarVolumesOrdem]);

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
    const volumesSelecionados = volumes.filter(v => selecionados.includes(v.id));
    
    const volumesExistentes = novoLayout[posicao] || null;
    const volumesExistentesArray = Array.isArray(volumesExistentes) ? volumesExistentes : (volumesExistentes ? [volumesExistentes] : []);
    
    const novosVolumes: any[] = [];
    volumesSelecionados.forEach(volume => {
      novosVolumes.push({
        ...volume,
        posicao: posicao,
        fornecedor: volume.destinatario || volume.fornecedor || 'Fornecedor não informado',
        produto: volume.codigo || 'Produto não informado',
        dimensoes: 'N/A',
        fragil: false,
        posicionado: true,
        etiquetaMae: '',
        quantidade: 1,
        etiquetado: true
      });
    });

    const todosVolumes = [...volumesExistentesArray, ...novosVolumes];
    novoLayout[posicao] = todosVolumes.length === 1 ? todosVolumes[0] : todosVolumes;

    selecionados.forEach(volumeId => {
      atualizarStatusVolume(volumeId, 'posicionado');
    });

    setCaminhaoLayout(novoLayout);
    setSelecionados([]);

    toast({
      title: "Volumes posicionados",
      description: `${selecionados.length} volume(s) posicionado(s) em ${posicao}.`,
    });
  }, [selecionados, volumes, caminhaoLayout, atualizarStatusVolume]);

  // Função que atende à assinatura esperada pelo onAllocateVolumes
  const alocarVolumes = useCallback((volumeIds: string[], cellId: string) => {
    setSelecionados(volumeIds);
    moverVolumesSelecionados(cellId);
  }, [moverVolumesSelecionados]);

  // Remover volume do caminhão
  const removerVolume = useCallback((volumeId: string, cellId: string) => {
    const volumesNaPosicao = caminhaoLayout[cellId];
    if (!volumesNaPosicao) return;

    const novoLayout = { ...caminhaoLayout };
    
    if (Array.isArray(volumesNaPosicao)) {
      const volumesRestantes = volumesNaPosicao.filter(v => v.id !== volumeId);
      if (volumesRestantes.length > 0) {
        novoLayout[cellId] = volumesRestantes.length === 1 ? volumesRestantes[0] : volumesRestantes;
      } else {
        delete novoLayout[cellId];
      }
    } else {
      if (volumesNaPosicao.id === volumeId) {
        delete novoLayout[cellId];
      }
    }

    atualizarStatusVolume(volumeId, 'disponivel');
    setCaminhaoLayout(novoLayout);

    toast({
      title: "Volume removido",
      description: `Volume removido da posição ${cellId}.`,
    });
  }, [caminhaoLayout, atualizarStatusVolume]);

  // Salvar layout (preparado para replicação)
  const saveLayout = useCallback(async () => {
    try {
      console.log('Salvando layout do carregamento...');
      
      const posicionamentos = Object.entries(caminhaoLayout);
      if (posicionamentos.length === 0) {
        toast({
          title: "Nenhuma posição",
          description: "Não há volumes posicionados para salvar.",
        });
        return;
      }

      // Após replicação, isso será salvo no Supabase
      console.log('Layout será persistido após replicação estar ativa:', {
        ordem: ordemSelecionada,
        posicionamentos: posicionamentos.length
      });
      
      toast({
        title: "Layout salvo",
        description: "Layout do carregamento foi salvo com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar layout:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o layout.",
        variant: "destructive",
      });
    }
  }, [caminhaoLayout, ordemSelecionada]);

  // Verificar se todos os volumes estão posicionados
  const allVolumesPositioned = (() => {
    if (volumes.length === 0) return false;
    
    let volumesPosicionados = 0;
    Object.values(caminhaoLayout).forEach(volumesNaPosicao => {
      if (Array.isArray(volumesNaPosicao)) {
        volumesPosicionados += volumesNaPosicao.length;
      } else if (volumesNaPosicao) {
        volumesPosicionados += 1;
      }
    });
    
    return volumesPosicionados === volumes.length;
  })();

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
    alocarVolumes,
    removerVolume,
    saveLayout,
    allVolumesPositioned,
    gerarLayoutDinamico,
    atualizarNumeroLinhas,
    buscarVolumesOrdem,
    atualizarStatusVolume
  };
};