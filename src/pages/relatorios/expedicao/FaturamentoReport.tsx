
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

const receitaMensal = [
  { mes: 'Jan', faturamento: 125000, custo: 85000 },
  { mes: 'Fev', faturamento: 148000, custo: 95000 },
  { mes: 'Mar', faturamento: 165000, custo: 105000 },
  { mes: 'Abr', faturamento: 182000, custo: 118000 },
  { mes: 'Mai', faturamento: 204000, custo: 130000 },
  { mes: 'Jun', faturamento: 220000, custo: 140000 },
];

const clientesData = [
  { name: 'Cliente A', value: 85000, fill: '#0088FE' },
  { name: 'Cliente B', value: 65000, fill: '#00C49F' },
  { name: 'Cliente C', value: 43000, fill: '#FFBB28' },
  { name: 'Cliente D', value: 32000, fill: '#FF8042' },
  { name: 'Outros', value: 19000, fill: '#A570FF' },
];

const servicosData = [
  { servico: 'Frete', valor: 150000 },
  { servico: 'Armazenagem', valor: 95000 },
  { servico: 'Cross-docking', valor: 78000 },
  { servico: 'Embalagem', valor: 45000 },
  { servico: 'Etiquetagem', valor: 32000 },
  { servico: 'Outros', valor: 44000 },
];

const FaturamentoReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState({
    chartType: 'line',
    showLegend: true,
    showGrid: true,
    dateRange: '180d',
    autoRefresh: false,
  });
  const reportRef = useRef<HTMLDivElement>(null);

  const updateSettings = (newSettings: any) => {
    setSettings(newSettings);
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  };

  const calcularLucro = (faturamento: number, custo: number) => {
    return faturamento - custo;
  };

  const calcularMargem = (faturamento: number, custo: number) => {
    return ((faturamento - custo) / faturamento * 100).toFixed(1);
  };

  return (
    <MainLayout title="Relatório de Faturamento">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center relative w-full sm:w-auto">
            <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
            <Input
              placeholder="Buscar faturamento..."
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
              title="Relatório de Faturamento"
              fileName="faturamento-mensal"
              contentRef={reportRef}
              data={[...receitaMensal, ...clientesData.map(c => ({ name: c.name, faturamento: c.value }))]}
            />
          </div>
        </div>

        <div ref={reportRef}>
          <Tabs defaultValue="mensal">
            <TabsList>
              <TabsTrigger value="mensal">Análise Mensal</TabsTrigger>
              <TabsTrigger value="clientes">Por Cliente</TabsTrigger>
              <TabsTrigger value="servicos">Por Serviço</TabsTrigger>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mensal" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Faturamento Total', value: formatCurrency(1044000), change: '+8.5%', trend: 'up' },
                  { label: 'Custo Operacional', value: formatCurrency(673000), change: '+5.2%', trend: 'up' },
                  { label: 'Margem de Lucro', value: '35.5%', change: '+2.3%', trend: 'up' },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                        <div className="flex items-center justify-center gap-2">
                          <p className="text-2xl font-medium">{stat.value}</p>
                          <span className={`text-xs ${stat.trend === 'up' ? (stat.label === 'Custo Operacional' ? 'text-red-600' : 'text-green-600') : (stat.label === 'Custo Operacional' ? 'text-green-600' : 'text-red-600')}`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Faturamento vs. Custo (Semestral)</CardTitle>
                  <CardDescription>Análise mensal de receitas e custos</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      {settings.chartType === 'line' ? (
                        <LineChart
                          data={receitaMensal}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                          <XAxis dataKey="mes" />
                          <YAxis tickFormatter={(value) => `R$ ${value/1000}k`} />
                          <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']} />
                          {settings.showLegend && <Legend />}
                          <Line type="monotone" dataKey="faturamento" name="Faturamento" stroke="#10B981" strokeWidth={2} />
                          <Line type="monotone" dataKey="custo" name="Custo" stroke="#EF4444" strokeWidth={2} />
                        </LineChart>
                      ) : (
                        <AreaChart
                          data={receitaMensal}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                          <XAxis dataKey="mes" />
                          <YAxis tickFormatter={(value) => `R$ ${value/1000}k`} />
                          <Tooltip formatter={(value) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, '']} />
                          {settings.showLegend && <Legend />}
                          <Area type="monotone" dataKey="faturamento" name="Faturamento" stroke="#10B981" fill="#10B98133" />
                          <Area type="monotone" dataKey="custo" name="Custo" stroke="#EF4444" fill="#EF444433" />
                        </AreaChart>
                      )}
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Lucratividade Mensal</CardTitle>
                  <CardDescription>Lucro e margem mensal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-5 bg-gray-100 p-3 border-b font-medium text-sm">
                      <div>Mês</div>
                      <div>Faturamento</div>
                      <div>Custo</div>
                      <div>Lucro</div>
                      <div>Margem</div>
                    </div>
                    {receitaMensal.map((item) => (
                      <div key={item.mes} className="grid grid-cols-5 p-3 border-b text-sm">
                        <div className="font-medium">{item.mes}</div>
                        <div>{formatCurrency(item.faturamento)}</div>
                        <div>{formatCurrency(item.custo)}</div>
                        <div>{formatCurrency(calcularLucro(item.faturamento, item.custo))}</div>
                        <div>{calcularMargem(item.faturamento, item.custo)}%</div>
                      </div>
                    ))}
                    <div className="grid grid-cols-5 p-3 bg-gray-50 font-medium">
                      <div>Total</div>
                      <div>{formatCurrency(receitaMensal.reduce((sum, item) => sum + item.faturamento, 0))}</div>
                      <div>{formatCurrency(receitaMensal.reduce((sum, item) => sum + item.custo, 0))}</div>
                      <div>{formatCurrency(receitaMensal.reduce((sum, item) => sum + calcularLucro(item.faturamento, item.custo), 0))}</div>
                      <div>{calcularMargem(
                        receitaMensal.reduce((sum, item) => sum + item.faturamento, 0),
                        receitaMensal.reduce((sum, item) => sum + item.custo, 0)
                      )}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="clientes">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Faturamento por Cliente</CardTitle>
                    <CardDescription>Distribuição de faturamento por cliente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={clientesData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {clientesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill || COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [formatCurrency(value as number), 'Faturamento']} />
                          {settings.showLegend && <Legend />}
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Top 5 Clientes</CardTitle>
                    <CardDescription>Maiores faturamentos por cliente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {clientesData.map((cliente) => (
                        <div key={cliente.name} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-medium">{cliente.name}</h4>
                            <span className="text-sm text-muted-foreground">
                              {((cliente.value / clientesData.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="h-2.5 rounded-full" 
                              style={{ 
                                width: `${(cliente.value / clientesData.reduce((acc, curr) => acc + curr.value, 0)) * 100}%`,
                                backgroundColor: cliente.fill
                              }}
                            ></div>
                          </div>
                          <p className="text-right mt-1 font-medium">{formatCurrency(cliente.value)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="servicos">
              <Card>
                <CardHeader>
                  <CardTitle>Faturamento por Tipo de Serviço</CardTitle>
                  <CardDescription>Distribuição de faturamento por categoria de serviço</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={servicosData}
                        layout="vertical"
                        margin={{
                          top: 20,
                          right: 30,
                          left: 100,
                          bottom: 5,
                        }}
                      >
                        {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis type="number" tickFormatter={(value) => `R$ ${value/1000}k`} />
                        <YAxis dataKey="servico" type="category" />
                        <Tooltip formatter={(value) => [formatCurrency(value as number), 'Valor']} />
                        {settings.showLegend && <Legend />}
                        <Bar dataKey="valor" name="Valor" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-3 text-lg">Detalhamento por Serviço</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {servicosData.map((servico) => (
                        <div key={servico.servico} className="bg-gray-50 p-4 rounded-lg text-center">
                          <h5 className="text-sm text-gray-500">{servico.servico}</h5>
                          <p className="text-lg font-medium">{formatCurrency(servico.valor)}</p>
                          <span className="text-xs text-muted-foreground">
                            {((servico.valor / servicosData.reduce((acc, curr) => acc + curr.valor, 0)) * 100).toFixed(1)}% do total
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="detalhes">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento de Faturamento</CardTitle>
                  <CardDescription>Lista das últimas faturas emitidas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-6 bg-gray-100 p-3 border-b font-medium text-sm">
                      <div>Fatura</div>
                      <div>Data</div>
                      <div>Cliente</div>
                      <div>Serviço</div>
                      <div>Status</div>
                      <div>Valor</div>
                    </div>
                    {[
                      { id: 'FAT-5624', data: '18/05/2025', cliente: 'Cliente A', servico: 'Frete', status: 'Paga', valor: 12500 },
                      { id: 'FAT-5623', data: '17/05/2025', cliente: 'Cliente B', servico: 'Armazenagem', status: 'Pendente', valor: 8700 },
                      { id: 'FAT-5622', data: '16/05/2025', cliente: 'Cliente C', servico: 'Cross-docking', status: 'Paga', valor: 9200 },
                      { id: 'FAT-5621', data: '15/05/2025', cliente: 'Cliente D', servico: 'Embalagem', status: 'Vencida', valor: 5400 },
                      { id: 'FAT-5620', data: '14/05/2025', cliente: 'Cliente A', servico: 'Frete', status: 'Paga', valor: 11800 },
                    ].map((item) => (
                      <div key={item.id} className="grid grid-cols-6 p-3 border-b text-sm">
                        <div className="font-medium">{item.id}</div>
                        <div>{item.data}</div>
                        <div>{item.cliente}</div>
                        <div>{item.servico}</div>
                        <div>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium
                              ${item.status === 'Paga' ? 'bg-green-100 text-green-800' : 
                                item.status === 'Pendente' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div>{formatCurrency(item.valor)}</div>
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

export default FaturamentoReport;
