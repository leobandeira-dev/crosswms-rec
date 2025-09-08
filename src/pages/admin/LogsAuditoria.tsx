import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  Shield, 
  Clock, 
  User, 
  Search,
  Filter,
  Download,
  AlertTriangle,
  Eye,
  Database,
  Lock,
  FileSpreadsheet
} from 'lucide-react';

const LogsAuditoria = () => {
  const [activeTab, setActiveTab] = useState('acessos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('hoje');
  const { toast } = useToast();

  const acessosData = [
    {
      id: '1',
      usuario: 'João Silva',
      email: 'joao@empresa.com',
      ip: '192.168.1.100',
      acao: 'Login',
      modulo: 'Dashboard',
      timestamp: '2024-01-26 14:30:15',
      status: 'sucesso',
      dispositivo: 'Chrome/Windows'
    },
    {
      id: '2',
      usuario: 'Maria Santos',
      email: 'maria@empresa.com',
      ip: '10.0.0.50',
      acao: 'Acesso Negado',
      modulo: 'Administração',
      timestamp: '2024-01-26 14:25:42',
      status: 'falha',
      dispositivo: 'Firefox/Linux'
    },
    {
      id: '3',
      usuario: 'Super Admin',
      email: 'leonardobandeir@gmail.com',
      ip: '203.45.67.89',
      acao: 'Visualização',
      modulo: 'Logs e Auditoria',
      timestamp: '2024-01-26 14:20:30',
      status: 'sucesso',
      dispositivo: 'Chrome/macOS'
    }
  ];

  const acoesData = [
    {
      id: '1',
      usuario: 'João Silva',
      acao: 'Criação de Nota Fiscal',
      recurso: 'NF-2024-001234',
      detalhes: 'Nota fiscal criada para cliente ABC Ltda',
      timestamp: '2024-01-26 14:15:30',
      ip: '192.168.1.100'
    },
    {
      id: '2',
      usuario: 'Maria Santos',
      acao: 'Alteração de Permissão',
      recurso: 'Usuario-456',
      detalhes: 'Permissão de acesso ao módulo Expedição removida',
      timestamp: '2024-01-26 14:10:15',
      ip: '10.0.0.50'
    },
    {
      id: '3',
      usuario: 'Pedro Costa',
      acao: 'Exclusão de Registro',
      recurso: 'Veiculo-789',
      detalhes: 'Veículo ABC-1234 removido do sistema',
      timestamp: '2024-01-26 14:05:42',
      ip: '172.16.0.25'
    }
  ];

  const segurancaData = [
    {
      id: '1',
      tipo: 'Tentativa de Invasão',
      ip: '198.51.100.42',
      detalhes: 'Múltiplas tentativas de login com credenciais inválidas',
      severidade: 'alta',
      timestamp: '2024-01-26 13:45:30',
      status: 'bloqueado'
    },
    {
      id: '2',
      tipo: 'Acesso Suspeito',
      ip: '203.0.113.15',
      detalhes: 'Acesso de localização não usual para usuário',
      severidade: 'media',
      timestamp: '2024-01-26 13:30:22',
      status: 'investigando'
    },
    {
      id: '3',
      tipo: 'Alteração de Dados Críticos',
      ip: '192.168.1.100',
      detalhes: 'Modificação em massa de permissões de usuário',
      severidade: 'baixa',
      timestamp: '2024-01-26 13:15:10',
      status: 'aprovado'
    }
  ];

  const handleExportLogs = () => {
    toast({
      title: "Exportação Iniciada",
      description: "O relatório de logs será baixado em instantes",
    });
  };

  const handleViewDetails = (logId: string) => {
    toast({
      title: "Detalhes do Log",
      description: `Visualizando detalhes do log ${logId}`,
    });
  };

  const handleResolveAlert = (alertId: string) => {
    toast({
      title: "Alerta Resolvido",
      description: `Alerta de segurança ${alertId} foi marcado como resolvido`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sucesso':
      case 'aprovado':
        return 'bg-green-100 text-green-800';
      case 'falha':
      case 'bloqueado':
        return 'bg-red-100 text-red-800';
      case 'investigando':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
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
            <Activity className="h-8 w-8 text-orange-600" />
            Logs e Auditoria
          </h1>
          <p className="text-gray-600">
            Controle total de logs e auditoria de acessos - Monitoramento completo do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Acessos Hoje</p>
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ações Registradas</p>
                  <p className="text-2xl font-bold text-green-600">3,892</p>
                </div>
                <Database className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Alertas Segurança</p>
                  <p className="text-2xl font-bold text-red-600">12</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-purple-600">89</p>
                </div>
                <Shield className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Todos os acessos e ações são registrados com timestamp, IP e detalhes completos para auditoria.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="acessos">Logs de Acesso</TabsTrigger>
            <TabsTrigger value="acoes">Registro de Ações</TabsTrigger>
            <TabsTrigger value="seguranca">Alertas de Segurança</TabsTrigger>
          </TabsList>

          <TabsContent value="acessos" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Logs de Acesso ao Sistema</CardTitle>
                    <CardDescription>
                      Monitoramento completo de acessos e tentativas de login
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hoje">Hoje</SelectItem>
                        <SelectItem value="semana">Esta Semana</SelectItem>
                        <SelectItem value="mes">Este Mês</SelectItem>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Buscar por usuário..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Button variant="outline" onClick={handleExportLogs}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Módulo</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Dispositivo</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acessosData
                      .filter(item => 
                        item.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.usuario}</p>
                            <p className="text-sm text-gray-600">{log.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{log.acao}</TableCell>
                        <TableCell>{log.modulo}</TableCell>
                        <TableCell className="font-mono text-sm">{log.ip}</TableCell>
                        <TableCell className="text-sm">{log.dispositivo}</TableCell>
                        <TableCell className="font-mono text-sm">{log.timestamp}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="acoes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Registro de Ações dos Usuários</CardTitle>
                <CardDescription>
                  Histórico detalhado de todas as ações realizadas no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Recurso</TableHead>
                      <TableHead>Detalhes</TableHead>
                      <TableHead>IP</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {acoesData.map((acao) => (
                      <TableRow key={acao.id}>
                        <TableCell className="font-medium">{acao.usuario}</TableCell>
                        <TableCell>{acao.acao}</TableCell>
                        <TableCell className="font-mono text-sm">{acao.recurso}</TableCell>
                        <TableCell className="max-w-xs truncate">{acao.detalhes}</TableCell>
                        <TableCell className="font-mono text-sm">{acao.ip}</TableCell>
                        <TableCell className="font-mono text-sm">{acao.timestamp}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seguranca" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertas de Segurança</CardTitle>
                <CardDescription>
                  Monitoramento de atividades suspeitas e tentativas de invasão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Alerta</TableHead>
                      <TableHead>IP Origem</TableHead>
                      <TableHead>Detalhes</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {segurancaData.map((alerta) => (
                      <TableRow key={alerta.id}>
                        <TableCell className="font-medium">{alerta.tipo}</TableCell>
                        <TableCell className="font-mono text-sm">{alerta.ip}</TableCell>
                        <TableCell className="max-w-xs truncate">{alerta.detalhes}</TableCell>
                        <TableCell>
                          <Badge className={getSeveridadeColor(alerta.severidade)}>
                            {alerta.severidade}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{alerta.timestamp}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(alerta.status)}>
                            {alerta.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default LogsAuditoria;