
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
  Eye, 
  MessageCircle, 
  CheckCircle,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockChamados = [
  {
    id: '1',
    cliente: 'Empresa ABC Ltda',
    assunto: 'Erro ao gerar relatórios',
    categoria: 'Bug',
    prioridade: 'alta',
    status: 'aberto',
    dataAbertura: '15/05/2023',
    ultimaAtualizacao: '16/05/2023',
    responsavel: 'Carlos Silva',
  },
  {
    id: '2',
    cliente: 'Distribuidora XYZ S.A.',
    assunto: 'Dúvida sobre integração com ERP',
    categoria: 'Dúvida',
    prioridade: 'media',
    status: 'em_atendimento',
    dataAbertura: '14/05/2023',
    ultimaAtualizacao: '16/05/2023',
    responsavel: 'Ana Santos',
  },
  {
    id: '3',
    cliente: 'Transportes Rápidos Ltda',
    assunto: 'Solicitação de nova funcionalidade',
    categoria: 'Solicitação',
    prioridade: 'baixa',
    status: 'aberto',
    dataAbertura: '13/05/2023',
    ultimaAtualizacao: '13/05/2023',
    responsavel: null,
  },
  {
    id: '4',
    cliente: 'Logística Express',
    assunto: 'Problemas com login',
    categoria: 'Bug',
    prioridade: 'alta',
    status: 'resolvido',
    dataAbertura: '10/05/2023',
    ultimaAtualizacao: '12/05/2023',
    responsavel: 'Carlos Silva',
  },
];

type ChamadosTableProps = {
  status: string;
  searchTerm: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
};

export const ChamadosTable = ({ status, searchTerm, onView, onEdit }: ChamadosTableProps) => {
  // Filter based on status and search term
  const filteredChamados = mockChamados.filter(chamado => {
    // Filter by status
    if (status !== 'todos') {
      if (status === 'abertos' && chamado.status !== 'aberto') return false;
      if (status === 'em_atendimento' && chamado.status !== 'em_atendimento') return false;
      if (status === 'resolvidos' && chamado.status !== 'resolvido') return false;
    }
    
    // Filter by search term
    if (searchTerm && !chamado.cliente.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !chamado.assunto.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleResponder = (chamado: any) => {
    toast({
      title: "Responder chamado",
      description: `Abrindo formulário para responder ao chamado #${chamado.id}`,
    });
    onView(chamado.id);
  };

  const handleResolverChamado = (chamado: any) => {
    toast({
      title: "Chamado resolvido",
      description: `Chamado #${chamado.id} marcado como resolvido.`,
    });
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return <Badge variant="destructive">Alta</Badge>;
      case 'media':
        return <Badge variant="default">Média</Badge>;
      case 'baixa':
        return <Badge variant="outline">Baixa</Badge>;
      default:
        return <Badge variant="secondary">{prioridade}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aberto':
        return <Badge variant="secondary">Aberto</Badge>;
      case 'em_atendimento':
        return <Badge variant="default" className="bg-blue-600">Em Atendimento</Badge>;
      case 'resolvido':
        return <Badge variant="default" className="bg-green-600">Resolvido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoriaBadge = (categoria: string) => {
    switch (categoria) {
      case 'Bug':
        return <Badge variant="destructive" className="bg-red-500">{categoria}</Badge>;
      case 'Dúvida':
        return <Badge variant="default" className="bg-blue-500">{categoria}</Badge>;
      case 'Solicitação':
        return <Badge variant="default" className="bg-amber-500">{categoria}</Badge>;
      default:
        return <Badge variant="secondary">{categoria}</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Assunto</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Prioridade</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data Abertura</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredChamados.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
              Nenhum chamado encontrado.
            </TableCell>
          </TableRow>
        ) : (
          filteredChamados.map((chamado) => (
            <TableRow key={chamado.id}>
              <TableCell className="font-medium">{chamado.cliente}</TableCell>
              <TableCell>{chamado.assunto}</TableCell>
              <TableCell>{getCategoriaBadge(chamado.categoria)}</TableCell>
              <TableCell>{getPrioridadeBadge(chamado.prioridade)}</TableCell>
              <TableCell>{getStatusBadge(chamado.status)}</TableCell>
              <TableCell>{chamado.dataAbertura}</TableCell>
              <TableCell>{chamado.responsavel || '-'}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(chamado.id)}>
                      <Eye className="h-4 w-4 mr-2" /> Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(chamado.id)}>
                      <Edit className="h-4 w-4 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleResponder(chamado)}>
                      <MessageCircle className="h-4 w-4 mr-2" /> Responder
                    </DropdownMenuItem>
                    {chamado.status !== 'resolvido' && (
                      <DropdownMenuItem onClick={() => handleResolverChamado(chamado)}>
                        <CheckCircle className="h-4 w-4 mr-2" /> Marcar Resolvido
                      </DropdownMenuItem>
                    )}
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
