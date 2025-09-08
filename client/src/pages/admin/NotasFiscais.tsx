import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Calculator, 
  TrendingUp, 
  AlertCircle,
  Search,
  Download,
  Eye,
  Edit,
  Plus,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  Send
} from 'lucide-react';

const NotasFiscais = () => {
  const [activeTab, setActiveTab] = useState('emitidas');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOperador, setFilterOperador] = useState('todos');
  const [filterPeriod, setFilterPeriod] = useState('mes');

  const notasEmitidas = [
    {
      id: '1',
      numero: 'NFS-2024-001',
      operador: 'TRANSUL Logística',
      cnpjOperador: '12.345.678/0001-90',
      cliente: 'Indústria ABC S.A.',
      cnpjCliente: '11.222.333/0001-44',
      servico: 'Armazenagem e Movimentação de Cargas',
      valorServicos: 15600.00,
      impostos: 2340.00,
      valorTotal: 17940.00,
      dataEmissao: '2024-01-26',
      dataVencimento: '2024-02-25',
      status: 'emitida',
      chaveAcesso: '35240112345678000190550010000000011234567890',
      observacoes: 'Serviços prestados conforme contrato'
    },
    {
      id: '2',
      numero: 'NFS-2024-002',
      operador: 'LogiMax Transportes',
      cnpjOperador: '98.765.432/0001-10',
      cliente: 'Comércio XYZ Ltda',
      cnpjCliente: '44.555.666/0001-77',
      servico: 'Transporte Rodoviário de Cargas',
      valorServicos: 8900.00,
      impostos: 1335.00,
      valorTotal: 10235.00,
      dataEmissao: '2024-01-25',
      dataVencimento: '2024-02-24',
      status: 'emitida',
      chaveAcesso: '35240198765432000110550010000000021234567891',
      observacoes: ''
    },
    {
      id: '3',
      numero: 'NFS-2024-003',
      operador: 'Express Cargo',
      cnpjOperador: '55.666.777/0001-88',
      cliente: 'Distribuidora Sul',
      cnpjCliente: '22.333.444/0001-55',
      servico: 'Serviços de Expedição e Consolidação',
      valorServicos: 5400.00,
      impostos: 810.00,
      valorTotal: 6210.00,
      dataEmissao: '2024-01-24',
      dataVencimento: '2024-02-23',
      status: 'emitida',
      chaveAcesso: '35240155666777000188550010000000031234567892',
      observacoes: 'Carga consolidada em 3 entregas'
    }
  ];

  const notasPendentes = [
    {
      id: '4',
      operador: 'TRANSUL Logística',
      cnpjOperador: '12.345.678/0001-90',
      cliente: 'Metalúrgica Norte Ltda',
      cnpjCliente: '11.222.333/0001-44',
      servico: 'Armazenagem de Produtos Siderúrgicos',
      valorServicos: 22400.00,
      impostos: 3360.00,
      valorTotal: 25760.00,
      periodo: 'Janeiro/2024',
      observacoes: 'Aguardando finalização do período',
      diasPendente: 2
    },
    {
      id: '5',
      operador: 'Express Cargo',
      cnpjOperador: '55.666.777/0001-88',
      cliente: 'Farmácia Nacional',
      cnpjCliente: '99.888.777/0001-22',
      servico: 'Transporte de Medicamentos Controlados',
      valorServicos: 9800.00,
      impostos: 1470.00,
      valorTotal: 11270.00,
      periodo: 'Janeiro/2024',
      observacoes: 'Aguardando documentação adicional',
      diasPendente: 5
    }
  ];

  const notasCanceladas = [
    {
      id: '6',
      numero: 'NFS-2024-004',
      operador: 'LogiMax Transportes',
      cnpjOperador: '98.765.432/0001-10',
      cliente: 'Atacado Central',
      cnpjCliente: '33.444.555/0001-66',
      servico: 'Transporte Interestadual',
      valorServicos: 7200.00,
      impostos: 1080.00,
      valorTotal: 8280.00,
      dataEmissao: '2024-01-20',
      dataCancelamento: '2024-01-22',
      motivoCancelamento: 'Erro nos dados do cliente',
      status: 'cancelada'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'emitida':
        return 'bg-green-100 text-green-800';
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPendenciaColor = (dias: number) => {
    if (dias <= 2) return 'bg-yellow-100 text-yellow-800';
    if (dias <= 5) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const totalEmitidas = notasEmitidas.reduce((sum, item) => sum + item.valorTotal, 0);
  const totalPendentes = notasPendentes.reduce((sum, item) => sum + item.valorTotal, 0);
  const totalImpostos = notasEmitidas.reduce((sum, item) => sum + item.impostos, 0);

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <FileText className="h-8 w-8 text-purple-600" />
            Gestão de Notas Fiscais
          </h1>
          <p className="text-gray-600">
            Controle completo de notas fiscais de serviço de todos os operadores
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">NFS Emitidas</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {totalEmitidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    R$ {totalPendentes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Impostos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {totalImpostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Quantidade (Mês)</p>
                  <p className="text-2xl font-bold text-purple-600">{notasEmitidas.length + notasPendentes.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6">
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Gestão consolidada de notas fiscais de serviço de todos os operadores com controle de impostos e vencimentos.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="emitidas">Emitidas ({notasEmitidas.length})</TabsTrigger>
            <TabsTrigger value="pendentes">Pendentes ({notasPendentes.length})</TabsTrigger>
            <TabsTrigger value="canceladas">Canceladas ({notasCanceladas.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="emitidas" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Notas Fiscais Emitidas</CardTitle>
                    <CardDescription>
                      NFS já emitidas e válidas no sistema
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterOperador} onValueChange={setFilterOperador}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por operador" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos Operadores</SelectItem>
                        <SelectItem value="transul">TRANSUL Logística</SelectItem>
                        <SelectItem value="logimax">LogiMax Transportes</SelectItem>
                        <SelectItem value="express">Express Cargo</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Buscar por número ou cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
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
                      <TableHead>Número</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Valor Serviços</TableHead>
                      <TableHead>Impostos</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Emissão</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notasEmitidas
                      .filter(nota => 
                        (nota.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nota.cliente.toLowerCase().includes(searchTerm.toLowerCase())) &&
                        (filterOperador === 'todos' || nota.operador.toLowerCase().includes(filterOperador))
                      )
                      .map((nota) => (
                      <TableRow key={nota.id}>
                        <TableCell className="font-mono font-medium">{nota.numero}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{nota.operador}</p>
                            <p className="text-sm text-gray-600">{nota.cnpjOperador}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{nota.cliente}</p>
                            <p className="text-sm text-gray-600">{nota.cnpjCliente}</p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate">{nota.servico}</p>
                          {nota.observacoes && (
                            <p className="text-xs text-gray-500 mt-1">{nota.observacoes}</p>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {nota.valorServicos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          R$ {nota.impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="font-bold">
                          R$ {nota.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {nota.dataEmissao}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-3 w-3" />
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

          <TabsContent value="pendentes" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-yellow-600">Notas Fiscais Pendentes</CardTitle>
                    <CardDescription>
                      NFS aguardando emissão ou documentação
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova NFS
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Operador</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Período</TableHead>
                      <TableHead>Dias Pendente</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notasPendentes.map((nota) => (
                      <TableRow key={nota.id} className="bg-yellow-50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{nota.operador}</p>
                            <p className="text-sm text-gray-600">{nota.cnpjOperador}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{nota.cliente}</p>
                            <p className="text-sm text-gray-600">{nota.cnpjCliente}</p>
                          </div>
                        </TableCell>
                        <TableCell>{nota.servico}</TableCell>
                        <TableCell className="font-medium text-yellow-600">
                          R$ {nota.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>{nota.periodo}</TableCell>
                        <TableCell>
                          <Badge className={getPendenciaColor(nota.diasPendente)}>
                            {nota.diasPendente} dias
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-orange-600">{nota.observacoes}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="default">
                              <Send className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
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

          <TabsContent value="canceladas" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Notas Fiscais Canceladas</CardTitle>
                <CardDescription>
                  Histórico de NFS canceladas com motivos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Data Emissão</TableHead>
                      <TableHead>Data Cancelamento</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notasCanceladas.map((nota) => (
                      <TableRow key={nota.id} className="bg-red-50">
                        <TableCell className="font-mono font-medium">{nota.numero}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{nota.operador}</p>
                            <p className="text-sm text-gray-600">{nota.cnpjOperador}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{nota.cliente}</p>
                            <p className="text-sm text-gray-600">{nota.cnpjCliente}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-red-600">
                          R$ {nota.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>{nota.dataEmissao}</TableCell>
                        <TableCell>{nota.dataCancelamento}</TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-red-600">{nota.motivoCancelamento}</p>
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

export default NotasFiscais;