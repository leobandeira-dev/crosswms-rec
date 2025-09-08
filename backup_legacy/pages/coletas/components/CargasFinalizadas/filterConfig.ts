
import { 
  getStandardFilters, 
  dateRangeFilterOptions, 
  getDocumentFilters 
} from '../../../../components/common/StandardFilterConfig';

const standardFilters = getStandardFilters();

export const filterConfig = [
  {
    name: 'Período',
    options: dateRangeFilterOptions
  },
  standardFilters.motorista,
  {
    name: 'Status',
    options: [
      { label: 'Todos', value: 'all' },
      { label: 'Entregues', value: 'delivered' },
      { label: 'Com problemas', value: 'problem' },
    ]
  },
  standardFilters.remetente,
  standardFilters.destinatario,
  standardFilters.tipoCarga,
  standardFilters.cidadeOrigem,
  standardFilters.cidadeDestino,
  getDocumentFilters('cte'),
  getDocumentFilters('nf'),
  getDocumentFilters('romaneio')
];
