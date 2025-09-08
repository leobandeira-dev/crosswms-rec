import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package2, Send, MessageSquare, BarChart3, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import { useLocation } from 'wouter';

const FornecedorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const quickActions = [
    {
      title: 'Nova Solicitação',
      description: 'Solicitar coleta ou transporte',
      icon: Package2,
      action: '/fornecedor/solicitacoes',
      color: 'bg-orange-500'
    },
    {
      title: 'Enviar Documentos',
      description: 'Upload de notas fiscais e documentos',
      icon: Send,
      action: '/fornecedor/documentacao',
      color: 'bg-blue-500'
    },
    {
      title: 'Comunicação',
      description: 'Mensagens e notificações',
      icon: MessageSquare,
      action: '/fornecedor/comunicacao',
      color: 'bg-green-500'
    },
    {
      title: 'Relatórios',
      description: 'Acompanhar performance e entregas',
      icon: BarChart3,
      action: '/fornecedor/relatorios',
      color: 'bg-purple-500'
    }
  ];

  const pendingRequests = [
    { id: 1, type: 'Coleta agendada', client: 'Del Rey Metalúrgica', date: '16/06/2025', status: 'Pendente' },
    { id: 2, type: 'Documentação solicitada', client: 'TransLog Brasil', date: '15/06/2025', status: 'Em análise' },
    { id: 3, type: 'Entrega programada', client: 'Indústria ABC', date: '14/06/2025', status: 'Confirmada' },
  ];

  return (
    <MainLayout title="Portal do Fornecedor">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-600">
            Bem-vindo! Gerencie suas solicitações e acompanhe suas entregas.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-lg ${action.color} text-white`}>
                    <action.icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={() => setLocation(action.action)}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Resumo de Atividades</span>
              </CardTitle>
              <CardDescription>Status das suas solicitações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span>Aguardando aprovação</span>
                  </div>
                  <span className="font-semibold">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span>Em processamento</span>
                  </div>
                  <span className="font-semibold">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Concluídas</span>
                  </div>
                  <span className="font-semibold">18</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Pendentes</CardTitle>
              <CardDescription>Ações que requerem sua atenção</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{request.type}</p>
                      <p className="text-sm text-gray-600">{request.client} • {request.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.status === 'Confirmada' ? 'bg-green-100 text-green-800' :
                      request.status === 'Pendente' ? 'bg-orange-100 text-orange-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Este Mês</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                  <p className="text-sm text-gray-500">Entregas realizadas</p>
                </div>
                <Package2 className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avaliação</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                  <p className="text-sm text-gray-500">Nota média</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Prazo Médio</p>
                  <p className="text-2xl font-bold text-gray-900">2.1</p>
                  <p className="text-sm text-gray-500">Dias úteis</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default FornecedorDashboard;