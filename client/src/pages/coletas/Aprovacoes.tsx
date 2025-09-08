import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter,
  Eye,
  Clock,
  Building,
  MapPin,
  Package,
  User,
  Calendar,
  Truck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SolicitacaoAprovacao {
  id: string;
  numeroNota: string;
  cliente: string;
  cnpj: string;
  endereco: string;
  valorTotal: number;
  pesoTotal: number;
  volumes: number;
  datasolicitacao: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'pendente' | 'aprovada' | 'rejeitada';
  observacoes?: string;
}

const Aprovacoes: React.FC = () => {
  const { toast } = useToast();
  const [filtro, setFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState<string>('todos');

  const solicitacoes: SolicitacaoAprovacao[] = [
    {
      id: '1',
      numeroNota: '417536',
      cliente: 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA',
      cnpj: '85.179.240/0001-39',
      endereco: 'RUA GUARUJA, 434 - ITAUM - JOINVILLE/SC',
      valorTotal: 9150.00,
      pesoTotal: 16.2,
      volumes: 2,
      datasolicitacao: '2025-06-16T10:30:00',
      prioridade: 'alta',
      status: 'pendente',
      observacoes: 'Material frágil - cuidado no transporte'
    },
    {
      id: '2',
      numeroNota: '415201',
      cliente: 'METALURGICA DEL REY LTDA',
      cnpj: '12.345.678/0001-90',
      endereco: 'AV INDUSTRIAL, 1500 - DISTRITO INDUSTRIAL - SAO LUIS/MA',
      valorTotal: 25400.50,
      pesoTotal: 45.8,
      volumes: 5,
      datasolicitacao: '2025-06-16T09:15:00',
      prioridade: 'media',
      status: 'pendente'
    },
    {
      id: '3',
      numeroNota: '418923',
      cliente: 'INDUSTRIA QUIMICA NORDESTE SA',
      cnpj: '98.765.432/0001-12',
      endereco: 'RUA PETROQUIMICA, 789 - POLO INDUSTRIAL - RECIFE/PE',
      valorTotal: 8750.00,
      pesoTotal: 28.5,
      volumes: 3,
      datasolicitacao: '2025-06-16T08:45:00',
      prioridade: 'urgente',
      status: 'pendente'
    }
  ];

  const solicitacoesFiltradas = solicitacoes.filter(solicitacao => {
    const matchFiltro = solicitacao.cliente.toLowerCase().includes(filtro.toLowerCase()) ||
                       solicitacao.numeroNota.includes(filtro) ||
                       solicitacao.cnpj.includes(filtro);
    const matchStatus = statusFiltro === 'todos' || solicitacao.status === statusFiltro;
    return matchFiltro && matchStatus;
  });

  const handleAprovar = (id: string) => {
    toast({
      title: "Solicitação Aprovada",
      description: "A solicitação foi aprovada e enviada para alocação de recursos.",
      variant: "default"
    });
  };

  const handleRejeitar = (id: string) => {
    toast({
      title: "Solicitação Rejeitada",
      description: "A solicitação foi rejeitada e o cliente será notificado.",
      variant: "destructive"
    });
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Urgente</Badge>;
      case 'alta':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Alta</Badge>;
      case 'media':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Média</Badge>;
      case 'baixa':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Baixa</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-heading mb-2">Aprovações de Coleta</h1>
          <p className="text-gray-600">
            Validação e aprovação das solicitações de coleta pelos clientes
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">8</div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">15</div>
              <div className="text-sm text-gray-600">Aprovadas Hoje</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">2</div>
              <div className="text-sm text-gray-600">Rejeitadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">94%</div>
              <div className="text-sm text-gray-600">Taxa Aprovação</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por cliente, CNPJ ou número da nota..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFiltro === 'todos' ? 'default' : 'outline'}
                  onClick={() => setStatusFiltro('todos')}
                  size="sm"
                >
                  Todos
                </Button>
                <Button
                  variant={statusFiltro === 'pendente' ? 'default' : 'outline'}
                  onClick={() => setStatusFiltro('pendente')}
                  size="sm"
                >
                  Pendentes
                </Button>
                <Button
                  variant={statusFiltro === 'aprovada' ? 'default' : 'outline'}
                  onClick={() => setStatusFiltro('aprovada')}
                  size="sm"
                >
                  Aprovadas
                </Button>
                <Button
                  variant={statusFiltro === 'rejeitada' ? 'default' : 'outline'}
                  onClick={() => setStatusFiltro('rejeitada')}
                  size="sm"
                >
                  Rejeitadas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Solicitações */}
        <div className="space-y-4">
          {solicitacoesFiltradas.map((solicitacao) => (
            <Card key={solicitacao.id} className="border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">NF {solicitacao.numeroNota}</h3>
                      <p className="text-sm text-gray-600">
                        Solicitada em {formatDate(solicitacao.datasolicitacao)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getPrioridadeBadge(solicitacao.prioridade)}
                    <Badge variant="secondary">{solicitacao.status}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                  {/* Dados do Cliente */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Cliente
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Razão Social:</span><br />
                        {solicitacao.cliente}
                      </div>
                      <div>
                        <span className="font-medium">CNPJ:</span> {solicitacao.cnpj}
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span>{solicitacao.endereco}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dados da Carga */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Detalhes da Carga
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-bold text-lg text-blue-600">
                          {formatCurrency(solicitacao.valorTotal)}
                        </div>
                        <div className="text-xs text-gray-600">Valor Total</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-bold text-lg text-green-600">
                          {solicitacao.pesoTotal} kg
                        </div>
                        <div className="text-xs text-gray-600">Peso Total</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-bold text-lg text-purple-600">
                          {solicitacao.volumes}
                        </div>
                        <div className="text-xs text-gray-600">Volumes</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {solicitacao.observacoes && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-800 text-sm">Observações:</div>
                        <div className="text-yellow-700 text-sm">{solicitacao.observacoes}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ações */}
                {solicitacao.status === 'pendente' && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleAprovar(solicitacao.id)}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Aprovar Coleta
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRejeitar(solicitacao.id)}
                      className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Rejeitar
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Ver Detalhes
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {solicitacoesFiltradas.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma solicitação encontrada
              </h3>
              <p className="text-gray-600">
                Não há solicitações que correspondam aos filtros aplicados.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default Aprovacoes;