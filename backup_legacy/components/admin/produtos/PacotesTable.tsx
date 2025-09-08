
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
  Copy, 
  Eye,
  Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PacoteModulosDialog } from './PacoteModulosDialog';
import { useState } from 'react';

// Mock data for demonstration
const mockPacotes = [
  {
    id: '1',
    nome: 'Básico',
    descricao: 'Pacote com funcionalidades essenciais',
    preco: 199.00,
    status: 'ativo',
    modulos: ['Coletas', 'SAC'],
    clientesAtivos: 12,
  },
  {
    id: '2',
    nome: 'Standard',
    descricao: 'Pacote intermediário com mais funcionalidades',
    preco: 399.00,
    status: 'ativo',
    modulos: ['Coletas', 'SAC', 'Armazenagem', 'Expedição'],
    clientesAtivos: 28,
  },
  {
    id: '3',
    nome: 'Premium',
    descricao: 'Pacote completo com todas as funcionalidades',
    preco: 799.00,
    status: 'ativo',
    modulos: ['Coletas', 'SAC', 'Armazenagem', 'Expedição', 'Relatórios Avançados'],
    clientesAtivos: 8,
  },
  {
    id: '4',
    nome: 'Promocional',
    descricao: 'Pacote promocional com desconto especial',
    preco: 299.00,
    status: 'inativo',
    modulos: ['Coletas', 'SAC', 'Expedição'],
    clientesAtivos: 0,
  },
];

type PacotesTableProps = {
  searchTerm: string;
  onEdit: (id: string) => void;
};

export const PacotesTable = ({ searchTerm, onEdit }: PacotesTableProps) => {
  const [selectedPacote, setSelectedPacote] = useState<any | null>(null);
  const [showModulosDialog, setShowModulosDialog] = useState(false);

  // Filter based on search term
  const filteredPacotes = mockPacotes.filter(pacote =>
    pacote.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pacote.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDuplicar = (pacote: any) => {
    toast({
      title: "Pacote duplicado",
      description: `O pacote ${pacote.nome} foi duplicado com sucesso.`,
    });
  };

  const handleVerModulos = (pacote: any) => {
    setSelectedPacote(pacote);
    setShowModulosDialog(true);
  };

  const handleVerClientes = (pacote: any) => {
    toast({
      title: "Clientes com este pacote",
      description: `Visualizando clientes que utilizam o pacote ${pacote.nome}.`,
    });
  };

  const handleToggleStatus = (pacote: any) => {
    const newStatus = pacote.status === 'ativo' ? 'inativo' : 'ativo';
    toast({
      title: `Pacote ${newStatus === 'ativo' ? 'ativado' : 'desativado'}`,
      description: `O pacote ${pacote.nome} foi ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge variant="default" className="bg-green-600">Ativo</Badge>;
      case 'inativo':
        return <Badge variant="secondary">Inativo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Módulos</TableHead>
            <TableHead>Clientes Ativos</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPacotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Nenhum pacote encontrado.
              </TableCell>
            </TableRow>
          ) : (
            filteredPacotes.map((pacote) => (
              <TableRow key={pacote.id}>
                <TableCell className="font-medium">{pacote.nome}</TableCell>
                <TableCell>{pacote.descricao}</TableCell>
                <TableCell>R$ {pacote.preco.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="cursor-pointer hover:bg-secondary" onClick={() => handleVerModulos(pacote)}>
                    {pacote.modulos.length} módulos
                  </Badge>
                </TableCell>
                <TableCell>{pacote.clientesAtivos}</TableCell>
                <TableCell>{getStatusBadge(pacote.status)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(pacote.id)}>
                        <Edit className="h-4 w-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicar(pacote)}>
                        <Copy className="h-4 w-4 mr-2" /> Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleVerModulos(pacote)}>
                        <Eye className="h-4 w-4 mr-2" /> Ver Módulos
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleVerClientes(pacote)}>
                        <Users className="h-4 w-4 mr-2" /> Ver Clientes
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(pacote)}>
                        {pacote.status === 'ativo' ? (
                          <>
                            <span className="h-4 w-4 mr-2">🔴</span> Desativar
                          </>
                        ) : (
                          <>
                            <span className="h-4 w-4 mr-2">🟢</span> Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Dialog to view modules */}
      <PacoteModulosDialog
        open={showModulosDialog}
        onOpenChange={setShowModulosDialog}
        pacote={selectedPacote}
      />
    </>
  );
};
