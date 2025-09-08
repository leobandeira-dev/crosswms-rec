
import { ReactNode } from 'react';

export type LayoutStyle = 
  | 'enhanced' 
  | 'portrait' 
  | 'enhanced_contrast' 
  | 'portrait_contrast'
  | 'transul_enhanced'
  | 'transul_contrast';

export interface VolumeData {
  id: string;
  notaFiscal: string;
  remetente: string;
  destinatario: string;
  endereco: string;
  cidade: string;
  cidadeCompleta?: string;
  uf: string;
  pesoTotal: string;
  tipoVolume?: 'geral' | 'quimico';
  codigoONU?: string;
  codigoRisco?: string;
  classificacaoQuimica?: 'nao_perigosa' | 'perigosa' | 'nao_classificada';
  etiquetaMae?: string;
  chaveNF?: string;
  descricao?: string;
  quantidade?: number;
  transportadora?: string;
  area?: string;
}

export interface EtiquetaProps {
  volumeData: VolumeData;
  volumeNumber: number;
  totalVolumes: number;
  format?: 'small' | 'a4';
  tipo?: 'volume' | 'mae';
  layoutStyle?: LayoutStyle;
  transportadoraLogo?: string;
}

export interface EtiquetaLayoutProps {
  volumeData: VolumeData;
  volumeNumber: number;
  totalVolumes: number;
  isMae: boolean;
  isQuimico: boolean;
  displayCidade: string;
  getClassificacaoText: () => string;
}
