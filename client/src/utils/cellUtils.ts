
import { Volume, CelulaLayout } from '@/types/enderecamento.types';
import { toast } from "@/hooks/use-toast";

export const moveVolumesToCell = (
  volumes: Volume[],
  selecionados: string[],
  caminhaoLayout: CelulaLayout[],
  celulaId: string
): { updatedVolumes: Volume[], updatedLayout: CelulaLayout[] } | null => {
  if (selecionados.length === 0) {
    toast({
      title: "Nenhum volume selecionado",
      description: "Selecione pelo menos um volume para alocar.",
    });
    return null;
  }

  // Encontrar a célula
  const celula = caminhaoLayout.find(c => c.id === celulaId);
  if (!celula) return null;

  // Volumes selecionados
  const volumesSelecionados = volumes.filter(v => selecionados.includes(v.id));

  // Atualizar o status dos volumes
  const updatedVolumes = volumes.map(v => 
    selecionados.includes(v.id) ? { ...v, posicionado: true } : v
  );

  // Adicionar volumes à célula
  const updatedLayout = caminhaoLayout.map(c => 
    c.id === celulaId ? { ...c, volumes: [...c.volumes, ...volumesSelecionados] } : c
  );

  toast({
    title: "Volumes alocados",
    description: `${volumesSelecionados.length} volumes foram alocados com sucesso.`,
  });

  return { updatedVolumes, updatedLayout };
};

export const removeVolumeFromCell = (
  volumes: Volume[],
  caminhaoLayout: CelulaLayout[],
  volumeId: string, 
  celulaId: string
): { updatedVolumes: Volume[], updatedLayout: CelulaLayout[] } => {
  // Remover o volume da célula
  const updatedLayout = caminhaoLayout.map(c => 
    c.id === celulaId ? { 
      ...c, 
      volumes: c.volumes.filter(v => v.id !== volumeId) 
    } : c
  );

  // Atualizar o status do volume para não posicionado
  const updatedVolumes = volumes.map(v => 
    v.id === volumeId ? { ...v, posicionado: false } : v
  );

  toast({
    title: "Volume removido",
    description: `O volume ${volumeId} foi removido da célula ${celulaId}.`,
  });

  return { updatedVolumes, updatedLayout };
};
