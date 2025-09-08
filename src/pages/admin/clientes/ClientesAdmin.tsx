
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClientesList } from '@/components/admin/clientes/ClientesList';
import { ClienteForm } from '@/components/admin/clientes/ClienteForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const ClientesAdmin = () => {
  useRequireAuth();
  const [activeTab, setActiveTab] = useState('lista');
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);

  const handleCreateNew = () => {
    setSelectedClienteId(null);
    setActiveTab('cadastro');
  };

  const handleEditCliente = (id: string) => {
    setSelectedClienteId(id);
    setActiveTab('cadastro');
  };

  const handleBackToList = () => {
    setActiveTab('lista');
    setSelectedClienteId(null);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestão de Clientes</h1>
          {activeTab === 'lista' && (
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" /> Novo Cliente
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="lista">Lista de Clientes</TabsTrigger>
            <TabsTrigger value="cadastro" disabled={activeTab !== 'cadastro'}>
              {selectedClienteId ? 'Editar Cliente' : 'Novo Cliente'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="lista">
            <ClientesList onEdit={handleEditCliente} />
          </TabsContent>
          
          <TabsContent value="cadastro">
            <ClienteForm 
              clienteId={selectedClienteId} 
              onCancel={handleBackToList}
              onSave={handleBackToList} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ClientesAdmin;
