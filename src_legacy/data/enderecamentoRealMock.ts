import { Volume } from '@/types/enderecamento.types';

// Dados mockup para endereçamento de carregamento real
export const volumesEnderecamentoReal: Volume[] = [
  // Volumes para NF-5531 - Fornecedor ABC Ltda
  { 
    id: 'VOL-001', 
    descricao: 'Caixa Eletrônicos 40x30x20', 
    peso: '8.5kg', 
    fragil: true, 
    posicionado: false, 
    etiquetaMae: 'ETQ-001', 
    notaFiscal: 'NF-5531', 
    fornecedor: 'ABC Eletrônicos Ltda', 
    quantidade: 1, 
    etiquetado: true 
  },
  { 
    id: 'VOL-002', 
    descricao: 'Caixa Eletrônicos 35x25x15', 
    peso: '5.2kg', 
    fragil: true, 
    posicionado: false, 
    etiquetaMae: 'ETQ-001', 
    notaFiscal: 'NF-5531', 
    fornecedor: 'ABC Eletrônicos Ltda', 
    quantidade: 1, 
    etiquetado: true 
  },
  { 
    id: 'VOL-003', 
    descricao: 'Caixa Eletrônicos 50x40x30', 
    peso: '12.8kg', 
    fragil: true, 
    posicionado: false, 
    etiquetaMae: 'ETQ-001', 
    notaFiscal: 'NF-5531', 
    fornecedor: 'ABC Eletrônicos Ltda', 
    quantidade: 1, 
    etiquetado: true 
  },

  // Volumes para NF-5532 - Material de Construção XYZ
  { 
    id: 'VOL-004', 
    descricao: 'Ferramentas Elétricas 60x40x35', 
    peso: '18.3kg', 
    fragil: false, 
    posicionado: false, 
    etiquetaMae: 'ETQ-002', 
    notaFiscal: 'NF-5532', 
    fornecedor: 'Construção XYZ S.A.', 
    quantidade: 1, 
    etiquetado: true 
  },
  { 
    id: 'VOL-005', 
    descricao: 'Parafusos e Fixadores 30x20x15', 
    peso: '15.7kg', 
    fragil: false, 
    posicionado: false, 
    etiquetaMae: 'ETQ-002', 
    notaFiscal: 'NF-5532', 
    fornecedor: 'Construção XYZ S.A.', 
    quantidade: 1, 
    etiquetado: true 
  },
  { 
    id: 'VOL-006', 
    descricao: 'Material Hidráulico 45x35x25', 
    peso: '22.1kg', 
    fragil: false, 
    posicionado: false, 
    etiquetaMae: 'ETQ-002', 
    notaFiscal: 'NF-5532', 
    fornecedor: 'Construção XYZ S.A.', 
    quantidade: 1, 
    etiquetado: true 
  },
  { 
    id: 'VOL-007', 
    descricao: 'Tubulações PVC 80x15x15', 
    peso: '9.4kg', 
    fragil: false, 
    posicionado: false, 
    etiquetaMae: 'ETQ-002', 
    notaFiscal: 'NF-5532', 
    fornecedor: 'Construção XYZ S.A.', 
    quantidade: 1, 
    etiquetado: true 
  },

  // Volumes para NF-5533 - Roupas e Acessórios DEF
  { 
    id: 'VOL-008', 
    descricao: 'Roupas Femininas 50x40x20', 
    peso: '3.2kg', 
    fragil: false, 
    posicionado: false, 
    etiquetaMae: 'ETQ-003', 
    notaFiscal: 'NF-5533', 
    fornecedor: 'Moda DEF Fashion', 
    quantidade: 1, 
    etiquetado: true 
  },
  { 
    id: 'VOL-009', 
    descricao: 'Calçados Diversos 40x30x25', 
    peso: '6.8kg', 
    fragil: false, 
    posicionado: false, 
    etiquetaMae: 'ETQ-003', 
    notaFiscal: 'NF-5533', 
    fornecedor: 'Moda DEF Fashion', 
    quantidade: 1, 
    etiquetado: true 
  },
  { 
    id: 'VOL-010', 
    descricao: 'Acessórios Fashion 35x25x20', 
    peso: '2.1kg', 
    fragil: true, 
    posicionado: false, 
    etiquetaMae: 'ETQ-003', 
    notaFiscal: 'NF-5533', 
    fornecedor: 'Moda DEF Fashion', 
    quantidade: 1, 
    etiquetado: true 
  },

  // Volumes para NF-5534 - Livros e Material Escolar GHI
  { 
    id: 'VOL-011', 
    descricao: 'Livros Didáticos 40x30x35', 
    peso: '14.5kg', 
    fragil: false, 
    posicionado: false, 
    etiquetaMae: 'ETQ-004', 
    notaFiscal: 'NF-5534', 
    fornecedor: 'Educação GHI Livros', 
    quantidade: 1, 
    etiquetado: true 
  },
  { 
    id: 'VOL-012', 
    descricao: 'Material Escolar 30x25x20', 
    peso: '4.7kg', 
    fragil: false, 
    posicionado: false, 
    etiquetaMae: 'ETQ-004', 
    notaFiscal: 'NF-5534', 
    fornecedor: 'Educação GHI Livros', 
    quantidade: 1, 
    etiquetado: true 
  },
  { 
    id: 'VOL-013', 
    descricao: 'Cadernos e Papel 45x35x15', 
    peso: '7.3kg', 
    fragil: false, 
    posicionado: false, 
    etiquetaMae: 'ETQ-004', 
    notaFiscal: 'NF-5534', 
    fornecedor: 'Educação GHI Livros', 
    quantidade: 1, 
    etiquetado: true 
  },

  // Volumes para NF-5535 - Produtos de Limpeza JKL
  { 
    id: 'VOL-014', 
    descricao: 'Produtos Químicos 25x20x20', 
    peso: '11.2kg', 
    fragil: true, 
    posicionado: false, 
    etiquetaMae: 'ETQ-005', 
    notaFiscal: 'NF-5535', 
    fornecedor: 'Limpeza JKL Química', 
    quantidade: 1, 
    etiquetado: true 
  },
  { 
    id: 'VOL-015', 
    descricao: 'Detergentes e Sabões 30x25x25', 
    peso: '8.9kg', 
    fragil: false, 
    posicionado: false, 
    etiquetaMae: 'ETQ-005', 
    notaFiscal: 'NF-5535', 
    fornecedor: 'Limpeza JKL Química', 
    quantidade: 1, 
    etiquetado: true 
  },
  { 
    id: 'VOL-016', 
    descricao: 'Esponjas e Panos 35x30x20', 
    peso: '3.4kg', 
    fragil: false, 
    posicionado: false, 
    etiquetaMae: 'ETQ-005', 
    notaFiscal: 'NF-5535', 
    fornecedor: 'Limpeza JKL Química', 
    quantidade: 1, 
    etiquetado: true 
  },

  // Volumes para NF-5536 - Cosméticos e Perfumaria MNO
  { 
    id: 'VOL-017', 
    descricao: 'Perfumes Importados 20x15x15', 
    peso: '2.8kg', 
    fragil: true, 
    posicionado: false, 
    etiquetaMae: 'ETQ-006', 
    notaFiscal: 'NF-5536', 
    fornecedor: 'Beleza MNO Cosméticos', 
    quantidade: 1, 
    etiquetado: true 
  },
  { 
    id: 'VOL-018', 
    descricao: 'Cremes e Loções 25x20x18', 
    peso: '4.1kg', 
    fragil: true, 
    posicionado: false, 
    etiquetaMae: 'ETQ-006', 
    notaFiscal: 'NF-5536', 
    fornecedor: 'Beleza MNO Cosméticos', 
    quantidade: 1, 
    etiquetado: true 
  },

  // Volumes para NF-5537 - Suplementos Alimentares PQR
  { 
    id: 'VOL-019', 
    descricao: 'Vitaminas e Minerais 30x20x25', 
    peso: '6.5kg', 
    fragil: false, 
    posicionado: false, 
    etiquetaMae: 'ETQ-007', 
    notaFiscal: 'NF-5537', 
    fornecedor: 'Saúde PQR Suplementos', 
    quantidade: 1, 
    etiquetado: true 
  },
  { 
    id: 'VOL-020', 
    descricao: 'Proteínas em Pó 40x30x30', 
    peso: '12.7kg', 
    fragil: false, 
    posicionado: false, 
    etiquetaMae: 'ETQ-007', 
    notaFiscal: 'NF-5537', 
    fornecedor: 'Saúde PQR Suplementos', 
    quantidade: 1, 
    etiquetado: true 
  }
];

