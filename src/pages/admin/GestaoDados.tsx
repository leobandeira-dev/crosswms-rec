import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Database, 
  Users, 
  Building, 
  Truck, 
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Plus,
  Shield,
  Settings
} from 'lucide-react';

const GestaoDados = () => {
  const [activeTab, setActiveTab] = useState('operadores');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const operadoresData = [
    {
      id: '1',
      nome: 'TRANSUL Logística',
      cnpj: '12.345.678/0001-90',
      email: 'contato@transul.com',
      status: 'ativo',
      funcionarios: 45,
      filiais: 8
    },
    {
      id: '2',
      nome: 'LogiMax Transportes',
      cnpj: '98.765.432/0001-10',
      email: 'admin@logimax.com',
      status: 'ativo',
      funcionarios: 23,
      filiais: 3
    }
  ];

  const clientesData = [
    {
      id: '1',
      nome: 'Indústria ABC S.A.',
      cnpj: '11.222.333/0001-44',
      email: 'logistica@industriaabc.com',
      status: 'ativo',
      ultimoPedido: '2024-01-25',
      valorMensal: 15600.00
    },
    {
      id: '2',
      nome: 'Comércio XYZ Ltda',
      cnpj: '44.555.666/0001-77',
      email: 'compras@comercioxyz.com',
      status: 'ativo',
      ultimoPedido: '2024-01-23',
      valorMensal: 8900.00
    }
  ];

  const fornecedoresData = [
    {
      id: '1',
      nome: 'Combustíveis Petromax',
      cnpj: '77.888.999/0001-11',
      email: 'vendas@petromax.com',
      categoria: 'Combustível',
      status: 'ativo',
      valorMensal: 12400.00
    },
    {
      id: '2',
      nome: 'Peças Auto Center',
      cnpj: '22.333.444/0001-55',
      email: 'comercial@autocenter.com',
      categoria: 'Peças',
      status: 'ativo',
      valorMensal: 3200.00
    }
  ];

  const handleEditOperador = (operadorId: string) => {
    toast({
      title: "Editar Operador",
      description: `Editando dados do operador ${operadorId}`,
    });
  };

  const handleManagePermissions = (operadorId: string) => {
    toast({
      title: "Gerenciar Permissões",
      description: `Abrindo configurações de permissões para operador ${operadorId}`,
    });
  };

  const handleExportData = () => {
    toast({
      title: "Exportando Dados",
      description: "O relatório será baixado em instantes",
    });
  };

  const handleFilterData = () => {
    toast({
      title: "Filtro Aplicado",
      description: "Filtros de pesquisa foram aplicados",
    });
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Database className="h-8 w-8 text-blue-600" />
            Gestão de Dados
          </h1>
          <p className="text-gray-600">
            Operadores, clientes, fornecedores e cadastros mestres - Visão completa do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Operadores</p>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Clientes</p>
                  <p className="text-2xl font-bold text-green-600">1,248</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Fornecedores</p>
                  <p className="text-2xl font-bold text-orange-600">387</p>
                </div>
                <Truck className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Registros Ativos</p>
                  <p className="text-2xl font-bold text-purple-600">98.2%</p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Como Super Usuário, você tem acesso completo a todos os dados sem restrições por CNPJ.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="operadores">Operadores</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
            <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
            <TabsTrigger value="cadastros">Cadastros Mestres</TabsTrigger>
          </TabsList>

          <TabsContent value="operadores" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Operadores do Sistema</CardTitle>
                    <CardDescription>
                      Gestão completa de empresas operadoras e suas configurações
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar operadores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Operador
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Funcionários</TableHead>
                      <TableHead>Filiais</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operadoresData.map((operador) => (
                      <TableRow key={operador.id}>
                        <TableCell className="font-medium">{operador.nome}</TableCell>
                        <TableCell>{operador.cnpj}</TableCell>
                        <TableCell>{operador.email}</TableCell>
                        <TableCell>{operador.funcionarios}</TableCell>
                        <TableCell>{operador.filiais}</TableCell>
                        <TableCell>
                          <Badge variant={operador.status === 'ativo' ? 'default' : 'secondary'}>
                            {operador.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleEditOperador(operador.id)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleManagePermissions(operador.id)}>
                              <Shield className="h-3 w-3" />
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

          <TabsContent value="clientes" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Clientes do Sistema</CardTitle>
                    <CardDescription>
                      Visualização e gestão de todos os clientes cadastrados
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleFilterData}>
                      <Filter className="h-4 w-4" />
                    </Button>
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
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Último Pedido</TableHead>
                      <TableHead>Valor Mensal</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientesData.map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell className="font-medium">{cliente.nome}</TableCell>
                        <TableCell>{cliente.cnpj}</TableCell>
                        <TableCell>{cliente.email}</TableCell>
                        <TableCell>{cliente.ultimoPedido}</TableCell>
                        <TableCell>
                          R$ {cliente.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{cliente.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fornecedores" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Fornecedores do Sistema</CardTitle>
                <CardDescription>
                  Gestão completa de fornecedores e prestadores de serviço
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Valor Mensal</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fornecedoresData.map((fornecedor) => (
                      <TableRow key={fornecedor.id}>
                        <TableCell className="font-medium">{fornecedor.nome}</TableCell>
                        <TableCell>{fornecedor.cnpj}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{fornecedor.categoria}</Badge>
                        </TableCell>
                        <TableCell>{fornecedor.email}</TableCell>
                        <TableCell>
                          R$ {fornecedor.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default">{fornecedor.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cadastros" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cadastros Mestres</CardTitle>
                <CardDescription>
                  Configurações e dados fundamentais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { nome: 'Tipos de Veículo', registros: 12, categoria: 'Transporte' },
                    { nome: 'Categorias de Produto', registros: 28, categoria: 'Produtos' },
                    { nome: 'Tipos de Embalagem', registros: 15, categoria: 'Embalagem' },
                    { nome: 'Regiões de Entrega', registros: 47, categoria: 'Geografia' },
                    { nome: 'Tipos de Frete', registros: 8, categoria: 'Financeiro' },
                    { nome: 'Status de Pedido', registros: 18, categoria: 'Workflow' }
                  ].map((cadastro, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">{cadastro.nome}</h4>
                        <p className="text-sm text-gray-600 mb-2">{cadastro.registros} registros</p>
                        <Badge variant="outline" className="text-xs">
                          {cadastro.categoria}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default GestaoDados;