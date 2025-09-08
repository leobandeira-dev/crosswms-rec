
import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import SearchFilter from '../../components/common/SearchFilter';
import { useToast } from '@/hooks/use-toast';
import { SolicitacaoColeta } from './types/coleta.types';
import EditSolicitacaoDialog from './components/EditSolicitacaoDialog';
import NovaSolicitacaoDialog from './components/NovaSolicitacaoDialog';
import TabelaSolicitacoes from './components/TabelaSolicitacoes';
import { solicitacoesIniciais } from './data/solicitacoesMock';

const SolicitacoesColeta = () => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('unica');
  const [currentPage, setCurrentPage] = useState(1);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoColeta[]>([]);
  const [editingSolicitacao, setEditingSolicitacao] = useState<SolicitacaoColeta | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const itemsPerPage = 10;
  
  // Load solicitations from localStorage or use initial data
  useEffect(() => {
    setIsLoading(true);
    try {
      const storedSolicitations = localStorage.getItem('solicitacoesColeta');
      if (storedSolicitations) {
        const parsedSolicitations = JSON.parse(storedSolicitations);
        setSolicitacoes(parsedSolicitations);
      } else {
        setSolicitacoes(solicitacoesIniciais);
        // Initialize localStorage with mock data
        localStorage.setItem('solicitacoesColeta', JSON.stringify(solicitacoesIniciais));
      }
    } catch (error) {
      console.error("Error loading solicitations:", error);
      setSolicitacoes(solicitacoesIniciais);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const filters = [
    {
      name: 'Status',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Pendentes', value: 'pending' },
        { label: 'Aprovados', value: 'approved' },
        { label: 'Recusados', value: 'rejected' },
      ]
    },
    {
      name: 'Data',
      options: [
        { label: 'Hoje', value: 'today' },
        { label: 'Últimos 7 dias', value: '7days' },
        { label: 'Últimos 30 dias', value: '30days' },
        { label: 'Personalizado', value: 'custom' },
      ]
    }
  ];
  
  const handleSearch = (value: string) => {
    console.log('Search:', value);
    // Implement search logic
  };
  
  const handleFilterChange = (filter: string, value: string) => {
    console.log(`Filter ${filter} changed to ${value}`);
    // Implement filter logic
  };
  
  const handleRowClick = (row: SolicitacaoColeta) => {
    console.log('Row clicked:', row);
    setEditingSolicitacao(row);
    setIsEditDialogOpen(true);
  };
  
  const handleSaveSolicitacao = (updatedSolicitacao: SolicitacaoColeta) => {
    // Update the solicitation in the list
    const updatedList = solicitacoes.map(sol => 
      sol.id === updatedSolicitacao.id ? updatedSolicitacao : sol
    );
    
    setSolicitacoes(updatedList);
    
    // Update localStorage
    localStorage.setItem('solicitacoesColeta', JSON.stringify(updatedList));
    
    toast({
      title: "Solicitação atualizada",
      description: `A solicitação ${updatedSolicitacao.id} foi atualizada com sucesso.`
    });
  };

  return (
    <MainLayout title="Solicitações de Coleta">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-heading">Gestão de Solicitações</h2>
          <p className="text-gray-500">Visualize e gerencie todas as solicitações de coleta</p>
        </div>
        
        <NovaSolicitacaoDialog 
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
      
      <SearchFilter 
        placeholder="Buscar por ID, remetente, destinatário ou notas fiscais..."
        filters={filters}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cross-blue"></div>
        </div>
      ) : (
        <TabelaSolicitacoes
          solicitacoes={solicitacoes}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleRowClick={handleRowClick}
          itemsPerPage={itemsPerPage}
        />
      )}
      
      {/* Diálogo de Edição de Solicitação */}
      <EditSolicitacaoDialog
        solicitacao={editingSolicitacao}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveSolicitacao}
      />
    </MainLayout>
  );
};

export default SolicitacoesColeta;
