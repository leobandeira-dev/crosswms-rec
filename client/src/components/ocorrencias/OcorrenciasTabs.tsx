
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SearchFilter from '../../components/common/SearchFilter';
import { Ocorrencia } from '@/types/ocorrencias.types';
import OcorrenciasTable from './OcorrenciasTable';

interface OcorrenciasTabsProps {
  ocorrencias: Ocorrencia[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filters: any[];
  onSearch: (value: string) => void;
  onFilterChange: (filter: string, value: string) => void;
  onRowClick: (ocorrencia: Ocorrencia) => void;
  onLinkDocument: (ocorrencia: Ocorrencia) => void;
}

const OcorrenciasTabs: React.FC<OcorrenciasTabsProps> = ({
  ocorrencias,
  activeTab,
  setActiveTab,
  currentPage,
  setCurrentPage,
  filters,
  onSearch,
  onFilterChange,
  onRowClick,
  onLinkDocument,
}) => {
  return (
    <Tabs defaultValue="pendentes" value={activeTab} onValueChange={setActiveTab} className="mb-6">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
        <TabsTrigger value="andamento">Em Andamento</TabsTrigger>
        <TabsTrigger value="finalizadas">Finalizadas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pendentes">
        <SearchFilter 
          placeholder="Buscar por ID, cliente ou NF..."
          filters={filters}
          onSearch={onSearch}
          onFilterChange={onFilterChange}
        />
        
        <OcorrenciasTable
          title="Ocorrências Pendentes"
          data={ocorrencias.filter(o => o.status === 'open')}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowClick={onRowClick}
          onLinkDocument={onLinkDocument}
        />
      </TabsContent>
      
      <TabsContent value="andamento">
        <SearchFilter 
          placeholder="Buscar por ID, cliente ou NF..."
          filters={filters}
          onSearch={onSearch}
          onFilterChange={onFilterChange}
        />
        
        <OcorrenciasTable
          title="Ocorrências em Andamento"
          data={ocorrencias.filter(o => o.status === 'in_progress')}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowClick={onRowClick}
          onLinkDocument={onLinkDocument}
        />
      </TabsContent>
      
      <TabsContent value="finalizadas">
        <SearchFilter 
          placeholder="Buscar por ID, cliente ou NF..."
          filters={filters}
          onSearch={onSearch}
          onFilterChange={onFilterChange}
        />
        
        <OcorrenciasTable
          title="Ocorrências Finalizadas"
          data={ocorrencias.filter(o => o.status === 'resolved' || o.status === 'closed')}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onRowClick={onRowClick}
          onLinkDocument={onLinkDocument}
        />
      </TabsContent>
    </Tabs>
  );
};

export default OcorrenciasTabs;
