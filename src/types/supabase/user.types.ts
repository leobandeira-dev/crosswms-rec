
// User and permissions related types
import { Empresa } from './company.types';
import { Json } from './base.types';

// Usuário
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  avatar_url?: string;
  empresa_id?: string;
  perfil_id?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  role?: string;
  
  // Relacionamentos
  empresa?: Empresa;
  perfil?: Perfil;
}

// Perfil (Roles)
export interface Perfil {
  id: string;
  nome: string;
  descricao?: string;
  permissoes: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Modulo (System module)
export interface Modulo {
  id: string;
  nome: string;
  descricao?: string;
  status?: string;
  created_at: string;
}

// Tabela (System table/entity)
export interface Tabela {
  id: string;
  nome: string;
  modulo_id?: string;
  descricao?: string;
  status?: string;
  created_at: string;
  
  // Relationships
  modulo?: Modulo;
}

// Rotina (System routine/operation)
export interface Rotina {
  id: string;
  nome: string;
  tabela_id?: string;
  descricao?: string;
  status?: string;
  created_at: string;
  
  // Relationships
  tabela?: Tabela;
}

// PerfilPermissao (Profile permission mapping)
export interface PerfilPermissao {
  perfil_id: string;
  modulo_id: string;
  tabela_id: string;
  rotina_id: string;
  permitido?: boolean;
  created_at: string;
  updated_at: string;
  
  // Relationships
  perfil?: Perfil;
  modulo?: Modulo;
  tabela?: Tabela;
  rotina?: Rotina;
}
