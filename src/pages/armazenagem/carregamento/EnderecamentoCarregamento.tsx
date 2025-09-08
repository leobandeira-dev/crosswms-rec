import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveButton } from '@/components/ui/interactive-button';
import { InteractiveInput } from '@/components/ui/interactive-input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Package, ArrowRight, CheckCircle } from 'lucide-react';

const EnderecamentoCarregamento = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const items = [
    {
      id: 'PKG-001',
      produto: 'Eletrônicos Apple',
      origem: 'A01-001-01',
      destino: 'DOCK-01',
      status: 'Pendente',
      peso: '2.5kg',
      volume: 1
    },
    {
      id: 'PKG-002',
      produto: 'Peças Automotivas',
      origem: 'B02-003-02',
      destino: 'DOCK-02',
      status: 'Em Movimentação',
      peso: '15.2kg',
      volume: 3
    },
    {
      id: 'PKG-003',
      produto: 'Material Médico',
      origem: 'C01-002-01',
      destino: 'DOCK-01',
      status: 'Concluído',
      peso: '5.8kg',
      volume: 2
    }
  ];

  const docks = [
    { id: 'DOCK-01', nome: 'Doca 1', status: 'Disponível', capacidade: '85%' },
    { id: 'DOCK-02', nome: 'Doca 2', status: 'Em Uso', capacidade: '95%' },
    { id: 'DOCK-03', nome: 'Doca 3', status: 'Manutenção', capacidade: '0%' },
  ];

  const filteredItems = items.filter(item => 
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.produto.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Endereçamento de Carregamento</h1>
          <p className="text-gray-600">Gerencie a movimentação para as docas de carregamento</p>
        </div>
        <InteractiveButton className="flex items-center gap-2" ripple={true}>
          <MapPin className="w-4 h-4" />
          Novo Endereçamento
        </InteractiveButton>
      </div>

      {/* Search and Filters */}
      <Card className="animate-fade-in-up animation-delay-100">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <InteractiveInput
              placeholder="Buscar por código ou produto..."
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
        {/* Items to Move */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold">Itens para Endereçamento</h2>
          {filteredItems.map((item, index) => (
            <Card 
              key={item.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up`}
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
              onClick={() => setSelectedItem(item)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Package className="w-8 h-8 text-blue-500" />
                    <div>
                      <h3 className="font-medium">{item.id}</h3>
                      <p className="text-sm text-gray-600">{item.produto}</p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      item.status === 'Concluído' ? 'default' : 
                      item.status === 'Em Movimentação' ? 'secondary' : 
                      'outline'
                    }
                    className={item.status === 'Em Movimentação' ? 'animate-pulse' : ''}
                  >
                    {item.status}
                  </Badge>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {item.origem}
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{item.destino}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {item.peso} • {item.volume} vol
                  </div>
                </div>

                {item.status === 'Pendente' && (
                  <div className="mt-4 flex gap-2">
                    <InteractiveButton 
                      size="sm" 
                      className="flex-1"
                      bounce={true}
                    >
                      Iniciar Movimentação
                    </InteractiveButton>
                    <InteractiveButton 
                      size="sm" 
                      variant="outline"
                      ripple={true}
                    >
                      Alterar Destino
                    </InteractiveButton>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Docks Status */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Status das Docas</h2>
          {docks.map((dock, index) => (
            <Card 
              key={dock.id}
              className={`animate-fade-in-up hover:animate-bounce-soft transition-all duration-300`}
              style={{ animationDelay: `${(index + 5) * 100}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{dock.nome}</h3>
                  <Badge 
                    variant={
                      dock.status === 'Disponível' ? 'default' : 
                      dock.status === 'Em Uso' ? 'secondary' : 
                      'destructive'
                    }
                  >
                    {dock.status}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  Capacidade: {dock.capacidade}
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      dock.status === 'Disponível' ? 'bg-green-500' :
                      dock.status === 'Em Uso' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: dock.capacidade }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up animation-delay-800">
        <Card className="hover:animate-bounce-soft transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-bold text-2xl">24</h3>
            <p className="text-sm text-gray-600">Itens Pendentes</p>
          </CardContent>
        </Card>
        
        <Card className="hover:animate-bounce-soft transition-all duration-300">
          <CardContent className="p-4 text-center">
            <ArrowRight className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <h3 className="font-bold text-2xl">8</h3>
            <p className="text-sm text-gray-600">Em Movimentação</p>
          </CardContent>
        </Card>
        
        <Card className="hover:animate-bounce-soft transition-all duration-300">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-bold text-2xl">156</h3>
            <p className="text-sm text-gray-600">Concluídos Hoje</p>
          </CardContent>
        </Card>
        
        <Card className="hover:animate-bounce-soft transition-all duration-300">
          <CardContent className="p-4 text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <h3 className="font-bold text-2xl">3</h3>
            <p className="text-sm text-gray-600">Docas Ativas</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnderecamentoCarregamento;