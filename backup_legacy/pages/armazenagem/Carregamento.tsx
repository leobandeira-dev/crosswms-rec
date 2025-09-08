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
  Camera,
  FileText,
  User,
  Weight,
  Ruler,
  AlertCircle,
  X,
  Check,
  QrCode,
  Settings
} from 'lucide-react';

const Carregamento = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [showConferenciaDialog, setShowConferenciaDialog] = useState(false);
  const [showEnderecoDialog, setShowEnderecoDialog] = useState(false);
  const [showChecklistDialog, setShowChecklistDialog] = useState(false);

  // Sample data representing real loading orders
  const ordensCarregamento = [
    {
      id: 'OC-2024-001',
      numero: 'ORD-123456',
      tipo: 'expedição',
      status: 'aguardando_carregamento',
      cliente: {
        razao_social: 'Distribuidora ABC Ltda',
        cnpj: '12.345.678/0001-90'
      },
      veiculo: {
        placa: 'ABC-1234',
        tipo: 'Carreta',
        capacidade_peso: 25000,
        capacidade_volume: 90
      },
      motorista: {
        nome: 'João Silva',
        cnh: '12345678901',
        telefone: '(11) 99999-9999'
      },
      destino: 'São Paulo - SP',
      data_programada: '2024-06-12',
      hora_programada: '08:00',
      peso_total: 18750,
      volume_total: 65,
      total_itens: 245,
      itens_carregados: 120,
      observacoes: 'Carga frágil - manuseio cuidadoso'
    },
    {
      id: 'OC-2024-002',
      numero: 'ORD-789123',
      tipo: 'transferencia',
      status: 'em_carregamento',
      cliente: {
        razao_social: 'Indústria XYZ S.A.',
        cnpj: '98.765.432/0001-10'
      },
      veiculo: {
        placa: 'XYZ-5678',
        tipo: 'Truck',
        capacidade_peso: 15000,
        capacidade_volume: 45
      },
      motorista: {
        nome: 'Maria Santos',
        cnh: '98765432109',
        telefone: '(11) 88888-8888'
      },
      destino: 'Campinas - SP',
      data_programada: '2024-06-12',
      hora_programada: '10:30',
      peso_total: 12300,
      volume_total: 38,
      total_itens: 150,
      itens_carregados: 89,
      observacoes: ''
    },
    {
      id: 'OC-2024-003',
      numero: 'ORD-456789',
      tipo: 'expedição',
      status: 'carregado',
      cliente: {
        razao_social: 'Comércio DEF Ltda',
        cnpj: '11.222.333/0001-44'
      },
      veiculo: {
        placa: 'DEF-9012',
        tipo: 'Carreta',
        capacidade_peso: 25000,
        capacidade_volume: 90
      },
      motorista: {
        nome: 'Carlos Oliveira',
        cnh: '11223344556',
        telefone: '(11) 77777-7777'
      },
      destino: 'Santos - SP',
      data_programada: '2024-06-11',
      hora_programada: '14:00',
      peso_total: 22500,
      volume_total: 78,
      total_itens: 320,
      itens_carregados: 320,
      observacoes: 'Carregamento concluído - aguarda liberação'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aguardando_carregamento': return 'bg-yellow-100 text-yellow-800';
      case 'em_carregamento': return 'bg-blue-100 text-blue-800';
      case 'carregado': return 'bg-green-100 text-green-800';
      case 'liberado': return 'bg-purple-100 text-purple-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'expedição': return 'bg-blue-100 text-blue-800';
      case 'transferencia': return 'bg-purple-100 text-purple-800';
      case 'coleta': return 'bg-cyan-100 text-cyan-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrdens = ordensCarregamento.filter(ordem => {
    const matchesSearch = ordem.numero.includes(searchTerm) ||
                         ordem.cliente.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ordem.veiculo.placa.includes(searchTerm.toUpperCase()) ||
                         ordem.motorista.nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ordem.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout title="Carregamento">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Carregamento</h2>
        <p className="text-gray-600">Gerência operações de carregamento de mercadorias</p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowNewOrderDialog(true)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Plus className="mr-2 h-4 w-4 text-blue-500" />
              Ordem de Carregamento (OC)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Crie e gerencie ordens de carregamento</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowConferenciaDialog(true)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Conferência de Carga
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Confira volumes antes do despacho nela</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowEnderecoDialog(true)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-purple-500" />
              Endereçamento no Caminhão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Organize o layout de carregamento na carroceria</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setShowChecklistDialog(true)}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Camera className="mr-2 h-4 w-4 text-orange-500" />
              Checklist com Registro Fotográfico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Documente o carregamento com checklist e fotos</p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4 text-yellow-500" />
              Aguardando
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">12</div>
            <p className="text-xs text-muted-foreground">Ordens pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Truck className="mr-2 h-4 w-4 text-blue-500" />
              Em Carregamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">5</div>
            <p className="text-xs text-muted-foreground">Operações ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Carregados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">8</div>
            <p className="text-xs text-muted-foreground">Prontos para saída</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Weight className="mr-2 h-4 w-4 text-purple-500" />
              Capacidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">78%</div>
            <p className="text-xs text-muted-foreground">Utilização média</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral de Carregamentos</CardTitle>
          <p className="text-sm text-muted-foreground">Selecione uma das opções acima para gerenciar operações de carregamento.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por ordem, cliente, placa..."
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
                <SelectItem value="aguardando_carregamento">Aguardando Carregamento</SelectItem>
                <SelectItem value="em_carregamento">Em Carregamento</SelectItem>
                <SelectItem value="carregado">Carregado</SelectItem>
                <SelectItem value="liberado">Liberado</SelectItem>
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
                  <TableHead>Ordem</TableHead>
                  <TableHead>Cliente/Destino</TableHead>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Programação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrdens.map((ordem) => (
                  <TableRow key={ordem.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{ordem.numero}</div>
                        <div className="text-sm text-gray-500">{ordem.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{ordem.cliente.razao_social}</div>
                        <div className="text-xs text-gray-500">{ordem.cliente.cnpj}</div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {ordem.destino}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{ordem.veiculo.placa}</div>
                        <div className="text-sm text-gray-500">{ordem.veiculo.tipo}</div>
                        <div className="text-xs text-gray-500">
                          {ordem.veiculo.capacidade_peso}kg / {ordem.veiculo.capacidade_volume}m³
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{ordem.motorista.nome}</div>
                        <div className="text-xs text-gray-500">{ordem.motorista.cnh}</div>
                        <div className="text-xs text-gray-500">{ordem.motorista.telefone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTipoColor(ordem.tipo)}>
                        {ordem.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">
                          {ordem.itens_carregados}/{ordem.total_itens} itens
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(ordem.itens_carregados / ordem.total_itens) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {ordem.peso_total}kg / {ordem.volume_total}m³
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ordem.status)}>
                        {ordem.status.replace('_', ' ')}
                      </Badge>
                      {ordem.observacoes && (
                        <div className="flex items-center text-xs text-orange-600 mt-1">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Obs
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">{ordem.data_programada}</div>
                        <div className="text-xs text-gray-500">{ordem.hora_programada}</div>
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
                        {ordem.status === 'aguardando_carregamento' && (
                          <Button size="sm">
                            <Truck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredOrdens.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Truck className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Nenhuma ordem de carregamento encontrada.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for New Loading Order */}
      <Dialog open={showNewOrderDialog} onOpenChange={setShowNewOrderDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Ordem de Carregamento</DialogTitle>
            <DialogDescription>
              Crie uma nova ordem de carregamento para expedição
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
                  <SelectItem value="cliente2">Indústria XYZ S.A.</SelectItem>
                  <SelectItem value="cliente3">Comércio DEF Ltda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="veiculo">Veículo</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o veículo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veiculo1">ABC-1234 - Carreta</SelectItem>
                  <SelectItem value="veiculo2">XYZ-5678 - Truck</SelectItem>
                  <SelectItem value="veiculo3">DEF-9012 - Carreta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="motorista">Motorista</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o motorista" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motorista1">João Silva</SelectItem>
                  <SelectItem value="motorista2">Maria Santos</SelectItem>
                  <SelectItem value="motorista3">Carlos Oliveira</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data">Data Programada</Label>
              <Input id="data" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora">Hora Programada</Label>
              <Input id="hora" type="time" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="destino">Destino</Label>
              <Input id="destino" placeholder="Cidade - Estado" />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" placeholder="Instruções especiais para carregamento..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewOrderDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowNewOrderDialog(false)}>
              Criar Ordem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Load Conference */}
      <Dialog open={showConferenciaDialog} onOpenChange={setShowConferenciaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferência de Carga</DialogTitle>
            <DialogDescription>
              Confira volumes e itens antes do despacho
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="text-center">
              <QrCode className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">Escaneie o código da ordem</p>
              <p className="text-gray-500 mb-4">ou digite o número da ordem</p>
              <Input placeholder="Número da ordem de carregamento" className="mb-4" />
              <Button className="w-full">
                Iniciar Conferência
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConferenciaDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Truck Addressing */}
      <Dialog open={showEnderecoDialog} onOpenChange={setShowEnderecoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Endereçamento no Caminhão</DialogTitle>
            <DialogDescription>
              Organize o layout de carregamento na carroceria
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="text-center">
              <Truck className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">Selecione a ordem de carregamento</p>
              <Select>
                <SelectTrigger className="mb-4">
                  <SelectValue placeholder="Escolha uma ordem ativa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ordem1">ORD-123456 - Distribuidora ABC</SelectItem>
                  <SelectItem value="ordem2">ORD-789123 - Indústria XYZ</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full">
                Abrir Layout de Carregamento
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnderecoDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Photographic Checklist */}
      <Dialog open={showChecklistDialog} onOpenChange={setShowChecklistDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checklist com Registro Fotográfico</DialogTitle>
            <DialogDescription>
              Documente o carregamento com checklist e fotos
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="text-center">
              <Camera className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-lg font-medium mb-2">Selecione a ordem para documentar</p>
              <Select>
                <SelectTrigger className="mb-4">
                  <SelectValue placeholder="Escolha uma ordem em carregamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ordem1">ORD-123456 - Em Carregamento</SelectItem>
                  <SelectItem value="ordem2">ORD-789123 - Em Carregamento</SelectItem>
                </SelectContent>
              </Select>
              <Button className="w-full">
                Iniciar Checklist
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChecklistDialog(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Carregamento;