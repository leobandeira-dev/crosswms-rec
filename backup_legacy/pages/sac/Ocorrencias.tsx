import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Ocorrencia } from '@/types/ocorrencias.types';
import { ocorrencias, documentosMock } from '@/data/ocorrenciasMock';
import OcorrenciasTable from '@/components/ocorrencias/OcorrenciasTable';
import OcorrenciasTabs from '@/components/ocorrencias/OcorrenciasTabs';
import NovaOcorrenciaDialog from '@/components/ocorrencias/NovaOcorrenciaDialog';
import OcorrenciaDetailDialog from '@/components/ocorrencias/OcorrenciaDetailDialog';
import LinkDocumentDialog from '@/components/ocorrencias/LinkDocumentDialog';

const Ocorrencias = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
  const [activeTab, setActiveTab] = useState('pendentes');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLinkDocumentDialogOpen, setIsLinkDocumentDialogOpen] = useState(false);
  
  const filters = [
    {
      name: 'Status',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Aberto', value: 'open' },
        { label: 'Em Andamento', value: 'in_progress' },
        { label: 'Resolvido', value: 'resolved' },
        { label: 'Fechado', value: 'closed' },
      ]
    },
    {
      name: 'Tipo',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Extravio', value: 'extravio' },
        { label: 'Avaria', value: 'avaria' },
        { label: 'Atraso', value: 'atraso' },
        { label: 'Divergência', value: 'divergencia' },
      ]
    },
    {
      name: 'Prioridade',
      options: [
        { label: 'Todas', value: 'all' },
        { label: 'Alta', value: 'high' },
        { label: 'Média', value: 'medium' },
        { label: 'Baixa', value: 'low' },
      ]
    },
    {
      name: 'Documento',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Nota Fiscal', value: 'nota' },
        { label: 'Coleta', value: 'coleta' },
        { label: 'Ordem de Carregamento', value: 'oc' },
      ]
    }
  ];
  
  const handleSearch = (value: string) => {
    console.log('Search:', value);
    // Implementar lógica de busca
  };
  
  const handleFilterChange = (filter: string, value: string) => {
    console.log(`Filter ${filter} changed to ${value}`);
    // Implementar lógica de filtro
  };
  
  const showDetail = (ocorrencia: Ocorrencia) => {
    setSelectedOcorrencia(ocorrencia);
    setIsDetailDialogOpen(true);
  };

  const handleLinkDocument = (ocorrencia: Ocorrencia | null = null) => {
    if (ocorrencia) {
      setSelectedOcorrencia(ocorrencia);
    }
    setIsLinkDocumentDialogOpen(true);
  };

  return (
    <MainLayout title="Gestão de Ocorrências">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-heading">SAC - Gestão de Ocorrências</h2>
          <p className="text-gray-500">Acompanhe e gerencie ocorrências logísticas</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cross-blue hover:bg-cross-blueDark">
              <Plus className="mr-2 h-4 w-4" /> Nova Ocorrência
            </Button>
          </DialogTrigger>
          <NovaOcorrenciaDialog 
            onClose={() => setIsDialogOpen(false)}
            onLinkDocument={() => {
              setIsDialogOpen(false);
              setTimeout(() => handleLinkDocument(), 100);
            }}
          />
        </Dialog>
      </div>
      
      <OcorrenciasTabs 
        ocorrencias={ocorrencias}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        filters={filters}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onRowClick={showDetail}
        onLinkDocument={handleLinkDocument}
      />
      
      {selectedOcorrencia && (
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <OcorrenciaDetailDialog 
            ocorrencia={selectedOcorrencia}
            onClose={() => setIsDetailDialogOpen(false)}
            onLinkDocument={(ocorrencia) => {
              setIsDetailDialogOpen(false);
              setTimeout(() => handleLinkDocument(ocorrencia), 100);
            }}
          />
        </Dialog>
      )}

      <Dialog open={isLinkDocumentDialogOpen} onOpenChange={setIsLinkDocumentDialogOpen}>
        <LinkDocumentDialog 
          ocorrencia={selectedOcorrencia}
          documentosMock={documentosMock}
          onClose={() => setIsLinkDocumentDialogOpen(false)}
        />
      </Dialog>
    </MainLayout>
  );
};

export default Ocorrencias;
