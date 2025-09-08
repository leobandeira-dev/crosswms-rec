
import React, { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import SearchFilter from '@/components/common/SearchFilter';
import { 
  MoreHorizontal, 
  Edit, 
  Package, 
  FileText, 
  Key 
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClienteDetalhesDialog } from './ClienteDetalhesDialog';
import { ClientePacotesDialog } from './ClientePacotesDialog';
import { ClienteDocumentosDialog } from './ClienteDocumentosDialog';
import { ClienteAcessosDialog } from './ClienteAcessosDialog';

// Mock data for demonstration
const mockClientes = [
  { 
    id: '1', 
    razaoSocial: 'Empresa ABC Ltda', 
    nomeFantasia: 'ABC Logística', 
    cnpj: '00.000.000/0001-00', 
    email: 'contato@abclogistica.com.br',
    telefone: '(11) 1234-5678',
    status: 'ativo',
    cidade: 'São Paulo',
    estado: 'SP',
  },
  { 
    id: '2', 
    razaoSocial: 'Distribuidora XYZ S.A.', 
    nomeFantasia: 'XYZ Express', 
    cnpj: '11.111.111/0001-11', 
    email: 'contato@xyzexpress.com.br',
    telefone: '(21) 9876-5432',
    status: 'inativo',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
  },
  { 
    id: '3', 
    razaoSocial: 'Transportes Rápidos Ltda', 
    nomeFantasia: 'Trans-Rápida', 
    cnpj: '22.222.222/0001-22', 
    email: 'atendimento@transrapida.com.br',
    telefone: '(31) 3456-7890',
    status: 'ativo',
    cidade: 'Belo Horizonte',
    estado: 'MG',
  },
];

type ClientesListProps = {
  onEdit: (id: string) => void;
};

export const ClientesList = ({ onEdit }: ClientesListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCliente, setSelectedCliente] = useState<any | null>(null);
  const [showDetalhesDialog, setShowDetalhesDialog] = useState(false);
  const [showPacotesDialog, setShowPacotesDialog] = useState(false);
  const [showDocumentosDialog, setShowDocumentosDialog] = useState(false);
  const [showAcessosDialog, setShowAcessosDialog] = useState(false);

  const filteredClientes = mockClientes.filter(cliente => 
    cliente.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj.includes(searchTerm)
  );

  const handleViewDetails = (cliente: any) => {
    setSelectedCliente(cliente);
    setShowDetalhesDialog(true);
  };

  const handleViewPacotes = (cliente: any) => {
    setSelectedCliente(cliente);
    setShowPacotesDialog(true);
  };

  const handleViewDocumentos = (cliente: any) => {
    setSelectedCliente(cliente);
    setShowDocumentosDialog(true);
  };

  const handleViewAcessos = (cliente: any) => {
    setSelectedCliente(cliente);
    setShowAcessosDialog(true);
  };

  return (
    <>
      <div className="mb-6">
        <Input 
          placeholder="Buscar por nome, fantasia ou CNPJ..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Razão Social</TableHead>
              <TableHead>Nome Fantasia</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClientes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum cliente encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredClientes.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell className="font-medium">{cliente.razaoSocial}</TableCell>
                  <TableCell>{cliente.nomeFantasia}</TableCell>
                  <TableCell>{cliente.cnpj}</TableCell>
                  <TableCell>{cliente.cidade}/{cliente.estado}</TableCell>
                  <TableCell>
                    <Badge variant={cliente.status === 'ativo' ? 'default' : 'secondary'}>
                      {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(cliente)}>
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(cliente.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewPacotes(cliente)}>
                          <Package className="h-4 w-4 mr-2" />
                          Gerenciar Pacotes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDocumentos(cliente)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Documentos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewAcessos(cliente)}>
                          <Key className="h-4 w-4 mr-2" />
                          Gerenciar Acessos
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialogs */}
      <ClienteDetalhesDialog 
        open={showDetalhesDialog} 
        onOpenChange={setShowDetalhesDialog} 
        cliente={selectedCliente} 
      />
      
      <ClientePacotesDialog 
        open={showPacotesDialog} 
        onOpenChange={setShowPacotesDialog} 
        cliente={selectedCliente} 
      />
      
      <ClienteDocumentosDialog 
        open={showDocumentosDialog} 
        onOpenChange={setShowDocumentosDialog} 
        cliente={selectedCliente} 
      />
      
      <ClienteAcessosDialog 
        open={showAcessosDialog} 
        onOpenChange={setShowAcessosDialog} 
        cliente={selectedCliente} 
      />
    </>
  );
};
