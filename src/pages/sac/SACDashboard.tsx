import React, { useState } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Phone,
  MessageSquare,
  Mail,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  FileText,
  Search,
  Plus,
  Edit,
  Eye,
  Star,
  TrendingUp,
  Calendar,
  Headphones,
  Users,
  Target
} from 'lucide-react';

const SACDashboard = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewOcorrenciaDialog, setShowNewOcorrenciaDialog] = useState(false);

  // Mock data for customer service operations
  const ocorrencias = [
    {
      id: 'SAC-2024-001',
      tipo: 'Atraso na Entrega',
      prioridade: 'alta',
      status: 'em_andamento',
      cliente: {
        nome: 'Distribuidora ABC Ltda',
        cnpj: '12.345.678/0001-90',
        contato: 'João Silva - (11) 99999-9999'
      },
      descricao: 'Cliente relata atraso de 3 dias na entrega da carga NF 45821',
      data_abertura: '2024-06-12 09:30',
      prazo_resolucao: '2024-06-13 18:00',
      responsavel: 'Maria Santos',
      canal: 'telefone',
      categoria: 'logistica',
      satisfacao: null,
      tempo_primeira_resposta: '15 min',
      historico_interacoes: 3
    },
    {
      id: 'SAC-2024-002',
      tipo: 'Produto Danificado',
      prioridade: 'media',
      status: 'aguardando_cliente',
      cliente: {
        nome: 'Comércio XYZ S.A.',
        cnpj: '98.765.432/0001-10',
        contato: 'Ana Costa - ana@xyz.com'
      },
      descricao: 'Recebimento de produtos com avarias na embalagem',
      data_abertura: '2024-06-11 14:20',
      prazo_resolucao: '2024-06-14 17:00',
      responsavel: 'Carlos Oliveira',
      canal: 'email',
      categoria: 'qualidade',
      satisfacao: null,
      tempo_primeira_resposta: '2h 30min',
      historico_interacoes: 5
    },
    {
      id: 'SAC-2024-003',
      tipo: 'Solicitação de Informações',
      prioridade: 'baixa',
      status: 'resolvido',
      cliente: {
        nome: 'Indústria DEF Ltda',
        cnpj: '11.222.333/0001-44',
        contato: 'Pedro Santos - pedro@def.com'
      },
      descricao: 'Consulta sobre prazos de entrega para nova região',
      data_abertura: '2024-06-10 11:15',
      prazo_resolucao: '2024-06-12 17:00',
      responsavel: 'Fernanda Lima',
      canal: 'chat',
      categoria: 'comercial',
      satisfacao: 5,
      tempo_primeira_resposta: '5 min',
      historico_interacoes: 2
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto': return 'bg-yellow-100 text-yellow-800';
      case 'em_andamento': return 'bg-blue-100 text-blue-800';
      case 'aguardando_cliente': return 'bg-orange-100 text-orange-800';
      case 'resolvido': return 'bg-green-100 text-green-800';
      case 'fechado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCanalIcon = (canal: string) => {
    switch (canal) {
      case 'telefone': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredOcorrencias = ocorrencias.filter(ocorrencia => {
    const matchesSearch = ocorrencia.id.includes(searchTerm) ||
                         ocorrencia.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ocorrencia.tipo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ocorrencia.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout title="SAC - Atendimento ao Cliente">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">SAC - Atendimento ao Cliente</h2>
        <p className="text-gray-600">Central de atendimento e gestão de ocorrências</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Dialog open={showNewOcorrenciaDialog} onOpenChange={setShowNewOcorrenciaDialog}>
          <DialogTrigger asChild>
            <Button className="h-16 flex flex-col items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Ocorrência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Ocorrência SAC</DialogTitle>
              <DialogDescription>
                Registre uma nova ocorrência de atendimento ao cliente
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente1">Distribuidora ABC Ltda</SelectItem>
                    <SelectItem value="cliente2">Comércio XYZ S.A.</SelectItem>
                    <SelectItem value="cliente3">Indústria DEF Ltda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Ocorrência</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="atraso">Atraso na Entrega</SelectItem>
                    <SelectItem value="dano">Produto Danificado</SelectItem>
                    <SelectItem value="info">Solicitação de Informações</SelectItem>
                    <SelectItem value="reclamacao">Reclamação</SelectItem>
                    <SelectItem value="elogio">Elogio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="baixa">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="canal">Canal</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Canal de atendimento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="chat">Chat</SelectItem>
                    <SelectItem value="presencial">Presencial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria da ocorrência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="logistica">Logística</SelectItem>
                    <SelectItem value="qualidade">Qualidade</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="financeiro">Financeiro</SelectItem>
                    <SelectItem value="tecnico">Técnico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea id="descricao" placeholder="Descreva detalhadamente a ocorrência..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewOcorrenciaDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowNewOcorrenciaDialog(false)}>
                Registrar Ocorrência
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button 
          onClick={() => setLocation('/sac/atendimentos')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <Headphones className="h-5 w-5" />
          Atendimentos
        </Button>

        <Button 
          onClick={() => setLocation('/sac/chamados')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <FileText className="h-5 w-5" />
          Chamados
        </Button>

        <Button 
          onClick={() => setLocation('/relatorios/sac')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <Target className="h-5 w-5" />
          Relatórios
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
              Ocorrências Abertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">28</div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Clock className="mr-2 h-4 w-4 text-blue-500" />
              Tempo Médio Resolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">1.2h</div>
            <p className="text-xs text-muted-foreground">Meta: 2h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Star className="mr-2 h-4 w-4 text-yellow-500" />
              Satisfação Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">4.6</div>
            <p className="text-xs text-muted-foreground">de 5.0 estrelas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Resolvidas Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">45</div>
            <p className="text-xs text-muted-foreground">+12% vs. ontem</p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Phone className="mr-2 h-4 w-4 text-green-500" />
              Atendimento Telefônico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold">156</span>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground">Chamadas hoje</p>
            <div className="mt-2 text-xs text-gray-500">
              Tempo médio: 3m 45s
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-blue-500" />
              Chat Online
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold">8</span>
              <span className="text-green-500 text-xs">Ativo</span>
            </div>
            <p className="text-xs text-muted-foreground">Conversas ativas</p>
            <div className="mt-2 text-xs text-gray-500">
              Fila de espera: 3
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Mail className="mr-2 h-4 w-4 text-purple-500" />
              E-mail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold">23</span>
              <span className="text-yellow-500 text-xs">Pendente</span>
            </div>
            <p className="text-xs text-muted-foreground">E-mails pendentes</p>
            <div className="mt-2 text-xs text-gray-500">
              Respondidos: 67
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occurrences Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ocorrências SAC</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por ID, cliente ou tipo..."
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
                <SelectItem value="aberto">Aberto</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="aguardando_cliente">Aguardando Cliente</SelectItem>
                <SelectItem value="resolvido">Resolvido</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Filtrar por Data
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID / Tipo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Tempo Resposta</TableHead>
                  <TableHead>Satisfação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOcorrencias.map((ocorrencia) => (
                  <TableRow key={ocorrencia.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{ocorrencia.id}</div>
                        <div className="text-sm text-gray-500">{ocorrencia.tipo}</div>
                        <div className="text-xs text-gray-400">{ocorrencia.data_abertura}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{ocorrencia.cliente.nome}</div>
                        <div className="text-xs text-gray-500">{ocorrencia.cliente.cnpj}</div>
                        <div className="text-xs text-gray-400">{ocorrencia.cliente.contato}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPrioridadeColor(ocorrencia.prioridade)}>
                        {ocorrencia.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ocorrencia.status)}>
                        {ocorrencia.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{ocorrencia.responsavel}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCanalIcon(ocorrencia.canal)}
                        <span className="text-sm capitalize">{ocorrencia.canal}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{ocorrencia.tempo_primeira_resposta}</div>
                      <div className="text-xs text-gray-500">{ocorrencia.historico_interacoes} interações</div>
                    </TableCell>
                    <TableCell>
                      {ocorrencia.satisfacao ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm">{ocorrencia.satisfacao}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Pendente</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredOcorrencias.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Nenhuma ocorrência encontrada com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default SACDashboard;