
// Tipos relacionados à expedição e carregamento
import { Empresa } from './empresa.types';
import { Motorista, Veiculo } from './transporte.types';
import { NotaFiscal } from './fiscal.types';
import { Perfil } from './usuario.types';
import { Etiqueta } from './armazem.types';

// Ordem de Carregamento
export interface OrdemCarregamento {
  id: string;
  numero_ordem: string;
  tipo_carregamento: string;
  data_criacao: string;
  data_programada?: string;
  data_inicio?: string;
  data_finalizacao?: string;
  status: string;
  empresa_cliente_id?: string;
  filial_id?: string;
  motorista_id?: string;
  veiculo_id?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  empresa_cliente?: Empresa;
  filial?: Empresa;
  motorista?: Motorista;
  veiculo?: Veiculo;
  notas_fiscais?: NotaFiscal[];
}

// Item de Carregamento
export interface ItemCarregamento {
  ordem_carregamento_id: string;
  nota_fiscal_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  ordem_carregamento?: OrdemCarregamento;
  nota_fiscal?: NotaFiscal;
}

// Carregamento (Carga)
export interface Carregamento {
  id: string;
  ordem_carregamento_id?: string;
  data_inicio_carregamento?: string;
  data_fim_carregamento?: string;
  responsavel_carregamento_id?: string;
  conferente_id?: string;
  quantidade_volumes: number;
  peso_total?: number;
  status: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  ordem_carregamento?: OrdemCarregamento;
  responsavel_carregamento?: Perfil;
  conferente?: Perfil;
}

// Enderecamento no caminhão
export interface EnderecamentoCaminhao {
  id: string;
  carregamento_id: string;
  etiqueta_id: string;
  posicao: string;
  ordem?: number;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos
  carregamento?: Carregamento;
  etiqueta?: Etiqueta;
}
