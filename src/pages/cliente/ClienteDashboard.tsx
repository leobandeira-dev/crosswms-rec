import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Truck, FileText, BarChart3, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import { useLocation } from 'wouter';

const ClienteDashboard: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const quickActions = [
    {
      title: 'Nova Solicitação de Coleta',
      description: 'Solicitar coleta de mercadorias',
      icon: Package,
      action: '/coletas/nova-ordem',
      color: 'bg-blue-500'
    },
    {
      title: 'Acompanhar Entregas',
      description: 'Rastrear status das suas entregas',
      icon: Truck,
      action: '/coletas/solicitacoes',
      color: 'bg-green-500'
    },
    {
      title: 'Documentos',
      description: 'Acessar notas fiscais e comprovantes',
      icon: FileText,
      action: '/armazenagem/rastreamento',
      color: 'bg-purple-500'
    },
    {
      title: 'Relatórios',
      description: 'Visualizar relatórios de movimentação',
      icon: BarChart3,
      action: '/relatorios',
      color: 'bg-orange-500'
    }
  ];

  const recentActivity = [
    { id: 1, type: 'Coleta solicitada', date: '15/06/2025', status: 'Pendente' },
    { id: 2, type: 'Entrega realizada', date: '14/06/2025', status: 'Concluída' },
    { id: 3, type: 'Coleta agendada', date: '13/06/2025', status: 'Agendada' },
  ];

  return (
    <MainLayout title="Portal do Cliente">
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
                    <Clock className="h-4 w-4 text-yellow-500" />
                    <span>Pendentes</span>
                  </div>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-blue-500" />
                    <span>Em trânsito</span>
                  </div>
                  <span className="font-semibold">5</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Concluídas</span>
                  </div>
                  <span className="font-semibold">12</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Atividades Recentes</CardTitle>
              <CardDescription>Últimas movimentações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{activity.type}</p>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'Concluída' ? 'bg-green-100 text-green-800' :
                      activity.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ClienteDashboard;