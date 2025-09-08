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
import { 
  Eye, 
  BarChart3, 
  Building, 
  Package,
  Search,
  Filter,
  Download,
  MapPin,
  Truck,
  Users,
  DollarSign
} from 'lucide-react';

const VisualizacaoAmpla = () => {
  const [activeTab, setActiveTab] = useState('visao-geral');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOperador, setFilterOperador] = useState('todos');

  const dadosOperadores = [
    {
      id: '1',
      nome: 'TRANSUL Logística',
      cnpj: '12.345.678/0001-90',
      clientes: 428,
      pedidosAtivos: 156,
      faturamentoMensal: 247800.00,
      veiculos: 45,
      funcionarios: 89,
      filiais: 8,
      status: 'ativo'
    },
    {
      id: '2',
      nome: 'LogiMax Transportes',
      cnpj: '98.765.432/0001-10',
      clientes: 187,
      pedidosAtivos: 73,
      faturamentoMensal: 128900.00,
      veiculos: 23,
      funcionarios: 34,
      filiais: 3,
      status: 'ativo'
    },
    {
      id: '3',
      nome: 'Express Cargo',
      cnpj: '55.666.777/0001-88',
      clientes: 92,
      pedidosAtivos: 28,
      faturamentoMensal: 67200.00,
      veiculos: 12,
      funcionarios: 18,
      filiais: 2,
      status: 'ativo'
    }
  ];

  const resumoGeral = {
    totalOperadores: 12,
    totalClientes: 1247,
    totalFaturamento: 847600.00,
    totalVeiculos: 189,
    totalFuncionarios: 456,
    pedidosAtivos: 892,
    notasFiscais: 2847,
    armazensAtivos: 28
  };

  const movimentacaoRecente = [
    {
      id: '1',
      tipo: 'Entrada',
      operador: 'TRANSUL Logística',
      cliente: 'Indústria ABC',
      produto: 'Químicos Diversos',
      quantidade: '2.5 ton',
      valor: 15600.00,
      timestamp: '2024-01-26 14:30'
    },
    {
      id: '2',
      tipo: 'Saída',
      operador: 'LogiMax Transportes',
      cliente: 'Comércio XYZ',
      produto: 'Produtos Acabados',
      quantidade: '1.8 ton',
      valor: 8900.00,
      timestamp: '2024-01-26 14:15'
    },
    {
      id: '3',
      tipo: 'Transferência',
      operador: 'Express Cargo',
      cliente: 'Distribuidora Sul',
      produto: 'Materiais Diversos',
      quantidade: '3.2 ton',
      valor: 12400.00,
      timestamp: '2024-01-26 14:00'
    }
  ];

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Entrada':
        return 'bg-green-100 text-green-800';
      case 'Saída':
        return 'bg-red-100 text-red-800';
      case 'Transferência':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Eye className="h-8 w-8 text-indigo-600" />
            Visualização Ampla
          </h1>
          <p className="text-gray-600">
            Visão global sem restrições - Todos os operadores, clientes e movimentações
          </p>
        </div>

        <Alert className="mb-6 border-indigo-200 bg-indigo-50">
          <Eye className="h-4 w-4 text-indigo-600" />
          <AlertDescription className="text-indigo-800">
            Como Super Usuário, você tem acesso irrestrito a todos os dados do sistema, independente do CNPJ.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="operadores">Por Operador</TabsTrigger>
            <TabsTrigger value="movimentacao">Movimentação</TabsTrigger>
          </TabsList>

          <TabsContent value="visao-geral" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Operadores</p>
                      <p className="text-2xl font-bold text-blue-600">{resumoGeral.totalOperadores}</p>
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
                      <p className="text-2xl font-bold text-green-600">{resumoGeral.totalClientes.toLocaleString()}</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Faturamento Total</p>
                      <p className="text-2xl font-bold text-purple-600">
                        R$ {(resumoGeral.totalFaturamento / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Veículos</p>
                      <p className="text-2xl font-bold text-orange-600">{resumoGeral.totalVeiculos}</p>
                    </div>
                    <Truck className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas Operacionais</CardTitle>
                  <CardDescription>Indicadores chave de toda a rede</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Pedidos Ativos</span>
                      <Badge variant="outline">{resumoGeral.pedidosAtivos}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Notas Fiscais (Mês)</span>
                      <Badge variant="outline">{resumoGeral.notasFiscais}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Armazéns Ativos</span>
                      <Badge variant="outline">{resumoGeral.armazensAtivos}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Total Funcionários</span>
                      <Badge variant="outline">{resumoGeral.totalFuncionarios}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribuição Regional</CardTitle>
                  <CardDescription>Presença por estado</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { estado: 'São Paulo', operadores: 8, clientes: 487 },
                      { estado: 'Rio de Janeiro', operadores: 6, clientes: 298 },
                      { estado: 'Minas Gerais', operadores: 4, clientes: 201 },
                      { estado: 'Rio Grande do Sul', operadores: 3, clientes: 156 }
                    ].map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{item.estado}</span>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{item.operadores} ops</Badge>
                          <Badge variant="outline">{item.clientes} cli</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="operadores" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Dados por Operador</CardTitle>
                    <CardDescription>
                      Análise detalhada de cada operador logístico
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterOperador} onValueChange={setFilterOperador}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="alto-volume">Alto Volume</SelectItem>
                        <SelectItem value="novos">Novos</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operador</TableHead>
                      <TableHead>Clientes</TableHead>
                      <TableHead>Pedidos Ativos</TableHead>
                      <TableHead>Faturamento Mensal</TableHead>
                      <TableHead>Frota</TableHead>
                      <TableHead>Funcionários</TableHead>
                      <TableHead>Filiais</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosOperadores.map((operador) => (
                      <TableRow key={operador.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{operador.nome}</p>
                            <p className="text-sm text-gray-600">{operador.cnpj}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{operador.clientes}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{operador.pedidosAtivos}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {operador.faturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center">{operador.veiculos}</TableCell>
                        <TableCell className="text-center">{operador.funcionarios}</TableCell>
                        <TableCell className="text-center">{operador.filiais}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movimentacao" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Movimentação Recente</CardTitle>
                <CardDescription>
                  Últimas movimentações de todos os operadores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentacaoRecente.map((movimento) => (
                      <TableRow key={movimento.id}>
                        <TableCell>
                          <Badge className={getTipoColor(movimento.tipo)}>
                            {movimento.tipo}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{movimento.operador}</TableCell>
                        <TableCell>{movimento.cliente}</TableCell>
                        <TableCell>{movimento.produto}</TableCell>
                        <TableCell>{movimento.quantidade}</TableCell>
                        <TableCell className="font-medium">
                          R$ {movimento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{movimento.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default VisualizacaoAmpla;