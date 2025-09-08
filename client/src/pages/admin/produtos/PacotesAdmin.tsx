
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PacotesTableFixed as PacotesTable } from '@/components/admin/produtos/PacotesTableFixed';
import { PacoteFormSimples } from '@/components/admin/produtos/PacoteFormSimples';
import DashboardRentabilidade from '@/components/admin/produtos/DashboardRentabilidade';

const PacotesAdmin = () => {
  const { user, loading } = useRequireAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editPacoteId, setEditPacoteId] = useState<string | null>(null);

  // Debug de autenticação
  console.log('PacotesAdmin - user:', user, 'loading:', loading);

  const handleCreatePacote = () => {
    setEditPacoteId(null);
    setShowForm(true);
  };

  const handleEditPacote = (id: string) => {
    setEditPacoteId(id);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditPacoteId(null);
  };

  if (showForm) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="mb-6">
            <Button variant="outline" onClick={handleBackToList} className="mb-4">
              ← Voltar para a lista
            </Button>
            <h1 className="text-3xl font-bold">{editPacoteId ? 'Editar Pacote' : 'Novo Pacote'}</h1>
          </div>
          
          <PacoteFormSimples 
            pacoteId={editPacoteId} 
            onSave={handleBackToList}
            onCancel={handleBackToList}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Pacotes</h1>
            <p className="text-muted-foreground mt-1">
              Análise de rentabilidade e gestão de pacotes comerciais
            </p>
          </div>
          <Button onClick={handleCreatePacote}>
            Novo Pacote
          </Button>
        </div>

        <Tabs defaultValue="rentabilidade" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rentabilidade">Dashboard de Rentabilidade</TabsTrigger>
            <TabsTrigger value="pacotes">Gestão de Pacotes</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações de Preços</TabsTrigger>
          </TabsList>

          <TabsContent value="rentabilidade" className="space-y-4 mt-6">
            <DashboardRentabilidade />
          </TabsContent>

          <TabsContent value="pacotes" className="space-y-4 mt-6">
            <div className="flex items-center justify-between mb-6">
              <div></div>
              <div className="flex gap-4">
                <Input
                  placeholder="Buscar pacotes..."
                  className="max-w-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <PacotesTable 
                  searchTerm={searchTerm} 
                  onEdit={handleEditPacote} 
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="space-y-4 mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    Configurações de Preços
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Configure parâmetros globais de custos e margens de lucro para todos os pacotes.
                  </p>
                  <Button className="mt-4" variant="outline">
                    Em Desenvolvimento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default PacotesAdmin;
