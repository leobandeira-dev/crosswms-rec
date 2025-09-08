import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Search, HelpCircle, MessageSquare, AlertTriangle, CheckCircle, Clock, User, Building } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TicketSuporte {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  prioridade: string;
  status: string;
  usuario_nome: string;
  usuario_email: string;
  empresa_nome: string;
  data_abertura: string;
  data_ultima_atualizacao: string;
  tempo_resposta: number;
  satisfacao_avaliacao: number | null;
}

export default function AdminSuporte() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [prioridadeFilter, setPrioridadeFilter] = useState('todos');
  const [categoriaFilter, setCategoriaFilter] = useState('todos');

  const { data: tickets = [], isLoading } = useQuery<TicketSuporte[]>({
    queryKey: ['/api/admin/suporte/tickets'],
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.usuario_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.empresa_nome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || ticket.status === statusFilter;
    const matchesPrioridade = prioridadeFilter === 'todos' || ticket.prioridade === prioridadeFilter;
    const matchesCategoria = categoriaFilter === 'todos' || ticket.categoria === categoriaFilter;
    
    return matchesSearch && matchesStatus && matchesPrioridade && matchesCategoria;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aberto': return 'bg-red-100 text-red-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'aguardando_cliente': return 'bg-blue-100 text-blue-800';
      case 'resolvido': return 'bg-green-100 text-green-800';
      case 'fechado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'critica': return 'bg-red-100 text-red-800';
      case 'alta': return 'bg-orange-100 text-orange-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTempoRespostaColor = (tempo: number) => {
    if (tempo <= 2) return 'text-green-600';
    if (tempo <= 24) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Estatísticas
  const ticketsAbertos = tickets.filter(t => t.status === 'aberto').length;
  const ticketsEmAndamento = tickets.filter(t => t.status === 'em_andamento').length;
  const ticketsResolvidos = tickets.filter(t => t.status === 'resolvido').length;
  const tempoMedioResposta = tickets.reduce((acc, t) => acc + t.tempo_resposta, 0) / tickets.length || 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Central de Suporte</h1>
            <p className="text-gray-600 mt-1">Gestão de tickets e atendimento ao cliente</p>
          </div>
          <Button className="bg-[#0098DA] hover:bg-[#0077B3]">
            <MessageSquare size={20} className="mr-2" />
            Novo Ticket
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Abertos</p>
                  <p className="text-2xl font-bold text-gray-900">{ticketsAbertos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                  <p className="text-2xl font-bold text-gray-900">{ticketsEmAndamento}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolvidos</p>
                  <p className="text-2xl font-bold text-gray-900">{ticketsResolvidos}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HelpCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                  <p className="text-2xl font-bold text-gray-900">{tempoMedioResposta.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tickets de Suporte</CardTitle>
            <CardDescription>
              Lista completa de solicitações de suporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por título, usuário ou empresa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="aberto">Aberto</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="aguardando_cliente">Aguardando Cliente</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={prioridadeFilter} onValueChange={setPrioridadeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                  <SelectItem value="financeiro">Financeiro</SelectItem>
                  <SelectItem value="operacional">Operacional</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0098DA] mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando tickets...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <HelpCircle size={20} className="text-[#0098DA]" />
                          <h3 className="font-semibold text-lg">{ticket.titulo}</h3>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={getPrioridadeColor(ticket.prioridade)}>
                            {ticket.prioridade}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3 line-clamp-2">{ticket.descricao}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <User size={16} />
                            <span>{ticket.usuario_nome} ({ticket.usuario_email})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building size={16} />
                            <span>{ticket.empresa_nome}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span className={getTempoRespostaColor(ticket.tempo_resposta)}>
                              Tempo resposta: {ticket.tempo_resposta.toFixed(1)}h
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Aberto: {formatDate(ticket.data_abertura)}</span>
                          <span>Última atualização: {formatDate(ticket.data_ultima_atualizacao)}</span>
                          <span>Categoria: {ticket.categoria}</span>
                          {ticket.satisfacao_avaliacao && (
                            <span>Satisfação: {ticket.satisfacao_avaliacao}/5 ⭐</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm">
                          <MessageSquare size={16} className="mr-1" />
                          Responder
                        </Button>
                        <Button variant="outline" size="sm">
                          Ver Histórico
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredTickets.length === 0 && (
                  <div className="text-center py-8">
                    <HelpCircle size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Nenhum ticket encontrado</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}