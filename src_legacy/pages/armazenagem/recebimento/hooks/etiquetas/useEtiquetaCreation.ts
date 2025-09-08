
import { toast } from '@/hooks/use-toast';
import { Volume } from '../../components/etiquetas/VolumesTable';

/**
 * Hook for creating etiqueta mãe functionality
 */
export const useEtiquetaCreation = () => {
  /**
   * Creates a master etiqueta without printing
   */
  const createEtiquetaMae = (
    descricao: string,
    tipoEtiquetaMae: 'geral' | 'palete'
  ) => {
    // Generate a sequential ID for the etiqueta mãe
    const timestamp = Date.now();
    const etiquetaMaeId = `MASTER-${timestamp}`;
    
    // Create a master etiqueta data object
    const etiquetaMae = {
      id: etiquetaMaeId,
      notaFiscal: '',
      descricao: descricao || 'Etiqueta Mãe',
      quantidadeVolumes: 0, 
      remetente: '',
      destinatario: '',
      cidade: '',
      uf: '',
      dataCriacao: new Date().toISOString().split('T')[0],
      status: 'ativo',
      tipo: tipoEtiquetaMae
    };
    
    const tipoLabel = tipoEtiquetaMae === 'palete' ? 'Palete' : 'Etiqueta Mãe';
    
    toast({
      title: `${tipoLabel} Criado(a)`,
      description: `Novo(a) ${tipoLabel.toLowerCase()} ${etiquetaMaeId} criado(a) com sucesso.`,
    });
    
    return etiquetaMae;
  };

  return {
    createEtiquetaMae,
  };
};
