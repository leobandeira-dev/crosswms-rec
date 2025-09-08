
import { supabase } from "@/integrations/supabase/client";
import { NotaFiscal, ItemNotaFiscal } from "@/types/supabase/fiscal.types";

/**
 * Creates a new nota fiscal in the database
 */
export const criarNotaFiscal = async (notaFiscal: Partial<NotaFiscal>, itensNotaFiscal?: Partial<ItemNotaFiscal>[]): Promise<NotaFiscal> => {
  try {
    console.log('=== INÍCIO DO SERVIÇO CRIAR NOTA FISCAL ===');
    console.log('Dados recebidos no serviço:', JSON.stringify(notaFiscal, null, 2));
    
    // Verificar se a conexão com Supabase está funcionando
    const { data: testConnection, error: testError } = await supabase
      .from('notas_fiscais')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Erro na conexão com Supabase:', testError);
      throw new Error(`Erro de conexão: ${testError.message}`);
    }
    
    console.log('Conexão com Supabase OK');
    
    // Preparar dados para inserção com todos os campos necessários
    const notaFiscalToInsert = {
      // Campos obrigatórios sempre preenchidos
      numero: notaFiscal.numero || '',
      valor_total: Number(notaFiscal.valor_total) || 0,
      data_emissao: notaFiscal.data_emissao || new Date().toISOString(),
      status: notaFiscal.status || 'pendente',
      data_inclusao: new Date().toISOString(),
      
      // Campos com valores padrão para evitar NULL
      serie: notaFiscal.serie || '1',
      chave_acesso: notaFiscal.chave_acesso || '',
      quantidade_volumes: Number(notaFiscal.quantidade_volumes) || 1,
      peso_bruto: Number(notaFiscal.peso_bruto) || 0,
      tipo_operacao: notaFiscal.tipo_operacao || 'entrada',
      tipo: 'entrada',
      
      // Dados do emitente com valores padrão vazios
      emitente_cnpj: notaFiscal.emitente_cnpj || '',
      emitente_razao_social: notaFiscal.emitente_razao_social || '',
      emitente_telefone: notaFiscal.emitente_telefone || '',
      emitente_uf: notaFiscal.emitente_uf || '',
      emitente_cidade: notaFiscal.emitente_cidade || '',
      emitente_bairro: notaFiscal.emitente_bairro || '',
      emitente_endereco: notaFiscal.emitente_endereco || '',
      emitente_numero: notaFiscal.emitente_numero || '',
      emitente_cep: notaFiscal.emitente_cep || '',
      
      // Dados do destinatário com valores padrão vazios
      destinatario_cnpj: notaFiscal.destinatario_cnpj || '',
      destinatario_razao_social: notaFiscal.destinatario_razao_social || '',
      destinatario_telefone: notaFiscal.destinatario_telefone || '',
      destinatario_uf: notaFiscal.destinatario_uf || '',
      destinatario_cidade: notaFiscal.destinatario_cidade || '',
      destinatario_bairro: notaFiscal.destinatario_bairro || '',
      destinatario_endereco: notaFiscal.destinatario_endereco || '',
      destinatario_numero: notaFiscal.destinatario_numero || '',
      destinatario_cep: notaFiscal.destinatario_cep || '',
      
      // Informações adicionais com valores padrão vazios
      informacoes_complementares: notaFiscal.informacoes_complementares || '',
      numero_pedido: notaFiscal.numero_pedido || '',
      fob_cif: notaFiscal.fob_cif || '',
      
      // Informações de transporte com valores padrão
      numero_coleta: notaFiscal.numero_coleta || '',
      valor_coleta: Number(notaFiscal.valor_coleta) || 0,
      numero_cte_coleta: notaFiscal.numero_cte_coleta || '',
      numero_cte_viagem: notaFiscal.numero_cte_viagem || '',
      data_embarque: notaFiscal.data_embarque || null,
      
      // Informações complementares com valores padrão
      data_entrada: notaFiscal.data_entrada || null,
      status_embarque: notaFiscal.status_embarque || '',
      responsavel_entrega: notaFiscal.responsavel_entrega || '',
      motorista: notaFiscal.motorista || '',
      tempo_armazenamento_horas: Number(notaFiscal.tempo_armazenamento_horas) || 0,
      entregue_ao_fornecedor: notaFiscal.entregue_ao_fornecedor || '',
      observacoes: notaFiscal.observacoes || '',
      
      // Campos booleanos com valor padrão false
      quimico: Boolean(notaFiscal.quimico),
      fracionado: Boolean(notaFiscal.fracionado),
    };
    
    console.log('=== DADOS PREPARADOS PARA INSERÇÃO ===');
    console.log('Dados finais para inserção:', JSON.stringify(notaFiscalToInsert, null, 2));
    
    // Validação básica
    if (!notaFiscalToInsert.numero || notaFiscalToInsert.numero.trim() === '') {
      throw new Error('Número da nota fiscal é obrigatório');
    }
    
    console.log('=== EXECUTANDO INSERT NO SUPABASE ===');
    const { data, error } = await supabase
      .from('notas_fiscais')
      .insert(notaFiscalToInsert)
      .select()
      .single();
    
    if (error) {
      console.error('=== ERRO NO INSERT ===');
      console.error('Erro detalhado do Supabase:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      console.error('Detalhes:', error.details);
      console.error('Hint:', error.hint);
      throw new Error(`Erro ao criar nota fiscal: ${error.message} (Código: ${error.code})`);
    }
    
    console.log('=== SUCESSO NO INSERT ===');
    console.log('Nota fiscal criada com sucesso:', data);
    
    // Se houver itens, cria-los vinculados à nota fiscal
    if (itensNotaFiscal && itensNotaFiscal.length > 0) {
      console.log('=== CRIANDO ITENS DA NOTA FISCAL ===');
      const itensComNotaId = itensNotaFiscal.map(item => ({
        ...item,
        nota_fiscal_id: data.id
      }));
      
      await criarItensNotaFiscal(itensComNotaId);
    }
    
    return data as NotaFiscal;
  } catch (error) {
    console.error('=== ERRO GERAL NO SERVIÇO ===');
    console.error('Erro capturado:', error);
    throw error;
  }
};

/**
 * Creates items for a nota fiscal
 */
export const criarItensNotaFiscal = async (itensNotaFiscal: Partial<ItemNotaFiscal>[]): Promise<ItemNotaFiscal[]> => {
  try {
    if (!itensNotaFiscal.length) return [];
    
    console.log('=== CRIANDO ITENS DA NOTA FISCAL ===');
    console.log('Itens a serem criados:', itensNotaFiscal);
    
    // Ensure all required properties are present for each item
    const itemsWithRequiredProps = itensNotaFiscal.map((item, index) => ({
      codigo_produto: item.codigo_produto || 'N/A',
      descricao: item.descricao || 'N/A',
      quantidade: Number(item.quantidade) || 0,
      valor_unitario: Number(item.valor_unitario) || 0,
      valor_total: Number(item.valor_total) || 0,
      sequencia: item.sequencia || (index + 1),
      nota_fiscal_id: item.nota_fiscal_id,
    }));
    
    const { data, error } = await supabase
      .from('itens_nota_fiscal')
      .insert(itemsWithRequiredProps)
      .select();
    
    if (error) {
      console.error('Erro ao criar itens da nota fiscal:', error);
      throw new Error(`Erro ao criar itens da nota fiscal: ${error.message}`);
    }
    
    console.log('Itens criados com sucesso:', data);
    return data as ItemNotaFiscal[];
  } catch (error: any) {
    console.error('Erro ao criar itens da nota fiscal:', error);
    throw error;
  }
};
