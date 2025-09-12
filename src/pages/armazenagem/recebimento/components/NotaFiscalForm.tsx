import React, { useState, useEffect } from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, X, Box } from 'lucide-react';
import ConfirmationDialog from '@/components/carregamento/enderecamento/ConfirmationDialog';

// Import schema and types
import { notaFiscalSchema, defaultValues, NotaFiscalSchemaType } from './forms/notaFiscalSchema';

// Import form sections
import ImportarPorChave from './forms/ImportarPorChave';
import ImportarViaXML from './forms/ImportarViaXML';
import ImportarXMLEmLote from './forms/ImportarXMLEmLote';
import CadastroManual from './forms/CadastroManual';
import DadosNotaFiscal from './forms/DadosNotaFiscal';
import DadosEmitente from './forms/DadosEmitente';
import DadosDestinatario from './forms/DadosDestinatario';
import InformacoesAdicionais from './forms/InformacoesAdicionais';
import InformacoesTransporte from './forms/InformacoesTransporte';
import InformacoesComplementares from './forms/InformacoesComplementares';

// Import custom hook for form logic
import { useNotaFiscalForm } from './forms/useNotaFiscalForm';

interface NotaFiscalFormProps {
  notaFiscalData?: any;
  onSuccess?: () => void;
  isEditMode?: boolean;
  onInformarCubagem?: (notaInfo: any) => void;
  onNotaProcessed?: (nota: any) => void;
}

