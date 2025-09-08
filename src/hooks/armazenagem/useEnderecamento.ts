
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { Volume, CelulaLayout, SearchType } from '@/types/enderecamento.types';
import { volumesPorCarregar } from '@/data/volumesMock';
import { initializeLayout } from '@/utils/layoutUtils';
import { 
  filtrarVolumesPorBusca, 
  handleVolumeSelection, 
  handleSelectAll,
  notifyLayoutSaved
} from '@/utils/volumeUtils';
import { moveVolumesToCell, removeVolumeFromCell } from '@/utils/cellUtils';

export const useEnderecamento = () => {
  const [ordemSelecionada, setOrdemSelecionada] = useState<string | null>(null);
  const [volumes, setVolumes] = useState(volumesPorCarregar);
  const [volumesFiltrados, setVolumesFiltrados] = useState(volumesPorCarregar);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [caminhaoLayout, setCaminhaoLayout] = useState<CelulaLayout[]>([]);

  // Inicializar layout do caminhão
  useEffect(() => {
    setCaminhaoLayout(initializeLayout());
  }, []);

  // Atualizar volumesFiltrados sempre que volumes mudar
  useEffect(() => {
    // Filtrar apenas volumes que não estão posicionados
    const naoAlocados = volumes.filter(v => !v.posicionado);
    setVolumesFiltrados(naoAlocados);
  }, [volumes]);

  const handleOrderFormSubmit = (data: any) => {
    console.log('Form data submitted:', data);
    // Garantir que temos um valor válido para o número da OC
    const numeroOC = data && data.numeroOC ? data.numeroOC : 'OC-2023-001';
    setOrdemSelecionada(numeroOC);
    toast({
      title: "Ordem selecionada",
      description: `OC ${numeroOC} carregada com sucesso.`,
    });
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
      // Limpar seleção
      setSelecionados([]);
    }
  };

  const removerVolume = (volumeId: string, celulaId: string) => {
    const result = removeVolumeFromCell(volumes, caminhaoLayout, volumeId, celulaId);
    setVolumes(result.updatedVolumes);
    setCaminhaoLayout(result.updatedLayout);
  };

  const saveLayout = () => {
    notifyLayoutSaved();
  };

  return {
    ordemSelecionada,
    volumes,
    volumesFiltrados,
    selecionados,
    caminhaoLayout,
    confirmDialogOpen,
    setConfirmDialogOpen,
    handleOrderFormSubmit,
    filtrarVolumes,
    toggleSelecao,
    selecionarTodos,
    moverVolumesSelecionados,
    removerVolume,
    saveLayout,
    allVolumesPositioned: volumes.every(v => v.posicionado)
  };
};
