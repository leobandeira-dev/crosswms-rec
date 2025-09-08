
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { RecebimentosTable } from '@/components/admin/financeiro/RecebimentosTable';
import { RecebimentoForm } from '@/components/admin/financeiro/RecebimentoForm';

const RecebimentosAdmin = () => {
  useRequireAuth();
  const [activeTab, setActiveTab] = useState('pendentes');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const handleCreate = () => {
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    setEditId(id);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditId(null);
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
              {editId ? 'Editar Recebimento' : 'Novo Recebimento'}
            </h1>
          </div>
          
          <RecebimentoForm 
            recebimentoId={editId} 
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
          <h1 className="text-3xl font-bold">Gestão de Recebimentos</h1>
          <Button onClick={handleCreate}>
            Novo Recebimento
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
              <TabsTrigger value="pagos">Pagos</TabsTrigger>
              <TabsTrigger value="atrasados">Atrasados</TabsTrigger>
              <TabsTrigger value="todos">Todos</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-4">
            <Input
              placeholder="Buscar por cliente, recibo..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <RecebimentosTable 
              status={activeTab} 
              searchTerm={searchTerm}
              onEdit={handleEdit} 
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default RecebimentosAdmin;
