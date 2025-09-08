
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, BarChart, Users, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const SACDashboard: React.FC = () => {
  return (
    <MainLayout title="Painel de SAC">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Dashboard SAC</h2>
        <p className="text-gray-600">Visão geral do atendimento ao cliente e ocorrências</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <PieChart className="mr-2 h-4 w-4" /> 
              Ocorrências Abertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">28</div>
            <p className="text-xs text-muted-foreground mt-1">15% mais que o mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <BarChart className="mr-2 h-4 w-4" /> 
              Tempo Médio Resolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1.2 dias</div>
            <p className="text-xs text-muted-foreground mt-1">Redução de 0.5 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Users className="mr-2 h-4 w-4" /> 
              Índice Satisfação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">93%</div>
            <p className="text-xs text-muted-foreground mt-1">Aumento de 3% vs. trimestre anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Módulos SAC</CardTitle>
            <CardDescription>Acesse os recursos do sistema</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/sac/ocorrencias">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                <FileText className="h-8 w-8 mb-2" />
                <span>Ocorrências</span>
              </Button>
            </Link>
            <Link to="/sac/atendimentos">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                <Users className="h-8 w-8 mb-2" />
                <span>Atendimentos</span>
              </Button>
            </Link>
            <Link to="/sac/chamados">
              <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center">
                <FileText className="h-8 w-8 mb-2" />
                <span>Chamados</span>
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ocorrências Recentes</CardTitle>
            <CardDescription>Últimos registros inseridos no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <li key={i} className="border-b pb-2 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Ocorrência #{2023100 + i}</p>
                      <p className="text-sm text-gray-500">Cliente: Empresa Exemplo {i}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        i % 3 === 0 
                          ? "bg-yellow-100 text-yellow-800" 
                          : i % 2 === 0 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {i % 3 === 0 
                          ? "Em andamento" 
                          : i % 2 === 0 
                          ? "Concluído" 
                          : "Em aberto"}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SACDashboard;
