
import { Ocorrencia, OcorrenciaTimeline, OcorrenciaComment, DocumentosMock } from '@/types/ocorrencias.types';

// Dados fictícios para testar a interface
export const ocorrencias: Ocorrencia[] = [
  {
    id: 'OC-2023-001',
    title: 'Atraso na entrega',
    description: 'Cliente relata que a entrega não foi realizada na data prevista.',
    type: 'atraso',
    status: 'in_progress',
    priority: 'high',
    client: 'Indústria ABC Ltda',
    createdAt: '2023-05-12T14:30:00Z',
    updatedAt: '2023-05-12T16:45:00Z',
    assignedTo: 'Carlos Oliveira',
    documents: [
      {
        id: 'NF-12345',
        type: 'Nota Fiscal',
        number: '12345',
        description: 'Nota Fiscal de Venda'
      },
      {
        id: 'COL-456',
        type: 'Coleta',
        number: '456',
        description: 'Ordem de Coleta'
      }
    ],
    notaFiscal: {
      id: 'NF-12345',
      numero: '12345',
      chave: '35230612345678901234550010000012341000012345',
    }
  },
  {
    id: 'OC-2023-002',
    title: 'Produto avariado',
    description: 'Cliente recebeu o produto com embalagem danificada. Necessário verificar se o conteúdo foi afetado.',
    type: 'avaria',
    status: 'open',
    priority: 'medium',
    client: 'Distribuidora XYZ',
    createdAt: '2023-05-14T09:15:00Z',
    updatedAt: '2023-05-14T09:15:00Z',
    attachments: [
      {
        id: 'ATT-001',
        name: 'foto_dano_1.jpg',
        url: 'https://example.com/photos/foto_dano_1.jpg',
        type: 'image/jpeg'
      },
      {
        id: 'ATT-002',
        name: 'foto_dano_2.jpg',
        url: 'https://example.com/photos/foto_dano_2.jpg',
        type: 'image/jpeg'
      }
    ]
  },
  {
    id: 'OC-2023-003',
    title: 'Divergência de quantidade',
    description: 'Quantidade entregue é menor que a especificada na nota fiscal. Faltam 2 volumes.',
    type: 'divergencia',
    status: 'resolved',
    priority: 'medium',
    client: 'Transportes Rápidos',
    createdAt: '2023-05-10T11:00:00Z',
    updatedAt: '2023-05-11T14:20:00Z',
    assignedTo: 'Ana Silva',
    resolvedAt: '2023-05-11T14:20:00Z',
    solution: 'Volumes localizados no depósito e entregues ao cliente no dia seguinte. Cliente confirmou recebimento.',
    documents: [
      {
        id: 'NF-6789',
        type: 'Nota Fiscal',
        number: '6789',
        description: 'Nota Fiscal de Venda'
      }
    ],
    notaFiscal: {
      id: 'NF-6789',
      numero: '6789',
      chave: '35230698765432109876550010000067891000067890',
    }
  },
  {
    id: 'OC-2023-004',
    title: 'Extravio de mercadoria',
    description: 'Volume não localizado durante o processo de entrega.',
    type: 'extravio',
    status: 'in_progress',
    priority: 'high',
    client: 'Farmacêutica Beta',
    createdAt: '2023-05-15T08:30:00Z',
    updatedAt: '2023-05-15T10:45:00Z',
    assignedTo: 'Roberto Gomes'
  },
  {
    id: 'OC-2023-005',
    title: 'Devolução de mercadoria',
    description: 'Cliente solicita devolução por pedido incorreto.',
    type: 'devolucao',
    status: 'open',
    priority: 'low',
    client: 'Eletrônicos Tech',
    createdAt: '2023-05-16T13:20:00Z',
    updatedAt: '2023-05-16T13:20:00Z'
  }
];

export const timelineEvents: OcorrenciaTimeline[] = [
  {
    id: 'TL-001',
    ocorrenciaId: 'OC-2023-001',
    timestamp: '2023-05-12T14:30:00Z',
    description: 'Ocorrência registrada',
    type: 'creation',
    user: 'Marina Costa'
  },
  {
    id: 'TL-002',
    ocorrenciaId: 'OC-2023-001',
    timestamp: '2023-05-12T15:00:00Z',
    description: 'Atribuída para Carlos Oliveira',
    type: 'assignment',
    user: 'Marina Costa'
  },
  {
    id: 'TL-003',
    ocorrenciaId: 'OC-2023-001',
    timestamp: '2023-05-12T16:45:00Z',
    description: 'Status alterado para "Em Andamento"',
    type: 'status_change',
    user: 'Carlos Oliveira'
  }
];

export const comments: OcorrenciaComment[] = [
  {
    id: 'COM-001',
    ocorrenciaId: 'OC-2023-001',
    user: 'Carlos Oliveira',
    content: 'Entrei em contato com a transportadora e estão verificando a localização da carga.',
    timestamp: '2023-05-12T16:45:00Z'
  },
  {
    id: 'COM-002',
    ocorrenciaId: 'OC-2023-001',
    user: 'Marina Costa',
    content: 'Cliente ligou novamente solicitando previsão de entrega.',
    timestamp: '2023-05-13T09:30:00Z'
  }
];

export const documentosMock: DocumentosMock = {
  notas: [
    {
      id: 'NF-12345',
      numero: '12345',
      cliente: 'Indústria ABC Ltda',
      valor: 1250.75,
      date: '2023-05-10',
      status: 'Emitida'
    },
    {
      id: 'NF-6789',
      numero: '6789',
      cliente: 'Distribuidora XYZ',
      valor: 3450.00,
      date: '2023-05-08',
      status: 'Entregue'
    },
    {
      id: 'CTE-5678',
      numero: '5678',
      cliente: 'Indústria ABC Ltda',
      valor: 350.00,
      date: '2023-05-11',
      status: 'Emitido',
      type: 'CT-e'  // Changed from 'tipo' to 'type' to match interface
    }
  ],
  coletas: [
    {
      id: 'COL-456',
      numero: '456',
      cliente: 'Indústria ABC Ltda',
      notasFiscais: ['NF-12345'],
      date: '2023-05-10',
      status: 'Realizada'
    },
    {
      id: 'COL-789',
      numero: '789',
      cliente: 'Transportes Rápidos',
      notasFiscais: ['NF-6789'],
      date: '2023-05-09',
      status: 'Pendente'
    }
  ],
  ordens: [
    {
      id: 'OC-123',
      numero: '123',
      cliente: 'Farmacêutica Beta',
      notasFiscais: ['NF-12345', 'NF-6789'],
      date: '2023-05-11',
      status: 'Carregado'
    },
    {
      id: 'OC-234',
      numero: '234',
      cliente: 'Eletrônicos Tech',
      notasFiscais: ['NF-6789'],
      date: '2023-05-15',
      status: 'Agendado'
    }
  ]
};
