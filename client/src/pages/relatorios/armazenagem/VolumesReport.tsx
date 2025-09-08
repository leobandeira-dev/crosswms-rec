
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

const tipoVolumeData = [
  { name: 'Caixas', value: 1250, fill: '#0088FE' },
  { name: 'Paletes', value: 430, fill: '#00C49F' },
  { name: 'Volumes Especiais', value: 85, fill: '#FFBB28' },
  { name: 'Documentos', value: 210, fill: '#FF8042' },
];

const ocupacaoData = [
  { nome: 'Área A', ocupacaoAtual: 85, capacidadeMaxima: 100 },
  { nome: 'Área B', ocupacaoAtual: 65, capacidadeMaxima: 100 },
  { nome: 'Área C', ocupacaoAtual: 92, capacidadeMaxima: 100 },
  { nome: 'Área D', ocupacaoAtual: 40, capacidadeMaxima: 100 },
  { nome: 'Área E', ocupacaoAtual: 75, capacidadeMaxima: 100 },
];

const tendenciaData = [
  { mes: 'Jan', entrada: 450, saida: 380 },
  { mes: 'Fev', entrada: 520, saida: 430 },
  { mes: 'Mar', entrada: 480, saida: 470 },
  { mes: 'Abr', entrada: 580, saida: 520 },
  { mes: 'Mai', entrada: 620, saida: 550 },
  { mes: 'Jun', entrada: 750, saida: 680 },
];

const VolumesReport = () => {
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
    <MainLayout title="Relatório de Volumes por Endereçamento">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center relative w-full sm:w-auto">
            <Search className="h-4 w-4 absolute left-3 text-muted-foreground" />
            <Input
              placeholder="Buscar volumes..."
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
              title="Relatório de Volumes por Endereçamento"
              fileName="volumes-enderecamento"
              contentRef={reportRef}
              data={[...ocupacaoData, ...tipoVolumeData]}
            />
          </div>
        </div>

        <div ref={reportRef}>
          <Tabs defaultValue="ocupacao">
            <TabsList>
              <TabsTrigger value="ocupacao">Ocupação</TabsTrigger>
              <TabsTrigger value="tipos">Tipos de Volume</TabsTrigger>
              <TabsTrigger value="tendencia">Tendência</TabsTrigger>
              <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ocupacao" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Ocupação por Área de Armazenamento</CardTitle>
                  <CardDescription>Capacidade utilizada vs. disponível</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={ocupacaoData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        {settings.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                        <XAxis dataKey="nome" />
                        <YAxis />
                        <Tooltip />
                        {settings.showLegend && <Legend />}
                        <Bar dataKey="ocupacaoAtual" name="Ocupação atual" fill="#0088FE" />
                        <Bar dataKey="capacidadeMaxima" name="Capacidade máxima" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total de Volumes', value: '1,975', change: '+125', trend: 'up' },
                  { label: 'Ocupação Média', value: '71.4%', change: '+3.5%', trend: 'up' },
                  { label: 'Áreas Críticas', value: '2', change: '+1', trend: 'up' },
                  { label: 'Áreas Disponíveis', value: '3', change: '-1', trend: 'down' },
                ].map((stat) => (
                  <Card key={stat.label}>
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-medium">{stat.value}</p>
                        <span className={`text-xs ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="tipos">
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Tipo de Volume</CardTitle>
                  <CardDescription>Volumes por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={tipoVolumeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {tipoVolumeData.map((entry, index) => (
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
            </TabsContent>
            
            <TabsContent value="tendencia">
              <Card>
                <CardHeader>
                  <CardTitle>Tendência de Movimentação de Volumes</CardTitle>
                  <CardDescription>Entradas vs. Saídas nos últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={tendenciaData}
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
                        <Line type="monotone" dataKey="entrada" name="Entrada de volumes" stroke="#0088FE" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="saida" name="Saída de volumes" stroke="#FF8042" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="detalhes">
              <Card>
                <CardHeader>
                  <CardTitle>Detalhamento de Volumes</CardTitle>
                  <CardDescription>Lista de volumes recentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md">
                    <div className="grid grid-cols-6 bg-gray-100 p-3 border-b font-medium text-sm">
                      <div>ID Volume</div>
                      <div>Tipo</div>
                      <div>Endereço</div>
                      <div>Data Entrada</div>
                      <div>Status</div>
                      <div>Nota Fiscal</div>
                    </div>
                    {[
                      { id: 'VOL-8745', tipo: 'Caixa', endereco: 'A-02-C', data: '18/05/2025', status: 'Armazenado', nf: 'NF-45621' },
                      { id: 'VOL-8744', tipo: 'Palete', endereco: 'B-05-A', data: '18/05/2025', status: 'Armazenado', nf: 'NF-45620' },
                      { id: 'VOL-8743', tipo: 'Caixa', endereco: 'A-03-B', data: '17/05/2025', status: 'Em separação', nf: 'NF-45615' },
                      { id: 'VOL-8742', tipo: 'Especial', endereco: 'C-01-D', data: '17/05/2025', status: 'Armazenado', nf: 'NF-45612' },
                      { id: 'VOL-8741', tipo: 'Documento', endereco: 'D-10-A', data: '16/05/2025', status: 'Expedido', nf: 'NF-45608' },
                    ].map((item) => (
                      <div key={item.id} className="grid grid-cols-6 p-3 border-b text-sm">
                        <div className="font-medium">{item.id}</div>
                        <div>{item.tipo}</div>
                        <div>{item.endereco}</div>
                        <div>{item.data}</div>
                        <div>
                          <span 
                            className={`px-2 py-1 rounded-full text-xs font-medium
                              ${item.status === 'Armazenado' ? 'bg-blue-100 text-blue-800' : 
                                item.status === 'Em separação' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'}`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div>{item.nf}</div>
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

export default VolumesReport;
