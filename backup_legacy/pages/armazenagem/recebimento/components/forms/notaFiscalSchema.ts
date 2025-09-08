
import { z } from 'zod';

export const notaFiscalSchema = z.object({
  // Tab atual
  currentTab: z.string().optional(),
  
  // Dados da Nota Fiscal
  numeroNF: z.string().min(1, 'Número da NF é obrigatório'),
  serieNF: z.string().optional(),
  chaveNF: z.string().optional(),
  dataEmissao: z.string().optional(),
  dataHoraEmissao: z.string().optional(),
  dataEntradaGalpao: z.string().optional(),
  valorTotal: z.string().optional(),
  pesoBruto: z.string().optional(),
  quantidadeVolumes: z.string().optional(),
  tipoOperacao: z.string().optional(),

  // Dados do Emitente
  emitenteCnpj: z.string().optional(),
  emitenteRazaoSocial: z.string().optional(),
  emitenteTelefone: z.string().optional(),
  emitenteUf: z.string().optional(),
  emitenteCidade: z.string().optional(),
  emitenteBairro: z.string().optional(),
  emitenteEndereco: z.string().optional(),
  emitenteNumero: z.string().optional(),
  emitenteCep: z.string().optional(),

  // Dados do Destinatário
  destinatarioCnpj: z.string().optional(),
  destinatarioRazaoSocial: z.string().optional(),
  destinatarioTelefone: z.string().optional(),
  destinatarioUf: z.string().optional(),
  destinatarioCidade: z.string().optional(),
  destinatarioBairro: z.string().optional(),
  destinatarioEndereco: z.string().optional(),
  destinatarioNumero: z.string().optional(),
  destinatarioCep: z.string().optional(),

  // Informações Adicionais
  informacoesComplementares: z.string().optional(),
  numeroPedido: z.string().optional(),
  fobCif: z.string().optional(),
  tipoFrete: z.string().optional(),

  // Informações de Transporte
  numeroColeta: z.string().optional(),
  valorColeta: z.string().optional(),
  numeroCteColeta: z.string().optional(),
  numeroCteViagem: z.string().optional(),
  statusEmbarque: z.string().optional(),
  dataEmbarque: z.string().optional(),

  // Informações Complementares
  dataHoraEntrada: z.string().optional(),
  responsavelEntrega: z.string().optional(),
  quimico: z.string().optional(),
  fracionado: z.string().optional(),
  motorista: z.string().optional(),
  tempoArmazenamento: z.string().optional(),
  entregueAoFornecedor: z.string().optional(),
  observacoes: z.string().optional(),
});

export type NotaFiscalSchemaType = z.infer<typeof notaFiscalSchema>;

export const defaultValues: NotaFiscalSchemaType = {
  currentTab: 'chave',
  numeroNF: '',
  serieNF: '',
  chaveNF: '',
  dataEmissao: '',
  dataHoraEmissao: '',
  dataEntradaGalpao: '',
  valorTotal: '',
  pesoBruto: '',
  quantidadeVolumes: '',
  tipoOperacao: 'entrada',
  
  // Emitente
  emitenteCnpj: '',
  emitenteRazaoSocial: '',
  emitenteTelefone: '',
  emitenteUf: '',
  emitenteCidade: '',
  emitenteBairro: '',
  emitenteEndereco: '',
  emitenteNumero: '',
  emitenteCep: '',
  
  // Destinatário
  destinatarioCnpj: '',
  destinatarioRazaoSocial: '',
  destinatarioTelefone: '',
  destinatarioUf: '',
  destinatarioCidade: '',
  destinatarioBairro: '',
  destinatarioEndereco: '',
  destinatarioNumero: '',
  destinatarioCep: '',
  
  // Informações Adicionais
  informacoesComplementares: '',
  numeroPedido: '',
  fobCif: '',
  tipoFrete: '',
  
  // Transporte
  numeroColeta: '',
  valorColeta: '',
  numeroCteColeta: '',
  numeroCteViagem: '',
  statusEmbarque: '',
  dataEmbarque: '',
  
  // Complementares
  dataHoraEntrada: '',
  responsavelEntrega: '',
  quimico: '',
  fracionado: '',
  motorista: '',
  tempoArmazenamento: '',
  entregueAoFornecedor: '',
  observacoes: '',
};
