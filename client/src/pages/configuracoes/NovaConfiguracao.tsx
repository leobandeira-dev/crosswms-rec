import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building, Users, FileCheck, Shield, CreditCard, Settings, 
  Edit, Save, Mail, MapPin, Phone, UserPlus, Clock, AlertCircle, 
  CheckCircle, Search, Plus, Trash2, Pause, X, Check, Bell
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import GitHubIntegration from './GitHubIntegration';

const NovaConfiguracao = () => {
  const [activeTab, setActiveTab] = useState('empresa');
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const tabs = [
    { id: 'empresa', label: 'Empresa', icon: Building },
    { id: 'usuarios', label: 'Usuários', icon: Users },
    { id: 'acesso', label: 'Controle de Acesso', icon: Shield },
    { id: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
    { id: 'sistema', label: 'Sistema', icon: Settings },
    { id: 'versoes', label: 'Versões', icon: FileCheck }
  ];

  return (
    <MainLayout title="Configurações">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-heading mb-2">Configurações</h2>
          <p className="text-gray-600">Gerencie suas operações logísticas de forma eficiente</p>
        </div>

        {/* Configuration Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Configurações do Sistema</h3>
            
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white text-[#0098DA] shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            {activeTab === 'empresa' && <EmpresaTab user={user} />}
            {activeTab === 'usuarios' && <NovaUsuariosTab />}
            {activeTab === 'acesso' && <ControleAcessoTab />}
            {activeTab === 'pagamentos' && <PagamentosTab />}
            {activeTab === 'sistema' && <SistemaTab user={user} />}
            {activeTab === 'versoes' && <GitHubIntegration />}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Empresa Tab
const EmpresaTab = ({ user }: { user: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { data: empresaData, isLoading, refetch } = useQuery({
    queryKey: ['empresa', user?.empresa_id],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar dados do usuário');
      const userData = await response.json();
      
      if (userData.empresa_id) {
        const empresaResponse = await fetch(`/api/empresas/${userData.empresa_id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!empresaResponse.ok) throw new Error('Erro ao carregar dados da empresa');
        return empresaResponse.json();
      }
      
      throw new Error('Usuário não possui empresa associada');
    },
    enabled: true
  });

  const [formData, setFormData] = useState({
    cnpj: '',
    razao_social: '',
    nome_fantasia: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    email: '',
    telefone: '',
    celular: '',
    website: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: ''
  });

  useEffect(() => {
    if (empresaData) {
      setFormData({
        cnpj: empresaData.cnpj || '',
        razao_social: empresaData.nome || '', // 'nome' é o campo no banco
        nome_fantasia: empresaData.nome_fantasia || '',
        inscricao_estadual: empresaData.inscricao_estadual || '',
        inscricao_municipal: empresaData.inscricao_municipal || '',
        email: empresaData.email || '',
        telefone: empresaData.telefone || '',
        celular: empresaData.celular || '',
        website: empresaData.website || '',
        logradouro: empresaData.logradouro || '',
        numero: empresaData.numero || '',
        complemento: empresaData.complemento || '',
        bairro: empresaData.bairro || '',
        cidade: empresaData.cidade || '',
        uf: empresaData.uf || '',
        cep: empresaData.cep || ''
      });
    }
  }, [empresaData]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const token = localStorage.getItem('token');
      const empresaId = empresaData?.id || user?.empresa_id;
      if (!empresaId) {
        throw new Error('ID da empresa não encontrado');
      }
      const response = await fetch(`/api/empresas/${empresaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao salvar dados da empresa');
      return response.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      refetch();
      toast({
        title: "Dados salvos",
        description: "Dados da empresa atualizados com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar dados da empresa",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Informações da Empresa</h3>
          <p className="text-gray-600">Configure dados básicos da empresa</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => saveMutation.mutate(formData)}
                disabled={saveMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Dados Básicos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="razao_social">Razão Social</Label>
              <Input
                id="razao_social"
                value={formData.razao_social}
                onChange={(e) => setFormData(prev => ({ ...prev, razao_social: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
              <Input
                id="nome_fantasia"
                value={formData.nome_fantasia}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_fantasia: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Endereço
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="logradouro">Logradouro</Label>
              <Input
                id="logradouro"
                value={formData.logradouro}
                onChange={(e) => setFormData(prev => ({ ...prev, logradouro: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData(prev => ({ ...prev, numero: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="uf">UF</Label>
              <Input
                id="uf"
                value={formData.uf}
                onChange={(e) => setFormData(prev => ({ ...prev, uf: e.target.value }))}
                disabled={!isEditing}
                maxLength={2}
              />
            </div>
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => setFormData(prev => ({ ...prev, cep: e.target.value }))}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Nova Usuários Tab (CRUD completo com dados de empresa e estatísticas por perfil)
const NovaUsuariosTab = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');
  const [selectedPerfil, setSelectedPerfil] = useState('todos');
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar usuários');
      return response.json();
    }
  });

  const { data: perfis } = useQuery({
    queryKey: ['perfis'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/perfis', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar perfis');
      return response.json();
    }
  });

  const { data: empresas } = useQuery({
    queryKey: ['empresas-all'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/empresas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar empresas');
      return response.json();
    }
  });

  const alterarStatusMutation = useMutation({
    mutationFn: async ({ usuarioId, novoStatus }: { usuarioId: string; novoStatus: string }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/usuarios/${usuarioId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: novoStatus })
      });
      if (!response.ok) throw new Error('Erro ao alterar status do usuário');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: "Status alterado",
        description: "Status do usuário alterado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do usuário",
        variant: "destructive",
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (usuarioId: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/usuarios/${usuarioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao excluir usuário');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: "Usuário excluído",
        description: "Usuário excluído com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir usuário",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Separar TODOS os usuários por status (para estatísticas corretas)
  const todosUsuariosPorStatus = {
    pendente_aprovacao: usuarios?.filter((u: any) => u.status === 'pendente_aprovacao') || [],
    ativo: usuarios?.filter((u: any) => u.status === 'ativo') || [],
    inativo: usuarios?.filter((u: any) => u.status === 'inativo') || [],
    rejeitado: usuarios?.filter((u: any) => u.status === 'rejeitado') || []
  };

  // Estatísticas por perfil - corrigir contagem com validação detalhada
  const usuariosPorPerfil = perfis?.reduce((acc: any, perfil: any) => {
    const usuariosComEssePerfil = usuarios?.filter((u: any) => {
      // Debug específico para entender a relação
      if (u.perfil_id === perfil.id) {
        console.log(`Usuario ${u.nome} tem perfil ${perfil.nome} (${perfil.id})`);
      }
      return u.perfil_id === perfil.id;
    }) || [];
    
    acc[perfil.nome] = usuariosComEssePerfil.length;
    return acc;
  }, {}) || {};

  // Debug detalhado
  console.log('Debug - Total perfis:', perfis?.length);
  console.log('Debug - Total usuarios:', usuarios?.length);
  console.log('Debug - Mapeamento perfil_id para usuarios:');
  usuarios?.forEach((user: any) => {
    const perfilNome = perfis?.find((p: any) => p.id === user.perfil_id)?.nome || 'Perfil não encontrado';
    console.log(`  ${user.nome} -> perfil_id: ${user.perfil_id} -> ${perfilNome}`);
  });

  // Filtrar usuários por pesquisa, status e perfil
  const usuariosFiltrados = usuarios?.filter((usuario: any) => {
    const matchesSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.tipo_usuario.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'todos' || usuario.status === selectedStatus;
    const matchesPerfil = selectedPerfil === 'todos' || usuario.perfil_id === selectedPerfil;
    
    return matchesSearch && matchesStatus && matchesPerfil;
  }) || [];

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      pendente_aprovacao: 'bg-orange-100 text-orange-800',
      ativo: 'bg-green-100 text-green-800',
      inativo: 'bg-gray-100 text-gray-800',
      rejeitado: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pendente_aprovacao: 'Pendente',
      ativo: 'Ativo',
      inativo: 'Inativo',
      rejeitado: 'Rejeitado'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const UserCard = ({ usuario }: { usuario: any }) => {
    const empresa = empresas?.find((e: any) => e.id === usuario.empresa_id);
    const perfil = perfis?.find((p: any) => p.id === usuario.perfil_id);

    return (
      <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold">{usuario.nome}</h4>
            <StatusBadge status={usuario.status} />
          </div>
          <p className="text-sm text-gray-600">{usuario.email}</p>
          <p className="text-sm text-gray-500">Perfil: {perfil?.nome || 'N/A'}</p>
          <p className="text-sm text-gray-500">Empresa: {empresa?.nome || 'N/A'}</p>
          {usuario.telefone && (
            <p className="text-xs text-gray-400">Tel: {usuario.telefone}</p>
          )}
          {usuario.created_at && (
            <p className="text-xs text-gray-400">
              Cadastrado em: {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Select 
            value={usuario.status} 
            onValueChange={(novoStatus) => alterarStatusMutation.mutate({ usuarioId: usuario.id, novoStatus })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendente_aprovacao">Pendente</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="rejeitado">Rejeitado</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log('Editando usuário:', usuario);
              setEditingUser(usuario);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => deleteUserMutation.mutate(usuario.id)}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gestão de Usuários</h3>
          <p className="text-gray-600">Gerencie usuários, status e dados das empresas</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Pesquisar por nome, email ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente_aprovacao">Pendente Aprovação</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPerfil} onValueChange={setSelectedPerfil}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Perfis</SelectItem>
                {perfis?.map((perfil: any) => (
                  <SelectItem key={perfil.id} value={perfil.id}>
                    {perfil.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas por Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{todosUsuariosPorStatus.pendente_aprovacao.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{todosUsuariosPorStatus.ativo.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Pause className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-gray-600">{todosUsuariosPorStatus.inativo.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Rejeitados</p>
                <p className="text-2xl font-bold text-red-600">{todosUsuariosPorStatus.rejeitado.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas por Perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Usuários por Perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(usuariosPorPerfil).map(([perfil, count]) => (
              <div key={perfil} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">{perfil}</span>
                <span className="text-xl font-bold text-blue-600">{count as number}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Usuários ({usuariosFiltrados.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usuariosFiltrados.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="space-y-3">
              {usuariosFiltrados.map((usuario: any) => (
                <UserCard key={usuario.id} usuario={usuario} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição de Usuário */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Editar Usuário</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={editingUser.nome}
                  onChange={(e) => setEditingUser({...editingUser, nome: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={editingUser.telefone || ''}
                  onChange={(e) => setEditingUser({...editingUser, telefone: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="perfil">Perfil</Label>
                <Select 
                  value={editingUser.perfil_id || ''} 
                  onValueChange={(value) => setEditingUser({...editingUser, perfil_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {perfis?.map((perfil: any) => (
                      <SelectItem key={perfil.id} value={perfil.id}>
                        {perfil.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={editingUser.status} 
                  onValueChange={(value) => setEditingUser({...editingUser, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente_aprovacao">Pendente</SelectItem>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={async () => {
                  try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`/api/usuarios/${editingUser.id}`, {
                      method: 'PATCH',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({
                        nome: editingUser.nome,
                        email: editingUser.email,
                        telefone: editingUser.telefone,
                        perfil_id: editingUser.perfil_id,
                        status: editingUser.status
                      })
                    });
                    
                    if (response.ok) {
                      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
                      setEditingUser(null);
                      toast({
                        title: "Usuário atualizado",
                        description: "Dados do usuário atualizados com sucesso",
                      });
                    }
                  } catch (error) {
                    toast({
                      title: "Erro",
                      description: "Erro ao atualizar usuário",
                      variant: "destructive",
                    });
                  }
                }}
                className="flex-1"
              >
                Salvar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setEditingUser(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Aprovações Tab
const AprovacoesTab = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todos');

  const { data: usuarios, isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar usuários');
      return response.json();
    }
  });

  const alterarStatusMutation = useMutation({
    mutationFn: async ({ usuarioId, novoStatus }: { usuarioId: string; novoStatus: string }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/usuarios/${usuarioId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: novoStatus })
      });
      if (!response.ok) throw new Error('Erro ao alterar status do usuário');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast({
        title: "Status alterado",
        description: "Status do usuário alterado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao alterar status do usuário",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Separar TODOS os usuários por status (para estatísticas corretas)
  const todosUsuariosPorStatus = {
    pendente_aprovacao: usuarios?.filter((u: any) => u.status === 'pendente_aprovacao') || [],
    ativo: usuarios?.filter((u: any) => u.status === 'ativo') || [],
    inativo: usuarios?.filter((u: any) => u.status === 'inativo') || [],
    rejeitado: usuarios?.filter((u: any) => u.status === 'rejeitado') || []
  };

  // Filtrar usuários por pesquisa e status (para exibição)
  const usuariosFiltrados = usuarios?.filter((usuario: any) => {
    const matchesSearch = usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         usuario.tipo_usuario.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedStatus === 'todos') return matchesSearch;
    return matchesSearch && usuario.status === selectedStatus;
  }) || [];

  // Separar usuários filtrados por status (para exibição)
  const usuariosPorStatus = {
    pendente_aprovacao: usuariosFiltrados.filter((u: any) => u.status === 'pendente_aprovacao'),
    ativo: usuariosFiltrados.filter((u: any) => u.status === 'ativo'),
    inativo: usuariosFiltrados.filter((u: any) => u.status === 'inativo'),
    rejeitado: usuariosFiltrados.filter((u: any) => u.status === 'rejeitado')
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      pendente_aprovacao: 'bg-orange-100 text-orange-800',
      ativo: 'bg-green-100 text-green-800',
      inativo: 'bg-gray-100 text-gray-800',
      rejeitado: 'bg-red-100 text-red-800'
    };
    
    const labels = {
      pendente_aprovacao: 'Pendente',
      ativo: 'Ativo',
      inativo: 'Inativo',
      rejeitado: 'Rejeitado'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const UserCard = ({ usuario }: { usuario: any }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-semibold">{usuario.nome}</h4>
          <StatusBadge status={usuario.status} />
        </div>
        <p className="text-sm text-gray-600">{usuario.email}</p>
        <p className="text-sm text-gray-500">Tipo: {usuario.tipo_usuario}</p>
        {usuario.created_at && (
          <p className="text-xs text-gray-400">
            Cadastrado em: {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
      <div className="flex gap-2">
        <Select 
          value={usuario.status} 
          onValueChange={(novoStatus) => alterarStatusMutation.mutate({ usuarioId: usuario.id, novoStatus })}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendente_aprovacao">Pendente</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="rejeitado">Rejeitado</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Central de Aprovações</h3>
          <p className="text-gray-600">Gerencie status de usuários do sistema</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Pesquisar por nome, email ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="pendente_aprovacao">Pendente Aprovação</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{todosUsuariosPorStatus.pendente_aprovacao.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">{todosUsuariosPorStatus.ativo.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Pause className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-gray-600">{todosUsuariosPorStatus.inativo.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Rejeitados</p>
                <p className="text-2xl font-bold text-red-600">{todosUsuariosPorStatus.rejeitado.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Usuários por Status */}
      {selectedStatus === 'todos' ? (
        <div className="space-y-6">
          {usuariosPorStatus.pendente_aprovacao.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Pendentes de Aprovação ({usuariosPorStatus.pendente_aprovacao.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {usuariosPorStatus.pendente_aprovacao.map((usuario: any) => (
                  <UserCard key={usuario.id} usuario={usuario} />
                ))}
              </CardContent>
            </Card>
          )}

          {usuariosPorStatus.ativo.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Usuários Ativos ({usuariosPorStatus.ativo.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {usuariosPorStatus.ativo.map((usuario: any) => (
                  <UserCard key={usuario.id} usuario={usuario} />
                ))}
              </CardContent>
            </Card>
          )}

          {usuariosPorStatus.inativo.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pause className="h-5 w-5 text-gray-600" />
                  Usuários Inativos ({usuariosPorStatus.inativo.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {usuariosPorStatus.inativo.map((usuario: any) => (
                  <UserCard key={usuario.id} usuario={usuario} />
                ))}
              </CardContent>
            </Card>
          )}

          {usuariosPorStatus.rejeitado.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-600" />
                  Usuários Rejeitados ({usuariosPorStatus.rejeitado.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {usuariosPorStatus.rejeitado.map((usuario: any) => (
                  <UserCard key={usuario.id} usuario={usuario} />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedStatus === 'pendente_aprovacao' && 'Usuários Pendentes'}
              {selectedStatus === 'ativo' && 'Usuários Ativos'}
              {selectedStatus === 'inativo' && 'Usuários Inativos'}
              {selectedStatus === 'rejeitado' && 'Usuários Rejeitados'}
              ({usuariosFiltrados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usuariosFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Nenhum usuário encontrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {usuariosFiltrados.map((usuario: any) => (
                  <UserCard key={usuario.id} usuario={usuario} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Controle de Acesso Tab
const ControleAcessoTab = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerfil, setSelectedPerfil] = useState('');
  const [moduleAccess, setModuleAccess] = useState<{ [key: string]: any }>({});
  const [showNewPerfilModal, setShowNewPerfilModal] = useState(false);
  const [newPerfilData, setNewPerfilData] = useState({
    nome: '',
    descricao: '',
    tipo_perfil: 'usuario_operacional',
    nivel_hierarquia: 3
  });
  const queryClient = useQueryClient();

  // Módulos do sistema com todas as rotas específicas mapeadas
  const modulosSistema = [
    { 
      id: 'dashboard', 
      nome: 'Dashboard', 
      titulo: 'Painel de Controle', 
      rota_base: '/dashboard', 
      icone: 'BarChart3',
      rotas: [
        { id: 'dashboard_principal', nome: 'Dashboard Principal', rota: '/dashboard', descricao: 'Acesso ao painel principal de controle' },
        { id: 'dashboard_cliente', nome: 'Dashboard Cliente', rota: '/cliente/dashboard', descricao: 'Painel específico para clientes' },
        { id: 'dashboard_fornecedor', nome: 'Dashboard Fornecedor', rota: '/fornecedor/dashboard', descricao: 'Painel específico para fornecedores' }
      ]
    },
    { 
      id: 'coletas', 
      nome: 'Coletas', 
      titulo: 'Gestão de Coletas', 
      rota_base: '/coletas', 
      icone: 'Truck',
      rotas: [
        { id: 'coletas_dashboard', nome: 'Dashboard Coletas', rota: '/coletas', descricao: 'Visão geral do módulo de coletas' },
        { id: 'coletas_solicitacoes', nome: 'Solicitações', rota: '/coletas/solicitacoes', descricao: 'Gerenciar solicitações de coleta' },
        { id: 'coletas_nova_ordem', nome: 'Nova Ordem', rota: '/coletas/nova-ordem', descricao: 'Criar nova ordem de coleta' },
        { id: 'coletas_aprovacoes', nome: 'Aprovações', rota: '/coletas/aprovacoes', descricao: 'Aprovar solicitações de coleta' },
        { id: 'coletas_alocacao', nome: 'Alocação Veículos', rota: '/coletas/alocacao', descricao: 'Alocar veículos para coletas' },
        { id: 'coletas_execucao', nome: 'Execução', rota: '/coletas/execucao', descricao: 'Executar e monitorar coletas' }
      ]
    },
    { 
      id: 'armazenagem', 
      nome: 'Armazenagem', 
      titulo: 'Gestão de Armazém', 
      rota_base: '/armazenagem', 
      icone: 'Package',
      rotas: [
        { id: 'armazenagem_dashboard', nome: 'Dashboard Armazenagem', rota: '/armazenagem', descricao: 'Visão geral do armazém' },
        { id: 'armazenagem_conferencia', nome: 'Conferência', rota: '/armazenagem/conferencia', descricao: 'Conferir mercadorias recebidas' },
        { id: 'armazenagem_enderecamento', nome: 'Endereçamento', rota: '/armazenagem/enderecamento', descricao: 'Endereçar produtos no armazém' },
        { id: 'armazenagem_checklist', nome: 'Checklist', rota: '/armazenagem/checklist', descricao: 'Checklist de procedimentos' },
        { id: 'armazenagem_notas_entrada', nome: 'Notas Fiscais Entrada', rota: '/armazenagem/notas-fiscais-entrada', descricao: 'Processar notas fiscais de entrada' },
        { id: 'armazenagem_editar_nota', nome: 'Editar Nota Fiscal', rota: '/armazenagem/editar-nota-fiscal', descricao: 'Editar dados de notas fiscais' },
        { id: 'armazenagem_etiquetas', nome: 'Geração Etiquetas', rota: '/armazenagem/geracao-etiquetas', descricao: 'Gerar etiquetas de identificação' },
        { id: 'armazenagem_movimentacoes', nome: 'Movimentações', rota: '/armazenagem/movimentacoes', descricao: 'Controlar movimentações internas' },
        { id: 'armazenagem_rastreamento', nome: 'Rastreamento', rota: '/armazenagem/rastreamento', descricao: 'Rastrear produtos no armazém' }
      ]
    },
    { 
      id: 'carregamento', 
      nome: 'Carregamento', 
      titulo: 'Ordem de Carga', 
      rota_base: '/carregamento', 
      icone: 'Container',
      rotas: [
        { id: 'carregamento_dashboard', nome: 'Dashboard Carregamento', rota: '/carregamento', descricao: 'Visão geral de carregamentos' },
        { id: 'carregamento_ordem', nome: 'Ordem Carregamento', rota: '/armazenagem/ordem-carregamento', descricao: 'Criar ordem de carregamento' },
        { id: 'carregamento_separacao', nome: 'Separação', rota: '/armazenagem/carregamento/separacao', descricao: 'Separar produtos para carregamento' },
        { id: 'carregamento_conferencia', nome: 'Conferência Carregamento', rota: '/armazenagem/carregamento/conferencia', descricao: 'Conferir carregamento' },
        { id: 'carregamento_enderecamento', nome: 'Endereçamento Carregamento', rota: '/armazenagem/carregamento/enderecamento', descricao: 'Endereçar carregamento' },
        { id: 'carregamento_checklist', nome: 'Checklist Carregamento', rota: '/armazenagem/carregamento/checklist', descricao: 'Checklist de carregamento' },
        { id: 'carregamento_expedicao', nome: 'Expedição', rota: '/armazenagem/carregamento/expedicao', descricao: 'Expedição de carregamento' }
      ]
    },
    { 
      id: 'relatorios', 
      nome: 'Relatórios', 
      titulo: 'Relatórios e Análises', 
      rota_base: '/relatorios', 
      icone: 'FileText',
      rotas: [
        { id: 'relatorios_dashboard', nome: 'Dashboard Relatórios', rota: '/relatorios', descricao: 'Central de relatórios' },
        { id: 'relatorios_operacionais', nome: 'Relatórios Operacionais', rota: '/relatorios/operacionais', descricao: 'Relatórios operacionais detalhados' },
        { id: 'relatorios_financeiros', nome: 'Relatórios Financeiros', rota: '/relatorios/financeiros', descricao: 'Relatórios financeiros' },
        { id: 'relatorios_performance', nome: 'Performance', rota: '/relatorios/performance', descricao: 'Relatórios de performance' }
      ]
    },
    { 
      id: 'configuracoes', 
      nome: 'Configurações', 
      titulo: 'Configurações do Sistema', 
      rota_base: '/configuracao', 
      icone: 'Settings',
      rotas: [
        { id: 'config_sistema', nome: 'Sistema', rota: '/configuracao', descricao: 'Configurações gerais do sistema' },
        { id: 'config_permissoes', nome: 'Controle de Acesso', rota: '/configuracao/permissoes', descricao: 'Gerenciar permissões e perfis' },
        { id: 'config_aprovacoes', nome: 'Aprovações', rota: '/configuracao/aprovacoes', descricao: 'Central de aprovações' },
        { id: 'config_empresa', nome: 'Informações Empresa', rota: '/configuracao/empresa', descricao: 'Dados da empresa' }
      ]
    },
    { 
      id: 'admin', 
      nome: 'Administração', 
      titulo: 'Painel Administrativo', 
      rota_base: '/admin', 
      icone: 'Shield',
      rotas: [
        { id: 'admin_dashboard', nome: 'Dashboard Admin', rota: '/admin/dashboard', descricao: 'Painel administrativo' },
        { id: 'admin_empresas', nome: 'Gestão Empresas', rota: '/admin/empresas', descricao: 'Gerenciar empresas' },
        { id: 'admin_usuarios', nome: 'Gestão Usuários', rota: '/admin/usuarios', descricao: 'Gerenciar usuários' },
        { id: 'admin_pacotes', nome: 'Gestão Pacotes', rota: '/admin/pacotes', descricao: 'Gerenciar pacotes do sistema' },
        { id: 'admin_financeiro', nome: 'Financeiro', rota: '/admin/financeiro', descricao: 'Gestão financeira' },
        { id: 'admin_suporte', nome: 'Suporte', rota: '/admin/suporte', descricao: 'Central de suporte' },
        { id: 'admin_logs', nome: 'Logs Auditoria', rota: '/admin/logs', descricao: 'Logs de auditoria' },
        { id: 'admin_seguranca', nome: 'Segurança', rota: '/admin/seguranca', descricao: 'Configurações de segurança' }
      ]
    }
  ];

  const { data: perfis, isLoading: isLoadingPerfis } = useQuery({
    queryKey: ['perfis'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/perfis', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar perfis');
      return response.json();
    }
  });

  const { data: perfilModulos, isLoading: isLoadingPerfilModulos } = useQuery({
    queryKey: ['perfil-modulos', selectedPerfil],
    queryFn: async () => {
      if (!selectedPerfil) return [];
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/perfis/${selectedPerfil}/modulos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) return []; // Se não existe ainda, retorna vazio
      return response.json();
    },
    enabled: !!selectedPerfil
  });

  // Agrupar perfis únicos por nome (eliminar duplicações)
  const perfisUnicos = React.useMemo(() => {
    const uniqueMap = new Map();
    perfis?.forEach((perfil: any) => {
      if (!uniqueMap.has(perfil.nome) || perfil.ativo) {
        uniqueMap.set(perfil.nome, perfil);
      }
    });
    return Array.from(uniqueMap.values());
  }, [perfis]);

  const saveMutation = useMutation({
    mutationFn: async (moduleData: { [key: string]: any }) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/perfis/${selectedPerfil}/modulos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ modulos: moduleData })
      });
      if (!response.ok) throw new Error('Erro ao salvar configurações');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil-modulos', selectedPerfil] });
      toast({
        title: "Configurações salvas",
        description: "Acesso aos módulos configurado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações de acesso",
        variant: "destructive",
      });
    }
  });

  const createPerfilMutation = useMutation({
    mutationFn: async (perfilData: any) => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/perfis', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(perfilData)
      });
      if (!response.ok) throw new Error('Erro ao criar perfil');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfis'] });
      setShowNewPerfilModal(false);
      setNewPerfilData({
        nome: '',
        descricao: '',
        tipo_perfil: 'usuario_operacional',
        nivel_hierarquia: 3
      });
      toast({
        title: "Perfil criado",
        description: "Novo perfil criado com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar novo perfil",
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (perfilModulos) {
      const accessMap: { [key: string]: any } = {};
      perfilModulos.forEach((pm: any) => {
        accessMap[pm.modulo_id] = {
          acesso_completo: pm.acesso_completo,
          rotas_permitidas: pm.rotas_permitidas || [],
          permissoes_especiais: pm.permissoes_especiais || {}
        };
      });
      setModuleAccess(accessMap);
    }
  }, [perfilModulos]);

  const handleRouteChange = (moduleId: string, routeId: string, accessType: string, value: any) => {
    setModuleAccess(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [routeId]: {
          ...prev[moduleId]?.[routeId],
          [accessType]: value
        }
      }
    }));
  };

  const toggleAllRoutes = (moduleId: string, enable: boolean) => {
    const modulo = modulosSistema.find(m => m.id === moduleId);
    if (!modulo) return;

    setModuleAccess(prev => {
      const newAccess = { ...prev };
      if (!newAccess[moduleId]) newAccess[moduleId] = {};
      
      modulo.rotas.forEach(rota => {
        newAccess[moduleId][rota.id] = {
          ativo: enable,
          create: enable,
          read: enable,
          update: enable,
          delete: enable
        };
      });
      
      return newAccess;
    });
  };

  const handleSave = () => {
    saveMutation.mutate(moduleAccess);
  };

  const handleCreatePerfil = () => {
    if (!newPerfilData.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do perfil é obrigatório",
        variant: "destructive",
      });
      return;
    }
    createPerfilMutation.mutate(newPerfilData);
  };

  const handleSelectPerfil = (perfilId: string) => {
    setSelectedPerfil(perfilId);
    // Scroll to configuration section
    const configSection = document.getElementById('perfil-config');
    if (configSection) {
      configSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isLoading = isLoadingPerfis || (selectedPerfil && isLoadingPerfilModulos);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Controle de Acesso por Perfil</h3>
          <p className="text-gray-600">Configure módulos, permissões e rotas para cada perfil</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={!selectedPerfil || saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Pesquisar perfis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedPerfil} onValueChange={setSelectedPerfil}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecione um perfil" />
              </SelectTrigger>
              <SelectContent>
                {perfisUnicos?.map((perfil: any) => (
                  <SelectItem key={perfil.id} value={perfil.id}>
                    {perfil.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Perfis</p>
                <p className="text-2xl font-bold text-blue-600">{perfisUnicos?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Perfis Ativos</p>
                <p className="text-2xl font-bold text-green-600">{perfisUnicos?.filter((p: any) => p.ativo).length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Módulos</p>
                <p className="text-2xl font-bold text-purple-600">{modulosSistema.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Usuários</p>
                <p className="text-2xl font-bold text-orange-600">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Perfis sem duplicações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lista de Perfis ({perfisUnicos?.length || 0})</span>
            <Button size="sm" onClick={() => setShowNewPerfilModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Perfil
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {perfisUnicos
              ?.filter((perfil: any) => 
                perfil.nome.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((perfil: any) => (
              <div key={perfil.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">{perfil.nome}</p>
                    {perfil.descricao && (
                      <p className="text-sm text-gray-500">{perfil.descricao}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={perfil.ativo ? "default" : "secondary"}>
                    {perfil.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSelectPerfil(perfil.id)}
                  >
                    Configurar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal para Novo Perfil */}
      {showNewPerfilModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Criar Novo Perfil</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome do Perfil *</Label>
                <Input
                  id="nome"
                  value={newPerfilData.nome}
                  onChange={(e) => setNewPerfilData({...newPerfilData, nome: e.target.value})}
                  placeholder="Digite o nome do perfil"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={newPerfilData.descricao}
                  onChange={(e) => setNewPerfilData({...newPerfilData, descricao: e.target.value})}
                  placeholder="Descrição do perfil (opcional)"
                />
              </div>
              <div>
                <Label htmlFor="tipo_perfil">Tipo de Perfil</Label>
                <Select 
                  value={newPerfilData.tipo_perfil} 
                  onValueChange={(value) => setNewPerfilData({...newPerfilData, tipo_perfil: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="super_admin">Super Administrador</SelectItem>
                    <SelectItem value="admin_empresa">Administrador Empresa</SelectItem>
                    <SelectItem value="transportador">Transportador</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="fornecedor">Fornecedor</SelectItem>
                    <SelectItem value="usuario_operacional">Usuário Operacional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="nivel_hierarquia">Nível de Hierarquia</Label>
                <Select 
                  value={newPerfilData.nivel_hierarquia.toString()} 
                  onValueChange={(value) => setNewPerfilData({...newPerfilData, nivel_hierarquia: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Básico</SelectItem>
                    <SelectItem value="2">2 - Intermediário</SelectItem>
                    <SelectItem value="3">3 - Avançado</SelectItem>
                    <SelectItem value="4">4 - Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <Button 
                onClick={handleCreatePerfil} 
                disabled={createPerfilMutation.isPending}
                className="flex-1"
              >
                {createPerfilMutation.isPending ? "Criando..." : "Criar Perfil"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNewPerfilModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Configuração de Módulos e Rotas */}
      {selectedPerfil && (
        <Card id="perfil-config">
          <CardHeader>
            <CardTitle>
              Configurar Acesso - {perfisUnicos?.find((p: any) => p.id === selectedPerfil)?.nome}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {modulosSistema.map((modulo) => {
                const moduleData = moduleAccess[modulo.id] || {};
                return (
                  <div key={modulo.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Shield className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{modulo.titulo}</h4>
                          <p className="text-sm text-gray-500">{modulo.rotas.length} rotas mapeadas</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAllRoutes(modulo.id, true)}
                        >
                          Habilitar Todas
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleAllRoutes(modulo.id, false)}
                        >
                          Desabilitar Todas
                        </Button>
                      </div>
                    </div>
                    
                    {/* Controle por rotas específicas */}
                    <div className="space-y-3">
                      {modulo.rotas.map((rota) => {
                        const routeAccess = moduleData[rota.id] || {};
                        return (
                          <div key={rota.id} className="bg-gray-50 rounded-lg p-3 border">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm">{rota.nome}</h4>
                                  <Badge variant={routeAccess.ativo ? "default" : "secondary"} className="text-xs">
                                    {routeAccess.ativo ? "Ativo" : "Inativo"}
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 font-mono">{rota.rota}</p>
                                <p className="text-xs text-gray-500 mt-1">{rota.descricao}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch 
                                  checked={routeAccess.ativo || false}
                                  onCheckedChange={(checked) => handleRouteChange(modulo.id, rota.id, 'ativo', checked)}
                                />
                                <Label className="text-xs">Ativo</Label>
                              </div>
                            </div>
                            
                            {routeAccess.ativo && (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center space-x-1">
                                  <Switch 
                                    checked={routeAccess.create || false}
                                    onCheckedChange={(checked) => handleRouteChange(modulo.id, rota.id, 'create', checked)}
                                  />
                                  <Label className="text-xs">Criar</Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Switch 
                                    checked={routeAccess.read || false}
                                    onCheckedChange={(checked) => handleRouteChange(modulo.id, rota.id, 'read', checked)}
                                  />
                                  <Label className="text-xs">Visualizar</Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Switch 
                                    checked={routeAccess.update || false}
                                    onCheckedChange={(checked) => handleRouteChange(modulo.id, rota.id, 'update', checked)}
                                  />
                                  <Label className="text-xs">Editar</Label>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Switch 
                                    checked={routeAccess.delete || false}
                                    onCheckedChange={(checked) => handleRouteChange(modulo.id, rota.id, 'delete', checked)}
                                  />
                                  <Label className="text-xs">Excluir</Label>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Antiga aba de Permissões - manter para compatibilidade
const PermissoesTab = () => {
  const { data: perfis, isLoading: loadingPerfis } = useQuery({
    queryKey: ['perfis'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/perfis', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar perfis');
      return response.json();
    }
  });

  const { data: permissions, isLoading: loadingPermissions } = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/permissions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar permissões');
      return response.json();
    }
  });

  if (loadingPerfis || loadingPermissions) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activePerfis = perfis?.filter((p: any) => p.ativo !== false) || [];
  const activePermissions = permissions?.filter((p: any) => p.ativo !== false) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Controle de Permissões</h3>
          <p className="text-gray-600">Configure permissões e níveis de acesso</p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Novo Perfil
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{activePerfis.length}</p>
                <p className="text-sm text-gray-600">Total Perfis</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600 ml-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{activePerfis.filter((p: any) => p.ativo).length}</p>
                <p className="text-sm text-gray-600">Perfis Ativos</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600 ml-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-2xl font-bold text-purple-600">{activePermissions.length}</p>
                <p className="text-sm text-gray-600">Permissões</p>
              </div>
              <Settings className="h-8 w-8 text-purple-600 ml-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div>
                <p className="text-2xl font-bold text-gray-600">0</p>
                <p className="text-sm text-gray-600">Usuários</p>
              </div>
              <Users className="h-8 w-8 text-gray-600 ml-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Perfis ({activePerfis.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {activePerfis.length > 0 ? (
            <div className="space-y-4">
              {activePerfis.map((perfil: any) => (
                <div key={perfil.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium">{perfil.nome}</p>
                      <p className="text-sm text-gray-600">{perfil.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={perfil.ativo ? 'default' : 'secondary'}
                      className={perfil.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                    >
                      {perfil.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Configurar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum perfil encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Pagamentos Tab
const PagamentosTab = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gestão de Pagamentos</h3>
          <p className="text-gray-600">Configure planos e assinaturas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Plano Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nenhuma assinatura ativa</p>
              <Button>Contratar Plano</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Método de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Nenhum método configurado</p>
              <Button>Adicionar Cartão</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Sistema Tab
const SistemaTab = ({ user }: { user: any }) => {
  const [isEditing, setIsEditing] = useState(false);

  const { data: configData, isLoading, refetch } = useQuery({
    queryKey: ['sistema-config', user?.empresa_id],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/empresas/${user?.empresa_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Erro ao carregar configurações');
      return response.json();
    },
    enabled: !!user?.empresa_id
  });

  const [systemConfig, setSystemConfig] = useState({
    // Configurações de Email
    email_host: '',
    email_user: '',
    email_from: '',
    email_password: '',
    email_port: '587',
    email_enabled: false,
    
    // Configurações da API NSDocs
    nsdocs_client_id: '',
    nsdocs_client_secret: '',
    nsdocs_enabled: false,
    
    // Configurações da API CrossXML
    crossxml_api_key: '',
    crossxml_enabled: false,
    
    // Configurações da API Logística da Informação
    logistica_cnpj: '34579341000185',
    logistica_token: '',
    logistica_enabled: false,
    
    // Configurações Gerais do Sistema
    sistema_versao: 'CrossWMS v2.0',
    sistema_ambiente: 'production',
    backup_automatico: true,
    backup_horario: '02:00',
    
    // Configurações de Segurança
    sessao_timeout: '60',
    max_tentativas_login: '5',
    senha_complexidade: true,
    
    // Configurações de Notificações
    notif_email_novos_usuarios: true,
    notif_email_aprovacoes: true,
    notif_email_operacoes: false
  });

  useEffect(() => {
    if (configData) {
      setSystemConfig(prev => ({
        ...prev,
        email_host: configData.email_host || '',
        email_user: configData.email_user || '',
        email_from: configData.email_from || '',
        email_password: configData.email_password || '',
        email_port: configData.email_port || '587',
        email_enabled: configData.email_enabled || false,
        nsdocs_client_id: configData.nsdocs_client_id || '',
        nsdocs_client_secret: configData.nsdocs_client_secret || '',
        nsdocs_enabled: configData.nsdocs_enabled || false,
        crossxml_api_key: configData.crossxml_api_key || '',
        crossxml_enabled: configData.crossxml_enabled || false,
        logistica_cnpj: configData.logistica_cnpj || '34579341000185',
        logistica_token: configData.logistica_token || '',
        logistica_enabled: configData.logistica_enabled || false,
        sistema_versao: configData.sistema_versao || 'CrossWMS v2.0',
        sistema_ambiente: configData.sistema_ambiente || 'production',
        backup_automatico: configData.backup_automatico || true,
        backup_horario: configData.backup_horario || '02:00',
        sessao_timeout: configData.sessao_timeout || '60',
        max_tentativas_login: configData.max_tentativas_login || '5',
        senha_complexidade: configData.senha_complexidade || true,
        notif_email_novos_usuarios: configData.notif_email_novos_usuarios || true,
        notif_email_aprovacoes: configData.notif_email_aprovacoes || true,
        notif_email_operacoes: configData.notif_email_operacoes || false
      }));
    }
  }, [configData]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof systemConfig) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/empresas/${user?.empresa_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao salvar configurações');
      return response.json();
    },
    onSuccess: () => {
      setIsEditing(false);
      refetch();
      toast({
        title: "Configurações salvas",
        description: "Configurações do sistema atualizadas com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do sistema",
        variant: "destructive",
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Configurações do Sistema</h3>
          <p className="text-gray-600">Configure parâmetros gerais</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => saveMutation.mutate(systemConfig)}
                disabled={saveMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações de Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-600" />
              Configurações de Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email_host">Servidor SMTP</Label>
              <Input
                id="email_host"
                value={systemConfig.email_host}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, email_host: e.target.value }))}
                disabled={!isEditing}
                placeholder="smtp.hostgator.com"
              />
            </div>
            <div>
              <Label htmlFor="email_user">Usuário SMTP</Label>
              <Input
                id="email_user"
                value={systemConfig.email_user}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, email_user: e.target.value }))}
                disabled={!isEditing}
                placeholder="contato@empresa.com.br"
              />
            </div>
            <div>
              <Label htmlFor="email_password">Senha SMTP</Label>
              <Input
                id="email_password"
                type="password"
                value={systemConfig.email_password}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, email_password: e.target.value }))}
                disabled={!isEditing}
                placeholder="••••••••"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email_from">Email Remetente</Label>
                <Input
                  id="email_from"
                  value={systemConfig.email_from}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, email_from: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="sistema@empresa.com.br"
                />
              </div>
              <div>
                <Label htmlFor="email_port">Porta SMTP</Label>
                <Input
                  id="email_port"
                  value={systemConfig.email_port}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, email_port: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="587"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="email_enabled"
                checked={systemConfig.email_enabled}
                onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, email_enabled: checked }))}
                disabled={!isEditing}
              />
              <Label htmlFor="email_enabled">Email habilitado</Label>
            </div>
          </CardContent>
        </Card>

        {/* Configurações da API NSDocs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              API NSDocs (Azul)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nsdocs_client_id">Client ID</Label>
              <Input
                id="nsdocs_client_id"
                value={systemConfig.nsdocs_client_id}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, nsdocs_client_id: e.target.value }))}
                disabled={!isEditing}
                placeholder="ID do cliente NSDocs"
              />
            </div>
            <div>
              <Label htmlFor="nsdocs_client_secret">Client Secret</Label>
              <Input
                id="nsdocs_client_secret"
                type="password"
                value={systemConfig.nsdocs_client_secret}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, nsdocs_client_secret: e.target.value }))}
                disabled={!isEditing}
                placeholder="••••••••••••••••"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="nsdocs_enabled"
                checked={systemConfig.nsdocs_enabled}
                onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, nsdocs_enabled: checked }))}
                disabled={!isEditing}
              />
              <Label htmlFor="nsdocs_enabled">API habilitada</Label>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Configurações para busca automática de XMLs de NFe
            </div>
          </CardContent>
        </Card>

        {/* Configurações da API CrossXML */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-green-600" />
              API CrossXML (Verde)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="crossxml_api_key">API Key</Label>
              <Input
                id="crossxml_api_key"
                type="password"
                value={systemConfig.crossxml_api_key}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, crossxml_api_key: e.target.value }))}
                disabled={!isEditing}
                placeholder="••••••••••••••••••••••••••••••••"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="crossxml_enabled"
                checked={systemConfig.crossxml_enabled}
                onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, crossxml_enabled: checked }))}
                disabled={!isEditing}
              />
              <Label htmlFor="crossxml_enabled">API habilitada</Label>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              API para consulta de NFe com sistema de fallback inteligente
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações da API Logística da Informação */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              API Logística da Informação (Laranja)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="logistica_cnpj">CNPJ</Label>
                <Input
                  id="logistica_cnpj"
                  value={systemConfig.logistica_cnpj}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, logistica_cnpj: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="34579341000185"
                />
              </div>
              <div>
                <Label htmlFor="logistica_token">Token API</Label>
                <Input
                  id="logistica_token"
                  type="password"
                  value={systemConfig.logistica_token}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, logistica_token: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="••••••••••••••••••••••••••••••••"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="logistica_enabled"
                checked={systemConfig.logistica_enabled}
                onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, logistica_enabled: checked }))}
                disabled={!isEditing}
              />
              <Label htmlFor="logistica_enabled">API habilitada</Label>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              API SOAP para consulta de NFe através da Logística da Informação
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações de Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessao_timeout">Timeout de Sessão (min)</Label>
                <Input
                  id="sessao_timeout"
                  value={systemConfig.sessao_timeout}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, sessao_timeout: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="60"
                />
              </div>
              <div>
                <Label htmlFor="max_tentativas_login">Máx. Tentativas Login</Label>
                <Input
                  id="max_tentativas_login"
                  value={systemConfig.max_tentativas_login}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, max_tentativas_login: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="5"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="senha_complexidade"
                checked={systemConfig.senha_complexidade}
                onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, senha_complexidade: checked }))}
                disabled={!isEditing}
              />
              <Label htmlFor="senha_complexidade">Exigir senhas complexas</Label>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-600" />
              Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sistema_versao">Versão do Sistema</Label>
              <Input
                id="sistema_versao"
                value={systemConfig.sistema_versao}
                onChange={(e) => setSystemConfig(prev => ({ ...prev, sistema_versao: e.target.value }))}
                disabled={!isEditing}
                placeholder="CrossWMS v2.0"
              />
            </div>
            <div>
              <Label htmlFor="sistema_ambiente">Ambiente</Label>
              <Select 
                value={systemConfig.sistema_ambiente} 
                onValueChange={(value) => setSystemConfig(prev => ({ ...prev, sistema_ambiente: value }))}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Desenvolvimento</SelectItem>
                  <SelectItem value="staging">Homologação</SelectItem>
                  <SelectItem value="production">Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="backup_automatico"
                  checked={systemConfig.backup_automatico}
                  onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, backup_automatico: checked }))}
                  disabled={!isEditing}
                />
                <Label htmlFor="backup_automatico">Backup automático</Label>
              </div>
              <div>
                <Label htmlFor="backup_horario">Horário do backup</Label>
                <Input
                  id="backup_horario"
                  type="time"
                  value={systemConfig.backup_horario}
                  onChange={(e) => setSystemConfig(prev => ({ ...prev, backup_horario: e.target.value }))}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            Notificações por Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="notif_email_novos_usuarios"
                checked={systemConfig.notif_email_novos_usuarios}
                onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, notif_email_novos_usuarios: checked }))}
                disabled={!isEditing}
              />
              <Label htmlFor="notif_email_novos_usuarios">Novos usuários</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="notif_email_aprovacoes"
                checked={systemConfig.notif_email_aprovacoes}
                onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, notif_email_aprovacoes: checked }))}
                disabled={!isEditing}
              />
              <Label htmlFor="notif_email_aprovacoes">Aprovações pendentes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="notif_email_operacoes"
                checked={systemConfig.notif_email_operacoes}
                onCheckedChange={(checked) => setSystemConfig(prev => ({ ...prev, notif_email_operacoes: checked }))}
                disabled={!isEditing}
              />
              <Label htmlFor="notif_email_operacoes">Operações críticas</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-blue-600" />
            Informações da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>CNPJ</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                {configData?.cnpj || 'Não informado'}
              </div>
            </div>
            <div>
              <Label>Razão Social</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                {configData?.razao_social || 'Não informado'}
              </div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                {configData?.email || 'Não informado'}
              </div>
            </div>
            <div>
              <Label>Telefone</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border">
                {configData?.telefone || 'Não informado'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NovaConfiguracao;