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
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Calendar,
  CreditCard,
  FileText,
  Clock
} from 'lucide-react';
import { Link } from 'wouter';

const FinanceiroDashboard = () => {
  const [activeTab, setActiveTab] = useState('recebimentos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('mes');

  const recebimentosData = [
    {
      id: '1',
      operador: 'TRANSUL Logística',
      cnpj: '12.345.678/0001-90',
      cliente: 'Indústria ABC S.A.',
      valor: 15600.00,
      dataVencimento: '2024-01-30',
      dataPagamento: '2024-01-26',
      status: 'pago',
      tipo: 'Armazenagem',
      nf: 'NF-2024-001'
    },
    {
      id: '2',
      operador: 'LogiMax Transportes',
      cnpj: '98.765.432/0001-10',
      cliente: 'Comércio XYZ Ltda',
      valor: 8900.00,
      dataVencimento: '2024-02-05',
      dataPagamento: null,
      status: 'pendente',
      tipo: 'Transporte',
      nf: 'NF-2024-002'
    },
    {
      id: '3',
      operador: 'Express Cargo',
      cnpj: '55.666.777/0001-88',
      cliente: 'Distribuidora Sul',
      valor: 5400.00,
      dataVencimento: '2024-01-20',
      dataPagamento: null,
      status: 'vencido',
      tipo: 'Expedição',
      nf: 'NF-2024-003'
    },
    {
      id: '4',
      operador: 'TRANSUL Logística',
      cnpj: '12.345.678/0001-90',
      cliente: 'Metalúrgica Norte',
      valor: 22400.00,
      dataVencimento: '2024-02-10',
      dataPagamento: null,
      status: 'pendente',
      tipo: 'Armazenagem Completa',
      nf: 'NF-2024-004'
    }
  ];

  const notasFiscaisData = [
    {
      id: '1',
      numero: 'NFS-2024-001',
      operador: 'TRANSUL Logística',
      cliente: 'Indústria ABC S.A.',
      servico: 'Armazenagem e Movimentação',
      valor: 15600.00,
      impostos: 2340.00,
      dataEmissao: '2024-01-26',
      dataVencimento: '2024-02-25',
      status: 'emitida'
    },
    {
      id: '2',
      numero: 'NFS-2024-002',
      operador: 'LogiMax Transportes',
      cliente: 'Comércio XYZ Ltda',
      servico: 'Transporte Rodoviário',
      valor: 8900.00,
      impostos: 1335.00,
      dataEmissao: '2024-01-25',
      dataVencimento: '2024-02-24',
      status: 'emitida'
    },
    {
      id: '3',
      numero: 'NFS-2024-003',
      operador: 'Express Cargo',
      cliente: 'Distribuidora Sul',
      servico: 'Serviços de Expedição',
      valor: 5400.00,
      impostos: 810.00,
      dataEmissao: '2024-01-24',
      dataVencimento: '2024-02-23',
      status: 'pendente'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago':
      case 'emitida':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'vencido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRecebido = recebimentosData
    .filter(item => item.status === 'pago')
    .reduce((sum, item) => sum + item.valor, 0);

  const totalPendente = recebimentosData
    .filter(item => item.status === 'pendente')
    .reduce((sum, item) => sum + item.valor, 0);

  const totalVencido = recebimentosData
    .filter(item => item.status === 'vencido')
    .reduce((sum, item) => sum + item.valor, 0);

  const totalNFS = notasFiscaisData.reduce((sum, item) => sum + item.valor, 0);

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                Financeiro
              </h1>
              <p className="text-gray-600">
                Gestão financeira completa - Recebimentos e notas fiscais de todos os operadores
              </p>
            </div>
            <Badge variant="destructive" className="text-sm">
              Super Usuário
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Recebido</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {totalRecebido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">A Receber</p>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vencidos</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {totalVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">NFS Emitidas</p>
                  <p className="text-2xl font-bold text-purple-600">
                    R$ {totalNFS.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6">
          <DollarSign className="h-4 w-4" />
          <AlertDescription>
            Visão financeira consolidada de todos os operadores logísticos sem restrições por CNPJ.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recebimentos">Recebimentos</TabsTrigger>
            <TabsTrigger value="notas-fiscais">Notas Fiscais</TabsTrigger>
          </TabsList>

          <TabsContent value="recebimentos" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestão de Recebimentos</CardTitle>
                    <CardDescription>
                      Controle de pagamentos e recebíveis de todos os operadores
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semana">Esta Semana</SelectItem>
                        <SelectItem value="mes">Este Mês</SelectItem>
                        <SelectItem value="trimestre">Trimestre</SelectItem>
                        <SelectItem value="ano">Este Ano</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Buscar por operador ou cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Button variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Link href="/admin/financeiro/recebimentos">
                      <Button>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operador</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Tipo Serviço</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Pagamento</TableHead>
                      <TableHead>NF</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recebimentosData
                      .filter(item => 
                        item.operador.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.cliente.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((recebimento) => (
                      <TableRow key={recebimento.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{recebimento.operador}</p>
                            <p className="text-sm text-gray-600">{recebimento.cnpj}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{recebimento.cliente}</TableCell>
                        <TableCell>{recebimento.tipo}</TableCell>
                        <TableCell className="font-medium">
                          R$ {recebimento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {recebimento.dataVencimento}
                        </TableCell>
                        <TableCell>
                          {recebimento.dataPagamento ? (
                            <span className="text-green-600">{recebimento.dataPagamento}</span>
                          ) : (
                            <span className="text-gray-400">Pendente</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{recebimento.nf}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(recebimento.status)}>
                            {recebimento.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notas-fiscais" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Notas Fiscais de Serviço</CardTitle>
                    <CardDescription>
                      Gestão de notas fiscais emitidas por todos os operadores
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar por número ou operador..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Button variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Link href="/admin/financeiro/notas-fiscais">
                      <Button>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Impostos</TableHead>
                      <TableHead>Emissão</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notasFiscaisData
                      .filter(item => 
                        item.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.operador.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((nota) => (
                      <TableRow key={nota.id}>
                        <TableCell className="font-mono font-medium">{nota.numero}</TableCell>
                        <TableCell>{nota.operador}</TableCell>
                        <TableCell>{nota.cliente}</TableCell>
                        <TableCell>{nota.servico}</TableCell>
                        <TableCell className="font-medium">
                          R$ {nota.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          R$ {nota.impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {nota.dataEmissao}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(nota.status)}>
                            {nota.status}
                          </Badge>
                        </TableCell>
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

export default FinanceiroDashboard;