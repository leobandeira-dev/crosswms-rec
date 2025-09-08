
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LeadsKanbanView } from '@/components/admin/leads/LeadsKanbanView';
import { LeadsTableView } from '@/components/admin/leads/LeadsTableView';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, List, Kanban } from 'lucide-react';
import { LeadForm } from '@/components/admin/leads/LeadForm';

const LeadsAdmin = () => {
  const [viewType, setViewType] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editLeadId, setEditLeadId] = useState<string | null>(null);

  const handleCreateLead = () => {
    setEditLeadId(null);
    setShowForm(true);
  };

  const handleEditLead = (id: string) => {
    setEditLeadId(id);
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
    setEditLeadId(null);
  };

  if (showForm) {
    return (
      <MainLayout>
        <div className="p-6">
          <div className="mb-6">
            <Button variant="outline" onClick={handleBackToList} className="mb-4">
              ← Voltar para a lista
            </Button>
            <h1 className="text-3xl font-bold">{editLeadId ? 'Editar Lead' : 'Novo Lead'}</h1>
          </div>
          
          <LeadForm 
            leadId={editLeadId} 
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
          <h1 className="text-3xl font-bold">Gestão de Leads</h1>
          <Button onClick={handleCreateLead}>
            <Plus className="h-4 w-4 mr-2" /> Novo Lead
          </Button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <Button 
              variant={viewType === 'kanban' ? 'default' : 'outline'} 
              onClick={() => setViewType('kanban')}
              size="sm"
            >
              <Kanban className="h-4 w-4 mr-2" /> Kanban
            </Button>
            <Button 
              variant={viewType === 'list' ? 'default' : 'outline'} 
              onClick={() => setViewType('list')}
              size="sm"
            >
              <List className="h-4 w-4 mr-2" /> Lista
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Buscar leads..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {viewType === 'kanban' ? (
          <LeadsKanbanView 
            searchTerm={searchTerm} 
            onEdit={handleEditLead} 
          />
        ) : (
          <LeadsTableView 
            searchTerm={searchTerm} 
            onEdit={handleEditLead} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default LeadsAdmin;