const NotaFiscalForm: React.FC<NotaFiscalFormProps> = ({ 
  notaFiscalData, 
  onSuccess, 
  isEditMode = false,
  onInformarCubagem,
  onNotaProcessed
}) => {
  const form = useForm<NotaFiscalSchemaType>({
    resolver: zodResolver(notaFiscalSchema),
    defaultValues,
  });
  
  const { handleSubmit, handleFileUpload, handleKeySearch, handleBatchImport, isLoading } = useNotaFiscalForm(onNotaProcessed);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const handleInformarCubagemClick = () => {
    const formData = form.getValues();
    
    // Check if essential fields are filled
    if (!formData.numeroNF || !formData.quantidadeVolumes) {
      return;
    }
    
    if (onInformarCubagem) {
      onInformarCubagem(formData);
    }
  };

  // Populate form with existing data when in edit mode
  useEffect(() => {
    if (isEditMode && notaFiscalData) {
      console.log('Populando formulário com dados da nota fiscal:', notaFiscalData);
      
      // Map the nota fiscal data to form fields
      const formData = {
        // Dados básicos da nota fiscal
        numeroNF: notaFiscalData.numero_nf || '',
        serieNF: notaFiscalData.serie || '',
        chaveNF: notaFiscalData.chave_nota_fiscal || '',
        valorTotal: notaFiscalData.valor_total?.toString() || '',
        pesoBruto: notaFiscalData.peso_bruto?.toString() || '',
        quantidadeVolumes: notaFiscalData.quantidade_volumes?.toString() || '',
        dataEmissao: notaFiscalData.data_emissao ? new Date(notaFiscalData.data_emissao).toISOString().split('T')[0] : '',
        tipoOperacao: notaFiscalData.natureza_operacao || '',
        
        // Dados do emitente
        emitenteCnpj: notaFiscalData.emitente_cnpj || '',
        emitenteRazaoSocial: notaFiscalData.emitente_razao_social || '',
        emitenteTelefone: notaFiscalData.emitente_telefone || '',
        emitenteUf: notaFiscalData.emitente_uf || '',
        emitenteCidade: notaFiscalData.emitente_cidade || '',
        emitenteBairro: notaFiscalData.emitente_bairro || '',
        emitenteEndereco: notaFiscalData.emitente_endereco || '',
        emitenteNumero: notaFiscalData.emitente_numero || '',
        emitenteCep: notaFiscalData.emitente_cep || '',
        
        // Dados do destinatário
        destinatarioCnpj: notaFiscalData.destinatario_cnpj || '',
        destinatarioRazaoSocial: notaFiscalData.destinatario_razao_social || '',
        destinatarioTelefone: notaFiscalData.destinatario_telefone || '',
        destinatarioUf: notaFiscalData.destinatario_uf || '',
        destinatarioCidade: notaFiscalData.destinatario_cidade || '',
        destinatarioBairro: notaFiscalData.destinatario_bairro || '',
        destinatarioEndereco: notaFiscalData.destinatario_endereco || '',
        destinatarioNumero: notaFiscalData.destinatario_numero || '',
        destinatarioCep: notaFiscalData.destinatario_cep || '',
        
        // Informações adicionais
        numeroPedido: notaFiscalData.numero_pedido || '',
        informacoesComplementares: notaFiscalData.informacoes_complementares || '',
        fobCif: notaFiscalData.fob_cif || '',
        
        // Informações de transporte
        numeroColeta: notaFiscalData.numero_coleta || '',
        valorColeta: notaFiscalData.valor_coleta?.toString() || '',
        numeroCteColeta: notaFiscalData.numero_cte_coleta || '',
        numeroCteViagem: notaFiscalData.numero_cte_viagem || '',
        statusEmbarque: notaFiscalData.status_embarque || '',
        responsavelEntrega: notaFiscalData.responsavel_entrega || '',
        motorista: notaFiscalData.motorista || '',
        tempoArmazenamento: notaFiscalData.tempo_armazenamento_horas?.toString() || '',
        entregueAoFornecedor: notaFiscalData.entregue_ao_fornecedor || '',
        
        // Informações complementares - properly map from database fields
        dataHoraEntrada: notaFiscalData.data_hora_entrada ? new Date(notaFiscalData.data_hora_entrada).toISOString().slice(0, 16) : '',
        quimico: notaFiscalData.quimico ? 'sim' : 'nao',
        fracionado: notaFiscalData.fracionado ? 'sim' : 'nao',
        observacoes: notaFiscalData.observacoes || '',
        
        // Set current tab to manual for editing
        currentTab: 'manual'
      };
      
      // Populate form fields
      Object.entries(formData).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          form.setValue(field as any, value);
        }
      });
    }
  }, [isEditMode, notaFiscalData, form]);
  
  const onSubmit = (data: NotaFiscalSchemaType) => {
    setConfirmSubmitOpen(true);
  };
  
  const onConfirmSubmit = async () => {
    const data = form.getValues();
    
    try {
      if (isEditMode && notaFiscalData?.id) {
        // In edit mode, we need to update the existing record
        console.log('Atualizando nota fiscal:', { id: notaFiscalData.id, data });
        await handleSubmit({ ...data, id: notaFiscalData.id, isUpdate: true });
      } else {
        // In create mode, create new record
        await handleSubmit(data);
      }
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (!isEditMode) {
        form.reset(defaultValues);
      }
    } catch (error) {
      console.error('Erro ao processar nota fiscal:', error);
    }
  };
  
  const handleCancel = () => {
    if (isEditMode && onSuccess) {
      onSuccess();
    } else {
      setConfirmCancelOpen(true);
    }
  };
  
  const onConfirmCancel = () => {
    if (!isEditMode) {
      form.reset(defaultValues);
    }
    if (onSuccess) {
      onSuccess();
    }
  };
  
  const handleClear = () => {
    form.reset(defaultValues);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {!isEditMode && (
            <Tabs defaultValue="chave" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="chave">Importar por Chave</TabsTrigger>
                <TabsTrigger value="xml">Importar XML</TabsTrigger>
                <TabsTrigger value="lote">Importar XML em Lote</TabsTrigger>
                <TabsTrigger value="manual">Cadastro Manual</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chave" className="space-y-4 py-4">
                <ImportarPorChave 
                  onBuscarNota={() => handleKeySearch(form.getValues, form.setValue)} 
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="xml" className="space-y-4 py-4">
                <ImportarViaXML 
                  onFileUpload={(e) => handleFileUpload(e, form.setValue)} 
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="lote" className="space-y-4 py-4">
                <ImportarXMLEmLote 
                  onBatchImport={(files) => handleBatchImport(files, form.setValue)}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="manual" className="py-4">
                <CadastroManual />
              </TabsContent>
            </Tabs>
          )}

          {/* Formulário de dados da nota fiscal - always shown in edit mode or for non-batch tabs */}
          {(isEditMode || form.watch('currentTab') !== 'lote') && (
            <>
              <DadosNotaFiscal />
              <DadosEmitente />
              <DadosDestinatario />
              <InformacoesAdicionais />
              <InformacoesTransporte />
              <InformacoesComplementares />
            </>
          )}

          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              {form.watch('numeroNF') && form.watch('quantidadeVolumes') && onInformarCubagem && (
                <Button 
                  type="button" 
                  variant="default"
                  onClick={handleInformarCubagemClick}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center"
                >
                  <Box className="mr-2 h-4 w-4" />
                  Informar Cubagem
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {!isEditMode && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClear}
                  disabled={isLoading}
                  className="flex items-center"
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpar
                </Button>
              )}
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
              >
                {isEditMode ? 'Fechar' : 'Cancelar'}
              </Button>
              <Button 
                type="submit" 
                className="bg-cross-blue hover:bg-cross-blue/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  isEditMode ? 'Atualizar Nota Fiscal' : 'Cadastrar Nota Fiscal'
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <ConfirmationDialog
        open={confirmSubmitOpen}
        onOpenChange={setConfirmSubmitOpen}
        onConfirm={onConfirmSubmit}
        title={isEditMode ? "Confirmar atualização" : "Confirmar cadastro"}
        description={isEditMode ? "Deseja confirmar a atualização desta nota fiscal?" : "Deseja confirmar o cadastro desta nota fiscal?"}
      />

      <ConfirmationDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        onConfirm={onConfirmCancel}
        title="Cancelar cadastro"
        description="Deseja cancelar o cadastro? Todos os dados inseridos serão perdidos."
      />
    </>
  );
};

export default NotaFiscalForm;
