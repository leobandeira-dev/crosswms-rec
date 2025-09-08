
import React, { useRef, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import ExportActions from '@/components/relatorios/ExportActions';
import ReportSettings from '@/components/relatorios/ReportSettings';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A570FF'];

const statusData = [
  { name: 'Aprovadas', value: 105, fill: '#10B981' },
  { name: 'Rejeitadas', value: 32, fill: '#EF4444' },
  { name: 'Pendentes', value: 24, fill: '#F59E0B' },
];

const monthlyData = [
  { name: 'Jan', aprovadas: 15, rejeitadas: 5, pendentes: 3 },
  { name: 'Fev', aprovadas: 12, rejeitadas: 3, pendentes: 2 },
  { name: 'Mar', aprovadas: 18, rejeitadas: 4, pendentes: 3 },
  { name: 'Abr', aprovadas: 14, rejeitadas: 2, pendentes: 4 },
  { name: 'Mai', aprovadas: 16, rejeitadas: 7, pendentes: 3 },
  { name: 'Jun', aprovadas: 30, rejeitadas: 11, pendentes: 9 },
];

const AprovacoesReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState({
    chartType: 'bar',
    showLegend: true,
    showGrid: true,
    dateRange: '30d',
    autoRefresh: false,
  });
  const reportRef = useRef<HTMLDivElement>(null);

  const updateSettings = (newSettings: any) => {
    setSettings(newSettings);
  };

  return (
    <MainLayout title="Relatório de Aprovações de Coleta">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center relative w-full sm:w-auto">
            <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
            <Input
              placeholder="Buscar aprovações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-[300px]"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            
            <ReportSettings 
              updateSettings={updateSettings}
              defaultSettings={settings}
            />
            
            <ExportActions 
              title="Relatório de Aprovações de Coleta"
              fileName="aprovacoes-coleta"
              contentRef={reportRef}
              data={[...monthlyData, ...statusData]}
            />
          </div>
        </div>

        <div ref={reportRef}>
          <Tabs defaultValue="resumo">
            <TabsList>
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="mensal">Análise Mensal</TabsTrigger>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resumo" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Status das Aprovações</CardTitle>
                    <CardDescription>Distribuição por status de aprovação</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          {settings.showLegend && <Legend />}
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Tempo Médio de Aprovação</CardTitle>
                    <CardDescription>Tempo médio por tipo de solicitação</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { tipo: 'Urgente', horas: 2.3 },
                            { tipo: 'Normal', horas: 7.8 },
                            { tipo: 'Programada', horas: 12.5 },
                          ]}
                          layout="vertical"
                        >
                          {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                          <XAxis type="number" />
                          <YAxis dataKey="tipo" type="category" width={100} />
                          <Tooltip formatter={(value) => [`${value} horas`, 'Tempo Médio']} />
                          {settings.showLegend && <Legend />}
                          <Bar dataKey="horas" name="Tempo Médio (horas)" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Indicadores de Desempenho</CardTitle>
                  <CardDescription>Principais métricas de aprovação</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total de Solicitações', value: '161', change: '+12%', trend: 'up' },
                      { label: 'Taxa de Aprovação', value: '65%', change: '+5%', trend: 'up' },
                      { label: 'Taxa de Rejeição', value: '20%', change: '-3%', trend: 'down' },
                      { label: 'Tempo Médio', value: '7.5h', change: '-1.2h', trend: 'down' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <div className="flex items-end gap-2">
                          <p className="text-2xl font-medium">{stat.value}</p>
                          <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="mensal">
              <Card>
                <CardHeader>
                  <CardTitle>Aprovações Mensais</CardTitle>
                  <CardDescription>Distribuição mensal por status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        {settings.showLegend && <Legend />}
                        <Bar dataKey="aprovadas" name="Aprovadas" fill="#10B981" />
                        <Bar dataKey="rejeitadas" name="Rejeitadas" fill="#EF4444" />
                        <Bar dataKey="pendentes" name="Pendentes" fill="#F59E0B" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="detalhes">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhes das Aprovações</CardTitle>
                  <CardDescription>Lista detalhada de aprovações recentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-5 bg-gray-100 p-3 border-b font-medium text-sm">
                      <div>ID</div>
                      <div>Solicitante</div>
                      <div>Data</div>
                      <div>Status</div>
                      <div>Aprovador</div>
                    </div>
                    {[
                      { id: 'SOL-2345', solicitante: 'Empresa A', data: '15/05/2025', status: 'Aprovado', aprovador: 'João Silva' },
                      { id: 'SOL-2344', solicitante: 'Empresa B', data: '14/05/2025', status: 'Rejeitado', aprovador: 'Maria Santos' },
                      { id: 'SOL-2343', solicitante: 'Empresa C', data: '14/05/2025', status: 'Aprovado', aprovador: 'João Silva' },
                      { id: 'SOL-2342', solicitante: 'Empresa D', data: '13/05/2025', status: 'Pendente', aprovador: '-' },
                      { id: 'SOL-2341', solicitante: 'Empresa E', data: '12/05/2025', status: 'Aprovado', aprovador: 'Ana Costa' },
                    ].map((item) => (
                      <div key={item.id} className="grid grid-cols-5 p-3 border-b text-sm">
                        <div className="font-medium">{item.id}</div>
                        <div>{item.solicitante}</div>
                        <div>{item.data}</div>
                        <div>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium
                              ${item.status === 'Aprovado' ? 'bg-green-100 text-green-800' : 
                                item.status === 'Rejeitado' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div>{item.aprovador}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default AprovacoesReport;
