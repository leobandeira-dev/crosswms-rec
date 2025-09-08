
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SolicitacoesPendentes from '../SolicitacoesPendentes';
import HistoricoAprovacoes from '../HistoricoAprovacoes';
import DocumentoAprovacaoRenderer from '../DocumentoAprovacaoRenderer';
import { SolicitacaoColeta } from '../../types/coleta.types';

interface AprovacoesContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  solicitacoesPendentes: SolicitacaoColeta[];
  historicoAprovacoes: SolicitacaoColeta[];
  handleSearch: (value: string) => void;
  handleFilterChange: (filter: string, value: string) => void;
  openDetailDialog: (row: SolicitacaoColeta) => void;
  allDocuments: SolicitacaoColeta[];
}

const AprovacoesContent: React.FC<AprovacoesContentProps> = ({
  activeTab,
  setActiveTab,
  currentPage,
  setCurrentPage,
  solicitacoesPendentes,
  historicoAprovacoes,
  handleSearch,
  handleFilterChange,
  openDetailDialog,
  allDocuments
}) => {
  // Renderiza o conteúdo do documento para impressão
  const renderAprovacaoDocument = (documentId: string) => {
    return (
      <DocumentoAprovacaoRenderer 
        documentId={documentId}
        documents={allDocuments}
      />
    );
  };

  return (
    <Tabs 
      defaultValue="pendentes" 
      className="w-full mb-6" 
      value={activeTab} 
      onValueChange={setActiveTab}
    >
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="pendentes">Pendentes de Aprovação</TabsTrigger>
        <TabsTrigger value="historico">Histórico de Aprovações</TabsTrigger>
      </TabsList>
      
      <TabsContent value="pendentes">
        <SolicitacoesPendentes 
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onOpenDetail={openDetailDialog}
          renderAprovacaoDocument={renderAprovacaoDocument}
          solicitacoes={solicitacoesPendentes}
        />
      </TabsContent>
      
      <TabsContent value="historico">
        <HistoricoAprovacoes
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
          onOpenDetail={openDetailDialog}
          renderAprovacaoDocument={renderAprovacaoDocument} 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          solicitacoes={historicoAprovacoes}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AprovacoesContent;
