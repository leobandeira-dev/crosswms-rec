import React, { useState } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Truck,
  Package,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  Search,
  Plus,
  Edit,
  Eye,
  FileText,
  User,
  Weight,
  AlertCircle,
  X,
  Check,
  QrCode,
  Settings,
  Send,
  Route,
  Building
} from 'lucide-react';

const Remessas = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewRemessaDialog, setShowNewRemessaDialog] = useState(false);

  // Sample shipping data
  const remessas = [
    {
      id: 'REM-2024-001',
      numero_remessa: 'R123456',
      tipo: 'entrega',
      status: 'em_preparacao',
      cliente: {
        razao_social: 'Distribuidora ABC Ltda',
        cnpj: '12.345.678/0001-90',
        endereco: 'Av. Paulista, 1000 - São Paulo, SP'
      },
      destino: {
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100',
        endereco: 'Av. Paulista, 1000'
      },
      transportadora: 'Transportes Rápidos Ltda',
      veiculo: {
        placa: 'ABC-1234',
        tipo: 'Carreta'
      },
      motorista: {
        nome: 'João Silva',
        telefone: '(11) 99999-9999'
      },
      data_criacao: '2024-06-12',
      data_prevista: '2024-06-14',
      peso_total: 2450.5,
      volume_total: 15,
      valor_total: 25750.00,
      total_notas: 8,
      observacoes: 'Entrega urgente - cliente prioritário'
    },
    {
      id: 'REM-2024-002',
      numero_remessa: 'R789123',
      tipo: 'transferencia',
      status: 'em_transito',
      cliente: {
        razao_social: 'Filial Norte',
        cnpj: '98.765.432/0001-10',
        endereco: 'Rod. Fernão Dias, Km 50 - Atibaia, SP'
      },
      destino: {
        cidade: 'Campinas',
        estado: 'SP',
        cep: '13010-000',
        endereco: 'Av. Norte Sul, 500'
      },
      transportadora: 'Logística Express',
      veiculo: {
        placa: 'XYZ-5678',
        tipo: 'Truck'
      },
      motorista: {
        nome: 'Maria Santos',
        telefone: '(11) 88888-8888'
      },
      data_criacao: '2024-06-11',
      data_prevista: '2024-06-13',
      peso_total: 1890.0,
      volume_total: 12,
      valor_total: 18500.00,
      total_notas: 5,
      observacoes: 'Transferência entre filiais'
    },
    {
      id: 'REM-2024-003',
      numero_remessa: 'R456789',
      tipo: 'entrega',
      status: 'entregue',
      cliente: {
        razao_social: 'Comércio XYZ S.A.',
        cnpj: '11.222.333/0001-44',
        endereco: 'Rua das Flores, 200 - Santos, SP'
      },
      destino: {
        cidade: 'Santos',
        estado: 'SP',
        cep: '11010-000',
        endereco: 'Rua das Flores, 200'
      },
      transportadora: 'Cargas Seguras',
      veiculo: {
        placa: 'DEF-9012',
        tipo: 'Carreta'
      },
      motorista: {
        nome: 'Carlos Oliveira',
        telefone: '(11) 77777-7777'
      },
      data_criacao: '2024-06-10',
      data_prevista: '2024-06-12',
      peso_total: 3200.0,
      volume_total: 22,
      valor_total: 45200.00,
      total_notas: 12,
      observacoes: 'Entrega realizada com sucesso'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_preparacao': return 'bg-yellow-100 text-yellow-800';
      case 'pronto_expedicao': return 'bg-blue-100 text-blue-800';
      case 'em_transito': return 'bg-purple-100 text-purple-800';
      case 'entregue': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'entrega': return 'bg-blue-100 text-blue-800';
      case 'transferencia': return 'bg-purple-100 text-purple-800';
      case 'coleta': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRemessas = remessas.filter(remessa => {
    const matchesSearch = remessa.numero_remessa.includes(searchTerm) ||
                         remessa.cliente.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         remessa.destino.cidade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || remessa.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout title="Remessas">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Gestão de Remessas</h2>
        <p className="text-gray-600">Controle completo de envios e entregas</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Dialog open={showNewRemessaDialog} onOpenChange={setShowNewRemessaDialog}>
          <DialogTrigger asChild>
            <Button className="h-16 flex flex-col items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Remessa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Remessa</DialogTitle>
              <DialogDescription>
                Crie uma nova remessa para expedição
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente1">Distribuidora ABC Ltda</SelectItem>
                    <SelectItem value="cliente2">Comércio XYZ S.A.</SelectItem>
                    <SelectItem value="cliente3">Indústria DEF Ltda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Remessa</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrega">Entrega</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="coleta">Coleta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transportadora">Transportadora</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a transportadora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transp1">Transportes Rápidos Ltda</SelectItem>
                    <SelectItem value="transp2">Logística Express</SelectItem>
                    <SelectItem value="transp3">Cargas Seguras</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_prevista">Data Prevista</Label>
                <Input id="data_prevista" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep_destino">CEP Destino</Label>
                <Input id="cep_destino" placeholder="00000-000" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="endereco_destino">Endereço de Destino</Label>
                <Input id="endereco_destino" placeholder="Rua, Número - Bairro, Cidade - UF" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" placeholder="Instruções especiais para entrega..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewRemessaDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowNewRemessaDialog(false)}>
                Criar Remessa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button 
          onClick={() => setLocation('/expedicao/faturamento')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <FileText className="h-5 w-5" />
          Faturamento
        </Button>

        <Button 
          onClick={() => setLocation('/expedicao/documentos')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <Send className="h-5 w-5" />
          Documentos
        </Button>

        <Button 
          onClick={() => setLocation('/relatorios/expedicao')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <Route className="h-5 w-5" />
          Relatórios
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Package className="mr-2 h-4 w-4 text-yellow-500" />
              Em Preparação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">15</div>
            <p className="text-xs text-muted-foreground">Remessas sendo preparadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Truck className="mr-2 h-4 w-4 text-blue-500" />
              Em Trânsito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">23</div>
            <p className="text-xs text-muted-foreground">Remessas em transporte</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Entregues
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">187</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4 text-purple-500" />
              Tempo Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">2.1</div>
            <p className="text-xs text-muted-foreground">Dias para entrega</p>
          </CardContent>
        </Card>
      </div>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Remessas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por remessa, cliente, destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="em_preparacao">Em Preparação</SelectItem>
                <SelectItem value="pronto_expedicao">Pronto para Expedição</SelectItem>
                <SelectItem value="em_transito">Em Trânsito</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Filtros Avançados
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Remessa</TableHead>
                  <TableHead>Cliente/Destino</TableHead>
                  <TableHead>Transportadora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valores</TableHead>
                  <TableHead>Previsão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRemessas.map((remessa) => (
                  <TableRow key={remessa.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{remessa.numero_remessa}</div>
                        <div className="text-sm text-gray-500">{remessa.id}</div>
                        <div className="text-xs text-gray-400">{remessa.data_criacao}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{remessa.cliente.razao_social}</div>
                        <div className="text-xs text-gray-500">{remessa.cliente.cnpj}</div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {remessa.destino.cidade} - {remessa.destino.estado}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{remessa.transportadora}</div>
                        <div className="text-xs text-gray-500">{remessa.veiculo.placa} - {remessa.veiculo.tipo}</div>
                        <div className="text-xs text-gray-400">{remessa.motorista.nome}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTipoColor(remessa.tipo)}>
                        {remessa.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(remessa.status)}>
                        {remessa.status.replace('_', ' ')}
                      </Badge>
                      {remessa.observacoes && (
                        <div className="flex items-center text-xs text-orange-600 mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Obs
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">R$ {remessa.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                        <div className="text-sm text-gray-500">{remessa.peso_total}kg</div>
                        <div className="text-xs text-gray-500">{remessa.total_notas} NFs</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{remessa.data_prevista}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(remessa.data_prevista) > new Date() ? 'Dentro do prazo' : 'Atrasado'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredRemessas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Nenhuma remessa encontrada com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Remessas;