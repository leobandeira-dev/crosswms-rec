
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
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import ExportActions from '@/components/relatorios/ExportActions';
import ReportSettings from '@/components/relatorios/ReportSettings';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A570FF'];

const entregasData = [
  { motorista: 'João Silva', entregas: 45, pontualidade: 95, avaliacao: 4.8, ocorrencias: 1 },
  { motorista: 'Pedro Santos', entregas: 38, pontualidade: 90, avaliacao: 4.5, ocorrencias: 2 },
  { motorista: 'Maria Oliveira', entregas: 52, pontualidade: 98, avaliacao: 4.9, ocorrencias: 0 },
  { motorista: 'Carlos Costa', entregas: 32, pontualidade: 85, avaliacao: 4.2, ocorrencias: 3 },
  { motorista: 'Ana Souza', entregas: 42, pontualidade: 92, avaliacao: 4.7, ocorrencias: 1 },
];

const ocorrenciasData = [
  { tipo: 'Atraso', valor: 12 },
  { tipo: 'Avaria', valor: 8 },
  { tipo: 'Devolução', valor: 5 },
  { tipo: 'Documentação', valor: 3 },
  { tipo: 'Outros', valor: 2 },
];

const desempenhoMensal = [
  { mes: 'Jan', entregas: 145, pontualidade: 92, avaliacao: 4.6 },
  { mes: 'Fev', entregas: 158, pontualidade: 91, avaliacao: 4.5 },
  { mes: 'Mar', entregas: 172, pontualidade: 93, avaliacao: 4.7 },
  { mes: 'Abr', entregas: 168, pontualidade: 94, avaliacao: 4.6 },
  { mes: 'Mai', entregas: 182, pontualidade: 95, avaliacao: 4.8 },
  { mes: 'Jun', entregas: 209, pontualidade: 96, avaliacao: 4.9 },
];

const rankingMotoristas = [
  { motorista: 'Maria Oliveira', pontuacao: 98 },
  { motorista: 'João Silva', pontuacao: 92 },
  { motorista: 'Ana Souza', pontuacao: 88 },
  { motorista: 'Pedro Santos', pontuacao: 85 },
  { motorista: 'Carlos Costa', pontuacao: 78 },
];

