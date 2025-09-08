
import { toast } from '@/hooks/use-toast';
import { Volume } from '../../components/etiquetas/VolumesTable';
import { useEtiquetasGenerator } from '@/hooks/etiquetas';
import { LayoutStyle } from '@/hooks/etiquetas/types';
import { useEtiquetaUtils } from './useEtiquetaUtils';

/**
 * Hook for etiqueta printing functionality
 */
export const useEtiquetaPrint = () => {
  const { generateEtiquetasPDF, generateEtiquetaMaePDF, isGenerating } = useEtiquetasGenerator();
  const { calculateTotalPeso, prepareNotaData } = useEtiquetaUtils();

  /**
   * Function to get transportadora name based on layout style
   */
  const getTransportadoraName = (layoutStyle: LayoutStyle, volume: Volume, notaData: any) => {
    if (layoutStyle.includes('transul')) {
      return 'Transul Transporte';
    }
    return volume.transportadora || notaData?.transportadora || 'Transportadora não especificada';
  };

  /**
   * Function to handle printing etiquetas for selected volumes
   */
  const printEtiquetas = (
    volume: Volume, 
    volumes: Volume[], 
    notaFiscalData: any, 
    formatoImpressao: string,
    layoutStyle: LayoutStyle
  ) => {
    // Get volumes with the same nota fiscal
    const volumesNota = volumes.filter(vol => vol.notaFiscal === volume.notaFiscal);
    
    // Prepare nota data for the etiquetas
    const notaData = prepareNotaData(volume, notaFiscalData);
    
    // Update transportadora name based on layout
    const transportadoraName = getTransportadoraName(layoutStyle, volume, notaData);
    const updatedNotaData = {
      ...notaData,
      transportadora: transportadoraName
    };
    
    // Update volumes with correct transportadora name
    const updatedVolumes = volumesNota.map(vol => ({
      ...vol,
      transportadora: transportadoraName
    }));
    
    // Generate etiquetas for all volumes of this nota fiscal
    const result = generateEtiquetasPDF(updatedVolumes, updatedNotaData, formatoImpressao, 'volume', layoutStyle);
    
    return result;
  };

  /**
   * Function to handle reprinting etiquetas for specific volume only
   */
  const reimprimirEtiquetas = (
    volume: Volume, 
    volumes: Volume[], 
    notaFiscalData: any, 
    formatoImpressao: string,
    layoutStyle: LayoutStyle
  ) => {
    // Para reimprimir, gerar etiqueta APENAS para o volume específico selecionado
    const volumeEspecifico = [volume]; // Array com apenas o volume selecionado
    
    const notaData = prepareNotaData(volume, notaFiscalData);
    
    // Update transportadora name based on layout
    const transportadoraName = getTransportadoraName(layoutStyle, volume, notaData);
    const updatedNotaData = {
      ...notaData,
      transportadora: transportadoraName
    };
    
    // Update volume with correct transportadora name
    const updatedVolume = [{
      ...volume,
      transportadora: transportadoraName
    }];
    
    generateEtiquetasPDF(updatedVolume, updatedNotaData, formatoImpressao, 'volume', layoutStyle);
    
    toast({
      title: "Etiqueta Reimpressa",
      description: `Etiqueta para volume ${volume.id} reimpressa com sucesso.`,
    });
  };

  /**
   * Function to create and print a master etiqueta
   */
  const createAndPrintEtiquetaMae = (
    etiquetaMaeId: string,
    descricao: string,
    tipoEtiquetaMae: 'geral' | 'palete',
    formatoImpressao: string,
    layoutStyle: LayoutStyle
  ) => {
    // Determine transportadora name based on layout
    const transportadoraName = layoutStyle.includes('transul') 
      ? 'Transul Transporte' 
      : 'Transportadora não especificada';

    // Create a standalone master etiqueta not attached to any nota fiscal
    const dummyMasterVolume: Volume[] = [{
      id: etiquetaMaeId,
      notaFiscal: '',
      descricao: descricao,
      quantidade: 0,
      etiquetado: true,
      remetente: '',
      destinatario: '',
      endereco: '',
      cidade: '',
      uf: '',
      pesoTotal: '0 Kg',
      chaveNF: '',
      etiquetaMae: etiquetaMaeId,
      codigoONU: '',
      codigoRisco: '',
      classificacaoQuimica: 'nao_classificada',
      transportadora: transportadoraName,
      impresso: false,
      dataGeracao: new Date().toISOString(),
      volumeNumber: 1,
      totalVolumes: 1,
      numeroPedido: '',
      area: ''
    }];
    
    // Empty nota data since this is a standalone master etiqueta
    const emptyNotaData = {
      fornecedor: '',
      destinatario: '',
      endereco: '',
      cidade: '',
      cidadeCompleta: '',
      uf: '',
      pesoTotal: '0 Kg',
      chaveNF: '',
      tipoEtiquetaMae: tipoEtiquetaMae,
      transportadora: transportadoraName
    };
    
    // Generate master etiqueta
    generateEtiquetaMaePDF(dummyMasterVolume, emptyNotaData, formatoImpressao, etiquetaMaeId, layoutStyle);
    
    const tipoLabel = tipoEtiquetaMae === 'palete' ? 'Palete' : 'Etiqueta Mãe';
    
    toast({
      title: `${tipoLabel} Criado(a)`,
      description: `Novo(a) ${tipoLabel.toLowerCase()} ${etiquetaMaeId} criado(a) com sucesso.`,
    });
    
    return etiquetaMaeId;
  };

  /**
   * Function to handle printing master etiqueta
   */
  const printEtiquetaMae = (
    etiquetaMae: any, 
    volumes: Volume[],
    formatoImpressao: string,
    layoutStyle: LayoutStyle
  ) => {
    // For etiqueta mãe that's already created and possibly linked to volumes
    const linkedVolumes = volumes.filter(vol => vol.etiquetaMae === etiquetaMae.id);
    
    // Determine transportadora name based on layout
    const transportadoraName = layoutStyle.includes('transul') 
      ? 'Transul Transporte' 
      : (linkedVolumes.length > 0 ? linkedVolumes[0].transportadora : 'Transportadora não especificada');
    
    // Prepare nota data based on the first linked volume or use generic info
    const cidadeCompleta = linkedVolumes.length > 0 ? `${linkedVolumes[0].cidade} - ${linkedVolumes[0].uf}` : '';
    
    const notaData = linkedVolumes.length > 0 ? {
      fornecedor: linkedVolumes[0].remetente || '',
      destinatario: linkedVolumes[0].destinatario || '',
      endereco: linkedVolumes[0].endereco || '',
      cidade: linkedVolumes[0].cidade || '',
      cidadeCompleta: cidadeCompleta,
      uf: linkedVolumes[0].uf || '',
      pesoTotal: calculateTotalPeso(linkedVolumes),
      chaveNF: linkedVolumes[0].chaveNF || '',
      transportadora: transportadoraName
    } : {
      fornecedor: '',
      destinatario: '',
      endereco: '',
      cidade: '',
      cidadeCompleta: '',
      uf: '',
      pesoTotal: '0 Kg',
      chaveNF: '',
      transportadora: transportadoraName
    };
    
    // Create a dummy volume to represent the master etiqueta
    const dummyMasterVolume: Volume[] = [{
      id: etiquetaMae.id,
      notaFiscal: linkedVolumes.length > 0 ? linkedVolumes[0].notaFiscal : '',
      descricao: etiquetaMae.descricao || 'Etiqueta Mãe',
      quantidade: linkedVolumes.length,
      etiquetado: true,
      remetente: notaData.fornecedor,
      destinatario: notaData.destinatario,
      endereco: notaData.endereco,
      cidade: notaData.cidade,
      uf: notaData.uf,
      pesoTotal: notaData.pesoTotal,
      chaveNF: notaData.chaveNF,
      etiquetaMae: etiquetaMae.id,
      codigoONU: '',
      codigoRisco: '',
      classificacaoQuimica: 'nao_classificada',
      transportadora: transportadoraName,
      impresso: false,
      dataGeracao: new Date().toISOString(),
      volumeNumber: 1,
      totalVolumes: 1,
      numeroPedido: '',
      area: ''
    }];
    
    // Generate master etiqueta
    generateEtiquetaMaePDF(dummyMasterVolume, notaData, formatoImpressao, etiquetaMae.id, layoutStyle);
    
    toast({
      title: "Etiqueta Mãe Impressa",
      description: `Etiqueta mãe ${etiquetaMae.id} impressa com sucesso.`,
    });
    
    return etiquetaMae.id;
  };

  return {
    isGenerating,
    printEtiquetas,
    reimprimirEtiquetas,
    printEtiquetaMae,
    createAndPrintEtiquetaMae
  };
};
