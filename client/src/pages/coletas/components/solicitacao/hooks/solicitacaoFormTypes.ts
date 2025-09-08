
import { SolicitacaoFormData, EmpresaInfo, DadosEmpresa } from '../SolicitacaoTypes';
import { NotaFiscalVolume } from '../../../utils/volumes/types';

// Internal form data with some fields optional for initial state
export interface InternalFormData extends Partial<SolicitacaoFormData> {
  remetente: EmpresaInfo;
  destinatario: EmpresaInfo;
  dataColeta: string;
  horaColeta?: string;
  observacoes: string;
  notasFiscais: NotaFiscalVolume[];
  // Required fields
  tipoFrete: 'FOB' | 'CIF'; // Updated from cliente to tipoFrete
  origem: string;
  destino: string;
  // Extended properties for XML import data
  remetenteInfo?: any;
  destinatarioInfo?: any;
  // Extended properties for address display
  origemEndereco?: string;
  origemCEP?: string;
  destinoEndereco?: string;
  destinoCEP?: string;
  // Extended properties for approval flow
  dataAprovacao?: string;
  horaAprovacao?: string;
  dataInclusao?: string;
  horaInclusao?: string;
}

// Return type for the useSolicitacaoForm hook
export interface UseSolicitacaoFormReturn {
  isLoading: boolean;
  isImporting: boolean;
  currentStep: number;
  formData: InternalFormData;
  handleInputChange: <K extends keyof InternalFormData>(field: K, value: InternalFormData[K]) => void;
  nextStep: () => void;
  prevStep: () => void;
  handleSubmit: () => void;
  handleImportSuccess: (notasFiscais: NotaFiscalVolume[], remetenteInfo?: any, destinatarioInfo?: any) => void;
}
