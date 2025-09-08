
import { useState, useEffect } from 'react';
import { NotaFiscal } from './notasFiscaisData';

export const useNotasFilter = (notasData: NotaFiscal[]) => {
  const [selectedTab, setSelectedTab] = useState('todas');
  const [filteredNotas, setFilteredNotas] = useState<NotaFiscal[]>(notasData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedPriority, setSelectedPriority] = useState('todas');

  // Filter functions
  const filterByTab = (tab: string, notasFiscais: NotaFiscal[]) => {
    if (tab === 'todas') return notasFiscais;
    
    const statusMap: Record<string, string[]> = {
      'em_transito': ['coletando', 'em_transferencia', 'em_rota_entrega'],
      'finalizadas': ['entregue', 'indenizada'],
      'pendentes': ['coleta_agendada', 'no_armazem'],
      'problemas': ['extraviada', 'avariada', 'sinistrada', 'bloqueada'],
    };
    
    return notasFiscais.filter(nf => 
      statusMap[tab]?.includes(nf.status)
    );
  };

  const applyFilters = () => {
    let filtered = [...notasData];
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(nf => 
        nf.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nf.emitente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nf.destinatario.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by status
    if (selectedStatus !== 'todos') {
      filtered = filtered.filter(nf => nf.status === selectedStatus);
    }
    
    // Filter by priority
    if (selectedPriority !== 'todas') {
      filtered = filtered.filter(nf => nf.prioridade === selectedPriority);
    }
    
    // Apply tab filter
    filtered = filterByTab(selectedTab, filtered);
    
    setFilteredNotas(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedTab, searchTerm, selectedStatus, selectedPriority, notasData]);

  return {
    selectedTab,
    setSelectedTab,
    filteredNotas,
    setSearchTerm,
    setSelectedStatus,
    setSelectedPriority
  };
};
