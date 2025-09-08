
import { subDays, startOfMonth, endOfMonth, format } from 'date-fns';
import { FilterOption, FilterConfig } from './SearchFilter';

// Helper function to get date ranges
export const getDateRanges = () => {
  const today = new Date();
  const last7Days = {
    from: subDays(today, 7),
    to: today
  };
  const last30Days = {
    from: subDays(today, 30),
    to: today
  };
  const currentMonth = {
    from: startOfMonth(today),
    to: endOfMonth(today)
  };

  return {
    last7Days,
    last30Days,
    currentMonth,
    formatDate: (date: Date) => format(date, 'yyyy-MM-dd')
  };
};

// Standard date range filter options
export const dateRangeFilterOptions: FilterOption[] = [
  { id: 'last7Days', label: 'Últimos 7 dias' },
  { id: 'last30Days', label: 'Últimos 30 dias' },
  { id: 'currentMonth', label: 'Mês atual' },
  { id: 'custom', label: 'Personalizado' }
];

// Standard filter configurations that can be used across the application
export const getStandardFilters = () => {
  return {
    remetente: {
      id: 'remetente',
      label: 'Remetente',
      options: [
        { id: 'all', label: 'Todos' },
        { id: 'megacorp', label: 'MegaCorp LTDA' },
        { id: 'techsolutions', label: 'TechSolutions S.A.' },
        { id: 'abc', label: 'Indústria ABC' },
        { id: 'global', label: 'Comércio Global' }
      ]
    },
    destinatario: {
      id: 'destinatario',
      label: 'Destinatário',
      options: [
        { id: 'all', label: 'Todos' },
        { id: 'varejo', label: 'Varejo Nacional' },
        { id: 'xyz', label: 'Distribuidor XYZ' },
        { id: 'mercados', label: 'Rede Mercados' },
        { id: 'central', label: 'Loja Central' }
      ]
    },
    motorista: {
      id: 'motorista',
      label: 'Motorista',
      options: [
        { id: 'all', label: 'Todos' },
        { id: 'jose', label: 'José da Silva' },
        { id: 'carlos', label: 'Carlos Santos' },
        { id: 'pedro', label: 'Pedro Oliveira' },
        { id: 'antonio', label: 'Antônio Ferreira' },
        { id: 'manuel', label: 'Manuel Costa' }
      ]
    },
    tipoCarga: {
      id: 'tipoCarga',
      label: 'Tipo de Carga',
      options: [
        { id: 'all', label: 'Todos' },
        { id: 'fracionado', label: 'Fracionado' },
        { id: 'lotacao', label: 'Lotação' }
      ]
    },
    cidadeOrigem: {
      id: 'cidadeOrigem',
      label: 'Cidade Origem',
      options: [
        { id: 'all', label: 'Todas' },
        { id: 'sp', label: 'São Paulo' },
        { id: 'rj', label: 'Rio de Janeiro' },
        { id: 'bh', label: 'Belo Horizonte' },
        { id: 'curitiba', label: 'Curitiba' },
        { id: 'poa', label: 'Porto Alegre' }
      ]
    },
    cidadeDestino: {
      id: 'cidadeDestino',
      label: 'Cidade Destino',
      options: [
        { id: 'all', label: 'Todas' },
        { id: 'sp', label: 'São Paulo' },
        { id: 'rj', label: 'Rio de Janeiro' },
        { id: 'bh', label: 'Belo Horizonte' },
        { id: 'curitiba', label: 'Curitiba' },
        { id: 'poa', label: 'Porto Alegre' }
      ]
    }
  };
};

// Generate document-specific filters
export const getDocumentFilters = (documentType: 'coleta' | 'cte' | 'nf' | 'pedido' | 'romaneio'): FilterConfig => {
  switch (documentType) {
    case 'coleta':
      return {
        id: 'ctColeta',
        label: 'Nº CT-e de Coleta',
        options: [
          { id: 'all', label: 'Todos' },
          { id: 'search', label: 'Buscar por número' }
        ]
      };
    case 'cte':
      return {
        id: 'ctViagem',
        label: 'Nº CT-e de Viagem',
        options: [
          { id: 'all', label: 'Todos' },
          { id: 'search', label: 'Buscar por número' }
        ]
      };
    case 'nf':
      return {
        id: 'notaFiscal',
        label: 'Nº Nota Fiscal',
        options: [
          { id: 'all', label: 'Todos' },
          { id: 'search', label: 'Buscar por número' }
        ]
      };
    case 'pedido':
      return {
        id: 'pedido',
        label: 'Nº Pedido',
        options: [
          { id: 'all', label: 'Todos' },
          { id: 'search', label: 'Buscar por número' }
        ]
      };
    case 'romaneio':
      return {
        id: 'romaneio',
        label: 'Nº Romaneio',
        options: [
          { id: 'all', label: 'Todos' },
          { id: 'search', label: 'Buscar por número' }
        ]
      };
    default:
      return {
        id: 'documento',
        label: 'Documento',
        options: [
          { id: 'all', label: 'Todos' },
          { id: 'search', label: 'Buscar por número' }
        ]
      };
  }
};
