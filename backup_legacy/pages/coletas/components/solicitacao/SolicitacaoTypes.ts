
// This file contains the types for the Solicitacao feature

// Address types
export interface EnderecoCompleto {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

// Basic company types
export interface DadosEmpresa {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  endereco: EnderecoCompleto;
  enderecoFormatado: string;
  telefone?: string;
  email?: string;
}

// Simplified company info for form display
export interface EmpresaInfo {
  razaoSocial: string;
  cnpj: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone?: string;
  email?: string;
}

// Form data
export interface SolicitacaoFormData {
  tipoFrete: 'FOB' | 'CIF'; // FOB/CIF option replacing cliente
  origem: string;
  destino: string;
  remetente: EmpresaInfo;
  destinatario: EmpresaInfo;
  dataColeta: string;
  horaColeta?: string;
  observacoes: string;
  notasFiscais: any[];
  dataInclusao?: string;
  horaInclusao?: string;
  quantidadeVolumes?: number;
  // Extended properties for address display
  origemEndereco?: string;
  origemCEP?: string;
  destinoEndereco?: string;
  destinoCEP?: string;
  // Extended properties for approval flow
  dataAprovacao?: string;
  horaAprovacao?: string;
}

// Dialog props
export interface NovaSolicitacaoDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Dialog props for new dialog component
export interface SolicitacaoDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Progress component props
export interface SolicitacaoProgressProps {
  currentStep: number;
  onNext?: () => void;
  onPrev?: () => void;
}

// Footer component props
export interface SolicitacaoFooterProps {
  currentStep: number;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

// Empty objects for initialization
export const EMPTY_EMPRESA = {
  cnpj: '',
  razaoSocial: '',
  nomeFantasia: '',
  endereco: {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: ''
  },
  enderecoFormatado: '',
  telefone: '',
  email: ''
};
