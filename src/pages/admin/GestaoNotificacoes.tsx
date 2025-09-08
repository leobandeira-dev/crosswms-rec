import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Send,
  Users,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

const GestaoNotificacoes = () => {
  const [activeTab, setActiveTab] = useState('notificacoes');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();

  const notificacoes = [
    {
      id: '1',
      titulo: 'Sistema em Manutenção',
      conteudo: 'O sistema entrará em manutenção dia 30/01 das 02:00 às 04:00',
      tipo: 'sistema',
      prioridade: 'alta',
      destinatarios: 'Todos os usuários',
      dataEnvio: '2024-01-26 14:00',
      status: 'enviada',
      lidas: 89,
      totalUsuarios: 104
    },
    {
      id: '2',
      titulo: 'Nova Funcionalidade: XML Import',
      conteudo: 'Agora você pode importar notas fiscais diretamente via XML',
      tipo: 'funcionalidade',
      prioridade: 'media',
      destinatarios: 'Operadores',
      dataEnvio: '2024-01-25 16:30',
      status: 'enviada',
      lidas: 12,
      totalUsuarios: 15
    },
    {
      id: '3',
      titulo: 'Treinamento Obrigatório',
      conteudo: 'Participe do treinamento sobre novos procedimentos de segurança',
      tipo: 'treinamento',
      prioridade: 'alta',
      destinatarios: 'Matriz TRANSUL',
      dataEnvio: null,
      status: 'rascunho',
      lidas: 0,
      totalUsuarios: 45
    }
  ];

  const templates = [
    {
      id: '1',
      nome: 'Manutenção Programada',
      assunto: 'Sistema em Manutenção - {data}',
      conteudo: 'Informamos que o sistema entrará em manutenção programada no dia {data} das {hora_inicio} às {hora_fim}.',
      variaveis: ['data', 'hora_inicio', 'hora_fim'],
      categoria: 'sistema'
    },
    {
      id: '2',
      nome: 'Nova Funcionalidade',
      assunto: 'Nova Funcionalidade: {nome_funcionalidade}',
      conteudo: 'Temos o prazer de anunciar uma nova funcionalidade: {nome_funcionalidade}. {descricao}',
      variaveis: ['nome_funcionalidade', 'descricao'],
      categoria: 'funcionalidade'
    },
    {
      id: '3',
      nome: 'Cobrança Pendente',
      assunto: 'Cobrança Pendente - Vencimento {data_vencimento}',
      conteudo: 'Prezado cliente, identificamos uma cobrança pendente no valor de R$ {valor} com vencimento em {data_vencimento}.',
      variaveis: ['data_vencimento', 'valor'],
      categoria: 'financeiro'
    }
  ];

  const configuracoes = [
    {
      categoria: 'E-mail',
      configuracoes: [
        { nome: 'Servidor SMTP', valor: 'smtp.gmail.com', tipo: 'text' },
        { nome: 'Porta SMTP', valor: '587', tipo: 'number' },
        { nome: 'Usuário SMTP', valor: 'sistema@empresa.com', tipo: 'email' },
        { nome: 'Usar TLS', valor: true, tipo: 'boolean' }
      ]
    },
    {
      categoria: 'SMS',
      configuracoes: [
        { nome: 'Provedor SMS', valor: 'Twilio', tipo: 'select', opcoes: ['Twilio', 'Total Voice', 'Zenvia'] },
        { nome: 'API Key', valor: '***************', tipo: 'password' },
        { nome: 'Número Remetente', valor: '+5511999999999', tipo: 'text' },
        { nome: 'SMS Ativo', valor: true, tipo: 'boolean' }
      ]
    }
  ];

  const handleCreateNotification = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewNotification = (notification: any) => {
    setSelectedNotification(notification);
    setIsViewModalOpen(true);
  };

  const handleEditNotification = (notificationId: string) => {
    toast({
      title: "Editar Notificação",
      description: `Editando notificação ${notificationId}`,
    });
  };

  const handleDeleteNotification = (notificationId: string) => {
    toast({
      title: "Notificação Removida",
      description: `Notificação ${notificationId} foi removida`,
    });
  };

  const handleSendNotification = (notificationId: string) => {
    toast({
      title: "Notificação Enviada",
      description: `Notificação ${notificationId} foi enviada com sucesso`,
    });
  };

  const handleUseTemplate = (templateId: string) => {
    toast({
      title: "Template Selecionado",
      description: `Usando template ${templateId} para nova notificação`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enviada':
        return 'bg-green-100 text-green-800';
      case 'rascunho':
        return 'bg-yellow-100 text-yellow-800';
      case 'agendada':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baixa':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Bell className="h-8 w-8 text-blue-600" />
            Gestão de Notificações
          </h1>
          <p className="text-gray-600">
            Comunicação centralizada - E-mails, SMS e notificações do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Enviadas Hoje</p>
                  <p className="text-2xl font-bold text-blue-600">47</p>
                </div>
                <Send className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa de Leitura</p>
                  <p className="text-2xl font-bold text-green-600">87.3%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Agendadas</p>
                  <p className="text-2xl font-bold text-orange-600">12</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Templates</p>
                  <p className="text-2xl font-bold text-purple-600">18</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="notificacoes" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Notificações do Sistema</CardTitle>
                    <CardDescription>
                      Gestão de todas as comunicações enviadas aos usuários
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar notificações..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Button onClick={handleCreateNotification}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Notificação
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Destinatários</TableHead>
                      <TableHead>Taxa Leitura</TableHead>
                      <TableHead>Data Envio</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notificacoes
                      .filter(notif => 
                        notif.titulo.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((notificacao) => (
                      <TableRow key={notificacao.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{notificacao.titulo}</p>
                            <p className="text-sm text-gray-600 max-w-xs truncate">
                              {notificacao.conteudo}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{notificacao.tipo}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPrioridadeColor(notificacao.prioridade)}>
                            {notificacao.prioridade}
                          </Badge>
                        </TableCell>
                        <TableCell>{notificacao.destinatarios}</TableCell>
                        <TableCell>
                          {notificacao.status === 'enviada' ? (
                            <div className="text-sm">
                              <span className="font-medium">
                                {((notificacao.lidas / notificacao.totalUsuarios) * 100).toFixed(1)}%
                              </span>
                              <p className="text-gray-500">
                                {notificacao.lidas}/{notificacao.totalUsuarios}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {notificacao.dataEnvio ? (
                            <span className="font-mono text-sm">{notificacao.dataEnvio}</span>
                          ) : (
                            <span className="text-gray-400">Não enviada</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(notificacao.status)}>
                            {notificacao.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleViewNotification(notificacao)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditNotification(notificacao.id)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            {notificacao.status === 'rascunho' && (
                              <Button size="sm" variant="default" onClick={() => handleSendNotification(notificacao.id)}>
                                <Send className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Templates de Notificação</CardTitle>
                    <CardDescription>
                      Modelos reutilizáveis para comunicações padronizadas
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{template.nome}</h4>
                              <Badge variant="outline">{template.categoria}</Badge>
                            </div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Assunto: {template.assunto}
                            </p>
                            <p className="text-sm text-gray-600 mb-3 max-w-2xl">
                              {template.conteudo}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs text-gray-500 mr-2">Variáveis:</span>
                              {template.variaveis.map((variavel, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {`{${variavel}}`}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="mt-6">
            <div className="grid gap-6">
              {configuracoes.map((categoria, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Configurações de {categoria.categoria}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoria.configuracoes.map((config, configIndex) => (
                        <div key={configIndex} className="flex items-center justify-between">
                          <label className="text-sm font-medium">{config.nome}</label>
                          <div className="flex items-center gap-2">
                            {config.tipo === 'boolean' ? (
                              <Switch checked={config.valor as boolean} />
                            ) : config.tipo === 'select' ? (
                              <Select value={config.valor as string}>
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {config.opcoes?.map((opcao) => (
                                    <SelectItem key={opcao} value={opcao}>
                                      {opcao}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input 
                                type={config.tipo} 
                                value={config.valor as string}
                                className="w-48"
                                placeholder={config.nome}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default GestaoNotificacoes;