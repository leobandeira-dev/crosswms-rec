
import {
  Filial,
  Area,
  Rota,
  Rua,
  Predio,
  Bloco,
  Andar,
  Apartamento,
  EnderecoCompleto
} from '@/types/enderecamento.cadastro.types';

export const filiais: Filial[] = [
  { id: '1', nome: 'Filial São Paulo', codigo: 'SP', status: 'ativo', cnpj: '12.345.678/0001-90' },
  { id: '2', nome: 'Filial Rio de Janeiro', codigo: 'RJ', status: 'ativo', cnpj: '12.345.678/0002-71' },
  { id: '3', nome: 'Filial Belo Horizonte', codigo: 'BH', status: 'inativo', cnpj: '12.345.678/0003-52' },
];

export const areas: Area[] = [
  { id: '1', nome: 'Armazém Principal', codigo: 'A1', filialId: '1', descricao: 'Área principal de armazenagem', status: 'ativo' },
  { id: '2', nome: 'Armazém Secundário', codigo: 'A2', filialId: '1', descricao: 'Área secundária de armazenagem', status: 'ativo' },
  { id: '3', nome: 'Armazém Especial', codigo: 'A3', filialId: '2', descricao: 'Área para itens especiais', status: 'ativo' },
];

export const rotas: Rota[] = [
  { id: '1', nome: 'Rota Padrão', codigo: 'R1', areaId: '1', descricao: 'Rota padrão de movimentação', status: 'ativo' },
  { id: '2', nome: 'Rota Expressa', codigo: 'R2', areaId: '1', descricao: 'Rota rápida de movimentação', status: 'ativo' },
  { id: '3', nome: 'Rota de Retorno', codigo: 'R3', areaId: '2', descricao: 'Rota para retornos', status: 'ativo' },
];

export const ruas: Rua[] = [
  { id: '1', nome: 'Rua 01', codigo: '01', rotaId: '1', status: 'ativo' },
  { id: '2', nome: 'Rua 02', codigo: '02', rotaId: '1', status: 'ativo' },
  { id: '3', nome: 'Rua 03', codigo: '03', rotaId: '2', status: 'ativo' },
];

export const predios: Predio[] = [
  { id: '1', nome: 'Prédio A', codigo: 'A', ruaId: '1', status: 'ativo' },
  { id: '2', nome: 'Prédio B', codigo: 'B', ruaId: '1', status: 'ativo' },
  { id: '3', nome: 'Prédio C', codigo: 'C', ruaId: '2', status: 'ativo' },
];

export const blocos: Bloco[] = [
  { id: '1', nome: 'Bloco 1', codigo: '1', predioId: '1', status: 'ativo' },
  { id: '2', nome: 'Bloco 2', codigo: '2', predioId: '1', status: 'ativo' },
  { id: '3', nome: 'Bloco 3', codigo: '3', predioId: '2', status: 'ativo' },
];

export const andares: Andar[] = [
  { id: '1', nome: 'Andar 1', codigo: '01', blocoId: '1', numero: 1, status: 'ativo' },
  { id: '2', nome: 'Andar 2', codigo: '02', blocoId: '1', numero: 2, status: 'ativo' },
  { id: '3', nome: 'Andar 1', codigo: '01', blocoId: '2', numero: 1, status: 'ativo' },
];

export const apartamentos: Apartamento[] = [
  { id: '1', nome: 'Apto 01', codigo: '01', andarId: '1', capacidade: 100, tipoEstoque: 'Padrão', status: 'ativo' },
  { id: '2', nome: 'Apto 02', codigo: '02', andarId: '1', capacidade: 150, tipoEstoque: 'Frágil', status: 'ativo' },
  { id: '3', nome: 'Apto 03', codigo: '03', andarId: '2', capacidade: 200, tipoEstoque: 'Padrão', status: 'ativo' },
];

export const enderecosCompletos: EnderecoCompleto[] = [
  {
    id: '1',
    filial: 'SP',
    area: 'A1',
    rota: 'R1',
    rua: '01',
    predio: 'A',
    bloco: '1',
    andar: '01',
    apartamento: '01',
    endereco: 'SP-A1-R1-01-A-1-01-01',
    capacidade: '100',
    tipoEstoque: 'Padrão',
    disponivel: true
  },
  {
    id: '2',
    filial: 'SP',
    area: 'A1',
    rota: 'R1',
    rua: '01',
    predio: 'A',
    bloco: '1',
    andar: '01',
    apartamento: '02',
    endereco: 'SP-A1-R1-01-A-1-01-02',
    capacidade: '150',
    tipoEstoque: 'Frágil',
    disponivel: false
  },
  {
    id: '3',
    filial: 'SP',
    area: 'A1',
    rota: 'R1',
    rua: '01',
    predio: 'A',
    bloco: '1',
    andar: '02',
    apartamento: '03',
    endereco: 'SP-A1-R1-01-A-1-02-03',
    capacidade: '200',
    tipoEstoque: 'Padrão',
    disponivel: true
  },
];
