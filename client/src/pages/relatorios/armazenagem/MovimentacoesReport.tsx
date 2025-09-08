
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
  AreaChart,
  Area,
} from 'recharts';
import ExportActions from '@/components/relatorios/ExportActions';
import ReportSettings from '@/components/relatorios/ReportSettings';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A570FF'];

const movimentacoesTipo = [
  { name: 'Transferência', value: 245, fill: '#0088FE' },
  { name: 'Unitização', value: 182, fill: '#00C49F' },
  { name: 'Endereçamento', value: 320, fill: '#FFBB28' },
  { name: 'Separação', value: 198, fill: '#FF8042' },
  { name: 'Picking', value: 135, fill: '#A570FF' },
];

const movimentacoesDiarias = [
  { data: '12/05', transferencia: 25, unitizacao: 18, enderecamento: 35, separacao: 22, picking: 15 },
  { data: '13/05', transferencia: 32, unitizacao: 24, enderecamento: 42, separacao: 18, picking: 12 },
  { data: '14/05', transferencia: 28, unitizacao: 19, enderecamento: 38, separacao: 25, picking: 17 },
  { data: '15/05', transferencia: 30, unitizacao: 22, enderecamento: 40, separacao: 26, picking: 18 },
  { data: '16/05', transferencia: 35, unitizacao: 27, enderecamento: 45, separacao: 30, picking: 22 },
  { data: '17/05', transferencia: 42, unitizacao: 32, enderecamento: 48, separacao: 35, picking: 25 },
  { data: '18/05', transferencia: 45, unitizacao: 35, enderecamento: 52, separacao: 38, picking: 28 },
];

const operadoresData = [
  { nome: 'João Silva', movimentacoes: 125 },
  { nome: 'Maria Santos', movimentacoes: 98 },
  { nome: 'Pedro Souza', movimentacoes: 145 },
  { nome: 'Ana Costa', movimentacoes: 87 },
  { nome: 'Carlos Oliveira', movimentacoes: 110 },
];

const MovimentacoesReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState({
    chartType: 'bar',
    showLegend: true,
    showGrid: true,
    dateRange: '7d',
    autoRefresh: false,
  });
  const reportRef = useRef<HTMLDivElement>(null);

  const updateSettings = (newSettings: any) => {
    setSettings(newSettings);
  };

  return (
    <MainLayout title="Relatório de Movimentações Internas">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center relative w-full sm:w-auto">
            <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
            <Input
              placeholder="Buscar movimentações..."
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
              title="Relatório de Movimentações Internas"
              fileName="movimentacoes-internas"
              contentRef={reportRef}
              data={[...movimentacoesDiarias, ...operadoresData]}
            />
          </div>
        </div>

        <div ref={reportRef}>
          <Tabs defaultValue="resumo">
            <TabsList>
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="diario">Diário</TabsTrigger>
              <TabsTrigger value="operadores">Por Operador</TabsTrigger>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resumo" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Movimentações por Tipo</CardTitle>
                    <CardDescription>Distribuição por tipo de movimentação</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={movimentacoesTipo}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {movimentacoesTipo.map((entry, index) => (
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
                    <CardTitle>Tempo Médio por Operação</CardTitle>
                    <CardDescription>Tempo médio por tipo de movimentação</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { tipo: 'Transferência', minutos: 8.3 },
                            { tipo: 'Unitização', minutos: 12.5 },
                            { tipo: 'Endereçamento', minutos: 5.2 },
                            { tipo: 'Separação', minutos: 10.7 },
                            { tipo: 'Picking', minutos: 4.5 },
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
                  <CardTitle>Métricas Gerais</CardTitle>
                  <CardDescription>Principais indicadores de movimentação</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total de Movimentações', value: '1,080', change: '+124', trend: 'up' },
                      { label: 'Operações por Hora', value: '7.5', change: '+0.8', trend: 'up' },
                      { label: 'Movimentações/Operador', value: '108', change: '+12', trend: 'up' },
                      { label: 'Tempo Médio', value: '8.2m', change: '-0.5m', trend: 'down' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <div className="flex items-end gap-2">
                          <p className="text-2xl font-medium">{stat.value}</p>
                          <span className={`text-xs ${stat.trend === 'up' ? (stat.label === 'Tempo Médio' ? 'text-red-600' : 'text-green-600') : (stat.label === 'Tempo Médio' ? 'text-green-600' : 'text-red-600')}`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="diario">
              <Card>
                <CardHeader>
                  <CardTitle>Movimentações Diárias</CardTitle>
                  <CardDescription>Acompanhamento diário dos últimos 7 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={movimentacoesDiarias}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis dataKey="data" />
                        <YAxis />
                        <Tooltip />
                        {settings.showLegend && <Legend />}
                        <Area type="monotone" dataKey="transferencia" name="Transferência" stackId="1" stroke="#0088FE" fill="#0088FE" />
                        <Area type="monotone" dataKey="unitizacao" name="Unitização" stackId="1" stroke="#00C49F" fill="#00C49F" />
                        <Area type="monotone" dataKey="enderecamento" name="Endereçamento" stackId="1" stroke="#FFBB28" fill="#FFBB28" />
                        <Area type="monotone" dataKey="separacao" name="Separação" stackId="1" stroke="#FF8042" fill="#FF8042" />
                        <Area type="monotone" dataKey="picking" name="Picking" stackId="1" stroke="#A570FF" fill="#A570FF" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="operadores">
              <Card>
                <CardHeader>
                  <CardTitle>Movimentações por Operador</CardTitle>
                  <CardDescription>Desempenho individual dos operadores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={operadoresData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 20,
                          bottom: 70,
                        }}
                        layout="vertical"
                      >
                        {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis type="number" />
                        <YAxis dataKey="nome" type="category" width={120} />
                        <Tooltip />
                        {settings.showLegend && <Legend />}
                        <Bar dataKey="movimentacoes" name="Número de Movimentações" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="detalhes">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento de Movimentações</CardTitle>
                  <CardDescription>Registro das movimentações recentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-6 bg-gray-100 p-3 border-b font-medium text-sm">
                      <div>ID</div>
                      <div>Tipo</div>
                      <div>Volume</div>
                      <div>De/Para</div>
                      <div>Operador</div>
                      <div>Data/Hora</div>
                    </div>
                    {[
                      { id: 'MOV-9456', tipo: 'Transferência', volume: 'VOL-8745', endereco: 'A-02-C → B-05-D', operador: 'João Silva', data: '18/05/2025 14:32' },
                      { id: 'MOV-9455', tipo: 'Unitização', volume: 'PL-1234', endereco: 'Área de separação → D-01-A', operador: 'Maria Santos', data: '18/05/2025 13:45' },
                      { id: 'MOV-9454', tipo: 'Endereçamento', volume: 'VOL-8743', endereco: 'Doca 2 → A-03-B', operador: 'Pedro Souza', data: '18/05/2025 11:20' },
                      { id: 'MOV-9453', tipo: 'Separação', volume: 'VOL-8730', endereco: 'C-04-C → Área de expedição', operador: 'Ana Costa', data: '18/05/2025 10:15' },
                      { id: 'MOV-9452', tipo: 'Picking', volume: 'VOL-8728', endereco: 'B-02-A → Área de montagem', operador: 'Carlos Oliveira', data: '18/05/2025 09:45' },
                    ].map((item) => (
                      <div key={item.id} className="grid grid-cols-6 p-3 border-b text-sm">
                        <div className="font-medium">{item.id}</div>
                        <div>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium
                              ${item.tipo === 'Transferência' ? 'bg-blue-100 text-blue-800' : 
                                item.tipo === 'Unitização' ? 'bg-green-100 text-green-800' : 
                                item.tipo === 'Endereçamento' ? 'bg-yellow-100 text-yellow-800' :
                                item.tipo === 'Separação' ? 'bg-orange-100 text-orange-800' :
                                'bg-purple-100 text-purple-800'}`}
                          >
                            {item.tipo}
                          </span>
                        </div>
                        <div>{item.volume}</div>
                        <div>{item.endereco}</div>
                        <div>{item.operador}</div>
                        <div>{item.data}</div>
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

export default MovimentacoesReport;
