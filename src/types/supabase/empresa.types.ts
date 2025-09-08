
// Tipos relacionados a empresas (Empresa, Filial)

// Empresa
export interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  tipo: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  status?: string;
  created_at: string;
  updated_at: string;
}

// Filial (Branch)
export interface Filial {
  id: string;
  nome: string;
  cnpj: string;
  empresa_id?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  empresa?: Empresa;
}
