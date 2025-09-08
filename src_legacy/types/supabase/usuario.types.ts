
// Tipos relacionados a usuários e permissões
import { Empresa } from './empresa.types';
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
  funcao?: string;
  
  // Relacionamentos
  empresa?: Empresa;
  perfil?: Perfil;
}

// Perfil (Roles)
export interface Perfil {
  id: string;
  nome: string;
  email: string;
  empresa_id?: string;
  funcao: string;
  avatar_url?: string;
  ultimo_login?: string;
  created_at: string;
  updated_at: string;
  permissoes?: Record<string, any>;
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
  
  // Relacionamentos
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
  
  // Relacionamentos
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
  
  // Relacionamentos
  perfil?: Perfil;
  modulo?: Modulo;
  tabela?: Tabela;
  rotina?: Rotina;
}
