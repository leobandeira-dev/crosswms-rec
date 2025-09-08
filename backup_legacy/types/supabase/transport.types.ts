
// Transport related types (drivers, vehicles)
import { Empresa } from './company.types';

// Motorista
export interface Motorista {
  id: string;
  nome: string;
  cpf: string;
  rg?: string;
  cnh: string;
  categoria_cnh: string;
  validade_cnh: string;
  data_nascimento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  telefone?: string;
  email?: string;
  foto_url?: string;
  status?: string;
  transportadora_id?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  transportadora?: Empresa;
}

// Veículo
export interface Veiculo {
  id: string;
  placa: string;
  tipo: string;
  marca?: string;
  modelo?: string;
  ano?: number;
  capacidade_peso?: number;
  capacidade_volume?: number;
  transportadora_id?: string;
  status?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  transportadora?: Empresa;
}
