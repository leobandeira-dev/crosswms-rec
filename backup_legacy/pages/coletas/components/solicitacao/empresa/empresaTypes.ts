
import { EnderecoCompleto, DadosEmpresa, EmpresaInfo } from '../SolicitacaoTypes';

// Using types from SolicitacaoTypes.ts
export type { EnderecoCompleto, DadosEmpresa, EmpresaInfo };

// Empty empresa data objects
export const EMPTY_ENDERECO: EnderecoCompleto = {
  logradouro: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  uf: '',
  cep: ''
};

export const EMPTY_EMPRESA: DadosEmpresa = {
  cnpj: '',
  razaoSocial: '',
  nomeFantasia: '',
  endereco: EMPTY_ENDERECO,
  enderecoFormatado: '',
  telefone: '',
  email: ''
};

// Add missing EnderecoFormProps type
export interface EnderecoFormProps {
  endereco: EnderecoCompleto;
  readOnly?: boolean;
  tipo: 'remetente' | 'destinatario';
  onEnderecoChange: (field: keyof EnderecoCompleto, value: string) => void;
}