// Dados da ordem de carregamento específica
export const ordemCarregamentoReal = {
  numero: 'OC-174843283464',
  cliente: 'Distribuidora Central Sul',
  tipoCarregamento: 'entrega',
  dataCarregamento: '16/08/2025',
  transportadora: 'TransLog Express',
  placaVeiculo: 'ABC-1234',
  motorista: 'Carlos Eduardo Silva',
  observacoes: 'Entrega programada para 17/08 - Material frágil requer cuidado especial',
  status: 'em_preparacao',
  totalVolumes: volumesEnderecamentoReal.length,
  volumesEndereçados: 0,
  volumesPendentes: volumesEnderecamentoReal.length
};

// Estatísticas para os cards da interface
export const estatisticasCarregamento = {
  totalVolumes: volumesEnderecamentoReal.length,
  enderecados: 0,
  pendentes: volumesEnderecamentoReal.length,
  pesoTotal: volumesEnderecamentoReal.reduce((total, volume) => {
    const peso = parseFloat(volume.peso.replace('kg', ''));
    return total + peso;
  }, 0),
  notasFiscais: [...new Set(volumesEnderecamentoReal.map(v => v.notaFiscal))].length,
  fornecedores: [...new Set(volumesEnderecamentoReal.map(v => v.fornecedor))].length
};