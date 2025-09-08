
import { NotaFiscal as OCNotaFiscal } from '@/components/carregamento/OrderDetailsForm';
import { NotaFiscal } from '../../Faturamento';

// Interface para os valores do cabeçalho
export interface CabecalhoValores {
  fretePorTonelada: number;
  pesoMinimo: number;
  aliquotaICMS: number;
  aliquotaExpresso: number;
  valorFreteTransferencia: number;
  valorColeta: number;
  paletizacao: number;
  pedagio: number;
}

// Interface para os totais calculados
export interface TotaisCalculados {
  fretePesoViagem: number;
  pedagioViagem: number;
  expressoViagem: number;
  icmsViagem: number;
  totalViagem: number;
}

// Interface para os parâmetros de importação de OC
export interface ImportacaoOCParams {
  notasOC: OCNotaFiscal[];
  ocId: string;
}
