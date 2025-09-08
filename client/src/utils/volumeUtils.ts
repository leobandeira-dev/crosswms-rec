
import { Volume, SearchType } from '@/types/enderecamento.types';
import { toast } from "@/hooks/use-toast";

export const filtrarVolumesPorBusca = (
  volumes: Volume[], 
  searchValue: string, 
  searchType: SearchType
): Volume[] => {
  if (!searchValue.trim()) {
    // Mostrar apenas volumes não posicionados
    return volumes.filter(v => !v.posicionado);
  }

  const searchTerm = searchValue.toLowerCase().trim();

  // Primeiro filtra por termo, depois remove os posicionados
  switch (searchType) {
    case 'volume':
      return volumes.filter(v => !v.posicionado && v.id.toLowerCase().includes(searchTerm));
    case 'etiquetaMae':
      return volumes.filter(v => !v.posicionado && v.etiquetaMae.toLowerCase().includes(searchTerm));
    case 'notaFiscal':
      return volumes.filter(v => !v.posicionado && v.notaFiscal.toLowerCase().includes(searchTerm));
    default:
      return volumes.filter(v => !v.posicionado);
  }
};

export const handleVolumeSelection = (
  selecionados: string[],
  id: string
): string[] => {
  return selecionados.includes(id)
    ? selecionados.filter(v => v !== id)
    : [...selecionados, id];
};

export const handleSelectAll = (
  selecionados: string[],
  volumesFiltrados: Volume[]
): string[] => {
  // Selecionar/desselecionar apenas volumes não posicionados
  const volumesDisponiveis = volumesFiltrados.filter(v => !v.posicionado);
  const todosIds = volumesDisponiveis.map(v => v.id);
  
  return selecionados.length === volumesDisponiveis.length ? [] : todosIds;
};

export const notifyLayoutSaved = (): void => {
  toast({
    title: "Layout salvo",
    description: "O layout de carregamento foi salvo com sucesso.",
  });
};
