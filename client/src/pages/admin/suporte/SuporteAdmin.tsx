
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { ChamadosTable } from '@/components/admin/suporte/ChamadosTable';
import { ChamadoForm } from '@/components/admin/suporte/ChamadoForm';
import { ChamadoDetalhes } from '@/components/admin/suporte/ChamadoDetalhes';

const SuporteAdmin = () => {
  useRequireAuth();
  const [activeTab, setActiveTab] = useState('abertos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedChamadoId, setSelectedChamadoId] = useState<string | null>(null);

  const handleCreateChamado = () => {
    setSelectedChamadoId(null);
    setShowForm(true);
    setShowDetails(false);
  };

  const handleViewChamado = (id: string) => {
    setSelectedChamadoId(id);
    setShowDetails(true);
    setShowForm(false);
  };

  const handleEditChamado = (id: string) => {
    setSelectedChamadoId(id);
    setShowForm(true);
    setShowDetails(false);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setShowDetails(false);
    setSelectedChamadoId(null);
  };

  if (showForm) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="mb-6">
            <Button variant="outline" onClick={handleBackToList} className="mb-4">
              ← Voltar para a lista
            </Button>
            <h1 className="text-3xl font-bold">
              {selectedChamadoId ? 'Editar Chamado' : 'Novo Chamado'}
            </h1>
          </div>
          
          <ChamadoForm 
            chamadoId={selectedChamadoId} 
            onSave={handleBackToList}
            onCancel={handleBackToList}
          />
        </div>
      </MainLayout>
    );
  }

  if (showDetails) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="mb-6">
            <Button variant="outline" onClick={handleBackToList} className="mb-4">
              ← Voltar para a lista
            </Button>
          </div>
          
          <ChamadoDetalhes 
            chamadoId={selectedChamadoId!} 
            onEdit={handleEditChamado}
            onBack={handleBackToList}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestão de Chamados</h1>
          <Button onClick={handleCreateChamado}>
            Novo Chamado
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="abertos">Abertos</TabsTrigger>
              <TabsTrigger value="em_atendimento">Em Atendimento</TabsTrigger>
              <TabsTrigger value="resolvidos">Resolvidos</TabsTrigger>
              <TabsTrigger value="todos">Todos</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-4">
            <Input
              placeholder="Buscar chamados..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <ChamadosTable 
              status={activeTab} 
              searchTerm={searchTerm}
              onView={handleViewChamado} 
              onEdit={handleEditChamado} 
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SuporteAdmin;
