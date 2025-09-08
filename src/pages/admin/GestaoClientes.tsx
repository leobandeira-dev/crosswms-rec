import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Building, 
  TrendingUp, 
  AlertCircle,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  UserPlus,
  FileSpreadsheet
} from 'lucide-react';

const GestaoClientes = () => {
  const [activeTab, setActiveTab] = useState('ativos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const clientesAtivos = [
    {
      id: '1',
      nome: 'Indústria ABC S.A.',
      cnpj: '11.222.333/0001-44',
      email: 'logistica@industriaabc.com',
      telefone: '(11) 3456-7890',
      cidade: 'São Paulo',
      estado: 'SP',
      operador: 'TRANSUL Logística',
      ultimoPedido: '2024-01-25',
      valorMensal: 15600.00,
      status: 'ativo',
      risco: 'baixo'
    },
    {
      id: '2',
      nome: 'Comércio XYZ Ltda',
      cnpj: '44.555.666/0001-77',
      email: 'compras@comercioxyz.com',
      telefone: '(21) 2345-6789',
      cidade: 'Rio de Janeiro',
      estado: 'RJ',
      operador: 'LogiMax Transportes',
      ultimoPedido: '2024-01-23',
      valorMensal: 8900.00,
      status: 'ativo',
      risco: 'baixo'
    },
    {
      id: '3',
      nome: 'Distribuidora Central',
      cnpj: '77.888.999/0001-11',
      email: 'operacoes@distcentral.com',
      telefone: '(31) 3789-0123',
      cidade: 'Belo Horizonte',
      estado: 'MG',
      operador: 'TRANSUL Logística',
      ultimoPedido: '2024-01-20',
      valorMensal: 22400.00,
      status: 'ativo',
      risco: 'medio'
    }
  ];

  const clientesInativos = [
    {
      id: '4',
      nome: 'Empresa Beta Ltda',
      cnpj: '12.345.678/0001-99',
      email: 'contato@beta.com',
      telefone: '(41) 3456-7890',
      cidade: 'Curitiba',
      estado: 'PR',
      operador: 'LogiMax Transportes',
      ultimoPedido: '2023-12-15',
      valorMensal: 0.00,
      status: 'inativo',
      risco: 'alto',
      motivoInativacao: 'Inadimplência'
    }
  ];

  const clientesPotenciais = [
    {
      id: '5',
      nome: 'Nova Empresa Ltda',
      cnpj: '98.765.432/0001-55',
      email: 'comercial@novaempresa.com',
      telefone: '(51) 2345-6789',
      cidade: 'Porto Alegre',
      estado: 'RS',
      contato: 'Maria Silva',
      interesse: 'Logística Completa',
      valorEstimado: 18000.00,
      fase: 'negociacao'
    }
  ];

  const getRiscoColor = (risco: string) => {
    switch (risco) {
      case 'baixo':
        return 'bg-green-100 text-green-800';
      case 'medio':
        return 'bg-yellow-100 text-yellow-800';
      case 'alto':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'inativo':
        return 'bg-red-100 text-red-800';
      case 'negociacao':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewClient = (cliente: any) => {
    setSelectedClient(cliente);
    setIsViewModalOpen(true);
  };

  const handleEditClient = (cliente: any) => {
    setSelectedClient(cliente);
    setIsEditModalOpen(true);
  };

  const handleReactivateClient = (clienteId: string) => {
    toast({
      title: "Cliente Reativado",
      description: "Cliente foi reativado com sucesso.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Exportação Iniciada",
      description: "O arquivo será baixado em instantes.",
    });
  };

  const handleConvertProspect = (prospectId: string) => {
    toast({
      title: "Prospect Convertido",
      description: "Prospect foi convertido para cliente ativo.",
    });
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            Gestão de Clientes
          </h1>
          <p className="text-gray-600">
            Visão completa da base de clientes - Ativos, inativos e prospects
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clientes Ativos</p>
                  <p className="text-2xl font-bold text-green-600">1,247</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Receita Mensal</p>
                  <p className="text-2xl font-bold text-blue-600">R$ 847K</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Prospects</p>
                  <p className="text-2xl font-bold text-orange-600">89</p>
                </div>
                <Building className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa Retenção</p>
                  <p className="text-2xl font-bold text-purple-600">94.2%</p>
                </div>
                <AlertCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Como Super Usuário, você visualiza todos os clientes de todos os operadores sem restrições.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ativos">Clientes Ativos</TabsTrigger>
            <TabsTrigger value="inativos">Clientes Inativos</TabsTrigger>
            <TabsTrigger value="prospects">Prospects</TabsTrigger>
          </TabsList>

          <TabsContent value="ativos" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Clientes Ativos</CardTitle>
                    <CardDescription>
                      Base ativa de clientes com pedidos recentes
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="alto-valor">Alto Valor</SelectItem>
                        <SelectItem value="risco">Com Risco</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Buscar clientes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Button variant="outline" onClick={handleExportData}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Último Pedido</TableHead>
                      <TableHead>Valor Mensal</TableHead>
                      <TableHead>Risco</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientesAtivos
                      .filter(item => 
                        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.cnpj.includes(searchTerm)
                      )
                      .map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cliente.nome}</p>
                            <p className="text-sm text-gray-600">{cliente.cnpj}</p>
                          </div>
                        </TableCell>
                        <TableCell>{cliente.operador}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">{cliente.cidade}, {cliente.estado}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3 text-gray-400" />
                              <span>{cliente.email}</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              <span>{cliente.telefone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{cliente.ultimoPedido}</TableCell>
                        <TableCell className="font-medium">
                          R$ {cliente.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge className={getRiscoColor(cliente.risco)}>
                            {cliente.risco}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleViewClient(cliente)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditClient(cliente)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inativos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Clientes Inativos</CardTitle>
                <CardDescription>
                  Clientes que pararam de operar ou foram desativados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Último Pedido</TableHead>
                      <TableHead>Motivo Inativação</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientesInativos.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cliente.nome}</p>
                            <p className="text-sm text-gray-600">{cliente.cnpj}</p>
                          </div>
                        </TableCell>
                        <TableCell>{cliente.operador}</TableCell>
                        <TableCell>{cliente.ultimoPedido}</TableCell>
                        <TableCell>{cliente.motivoInativacao}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(cliente.status)}>
                            {cliente.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleViewClient(cliente)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="default" onClick={() => handleReactivateClient(cliente.id)}>
                              Reativar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prospects" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Prospects e Oportunidades</CardTitle>
                <CardDescription>
                  Clientes potenciais em processo de negociação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Interesse</TableHead>
                      <TableHead>Valor Estimado</TableHead>
                      <TableHead>Fase</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientesPotenciais.map((prospect) => (
                      <TableRow key={prospect.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{prospect.nome}</p>
                            <p className="text-sm text-gray-600">{prospect.cnpj}</p>
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{prospect.cidade}, {prospect.estado}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{prospect.contato}</p>
                            <p className="text-sm text-gray-600">{prospect.email}</p>
                            <p className="text-sm text-gray-600">{prospect.telefone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{prospect.interesse}</TableCell>
                        <TableCell className="font-medium">
                          R$ {prospect.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(prospect.fase)}>
                            {prospect.fase}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleEditClient(prospect)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="default" onClick={() => handleConvertProspect(prospect.id)}>
                              Converter
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* View Client Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Cliente</DialogTitle>
              <DialogDescription>
                Informações completas do cliente selecionado
              </DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Nome da Empresa</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedClient?.nome}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">CNPJ</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedClient?.cnpj}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">E-mail</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedClient?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telefone</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedClient?.telefone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Cidade</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedClient?.cidade}, {selectedClient?.estado}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Operador</Label>
                  <p className="text-sm text-gray-600 mt-1">{selectedClient?.operador}</p>
                </div>
                {selectedClient?.valorMensal && (
                  <div>
                    <Label className="text-sm font-medium">Valor Mensal</Label>
                    <p className="text-sm text-gray-600 mt-1">
                      R$ {selectedClient.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
                {selectedClient?.ultimoPedido && (
                  <div>
                    <Label className="text-sm font-medium">Último Pedido</Label>
                    <p className="text-sm text-gray-600 mt-1">{selectedClient.ultimoPedido}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Client Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
              <DialogDescription>
                Atualizar informações do cliente
              </DialogDescription>
            </DialogHeader>
            {selectedClient && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-nome">Nome da Empresa</Label>
                  <Input id="edit-nome" defaultValue={selectedClient?.nome} />
                </div>
                <div>
                  <Label htmlFor="edit-cnpj">CNPJ</Label>
                  <Input id="edit-cnpj" defaultValue={selectedClient?.cnpj} />
                </div>
                <div>
                  <Label htmlFor="edit-email">E-mail</Label>
                  <Input id="edit-email" type="email" defaultValue={selectedClient?.email} />
                </div>
                <div>
                  <Label htmlFor="edit-telefone">Telefone</Label>
                  <Input id="edit-telefone" defaultValue={selectedClient?.telefone} />
                </div>
                <div>
                  <Label htmlFor="edit-cidade">Cidade</Label>
                  <Input id="edit-cidade" defaultValue={selectedClient?.cidade} />
                </div>
                <div>
                  <Label htmlFor="edit-estado">Estado</Label>
                  <Input id="edit-estado" defaultValue={selectedClient?.estado} />
                </div>
                <div className="col-span-2 flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => {
                    toast({
                      title: "Cliente Atualizado",
                      description: "As informações do cliente foram atualizadas com sucesso.",
                    });
                    setIsEditModalOpen(false);
                  }}>
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default GestaoClientes;