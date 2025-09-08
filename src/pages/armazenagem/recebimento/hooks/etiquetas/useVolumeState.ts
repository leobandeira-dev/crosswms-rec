
import { useState, useCallback } from 'react';

export interface Volume {
  id: string;
  notaFiscal: string;
  chaveNF: string;
  remetente: string;
  destinatario: string;
  endereco: string;
  cidade: string;
  cidadeCompleta?: string;
  uf: string;
  transportadora: string;
  descricao: string;
  area: string;
  quantidade: number;
  pesoTotal: string;
  numeroPedido: string;
  volumeNumber: number;
  totalVolumes: number;
  codigoONU: string;
  codigoRisco: string;
  classificacaoQuimica: 'nao_perigosa' | 'perigosa' | 'nao_classificada';
  etiquetaMae?: string;
  etiquetado: boolean;
  impresso: boolean;
  dataGeracao: string;
  tipoEtiquetaMae?: 'geral' | 'palete';
  tipoVolume?: 'geral' | 'quimico';
}

export const useVolumeState = () => {
  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [generatedVolumes, setGeneratedVolumes] = useState<Volume[]>([]);

  // Função para gerar ID consistente baseado na nota fiscal, número do volume e data/hora
  const generateConsistentVolumeId = useCallback((notaFiscal: string, volumeNumber: number): string => {
    // Limpar caracteres especiais do número da nota fiscal
    const cleanNotaFiscal = notaFiscal.replace(/[^\w]/g, '');
    
    // Obter data e hora atual
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(-2); // Últimos 2 dígitos do ano
    const hour = String(now.getHours()).padStart(2, '0');
    
    // Formato: {numeroNF}-{numeroVolume}-{ddmmaahhmmss} - removendo minutos e segundos
    const dateTimeStr = `${day}${month}${year}${hour}`;
    const volumeNumberStr = volumeNumber.toString().padStart(3, '0');
    
    return `${cleanNotaFiscal}-${volumeNumberStr}-${dateTimeStr}`;
  }, []);

  // Função para gerar volumes com IDs consistentes
  const generateVolumes = useCallback((formData: any) => {
    const totalVolumes = parseInt(formData.quantidadeVolumes) || 1;
    const pesoTotalStr = formData.pesoTotalBruto?.toString() || '0';
    const pesoTotal = parseFloat(pesoTotalStr.replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    const pesoPorVolume = totalVolumes > 0 ? pesoTotal / totalVolumes : 0;

    const newVolumes: Volume[] = [];
    
    for (let i = 1; i <= totalVolumes; i++) {
      const volumeId = generateConsistentVolumeId(formData.notaFiscal, i);
      
      const volume: Volume = {
        id: volumeId,
        notaFiscal: formData.notaFiscal || '',
        chaveNF: formData.chaveNF || '',
        remetente: formData.remetente || '',
        destinatario: formData.destinatario || '',
        endereco: formData.endereco || '',
        cidade: formData.cidade || '',
        cidadeCompleta: `${formData.cidade || ''} - ${formData.uf || ''}`,
        uf: formData.uf || '',
        transportadora: formData.transportadora || '',
        descricao: `Volume ${i}/${totalVolumes}`,
        area: formData.area || '',
        quantidade: 1,
        pesoTotal: `${pesoPorVolume.toFixed(2)} Kg`,
        numeroPedido: formData.numeroPedido || '',
        volumeNumber: i,
        totalVolumes: totalVolumes,
        codigoONU: formData.codigoONU || '',
        codigoRisco: formData.codigoRisco || '',
        classificacaoQuimica: formData.classificacaoQuimica || 'nao_classificada',
        etiquetaMae: formData.etiquetaMae || '',
        etiquetado: false,
        impresso: false,
        dataGeracao: new Date().toISOString(),
        tipoVolume: formData.tipoVolume || 'geral'
      };
      
      newVolumes.push(volume);
    }

    setGeneratedVolumes(newVolumes);
    return newVolumes;
  }, [generateConsistentVolumeId]);

  // Função para atualizar um volume específico
  const updateVolume = useCallback((updatedVolume: Volume) => {
    setGeneratedVolumes(prev => 
      prev.map(vol => vol.id === updatedVolume.id ? updatedVolume : vol)
    );
  }, []);

  // Função para limpar os volumes
  const clearVolumes = useCallback(() => {
    setVolumes([]);
    setGeneratedVolumes([]);
  }, []);

  return {
    volumes,
    setVolumes,
    generatedVolumes,
    setGeneratedVolumes,
    generateVolumes,
    updateVolume,
    clearVolumes,
    generateConsistentVolumeId
  };
};
