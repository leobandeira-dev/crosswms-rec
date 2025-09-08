import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Lock, 
  Key, 
  AlertTriangle,
  Settings,
  Users,
  Eye,
  Edit,
  Trash2,
  Plus,
  UserCheck,
  UserX
} from 'lucide-react';

const GestaoSeguranca = () => {
  const [activeTab, setActiveTab] = useState('usuarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const usuarios = [
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@transul.com',
      perfil: 'Operador Matriz',
      empresa: 'TRANSUL Logística',
      ultimoAcesso: '2024-01-26 14:30',
      status: 'ativo',
      tentativasLogin: 0,
      bloqueado: false
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@logimax.com',
      perfil: 'Usuário Final',
      empresa: 'LogiMax Transportes',
      ultimoAcesso: '2024-01-26 13:45',
      status: 'ativo',
      tentativasLogin: 0,
      bloqueado: false
    },
    {
      id: '3',
      nome: 'Pedro Costa',
      email: 'pedro@suspicious.com',
      perfil: 'Usuário Final',
      empresa: 'Express Cargo',
      ultimoAcesso: '2024-01-25 22:15',
      status: 'suspeito',
      tentativasLogin: 5,
      bloqueado: true
    }
  ];

  const perfisSeguranca = [
    {
      id: '1',
      nome: 'Super Usuário',
      descricao: 'Acesso total sem restrições',
      usuarios: 3,
      permissoes: ['Administração', 'Configuração', 'Visualização Ampla', 'Logs'],
      nivel: 'máximo'
    },
    {
      id: '2',
      nome: 'Operador Matriz',
      descricao: 'Gestão da empresa própria',
      usuarios: 12,
      permissoes: ['Configuração', 'Gestão Usuários', 'Relatórios'],
      nivel: 'alto'
    },
    {
      id: '3',
      nome: 'Usuário Final',
      descricao: 'Operações básicas limitadas',
      usuarios: 89,
      permissoes: ['Consulta', 'Pedidos', 'Notas Fiscais'],
      nivel: 'básico'
    }
  ];

  const configuracoesSistema = [
    {
      categoria: 'Autenticação',
      configuracoes: [
        { nome: 'Tempo de sessão (minutos)', valor: '60', tipo: 'number' },
        { nome: 'Tentativas máximas de login', valor: '3', tipo: 'number' },
        { nome: 'Bloqueio automático', valor: true, tipo: 'boolean' },
        { nome: 'Autenticação de dois fatores', valor: false, tipo: 'boolean' }
      ]
    },
    {
      categoria: 'Logs e Auditoria',
      configuracoes: [
        { nome: 'Log de acessos', valor: true, tipo: 'boolean' },
        { nome: 'Log de ações', valor: true, tipo: 'boolean' },
        { nome: 'Retenção de logs (dias)', valor: '90', tipo: 'number' },
        { nome: 'Alertas de segurança', valor: true, tipo: 'boolean' }
      ]
    }
  ];

  const handleViewUser = (user: any) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleBlockUser = (userId: string) => {
    toast({
      title: "Usuário Bloqueado",
      description: `Usuário ${userId} foi bloqueado com sucesso`,
    });
  };

  const handleUnblockUser = (userId: string) => {
    toast({
      title: "Usuário Desbloqueado", 
      description: `Usuário ${userId} foi desbloqueado com sucesso`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    toast({
      title: "Usuário Removido",
      description: `Usuário ${userId} foi removido do sistema`,
    });
  };

  const handleCreateUser = () => {
    toast({
      title: "Novo Usuário",
      description: "Abrindo formulário para criação de novo usuário",
    });
  };

  const handleUpdateSecurity = (setting: string) => {
    toast({
      title: "Configuração Atualizada",
      description: `Configuração de segurança "${setting}" foi atualizada`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800';
      case 'suspeito':
        return 'bg-red-100 text-red-800';
      case 'inativo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'máximo':
        return 'bg-red-100 text-red-800';
      case 'alto':
        return 'bg-yellow-100 text-yellow-800';
      case 'básico':
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
            <Shield className="h-8 w-8 text-red-600" />
            Gestão de Segurança
          </h1>
          <p className="text-gray-600">
            Controle de usuários, perfis e configurações de segurança do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-600">104</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Perfis de Acesso</p>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                </div>
                <Key className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Alertas Segurança</p>
                  <p className="text-2xl font-bold text-red-600">3</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Usuários Bloqueados</p>
                  <p className="text-2xl font-bold text-orange-600">1</p>
                </div>
                <Lock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Área crítica: Alterações em segurança afetam todo o sistema. Proceda com cautela.
          </AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="usuarios">Usuários</TabsTrigger>
            <TabsTrigger value="perfis">Perfis de Acesso</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="usuarios" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Gestão de Usuários</CardTitle>
                    <CardDescription>
                      Controle de todos os usuários do sistema
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar usuários..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Button onClick={handleCreateUser}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Usuário
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Perfil</TableHead>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Último Acesso</TableHead>
                      <TableHead>Tentativas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios
                      .filter(user => 
                        user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{usuario.nome}</p>
                            <p className="text-sm text-gray-600">{usuario.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{usuario.perfil}</Badge>
                        </TableCell>
                        <TableCell>{usuario.empresa}</TableCell>
                        <TableCell className="font-mono text-sm">{usuario.ultimoAcesso}</TableCell>
                        <TableCell className="text-center">
                          {usuario.tentativasLogin > 0 ? (
                            <Badge variant="destructive">{usuario.tentativasLogin}</Badge>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(usuario.status)}>
                            {usuario.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleViewUser(usuario)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditUser(usuario)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            {usuario.bloqueado ? (
                              <Button size="sm" variant="default" onClick={() => handleUnblockUser(usuario.id)}>
                                Desbloquear
                              </Button>
                            ) : (
                              <Button size="sm" variant="destructive" onClick={() => handleBlockUser(usuario.id)}>
                                <Lock className="h-3 w-3" />
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

          <TabsContent value="perfis" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Perfis de Acesso</CardTitle>
                    <CardDescription>
                      Definição de permissões e níveis de acesso
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Perfil
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {perfisSeguranca.map((perfil) => (
                    <Card key={perfil.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{perfil.nome}</h4>
                              <Badge className={getNivelColor(perfil.nivel)}>
                                {perfil.nivel}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{perfil.descricao}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {perfil.permissoes.map((permissao, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {permissao}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500">{perfil.usuarios} usuários</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="h-3 w-3" />
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
              {configuracoesSistema.map((categoria, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{categoria.categoria}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoria.configuracoes.map((config, configIndex) => (
                        <div key={configIndex} className="flex items-center justify-between">
                          <label className="text-sm font-medium">{config.nome}</label>
                          <div className="flex items-center gap-2">
                            {config.tipo === 'boolean' ? (
                              <Switch checked={config.valor as boolean} />
                            ) : (
                              <Input 
                                type={config.tipo} 
                                value={config.valor as string}
                                className="w-20 text-center"
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

export default GestaoSeguranca;