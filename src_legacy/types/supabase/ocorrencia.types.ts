
// Tipos relacionados a ocorrências e suporte
import { Empresa } from './empresa.types';
import { NotaFiscal } from './fiscal.types';
import { Coleta } from './coleta.types';
import { Carregamento, OrdemCarregamento } from './expedicao.types';
import { Etiqueta } from './armazem.types';
import { Perfil } from './usuario.types';

// Ocorrência
export interface Ocorrencia {
  id: string;
  tipo: string;
  descricao: string;
  data_ocorrencia: string;
  status: string;
  prioridade: string;
  nota_fiscal_id?: string;
  coleta_id?: string;
  ordem_carregamento_id?: string;
  usuario_reportou_id: string;
  usuario_responsavel_id?: string;
  created_at: string;
  updated_at: string;
  
  // Additional properties for ocorrenciaService
  titulo?: string;
  data_abertura?: string;
  data_resolucao?: string;
  usuario_abertura_id?: string;
  empresa_cliente_id?: string;
  carregamento_id?: string;
  etiqueta_id?: string;
  solucao?: string;
  
  // Relacionamentos
  nota_fiscal?: NotaFiscal;
  coleta?: Coleta;
  ordem_carregamento?: OrdemCarregamento;
  usuario_reportou?: Perfil;
  usuario_responsavel?: Perfil;
  comentarios?: ComentarioOcorrencia[];
}

// Comentário de Ocorrência
export interface ComentarioOcorrencia {
  id: string;
  ocorrencia_id: string;
  usuario_id: string;
  comentario: string;
  data_comentario: string;
  created_at: string;
  
  // Relacionamentos
  usuario?: Perfil;
  ocorrencia?: Ocorrencia;
}
