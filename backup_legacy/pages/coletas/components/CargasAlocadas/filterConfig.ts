
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
      { label: 'Em trânsito', value: 'transit' },
      { label: 'Em carregamento', value: 'loading' },
      { label: 'Agendada', value: 'scheduled' },
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
