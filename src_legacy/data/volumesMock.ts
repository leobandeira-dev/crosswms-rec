
import { Volume } from '@/types/enderecamento.types';

// Mock data para volumes
export const volumesPorCarregar: Volume[] = [
  { id: 'VOL-001', descricao: 'Caixa 30x20x15', peso: '5kg', fragil: false, posicionado: false, etiquetaMae: 'ETQ-001', notaFiscal: 'NF-5522', fornecedor: 'Fornecedor A', quantidade: 1, etiquetado: true },
  { id: 'VOL-002', descricao: 'Caixa 50x40x30', peso: '12kg', fragil: false, posicionado: false, etiquetaMae: 'ETQ-001', notaFiscal: 'NF-5522', fornecedor: 'Fornecedor A', quantidade: 1, etiquetado: true },
  { id: 'VOL-003', descricao: 'Caixa 20x15x10', peso: '2kg', fragil: true, posicionado: false, etiquetaMae: 'ETQ-002', notaFiscal: 'NF-5523', fornecedor: 'Fornecedor B', quantidade: 1, etiquetado: true },
  { id: 'VOL-004', descricao: 'Caixa 60x40x40', peso: '18kg', fragil: false, posicionado: false, etiquetaMae: 'ETQ-003', notaFiscal: 'NF-5524', fornecedor: 'Fornecedor C', quantidade: 1, etiquetado: true },
  { id: 'VOL-005', descricao: 'Caixa 25x20x15', peso: '4kg', fragil: true, posicionado: false, etiquetaMae: 'ETQ-003', notaFiscal: 'NF-5524', fornecedor: 'Fornecedor C', quantidade: 1, etiquetado: true },
  { id: 'VOL-006', descricao: 'Caixa 30x25x20', peso: '7kg', fragil: false, posicionado: false, etiquetaMae: 'ETQ-004', notaFiscal: 'NF-5525', fornecedor: 'Fornecedor D', quantidade: 1, etiquetado: true },
  { id: 'VOL-007', descricao: 'Caixa 45x35x25', peso: '10kg', fragil: false, posicionado: false, etiquetaMae: 'ETQ-004', notaFiscal: 'NF-5525', fornecedor: 'Fornecedor D', quantidade: 1, etiquetado: true },
  { id: 'VOL-008', descricao: 'Caixa 15x10x10', peso: '1kg', fragil: true, posicionado: false, etiquetaMae: 'ETQ-005', notaFiscal: 'NF-5526', fornecedor: 'Fornecedor E', quantidade: 1, etiquetado: true },
];