const PerformanceReport = () => {
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
    <MainLayout title="Relatório de Performance de Motoristas">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center relative w-full sm:w-auto">
            <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
            <Input
              placeholder="Buscar motorista..."
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
              title="Relatório de Performance de Motoristas"
              fileName="performance-motoristas"
              contentRef={reportRef}
              data={[...entregasData, ...desempenhoMensal]}
            />
          </div>
        </div>

        <div ref={reportRef}>
          <Tabs defaultValue="resumo">
            <TabsList>
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="individual">Desempenho Individual</TabsTrigger>
              <TabsTrigger value="ocorrencias">Ocorrências</TabsTrigger>
              <TabsTrigger value="ranking">Ranking</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resumo" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total de Entregas', value: '209', change: '+14.8%', trend: 'up' },
                  { label: 'Pontualidade Média', value: '96%', change: '+1%', trend: 'up' },
                  { label: 'Avaliação Média', value: '4.9', change: '+0.1', trend: 'up' },
                  { label: 'Ocorrências', value: '7', change: '-18%', trend: 'down' },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-medium">{stat.value}</p>
                        <span className={`text-xs ${stat.trend === 'up' ? (stat.label === 'Ocorrências' ? 'text-red-600' : 'text-green-600') : (stat.label === 'Ocorrências' ? 'text-green-600' : 'text-red-600')}`}>
                          {stat.change}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Desempenho Mensal de Entregas</CardTitle>
                  <CardDescription>Evolução mensal das entregas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={desempenhoMensal}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis dataKey="mes" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                        <Tooltip />
                        {settings.showLegend && <Legend />}
                        <Line yAxisId="left" type="monotone" dataKey="entregas" name="Entregas" stroke="#0088FE" strokeWidth={2} />
                        <Line yAxisId="right" type="monotone" dataKey="pontualidade" name="Pontualidade (%)" stroke="#00C49F" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="individual">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Entregas por Motorista</CardTitle>
                    <CardDescription>Número de entregas realizadas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={entregasData}
                          layout={settings.chartType === 'bar' ? 'vertical' : 'horizontal'}
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 50,
                          }}
                        >
                          {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                          {settings.chartType === 'bar' ? (
                            <>
                              <XAxis type="number" />
                              <YAxis dataKey="motorista" type="category" width={100} />
                            </>
                          ) : (
                            <>
                              <XAxis dataKey="motorista" angle={-45} textAnchor="end" />
                              <YAxis />
                            </>
                          )}
                          <Tooltip />
                          {settings.showLegend && <Legend />}
                          <Bar dataKey="entregas" name="Entregas" fill="#0088FE" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Avaliação de Desempenho</CardTitle>
                    <CardDescription>Métricas de avaliação por motorista</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius={90} data={entregasData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="motorista" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar name="Pontualidade (%)" dataKey="pontualidade" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                          <Radar name="Avaliação (x20)" dataKey={(entry) => entry.avaliacao * 20} stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                          <Tooltip formatter={(value, name) => [
                            name === 'Avaliação (x20)' ? (value as number / 20).toFixed(1) : value, 
                            name === 'Avaliação (x20)' ? 'Avaliação' : name
                          ]} />
                          {settings.showLegend && <Legend />}
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Detalhamento por Motorista</CardTitle>
                    <CardDescription>Indicadores individuais de desempenho</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md overflow-hidden">
                      <div className="grid grid-cols-5 bg-gray-100 p-3 border-b font-medium text-sm">
                        <div>Motorista</div>
                        <div>Entregas</div>
                        <div>Pontualidade</div>
                        <div>Avaliação</div>
                        <div>Ocorrências</div>
                      </div>
                      {entregasData.map((item) => (
                        <div key={item.motorista} className="grid grid-cols-5 p-3 border-b text-sm">
                          <div className="font-medium">{item.motorista}</div>
                          <div>{item.entregas}</div>
                          <div>{item.pontualidade}%</div>
                          <div className="flex items-center">
                            {item.avaliacao}
                            <div className="ml-2 flex">
                              {[...Array(5)].map((_, i) => (
                                <svg 
                                  key={i} 
                                  xmlns="http://www.w3.org/2000/svg" 
                                  viewBox="0 0 24 24" 
                                  fill={i < Math.floor(item.avaliacao) ? "#FFB800" : "none"}
                                  stroke="#FFB800"
                                  className="w-4 h-4"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 17.75l-6.172 3.245 1.179-6.873-4.993-4.867 6.9-1.002L12 2l3.086 6.253 6.9 1.002-4.993 4.867 1.179 6.873z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span 
                              className={`px-2 py-1 rounded-full text-xs font-medium
                                ${item.ocorrencias === 0 ? 'bg-green-100 text-green-800' : 
                                  item.ocorrencias <= 2 ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-red-100 text-red-800'}`}
                            >
                              {item.ocorrencias}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="ocorrencias">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tipos de Ocorrências</CardTitle>
                    <CardDescription>Distribuição por categoria de ocorrência</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ocorrenciasData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="valor"
                            nameKey="tipo"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {ocorrenciasData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                    <CardTitle>Detalhamento de Ocorrências</CardTitle>
                    <CardDescription>Análise das ocorrências registradas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md">
                      <div className="grid grid-cols-3 bg-gray-100 p-3 border-b font-medium text-sm">
                        <div>Tipo</div>
                        <div>Quantidade</div>
                        <div>Impacto</div>
                      </div>
                      {ocorrenciasData.map((item) => (
                        <div key={item.tipo} className="grid grid-cols-3 p-3 border-b text-sm">
                          <div className="font-medium">{item.tipo}</div>
                          <div>{item.valor}</div>
                          <div>
                            <span 
                              className={`px-2 py-1 rounded-full text-xs font-medium
                                ${item.tipo === 'Avaria' || item.tipo === 'Devolução' ? 'bg-red-100 text-red-800' : 
                                  item.tipo === 'Atraso' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-blue-100 text-blue-800'}`}
                            >
                              {item.tipo === 'Avaria' || item.tipo === 'Devolução' ? 'Alto' : 
                               item.tipo === 'Atraso' ? 'Médio' : 'Baixo'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Evolução de Ocorrências</h4>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={[
                              { mes: 'Jan', ocorrencias: 8 },
                              { mes: 'Fev', ocorrencias: 10 },
                              { mes: 'Mar', ocorrencias: 9 },
                              { mes: 'Abr', ocorrencias: 12 },
                              { mes: 'Mai', ocorrencias: 8 },
                              { mes: 'Jun', ocorrencias: 7 },
                            ]}
                          >
                            {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip />
                            {settings.showLegend && <Legend />}
                            <Line type="monotone" dataKey="ocorrencias" name="Ocorrências" stroke="#EF4444" activeDot={{ r: 8 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="ranking">
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de Motoristas</CardTitle>
                  <CardDescription>Classificação geral baseada em desempenho</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={rankingMotoristas}
                            layout="vertical"
                            margin={{
                              top: 20,
                              right: 30,
                              left: 100,
                              bottom: 5,
                            }}
                          >
                            {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                            <XAxis type="number" domain={[0, 100]} />
                            <YAxis dataKey="motorista" type="category" />
                            <Tooltip />
                            {settings.showLegend && <Legend />}
                            <Bar dataKey="pontuacao" name="Pontuação" fill="#0088FE">
                              {rankingMotoristas.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#0088FE'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-lg mb-4">Critérios de Pontuação</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <span>Entregas no prazo</span>
                          </div>
                          <span className="font-medium">40%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span>Avaliação do cliente</span>
                          </div>
                          <span className="font-medium">30%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                            <span>Eficiência de rota</span>
                          </div>
                          <span className="font-medium">15%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <span>Ausência de ocorrências</span>
                          </div>
                          <span className="font-medium">15%</span>
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t">
                        <h4 className="font-medium mb-2">Premiação Mensal</h4>
                        <p className="text-sm text-muted-foreground">Os 3 motoristas com melhor desempenho recebem bonificação e são elegíveis para premiações trimestrais adicionais com base no desempenho consistente.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium text-lg mb-4">Top 5 Motoristas - Detalhamento</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                      {rankingMotoristas.map((item, index) => (
                        <div key={item.motorista} className={`p-4 rounded-lg text-center ${
                          index === 0 ? 'bg-yellow-50 border border-yellow-200' : 
                          index === 1 ? 'bg-gray-50 border border-gray-200' : 
                          index === 2 ? 'bg-orange-50 border border-orange-200' : 
                          'bg-white border border-gray-100'
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                            index === 0 ? 'bg-yellow-500 text-white' : 
                            index === 1 ? 'bg-gray-400 text-white' : 
                            index === 2 ? 'bg-orange-500 text-white' : 
                            'bg-blue-500 text-white'
                          }`}>
                            {index + 1}
                          </div>
                          <p className="font-medium text-sm truncate">{item.motorista}</p>
                          <p className="text-lg font-semibold mt-1">{item.pontuacao}</p>
                          <p className="text-xs text-muted-foreground">pontos</p>
                        </div>
                      ))}
                    </div>
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

export default PerformanceReport;
