
// Occurrences and support related types
import { Empresa } from './company.types';
import { NotaFiscal } from './fiscal.types';
import { Coleta } from './coleta.types';
import { Carregamento } from './shipping.types';
import { Etiqueta } from './warehouse.types';
import { Usuario } from './user.types';

// Ocorrência
export interface Ocorrencia {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  prioridade: string;
  status: string;
  data_abertura: string;
  data_resolucao?: string;
  empresa_cliente_id?: string;
  nota_fiscal_id?: string;
  coleta_id?: string;
  carregamento_id?: string;
  etiqueta_id?: string;
  usuario_abertura_id?: string;
  usuario_responsavel_id?: string;
  solucao?: string;
  created_at: string;
  updated_at: string;
  
  // Relationships
  empresa_cliente?: Empresa;
  nota_fiscal?: NotaFiscal;
  coleta?: Coleta;
  carregamento?: Carregamento;
  etiqueta?: Etiqueta;
  usuario_abertura?: Usuario;
  usuario_responsavel?: Usuario;
  comentarios?: ComentarioOcorrencia[];
}

// Comentário de Ocorrência
export interface ComentarioOcorrencia {
  id: string;
  ocorrencia_id: string;
  usuario_id?: string;
  comentario: string;
  data_comentario: string;
  created_at: string;
  
  // Relationships
  usuario?: Usuario;
  ocorrencia?: Ocorrencia;
}
