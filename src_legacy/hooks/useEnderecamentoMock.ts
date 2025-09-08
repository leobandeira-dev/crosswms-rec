import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Volume, CelulaLayout, SearchType } from '@/types/enderecamento.types';
import { volumesEnderecamentoReal, ordemCarregamentoReal, estatisticasCarregamento } from '@/data/enderecamentoRealMock';
import { initializeLayout } from '@/utils/layoutUtils';
import { 
  filtrarVolumesPorBusca, 
  handleVolumeSelection, 
  handleSelectAll,
  notifyLayoutSaved
} from '@/utils/volumeUtils';
import { moveVolumesToCell, removeVolumeFromCell } from '@/utils/cellUtils';

export const useEnderecamentoMock = () => {
  const [ordemSelecionada, setOrdemSelecionada] = useState<string | null>(null);
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [volumesFiltrados, setVolumesFiltrados] = useState<Volume[]>([]);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [caminhaoLayout, setCaminhaoLayout] = useState<CelulaLayout[]>([]);
  const [estatisticas, setEstatisticas] = useState(estatisticasCarregamento);
  const [loading, setLoading] = useState(false);

  // Inicializar layout do caminhão
  useEffect(() => {
    setCaminhaoLayout(initializeLayout());
  }, []);

  // Atualizar volumesFiltrados e estatísticas sempre que volumes mudar
  useEffect(() => {
    const naoAlocados = volumes.filter(v => !v.posicionado);
    setVolumesFiltrados(naoAlocados);
    
    // Atualizar estatísticas
    const enderecados = volumes.filter(v => v.posicionado).length;
    const pendentes = volumes.filter(v => !v.posicionado).length;
    
    setEstatisticas({
      ...estatisticasCarregamento,
      enderecados,
      pendentes,
      totalVolumes: volumes.length
    });
  }, [volumes]);

  const handleOrderFormSubmit = async (data: any) => {
    setLoading(true);
    
    try {
      // Simular busca de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const numeroOC = data?.numeroOC || ordemCarregamentoReal.numero;
      
      if (numeroOC === ordemCarregamentoReal.numero) {
        setOrdemSelecionada(numeroOC);
        setVolumes(volumesEnderecamentoReal);
        
        toast({
          title: "Ordem carregada com sucesso",
          description: `OC ${numeroOC} - ${volumesEnderecamentoReal.length} volumes encontrados`,
        });
      } else {
        // Se não for a ordem mockada, retornar lista vazia
        setOrdemSelecionada(numeroOC);
        setVolumes([]);
        
        toast({
          title: "Ordem não encontrada",
          description: `Nenhum volume encontrado para a OC ${numeroOC}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar ordem",
        description: "Ocorreu um erro ao buscar os dados da ordem",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filtrarVolumes = (searchValue: string, searchType: SearchType) => {
    const filtrados = filtrarVolumesPorBusca(volumes, searchValue, searchType);
    setVolumesFiltrados(filtrados);
    
    // Se encontramos volumes e estamos pesquisando por etiqueta mãe ou nota fiscal,
    // pré-selecione todos os volumes encontrados
    if (filtrados.length > 0 && searchType !== 'volume') {
      setSelecionados(filtrados.map(v => v.id));
    }
  };

  const toggleSelecao = (id: string) => {
    setSelecionados(prev => handleVolumeSelection(prev, id));
  };

  const selecionarTodos = () => {
    setSelecionados(prev => handleSelectAll(prev, volumesFiltrados));
  };

  const moverVolumesSelecionados = (celulaId: string) => {
    const result = moveVolumesToCell(volumes, selecionados, caminhaoLayout, celulaId);
    
    if (result) {
      setVolumes(result.updatedVolumes);
      setCaminhaoLayout(result.updatedLayout);
      setSelecionados([]);
    }
  };

  const removerVolume = (volumeId: string, celulaId: string) => {
    const result = removeVolumeFromCell(volumes, caminhaoLayout, volumeId, celulaId);
    setVolumes(result.updatedVolumes);
    setCaminhaoLayout(result.updatedLayout);
  };

  const saveLayout = async () => {
    setLoading(true);
    
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      notifyLayoutSaved();
      
      toast({
        title: "Layout salvo com sucesso",
        description: `Endereçamento da OC ${ordemSelecionada} foi salvo no sistema`,
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar layout",
        description: "Ocorreu um erro ao salvar o endereçamento",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetarSistema = () => {
    setOrdemSelecionada(null);
    setVolumes([]);
    setVolumesFiltrados([]);
    setSelecionados([]);
    setCaminhaoLayout(initializeLayout());
    setEstatisticas(estatisticasCarregamento);
  };

  return {
    ordemSelecionada,
    volumes,
    volumesFiltrados,
    selecionados,
    caminhaoLayout,
    estatisticas,
    loading,
    handleOrderFormSubmit,
    filtrarVolumes,
    toggleSelecao,
    selecionarTodos,
    moverVolumesSelecionados,
    removerVolume,
    saveLayout,
    resetarSistema,
    allVolumesPositioned: volumes.length > 0 && volumes.every(v => v.posicionado),
    dadosOrdem: ordemCarregamentoReal
  };
};