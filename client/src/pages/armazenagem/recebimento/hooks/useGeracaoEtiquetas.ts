import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Volume } from '../components/etiquetas/VolumesTable';
import { useVolumeActions } from './etiquetas/useVolumeActions';
import { useEtiquetasPrinting } from './etiquetas/useEtiquetasPrinting';
import { useDialogState } from './etiquetas/useDialogState';
import { LayoutStyle } from '@/hooks/etiquetas/types';
import { useEtiquetasDatabase } from '@/hooks/useEtiquetasDatabase';

// Import refactored hooks
import { useVolumeState } from './etiquetas/useVolumeState';
import { useEtiquetaMaeState } from './etiquetas/useEtiquetaMaeState';
import { usePrintOperations } from './etiquetas/usePrintOperations';
import { useVolumeClassification } from './etiquetas/useVolumeClassification';
import { useVolumeGeneration } from './etiquetas/useVolumeGeneration';

export const useGeracaoEtiquetas = () => {
  const location = useLocation();
  
  // Try to get data from location.state first, then from sessionStorage
  let notaFiscalData = location.state || {};
  
  // If no data in location.state, try to get from sessionStorage
  if (Object.keys(notaFiscalData).length === 0) {
    try {
      const storedData = sessionStorage.getItem('xmlData');
      if (storedData) {
        notaFiscalData = JSON.parse(storedData);
        console.log('📋 Dados carregados do sessionStorage:', notaFiscalData);
        console.log('📋 Nota fiscal:', notaFiscalData.notaFiscal || notaFiscalData.numero_nota);
        console.log('📋 Volumes:', notaFiscalData.quantidade_volumes);
        console.log('📋 Peso:', notaFiscalData.peso_total_bruto);
      } else {
        console.warn('⚠️ Nenhum dado encontrado no sessionStorage');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do sessionStorage:', error);
    }
  } else {
    console.log('📋 Dados carregados do location.state:', notaFiscalData);
  }
  
  const { marcarComoEtiquetada, buscarEtiquetasPorCodigo, salvarEtiqueta, buscarEtiquetasPorNotaFiscal } = useEtiquetasDatabase();
  
  // Estado para controle do dialog de confirmação
  const [volumeExistsDialogOpen, setVolumeExistsDialogOpen] = useState(false);
  const [pendingPrintVolume, setPendingPrintVolume] = useState<Volume | null>(null);
  const [existingVolumesCount, setExistingVolumesCount] = useState(0);
  
  // Use refactored hooks
  const { volumes, generatedVolumes, setVolumes, setGeneratedVolumes } = useVolumeState();
  const { tipoEtiqueta, etiquetasMae, setTipoEtiqueta, setEtiquetasMae, handleCreateEtiquetaMae, handleVincularVolumes } = useEtiquetaMaeState();
  const { handlePrintEtiquetas, handleReimprimirEtiquetas, handlePrintEtiquetaMae } = usePrintOperations();
  const { handleSaveVolumeClassification } = useVolumeClassification();
  const { handleGenerateVolumes: generateVolumesHandler } = useVolumeGeneration();
  
  // Original hooks
  const { 
    generateVolumes, 
    classifyVolume,
    vincularVolumes
  } = useVolumeActions();
  
  const {
    isGenerating,
    printEtiquetas,
    reimprimirEtiquetas,
    printEtiquetaMae,
    createEtiquetaMae
  } = useEtiquetasPrinting();
  
  const {
    classifyDialogOpen,
    selectedVolume,
    setClassifyDialogOpen,
    openClassifyDialog
  } = useDialogState();
  
  const form = useForm({
    defaultValues: {
      notaFiscal: '',
      tipoEtiqueta: 'volume',
      volumesTotal: '',
      formatoImpressao: '50x100',
      layoutStyle: 'enhanced' as LayoutStyle,
      tipoVolume: 'geral',
      codigoONU: '',
      codigoRisco: '',
      etiquetaMaeId: '',
      tipoEtiquetaMae: 'geral',
      descricaoEtiquetaMae: '',
      pesoTotalBruto: ''
    }
  });

  // Connect the refactored hooks to the original functions
  const handleGenerateVolumes = () => {
    return generateVolumesHandler(generateVolumes, setVolumes, setGeneratedVolumes)(form.getValues(), notaFiscalData);
  };

  // Função para preparar dados da etiqueta
  const prepareEtiquetaData = (volume: Volume) => {
    console.log('📋 Preparando dados da etiqueta para volume:', volume.id);
    
    const descricaoVolume = volume.descricao || `Volume ${volume.volumeNumber || 1}/${volume.totalVolumes || 1}`;
    
    return {
      codigo: volume.id,
      tipo: 'volume',
      area: volume.area || null,
      remetente: volume.remetente || null,
      destinatario: volume.destinatario || null,
      endereco: volume.endereco || null,
      cidade: volume.cidade || null,
      uf: volume.uf || null,
      cep: null,
      descricao: descricaoVolume,
      transportadora: volume.transportadora || null,
      chave_nf: volume.chaveNF || volume.notaFiscal || null,
      quantidade: volume.quantidade || 1,
      peso_total_bruto: volume.pesoTotal ? String(volume.pesoTotal) : null,
      numero_pedido: volume.numeroPedido || null,
      volume_numero: volume.volumeNumber || 1,
      total_volumes: volume.totalVolumes || 1,
      codigo_onu: volume.codigoONU || null,
      codigo_risco: volume.codigoRisco || null,
      classificacao_quimica: volume.classificacaoQuimica === 'nao_classificada' ? null : volume.classificacaoQuimica,
      etiqueta_mae_id: volume.etiquetaMae || null,
      status: 'gerada'
    };
  };

  // Função para gravar volumes na base
  const saveVolumesToDatabase = async (volumesToSave: Volume[]) => {
    let volumesSalvos = 0;
    const erros: string[] = [];

    for (const volume of volumesToSave) {
      try {
        const etiquetaData = prepareEtiquetaData(volume);
        await salvarEtiqueta(etiquetaData);
        volumesSalvos++;
        console.log(`✅ Etiqueta ${volume.id} salva com sucesso`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        erros.push(`${volume.id}: ${errorMessage}`);
        console.error(`❌ Erro ao gravar ${volume.id}:`, error);
      }
    }

    return { volumesSalvos, erros };
  };

  // Function to mark volumes as labeled in the database
  const markVolumesAsLabeled = async (volumes: Volume[]) => {
    const successfullyMarked: string[] = [];
    const failedToMark: string[] = [];

    for (const volume of volumes) {
      try {
        console.log(`🏷️ Marcando volume ${volume.id} como etiquetado...`);
        
        const etiquetasEncontradas = await buscarEtiquetasPorCodigo(volume.id);
        
        if (etiquetasEncontradas && etiquetasEncontradas.length > 0) {
          const etiqueta = etiquetasEncontradas[0];
          await marcarComoEtiquetada(etiqueta.id);
          successfullyMarked.push(volume.id);
          console.log(`✅ Volume ${volume.id} marcado como etiquetado`);
        } else {
          console.warn(`⚠️ Etiqueta não encontrada no banco para volume: ${volume.id}`);
          failedToMark.push(volume.id);
        }
      } catch (error) {
        console.error(`❌ Erro ao marcar volume ${volume.id} como etiquetado:`, error);
        failedToMark.push(volume.id);
      }
    }

    return { successfullyMarked, failedToMark };
  };

  // Função principal para impressão com todas as validações
  const handlePrintEtiquetasImpl = async (volume: Volume) => {
    try {
      console.log('🖨️ Iniciando processo de impressão para volume:', volume.id);
      
      // 1. Verificar se já existem volumes para esta nota fiscal
      const existingVolumes = await buscarEtiquetasPorNotaFiscal(volume.notaFiscal);
      
      if (existingVolumes && existingVolumes.length > 0) {
        console.log(`⚠️ Encontrados ${existingVolumes.length} volumes existentes para NF ${volume.notaFiscal}`);
        
        // Armazenar dados para confirmação
        setPendingPrintVolume(volume);
        setExistingVolumesCount(existingVolumes.length);
        setVolumeExistsDialogOpen(true);
        return;
      }

      // 2. Prosseguir com impressão normal
      await processPrintVolumes(volume);
      
    } catch (error) {
      console.error('💥 Erro no processo de impressão:', error);
      toast({
        title: "❌ Erro na Impressão",
        description: error instanceof Error ? error.message : "Erro inesperado durante a impressão",
        variant: "destructive",
      });
    }
  };

  // Função para processar a impressão após confirmação
  const processPrintVolumes = async (volume: Volume) => {
    try {
      // 1. Buscar todos os volumes da mesma nota fiscal
      const volumesNota = volumes.filter(vol => vol.notaFiscal === volume.notaFiscal);
      console.log(`📦 Processando ${volumesNota.length} volumes para NF ${volume.notaFiscal}`);

      // 2. Gravar volumes na base se ainda não estão gravados
      const { volumesSalvos, erros } = await saveVolumesToDatabase(volumesNota);
      
      if (erros.length > 0) {
        console.warn('⚠️ Alguns volumes tiveram erro ao gravar:', erros);
      }

      if (volumesSalvos > 0) {
        console.log(`✅ ${volumesSalvos} volumes gravados na base`);
      }

      // 3. Prosseguir com impressão
      const currentFormValues = form.getValues();
      const formatoImpressao = currentFormValues.formatoImpressao;
      const layoutStyle = currentFormValues.layoutStyle as LayoutStyle;
      
      console.log('🖨️ Imprimindo com layout:', layoutStyle);
      
      const result = handlePrintEtiquetas(printEtiquetas)(volume, volumes, notaFiscalData, formatoImpressao, layoutStyle);
      
      if (result && typeof result.then === 'function') {
        result.then(async (res: any) => {
          if (res && res.status === 'success' && res.volumes) {
            // Atualizar estado local
            setVolumes(prevVolumes => 
              prevVolumes.map(vol => {
                const updatedVol = res.volumes!.find((v: any) => v.id === vol.id);
                return updatedVol || vol;
              })
            );
            
            // Marcar volumes como etiquetados no banco de dados
            const { successfullyMarked, failedToMark } = await markVolumesAsLabeled(volumesNota);
            
            // Mostrar toast de sucesso
            toast({
              title: "✅ Etiquetas Impressas com Sucesso",
              description: `${volumesNota.length} etiqueta(s) para NF ${volume.notaFiscal} foram impressas e gravadas.`,
            });
          }
        });
      }
      
    } catch (error) {
      console.error('💥 Erro no processo de impressão:', error);
      toast({
        title: "❌ Erro na Impressão",
        description: error instanceof Error ? error.message : "Erro inesperado durante a impressão",
        variant: "destructive",
      });
    }
  };

  // Função para confirmar impressão mesmo com volumes existentes
  const handleConfirmPrintWithExistingVolumes = async () => {
    if (pendingPrintVolume) {
      await processPrintVolumes(pendingPrintVolume);
      setPendingPrintVolume(null);
    }
  };

  // Function to handle reimprinting
  const handleReimprimirEtiquetasImpl = async (volume: Volume) => {
    const currentFormValues = form.getValues();
    const formatoImpressao = currentFormValues.formatoImpressao;
    const layoutStyle = currentFormValues.layoutStyle as LayoutStyle;
    
    console.log('Reprinting with layout style:', layoutStyle);
    
    const volumesNota = volumes.filter(vol => vol.notaFiscal === volume.notaFiscal);
    const { successfullyMarked, failedToMark } = await markVolumesAsLabeled(volumesNota);
    
    handleReimprimirEtiquetas(reimprimirEtiquetas)(volume, volumes, notaFiscalData, formatoImpressao, layoutStyle);
    
    if (successfullyMarked.length > 0 && failedToMark.length === 0) {
      toast({
        title: "✅ Etiquetas Reimpressas e Marcadas",
        description: `${successfullyMarked.length} etiqueta(s) para NF ${volume.notaFiscal} foram reimpressas e marcadas como etiquetadas.`,
      });
    } else if (successfullyMarked.length > 0 && failedToMark.length > 0) {
      toast({
        title: "⚠️ Etiquetas Reimpressas com Problemas",
        description: `${successfullyMarked.length} etiquetas reimpressas, ${failedToMark.length} não puderam ser marcadas no banco.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "⚠️ Etiquetas Reimpressas",
        description: `Etiquetas para NF ${volume.notaFiscal} foram reimpressas, mas houve problemas ao marcar no banco.`,
        variant: "destructive",
      });
    }
  };
  
  const handleCreateEtiquetaMaeImpl = () => {
    const etiquetaMae = handleCreateEtiquetaMae(createEtiquetaMae)(form.getValues());
    form.setValue('descricaoEtiquetaMae', '');
    return etiquetaMae;
  };

  const handlePrintEtiquetaMaeImpl = async (etiquetaMae: any) => {
    const currentFormValues = form.getValues();
    const formatoImpressao = currentFormValues.formatoImpressao;
    const layoutStyle = currentFormValues.layoutStyle as LayoutStyle;
    
    console.log('Printing master label with layout style:', layoutStyle);
    
    try {
      const etiquetasEncontradas = await buscarEtiquetasPorCodigo(etiquetaMae.id);
      
      if (etiquetasEncontradas && etiquetasEncontradas.length > 0) {
        const etiqueta = etiquetasEncontradas[0];
        await marcarComoEtiquetada(etiqueta.id);
        console.log(`✅ Etiqueta mãe ${etiquetaMae.id} marcada como etiquetada`);
      }
    } catch (error) {
      console.error(`❌ Erro ao marcar etiqueta mãe ${etiquetaMae.id} como etiquetada:`, error);
    }
    
    handlePrintEtiquetaMae(printEtiquetaMae)(etiquetaMae, volumes, formatoImpressao, layoutStyle);
  };

  const handleClassifyVolume = (volume: Volume) => {
    openClassifyDialog(volume);
  };

  const handleSaveVolumeClassificationImpl = (volume: Volume, formData: any) => {
    handleSaveVolumeClassification(classifyVolume, setVolumes, setGeneratedVolumes)(volume, formData);
  };

  const handleVincularVolumesImpl = (etiquetaMaeId: string, volumeIds: string[]) => {
    setVolumes(handleVincularVolumes(vincularVolumes)(etiquetaMaeId, volumeIds, volumes));
  };

  return {
    form,
    notaFiscalData,
    tipoEtiqueta,
    generatedVolumes,
    volumes,
    etiquetasMae,
    classifyDialogOpen,
    selectedVolume,
    isGenerating,
    volumeExistsDialogOpen,
    pendingPrintVolume,
    existingVolumesCount,
    setTipoEtiqueta,
    setVolumes,
    setGeneratedVolumes,
    setEtiquetasMae,
    setClassifyDialogOpen,
    setVolumeExistsDialogOpen,
    handleGenerateVolumes,
    handlePrintEtiquetas: handlePrintEtiquetasImpl,
    handleReimprimirEtiquetas: handleReimprimirEtiquetasImpl,
    handlePrintEtiquetaMae: handlePrintEtiquetaMaeImpl,
    handleCreateEtiquetaMae: handleCreateEtiquetaMaeImpl,
    handleClassifyVolume,
    handleSaveVolumeClassification: handleSaveVolumeClassificationImpl,
    handleVincularVolumes: handleVincularVolumesImpl,
    handleConfirmPrintWithExistingVolumes
  };
};
