
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A570FF'];

const tiposOcorrencia = [
  { name: 'Atraso na entrega', value: 42, fill: '#0088FE' },
  { name: 'Produto danificado', value: 28, fill: '#00C49F' },
  { name: 'Produto errado', value: 18, fill: '#FFBB28' },
  { name: 'Falta de produto', value: 15, fill: '#FF8042' },
  { name: 'Outros', value: 12, fill: '#A570FF' },
];

const statusOcorrencia = [
  { name: 'Resolvido', value: 68, fill: '#10B981' },
  { name: 'Em análise', value: 32, fill: '#3B82F6' },
  { name: 'Pendente', value: 15, fill: '#F59E0B' },
];

const ocorrenciasMensais = [
  { mes: 'Jan', ocorrencias: 18, resolvidas: 15 },
  { mes: 'Fev', ocorrencias: 22, resolvidas: 18 },
  { mes: 'Mar', ocorrencias: 19, resolvidas: 16 },
  { mes: 'Abr', ocorrencias: 24, resolvidas: 20 },
  { mes: 'Mai', ocorrencias: 20, resolvidas: 15 },
  { mes: 'Jun', ocorrencias: 28, resolvidas: 22 },
];

const tempoResolucaoData = [
  { tipo: 'Atraso na entrega', tempo: 2.5 },
  { tipo: 'Produto danificado', tempo: 3.8 },
  { tipo: 'Produto errado', tempo: 2.2 },
  { tipo: 'Falta de produto', tempo: 1.8 },
  { tipo: 'Outros', tempo: 2.0 },
];

