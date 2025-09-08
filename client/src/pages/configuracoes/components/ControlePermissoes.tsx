import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Shield, 
  Plus, 
  Search, 
  Edit, 
  Users, 
  Key,
  CheckCircle,
  XCircle,
  Settings
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Perfil, Permissao } from "@shared/schema";

interface PerfilWithPermissions extends Perfil {
  permissoes?: Permissao[];
  usuariosCount?: number;
}

const permissoesDisponiveis = [
  { id: "dashboard_view", nome: "Visualizar Dashboard", categoria: "Dashboard" },
  { id: "coletas_view", nome: "Visualizar Coletas", categoria: "Coletas" },
  { id: "coletas_create", nome: "Criar Coletas", categoria: "Coletas" },
  { id: "coletas_edit", nome: "Editar Coletas", categoria: "Coletas" },
  { id: "coletas_delete", nome: "Excluir Coletas", categoria: "Coletas" },
  { id: "armazenagem_view", nome: "Visualizar Armazenagem", categoria: "Armazenagem" },
  { id: "armazenagem_create", nome: "Criar Armazenagem", categoria: "Armazenagem" },
  { id: "armazenagem_edit", nome: "Editar Armazenagem", categoria: "Armazenagem" },
  { id: "carregamento_view", nome: "Visualizar Carregamento", categoria: "Carregamento" },
  { id: "carregamento_create", nome: "Criar Carregamento", categoria: "Carregamento" },
  { id: "carregamento_edit", nome: "Editar Carregamento", categoria: "Carregamento" },
  { id: "usuarios_view", nome: "Visualizar Usuários", categoria: "Administração" },
  { id: "usuarios_create", nome: "Criar Usuários", categoria: "Administração" },
  { id: "usuarios_edit", nome: "Editar Usuários", categoria: "Administração" },
  { id: "usuarios_delete", nome: "Excluir Usuários", categoria: "Administração" },
  { id: "configuracoes_view", nome: "Visualizar Configurações", categoria: "Administração" },
  { id: "configuracoes_edit", nome: "Editar Configurações", categoria: "Administração" },
  { id: "relatorios_view", nome: "Visualizar Relatórios", categoria: "Relatórios" },
  { id: "relatorios_export", nome: "Exportar Relatórios", categoria: "Relatórios" },
  { id: "financeiro_view", nome: "Visualizar Financeiro", categoria: "Financeiro" },
  { id: "financeiro_edit", nome: "Editar Financeiro", categoria: "Financeiro" }
];

export default function ControlePermissoes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerfil, setSelectedPerfil] = useState<PerfilWithPermissions | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data: perfis, isLoading } = useQuery<PerfilWithPermissions[]>({
    queryKey: ['/api/perfis'],
  });

  const filteredPerfis = perfis?.filter(perfil => 
    perfil.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perfil.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (ativo: boolean) => {
    return ativo ? (
      <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Ativo
      </Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Inativo
      </Badge>
    );
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId) 
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const categorias = [...new Set(permissoesDisponiveis.map(p => p.categoria))];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Controle de Permissões
          </h3>
          <p className="text-gray-600">
            Configure permissões e níveis de acesso
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#0098DA] hover:bg-[#007BB5] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Perfil
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Perfil</DialogTitle>
              <DialogDescription>
                Configure um novo perfil de acesso com permissões específicas
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome do Perfil</label>
                  <Input placeholder="Ex: Operador Logística" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Switch />
                    <span className="text-sm text-gray-600">Ativo</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <Input placeholder="Descrição do perfil e suas responsabilidades" className="mt-1" />
              </div>

              {/* Permissions */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Permissões</h4>
                <div className="space-y-4">
                  {categorias.map(categoria => (
                    <Card key={categoria} className="bg-gray-50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium text-gray-900">
                          {categoria}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                          {permissoesDisponiveis
                            .filter(p => p.categoria === categoria)
                            .map(permissao => (
                              <div key={permissao.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={permissao.id}
                                  checked={selectedPermissions.includes(permissao.id)}
                                  onCheckedChange={() => handlePermissionToggle(permissao.id)}
                                />
                                <label
                                  htmlFor={permissao.id}
                                  className="text-sm font-medium text-gray-700 cursor-pointer"
                                >
                                  {permissao.nome}
                                </label>
                              </div>
                            ))
                          }
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Cancelar</Button>
                <Button className="bg-[#0098DA] hover:bg-[#007BB5] text-white">
                  Criar Perfil
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Search className="h-5 w-5 mr-2 text-[#0098DA]" />
            Buscar Perfis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="outline" className="border-[#0098DA] text-[#0098DA] hover:bg-[#0098DA] hover:text-white">
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Perfis</p>
                <p className="text-2xl font-bold text-gray-900">{perfis?.length || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-[#0098DA]" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Perfis Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {perfis?.filter(p => p.ativo).length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Permissões</p>
                <p className="text-2xl font-bold text-purple-600">{permissoesDisponiveis.length}</p>
              </div>
              <Key className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuários</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {perfis?.reduce((acc, p) => acc + (p.usuariosCount || 0), 0) || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profiles Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Lista de Perfis ({filteredPerfis.length})
          </CardTitle>
          <CardDescription>
            Todos os perfis de acesso configurados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead>Usuários</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPerfis.map((perfil) => (
                  <TableRow key={perfil.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#0098DA] rounded-lg flex items-center justify-center">
                          <Shield className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{perfil.nome}</p>
                          <p className="text-sm text-gray-500">{perfil.descricao}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Key className="h-4 w-4 mr-1" />
                        {perfil.permissoes?.length || 0} permissões
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-1" />
                        {perfil.usuariosCount || 0} usuários
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(perfil.ativo)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {new Date(perfil.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPerfil(perfil)}
                          className="border-[#0098DA] text-[#0098DA] hover:bg-[#0098DA] hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-600 hover:bg-gray-100"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredPerfis.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum perfil encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Details Modal */}
      {selectedPerfil && (
        <Dialog open={!!selectedPerfil} onOpenChange={() => setSelectedPerfil(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-[#0098DA]" />
                {selectedPerfil.nome}
              </DialogTitle>
              <DialogDescription>
                Detalhes e permissões do perfil
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome do Perfil</label>
                  <p className="text-sm text-gray-600">{selectedPerfil.nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedPerfil.ativo)}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <p className="text-sm text-gray-600">{selectedPerfil.descricao}</p>
              </div>

              {/* Permissions by Category */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Permissões Atribuídas</h4>
                <div className="space-y-4">
                  {categorias.map(categoria => {
                    const categoriaProdutos = permissoesDisponiveis.filter(p => p.categoria === categoria);
                    const permissoesAtribuidas = categoriaProdutos.filter(p => 
                      selectedPerfil.permissoes?.some(perm => perm.codigo === p.id)
                    );
                    
                    if (permissoesAtribuidas.length === 0) return null;
                    
                    return (
                      <Card key={categoria} className="bg-gray-50">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base font-medium text-gray-900">
                            {categoria} ({permissoesAtribuidas.length}/{categoriaProdutos.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-3">
                            {permissoesAtribuidas.map(permissao => (
                              <div key={permissao.id} className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-700">{permissao.nome}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              
              {/* Creation Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Data de Criação</label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedPerfil.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Última Atualização</label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedPerfil.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}