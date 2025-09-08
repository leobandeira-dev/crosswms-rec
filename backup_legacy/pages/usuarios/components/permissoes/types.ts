
export type Permission = Record<string, Record<string, Record<string, boolean>>>;

export interface Profile {
  id: string;
  nome: string;
  descricao?: string;
}

export interface ModuloEmpresa {
  id: string;
  nome: string;
  tabelas: TabelaEmpresa[];
}

export interface TabelaEmpresa {
  id: string;
  nome: string;
  rotinas: RotinaEmpresa[];
}

export interface RotinaEmpresa {
  id: string;
  nome: string;
}
