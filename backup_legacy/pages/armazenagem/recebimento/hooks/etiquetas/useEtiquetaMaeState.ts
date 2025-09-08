
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Etiqueta } from '@/types/supabase.types';
import { Volume } from '../../components/etiquetas/VolumesTable';
import etiquetaService from '@/services/etiquetaService';

export const useEtiquetaMaeState = () => {
  const [tipoEtiqueta, setTipoEtiqueta] = useState<string>('volume');
  const [etiquetasMae, setEtiquetasMae] = useState<any[]>([]);

  const handleCreateEtiquetaMae = (createEtiquetaMaeFn: any) => (formData: any) => {
    const novaEtiquetaMae = {
      id: `ETQM-${Date.now()}`,
      tipo: 'Etiqueta Mãe',
      descricao: formData.descricaoEtiquetaMae,
      notaFiscal: formData.notaFiscal,
      quantidade: 0,
      etiquetado: false,
      volumes: []
    };

    setEtiquetasMae(prev => [...prev, novaEtiquetaMae]);
    return novaEtiquetaMae;
  };

  const handleVincularVolumes = (vincularVolumes: any) => (etiquetaMaeId: string, volumeIds: string[], volumes: Volume[]) => {
    return vincularVolumes(etiquetaMaeId, volumeIds, volumes);
  };

  return {
    tipoEtiqueta,
    etiquetasMae,
    setTipoEtiqueta,
    setEtiquetasMae,
    handleCreateEtiquetaMae,
    handleVincularVolumes
  };
};
