
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Edit, 
  MoreHorizontal, 
  PhoneCall, 
  Mail, 
  MoveRight, 
  User, 
  Building, 
  Calendar 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock leads data
const mockLeads = [
  {
    id: '1',
    nome: 'João Silva',
    empresa: 'Empresa Nova Ltda',
    email: 'joao.silva@empresanova.com.br',
    telefone: '(11) 98765-4321',
    origem: 'Site',
    status: 'novo',
    dataContato: '10/05/2023',
    observacoes: 'Cliente interessado no pacote standard para logística.',
  },
  {
    id: '2',
    nome: 'Maria Oliveira',
    empresa: 'Transportadora Veloz',
    email: 'maria.oliveira@veloz.com.br',
    telefone: '(21) 97654-3210',
    origem: 'Indicação',
    status: 'contatado',
    dataContato: '12/05/2023',
    observacoes: 'Ligou perguntando sobre preços e funcionalidades.',
  },
  {
    id: '3',
    nome: 'Carlos Santos',
    empresa: 'Distribuidora Rápida',
    email: 'carlos.santos@rapida.com.br',
    telefone: '(31) 96543-2109',
    origem: 'Feira',
    status: 'qualificado',
    dataContato: '15/05/2023',
    observacoes: 'Muito interessado. Já solicitou uma demonstração.',
  },
  {
    id: '4',
    nome: 'Ana Pereira',
    empresa: 'Logística Express',
    email: 'ana.pereira@express.com.br',
    telefone: '(41) 95432-1098',
    origem: 'Site',
    status: 'proposta',
    dataContato: '18/05/2023',
    observacoes: 'Enviada proposta comercial para pacote premium.',
  },
  {
    id: '5',
    nome: 'Roberto Lima',
    empresa: 'Entregas Ágil',
    email: 'roberto.lima@agil.com.br',
    telefone: '(51) 94321-0987',
    origem: 'Indicação',
    status: 'fechado',
    dataContato: '20/05/2023',
    observacoes: 'Cliente fechou contrato para pacote standard por 12 meses.',
  },
];

// Define kanban columns and their order
const kanbanColumns = [
  { id: 'novo', label: 'Novo' },
  { id: 'contatado', label: 'Contatado' },
  { id: 'qualificado', label: 'Qualificado' },
  { id: 'proposta', label: 'Proposta' },
  { id: 'fechado', label: 'Fechado' },
  { id: 'perdido', label: 'Perdido' },
];

type LeadsKanbanViewProps = {
  searchTerm: string;
  onEdit: (id: string) => void;
};

export const LeadsKanbanView = ({ searchTerm, onEdit }: LeadsKanbanViewProps) => {
  // Filter leads by search term
  const filteredLeads = mockLeads.filter(lead =>
    lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCallLead = (lead: any) => {
    toast({
      title: "Ligação",
      description: `Iniciando ligação para ${lead.nome} - ${lead.telefone}`,
    });
  };

  const handleEmailLead = (lead: any) => {
    toast({
      title: "E-mail",
      description: `Compose e-mail para ${lead.nome} - ${lead.email}`,
    });
  };

  const handleMoveToNextStage = (lead: any) => {
    const currentIndex = kanbanColumns.findIndex(col => col.id === lead.status);
    if (currentIndex < kanbanColumns.length - 1) {
      const nextStage = kanbanColumns[currentIndex + 1].label;
      toast({
        title: "Lead movido",
        description: `${lead.nome} foi movido para o estágio "${nextStage}"`,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto">
      {kanbanColumns.map(column => {
        const columnLeads = filteredLeads.filter(lead => lead.status === column.id);
        
        return (
          <div key={column.id} className="min-w-[300px]">
            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">{column.label}</h3>
                <Badge>{columnLeads.length}</Badge>
              </div>
              
              <div className="space-y-4">
                {columnLeads.length === 0 ? (
                  <div className="text-center py-8 bg-background rounded-lg border border-dashed border-muted-foreground/20 text-muted-foreground">
                    Nenhum lead neste estágio
                  </div>
                ) : (
                  columnLeads.map(lead => (
                    <Card key={lead.id} className="shadow-sm">
                      <CardHeader className="p-3 pb-0 flex flex-row justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{lead.nome}</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Building className="h-3 w-3 mr-1" />
                            {lead.empresa}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onEdit(lead.id)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCallLead(lead)}>
                              <PhoneCall className="h-4 w-4 mr-2" />
                              Ligar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEmailLead(lead)}>
                              <Mail className="h-4 w-4 mr-2" />
                              E-mail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleMoveToNextStage(lead)}>
                              <MoveRight className="h-4 w-4 mr-2" />
                              Próximo Estágio
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          <div className="flex items-center text-xs">
                            <Mail className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[200px]">{lead.email}</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <PhoneCall className="h-3 w-3 mr-1" />
                            {lead.telefone}
                          </div>
                          <div className="flex items-center text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {lead.dataContato}
                          </div>
                        </div>
                        {lead.observacoes && (
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            {lead.observacoes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
