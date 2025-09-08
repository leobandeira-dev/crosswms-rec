
export interface NotaFiscal {
  id: string;
  numero: string;
  emitente: string;
  destinatario: string;
  dataEmissao: string;
  status: string;
  prioridade: string;
  valorTotal: string;
}

// Mock data for demonstration
export const notasFiscaisMock: NotaFiscal[] = [
  { 
    id: 'NF001', 
    numero: 'NF12345', 
    emitente: 'Empresa ABC', 
    destinatario: 'Indústria XYZ', 
    dataEmissao: '2023-10-15', 
    status: 'coletado', 
    prioridade: 'normal',
    valorTotal: 'R$ 1.250,00',
  },
  { 
    id: 'NF002', 
    numero: 'NF12346', 
    emitente: 'Empresa DEF', 
    destinatario: 'Comércio XYZ', 
    dataEmissao: '2023-10-16', 
    status: 'entregue', 
    prioridade: 'prioridade',
    valorTotal: 'R$ 2.150,00',
  },
  { 
    id: 'NF003', 
    numero: 'NF12347', 
    emitente: 'Empresa GHI', 
    destinatario: 'Varejo ABC', 
    dataEmissao: '2023-10-17', 
    status: 'no_armazem', 
    prioridade: 'normal',
    valorTotal: 'R$ 3.450,00',
  },
  { 
    id: 'NF004', 
    numero: 'NF12348', 
    emitente: 'Empresa JKL', 
    destinatario: 'Distribuição XYZ', 
    dataEmissao: '2023-10-18', 
    status: 'em_transferencia', 
    prioridade: 'expressa',
    valorTotal: 'R$ 4.750,00',
  },
  { 
    id: 'NF005', 
    numero: 'NF12349', 
    emitente: 'Empresa MNO', 
    destinatario: 'Atacado ABC', 
    dataEmissao: '2023-10-19', 
    status: 'em_rota_entrega', 
    prioridade: 'prioridade',
    valorTotal: 'R$ 5.950,00',
  },
  { 
    id: 'NF006', 
    numero: 'NF12350', 
    emitente: 'Empresa PQR', 
    destinatario: 'Loja XYZ', 
    dataEmissao: '2023-10-20', 
    status: 'extraviada', 
    prioridade: 'bloqueada',
    valorTotal: 'R$ 6.250,00',
  },
  { 
    id: 'NF007', 
    numero: 'NF12351', 
    emitente: 'Empresa STU', 
    destinatario: 'Mercado ABC', 
    dataEmissao: '2023-10-21', 
    status: 'avariada', 
    prioridade: 'normal',
    valorTotal: 'R$ 7.550,00',
  },
  { 
    id: 'NF008', 
    numero: 'NF12352', 
    emitente: 'Empresa VWX', 
    destinatario: 'Supermercado XYZ', 
    dataEmissao: '2023-10-22', 
    status: 'indenizada', 
    prioridade: 'normal',
    valorTotal: 'R$ 8.850,00',
  },
  { 
    id: 'NF009', 
    numero: 'NF12353', 
    emitente: 'Empresa YZ', 
    destinatario: 'Farmácia ABC', 
    dataEmissao: '2023-10-23', 
    status: 'coleta_agendada', 
    prioridade: 'normal',
    valorTotal: 'R$ 9.150,00',
  },
  { 
    id: 'NF010', 
    numero: 'NF12354', 
    emitente: 'Empresa AB', 
    destinatario: 'Hospital XYZ', 
    dataEmissao: '2023-10-24', 
    status: 'coletando', 
    prioridade: 'expressa',
    valorTotal: 'R$ 10.450,00',
  }
];
