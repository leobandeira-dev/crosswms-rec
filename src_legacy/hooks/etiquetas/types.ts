
export type LayoutStyle = 
  | 'enhanced' 
  | 'portrait' 
  | 'enhanced_contrast' 
  | 'portrait_contrast'
  | 'transul_enhanced'
  | 'transul_contrast';

export interface GenerationOptions {
  formatoImpressao?: string;
  codigoONU?: string;
  codigoRisco?: string;
  tipoVolume?: 'geral' | 'quimico';
  layoutStyle?: LayoutStyle;
  area?: string;
}

export interface CurrentEtiqueta {
  id: string;
  tipo: string;
  descricao?: string;
  quantidade?: number;
  status?: string;
}

export interface EtiquetaFormat {
  width: number;
  height: number;
  unit: string;
}

export interface EtiquetaGenerationResult {
  status: 'success' | 'error';
  message?: string;
  volumes?: any[];
}

export interface NotaData {
  fornecedor: string;
  destinatario: string;
  endereco: string;
  cidade: string;
  cidadeCompleta: string;
  uf: string;
  pesoTotal: string;
  chaveNF: string;
  tipoEtiquetaMae?: string;
  transportadora?: string;
}

export interface VolumeData {
  id: string;
  notaFiscal: string;
  descricao: string;
  quantidade: number;
  etiquetado: boolean;
  remetente: string;
  destinatario: string;
  endereco: string;
  cidade: string;
  cidadeCompleta?: string;
  uf: string;
  pesoTotal: string;
  chaveNF: string;
  etiquetaMae?: string;
  tipoEtiquetaMae?: string;
  tipoVolume?: 'geral' | 'quimico';
  codigoONU?: string;
  codigoRisco?: string;
  classificacaoQuimica?: 'nao_perigosa' | 'perigosa' | 'nao_classificada';
  transportadora?: string;
  qrCode?: string;
  area?: string;
  volumeNumber?: number;
  totalVolumes?: number;
}
