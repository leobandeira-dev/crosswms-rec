
// Mock data for cargas (loads)
export const cargas = [
  { 
    id: 'OC-2023001', 
    destino: 'São Paulo, SP', 
    motorista: 'José da Silva',
    veiculo: 'ABC-1234',
    dataPrevisao: '15/05/2023',
    volumes: 24,
    peso: '1.200 kg',
    status: 'transit'
  },
  { 
    id: 'OC-2023002', 
    destino: 'Rio de Janeiro, RJ', 
    motorista: 'Carlos Santos',
    veiculo: 'DEF-5678',
    dataPrevisao: '17/05/2023',
    volumes: 18,
    peso: '980 kg',
    status: 'loading'
  },
  { 
    id: 'OC-2023003', 
    destino: 'Belo Horizonte, MG', 
    motorista: 'Pedro Oliveira',
    veiculo: 'GHI-9012',
    dataPrevisao: '20/05/2023',
    volumes: 32,
    peso: '1.580 kg',
    status: 'delivered'
  },
  { 
    id: 'OC-2023004', 
    destino: 'Salvador, BA', 
    motorista: 'Antônio Ferreira',
    veiculo: 'JKL-3456',
    dataPrevisao: '22/05/2023',
    volumes: 15,
    peso: '760 kg',
    status: 'scheduled'
  },
  { 
    id: 'OC-2023005', 
    destino: 'Curitiba, PR', 
    motorista: 'Manuel Costa',
    veiculo: 'MNO-7890',
    dataPrevisao: '18/05/2023',
    volumes: 27,
    peso: '1.350 kg',
    status: 'problem'
  },
  { 
    id: 'OC-2023006', 
    destino: 'Florianópolis, SC', 
    motorista: 'Roberto Almeida',
    veiculo: 'PQR-1234',
    dataPrevisao: '19/05/2023',
    volumes: 20,
    peso: '1.100 kg',
    status: 'pending'
  }
];

// Mock data for historical loads
export const historicoCargas = [
  { 
    id: 'OC-2023001', 
    destino: 'São Paulo, SP', 
    motorista: 'José da Silva',
    veiculo: 'ABC-1234',
    dataEntrega: '12/05/2023',
    volumes: 24,
    peso: '1.200 kg',
    status: 'delivered'
  },
  { 
    id: 'OC-2022098', 
    destino: 'Campinas, SP', 
    motorista: 'José da Silva',
    veiculo: 'ABC-1234',
    dataEntrega: '28/04/2023',
    volumes: 16,
    peso: '850 kg',
    status: 'delivered'
  },
  { 
    id: 'OC-2022087', 
    destino: 'Brasília, DF', 
    motorista: 'José da Silva',
    veiculo: 'ABC-1234',
    dataEntrega: '15/04/2023',
    volumes: 22,
    peso: '1.100 kg',
    status: 'problem'
  },
];
