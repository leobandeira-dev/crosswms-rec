import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Truck, 
  FileText,
  TrendingUp,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import TopNavbar from '@/components/layout/TopNavbar';

const SimpleDashboard: React.FC = () => {
  const stats = [
    {
      title: "Notas Fiscais",
      value: "1,247",
      change: "+12% este mês",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "up"
    },
    {
      title: "Carregamentos",
      value: "89",
      change: "+8% este mês",
      icon: Truck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "up"
    },
    {
      title: "Volumes",
      value: "3,421",
      change: "+15% este mês",
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "up"
    },
    {
      title: "Usuários Ativos",
      value: "156",
      change: "+3% este mês",
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "up"
    }
  ];

  const workflowSteps = [
    {
      id: 1,
      title: "Armazenagem",
      description: "Gerencie entrada, conferência e endereçamento",
      icon: Package,
      color: "bg-blue-500",
      path: "/armazenagem",
      features: ["Dashboard", "Conferência", "Endereçamento", "Checklist"],
      status: "active"
    },
    {
      id: 2,
      title: "Coletas",
      description: "Programe e execute coletas",
      icon: MapPin,
      color: "bg-green-500",
      path: "/coletas/nova-ordem",
      features: ["Nova Ordem", "Solicitações", "Programação", "Relatórios"],
      status: "pending"
    },
    {
      id: 3,
      title: "Carregamento",
      description: "Planeje e execute carregamentos",
      icon: Truck,
      color: "bg-orange-500",
      path: "/carregamento",
      features: ["Planejamento", "Ordem de Carga", "Execução", "Rastreamento"],
      status: "pending"
    }
  ];

  const insights = [
    {
      title: "Performance Operacional",
      value: "85%",
      subtitle: "Eficiência Operacional",
      change: "+12% vs mês anterior",
      icon: Target,
      color: "text-green-600"
    },
    {
      title: "Tempo Médio de Processamento",
      value: "2.3h",
      subtitle: "Por ordem de carregamento",
      change: "-15% vs mês anterior",
      icon: Clock,
      color: "text-blue-600"
    },
    {
      title: "Taxa de Precisão",
      value: "97.8%",
      subtitle: "Conferência de volumes",
      change: "+2.1% vs mês anterior",
      icon: CheckCircle,
      color: "text-purple-600"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      action: "Nova ordem de carregamento criada",
      user: "João Silva",
      time: "há 5 min",
      status: "success"
    },
    {
      id: 2,
      action: "NFe processada com sucesso",
      user: "Maria Santos",
      time: "há 12 min",
      status: "success"
    },
    {
      id: 3,
      action: "Erro na importação de XML",
      user: "Carlos Lima",
      time: "há 18 min",
      status: "error"
    },
    {
      id: 4,
      action: "Coleta programada",
      user: "Ana Costa",
      time: "há 25 min",
      status: "pending"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <TopNavbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Gerencie suas operações logísticas de forma eficiente</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-600 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-slate-900 mb-1">
                        {stat.value}
                      </p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <p className="text-sm text-green-600 font-medium">
                          {stat.change}
                        </p>
                      </div>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor} ${stat.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Macrofluxo de Trabalho */}
        <div className="mb-8">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#0098DA]" />
                Macrofluxo de Trabalho - Módulos Operacionais
              </CardTitle>
              <p className="text-sm text-slate-600">Fluxo completo de operações logísticas integradas</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {workflowSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.id} className="relative">
                      <Link href={step.path}>
                        <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-[#0098DA]/20">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className={`p-3 rounded-lg ${step.color} text-white flex-shrink-0`}>
                                <Icon className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-slate-900">{step.title}</h3>
                                  <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full">
                                    Etapa {step.id}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 mb-3">{step.description}</p>
                                <div className="space-y-1">
                                  {step.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <CheckCircle className="h-3 w-3 text-green-500" />
                                      <span className="text-xs text-slate-600">{feature}</span>
                                    </div>
                                  ))}
                                </div>
                                <Button 
                                  className="w-full mt-4 bg-[#0098DA] hover:bg-[#0098DA]/90"
                                  size="sm"
                                >
                                  Acessar Módulo
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                      
                      {/* Connector Arrow */}
                      {index < workflowSteps.length - 1 && (
                        <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                          <ArrowRight className="h-6 w-6 text-slate-400" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Insights Detalhados */}
        <div className="mb-8">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#0098DA]" />
                Insights de Performance
              </CardTitle>
              <p className="text-sm text-slate-600">Métricas operacionais em tempo real</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {insights.map((insight, index) => {
                  const Icon = insight.icon;
                  return (
                    <div key={index} className="text-center p-4 rounded-lg bg-slate-50">
                      <div className="flex items-center justify-center mb-3">
                        <div className="p-2 rounded-full bg-white">
                          <Icon className={`h-6 w-6 ${insight.color}`} />
                        </div>
                      </div>
                      <h3 className="font-medium text-slate-900 mb-1">{insight.title}</h3>
                      <div className="text-3xl font-bold text-slate-900 mb-1">{insight.value}</div>
                      <p className="text-sm text-slate-600 mb-2">{insight.subtitle}</p>
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">{insight.change}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#0098DA]" />
                Performance Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#0098DA] mb-2">85%</div>
                  <p className="text-slate-600">Eficiência Operacional</p>
                  <p className="text-sm text-green-600 mt-1">+12% vs mês anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#0098DA]" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {activity.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {activity.status === 'error' && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      {activity.status === 'pending' && (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.action}
                      </p>
                      <p className="text-sm text-slate-500">
                        {activity.user} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card className="bg-white border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#0098DA]" />
                Ações Rápidas
              </CardTitle>
              <p className="text-sm text-slate-600">Acesso direto às operações mais utilizadas</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/coletas/nova-ordem">
                  <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-[#0098DA]/30 transition-all cursor-pointer group">
                    <FileText className="h-6 w-6 text-[#0098DA] mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-medium text-slate-900 mb-1">Nova Ordem</h3>
                    <p className="text-sm text-slate-600">Criar ordem de carregamento</p>
                    <div className="flex items-center gap-1 mt-2 text-[#0098DA] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-medium">Acessar</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
                
                <Link href="/armazenagem">
                  <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-[#0098DA]/30 transition-all cursor-pointer group">
                    <Package className="h-6 w-6 text-[#0098DA] mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-medium text-slate-900 mb-1">Conferência</h3>
                    <p className="text-sm text-slate-600">Conferir volumes e endereçamento</p>
                    <div className="flex items-center gap-1 mt-2 text-[#0098DA] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-medium">Acessar</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
                
                <Link href="/coletas/solicitacoes">
                  <div className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-[#0098DA]/30 transition-all cursor-pointer group">
                    <Truck className="h-6 w-6 text-[#0098DA] mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-medium text-slate-900 mb-1">Programar Coleta</h3>
                    <p className="text-sm text-slate-600">Agendar nova coleta</p>
                    <div className="flex items-center gap-1 mt-2 text-[#0098DA] opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs font-medium">Acessar</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;