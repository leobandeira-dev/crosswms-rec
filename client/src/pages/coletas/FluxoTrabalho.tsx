import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckCircle, 
  Truck, 
  MapPin, 
  Clock,
  ArrowRight,
  Plus,
  Eye,
  Edit,
  Calendar,
  User,
  Package,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useLocation } from 'wouter';

interface FluxoEtapa {
  id: number;
  titulo: string;
  descricao: string;
  icone: React.ReactNode;
  cor: string;
  status: 'pendente' | 'ativo' | 'concluido';
  acoes: {
    label: string;
    route: string;
  }[];
}

const FluxoTrabalho: React.FC = () => {
  const [, setLocation] = useLocation();
  
  const etapas: FluxoEtapa[] = [
    {
      id: 1,
      titulo: "Solicitação",
      descricao: "Criação e gerenciamento de solicitações de coleta",
      icone: <FileText className="h-8 w-8" />,
      cor: "bg-blue-50 border-blue-200 text-blue-800",
      status: 'ativo',
      acoes: [
        { label: "Nova Solicitação", route: "/coletas/nova-ordem" },
        { label: "Gerenciar Solicitações", route: "/coletas/solicitacoes" }
      ]
    },
    {
      id: 2,
      titulo: "Aprovação",
      descricao: "Validação e aprovação das solicitações pelos clientes",
      icone: <CheckCircle className="h-8 w-8" />,
      cor: "bg-orange-50 border-orange-200 text-orange-800",
      status: 'pendente',
      acoes: [
        { label: "Pendentes Aprovação", route: "/coletas/aprovacoes" },
        { label: "Histórico Aprovações", route: "/coletas/historico-aprovacoes" }
      ]
    },
    {
      id: 3,
      titulo: "Alocação",
      descricao: "Designação de veículos e motoristas para as coletas",
      icone: <Truck className="h-8 w-8" />,
      cor: "bg-purple-50 border-purple-200 text-purple-800",
      status: 'pendente',
      acoes: [
        { label: "Alocar Recursos", route: "/coletas/alocacao" },
        { label: "Gerenciar Frotas", route: "/coletas/frota" }
      ]
    },
    {
      id: 4,
      titulo: "Execução",
      descricao: "Realização das coletas e acompanhamento em tempo real",
      icone: <MapPin className="h-8 w-8" />,
      cor: "bg-green-50 border-green-200 text-green-800",
      status: 'pendente',
      acoes: [
        { label: "Coletas Ativas", route: "/coletas/execucao" },
        { label: "Rastreamento", route: "/coletas/rastreamento" }
      ]
    }
  ];

  const estatisticas = [
    { label: "Solicitações Pendentes", valor: "12", cor: "text-blue-600" },
    { label: "Aguardando Aprovação", valor: "8", cor: "text-orange-600" },
    { label: "Prontas p/ Alocação", valor: "5", cor: "text-purple-600" },
    { label: "Coletas em Execução", valor: "3", cor: "text-green-600" }
  ];

  const atividades = [
    {
      id: 1,
      tipo: "solicitacao",
      titulo: "Nova solicitação criada",
      descricao: "NF 417536 - CORSUL COMERCIO",
      tempo: "há 2 minutos",
      status: "nova"
    },
    {
      id: 2,
      tipo: "aprovacao",
      titulo: "Solicitação aprovada",
      descricao: "NF 415201 - METALURGICA DEL REY",
      tempo: "há 15 minutos",
      status: "aprovada"
    },
    {
      id: 3,
      tipo: "alocacao",
      titulo: "Veículo alocado",
      descricao: "ABC-1234 - Motorista João Silva",
      tempo: "há 1 hora",
      status: "alocado"
    },
    {
      id: 4,
      tipo: "execucao",
      titulo: "Coleta finalizada",
      descricao: "Rota 003 - 4 pontos coletados",
      tempo: "há 2 horas",
      status: "finalizada"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'nova':
        return <Plus className="h-4 w-4 text-blue-600" />;
      case 'aprovada':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'alocado':
        return <Truck className="h-4 w-4 text-purple-600" />;
      case 'finalizada':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: 'pendente' | 'ativo' | 'concluido') => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Ativo</Badge>;
      case 'concluido':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Concluído</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl font-heading">Fluxo de Trabalho</h1>
          </div>
          <p className="text-gray-600">
            Gerencie todo o processo de coleta desde a solicitação até a execução
          </p>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {estatisticas.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${stat.cor}`}>
                  {stat.valor}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fluxo Principal */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Fluxo de Trabalho - Processo de Coleta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {etapas.map((etapa, index) => (
                <div key={etapa.id} className="relative">
                  {/* Conectores */}
                  {index < etapas.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-6 z-10">
                      <ArrowRight className="h-6 w-6 text-gray-400 transform translate-x-2" />
                    </div>
                  )}
                  
                  {/* Card da Etapa */}
                  <Card className={`h-full border-2 ${etapa.cor}`}>
                    <CardContent className="p-6">
                      {/* Header da Etapa */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg ${etapa.cor}`}>
                            {etapa.icone}
                          </div>
                          <div>
                            <div className="font-bold text-lg">
                              {etapa.id}. {etapa.titulo}
                            </div>
                            {getStatusBadge(etapa.status)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Descrição */}
                      <p className="text-sm text-gray-600 mb-6">
                        {etapa.descricao}
                      </p>
                      
                      {/* Ações */}
                      <div className="space-y-2">
                        {etapa.acoes.map((acao, actionIndex) => (
                          <Button
                            key={actionIndex}
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                            onClick={() => setLocation(acao.route)}
                          >
                            <ArrowRight className="h-4 w-4 mr-2" />
                            {acao.label}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Atividades Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {atividades.map((atividade) => (
                  <div key={atividade.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    {getStatusIcon(atividade.status)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {atividade.titulo}
                      </div>
                      <div className="text-sm text-gray-600">
                        {atividade.descricao}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {atividade.tempo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Todas as Atividades
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start h-12"
                  onClick={() => setLocation('/coletas/nova-ordem')}
                >
                  <Plus className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Nova Solicitação</div>
                    <div className="text-xs opacity-90">Criar nova ordem de coleta</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => setLocation('/coletas/aprovacoes')}
                >
                  <CheckCircle className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Aprovar Solicitações</div>
                    <div className="text-xs text-gray-600">8 pendentes de aprovação</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => setLocation('/coletas/alocacao')}
                >
                  <Truck className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Alocar Recursos</div>
                    <div className="text-xs text-gray-600">5 coletas prontas</div>
                  </div>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-12"
                  onClick={() => setLocation('/coletas/execucao')}
                >
                  <MapPin className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Acompanhar Execução</div>
                    <div className="text-xs text-gray-600">3 coletas em andamento</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default FluxoTrabalho;