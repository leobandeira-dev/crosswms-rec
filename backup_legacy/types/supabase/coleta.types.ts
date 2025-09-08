
// Tipos relacionados a coletas
import { Empresa } from './empresa.types';
import { Motorista, Veiculo } from './transporte.types';
import { NotaFiscal } from './fiscal.types';
import { Perfil } from './usuario.types';

// Coleta
export interface Coleta {
  id: string;
  numero_coleta: string;
  empresa_cliente_id: string;
  endereco_coleta: string;
  cidade_coleta: string;
  estado_coleta: string;
  data_solicitacao: string;
  data_programada?: string;
  horario_inicio?: string;
  horario_fim?: string;
  tipo_coleta: string;
  status: string;
  motorista_id?: string;
  veiculo_id?: string;
  usuario_solicitante_id?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  
  // Additional properties for coletaRegistroService
  solicitacao_id?: string;
  data_realizada?: string;
  quantidade_volumes?: number;
  peso_total?: number;
  
  // Relacionamentos
  empresa_cliente?: Empresa;
  motorista?: Motorista;
  veiculo?: Veiculo;
  usuario_solicitante?: Perfil;
}

// Volumes da Coleta
export interface VolumeColeta {
  id: string;
  coleta_id: string;
  tipo_volume: string;
  quantidade: number;
  peso?: number;
  altura?: number;
  largura?: number;
  comprimento?: number;
  nota_fiscal_numero?: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  coleta?: Coleta;
}

// SolicitacaoColeta type for solicitacaoService
export interface SolicitacaoColeta {
  id: string;
  numero_solicitacao: string;
  data_solicitacao: string;
  empresa_solicitante_id: string;
  tipo_coleta: string;
  status: string;
  endereco_coleta: string;
  cidade_coleta: string;
  estado_coleta: string;
  cep_coleta?: string;
  contato_nome?: string;
  contato_telefone?: string;
  observacoes?: string;
  data_aprovacao?: string;
  data_coleta?: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  empresa_solicitante?: Empresa;
}
