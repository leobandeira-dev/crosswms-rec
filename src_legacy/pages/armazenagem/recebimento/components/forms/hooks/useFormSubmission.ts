
import { useToast } from "@/hooks/use-toast";
import { NotaFiscalSchemaType } from '../notaFiscalSchema';
import { supabase } from "@/integrations/supabase/client";
import { atualizarNotaFiscal } from "@/services/notaFiscal/updateNotaFiscalService";

export const useFormSubmission = () => {
  const { toast } = useToast();

  const handleSubmit = async (formData: NotaFiscalSchemaType) => {
    try {
      console.log('=== INICIANDO SUBMISSÃO DO FORMULÁRIO ===');
      console.log('Dados do formulário recebidos:', formData);

      // Prepare the data for insertion
      const notaFiscalData = {
        numero: formData.numeroNF || '',
        serie: formData.serieNF || null,
        chave_acesso: formData.chaveNF || null,
        valor_total: formData.valorTotal ? parseFloat(formData.valorTotal.toString()) : 0,
        peso_bruto: formData.pesoBruto ? parseFloat(formData.pesoBruto.toString()) : null,
        quantidade_volumes: formData.quantidadeVolumes ? parseInt(formData.quantidadeVolumes.toString()) : null,
        data_emissao: formData.dataEmissao ? new Date(formData.dataEmissao).toISOString() : new Date().toISOString(),
        tipo_operacao: formData.tipoOperacao || null,
        
        // Dados do emitente
        emitente_cnpj: formData.emitenteCnpj || null,
        emitente_razao_social: formData.emitenteRazaoSocial || null,
        emitente_telefone: formData.emitenteTelefone || null,
        emitente_uf: formData.emitenteUf || null,
        emitente_cidade: formData.emitenteCidade || null,
        emitente_bairro: formData.emitenteBairro || null,
        emitente_endereco: formData.emitenteEndereco || null,
        emitente_numero: formData.emitenteNumero || null,
        emitente_cep: formData.emitenteCep || null,
        
        // Dados do destinatário
        destinatario_cnpj: formData.destinatarioCnpj || null,
        destinatario_razao_social: formData.destinatarioRazaoSocial || null,
        destinatario_telefone: formData.destinatarioTelefone || null,
        destinatario_uf: formData.destinatarioUf || null,
        destinatario_cidade: formData.destinatarioCidade || null,
        destinatario_bairro: formData.destinatarioBairro || null,
        destinatario_endereco: formData.destinatarioEndereco || null,
        destinatario_numero: formData.destinatarioNumero || null,
        destinatario_cep: formData.destinatarioCep || null,
        
        // Informações adicionais
        numero_pedido: formData.numeroPedido || null,
        informacoes_complementares: formData.informacoesComplementares || null,
        fob_cif: formData.fobCif || null,
        
        // Informações de transporte
        numero_coleta: formData.numeroColeta || null,
        valor_coleta: formData.valorColeta ? parseFloat(formData.valorColeta.toString()) : null,
        numero_cte_coleta: formData.numeroCteColeta || null,
        numero_cte_viagem: formData.numeroCteViagem || null,
        status_embarque: formData.statusEmbarque || null,
        responsavel_entrega: formData.responsavelEntrega || null,
        motorista: formData.motorista || null,
        tempo_armazenamento_horas: formData.tempoArmazenamento ? parseFloat(formData.tempoArmazenamento.toString()) : null,
        entregue_ao_fornecedor: formData.entregueAoFornecedor || null,
        
        // Informações complementares - properly convert to boolean and include dates
        data_hora_entrada: formData.dataHoraEntrada ? new Date(formData.dataHoraEntrada).toISOString() : null,
        data_entrada_galpao: formData.dataEntradaGalpao ? new Date(formData.dataEntradaGalpao).toISOString() : null,
        quimico: formData.quimico === 'sim',
        fracionado: formData.fracionado === 'sim',
        observacoes: formData.observacoes || null,
        
        // Status padrão
        status: 'pendente',
        data_inclusao: new Date().toISOString()
      };

      console.log('Dados preparados para inserção:', notaFiscalData);

      // Insert into database
      const { data: insertedData, error } = await supabase
        .from('notas_fiscais')
        .insert([notaFiscalData])
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir nota fiscal:', error);
        throw new Error(`Erro ao salvar nota fiscal: ${error.message}`);
      }

      console.log('✅ Nota fiscal inserida com sucesso:', insertedData);

      toast({
        title: "✅ Sucesso",
        description: "Nota fiscal cadastrada com sucesso!",
      });

      return insertedData;

    } catch (error) {
      console.error('=== ERRO NA SUBMISSÃO ===');
      console.error('Erro completo:', error);
      
      toast({
        title: "❌ Erro",
        description: `Erro ao processar nota fiscal: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  const handleUpdate = async (id: string, formData: NotaFiscalSchemaType) => {
    try {
      console.log('=== INICIANDO ATUALIZAÇÃO DO FORMULÁRIO ===');
      console.log('ID da nota fiscal:', id);
      console.log('Dados do formulário recebidos:', formData);

      // Prepare the data for update
      const updateData = {
        numero: formData.numeroNF || '',
        serie: formData.serieNF || null,
        chave_acesso: formData.chaveNF || null,
        valor_total: formData.valorTotal ? parseFloat(formData.valorTotal.toString()) : 0,
        peso_bruto: formData.pesoBruto ? parseFloat(formData.pesoBruto.toString()) : null,
        quantidade_volumes: formData.quantidadeVolumes ? parseInt(formData.quantidadeVolumes.toString()) : null,
        data_emissao: formData.dataEmissao ? new Date(formData.dataEmissao).toISOString() : new Date().toISOString(),
        tipo_operacao: formData.tipoOperacao || null,
        
        // Dados do emitente
        emitente_cnpj: formData.emitenteCnpj || null,
        emitente_razao_social: formData.emitenteRazaoSocial || null,
        emitente_telefone: formData.emitenteTelefone || null,
        emitente_uf: formData.emitenteUf || null,
        emitente_cidade: formData.emitenteCidade || null,
        emitente_bairro: formData.emitenteBairro || null,
        emitente_endereco: formData.emitenteEndereco || null,
        emitente_numero: formData.emitenteNumero || null,
        emitente_cep: formData.emitenteCep || null,
        
        // Dados do destinatário
        destinatario_cnpj: formData.destinatarioCnpj || null,
        destinatario_razao_social: formData.destinatarioRazaoSocial || null,
        destinatario_telefone: formData.destinatarioTelefone || null,
        destinatario_uf: formData.destinatarioUf || null,
        destinatario_cidade: formData.destinatarioCidade || null,
        destinatario_bairro: formData.destinatarioBairro || null,
        destinatario_endereco: formData.destinatarioEndereco || null,
        destinatario_numero: formData.destinatarioNumero || null,
        destinatario_cep: formData.destinatarioCep || null,
        
        // Informações adicionais
        numero_pedido: formData.numeroPedido || null,
        informacoes_complementares: formData.informacoesComplementares || null,
        fob_cif: formData.fobCif || null,
        
        // Informações de transporte
        numero_coleta: formData.numeroColeta || null,
        valor_coleta: formData.valorColeta ? parseFloat(formData.valorColeta.toString()) : null,
        numero_cte_coleta: formData.numeroCteColeta || null,
        numero_cte_viagem: formData.numeroCteViagem || null,
        status_embarque: formData.statusEmbarque || null,
        responsavel_entrega: formData.responsavelEntrega || null,
        motorista: formData.motorista || null,
        tempo_armazenamento_horas: formData.tempoArmazenamento ? parseFloat(formData.tempoArmazenamento.toString()) : null,
        entregue_ao_fornecedor: formData.entregueAoFornecedor || null,
        
        // Informações complementares - properly convert to boolean and include dates
        data_hora_entrada: formData.dataHoraEntrada ? new Date(formData.dataHoraEntrada).toISOString() : null,
        data_entrada_galpao: formData.dataEntradaGalpao ? new Date(formData.dataEntradaGalpao).toISOString() : null,
        quimico: formData.quimico === 'sim',
        fracionado: formData.fracionado === 'sim',
        observacoes: formData.observacoes || null,
      };

      console.log('Dados preparados para atualização:', updateData);

      // Use the existing update service
      const updatedData = await atualizarNotaFiscal(id, updateData);

      console.log('✅ Nota fiscal atualizada com sucesso:', updatedData);

      toast({
        title: "✅ Sucesso",
        description: "Nota fiscal atualizada com sucesso!",
      });

      return updatedData;

    } catch (error) {
      console.error('=== ERRO NA ATUALIZAÇÃO ===');
      console.error('Erro completo:', error);
      
      toast({
        title: "❌ Erro",
        description: `Erro ao atualizar nota fiscal: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  return {
    handleSubmit,
    handleUpdate
  };
};
