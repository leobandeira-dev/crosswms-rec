
export interface EnderecoHierarquia {
  id: string;
  nome: string;
  codigo: string;
  status: 'ativo' | 'inativo';
}

export interface Filial extends EnderecoHierarquia {
  cnpj: string;
}

export interface Area extends EnderecoHierarquia {
  filialId: string;
  descricao: string;
}

export interface Rota extends EnderecoHierarquia {
  areaId: string;
  descricao: string;
}

export interface Rua extends EnderecoHierarquia {
  rotaId: string;
}

export interface Predio extends EnderecoHierarquia {
  ruaId: string;
}

export interface Bloco extends EnderecoHierarquia {
  predioId: string;
}

export interface Andar extends EnderecoHierarquia {
  blocoId: string;
  numero: number;
}

export interface Apartamento extends EnderecoHierarquia {
  andarId: string;
  capacidade: number;
  tipoEstoque: string;
}

// Tipo para o endereço completo
export interface EnderecoCompleto {
  id: string;
  filial: string;
  area: string;
  rota: string;
  rua: string;
  predio: string;
  bloco: string;
  andar: string;
  apartamento: string;
  endereco: string; // Representação completa
  capacidade: string;
  tipoEstoque: string;
  disponivel: boolean;
}
