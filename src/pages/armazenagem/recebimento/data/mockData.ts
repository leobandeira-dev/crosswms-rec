
// Mock data for notas fiscais
export const notasFiscais: NotaFiscal[] = [
  { 
    id: 'NF-2023-001', 
    numero: '12345', 
    fornecedor: 'Fornecedor A', 
    data: '10/05/2023', 
    valor: '1250.00', 
    status: 'pending',
    chaveNF: '35230512345678901234567890123456789012345678',
    serieNF: '001',
    dataHoraEmissao: '2023-05-10',
    emitenteCNPJ: '12345678901234',
    emitenteRazaoSocial: 'FORNECEDOR A LTDA',
    emitenteEndereco: 'RUA EXEMPLO, 123',
    emitenteBairro: 'CENTRO',
    emitenteCidade: 'SÃO PAULO',
    emitenteUF: 'SP',
    emitenteCEP: '01234567',
    destinatarioCNPJ: '98765432101234',
    destinatarioRazaoSocial: 'EMPRESA DESTINATÁRIA LTDA',
    destinatarioEndereco: 'AVENIDA MODELO, 456',
    destinatarioBairro: 'BAIRRO EXEMPLO',
    destinatarioCidade: 'RIO DE JANEIRO',
    destinatarioUF: 'RJ',
    destinatarioCEP: '12345678',
    pesoTotalBruto: '15.750',
    volumesTotal: '3',
    itens: [
      { descricao: 'PRODUTO A-1', quantidade: 10, valor: 50.00, ncm: '12345678' },
      { descricao: 'PRODUTO A-2', quantidade: 5, valor: 150.00, ncm: '87654321' },
    ]
  },
  { 
    id: 'NF-2023-002', 
    numero: '12346', 
    fornecedor: 'Fornecedor B', 
    data: '09/05/2023', 
    valor: '2150.00', 
    status: 'processing',
    chaveNF: '35230587654321098765432109876543210987654321',
    serieNF: '002',
    dataHoraEmissao: '2023-05-09',
    emitenteCNPJ: '23456789012345',
    emitenteRazaoSocial: 'FORNECEDOR B LTDA',
    emitenteEndereco: 'AVENIDA TESTE, 456',
    emitenteBairro: 'JARDIM',
    emitenteCidade: 'BELO HORIZONTE',
    emitenteUF: 'MG',
    emitenteCEP: '30123456',
    destinatarioCNPJ: '98765432101234',
    destinatarioRazaoSocial: 'EMPRESA DESTINATÁRIA LTDA',
    destinatarioEndereco: 'AVENIDA MODELO, 456',
    destinatarioBairro: 'BAIRRO EXEMPLO',
    destinatarioCidade: 'RIO DE JANEIRO',
    destinatarioUF: 'RJ',
    destinatarioCEP: '12345678',
    pesoTotalBruto: '22.500',
    volumesTotal: '5',
    itens: [
      { descricao: 'PRODUTO B-1', quantidade: 20, valor: 75.50, ncm: '23456789' },
      { descricao: 'PRODUTO B-2', quantidade: 8, valor: 95.00, ncm: '98765432' },
      { descricao: 'PRODUTO B-3', quantidade: 1, valor: 350.00, ncm: '56789012' },
    ]
  },
  { 
    id: 'NF-2023-003', 
    numero: '12347', 
    fornecedor: 'Fornecedor C', 
    data: '08/05/2023', 
    valor: '3450.00', 
    status: 'completed',
    chaveNF: '35230534567890123456789012345678901234567890',
    serieNF: '001',
    dataHoraEmissao: '2023-05-08',
    emitenteCNPJ: '34567890123456',
    emitenteRazaoSocial: 'FORNECEDOR C LTDA',
    emitenteEndereco: 'RUA MODELO, 789',
    emitenteBairro: 'INDUSTRIAL',
    emitenteCidade: 'RECIFE',
    emitenteUF: 'PE',
    emitenteCEP: '50123456',
    destinatarioCNPJ: '98765432101234',
    destinatarioRazaoSocial: 'EMPRESA DESTINATÁRIA LTDA',
    destinatarioEndereco: 'AVENIDA MODELO, 456',
    destinatarioBairro: 'BAIRRO EXEMPLO',
    destinatarioCidade: 'RIO DE JANEIRO',
    destinatarioUF: 'RJ',
    destinatarioCEP: '12345678',
    pesoTotalBruto: '38.200',
    volumesTotal: '8',
    itens: [
      { descricao: 'PRODUTO C-1', quantidade: 15, valor: 120.00, ncm: '34567890' },
      { descricao: 'PRODUTO C-2', quantidade: 10, valor: 180.00, ncm: '45678901' },
      { descricao: 'PRODUTO C-3', quantidade: 2, valor: 450.00, ncm: '67890123' },
    ]
  }
];

export interface NotaFiscal {
  id: string;
  numero: string;
  fornecedor: string;
  data: string;
  valor: string;
  status: 'pending' | 'processing' | 'completed';
  xmlContent?: string;
  
  // Additional properties for detailed display
  chaveNF?: string;
  serieNF?: string; 
  dataHoraEmissao?: string;
  
  // Emitente information
  emitenteCNPJ?: string;
  emitenteRazaoSocial?: string;
  emitenteEndereco?: string;
  emitenteBairro?: string;
  emitenteCidade?: string;
  emitenteUF?: string;
  emitenteCEP?: string;
  
  // Destinatario information
  destinatarioCNPJ?: string;
  destinatarioRazaoSocial?: string;
  destinatarioEndereco?: string;
  destinatarioBairro?: string;
  destinatarioCidade?: string;
  destinatarioUF?: string;
  destinatarioCEP?: string;
  
  // Weight and volume information
  pesoTotalBruto?: string;
  pesoTotal?: string;
  volumesTotal?: string;
  
  // Items in the nota fiscal
  itens?: NotaFiscalItem[];
}

export interface NotaFiscalItem {
  descricao: string;
  quantidade: number;
  valor: number;
  ncm: string;
}
