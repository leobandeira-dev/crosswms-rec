
// Mock data for dashboard charts and metrics

export const tempoPendentesAprovacao = [
  { name: '1 dia', value: 12 },
  { name: '2 dias', value: 8 },
  { name: '3+ dias', value: 5 },
];

export const tempoColetaAposAprovacao = [
  { name: '1 dia', value: 18 },
  { name: '2 dias', value: 12 },
  { name: '3+ dias', value: 7 },
];

export const coletasNaoEfetuadas = [
  { name: '1 dia', value: 15 },
  { name: '2 dias', value: 10 },
  { name: '3+ dias', value: 6 },
];

export const tempoNotasSemEmbarque = [
  { name: '1 dia', value: 22 },
  { name: '2 dias', value: 14 },
  { name: '3+ dias', value: 8 },
];

export const atrasoEntregas = [
  { name: '1 dia', value: 9 },
  { name: '2 dias', value: 5 },
  { name: '3+ dias', value: 3 },
];

export const tempoProcessoMedio = [
  { name: 'Solicitação a Aprovação', value: 1.2 },
  { name: 'Aprovação a Coleta', value: 1.5 },
  { name: 'Tempo em Galpão', value: 2.1 },
  { name: 'Tempo em Viagem', value: 3.2 },
];

export const kpiData = [
  { 
    title: 'Tempo Médio Aprovação', 
    value: '1,2', 
    unit: 'dias',
    trend: { value: 10, positive: true } 
  },
  { 
    title: 'Tempo Médio Coleta', 
    value: '1,5', 
    unit: 'dias',
    trend: { value: 5, positive: true } 
  },
  { 
    title: 'Tempo Médio em Galpão', 
    value: '2,1', 
    unit: 'dias',
    trend: { value: 3, positive: false } 
  },
  { 
    title: 'Atrasos em Entregas', 
    value: '8%', 
    unit: '',
    trend: { value: 2, positive: true } 
  },
];

export const collectRequestsChart = [
  { name: 'Segunda', value: 12 },
  { name: 'Terça', value: 19 },
  { name: 'Quarta', value: 15 },
  { name: 'Quinta', value: 22 },
  { name: 'Sexta', value: 28 },
  { name: 'Sábado', value: 9 },
  { name: 'Domingo', value: 4 },
];

export const driverPerformanceChart = [
  { name: 'José Silva', value: 95 },
  { name: 'Carlos Santos', value: 88 },
  { name: 'Maria Oliveira', value: 92 },
  { name: 'Pedro Almeida', value: 78 },
  { name: 'Ana Costa', value: 85 },
];

export const occurrencesChart = [
  { name: 'Atraso', value: 14 },
  { name: 'Dano', value: 5 },
  { name: 'Extravio', value: 2 },
  { name: 'Recusa', value: 8 },
  { name: 'Outros', value: 3 },
];

export const recentCollectRequests = [
  { id: 'COL-2023-001', cliente: 'Indústria ABC Ltda', data: '10/05/2023', origem: 'São Paulo, SP', destino: 'Campinas, SP', status: 'pending' },
  { id: 'COL-2023-002', cliente: 'Distribuidora XYZ', data: '10/05/2023', origem: 'Rio de Janeiro, RJ', destino: 'Niterói, RJ', status: 'approved' },
  { id: 'COL-2023-003', cliente: 'Transportes Rápidos', data: '09/05/2023', origem: 'Belo Horizonte, MG', destino: 'São Paulo, SP', status: 'rejected' },
  { id: 'COL-2023-004', cliente: 'Logística Expressa', data: '09/05/2023', origem: 'Curitiba, PR', destino: 'Florianópolis, SC', status: 'approved' },
];
