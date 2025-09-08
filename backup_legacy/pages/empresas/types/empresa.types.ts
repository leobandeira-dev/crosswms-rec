
export interface Empresa {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  email: string;
  telefone: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  inscricaoEstadual?: string;
  perfil: string;
  status: string;
  tipo: string;
  transportadoraPrincipal: boolean;
  created_at?: string;
  updated_at?: string;
}
