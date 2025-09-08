import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NovaOrdemIntegrada from '@/components/comum/OrdemCarregamento/NovaOrdemIntegrada';
import { 
  Truck, 
  Package, 
  User, 
  MapPin, 
  Calendar,
  Clock,
  Search,
  Plus,
  FileText,
  CheckCircle,
  ArrowUpDown,
  Filter
} from 'lucide-react';

const OrdemCarregamento = () => {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('nova');
  const [searchTerm, setSearchTerm] = useState('');

  // Estrutura unificada de documentos com tipos de movimentação
  const tiposMovimentacao = [
    {
      tipo: 'Entrada',
      subtipos: [
        'Coleta (fornecedor x transportadora)',
        'Devolução (destinatário x remetente)'
      ],
      cor: 'bg-green-100 text-green-800'
    },
    {
      tipo: 'Saída',
      subtipos: [
        'Armazém (transportadora x destinatário)',
        'Transferência (transportadora x filial)',
        'Direta (remetente x destinatário)',
        'Entrega (transportadora x destinatário)',
        'Devolução (transportadora x remetente)'
      ],
      cor: 'bg-blue-100 text-blue-800'
    },
    {
      tipo: 'Transferência',
      subtipos: [
        'Filial x Filial'
      ],
      cor: 'bg-purple-100 text-purple-800'
    }
  ];

  // Mock data atualizado com tipos de movimentação
  const loadingOrders = [
    {
      id: 'ORD-001',
      numero: '2024-001',
      tipoMovimentacao: 'Entrada',
      tipoDocumento: 'Coleta (fornecedor x transportadora)',
      cliente: 'Distribuidora ABC Ltda',
      motorista: 'João Silva',
      veiculo: 'Volvo FH540 - ABC-1234',
      destino: 'São Paulo - SP',
      dataCarregamento: '2024-03-15',
      horaInicio: '08:00',
      status: 'Em Preparação',
      volumes: 45,
      peso: '2.8 ton',
      observacoes: 'Produtos frágeis - carga especial'
    },
    {
      id: 'ORD-002',
      numero: '2024-002',
      tipoMovimentacao: 'Saída',
      tipoDocumento: 'Entrega (transportadora x destinatário)',
      cliente: 'Comércio XYZ S/A',
      motorista: 'Pedro Santos',
      veiculo: 'Mercedes Actros - XYZ-5678',
      destino: 'Rio de Janeiro - RJ',
      dataCarregamento: '2024-03-15',
      horaInicio: '09:30',
      status: 'Carregando',
      volumes: 32,
      peso: '1.9 ton',
      observacoes: 'Entrega urgente'
    },
    {
      id: 'ORD-003',
      numero: '2024-003',
      tipoMovimentacao: 'Transferência',
      tipoDocumento: 'Filial x Filial',
      cliente: 'Atacado BRZ Ltda',
      motorista: 'Carlos Oliveira',
      veiculo: 'Scania R450 - BRZ-9012',
      destino: 'Belo Horizonte - MG',
      dataCarregamento: '2024-03-15',
      horaInicio: '14:00',
      status: 'Finalizado',
      volumes: 28,
      peso: '2.1 ton',
      observacoes: ''
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Preparação':
        return 'bg-yellow-100 text-yellow-800';
      case 'Carregando':
        return 'bg-blue-100 text-blue-800';
      case 'Finalizado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoMovimentacaoColor = (tipo: string) => {
    const tipoConfig = tiposMovimentacao.find(t => t.tipo === tipo);
    return tipoConfig?.cor || 'bg-gray-100 text-gray-800';
  };

  const filteredOrders = loadingOrders.filter(order =>
    order.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.motorista.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.tipoMovimentacao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // For demo purposes, show empty state when activeTab is 'lista' and there's a specific search
  const showEmptyState = activeTab === 'lista' && searchTerm === 'empty';
  const ordersToShow = showEmptyState ? [] : filteredOrders;

  const handleNovaOrdem = () => {
    setActiveTab('nova');
  };

  const handleOrdemSubmit = (data: any) => {
    console.log('Ordem de carregamento criada:', data);
    setActiveTab('lista');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Ordem de Carregamento</h1>
          <p className="text-gray-600">Gestão unificada de documentos com tipos de movimentação</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nova" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Ordem
          </TabsTrigger>
          <TabsTrigger value="lista" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Lista de Ordens
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nova" className="space-y-4">
          <NovaOrdemIntegrada
            mode="create"
            title="Nova Ordem de Carregamento"
            onSubmit={handleOrdemSubmit}
            onCancel={() => setActiveTab('lista')}
            showBackButton={false}
          />
        </TabsContent>

        <TabsContent value="lista" className="space-y-4">

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Ordens Hoje</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Em Carregamento</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Finalizadas</p>
                <p className="text-2xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Total Volumes</p>
                <p className="text-2xl font-bold">105</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Ordens de Carregamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por número, cliente ou motorista..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="space-y-4">
            {ordersToShow.length > 0 ? (
              ordersToShow.map((order) => (
                <Card key={order.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold">{order.numero}</h3>
                        <p className="text-sm text-gray-600">{order.cliente}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Detalhes
                      </Button>
                      <Button size="sm">
                        <Truck className="w-4 h-4 mr-2" />
                        Carregar
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{order.motorista}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <span>{order.veiculo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{order.destino}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{order.horaInicio}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getTipoMovimentacaoColor(order.tipoMovimentacao)} variant="outline">
                        {order.tipoMovimentacao}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-gray-600">
                    <span className="font-medium">Tipo de Documento:</span> {order.tipoDocumento}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{order.volumes} volumes</span>
                      <span>{order.peso}</span>
                    </div>
                    {order.observacoes && (
                      <div className="text-sm text-gray-600 max-w-md">
                        <span className="font-medium">Obs:</span> {order.observacoes}
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Nenhuma ordem encontrada</h3>
                    <p className="text-gray-600 mt-1">Crie sua primeira ordem de carregamento</p>
                  </div>
                  <Button onClick={handleNovaOrdem} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Ordem
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrdemCarregamento;