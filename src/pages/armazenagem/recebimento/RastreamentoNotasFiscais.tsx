
import React, { useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

// Import components
import ViewToggle from './components/ViewToggle';
import ListView from './components/ListView';
import KanbanView from './components/KanbanView';
import SearchFilterSection from './components/SearchFilterSection';
import { notasFiscaisMock } from './components/notasFiscaisData';
import { useNotasFilter } from './components/useNotasFilter';

const RastreamentoNotasFiscais: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  
  const {
    selectedTab,
    setSelectedTab,
    filteredNotas,
    setSearchTerm,
    setSelectedStatus,
    setSelectedPriority
  } = useNotasFilter(notasFiscaisMock);

  // Handle status update
  const handleUpdateStatus = (notaId: string, newStatus: string) => {
    toast({
      title: "Status atualizado",
      description: `Status da nota fiscal ${notaId} alterado para ${newStatus}`,
    });
  };

  // Handle priority update
  const handleUpdatePriority = (notaId: string, newPriority: string) => {
    toast({
      title: "Prioridade atualizada",
      description: `Prioridade da nota fiscal ${notaId} alterada para ${newPriority}`,
    });
  };

  return (
    <MainLayout title="Rastreamento de Notas Fiscais">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Rastreamento de Notas Fiscais</h1>
            <p className="text-muted-foreground">Acompanhe o status atual de cada nota fiscal</p>
          </div>
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        {/* Search and filters */}
        <SearchFilterSection 
          onSearchChange={setSearchTerm}
          onStatusChange={setSelectedStatus}
          onPriorityChange={setSelectedPriority}
        />

        <Card>
          <CardHeader>
            <CardTitle>Notas Fiscais</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="todas" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="todas">Todas</TabsTrigger>
                <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
                <TabsTrigger value="em_transito">Em Trânsito</TabsTrigger>
                <TabsTrigger value="finalizadas">Finalizadas</TabsTrigger>
                <TabsTrigger value="problemas">Problemas</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab}>
                {viewMode === 'list' ? (
                  <ListView 
                    data={filteredNotas} 
                    onStatusUpdate={handleUpdateStatus}
                    onPriorityUpdate={handleUpdatePriority}
                  />
                ) : (
                  <KanbanView data={filteredNotas} />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RastreamentoNotasFiscais;
