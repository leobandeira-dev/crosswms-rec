
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PacotesTable } from '@/components/admin/produtos/PacotesTable';
import { PacoteForm } from '@/components/admin/produtos/PacoteForm';

const PacotesAdmin = () => {
  useRequireAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editPacoteId, setEditPacoteId] = useState<string | null>(null);

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
          
          <PacoteForm 
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
              Crie e gerencie pacotes e funcionalidades que serão comercializados.
            </p>
          </div>
          <Button onClick={handleCreatePacote}>
            Novo Pacote
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div></div> {/* Placeholder for filters if needed */}
          
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
      </div>
    </MainLayout>
  );
};

export default PacotesAdmin;
