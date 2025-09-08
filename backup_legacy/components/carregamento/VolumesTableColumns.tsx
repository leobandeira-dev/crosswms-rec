
import React from 'react';
import StatusBadge from '@/components/common/StatusBadge';
import VolumeActions from './VolumeActions';

export const getVolumeColumns = (
  handleVerificarItem: (id: string) => void,
  confirmarRemocao?: (id: string) => void,
  tipoVisualizacao: 'conferir' | 'emConferencia' | 'conferidas' = 'conferir'
) => [
  { header: 'ID', accessor: 'id', className: 'w-[80px]' },
  { header: 'Produto', accessor: 'produto' },
  { header: 'Qtd', accessor: 'quantidade', className: 'w-[60px] text-center' },
  { header: 'Etiqueta Mãe', accessor: 'etiquetaMae' },
  { header: 'Nota Fiscal', accessor: 'notaFiscal' },
  { 
    header: 'Status', 
    accessor: 'verificado',
    className: 'w-[120px]',
    cell: (row: any) => {
      return row.verificado ? 
        <StatusBadge status="success" text="Verificado" /> : 
        <StatusBadge status="warning" text="Pendente" />;
    }
  },
  {
    header: 'Ações',
    accessor: 'actions',
    className: 'w-[180px]',
    cell: (row: any) => (
      <VolumeActions 
        row={row} 
        tipoVisualizacao={tipoVisualizacao}
        handleVerificarItem={handleVerificarItem}
        onRemoveClick={confirmarRemocao}
      />
    )
  }
];
