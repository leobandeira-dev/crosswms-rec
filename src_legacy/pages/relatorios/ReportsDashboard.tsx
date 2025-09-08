
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, BarChart, PieChart, Table, Download, Printer, Search, Filter, Star, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";

const ReportCard = ({ 
  title, 
  description, 
  icon: Icon, 
  path,
  isFavorite,
  onToggleFavorite
}: { 
  title: string; 
  description: string; 
  icon: React.ElementType;
  path: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="hover:bg-accent/10 cursor-pointer transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              className="text-gray-400 hover:text-yellow-400 transition-colors"
            >
              <Star className={`h-5 w-5 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : ''}`} />
            </button>
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                toast({
                  title: "Exportação em PDF",
                  description: "Selecione parâmetros no relatório para exportar como PDF."
                });
              }}>
                <FileText className="h-4 w-4 mr-2" />
                Exportar como PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                toast({
                  title: "Exportação em Excel",
                  description: "Selecione parâmetros no relatório para exportar como Excel."
                });
              }}>
                <Table className="h-4 w-4 mr-2" />
                Exportar como Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="default" size="sm" onClick={() => navigate(path)}>
            <FileText className="h-4 w-4 mr-2" />
            Gerar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const ReportsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentReports, setRecentReports] = useState<string[]>([]);

  const reportsList = [
    {
      id: '1',
      module: 'coletas',
      title: 'Solicitações por Período',
      description: 'Relatório de solicitações de coleta por período',
      icon: BarChart,
      path: '/relatorios/coletas/solicitacoes'
    },
    {
      id: '2',
      module: 'coletas',
      title: 'Status das Aprovações',
      description: 'Status atual de todas as aprovações de coletas',
      icon: PieChart,
      path: '/relatorios/coletas/aprovacoes'
    },
    {
      id: '3',
      module: 'armazenagem',
      title: 'Volumes por Endereçamento',
      description: 'Distribuição de volumes nos endereços do armazém',
      icon: Table,
      path: '/relatorios/armazenagem/volumes'
    },
    {
      id: '4',
      module: 'armazenagem',
      title: 'Movimentações Internas',
      description: 'Histórico de todas as movimentações internas',
      icon: BarChart,
      path: '/relatorios/armazenagem/movimentacoes'
    },
    {
      id: '5',
      module: 'carregamento',
      title: 'Ordens de Carregamento',
      description: 'Relatório das ordens de carregamento por período',
      icon: FileText,
      path: '/relatorios/carregamento/ordens'
    },
    {
      id: '6',
      module: 'expedicao',
      title: 'Faturamento Mensal',
      description: 'Relatório financeiro de faturamento mensal',
      icon: BarChart,
      path: '/relatorios/expedicao/faturamento'
    },
    {
      id: '7',
      module: 'motoristas',
      title: 'Performance de Motoristas',
      description: 'Desempenho e métricas de motoristas',
      icon: PieChart,
      path: '/relatorios/motoristas/performance'
    },
    {
      id: '8',
      module: 'sac',
      title: 'Ocorrências por Tipo',
      description: 'Análise de ocorrências por tipo e status',
      icon: PieChart,
      path: '/relatorios/sac/ocorrencias'
    },
  ];

  const toggleFavorite = (reportId: string) => {
    setFavorites(prev => {
      if (prev.includes(reportId)) {
        return prev.filter(id => id !== reportId);
      } else {
        return [...prev, reportId];
      }
    });
  };

  const addToRecent = (reportId: string) => {
    setRecentReports(prev => {
      // Remove if already exists to avoid duplicates
      const filtered = prev.filter(id => id !== reportId);
      // Add to beginning of array (most recent)
      return [reportId, ...filtered].slice(0, 5); // Keep only 5 most recent
    });
  };

  const handleReportClick = (reportId: string, path: string) => {
    addToRecent(reportId);
    navigate(path);
  };

  const filteredReports = reportsList.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'all' || report.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const favoriteReports = reportsList.filter(report => favorites.includes(report.id));
  const recentReportsList = reportsList.filter(report => recentReports.includes(report.id));
  
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    toast({
      title: "Configurações de Relatórios",
      description: "Painel de configurações gerais de relatórios aberto",
    });
    // Implementar abertura de modal de configurações
  };

  return (
    <MainLayout title="Relatórios">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center relative w-full sm:w-auto">
            <Input
              placeholder="Buscar relatório..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-80 pl-9"
            />
            <Search className="h-4 w-4 text-muted-foreground absolute left-3" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={moduleFilter} onValueChange={setModuleFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filtrar por módulo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os módulos</SelectItem>
                <SelectItem value="coletas">Coletas</SelectItem>
                <SelectItem value="armazenagem">Armazenagem</SelectItem>
                <SelectItem value="carregamento">Carregamento</SelectItem>
                <SelectItem value="expedicao">Expedição</SelectItem>
                <SelectItem value="motoristas">Motoristas</SelectItem>
                <SelectItem value="sac">SAC</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleSettingsClick}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="todos" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            <TabsTrigger value="favoritos" className="flex items-center">
              <Star className="h-4 w-4 mr-1" />
              Favoritos
              {favorites.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {favorites.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="recentes" className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Recentes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="todos" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <div key={report.id} onClick={() => handleReportClick(report.id, report.path)}>
                    <ReportCard 
                      title={report.title}
                      description={report.description}
                      icon={report.icon}
                      path={report.path}
                      isFavorite={favorites.includes(report.id)}
                      onToggleFavorite={() => toggleFavorite(report.id)}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-10">
                  <p className="text-muted-foreground">Nenhum relatório encontrado com os filtros atuais</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="favoritos" className="mt-0">
            {favoriteReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteReports.map((report) => (
                  <div key={report.id} onClick={() => handleReportClick(report.id, report.path)}>
                    <ReportCard 
                      title={report.title}
                      description={report.description}
                      icon={report.icon}
                      path={report.path}
                      isFavorite={true}
                      onToggleFavorite={() => toggleFavorite(report.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">Sem relatórios favoritos</h3>
                <p className="text-muted-foreground mt-1">Adicione relatórios aos favoritos para visualizá-los aqui</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recentes" className="mt-0">
            {recentReportsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentReportsList.map((report) => (
                  <div key={report.id} onClick={() => handleReportClick(report.id, report.path)}>
                    <ReportCard 
                      title={report.title}
                      description={report.description}
                      icon={report.icon}
                      path={report.path}
                      isFavorite={favorites.includes(report.id)}
                      onToggleFavorite={() => toggleFavorite(report.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <h3 className="text-lg font-medium">Nenhum relatório recente</h3>
                <p className="text-muted-foreground mt-1">Os relatórios acessados recentemente aparecerão aqui</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ReportsDashboard;
