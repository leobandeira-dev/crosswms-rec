
import { NotaFiscal, OrdemCarregamento } from './types';

// Mock data for available notas fiscais
export const mockNotasFiscais: NotaFiscal[] = [
  { 
    id: 'NF-2023-001', 
    numero: '12345', 
    remetente: 'Fornecedor ABC', 
    cliente: 'Cliente XYZ', 
    pedido: 'PED-001',
    dataEmissao: '15/05/2023', 
    valor: 1250.00,
    pesoBruto: 120.5
  },
  { 
    id: 'NF-2023-002', 
    numero: '12346', 
    remetente: 'Fornecedor DEF', 
    cliente: 'Cliente MNO', 
    pedido: 'PED-002',
    dataEmissao: '16/05/2023', 
    valor: 2345.67,
    pesoBruto: 210.3
  },
  { 
    id: 'NF-2023-003', 
    numero: '12347', 
    remetente: 'Fornecedor GHI', 
    cliente: 'Cliente PQR', 
    pedido: 'PED-003',
    dataEmissao: '17/05/2023', 
    valor: 3456.78,
    pesoBruto: 315.7
  },
];

// Mock data for ordens carregamento
export const mockOrdensCarregamento: OrdemCarregamento[] = [
  { 
    id: 'OC-2023-001', 
    cliente: 'Cliente XYZ', 
    tipoCarregamento: 'entrega',
    dataCarregamento: '15/05/2023',
    transportadora: 'Transportadora A',
    placaVeiculo: 'ABC1234',
    motorista: 'João Silva',
    observacoes: 'Entregar com urgência',
    status: 'pending',
    volumesTotal: 10,
    volumesVerificados: 3
  },
  { 
    id: 'OC-2023-002', 
    cliente: 'Cliente MNO', 
    tipoCarregamento: 'transferencia',
    dataCarregamento: '16/05/2023',
    transportadora: 'Transportadora B',
    placaVeiculo: 'DEF5678',
    motorista: 'Maria Oliveira',
    status: 'processing',
    volumesTotal: 15,
    volumesVerificados: 8
  },
  { 
    id: 'OC-2023-003', 
    cliente: 'Cliente PQR', 
    tipoCarregamento: 'devolucao',
    dataCarregamento: '17/05/2023',
    transportadora: 'Transportadora C',
    placaVeiculo: 'GHI9012',
    motorista: 'Carlos Santos',
    observacoes: 'Material com defeito',
    status: 'completed',
    volumesTotal: 8,
    volumesVerificados: 8
  },
];
