
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
  LineChart,
  Line,
} from 'recharts';
import ExportActions from '@/components/relatorios/ExportActions';
import ReportSettings from '@/components/relatorios/ReportSettings';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const statusData = [
  { name: 'Finalizadas', value: 185, fill: '#10B981' },
  { name: 'Em andamento', value: 45, fill: '#3B82F6' },
  { name: 'Programadas', value: 30, fill: '#F59E0B' },
  { name: 'Canceladas', value: 12, fill: '#EF4444' },
];

const weeklyData = [
  { semana: 'Sem 1', finalizadas: 35, andamento: 8, programadas: 5 },
  { semana: 'Sem 2', finalizadas: 42, andamento: 10, programadas: 6 },
  { semana: 'Sem 3', finalizadas: 38, andamento: 9, programadas: 7 },
  { semana: 'Sem 4', finalizadas: 45, andamento: 11, programadas: 8 },
  { semana: 'Sem 5', finalizadas: 25, andamento: 7, programadas: 4 },
];

const motivosData = [
  { name: 'Cliente confirmado', value: 145 },
  { name: 'Otimização de rota', value: 25 },
  { name: 'Urgência do cliente', value: 15 },
  { name: 'Outros', value: 10 },
];

const OrdensReport = () => {
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
    <MainLayout title="Relatório de Ordens de Carregamento">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center relative w-full sm:w-auto">
            <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
            <Input
              placeholder="Buscar ordens..."
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
              title="Relatório de Ordens de Carregamento"
              fileName="ordens-carregamento"
              contentRef={reportRef}
              data={[...weeklyData, ...statusData]}
            />
          </div>
        </div>

        <div ref={reportRef}>
          <Tabs defaultValue="resumo">
            <TabsList>
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="semanal">Análise Semanal</TabsTrigger>
              <TabsTrigger value="motivos">Motivos</TabsTrigger>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resumo" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Status das Ordens de Carregamento</CardTitle>
                    <CardDescription>Distribuição por status</CardDescription>
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
                    <CardTitle>Tempo Médio de Carregamento</CardTitle>
                    <CardDescription>Tempo médio por tipo de veículo</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { tipo: 'VUC', minutos: 45 },
                            { tipo: 'Caminhão 3/4', minutos: 65 },
                            { tipo: 'Caminhão Toco', minutos: 85 },
                            { tipo: 'Carreta', minutos: 120 },
                            { tipo: 'Bitrem', minutos: 150 },
                          ]}
                          layout="vertical"
                        >
                          {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                          <XAxis type="number" />
                          <YAxis dataKey="tipo" type="category" width={100} />
                          <Tooltip formatter={(value) => [`${value} minutos`, 'Tempo Médio']} />
                          {settings.showLegend && <Legend />}
                          <Bar dataKey="minutos" name="Tempo Médio (minutos)" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Indicadores Gerais</CardTitle>
                  <CardDescription>Principais métricas de carregamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total de Ordens', value: '272', change: '+18', trend: 'up' },
                      { label: 'Taxa de Finalização', value: '68%', change: '+5%', trend: 'up' },
                      { label: 'Tempo Médio', value: '93m', change: '-8m', trend: 'down' },
                      { label: 'Taxa de Cancelamento', value: '4.4%', change: '-0.8%', trend: 'down' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <div className="flex items-end gap-2">
                          <p className="text-2xl font-medium">{stat.value}</p>
                          <span className={`text-xs ${stat.trend === 'up' ? (stat.label === 'Taxa de Cancelamento' ? 'text-red-600' : 'text-green-600') : (stat.label === 'Taxa de Cancelamento' ? 'text-green-600' : 'text-red-600')}`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="semanal">
              <Card>
                <CardHeader>
                  <CardTitle>Ordens Semanais</CardTitle>
                  <CardDescription>Distribuição semanal das ordens de carregamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={weeklyData} 
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis dataKey="semana" />
                        <YAxis />
                        <Tooltip />
                        {settings.showLegend && <Legend />}
                        <Bar dataKey="finalizadas" name="Finalizadas" stackId="a" fill="#10B981" />
                        <Bar dataKey="andamento" name="Em andamento" stackId="a" fill="#3B82F6" />
                        <Bar dataKey="programadas" name="Programadas" stackId="a" fill="#F59E0B" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="motivos">
              <Card>
                <CardHeader>
                  <CardTitle>Motivos de Priorização</CardTitle>
                  <CardDescription>Principais motivos para priorização de cargas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={motivosData}
                        layout="vertical"
                        margin={{
                          top: 20,
                          right: 30,
                          left: 100,
                          bottom: 5,
                        }}
                      >
                        {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" />
                        <Tooltip />
                        {settings.showLegend && <Legend />}
                        <Bar dataKey="value" name="Quantidade" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="detalhes">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento de Ordens</CardTitle>
                  <CardDescription>Lista de ordens recentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-6 bg-gray-100 p-3 border-b font-medium text-sm">
                      <div>Ordem</div>
                      <div>Data</div>
                      <div>Cliente</div>
                      <div>Veículo</div>
                      <div>Status</div>
                      <div>Volumes</div>
                    </div>
                    {[
                      { ordem: 'OC-7823', data: '18/05/2025', cliente: 'Empresa A', veiculo: 'Carreta', status: 'Finalizada', volumes: 32 },
                      { ordem: 'OC-7822', data: '18/05/2025', cliente: 'Empresa B', veiculo: 'VUC', status: 'Finalizada', volumes: 18 },
                      { ordem: 'OC-7821', data: '17/05/2025', cliente: 'Empresa C', veiculo: 'Caminhão Toco', status: 'Em andamento', volumes: 25 },
                      { ordem: 'OC-7820', data: '17/05/2025', cliente: 'Empresa D', veiculo: 'Caminhão 3/4', status: 'Programada', volumes: 15 },
                      { ordem: 'OC-7819', data: '16/05/2025', cliente: 'Empresa E', veiculo: 'Carreta', status: 'Finalizada', volumes: 40 },
                    ].map((item) => (
                      <div key={item.ordem} className="grid grid-cols-6 p-3 border-b text-sm">
                        <div className="font-medium">{item.ordem}</div>
                        <div>{item.data}</div>
                        <div>{item.cliente}</div>
                        <div>{item.veiculo}</div>
                        <div>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium
                              ${item.status === 'Finalizada' ? 'bg-green-100 text-green-800' : 
                                item.status === 'Em andamento' ? 'bg-blue-100 text-blue-800' : 
                                item.status === 'Programada' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div>{item.volumes}</div>
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

export default OrdensReport;
