
import { SolicitacaoPendente, SolicitacaoAprovada, SolicitacaoRecusada } from '../types/coleta.types';

// Mock data for pending requests
export const solicitacoesPendentes: SolicitacaoPendente[] = [
  { 
    id: 'COL-2023-001', 
    cliente: 'Indústria ABC Ltda', 
    data: '10/05/2023',
    dataSolicitacao: '10/05/2023', 
    origem: 'São Paulo, SP', 
    destino: 'Campinas, SP', 
    status: 'pending',
    notas: ['12345', '12346'],
    volumes: 12,
    peso: '350kg', 
    solicitante: 'João Silva',
    prioridade: 'Alta'
  },
  { 
    id: 'COL-2023-008', 
    cliente: 'Farmacêutica Beta', 
    data: '12/05/2023',
    dataSolicitacao: '12/05/2023', 
    origem: 'Campinas, SP', 
    destino: 'São Paulo, SP', 
    status: 'pending',
    notas: ['87654'],
    volumes: 8,
    peso: '120kg', 
    solicitante: 'Carlos Mendes',
    prioridade: 'Média'
  },
  { 
    id: 'COL-2023-012', 
    cliente: 'Eletrônicos Tech', 
    data: '13/05/2023',
    dataSolicitacao: '13/05/2023', 
    origem: 'São José dos Campos, SP', 
    destino: 'São Paulo, SP', 
    status: 'pending',
    notas: ['54345', '54346'],
    volumes: 15,
    peso: '280kg', 
    solicitante: 'Ana Costa',
    prioridade: 'Baixa'
  },
];

// Mock data for approval history
export const historicoAprovacoes: (SolicitacaoAprovada | SolicitacaoRecusada)[] = [
  { 
    id: 'COL-2023-002', 
    cliente: 'Distribuidora XYZ', 
    data: '10/05/2023',
    dataSolicitacao: '10/05/2023', 
    origem: 'Rio de Janeiro, RJ', 
    destino: 'Niterói, RJ', 
    status: 'approved',
    notas: ['98765'],
    volumes: 5,
    peso: '120kg',
    solicitante: 'Pedro Santos',
    aprovador: 'Maria Oliveira',
    dataAprovacao: '11/05/2023'
  },
  { 
    id: 'COL-2023-003', 
    cliente: 'Transportes Rápidos', 
    data: '09/05/2023',
    dataSolicitacao: '09/05/2023', 
    origem: 'Belo Horizonte, MG', 
    destino: 'São Paulo, SP', 
    status: 'rejected',
    notas: ['54321', '54322', '54323'],
    volumes: 18,
    peso: '490kg',
    solicitante: 'Roberto Alves',
    aprovador: 'Maria Oliveira',
    dataAprovacao: '10/05/2023',
    motivoRecusa: 'Documentação incompleta'
  },
  { 
    id: 'COL-2023-004', 
    cliente: 'Logística Expressa', 
    data: '09/05/2023',
    dataSolicitacao: '09/05/2023', 
    origem: 'Curitiba, PR', 
    destino: 'Florianópolis, SC', 
    status: 'approved',
    notas: ['23456'],
    volumes: 3,
    peso: '80kg',
    solicitante: 'Juliana Lima',
    aprovador: 'Carlos Ferreira',
    dataAprovacao: '09/05/2023'
  },
];
