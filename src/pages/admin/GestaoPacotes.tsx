import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import MainLayout from "@/components/layout/MainLayout";
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
  Package, 
  Plus, 
  Search, 
  Edit, 
  Eye, 
  DollarSign,
  Users,
  Building2,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PacoteSistema } from "@shared/schema";

export default function GestaoPacotes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPacote, setSelectedPacote] = useState<PacoteSistema | null>(null);

  const { data: pacotes, isLoading } = useQuery<PacoteSistema[]>({
    queryKey: ['/api/admin/pacotes'],
  });

  const filteredPacotes = pacotes?.filter(pacote => 
    pacote.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pacote.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (isLoading) {
    return (
      <MainLayout title="Gestão de Pacotes">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Gestão de Pacotes">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">
              Configure os planos e funcionalidades do sistema
            </p>
          </div>
          
          <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#0098DA] hover:bg-[#007BB5] text-white">
              <Plus className="h-4 w-4 mr-2" />
              Novo Pacote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Pacote</DialogTitle>
              <DialogDescription>
                Configure um novo plano de sistema
              </DialogDescription>
            </DialogHeader>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500">Formulário de criação será implementado</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Search className="h-5 w-5 mr-2 text-[#0098DA]" />
            Buscar Pacotes
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
                <p className="text-sm text-gray-600">Total Pacotes</p>
                <p className="text-2xl font-bold text-gray-900">{pacotes?.length || 0}</p>
              </div>
              <Package className="h-8 w-8 text-[#0098DA]" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pacotes Ativos</p>
                <p className="text-2xl font-bold text-green-600">
                  {pacotes?.filter(p => p.ativo).length || 0}
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
                <p className="text-sm text-gray-600">Receita Média</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(
                    pacotes?.reduce((acc, p) => acc + (p.preco_mensal || 0), 0) / (pacotes?.length || 1) || 0
                  )}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Assinantes</p>
                <p className="text-2xl font-bold text-purple-600">0</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Lista de Pacotes ({filteredPacotes.length})
          </CardTitle>
          <CardDescription>
            Todos os planos disponíveis no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pacote</TableHead>
                  <TableHead>Preços</TableHead>
                  <TableHead>Limites</TableHead>
                  <TableHead>Módulos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assinantes</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacotes.map((pacote) => (
                  <TableRow key={pacote.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#0098DA] rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{pacote.nome}</p>
                          <p className="text-sm text-gray-500">{pacote.descricao}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          Mensal: {formatCurrency(pacote.preco_mensal || 0)}
                        </p>
                        <p className="text-sm text-gray-600">
                          Anual: {formatCurrency(pacote.preco_anual || 0)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-1" />
                          {pacote.limite_usuarios || 'Ilimitado'} usuários
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Building2 className="h-4 w-4 mr-1" />
                          {pacote.limite_filiais || 'Ilimitado'} filiais
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {pacote.modulos_inclusos && pacote.modulos_inclusos.length > 0 ? (
                          pacote.modulos_inclusos.slice(0, 2).map((modulo, index) => (
                            <Badge key={index} variant="outline" className="text-xs mr-1">
                              {modulo}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">Nenhum módulo</span>
                        )}
                        {pacote.modulos_inclusos && pacote.modulos_inclusos.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{pacote.modulos_inclusos.length - 2} mais
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(pacote.ativo)}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-600">0 empresas</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedPacote(pacote)}
                          className="border-[#0098DA] text-[#0098DA] hover:bg-[#0098DA] hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-600 hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredPacotes.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum pacote encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package Details Modal */}
      {selectedPacote && (
        <Dialog open={!!selectedPacote} onOpenChange={() => setSelectedPacote(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-[#0098DA]" />
                {selectedPacote.nome}
              </DialogTitle>
              <DialogDescription>
                Detalhes completos do pacote
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nome do Pacote</label>
                  <p className="text-sm text-gray-600">{selectedPacote.nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(selectedPacote.ativo)}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Descrição</label>
                <p className="text-sm text-gray-600">{selectedPacote.descricao}</p>
              </div>
              
              {/* Pricing */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Preço Mensal</label>
                  <p className="text-lg font-bold text-[#0098DA]">
                    {formatCurrency(selectedPacote.preco_mensal || 0)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Preço Anual</label>
                  <p className="text-lg font-bold text-[#0098DA]">
                    {formatCurrency(selectedPacote.preco_anual || 0)}
                  </p>
                </div>
              </div>
              
              {/* Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Limite de Usuários</label>
                  <p className="text-sm text-gray-600">
                    {selectedPacote.limite_usuarios || 'Ilimitado'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Limite de Filiais</label>
                  <p className="text-sm text-gray-600">
                    {selectedPacote.limite_filiais || 'Ilimitado'}
                  </p>
                </div>
              </div>
              
              {/* Modules */}
              <div>
                <label className="text-sm font-medium text-gray-700">Módulos Inclusos</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedPacote.modulos_inclusos && selectedPacote.modulos_inclusos.length > 0 ? (
                    selectedPacote.modulos_inclusos.map((modulo, index) => (
                      <Badge key={index} variant="outline" className="bg-[#0098DA] text-white">
                        {modulo}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Nenhum módulo configurado</span>
                  )}
                </div>
              </div>
              
              {/* Features */}
              {selectedPacote.funcionalidades && selectedPacote.funcionalidades.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Funcionalidades</label>
                  <div className="mt-2 space-y-1">
                    {selectedPacote.funcionalidades.map((funcionalidade, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        {funcionalidade}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Data de Criação</label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedPacote.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Última Atualização</label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedPacote.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      </div>
    </MainLayout>
  );
}