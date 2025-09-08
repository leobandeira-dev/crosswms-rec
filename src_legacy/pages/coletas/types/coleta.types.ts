
import { NotaFiscalVolume } from '../utils/volumes/types';

// Endereco data structure
export interface EnderecoCompleto {
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
}

// Empresa data structure
export interface DadosEmpresa {
  cnpj: string;
  cpf?: string;
  razaoSocial: string;
  nomeFantasia: string;
  endereco: EnderecoCompleto;
  enderecoFormatado: string;
}

export interface SolicitacaoColeta {
  id: string;
  dataSolicitacao: string; // Ensure this is always required
  dataColeta?: string;
  status: 'pending' | 'approved' | 'rejected';
  remetente?: DadosEmpresa;
  destinatario?: DadosEmpresa;
  notasFiscais?: NotaFiscalVolume[];
  observacoes?: string;
  // Adding backward compatibility properties
  cliente?: string;
  data?: string;
  solicitante?: string;
  origem?: string;
  destino?: string;
  volumes?: number;
  peso?: string;
  notas?: string[];
  // Adding additional properties needed for approval flows
  prioridade?: string;
  aprovador?: string;
  dataAprovacao?: string;
  motivoRecusa?: string;
}

// Adding the missing Carga interface that many components are trying to import
export interface Carga {
  id: string;
  destino: string;
  dataPrevisao: string;
  dataEntrega?: string; 
  volumes: number;
  peso: string;
  status: 'pending' | 'scheduled' | 'transit' | 'loading' | 'delivered' | 'problem';
  motorista?: string;
  veiculo?: string;
  origem?: string;
  notasFiscais?: string[];
  valorTotal?: number;
  cep?: string;
  observacoes?: string;
  // Novos campos para pré-alocação do tipo de veículo
  tipoVeiculo?: string;
  tipoVeiculoId?: string;
  // Novos campos para cálculo de volume e dimensionamento
  volumeM3?: number;
  altura?: number;
  largura?: number;
  comprimento?: number;
  // Campo para agrupamento no pré-romaneio
  grupoRota?: string;
}

// Adding specialized types for approval flows
export interface SolicitacaoPendente extends SolicitacaoColeta {
  status: 'pending';
  prioridade: string;
}

export interface SolicitacaoAprovada extends SolicitacaoColeta {
  status: 'approved';
  aprovador: string;
  dataAprovacao: string;
}

export interface SolicitacaoRecusada extends SolicitacaoColeta {
  status: 'rejected';
  aprovador: string;
  dataAprovacao: string;
  motivoRecusa: string;
}
