import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveButton } from '@/components/ui/interactive-button';
import { InteractiveInput } from '@/components/ui/interactive-input';
import { Badge } from '@/components/ui/badge';
import { Truck, Search, Package, FileText, CheckCircle, Clock, AlertTriangle, MapPin, Clipboard } from 'lucide-react';
import { Link } from 'wouter';

const ExpedicaoCarregamento = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShipment, setSelectedShipment] = useState('');

  const shipments = [
    {
      id: 'EXP-001',
      cliente: 'Transportadora ABC',
      motorista: 'João Silva',
      veiculo: 'ABC-1234',
      destino: 'São Paulo, SP',
      volumes: 15,
      peso: '1.250kg',
      status: 'Pronto para Expedição',
      prazo: '14:30',
      documentos: {
        nota_fiscal: true,
        cte: true,
        manifesto: false,
        checklist: true
      },
      progresso: 85
    },
    {
      id: 'EXP-002',
      cliente: 'Logística XYZ',
      motorista: 'Maria Santos',
      veiculo: 'XYZ-5678',
      destino: 'Rio de Janeiro, RJ',
      volumes: 8,
      peso: '800kg',
      status: 'Em Expedição',
      prazo: '16:00',
      documentos: {
        nota_fiscal: true,
        cte: true,
        manifesto: true,
        checklist: true
      },
      progresso: 100
    },
    {
      id: 'EXP-003',
      cliente: 'Express Transport',
      motorista: 'Carlos Oliveira',
      veiculo: 'EXP-9012',
      destino: 'Belo Horizonte, MG',
      volumes: 12,
      peso: '950kg',
      status: 'Expedido',
      prazo: '18:30',
      documentos: {
        nota_fiscal: true,
        cte: true,
        manifesto: true,
        checklist: true
      },
      progresso: 100
    }
  ];

  const filteredShipments = shipments.filter(shipment => 
    shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.motorista.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Expedido': return 'default';
      case 'Em Expedição': return 'secondary';
      case 'Pronto para Expedição': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Expedido': return 'text-green-500';
      case 'Em Expedição': return 'text-blue-500';
      case 'Pronto para Expedição': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  // Workflow steps navigation
  const workflowSteps = [
    { id: 1, title: "Ordem", path: "/armazenagem/carregamento/ordem", icon: Package, active: false },
    { id: 2, title: "Separação", path: "/armazenagem/carregamento/separacao", icon: Search, active: false },
    { id: 3, title: "Conferência", path: "/armazenagem/carregamento/conferencia", icon: CheckCircle, active: false },
    { id: 4, title: "Endereçamento", path: "/armazenagem/carregamento/enderecamento", icon: MapPin, active: false },
    { id: 5, title: "Checklist", path: "/armazenagem/carregamento/checklist", icon: Clipboard, active: false },
    { id: 6, title: "Expedição", path: "/armazenagem/carregamento/expedicao", icon: Truck, active: true }
  ];

  return (
    <MainLayout title="Expedição de Carregamento">
      <div className="max-w-7xl mx-auto p-6">
        {/* Workflow Navigation */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow">
            {workflowSteps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={step.id} className="flex items-center">
                  <Link href={step.path}>
                    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                      step.active 
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-200' 
                        : 'hover:bg-gray-100'
                    }`}>
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{step.title}</span>
                    </div>
                  </Link>
                  {index < workflowSteps.length - 1 && (
                    <div className="mx-2 text-gray-300">→</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Expedição de Carregamento</h1>
              <p className="text-gray-600">Gerencie a expedição e saída dos veículos</p>
            </div>
            <InteractiveButton className="flex items-center gap-2" ripple={true}>
              <Truck className="w-4 h-4" />
              Nova Expedição
            </InteractiveButton>
          </div>

          {/* Search Bar */}
      <Card className="animate-fade-in-up animation-delay-100">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <InteractiveInput
              placeholder="Buscar por expedição, cliente ou motorista..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              animateOnFocus={true}
              glowOnFocus={true}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipments List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Expedições</h2>
          {filteredShipments.map((shipment, index) => (
            <Card 
              key={shipment.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up ${
                selectedShipment === shipment.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
              onClick={() => setSelectedShipment(shipment.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-lg">{shipment.id}</h3>
                    <p className="text-gray-600">{shipment.cliente}</p>
                  </div>
                  <Badge variant={getStatusBadge(shipment.status)}>
                    {shipment.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Motorista:</span>
                    <p className="font-medium">{shipment.motorista}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Veículo:</span>
                    <p className="font-medium">{shipment.veiculo}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Destino:</span>
                    <p className="font-medium">{shipment.destino}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Prazo:</span>
                    <p className="font-medium">{shipment.prazo}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {shipment.volumes} volumes
                    </span>
                    <span className="font-medium">{shipment.peso}</span>
                  </div>
                  <span className={`font-medium ${getStatusColor(shipment.status)}`}>
                    {shipment.progresso}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      shipment.progresso === 100 ? 'bg-green-500' :
                      shipment.progresso > 50 ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${shipment.progresso}%` }}
                  ></div>
                </div>

                <div className="flex gap-2">
                  <InteractiveButton 
                    size="sm" 
                    className="flex-1"
                    bounce={true}
                    disabled={shipment.status === 'Expedido'}
                  >
                    {shipment.status === 'Expedido' ? 'Expedido' : 
                     shipment.status === 'Em Expedição' ? 'Finalizar' : 'Expedir'}
                  </InteractiveButton>
                  <InteractiveButton 
                    size="sm" 
                    variant="outline"
                    ripple={true}
                  >
                    Documentos
                  </InteractiveButton>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Documents Panel */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Documentos</h2>
          {selectedShipment ? (
            <>
              {(() => {
                const shipment = shipments.find(s => s.id === selectedShipment);
                return shipment ? (
                  <Card className="animate-fade-in-up animation-delay-500">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        {shipment.id}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded">
                          <span className="text-sm">Nota Fiscal</span>
                          {shipment.documentos.nota_fiscal ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded">
                          <span className="text-sm">CT-e</span>
                          {shipment.documentos.cte ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded">
                          <span className="text-sm">Manifesto</span>
                          {shipment.documentos.manifesto ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          )}
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded">
                          <span className="text-sm">Checklist</span>
                          {shipment.documentos.checklist ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t space-y-2">
                        <InteractiveButton 
                          size="sm" 
                          className="w-full"
                          ripple={true}
                        >
                          Gerar Documentos
                        </InteractiveButton>
                        <InteractiveButton 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                        >
                          Imprimir Tudo
                        </InteractiveButton>
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}
            </>
          ) : (
            <Card className="animate-fade-in-up animation-delay-500">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">
                  Selecione uma expedição para ver os documentos
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up animation-delay-700">
        <Card className="hover:animate-bounce-soft transition-all duration-300">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-bold text-2xl">28</h3>
            <p className="text-sm text-gray-600">Expedições Hoje</p>
          </CardContent>
        </Card>
        
        <Card className="hover:animate-bounce-soft transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <h3 className="font-bold text-2xl">7</h3>
            <p className="text-sm text-gray-600">Em Andamento</p>
          </CardContent>
        </Card>
        
        <Card className="hover:animate-bounce-soft transition-all duration-300">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <h3 className="font-bold text-2xl">3</h3>
            <p className="text-sm text-gray-600">Atrasadas</p>
          </CardContent>
        </Card>
        
        <Card className="hover:animate-bounce-soft transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Truck className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-bold text-2xl">92%</h3>
            <p className="text-sm text-gray-600">Pontualidade</p>
          </CardContent>
        </Card>
      </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExpedicaoCarregamento;