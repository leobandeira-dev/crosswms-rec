
// Warehouse management related types
import { Usuario } from './user.types';
import { NotaFiscal } from './fiscal.types';

// Etiqueta
export interface Etiqueta {
  id: string;
  codigo: string;
  tipo: string;
  data_geracao: string;
  altura?: number;
  largura?: number;
  comprimento?: number;
  peso?: number;
  fragil: boolean;
  nota_fiscal_id?: string;
  etiqueta_mae_id?: string;
  status: string;
  volume_numero?: number;
  total_volumes?: number;
  created_at: string;
  updated_at: string;
  
  // Relationships
  nota_fiscal?: NotaFiscal;
  etiqueta_mae?: Etiqueta;
  etiquetas_filhas?: Etiqueta[];
}

// Localização (Endereços no armazém)
export interface Localizacao {
  id: string;
  codigo: string;
  descricao?: string;
  tipo: string;
  filial_id?: string;
  area?: string;
  corredor?: string;
  estante?: string;
  nivel?: string;
  posicao?: string;
  capacidade_peso?: number;
  capacidade_volume?: number;
  ocupado: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

// Movimentação (histórico)
export interface Movimentacao {
  id: string;
  etiqueta_id: string;
  localizacao_origem_id?: string;
  localizacao_destino_id?: string;
  tipo_movimentacao: string;
  data_movimentacao: string;
  usuario_id?: string;
  observacoes?: string;
  created_at: string;
  
  // Relationships
  etiqueta?: Etiqueta;
  localizacao_origem?: Localizacao;
  localizacao_destino?: Localizacao;
  usuario?: Usuario;
}

// Unitização (paletes, containers, etc)
export interface Unitizacao {
  id: string;
  codigo: string;
  tipo_unitizacao: string;
  data_unitizacao: string;
  usuario_id?: string;
  localizacao_id?: string;
  status: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  usuario?: Usuario;
  localizacao?: Localizacao;
  etiquetas?: Etiqueta[];
}

// Etiqueta Unitização (relationship)
export interface EtiquetaUnitizacao {
  etiqueta_id: string;
  unitizacao_id: string;
  data_inclusao: string;
  
  // Relationships
  etiqueta?: Etiqueta;
  unitizacao?: Unitizacao;
}

// Enderecamento no caminhão
export interface EnderecamentoCaminhao {
  id: string;
  carregamento_id?: string;
  etiqueta_id?: string;
  posicao: string;
  ordem?: number;
  created_at: string;
  updated_at?: string; // Made it optional to match shipping.types
  
  // Relationships
  etiqueta?: Etiqueta;
}
