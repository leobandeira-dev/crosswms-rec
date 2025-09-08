import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InteractiveButton } from '@/components/ui/interactive-button';
import { InteractiveInput } from '@/components/ui/interactive-input';
import { InteractiveCheckbox } from '@/components/ui/interactive-checkbox';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Search, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

const ChecklistCarregamento = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChecklist, setSelectedChecklist] = useState('');
  const [checklistItems, setChecklistItems] = useState([
    { id: 1, item: 'Verificar documentos do motorista', checked: true, required: true },
    { id: 2, item: 'Conferir lacres do veículo', checked: false, required: true },
    { id: 3, item: 'Validar capacidade de carga', checked: true, required: true },
    { id: 4, item: 'Verificar condições do veículo', checked: false, required: true },
    { id: 5, item: 'Conferir equipamentos de segurança', checked: false, required: true },
    { id: 6, item: 'Verificar temperatura (cargas refrigeradas)', checked: false, required: false },
    { id: 7, item: 'Conferir amarração da carga', checked: false, required: true },
    { id: 8, item: 'Validar peso total', checked: true, required: true },
    { id: 9, item: 'Verificar altura da carga', checked: false, required: true },
    { id: 10, item: 'Conferir distribuição do peso', checked: false, required: true }
  ]);

  const orders = [
    {
      id: 'ORD-001',
      cliente: 'Transportadora ABC',
      motorista: 'João Silva',
      veiculo: 'ABC-1234',
      tipo: 'Carga Seca',
      status: 'Em Checklist',
      progresso: 60
    },
    {
      id: 'ORD-002',
      cliente: 'Logística XYZ',
      motorista: 'Maria Santos',
      veiculo: 'XYZ-5678',
      tipo: 'Refrigerada',
      status: 'Pendente',
      progresso: 0
    },
    {
      id: 'ORD-003',
      cliente: 'Express Transport',
      motorista: 'Carlos Oliveira',
      veiculo: 'EXP-9012',
      tipo: 'Carga Seca',
      status: 'Concluído',
      progresso: 100
    }
  ];

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.cliente.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemCheck = (itemId: number, checked: boolean) => {
    setChecklistItems(items => 
      items.map(item => 
        item.id === itemId ? { ...item, checked } : item
      )
    );
  };

  const getProgressPercentage = () => {
    const totalRequired = checklistItems.filter(item => item.required).length;
    const completedRequired = checklistItems.filter(item => item.required && item.checked).length;
    return Math.round((completedRequired / totalRequired) * 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Concluído': return 'default';
      case 'Em Checklist': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Checklist de Carregamento</h1>
          <p className="text-gray-600">Verificações obrigatórias antes da expedição</p>
        </div>
        <InteractiveButton className="flex items-center gap-2" ripple={true}>
          <ClipboardList className="w-4 h-4" />
          Novo Checklist
        </InteractiveButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
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

          {filteredOrders.map((order, index) => (
            <Card 
              key={order.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fade-in-up ${
                selectedChecklist === order.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{ animationDelay: `${(index + 2) * 100}ms` }}
              onClick={() => setSelectedChecklist(order.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-lg">{order.id}</h3>
                    <p className="text-gray-600">{order.cliente}</p>
                  </div>
                  <Badge variant={getStatusBadge(order.status)}>
                    {order.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Motorista:</span>
                    <p className="font-medium">{order.motorista}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Veículo:</span>
                    <p className="font-medium">{order.veiculo}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <p className="font-medium">{order.tipo}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Progresso:</span>
                    <p className="font-medium">{order.progresso}%</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="h-2 bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${order.progresso}%` }}
                  ></div>
                </div>

                <div className="flex gap-2">
                  <InteractiveButton 
                    size="sm" 
                    className="flex-1"
                    bounce={true}
                    disabled={order.status === 'Concluído'}
                  >
                    {order.status === 'Concluído' ? 'Concluído' : 'Iniciar Checklist'}
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

        {/* Checklist Panel */}
        <div className="space-y-4">
          <Card className="animate-fade-in-up animation-delay-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Checklist Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedChecklist ? (
                <>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progresso</span>
                      <span className="text-sm text-gray-600">{getProgressPercentage()}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {checklistItems.map((item) => (
                      <div key={item.id} className="flex items-start gap-3">
                        <InteractiveCheckbox
                          checked={item.checked}
                          onCheckedChange={(checked) => handleItemCheck(item.id, checked)}
                          className="mt-1"
                          animateCheck={true}
                          pulseOnCheck={true}
                        />
                        <div className="flex-1">
                          <p className={`text-sm ${item.checked ? 'line-through text-gray-500' : ''}`}>
                            {item.item}
                          </p>
                          {item.required && (
                            <span className="text-xs text-red-500">* Obrigatório</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t">
                    <InteractiveButton 
                      className="w-full"
                      disabled={getProgressPercentage() < 100}
                      pulse={getProgressPercentage() === 100}
                    >
                      {getProgressPercentage() === 100 ? 'Finalizar Checklist' : 'Complete todos os itens obrigatórios'}
                    </InteractiveButton>
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Selecione uma ordem para iniciar o checklist
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in-up animation-delay-700">
        <Card className="hover:animate-bounce-soft transition-all duration-300">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-bold text-2xl">18</h3>
            <p className="text-sm text-gray-600">Concluídos Hoje</p>
          </CardContent>
        </Card>
        
        <Card className="hover:animate-bounce-soft transition-all duration-300">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <h3 className="font-bold text-2xl">5</h3>
            <p className="text-sm text-gray-600">Em Andamento</p>
          </CardContent>
        </Card>
        
        <Card className="hover:animate-bounce-soft transition-all duration-300">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <h3 className="font-bold text-2xl">2</h3>
            <p className="text-sm text-gray-600">Pendentes</p>
          </CardContent>
        </Card>
        
        <Card className="hover:animate-bounce-soft transition-all duration-300">
          <CardContent className="p-4 text-center">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-bold text-2xl">95%</h3>
            <p className="text-sm text-gray-600">Taxa de Conformidade</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChecklistCarregamento;