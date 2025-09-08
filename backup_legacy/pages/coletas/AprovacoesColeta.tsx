
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import DetalhesAprovacaoDialog from './components/DetalhesAprovacaoDialog';
import AprovacoesHeader from './components/aprovacao/AprovacoesHeader';
import AprovacoesContent from './components/aprovacao/AprovacoesContent';
import { useAprovacoes } from './hooks/useAprovacoes';
import { Toaster } from "@/components/ui/toaster";

const AprovacoesColeta = () => {
  const {
    isDialogOpen,
    setIsDialogOpen,
    selectedRequest,
    currentPage,
    setCurrentPage,
    activeTab,
    setActiveTab,
    isRejecting,
    setIsRejecting,
    solicitacoesPendentes,
    historicoAprovacoes,
    allDocuments,
    handleSearch,
    handleFilterChange,
    openDetailDialog,
    handleApprove,
    handleReject
  } = useAprovacoes();

  return (
    <MainLayout title="Aprovações de Coleta">
      <AprovacoesHeader pendingCount={solicitacoesPendentes.length} />
      
      <AprovacoesContent 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        solicitacoesPendentes={solicitacoesPendentes}
        historicoAprovacoes={historicoAprovacoes}
        handleSearch={handleSearch}
        handleFilterChange={handleFilterChange}
        openDetailDialog={openDetailDialog}
        allDocuments={allDocuments}
      />
      
      <DetalhesAprovacaoDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        solicitacao={selectedRequest}
        onApprove={handleApprove}
        onReject={handleReject}
      />
      
      <Toaster />
    </MainLayout>
  );
};

export default AprovacoesColeta;