const OcorrenciasReport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [settings, setSettings] = useState({
    chartType: 'bar',
    showLegend: true,
    showGrid: true,
    dateRange: '180d',
    autoRefresh: false,
  });
  const reportRef = useRef<HTMLDivElement>(null);

  const updateSettings = (newSettings: any) => {
    setSettings(newSettings);
  };

  return (
    <MainLayout title="Relatório de Ocorrências por Tipo">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center relative w-full sm:w-auto">
            <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
            <Input
              placeholder="Buscar ocorrências..."
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
              title="Relatório de Ocorrências por Tipo"
              fileName="ocorrencias-por-tipo"
              contentRef={reportRef}
              data={[...tiposOcorrencia, ...statusOcorrencia, ...ocorrenciasMensais]}
            />
          </div>
        </div>

        <div ref={reportRef}>
          <Tabs defaultValue="resumo">
            <TabsList>
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="tipos">Por Tipo</TabsTrigger>
              <TabsTrigger value="tendencia">Tendência</TabsTrigger>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="resumo" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total de Ocorrências', value: '115', change: '+8', trend: 'up' },
                  { label: 'Taxa de Resolução', value: '78.3%', change: '+3.5%', trend: 'up' },
                  { label: 'Tempo Médio', value: '2.4 dias', change: '-0.3 dias', trend: 'down' },
                  { label: 'Ocorrências Abertas', value: '25', change: '-12%', trend: 'down' },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-6">
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-medium">{stat.value}</p>
                        <span className={`text-xs ${
                          ((stat.label === 'Total de Ocorrências' || stat.label === 'Ocorrências Abertas') && stat.trend === 'up') || 
                          ((stat.label !== 'Total de Ocorrências' && stat.label !== 'Ocorrências Abertas') && stat.trend === 'down') 
                          ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {stat.change}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ocorrências por Tipo</CardTitle>
                    <CardDescription>Distribuição por categoria de ocorrência</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={tiposOcorrencia}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {tiposOcorrencia.map((entry, index) => (
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
                    <CardTitle>Status das Ocorrências</CardTitle>
                    <CardDescription>Ocorrências por status atual</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusOcorrencia}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {statusOcorrencia.map((entry, index) => (
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
              </div>
            </TabsContent>
            
            <TabsContent value="tipos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Tipos de Ocorrências</CardTitle>
                    <CardDescription>Distribuição detalhada por categoria</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={tiposOcorrencia}
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
                              <YAxis dataKey="name" type="category" width={150} />
                            </>
                          ) : (
                            <>
                              <XAxis dataKey="name" angle={-45} textAnchor="end" />
                              <YAxis />
                            </>
                          )}
                          <Tooltip />
                          {settings.showLegend && <Legend />}
                          <Bar dataKey="value" name="Quantidade" fill="#0088FE">
                            {tiposOcorrencia.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Tempo Médio de Resolução</CardTitle>
                    <CardDescription>Dias necessários para resolver cada tipo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={tempoResolucaoData}
                          layout="vertical"
                          margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                          }}
                        >
                          {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                          <XAxis type="number" />
                          <YAxis dataKey="tipo" type="category" width={150} />
                          <Tooltip formatter={(value) => [`${value} dias`, 'Tempo médio']} />
                          {settings.showLegend && <Legend />}
                          <Bar dataKey="tempo" name="Tempo Médio (dias)" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Análise de Causas Raiz</CardTitle>
                  <CardDescription>Principais causas identificadas por tipo de ocorrência</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-3 bg-gray-100 p-3 border-b font-medium text-sm">
                      <div>Tipo de Ocorrência</div>
                      <div>Principais Causas</div>
                      <div>Ações Corretivas</div>
                    </div>
                    {[
                      { 
                        tipo: 'Atraso na entrega', 
                        causas: 'Tráfego intenso, Erro de rota, Atrasos no carregamento', 
                        acoes: 'Otimização de rotas, Planejamento antecipado de carga'
                      },
                      { 
                        tipo: 'Produto danificado', 
                        causas: 'Embalagem inadequada, Manuseio incorreto, Transporte inadequado', 
                        acoes: 'Reforço em embalagens, Treinamento da equipe' 
                      },
                      { 
                        tipo: 'Produto errado', 
                        causas: 'Erro no picking, Falha de conferência, Etiquetagem incorreta', 
                        acoes: 'Dupla conferência, Uso de leitor de código de barras' 
                      },
                      { 
                        tipo: 'Falta de produto', 
                        causas: 'Erro de inventário, Falha de separação, Divergência sistêmica', 
                        acoes: 'Revisão dos processos de contagem, Conferência física regular' 
                      },
                    ].map((item) => (
                      <div key={item.tipo} className="grid grid-cols-3 p-3 border-b text-sm">
                        <div className="font-medium">{item.tipo}</div>
                        <div>{item.causas}</div>
                        <div>{item.acoes}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tendencia">
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Ocorrências</CardTitle>
                  <CardDescription>Evolução mensal de ocorrências e resoluções</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={ocorrenciasMensais}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        {settings.showLegend && <Legend />}
                        <Line type="monotone" dataKey="ocorrencias" name="Ocorrências registradas" stroke="#EF4444" strokeWidth={2} />
                        <Line type="monotone" dataKey="resolvidas" name="Ocorrências resolvidas" stroke="#10B981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-3 text-lg">Análise de Tendência</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-medium mb-2">Fatores de Sazonalidade</h5>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Aumento de 25% nas ocorrências durante períodos de promoção</li>
                          <li>Picos identificados em finais de mês (aumento de 18%)</li>
                          <li>Redução de 15% nos meses de menor movimento (fevereiro)</li>
                          <li>Impacto de eventos climáticos em determinados períodos</li>
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Padrões Identificados</h5>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          <li>Correlação entre volume de entregas e aumento de ocorrências</li>
                          <li>Taxa de resolução relativamente constante (75-80%)</li>
                          <li>Melhoria gradual no tempo de resposta inicial</li>
                          <li>Redução de ocorrências reincidentes após implementação de ações corretivas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="detalhes">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento de Ocorrências</CardTitle>
                  <CardDescription>Lista das ocorrências recentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-6 bg-gray-100 p-3 border-b font-medium text-sm">
                      <div>Protocolo</div>
                      <div>Data</div>
                      <div>Cliente</div>
                      <div>Tipo</div>
                      <div>Status</div>
                      <div>Responsável</div>
                    </div>
                    {[
                      { id: 'OC-2345', data: '18/05/2025', cliente: 'Empresa A', tipo: 'Atraso na entrega', status: 'Resolvido', responsavel: 'João Silva' },
                      { id: 'OC-2344', data: '17/05/2025', cliente: 'Empresa B', tipo: 'Produto danificado', status: 'Em análise', responsavel: 'Maria Santos' },
                      { id: 'OC-2343', data: '16/05/2025', cliente: 'Empresa C', tipo: 'Produto errado', status: 'Pendente', responsavel: 'Pedro Souza' },
                      { id: 'OC-2342', data: '15/05/2025', cliente: 'Empresa D', tipo: 'Atraso na entrega', status: 'Resolvido', responsavel: 'Ana Costa' },
                      { id: 'OC-2341', data: '14/05/2025', cliente: 'Empresa E', tipo: 'Falta de produto', status: 'Em análise', responsavel: 'Carlos Oliveira' },
                    ].map((item) => (
                      <div key={item.id} className="grid grid-cols-6 p-3 border-b text-sm">
                        <div className="font-medium">{item.id}</div>
                        <div>{item.data}</div>
                        <div>{item.cliente}</div>
                        <div>{item.tipo}</div>
                        <div>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium
                              ${item.status === 'Resolvido' ? 'bg-green-100 text-green-800' : 
                                item.status === 'Em análise' ? 'bg-blue-100 text-blue-800' : 
                                'bg-yellow-100 text-yellow-800'}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div>{item.responsavel}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Métricas de Performance SAC</CardTitle>
                  <CardDescription>Indicadores de desempenho da equipe de atendimento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Tempo Médio de Resposta', value: '1.2h', target: '2h', status: 'success' },
                      { label: 'Tempo Médio de Resolução', value: '2.4d', target: '3d', status: 'success' },
                      { label: 'Taxa de Resolução em 1º Contato', value: '45%', target: '50%', status: 'warning' },
                      { label: 'Satisfação do Cliente', value: '4.2/5', target: '4.0/5', status: 'success' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <div className="flex items-end justify-between mt-1">
                          <p className="text-2xl font-medium">{stat.value}</p>
                          <div className="flex items-center text-xs">
                            <span className="text-muted-foreground mr-1">Meta: {stat.target}</span>
                            <span className={`w-2 h-2 rounded-full ${
                              stat.status === 'success' ? 'bg-green-500' : 
                              stat.status === 'warning' ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`}></span>
                          </div>
                        </div>
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

export default OcorrenciasReport;
