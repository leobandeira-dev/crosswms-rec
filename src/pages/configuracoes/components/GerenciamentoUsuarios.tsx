import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  Mail,
  Phone,
  MapPin,
  Calendar
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { User as UserType } from "@shared/schema";

export default function GerenciamentoUsuarios() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const { data: usuarios, isLoading } = useQuery<UserType[]>({
    queryKey: ['/api/usuarios'],
  });

  const filteredUsuarios = usuarios?.filter(usuario => 
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ativo: { color: "bg-green-100 text-green-800", label: "Ativo" },
      inativo: { color: "bg-gray-100 text-gray-800", label: "Inativo" },
      suspenso: { color: "bg-red-100 text-red-800", label: "Suspenso" },
      pendente_aprovacao: { color: "bg-yellow-100 text-yellow-800", label: "Pendente" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inativo;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTipoUsuarioBadge = (tipo: string) => {
    const tipoConfig = {
      super_admin: { color: "bg-purple-100 text-purple-800", label: "Super Admin" },
      transportador: { color: "bg-blue-100 text-blue-800", label: "Transportador" },
      cliente: { color: "bg-green-100 text-green-800", label: "Cliente" },
      fornecedor: { color: "bg-orange-100 text-orange-800", label: "Fornecedor" }
    };
    
    const config = tipoConfig[tipo as keyof typeof tipoConfig] || tipoConfig.transportador;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

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
            Gerenciamento de Usuários
          </h3>
          <p className="text-gray-600">
            Gerencie usuários e suas permissões no sistema
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#0098DA] hover:bg-[#007BB5] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo usuário
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500">Formulário de cadastro será implementado</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Search className="h-5 w-5 mr-2 text-[#0098DA]" />
            Buscar Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou email..."
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
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{usuarios?.length || 0}</p>
              </div>
              <User className="h-8 w-8 text-[#0098DA]" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {usuarios?.filter(u => u.status === 'ativo').length || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {usuarios?.filter(u => u.status === 'pendente_aprovacao').length || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inativos</p>
                <p className="text-2xl font-bold text-red-600">
                  {usuarios?.filter(u => u.status === 'inativo').length || 0}
                </p>
              </div>
              <User className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Lista de Usuários ({filteredUsuarios.length})
          </CardTitle>
          <CardDescription>
            Todos os usuários cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Acesso</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#0098DA] rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{usuario.nome}</p>
                          <p className="text-sm text-gray-500">{usuario.funcao}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTipoUsuarioBadge(usuario.tipo_usuario)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-1" />
                          {usuario.email}
                        </div>
                        {usuario.telefone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-1" />
                            {usuario.telefone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(usuario.status)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">
                        {usuario.ultimo_acesso ? 
                          new Date(usuario.ultimo_acesso).toLocaleDateString('pt-BR') : 
                          'Nunca acessou'
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUser(usuario)}
                          className="border-[#0098DA] text-[#0098DA] hover:bg-[#0098DA] hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredUsuarios.length === 0 && (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-[#0098DA]" />
                {selectedUser.nome}
              </DialogTitle>
              <DialogDescription>
                Detalhes e configurações do usuário
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tipo de Usuário</label>
                  <div className="mt-1">
                    {getTipoUsuarioBadge(selectedUser.tipo_usuario)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Telefone</label>
                  <p className="text-sm text-gray-600">{selectedUser.telefone || 'Não informado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">CPF</label>
                  <p className="text-sm text-gray-600">{selectedUser.cpf || 'Não informado'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Função</label>
                  <p className="text-sm text-gray-600">{selectedUser.funcao || 'Não definida'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Departamento</label>
                  <p className="text-sm text-gray-600">{selectedUser.departamento || 'Não definido'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Data de Cadastro</label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedUser.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Último Acesso</label>
                  <p className="text-sm text-gray-600">
                    {selectedUser.ultimo_acesso ? 
                      new Date(selectedUser.ultimo_acesso).toLocaleDateString('pt-BR') : 
                      'Nunca acessou'
                    }
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