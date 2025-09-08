import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveButton } from '@/components/ui/interactive-button';
import { InteractiveInput } from '@/components/ui/interactive-input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Search, CheckCircle, XCircle, AlertTriangle, Package, Scan, Box, FileText, Download } from 'lucide-react';

const ConferenciaCarregamento = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [recebimentoSearchTerm, setRecebimentoSearchTerm] = useState('');
  const { toast } = useToast();

  const orders = [
    {
      id: 'ORD-001',
      cliente: 'Transportadora ABC',
      volumes: 15,
      peso: '1250kg',
      status: 'Em Conferência',
      itens: [
        { codigo: 'PKG-001', descricao: 'Caixa Eletrônicos', qtd: 5, conferido: true },
        { codigo: 'PKG-002', descricao: 'Peças Automotivas', qtd: 8, conferido: false },
        { codigo: 'PKG-003', descricao: 'Equipamentos Médicos', qtd: 2, conferido: true },
      ]
    },
    {
      id: 'ORD-002',
      cliente: 'Logística XYZ',
      volumes: 8,
      peso: '800kg',
      status: 'Pendente',
      itens: [
        { codigo: 'PKG-004', descricao: 'Produtos Farmacêuticos', qtd: 6, conferido: false },
        { codigo: 'PKG-005', descricao: 'Material Hospitalar', qtd: 2, conferido: false },
      ]
    }
  ];

  // Mock data for received notes from collection and OR processes
  const recebimentoNotas = [
    {
      id: 'COL-001',
      tipo: 'Coleta',
      numeroNota: '00123456',
      emitente: 'Fornecedor ABC Ltda',
      volumes: 3,
      totalM3: 2.485,
      pesoTotal: 78.5,
      status: 'Aguardando Conferência',
      dataOrigem: '2025-06-12T08:30:00',
      volumeDetails: [
        { volume: 1, altura: 120, largura: 80, comprimento: 60, m3: 0.576 },
        { volume: 2, altura: 100, largura: 90, comprimento: 70, m3: 0.630 },
        { volume: 3, altura: 140, largura: 95, comprimento: 95, m3: 1.260 }
      ]
    },
    {
      id: 'OR-002',
      tipo: 'OR',
      numeroNota: '00123457',
      emitente: 'Indústria XYZ S.A.',
      volumes: 6,
      totalM3: 4.320,
      pesoTotal: 125.8,
      status: 'Em Conferência',
      dataOrigem: '2025-06-12T09:15:00',
      volumeDetails: [
        { volume: 1, altura: 80, largura: 60, comprimento: 50, m3: 0.240 },
        { volume: 2, altura: 80, largura: 60, comprimento: 50, m3: 0.240 },
        { volume: 3, altura: 90, largura: 70, comprimento: 60, m3: 0.378 },
        { volume: 4, altura: 90, largura: 70, comprimento: 60, m3: 0.378 },
        { volume: 5, altura: 120, largura: 100, comprimento: 80, m3: 0.960 },
        { volume: 6, altura: 150, largura: 110, comprimento: 70, m3: 1.155 }
      ]
    }
  ];

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRecebimento = recebimentoNotas.filter(nota => 
    nota.numeroNota.toLowerCase().includes(recebimentoSearchTerm.toLowerCase()) ||
    nota.emitente.toLowerCase().includes(recebimentoSearchTerm.toLowerCase()) ||
    nota.id.toLowerCase().includes(recebimentoSearchTerm.toLowerCase())
  );

  const handleConfirmarEntrada = (notaId: string) => {
    toast({
      title: "Entrada Confirmada",
      description: `Nota ${notaId} confirmada no armazém. Status atualizado no rastreamento.`,
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Conferência & Recebimento</h1>
          <p className="text-gray-600">Confira itens de carregamento e recebimento de mercadorias</p>
        </div>
        <InteractiveButton className="flex items-center gap-2" ripple={true}>
          <Scan className="w-4 h-4" />
          Scanner QR
        </InteractiveButton>
      </div>

      <Tabs defaultValue="carregamento" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="carregamento">Conferência de Carregamento</TabsTrigger>
          <TabsTrigger value="recebimento">Recebimento</TabsTrigger>
        </TabsList>

        <TabsContent value="carregamento" className="space-y-6">
          {/* Search Bar */}
          <Card className="animate-fade-in-up animation-delay-100">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <InteractiveInput
                  placeholder="Buscar por ordem ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  animateOnFocus={true}
                  glowOnFocus={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order, index) => (
              <Card 
                key={order.id} 
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up`}
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
                onClick={() => setSelectedOrder(order)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{order.id}</CardTitle>
                      <p className="text-gray-600">{order.cliente}</p>
                    </div>
                    <Badge 
                      variant={order.status === 'Em Conferência' ? 'default' : 'secondary'}
                      className="animate-pulse"
                    >
                      {order.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium">{order.volumes} volumes</span>
                      </div>
                      <div className="text-sm text-gray-600">{order.peso}</div>
                    </div>
                    <div className="flex gap-2">
                      {order.itens.map(item => 
                        item.conferido ? 
                          <CheckCircle key={item.codigo} className="w-4 h-4 text-green-500" /> : 
                          <XCircle key={item.codigo} className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {order.itens.map(item => (
                      <div key={item.codigo} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <span className="font-medium text-sm">{item.codigo}</span>
                          <p className="text-xs text-gray-600">{item.descricao}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Qtd: {item.qtd}</span>
                          {item.conferido ? 
                            <CheckCircle className="w-4 h-4 text-green-500" /> : 
                            <XCircle className="w-4 h-4 text-red-500" />
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <InteractiveButton 
                      size="sm" 
                      className="flex-1"
                      ripple={true}
                    >
                      Conferir
                    </InteractiveButton>
                    <InteractiveButton 
                      size="sm" 
                      variant="outline"
                      ripple={true}
                    >
                      Detalhes
                    </InteractiveButton>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up animation-delay-600">
            <Card className="hover:animate-bounce-soft transition-all duration-300">
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-bold text-2xl">12</h3>
                <p className="text-sm text-gray-600">Conferidos Hoje</p>
              </CardContent>
            </Card>
            
            <Card className="hover:animate-bounce-soft transition-all duration-300">
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <h3 className="font-bold text-2xl">3</h3>
                <p className="text-sm text-gray-600">Pendentes</p>
              </CardContent>
            </Card>
            
            <Card className="hover:animate-bounce-soft transition-all duration-300">
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-bold text-2xl">156</h3>
                <p className="text-sm text-gray-600">Volumes Processados</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recebimento" className="space-y-6">
          {/* Recebimento Search Bar */}
          <Card className="animate-fade-in-up animation-delay-100">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <InteractiveInput
                  placeholder="Buscar por NF, emitente ou documento..."
                  value={recebimentoSearchTerm}
                  onChange={(e) => setRecebimentoSearchTerm(e.target.value)}
                  className="pl-10"
                  animateOnFocus={true}
                  glowOnFocus={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recebimento Notes List */}
          <div className="grid grid-cols-1 gap-6">
            {filteredRecebimento.map((nota, index) => (
              <Card 
                key={nota.id} 
                className={`border-l-4 ${nota.tipo === 'Coleta' ? 'border-l-green-500' : 'border-l-blue-500'} animate-fade-in-up`}
                style={{ animationDelay: `${(index + 2) * 100}ms` }}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {nota.tipo === 'Coleta' ? <FileText className="h-5 w-5" /> : <Download className="h-5 w-5" />}
                        NF {nota.numeroNota} - {nota.tipo} {nota.id}
                      </CardTitle>
                      <p className="text-gray-600">{nota.emitente}</p>
                    </div>
                    <Badge 
                      variant={nota.status === 'Em Conferência' ? 'default' : 'secondary'}
                      className="animate-pulse"
                    >
                      {nota.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Volumes:</span>
                        <span className="font-semibold">{nota.volumes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Volume Total:</span>
                        <span className="font-semibold text-blue-600">{nota.totalM3.toFixed(2)} m³</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Peso Total:</span>
                        <span className="font-semibold">{nota.pesoTotal.toFixed(2)} kg</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-gray-700">Detalhes dos Volumes:</h4>
                      {nota.volumeDetails.map((vol) => (
                        <div key={vol.volume} className="text-xs text-gray-600">
                          Vol {vol.volume}: {vol.altura}×{vol.largura}×{vol.comprimento}cm = {vol.m3.toFixed(2)}m³
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConfirmarEntrada(nota.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Confirmar Entrada
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                    >
                      <Box className="h-4 w-4 mr-1" />
                      Ver Cubagem
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recebimento Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up animation-delay-600">
            <Card className="hover:animate-bounce-soft transition-all duration-300">
              <CardContent className="p-4 text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <h3 className="font-bold text-2xl">5</h3>
                <p className="text-sm text-gray-600">Coletas Recebidas</p>
              </CardContent>
            </Card>
            
            <Card className="hover:animate-bounce-soft transition-all duration-300">
              <CardContent className="p-4 text-center">
                <Download className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-bold text-2xl">3</h3>
                <p className="text-sm text-gray-600">ORs Recebidas</p>
              </CardContent>
            </Card>
            
            <Card className="hover:animate-bounce-soft transition-all duration-300">
              <CardContent className="p-4 text-center">
                <Box className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                <h3 className="font-bold text-2xl">{filteredRecebimento.reduce((sum, nota) => sum + nota.totalM3, 0).toFixed(1)}</h3>
                <p className="text-sm text-gray-600">m³ Total</p>
              </CardContent>
            </Card>
            
            <Card className="hover:animate-bounce-soft transition-all duration-300">
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                <h3 className="font-bold text-2xl">{filteredRecebimento.reduce((sum, nota) => sum + nota.volumes, 0)}</h3>
                <p className="text-sm text-gray-600">Volumes Totais</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConferenciaCarregamento;