
// Mock data
export const volumesParaEtiquetar = [
  { 
    id: 'VOL-2023-001', 
    notaFiscal: '12345', 
    descricao: 'Caixa 30x20x15', 
    quantidade: 10, 
    etiquetado: false,
    remetente: 'Empresa XYZ Ltda',
    destinatario: 'Cross Commerce - CD',
    endereco: 'Rua das Indústrias, 1000 - São Paulo/SP',
    cidade: 'SAO',
    cidadeCompleta: 'São Paulo',
    uf: 'SP',
    pesoTotal: '25,5 Kg',
    tipoVolume: 'geral' as 'geral' | 'quimico'
  },
  { 
    id: 'VOL-2023-002', 
    notaFiscal: '12345', 
    descricao: 'Caixa 40x30x25', 
    quantidade: 5, 
    etiquetado: false,
    remetente: 'Empresa XYZ Ltda',
    destinatario: 'Cross Commerce - CD',
    endereco: 'Rua das Indústrias, 1000 - São Paulo/SP',
    cidade: 'SAO',
    cidadeCompleta: 'São Paulo',
    uf: 'SP',
    pesoTotal: '25,5 Kg',
    tipoVolume: 'geral' as 'geral' | 'quimico'
  },
  { 
    id: 'VOL-2023-003', 
    notaFiscal: '12346', 
    descricao: 'Pacote 50x40', 
    quantidade: 20, 
    etiquetado: true,
    remetente: 'Distribuidora ABC S.A.',
    destinatario: 'Cross Commerce - Filial',
    endereco: 'Av. Principal, 500 - Rio de Janeiro/RJ',
    cidade: 'RIO',
    cidadeCompleta: 'Rio de Janeiro',
    uf: 'RJ',
    pesoTotal: '12,3 Kg',
    tipoVolume: 'quimico' as 'geral' | 'quimico',
    codigoONU: '1203',
    codigoRisco: '33'
  },
];

// Mock data for master labels
export const etiquetasMae = [
  {
    id: 'MASTER-001',
    notaFiscal: '12345',
    quantidadeVolumes: 15,
    remetente: 'Empresa XYZ Ltda',
    destinatario: 'Cross Commerce - CD',
    cidade: 'São Paulo',
    uf: 'SP',
    dataCriacao: '2023-10-25',
    status: 'ativo'
  },
  {
    id: 'MASTER-002',
    notaFiscal: '12346',
    quantidadeVolumes: 20,
    remetente: 'Distribuidora ABC S.A.',
    destinatario: 'Cross Commerce - Filial',
    cidade: 'Rio de Janeiro',
    uf: 'RJ',
    dataCriacao: '2023-10-24',
    status: 'ativo'
  }
];
