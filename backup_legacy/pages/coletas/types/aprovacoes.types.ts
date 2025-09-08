
import { SolicitacaoColeta } from './coleta.types';

export interface AprovacoesState {
  isDialogOpen: boolean;
  selectedRequest: SolicitacaoColeta | null;
  currentPage: number;
  activeTab: string;
  isRejecting: boolean;
  solicitacoesPendentes: SolicitacaoColeta[];
  historicoAprovacoes: SolicitacaoColeta[];
}

export interface AprovacoesHandlers {
  setIsDialogOpen: (isOpen: boolean) => void;
  setCurrentPage: (page: number) => void;
  setActiveTab: (tab: string) => void;
  setIsRejecting: (isRejecting: boolean) => void;
  handleSearch: (value: string) => void;
  handleFilterChange: (filter: string, value: string) => void;
  openDetailDialog: (row: SolicitacaoColeta) => void;
  handleApprove: (solicitacaoId: string, observacoes?: string) => void;
  handleReject: (solicitacaoId: string, motivoRecusa: string, observacoes: string) => void;
  renderAprovacaoDocument: (documentId: string) => SolicitacaoColeta | null;
}
