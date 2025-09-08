
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
  MoreHorizontal, 
  Check, 
  X,
  Mail,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockResetSenhas = [
  {
    id: '1',
    usuario: 'João Silva',
    email: 'joao.silva@empresaabc.com.br',
    cliente: 'Empresa ABC Ltda',
    dataSolicitacao: '15/05/2023 14:30',
    status: 'pendente',
  },
  {
    id: '2',
    usuario: 'Maria Oliveira',
    email: 'maria.oliveira@xyzexpress.com.br',
    cliente: 'Distribuidora XYZ S.A.',
    dataSolicitacao: '14/05/2023 10:15',
    status: 'processado',
    dataProcessamento: '14/05/2023 11:45'
  },
  {
    id: '3',
    usuario: 'Carlos Santos',
    email: 'carlos.santos@transrapida.com.br',
    cliente: 'Transportes Rápidos Ltda',
    dataSolicitacao: '13/05/2023 09:22',
    status: 'pendente',
  },
  {
    id: '4',
    usuario: 'Ana Pereira',
    email: 'ana.pereira@logexpress.com.br',
    cliente: 'Logística Express',
    dataSolicitacao: '11/05/2023 16:50',
    status: 'cancelado',
    dataProcessamento: '12/05/2023 08:30'
  },
];

type ResetSenhasTableProps = {
  searchTerm: string;
};

export const ResetSenhasTable = ({ searchTerm }: ResetSenhasTableProps) => {
  // Filter based on search term
  const filteredResetSenhas = mockResetSenhas.filter(reset =>
    reset.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reset.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reset.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAprovarReset = (reset: any) => {
    toast({
      title: "Reset de senha processado",
      description: `Um e-mail de redefinição de senha foi enviado para ${reset.email}.`,
    });
  };

  const handleRecusarReset = (reset: any) => {
    toast({
      title: "Solicitação recusada",
      description: `A solicitação de reset de senha de ${reset.usuario} foi recusada.`,
    });
  };

  const handleEnviarReset = (reset: any) => {
    toast({
      title: "Novo e-mail enviado",
      description: `Um novo e-mail de redefinição de senha foi enviado para ${reset.email}.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="outline">Pendente</Badge>;
      case 'processado':
        return <Badge variant="default" className="bg-green-600">Processado</Badge>;
      case 'cancelado':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Usuário</TableHead>
          <TableHead>E-mail</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Data Solicitação</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data Processamento</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredResetSenhas.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              Nenhuma solicitação de reset de senha encontrada.
            </TableCell>
          </TableRow>
        ) : (
          filteredResetSenhas.map((reset) => (
            <TableRow key={reset.id}>
              <TableCell className="font-medium">{reset.usuario}</TableCell>
              <TableCell>{reset.email}</TableCell>
              <TableCell>{reset.cliente}</TableCell>
              <TableCell>{reset.dataSolicitacao}</TableCell>
              <TableCell>{getStatusBadge(reset.status)}</TableCell>
              <TableCell>{reset.dataProcessamento || '-'}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {reset.status === 'pendente' && (
                      <>
                        <DropdownMenuItem onClick={() => handleAprovarReset(reset)}>
                          <Check className="h-4 w-4 mr-2" /> Aprovar Reset
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRecusarReset(reset)}>
                          <X className="h-4 w-4 mr-2" /> Recusar Reset
                        </DropdownMenuItem>
                      </>
                    )}
                    {reset.status === 'processado' && (
                      <DropdownMenuItem onClick={() => handleEnviarReset(reset)}>
                        <Mail className="h-4 w-4 mr-2" /> Enviar Novo Link
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => handleAprovarReset(reset)}>
                      <RefreshCw className="h-4 w-4 mr-2" /> Forçar Reset
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};
