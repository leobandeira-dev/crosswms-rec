
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
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
  MoveRight 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

// Define status colors and labels
const statusConfig: Record<string, { label: string, color: string }> = {
  novo: { label: 'Novo', color: 'bg-blue-100 text-blue-800' },
  contatado: { label: 'Contatado', color: 'bg-purple-100 text-purple-800' },
  qualificado: { label: 'Qualificado', color: 'bg-amber-100 text-amber-800' },
  proposta: { label: 'Proposta', color: 'bg-orange-100 text-orange-800' },
  fechado: { label: 'Fechado', color: 'bg-green-100 text-green-800' },
  perdido: { label: 'Perdido', color: 'bg-red-100 text-red-800' },
};

type LeadsTableViewProps = {
  searchTerm: string;
  onEdit: (id: string) => void;
};

export const LeadsTableView = ({ searchTerm, onEdit }: LeadsTableViewProps) => {
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
    toast({
      title: "Mover estágio",
      description: `Selecione o próximo estágio para ${lead.nome}`,
    });
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLeads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredLeads.map(lead => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.nome}</TableCell>
                  <TableCell>{lead.empresa}</TableCell>
                  <TableCell>
                    <div>{lead.email}</div>
                    <div className="text-sm text-muted-foreground">{lead.telefone}</div>
                  </TableCell>
                  <TableCell>{lead.origem}</TableCell>
                  <TableCell>{lead.dataContato}</TableCell>
                  <TableCell>{getStatusBadge(lead.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
