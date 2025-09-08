import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  Truck, 
  FileText,
  ArrowRight
} from 'lucide-react';
import TopNavbar from '@/components/layout/TopNavbar';

const DashboardOtimizado: React.FC = () => {
  // Dados mínimos para carregamento ultrarrápido
  const stats = [
    { title: "Notas Fiscais", value: "1,247", icon: FileText, color: "text-blue-700", bgColor: "bg-blue-50" },
    { title: "Carregamentos", value: "89", icon: Truck, color: "text-emerald-700", bgColor: "bg-emerald-50" },
    { title: "Volumes", value: "3,421", icon: Package, color: "text-slate-700", bgColor: "bg-slate-50" }
  ];

  const quickActions = [
    { title: "Nova Ordem", path: "/coletas/nova-ordem", icon: Package },
    { title: "Armazenagem", path: "/armazenagem", icon: Truck },
    { title: "Relatórios", path: "/relatorios", icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <TopNavbar />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600">Visão geral das operações logísticas</p>
        </div>

        {/* Stats Cards - Layout Simplificado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="bg-white border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg border ${stat.bgColor} border-slate-200`}>
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Ações Rápidas */}
        <Card className="bg-white border-slate-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Link key={index} href={action.path}>
                    <Button 
                      variant="outline" 
                      className="w-full h-20 flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-600 border-slate-300 transition-colors"
                    >
                      <IconComponent className="h-6 w-6 text-blue-700" />
                      <span className="text-sm font-semibold text-slate-700">{action.title}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Informações de Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Performance Operacional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Eficiência</span>
                  <span className="text-lg font-bold text-green-600">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Tempo Médio</span>
                  <span className="text-lg font-bold text-blue-600">2.3h</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-slate-900">Fluxo de Trabalho</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">1. Armazenagem → Conferência</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">2. Coletas → Programação</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-slate-600">3. Carregamento → Execução</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOtimizado;