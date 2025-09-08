import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building2, 
  Package, 
  BarChart3, 
  Settings, 
  Shield,
  TrendingUp,
  Activity,
  Database,
  Crown,
  Presentation,
  TestTube
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();

  const stats = [
    {
      title: "Empresas Ativas",
      value: "12",
      change: "+2 este mês",
      icon: Building2,
      color: "text-blue-600"
    },
    {
      title: "Usuários Total",
      value: "156",
      change: "+15 este mês",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Receita Mensal",
      value: "R$ 24.500",
      change: "+12% vs mês anterior",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Tickets Suporte",
      value: "8",
      change: "3 pendentes",
      icon: Activity,
      color: "text-orange-600"
    }
  ];

  const quickActions = [
    {
      title: "Gerenciar Empresas",
      description: "Criar, editar e aprovar empresas",
      icon: Building2,
      action: () => navigate('/admin/empresas')
    },
    {
      title: "Gestão de Pacotes",
      description: "Configurar funcionalidades e preços",
      icon: Package,
      action: () => navigate('/admin/pacotes')
    },
    {
      title: "Aprovação Transportadores",
      description: "Aprovar novos transportadores",
      icon: Shield,
      action: () => navigate('/admin/aprovacao-transportadores')
    },
    {
      title: "Relatórios Sistema",
      description: "Análises e métricas gerais",
      icon: BarChart3,
      action: () => navigate('/admin/relatorios')
    },
    {
      title: "Configurações Sistema",
      description: "Configurações globais",
      icon: Settings,
      action: () => navigate('/admin/configuracoes')
    },
    {
      title: "Logs e Auditoria",
      description: "Monitoramento do sistema",
      icon: Database,
      action: () => navigate('/admin/logs')
    },
    {
      title: "Apresentação Comercial",
      description: "Slides corporativos do sistema",
      icon: Presentation,
      action: () => navigate('/admin/apresentacao-comercial')
    },
    {
      title: "Teste de Controle de Acesso",
      description: "Testar isolamento de dados multi-tenant",
      icon: TestTube,
      action: () => navigate('/admin/teste-acesso')
    }
  ];

  return (
    <MainLayout title="Super Admin Dashboard">
      <div className="min-h-screen bg-[#F5F5F5] p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <Crown className="h-8 w-8 text-[#0098DA]" />
                  <h1 className="text-3xl font-bold text-gray-900">
                    Super Admin Dashboard
                  </h1>
                </div>
                <p className="text-gray-600 mt-2">
                  Gerencie suas operações logísticas de forma eficiente
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#0098DA] to-blue-600">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Settings className="h-5 w-5 mr-2 text-[#0098DA]" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={action.action}
                    className="h-auto p-4 flex flex-col items-start text-left border-gray-200 hover:border-[#0098DA] hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-center mb-2">
                      <action.icon className="h-5 w-5 mr-2 text-[#0098DA]" />
                      <span className="font-semibold text-gray-900">{action.title}</span>
                    </div>
                    <span className="text-sm text-gray-600">{action.description}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900">
                <Activity className="h-5 w-5 mr-2 text-[#0098DA]" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium text-green-800">API Status</p>
                    <p className="text-sm text-green-600">Operacional</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="font-medium text-green-800">Banco de Dados</p>
                    <p className="text-sm text-green-600">Conectado</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div>
                    <p className="font-medium text-yellow-800">Backup</p>
                    <p className="text-sm text-yellow-600">Agendado para 02:00</p>
                  </div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}