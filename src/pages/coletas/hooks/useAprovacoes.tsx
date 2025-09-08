
import { useState, useEffect } from 'react';
import { SolicitacaoColeta } from '../types/coleta.types';
import { solicitacoesPendentes as mockPendentes, historicoAprovacoes as mockHistorico } from '../data/aprovacoesMock';
import { useToast } from "@/hooks/use-toast";

export function useAprovacoes() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SolicitacaoColeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('pendentes');
  const [isRejecting, setIsRejecting] = useState(false);
  const { toast } = useToast();
  
  // Estado para gerenciamento dos dados de solicitações
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState(mockPendentes);
  const [historicoAprovacoes, setHistoricoAprovacoes] = useState(mockHistorico);
  
  // Depuração: Imprimir estado sempre que as solicitações mudarem
  useEffect(() => {
    console.log("Estado atual - Pendentes:", solicitacoesPendentes.length);
    console.log("Estado atual - Histórico:", historicoAprovacoes.length);
  }, [solicitacoesPendentes, historicoAprovacoes]);
  
  // Combinando os dados para facilitar a busca
  const allDocuments = [...solicitacoesPendentes, ...historicoAprovacoes];
  
  const handleSearch = (value: string) => {
    console.log('Busca:', value);
    // Implementar lógica de busca
  };
  
  const handleFilterChange = (filter: string, value: string) => {
    console.log(`Filtro ${filter} alterado para ${value}`);
    // Implementar lógica de filtro
  };
  
  const openDetailDialog = (row: SolicitacaoColeta) => {
    setSelectedRequest(row);
    setIsDialogOpen(true);
    setIsRejecting(false);
  };

  // Função para lidar com a aprovação de uma solicitação
  const handleApprove = (solicitacaoId: string, observacoes?: string) => {
    console.log("AprovacoesColeta: Aprovando solicitação:", solicitacaoId);
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString()} às ${currentDate.toLocaleTimeString()}`;
    const approverName = "Maria Oliveira"; // Normalmente viria da sessão do usuário
    
    // Encontrar a solicitação para aprovar
    const solicitacaoToApprove = solicitacoesPendentes.find(s => s.id === solicitacaoId);
    
    if (solicitacaoToApprove) {
      // Remover das pendentes
      setSolicitacoesPendentes(prev => prev.filter(s => s.id !== solicitacaoId));
      
      // Adicionar ao histórico como aprovada
      const approvedSolicitation = {
        ...solicitacaoToApprove,
        status: 'approved' as const,
        aprovador: approverName,
        dataAprovacao: formattedDate,
        observacoes: observacoes || undefined
      };
      
      setHistoricoAprovacoes(prev => [approvedSolicitation, ...prev]);
      
      // Atualiza a solicitação selecionada se for a que está sendo aprovada
      if (selectedRequest && selectedRequest.id === solicitacaoId) {
        setSelectedRequest(approvedSolicitation);
      }
      
      // Mudar para a aba de histórico após a aprovação
      setActiveTab('historico');
      
      toast({
        title: "Solicitação aprovada",
        description: `A solicitação ${solicitacaoId} foi aprovada com sucesso.`
      });
      
      console.log("Solicitação aprovada e movida para o histórico!");
    } else {
      console.error("Solicitação não encontrada:", solicitacaoId);
      toast({
        title: "Erro",
        description: `Não foi possível encontrar a solicitação ${solicitacaoId}.`,
        variant: "destructive"
      });
    }
  };
  
  // Função para lidar com a rejeição de uma solicitação
  const handleReject = (solicitacaoId: string, motivoRecusa: string, observacoes: string) => {
    console.log("AprovacoesColeta: Recusando solicitação:", solicitacaoId);
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString()} às ${currentDate.toLocaleTimeString()}`;
    const approverName = "Maria Oliveira"; // Normalmente viria da sessão do usuário
    
    // Encontrar a solicitação para recusar
    const solicitacaoToReject = solicitacoesPendentes.find(s => s.id === solicitacaoId);
    
    if (solicitacaoToReject) {
      // Remover das pendentes
      setSolicitacoesPendentes(prev => prev.filter(s => s.id !== solicitacaoId));
      
      // Adicionar ao histórico como recusada
      const rejectedSolicitation = {
        ...solicitacaoToReject,
        status: 'rejected' as const,
        aprovador: approverName,
        dataAprovacao: formattedDate,
        motivoRecusa,
        observacoes
      };
      
      setHistoricoAprovacoes(prev => [rejectedSolicitation, ...prev]);
      
      // Atualiza a solicitação selecionada se for a que está sendo recusada
      if (selectedRequest && selectedRequest.id === solicitacaoId) {
        setSelectedRequest(rejectedSolicitation);
      }
      
      // Mudar para a aba de histórico após a rejeição
      setActiveTab('historico');
      
      toast({
        title: "Solicitação recusada",
        description: `A solicitação ${solicitacaoId} foi recusada.`
      });
      
      console.log("Solicitação recusada e movida para o histórico!");
    } else {
      console.error("Solicitação não encontrada:", solicitacaoId);
      toast({
        title: "Erro",
        description: `Não foi possível encontrar a solicitação ${solicitacaoId}.`,
        variant: "destructive"
      });
    }
  };

  // Renderiza o conteúdo do documento para impressão
  const renderAprovacaoDocument = (documentId: string) => {
    return (
      allDocuments.find(doc => doc.id === documentId) || null
    );
  };

  return {
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
    handleReject,
    renderAprovacaoDocument
  };
}
