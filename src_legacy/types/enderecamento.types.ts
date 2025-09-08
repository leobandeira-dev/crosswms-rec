
// Tipos de pesquisa
export type SearchType = 'volume' | 'etiquetaMae' | 'notaFiscal';

// Tipo para volume
export interface Volume {
  id: string;
  descricao: string;
  peso: string;
  fragil: boolean;
  posicionado: boolean;
  etiquetaMae: string;
  notaFiscal: string;
  fornecedor: string;
  quantidade: number;
  etiquetado: boolean;
}

// Tipo para célula do caminhão
export interface CelulaLayout {
  id: string;
  coluna: 'esquerda' | 'centro' | 'direita';
  linha: number;
  volumes: Volume[];
}
