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
  CreditCard, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CheckCircle
} from 'lucide-react';

const Recebimentos = () => {
  const [activeTab, setActiveTab] = useState('pendentes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOperador, setFilterOperador] = useState('todos');
  const [filterStatus, setFilterStatus] = useState('todos');

  const recebimentosPendentes = [
    {
      id: '1',
      operador: 'TRANSUL Logística',
      cnpj: '12.345.678/0001-90',
      cliente: 'Metalúrgica Norte Ltda',
      cnpjCliente: '11.222.333/0001-44',
      contato: 'Ana Silva',
      telefone: '(11) 3456-7890',
      email: 'financeiro@metalurgica.com',
      valor: 22400.00,
      dataVencimento: '2024-02-10',
      diasVencimento: 15,
      tipo: 'Armazenagem Completa',
      nf: 'NF-2024-004',
      observacoes: 'Cliente solicitou parcelamento'
    },
    {
      id: '2',
      operador: 'LogiMax Transportes',
      cnpj: '98.765.432/0001-10',
      cliente: 'Comércio XYZ Ltda',
      cnpjCliente: '44.555.666/0001-77',
      contato: 'João Santos',
      telefone: '(21) 2345-6789',
      email: 'compras@comercioxyz.com',
      valor: 8900.00,
      dataVencimento: '2024-02-05',
      diasVencimento: 10,
      tipo: 'Transporte',
      nf: 'NF-2024-002',
      observacoes: ''
    },
    {
      id: '3',
      operador: 'Express Cargo',
      cnpj: '55.666.777/0001-88',
      cliente: 'Indústria Química Sul',
      cnpjCliente: '77.888.999/0001-11',
      contato: 'Maria Costa',
      telefone: '(51) 3789-0123',
      email: 'contas@quimicasul.com',
      valor: 12800.00,
      dataVencimento: '2024-02-08',
      diasVencimento: 13,
      tipo: 'Armazenagem Química',
      nf: 'NF-2024-005',
      observacoes: 'Aguardando aprovação interna'
    }
  ];

  const recebimentosVencidos = [
    {
      id: '4',
      operador: 'Express Cargo',
      cnpj: '55.666.777/0001-88',
      cliente: 'Distribuidora Sul',
      cnpjCliente: '22.333.444/0001-55',
      contato: 'Carlos Lima',
      telefone: '(47) 3456-7890',
      email: 'financeiro@distribuidora.com',
      valor: 5400.00,
      dataVencimento: '2024-01-20',
      diasVencimento: -6,
      tipo: 'Expedição',
      nf: 'NF-2024-003',
      observacoes: 'Cliente em dificuldades financeiras'
    },
    {
      id: '5',
      operador: 'TRANSUL Logística',
      cnpj: '12.345.678/0001-90',
      cliente: 'Atacado Central',
      cnpjCliente: '33.444.555/0001-66',
      contato: 'Roberto Silva',
      telefone: '(31) 2345-6789',
      email: 'pagamentos@atacado.com',
      valor: 18700.00,
      dataVencimento: '2024-01-15',
      diasVencimento: -11,
      tipo: 'Armazenagem',
      nf: 'NF-2024-001',
      observacoes: 'Negociação em andamento'
    }
  ];

  const recebimentosPagos = [
    {
      id: '6',
      operador: 'TRANSUL Logística',
      cnpj: '12.345.678/0001-90',
      cliente: 'Indústria ABC S.A.',
      cnpjCliente: '11.222.333/0001-44',
      valor: 15600.00,
      dataVencimento: '2024-01-30',
      dataPagamento: '2024-01-26',
      tipo: 'Armazenagem',
      nf: 'NF-2024-001',
      formaPagamento: 'PIX'
    },
    {
      id: '7',
      operador: 'LogiMax Transportes',
      cnpj: '98.765.432/0001-10',
      cliente: 'Farmácia Nacional',
      cnpjCliente: '99.888.777/0001-22',
      valor: 9200.00,
      dataVencimento: '2024-01-25',
      dataPagamento: '2024-01-24',
      tipo: 'Transporte Especial',
      nf: 'NF-2024-006',
      formaPagamento: 'Transferência'
    }
  ];

  const getStatusColor = (diasVencimento: number) => {
    if (diasVencimento < 0) return 'bg-red-100 text-red-800';
    if (diasVencimento <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  const getUrgenciaText = (diasVencimento: number) => {
    if (diasVencimento < 0) return `${Math.abs(diasVencimento)} dias em atraso`;
    if (diasVencimento <= 5) return `Vence em ${diasVencimento} dias`;
    return `${diasVencimento} dias`;
  };

  const totalPendente = recebimentosPendentes.reduce((sum, item) => sum + item.valor, 0);
  const totalVencido = recebimentosVencidos.reduce((sum, item) => sum + item.valor, 0);
  const totalPago = recebimentosPagos.reduce((sum, item) => sum + item.valor, 0);

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-green-600" />
            Gestão de Recebimentos
          </h1>
          <p className="text-gray-600">
            Controle detalhado de recebíveis de todos os operadores logísticos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total A Receber</p>
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
                  <p className="text-sm text-gray-600">Em Atraso</p>
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
                  <p className="text-sm text-gray-600">Recebido (Mês)</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                  <p className="text-sm text-gray-600">Taxa Inadimplência</p>
                  <p className="text-2xl font-bold text-orange-600">4.2%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6">
          <CreditCard className="h-4 w-4" />
          <AlertDescription>
            Visualização consolidada dos recebíveis de todos os operadores com controle de vencimentos e inadimplência.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pendentes">A Receber ({recebimentosPendentes.length})</TabsTrigger>
            <TabsTrigger value="vencidos">Vencidos ({recebimentosVencidos.length})</TabsTrigger>
            <TabsTrigger value="pagos">Pagos ({recebimentosPagos.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pendentes" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recebimentos Pendentes</CardTitle>
                    <CardDescription>
                      Valores a receber dentro do prazo de vencimento
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
                      placeholder="Buscar cliente..."
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
                      <TableHead>Cliente</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Urgência</TableHead>
                      <TableHead>Tipo Serviço</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recebimentosPendentes
                      .filter(item => 
                        item.cliente.toLowerCase().includes(searchTerm.toLowerCase()) &&
                        (filterOperador === 'todos' || item.operador.toLowerCase().includes(filterOperador))
                      )
                      .map((recebimento) => (
                      <TableRow key={recebimento.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{recebimento.cliente}</p>
                            <p className="text-sm text-gray-600">{recebimento.cnpjCliente}</p>
                            {recebimento.observacoes && (
                              <p className="text-xs text-orange-600 mt-1">{recebimento.observacoes}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{recebimento.operador}</p>
                            <p className="text-sm text-gray-600">{recebimento.cnpj}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{recebimento.contato}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span>{recebimento.telefone}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <Mail className="h-3 w-3" />
                              <span>{recebimento.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          R$ {recebimento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {recebimento.dataVencimento}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(recebimento.diasVencimento)}>
                            {getUrgenciaText(recebimento.diasVencimento)}
                          </Badge>
                        </TableCell>
                        <TableCell>{recebimento.tipo}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="default">
                              Cobrar
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

          <TabsContent value="vencidos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Recebimentos Vencidos</CardTitle>
                <CardDescription>
                  Valores em atraso que requerem ação imediata
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Venceu em</TableHead>
                      <TableHead>Dias em Atraso</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recebimentosVencidos.map((recebimento) => (
                      <TableRow key={recebimento.id} className="bg-red-50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{recebimento.cliente}</p>
                            <p className="text-sm text-gray-600">{recebimento.cnpjCliente}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{recebimento.operador}</p>
                            <p className="text-sm text-gray-600">{recebimento.cnpj}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-red-600">
                          R$ {recebimento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>{recebimento.dataVencimento}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            {Math.abs(recebimento.diasVencimento)} dias
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{recebimento.contato}</p>
                            <p className="text-xs text-gray-600">{recebimento.telefone}</p>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm text-orange-600">{recebimento.observacoes}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="destructive">
                              Cobrar
                            </Button>
                            <Button size="sm" variant="outline">
                              Negociar
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

          <TabsContent value="pagos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Recebimentos Confirmados</CardTitle>
                <CardDescription>
                  Histórico de pagamentos recebidos no período
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Operador</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Data Pagamento</TableHead>
                      <TableHead>Forma</TableHead>
                      <TableHead>NF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recebimentosPagos.map((recebimento) => (
                      <TableRow key={recebimento.id} className="bg-green-50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{recebimento.cliente}</p>
                            <p className="text-sm text-gray-600">{recebimento.cnpjCliente}</p>
                          </div>
                        </TableCell>
                        <TableCell>{recebimento.operador}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          R$ {recebimento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>{recebimento.dataVencimento}</TableCell>
                        <TableCell className="font-medium">{recebimento.dataPagamento}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{recebimento.formaPagamento}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{recebimento.nf}</TableCell>
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

export default Recebimentos;