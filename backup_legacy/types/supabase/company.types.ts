
// Company related types (Empresa, Filial)

// Empresa
export interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  inscricao_estadual?: string;
  endereco?: string;
  cidade?: string;
  estado?: string; // Mantido como string, mas será exibido como UF
  cep?: string;
  telefone?: string;
  email?: string;
  logo_url?: string;
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
  estado?: string; // Mantido como string, mas será exibido como UF
  cep?: string;
  telefone?: string;
  email?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  empresa?: Empresa;
}
