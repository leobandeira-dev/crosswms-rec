import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, Filter, Download, Mail, Phone, Calendar, Building } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface UserWithCompany {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  tipo_usuario: string;
  status: string;
  funcao?: string;
  departamento?: string;
  ultimo_acesso?: string;
  created_at: string;
  empresa: {
    id: string;
    nome: string;
    cnpj: string;
    tipo_empresa: string;
  };
  perfil: {
    id: string;
    nome: string;
    tipo_perfil: string;
  };
}

interface UserSummary {
  total_usuarios: number;
  usuarios_ativos: number;
  usuarios_pendentes: number;
  usuarios_inativos: number;
  por_tipo: Record<string, number>;
  por_perfil: Record<string, number>;
  usuarios_recentes: number;
}

interface UserListingProps {
  empresaId: string;
  empresaNome?: string;
}

export function UserListing({ empresaId, empresaNome }: UserListingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const { toast } = useToast();

  const { data: usuarios = [], isLoading: isLoadingUsers, error: usersError } = useQuery({
    queryKey: ['/api/users/empresa', empresaId],
    queryFn: () => apiRequest(`/api/users/empresa/${empresaId}`),
    enabled: !!empresaId
  });

  const { data: resumo, isLoading: isLoadingResumo } = useQuery({
    queryKey: ['/api/users/empresa', empresaId, 'resumo'],
    queryFn: () => apiRequest(`/api/users/empresa/${empresaId}/resumo`),
    enabled: !!empresaId
  });

  const filteredUsers = usuarios.filter((user: UserWithCompany) => {
    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.funcao && user.funcao.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'todos' || user.status === statusFilter;
    const matchesTipo = tipoFilter === 'todos' || user.tipo_usuario === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ativo': return 'default';
      case 'pendente_aprovacao': return 'secondary';
      case 'inativo': return 'destructive';
      default: return 'outline';
    }
  };

  const getTipoUsuarioBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'super_admin': return 'destructive';
      case 'transportador': return 'default';
      case 'cliente': return 'secondary';
      case 'fornecedor': return 'outline';
      default: return 'outline';
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

  const handleExportUsers = () => {
    const csvContent = [
      ['Nome', 'Email', 'Telefone', 'CPF', 'Tipo', 'Status', 'Função', 'Departamento', 'Último Acesso', 'Data Cadastro'].join(','),
      ...filteredUsers.map((user: UserWithCompany) => [
        user.nome,
        user.email,
        user.telefone || '',
        user.cpf || '',
        user.tipo_usuario,
        user.status,
        user.funcao || '',
        user.departamento || '',
        user.ultimo_acesso ? formatDate(user.ultimo_acesso) : '',
        formatDate(user.created_at)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_${empresaNome || 'empresa'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportação concluída",
      description: `Lista de ${filteredUsers.length} usuários exportada com sucesso`
    });
  };

  if (usersError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar usuários</h3>
            <p className="text-sm text-muted-foreground">
              {usersError instanceof Error ? usersError.message : 'Erro desconhecido'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header e Resumo */}
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuários Cadastrados
            </CardTitle>
            <CardDescription>
              {empresaNome ? `Empresa: ${empresaNome}` : 'Lista de usuários da empresa'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingResumo ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : resumo && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{resumo.total_usuarios}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{resumo.usuarios_ativos}</div>
                  <div className="text-sm text-muted-foreground">Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{resumo.usuarios_pendentes}</div>
                  <div className="text-sm text-muted-foreground">Pendentes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{resumo.usuarios_inativos}</div>
                  <div className="text-sm text-muted-foreground">Inativos</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou função..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="pendente_aprovacao">Pendente</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Tipos</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="transportador">Transportador</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="fornecedor">Fornecedor</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={handleExportUsers} disabled={filteredUsers.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <CardContent className="p-0">
          {isLoadingUsers ? (
            <div className="p-6">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'todos' || tipoFilter !== 'todos' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Esta empresa ainda não possui usuários cadastrados'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Tipo & Status</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead>Cadastro</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user: UserWithCompany) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.nome}</div>
                        {user.cpf && (
                          <div className="text-sm text-muted-foreground">CPF: {user.cpf}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                        {user.telefone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span className="text-sm">{user.telefone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={getTipoUsuarioBadgeVariant(user.tipo_usuario)} className="text-xs">
                          {user.tipo_usuario.replace('_', ' ')}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(user.status)} className="text-xs">
                          {user.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        {user.funcao && <div className="text-sm font-medium">{user.funcao}</div>}
                        {user.departamento && (
                          <div className="text-xs text-muted-foreground">{user.departamento}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.perfil && (
                        <Badge variant="outline" className="text-xs">
                          {user.perfil.nome}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.ultimo_acesso ? (
                        <div className="text-sm">{formatDate(user.ultimo_acesso)}</div>
                      ) : (
                        <span className="text-xs text-muted-foreground">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span className="text-sm">{formatDate(user.created_at)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!isLoadingUsers && filteredUsers.length > 0 && (
            <div className="border-t p-4 text-center text-sm text-muted-foreground">
              Mostrando {filteredUsers.length} de {usuarios.length} usuários
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}