
// Tipos relacionados ao gerenciamento de armazém
import { Perfil } from './usuario.types';
import { NotaFiscal } from './fiscal.types';
import { Empresa } from './empresa.types';

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
  codigo_onu?: string;
  codigo_risco?: string;
  classificacao_quimica?: string;
  created_at: string;
  updated_at: string;
  
  // Campos adicionais necessários
  area?: string;
  remetente?: string;
  destinatario?: string;
  endereco?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  descricao?: string;
  transportadora?: string;
  chave_nf?: string;
  quantidade?: number;
  peso_total_bruto?: string;
  numero_pedido?: string;
  etiquetado?: boolean;
  data_impressao?: string;
  motivo_inutilizacao?: string;
  data_inutilizacao?: string;
  usuario_inutilizacao_id?: string;
  
  // Relacionamentos
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
  
  // Relacionamentos
  filial?: Empresa;
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
  
  // Relacionamentos
  etiqueta?: Etiqueta;
  localizacao_origem?: Localizacao;
  localizacao_destino?: Localizacao;
  usuario?: Perfil;
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
  
  // Relacionamentos
  usuario?: Perfil;
  localizacao?: Localizacao;
  etiquetas?: Etiqueta[];
}

// Etiqueta Unitização (relacionamento)
export interface EtiquetaUnitizacao {
  etiqueta_id: string;
  unitizacao_id: string;
  data_inclusao: string;
  
  // Relacionamentos
  etiqueta?: Etiqueta;
  unitizacao?: Unitizacao;
}
