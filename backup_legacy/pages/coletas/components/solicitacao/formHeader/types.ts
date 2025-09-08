
export interface SolicitacaoFormHeaderProps {
  currentStep?: number;
  isLoading?: boolean;
  // Frete type (FOB/CIF)
  tipoFrete?: 'FOB' | 'CIF';
  // Collection date and time
  dataColeta?: string; 
  horaColeta?: string;
  // Approval date and time
  dataAprovacao?: string;
  horaAprovacao?: string;
  // Inclusion date and time
  dataInclusao?: string;
  horaInclusao?: string;
  // Read-only mode
  readOnly?: boolean;
  // Event handlers
  onTipoFreteChange?: (tipo: 'FOB' | 'CIF') => void;
  onDataColetaChange?: (data: string) => void;
  onHoraColetaChange?: (hora: string) => void;
}

// Add missing AddressSectionProps
export interface AddressSectionProps {
  label: string;
  cidade: string;
  uf: string;
  endereco: string;
  cep: string;
  readOnly?: boolean;
  onCidadeChange?: (value: string) => void;
  onUFChange?: (value: string) => void;
  id: string;
}

// Add missing DateSectionProps
export interface DateSectionProps {
  dataLabel: string;
  horaLabel: string;
  data: string;
  hora: string;
  readonly?: boolean;
  onDataChange?: (data: string) => void;
  onHoraChange?: (hora: string) => void;
  id: string;
}
