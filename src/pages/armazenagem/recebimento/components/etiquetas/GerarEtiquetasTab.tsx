
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, RefreshCw } from 'lucide-react';
import FormLayout from './form/FormLayout';
import GeneratedVolumesPanel from './GeneratedVolumesPanel';
import { Volume } from '../../hooks/etiquetas/useVolumeState';
import { useBatchAreaClassification } from '../../hooks/etiquetas/useBatchAreaClassification';
import { useEtiquetasDatabase } from '@/hooks/useEtiquetasDatabase';
import { CreateEtiquetaData } from '@/services/etiquetaService';
import { toast } from '@/hooks/use-toast';

interface GerarEtiquetasTabProps {
  form: any;
  generatedVolumes: Volume[];
  handleGenerateVolumes: () => void;
  handlePrintEtiquetas: (volume: Volume) => void;
  handleClassifyVolume: (volume: Volume) => void;
  setVolumes?: React.Dispatch<React.SetStateAction<Volume[]>>;
  setGeneratedVolumes?: React.Dispatch<React.SetStateAction<Volume[]>>;
}

const GerarEtiquetasTab: React.FC<GerarEtiquetasTabProps> = ({
  form,
  generatedVolumes,
  handleGenerateVolumes,
  handlePrintEtiquetas,
  handleClassifyVolume,
  setVolumes,
  setGeneratedVolumes
}) => {
  const { handleBatchClassifyArea } = useBatchAreaClassification();
  const { salvarEtiqueta, buscarEtiquetas, isLoading } = useEtiquetasDatabase();

  const onBatchClassifyArea = (area: string) => {
    if (setVolumes && setGeneratedVolumes) {
      handleBatchClassifyArea(area, setVolumes, setGeneratedVolumes);
    }
  };

  const validateBasicFields = (volume: Volume): string[] => {
    const missingFields: string[] = [];
    
    // Verificar apenas campos realmente obrigatórios
    if (!volume.id || volume.id.trim() === '') {
      missingFields.push('Código da Etiqueta');
    }
    
    if (!volume.notaFiscal || volume.notaFiscal.trim() === '') {
      missingFields.push('Nota Fiscal');
    }
    
    return missingFields;
  };

  const prepareEtiquetaData = (volume: Volume): CreateEtiquetaData => {
    console.log('📋 Preparando dados da etiqueta para volume:', volume.id);
    
    // Garantir que a descrição use o formato correto Volume X/Y
    const descricaoVolume = volume.descricao || `Volume ${volume.volumeNumber || 1}/${volume.totalVolumes || 1}`;
    
    const etiquetaData: CreateEtiquetaData = {
      codigo: volume.id, // Usar o ID já consistente do volume
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
    
    console.log('📤 Dados preparados para etiqueta:', {
      codigo: etiquetaData.codigo,
      area: etiquetaData.area,
      volume_numero: etiquetaData.volume_numero,
      total_volumes: etiquetaData.total_volumes,
      descricao: etiquetaData.descricao
    });
    return etiquetaData;
  };

  const handleGravarEtiquetas = async () => {
    try {
      console.log('🚀 Iniciando processo de gravação de etiquetas...');
      console.log('📦 Total de volumes para gravar:', generatedVolumes.length);
      
      // Validar se há volumes para gravar
      if (!generatedVolumes || generatedVolumes.length === 0) {
        toast({
          title: "❌ Nenhuma Etiqueta para Gravar",
          description: "Gere volumes primeiro antes de tentar gravar as etiquetas.",
          variant: "destructive",
        });
        return;
      }

      // Validar campos obrigatórios básicos
      const volumesValidacao: { volume: Volume; missingFields: string[] }[] = [];
      
      generatedVolumes.forEach(volume => {
        const missingFields = validateBasicFields(volume);
        if (missingFields.length > 0) {
          volumesValidacao.push({ volume, missingFields });
        }
      });

      // Se houver erros críticos, mostrar e parar
      if (volumesValidacao.length > 0) {
        const errorMessages = volumesValidacao.slice(0, 3).map(({ volume, missingFields }) => 
          `Volume ${volume.id}: ${missingFields.join(', ')}`
        ).join('\n');
        
        toast({
          title: "⚠️ Campos Obrigatórios Faltando",
          description: `${errorMessages}${volumesValidacao.length > 3 ? '\n...' : ''}`,
          variant: "destructive",
        });
        return;
      }

      // Contadores de resultados
      let volumesSalvos = 0;
      let contadorErros = 0;
      const erros: string[] = [];

      console.log(`📝 Processando ${generatedVolumes.length} etiquetas...`);

      // Processar cada volume individualmente
      for (let i = 0; i < generatedVolumes.length; i++) {
        const volume = generatedVolumes[i];
        
        try {
          console.log(`💾 [${i + 1}/${generatedVolumes.length}] Processando: ${volume.id}`);
          
          // Preparar dados da etiqueta
          const etiquetaData = prepareEtiquetaData(volume);
          
          // Salvar no banco de dados
          const etiquetaSalva = await salvarEtiqueta(etiquetaData);
          
          console.log(`✅ Etiqueta ${volume.id} salva com ID: ${etiquetaSalva.id}`);
          volumesSalvos++;
          
        } catch (error) {
          contadorErros++;
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          erros.push(`${volume.id}: ${errorMessage}`);
          console.error(`❌ Erro ao gravar ${volume.id}:`, error);
        }
      }

      console.log(`🏁 Processo concluído - Salvos: ${volumesSalvos}, Erros: ${contadorErros}`);

      // Mostrar resultado ao usuário
      if (volumesSalvos > 0 && contadorErros === 0) {
        toast({
          title: "✅ Etiquetas Gravadas com Sucesso!",
          description: `${volumesSalvos} etiqueta(s) foram salvas no banco de dados.`,
        });
        
        // Atualizar lista de etiquetas
        await buscarEtiquetas();
        
      } else if (volumesSalvos > 0 && contadorErros > 0) {
        toast({
          title: "⚠️ Gravação Parcialmente Concluída",
          description: `${volumesSalvos} salvas com sucesso, ${contadorErros} com erro.`,
          variant: "destructive",
        });
        
      } else {
        toast({
          title: "❌ Falha na Gravação",
          description: `Nenhuma etiqueta foi gravada. ${erros.slice(0, 2).join(', ')}`,
          variant: "destructive",
        });
      }

      // Log dos erros para debug
      if (erros.length > 0) {
        console.error('📝 Lista de erros:', erros);
      }

    } catch (error) {
      console.error('💥 Erro crítico no processo:', error);
      toast({
        title: "❌ Erro Crítico",
        description: error instanceof Error ? error.message : "Erro inesperado na gravação",
        variant: "destructive",
      });
    }
  };

  const handleAtualizarEtiquetas = async () => {
    try {
      console.log('🔄 Atualizando lista de etiquetas...');
      await buscarEtiquetas();
      toast({
        title: "✅ Lista Atualizada",
        description: "A lista de etiquetas foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar:', error);
      toast({
        title: "❌ Erro ao Atualizar",
        description: "Não foi possível atualizar a lista de etiquetas.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <FormLayout 
        form={form}
        onGenerateVolumes={handleGenerateVolumes}
        onBatchClassifyArea={setVolumes && setGeneratedVolumes ? onBatchClassifyArea : undefined}
        isGenerating={false}
      />
      
      {generatedVolumes.length > 0 && (
        <div className="space-y-4">
          <div className="flex gap-2 justify-end">
            <Button
              onClick={handleAtualizarEtiquetas}
              variant="outline"
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar Lista
            </Button>
            <Button
              onClick={handleGravarEtiquetas}
              disabled={isLoading || generatedVolumes.length === 0}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Gravando...' : 'Gravar Etiquetas'}
            </Button>
          </div>
          
          <GeneratedVolumesPanel
            volumes={generatedVolumes}
            handlePrintEtiquetas={handlePrintEtiquetas}
            handleClassifyVolume={handleClassifyVolume}
            showEtiquetaMaeColumn={false}
          />
        </div>
      )}
    </div>
  );
};

export default GerarEtiquetasTab;
