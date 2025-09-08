
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SearchFilter from '@/components/common/SearchFilter';

interface SearchFilterSectionProps {
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
}

const SearchFilterSection: React.FC<SearchFilterSectionProps> = ({
  onSearchChange,
  onStatusChange,
  onPriorityChange
}) => {
  const filterConfig = [
    {
      name: 'Status',
      options: [
        { label: 'Todos', value: 'todos' },
        { label: 'Coleta agendada', value: 'coleta_agendada' },
        { label: 'Coletando', value: 'coletando' },
        { label: 'Coletado', value: 'coletado' },
        { label: 'No armazém', value: 'no_armazem' },
        { label: 'Em transferência', value: 'em_transferencia' },
        { label: 'Em rota de entrega', value: 'em_rota_entrega' },
        { label: 'Entregue', value: 'entregue' },
        { label: 'Extraviada', value: 'extraviada' },
        { label: 'Avariada', value: 'avariada' },
        { label: 'Sinistrada', value: 'sinistrada' },
        { label: 'Indenizada', value: 'indenizada' },
      ]
    },
    {
      name: 'Prioridade',
      options: [
        { label: 'Todas', value: 'todas' },
        { label: 'Normal', value: 'normal' },
        { label: 'Prioridade', value: 'prioridade' },
        { label: 'Expressa', value: 'expressa' },
        { label: 'Bloqueada', value: 'bloqueada' },
      ]
    }
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <SearchFilter 
          placeholder="Buscar por número da NF, emitente ou destinatário..."
          filters={filterConfig}
          onSearch={onSearchChange}
          onFilterChange={(filter, value) => {
            if (filter === 'Status') onStatusChange(value);
            if (filter === 'Prioridade') onPriorityChange(value);
          }}
        />
      </CardContent>
    </Card>
  );
};

export default SearchFilterSection;
