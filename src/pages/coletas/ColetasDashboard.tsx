import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Truck,
  Package,
  Clock,
  MapPin,
  Plus,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Navigation,
  Calendar,
  FileText
} from 'lucide-react';

const ColetasDashboard = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [zonaFilter, setZonaFilter] = useState('all');

  // Mock data based on documentation requirements
  const coletasData = {
    pendentes: 24,
    aprovadas: 18,
    em_andamento: 12,
    finalizadas: 156,
    tempo_medio_aprovacao: 1.2,
    tempo_medio_coleta: 1.5,
    taxa_aprovacao: 94
  };

  const recentColetas = [
    {
      id: 'COL-2024-001',
      numero_coleta: 'COL-2024-001',
      empresa_cliente: 'ABC Indústria Ltda',
      endereco_coleta: 'Rua Industrial, 123 - Vila Madalena',
      cidade_coleta: 'São Paulo',
      zona_coleta: 'Zona Oeste',
      data_programada: '2024-06-12',
      modalidade_frete: 'CIF',
      valor_estimado: 850.00,
      status: 'solicitada',
      prioridade: 'alta',
      contato: 'João Silva',
      telefone: '(11) 98765-4321'
    },
    {
      id: 'COL-2024-002',
      numero_coleta: 'COL-2024-002',
      empresa_cliente: 'Comércio XYZ S.A.',
      endereco_coleta: 'Av. Paulista, 1000 - Bela Vista',
      cidade_coleta: 'São Paulo',
      zona_coleta: 'Centro',
      data_programada: '2024-06-12',
      modalidade_frete: 'FOB',
      valor_estimado: 1200.00,
      status: 'aprovada',
      prioridade: 'media',
      contato: 'Maria Santos',
      telefone: '(11) 91234-5678'
    },
    {
      id: 'COL-2024-003',
      numero_coleta: 'COL-2024-003',
      empresa_cliente: 'Distribuidora 123',
      endereco_coleta: 'Rua do Comércio, 456 - Vila Olímpia',
      cidade_coleta: 'São Paulo',
      zona_coleta: 'Zona Sul',
      data_programada: '2024-06-13',
      modalidade_frete: 'CIF',
      valor_estimado: 650.00,
      status: 'em_andamento',
      prioridade: 'baixa',
      contato: 'Carlos Oliveira',
      telefone: '(11) 99876-5432'
    }
  ];

  const zonas = [
    { value: 'all', label: 'Todas as Zonas' },
    { value: 'centro', label: 'Centro' },
    { value: 'zona_norte', label: 'Zona Norte' },
    { value: 'zona_sul', label: 'Zona Sul' },
    { value: 'zona_leste', label: 'Zona Leste' },
    { value: 'zona_oeste', label: 'Zona Oeste' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'solicitada': return 'bg-amber-100 text-amber-800';
      case 'aprovada': return 'bg-green-100 text-green-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'finalizada': return 'bg-gray-100 text-gray-800';
      case 'recusada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-amber-100 text-amber-800';
      case 'baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredColetas = recentColetas.filter(coleta => {
    const matchesSearch = coleta.numero_coleta.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         coleta.empresa_cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || coleta.status === statusFilter;
    const matchesZona = zonaFilter === 'all' || coleta.zona_coleta.toLowerCase().includes(zonaFilter);
    
    return matchesSearch && matchesStatus && matchesZona;
  });

  return (
    <MainLayout title="Gestão de Coletas">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Central de Coletas</h2>
        <p className="text-gray-600">Gestão completa de solicitações, aprovações e execução de coletas</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Button 
          onClick={() => setLocation('/coletas/solicitacoes')}
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Nova Solicitação
        </Button>
        <Button 
          onClick={() => setLocation('/coletas/aprovacoes')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <CheckCircle className="h-5 w-5" />
          Aprovações
        </Button>
        <Button 
          onClick={() => setLocation('/coletas/alocacao')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <Navigation className="h-5 w-5" />
          Roteirização
        </Button>
        <Button 
          onClick={() => setLocation('/relatorios')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <FileText className="h-5 w-5" />
          Relatórios
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation('/coletas/solicitacoes')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-amber-500" />
                Pendentes
              </div>
              <AlertTriangle className="h-3 w-3 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{coletasData.pendentes}</div>
            <p className="text-xs text-muted-foreground mt-1">Aguardando análise</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation('/coletas/aprovacoes')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Aprovadas
              </div>
              <CheckCircle className="h-3 w-3 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{coletasData.aprovadas}</div>
            <p className="text-xs text-muted-foreground mt-1">Prontas para execução</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setLocation('/coletas/alocacao')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center">
                <Truck className="mr-2 h-4 w-4 text-blue-500" />
                Em Andamento
              </div>
              <Navigation className="h-3 w-3 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{coletasData.em_andamento}</div>
            <p className="text-xs text-muted-foreground mt-1">Sendo executadas</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              <div className="flex items-center">
                <Package className="mr-2 h-4 w-4 text-purple-500" />
                Finalizadas
              </div>
              <CheckCircle className="h-3 w-3 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{coletasData.finalizadas}</div>
            <p className="text-xs text-muted-foreground mt-1">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Performance de Aprovação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Tempo Médio Aprovação</span>
                <span className="font-semibold text-blue-600">{coletasData.tempo_medio_aprovacao} dias</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Taxa de Aprovação</span>
                <span className="font-semibold text-green-600">{coletasData.taxa_aprovacao}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tempo Médio Coleta</span>
                <span className="font-semibold text-purple-600">{coletasData.tempo_medio_coleta} dias</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Distribuição por Zona
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Centro</span>
                <Badge variant="outline">32%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Zona Sul</span>
                <Badge variant="outline">28%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Zona Norte</span>
                <Badge variant="outline">22%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Zona Oeste</span>
                <Badge variant="outline">18%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Modalidades de Frete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">CIF (A Pagar)</span>
                <span className="font-semibold text-blue-600">64%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">FOB (Pago)</span>
                <span className="font-semibold text-green-600">36%</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Valor médio por coleta: R$ 1.250,00
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Coletas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por número ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="solicitada">Solicitada</SelectItem>
                <SelectItem value="aprovada">Aprovada</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="finalizada">Finalizada</SelectItem>
                <SelectItem value="recusada">Recusada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={zonaFilter} onValueChange={setZonaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Zona" />
              </SelectTrigger>
              <SelectContent>
                {zonas.map((zona) => (
                  <SelectItem key={zona.value} value={zona.value}>
                    {zona.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>

          {/* Coletas List */}
          <div className="space-y-3">
            {filteredColetas.map((coleta) => (
              <div key={coleta.id} className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-lg">{coleta.numero_coleta}</div>
                    <Badge className={getStatusColor(coleta.status)}>
                      {coleta.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(coleta.prioridade)}>
                      {coleta.prioridade}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    {coleta.modalidade_frete} • R$ {coleta.valor_estimado.toFixed(2)}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{coleta.empresa_cliente}</div>
                    <div className="text-gray-600">{coleta.endereco_coleta}</div>
                    <div className="text-gray-500">{coleta.cidade_coleta} • {coleta.zona_coleta}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Programada: {coleta.data_programada}</span>
                    </div>
                    <div className="text-gray-600">Contato: {coleta.contato}</div>
                    <div className="text-gray-500">{coleta.telefone}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredColetas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhuma coleta encontrada com os filtros aplicados.
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default ColetasDashboard;