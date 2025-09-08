
import { 
  getStandardFilters, 
  dateRangeFilterOptions, 
  getDocumentFilters 
} from '../../../components/common/StandardFilterConfig';

const standardFilters = getStandardFilters();

export const recebimentoFiliaisFilterConfig = [
  {
    name: 'Período',
    options: dateRangeFilterOptions
  },
  {
    name: "Status",
    options: [
      { label: "Todos", value: "all" },
      { label: "Em Trânsito", value: "transit" },
      { label: "Aguardando", value: "pending" },
      { label: "Concluído", value: "completed" }
    ]
  },
  {
    name: "Filial de Origem",
    options: [
      { label: "Todas", value: "all" },
      { label: "São Paulo", value: "São Paulo" },
      { label: "Rio de Janeiro", value: "Rio de Janeiro" },
      { label: "Belo Horizonte", value: "Belo Horizonte" }
    ]
  },
  standardFilters.tipoCarga,
  getDocumentFilters('nf')
];

export const recebimentoColetaFilterConfig = [
  {
    name: 'Período',
    options: dateRangeFilterOptions
  },
  {
    name: "Status",
    options: [
      { label: "Todos", value: "all" },
      { label: "Pendente de Aceite", value: "pending" },
      { label: "Em Processamento", value: "processing" },
      { label: "Concluído", value: "completed" }
    ]
  },
  standardFilters.remetente,
  getDocumentFilters('coleta'),
  getDocumentFilters('nf')
];
