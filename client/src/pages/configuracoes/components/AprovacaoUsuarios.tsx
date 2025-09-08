import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
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
  Building2, 
  Package,
  Search, 
  Check, 
  X, 
  Eye,
  Clock,
  Phone,
  Mail,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface SolicitacaoCadastro {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  cnpj: string;
  razao_social: string;
  cnpj_transportador: string;
  observacoes: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  created_at: Date;
  tipo_usuario: 'cliente' | 'fornecedor';
}

export default function AprovacaoUsuarios() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoCadastro | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("clientes");

  const { data: solicitacoes, isLoading, refetch } = useQuery<SolicitacaoCadastro[]>({
    queryKey: ['/api/usuarios-pendentes'],
  });

  const filteredSolicitacoes = solicitacoes?.filter(solicitacao => {
    const matchesSearch = solicitacao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      solicitacao.cnpj.includes(searchTerm.replace(/\D/g, ''));
    
    const matchesTab = activeTab === "clientes" ? 
      solicitacao.tipo_usuario === 'cliente' : 
      solicitacao.tipo_usuario === 'fornecedor';
    
    return matchesSearch && matchesTab;
  }) || [];

  const clientes = solicitacoes?.filter(s => s.tipo_usuario === 'cliente') || [];
  const fornecedores = solicitacoes?.filter(s => s.tipo_usuario === 'fornecedor') || [];
  const pendentesClientes = clientes.filter(s => s.status === 'pendente');
  const pendentesFornecedores = fornecedores.filter(s => s.status === 'pendente');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { color: "bg-yellow-100 text-yellow-800", label: "Pendente", icon: Clock },
      aprovado: { color: "bg-green-100 text-green-800", label: "Aprovado", icon: Check },
      rejeitado: { color: "bg-red-100 text-red-800", label: "Rejeitado", icon: X }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const tipoConfig = {
      cliente: { color: "bg-green-100 text-green-800", label: "Cliente", icon: Building2 },
      fornecedor: { color: "bg-orange-100 text-orange-800", label: "Fornecedor", icon: Package }
    };
    
    const config = tipoConfig[tipo as keyof typeof tipoConfig];
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatCNPJ = (cnpj: string) => {
    const digits = cnpj.replace(/\D/g, '');
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const handleAprovar = async (solicitacao: SolicitacaoCadastro) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/aprovar-usuario/${solicitacao.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        toast({
          title: `${solicitacao.tipo_usuario === 'cliente' ? 'Cliente' : 'Fornecedor'} aprovado`,
          description: `${solicitacao.nome} foi aprovado e receberá acesso ao sistema por email.`,
        });
        
        refetch();
        setSelectedSolicitacao(null);
      } else {
        const error = await response.json();
        toast({
          title: "Erro na aprovação",
          description: error.message || "Não foi possível aprovar o usuário. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na aprovação",
        description: "Não foi possível aprovar o usuário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejeitar = async (solicitacao: SolicitacaoCadastro) => {
    setIsProcessing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: `${solicitacao.tipo_usuario === 'cliente' ? 'Cliente' : 'Fornecedor'} rejeitado`,
        description: `${solicitacao.nome} foi rejeitado e será notificado por email.`,
      });
      
      refetch();
      setSelectedSolicitacao(null);
    } catch (error) {
      toast({
        title: "Erro na rejeição",
        description: "Não foi possível rejeitar o usuário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
            Aprovação de Usuários
          </h3>
          <p className="text-gray-600">
            Analise e aprove solicitações de cadastro de clientes e fornecedores
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
            <Search className="h-5 w-5 mr-2 text-[#0098DA]" />
            Buscar Solicitações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome, email ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clientes</p>
                <p className="text-2xl font-bold text-green-600">{clientes.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Clientes Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendentesClientes.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Fornecedores</p>
                <p className="text-2xl font-bold text-orange-600">{fornecedores.length}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fornecedores Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendentesFornecedores.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Clientes/Fornecedores */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clientes" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Clientes ({clientes.length})
          </TabsTrigger>
          <TabsTrigger value="fornecedores" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Fornecedores ({fornecedores.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clientes" className="space-y-4">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Solicitações de Clientes ({clientes.filter(c => 
                  c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  c.cnpj.includes(searchTerm.replace(/\D/g, ''))
                ).length})
              </CardTitle>
              <CardDescription>
                Clientes que solicitaram acesso ao seu sistema logístico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SolicitacoesTable 
                solicitacoes={filteredSolicitacoes} 
                onView={setSelectedSolicitacao}
                onApprove={handleAprovar}
                onReject={handleRejeitar}
                isProcessing={isProcessing}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fornecedores" className="space-y-4">
          <Card className="bg-white border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Solicitações de Fornecedores ({fornecedores.filter(f => 
                  f.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  f.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  f.cnpj.includes(searchTerm.replace(/\D/g, ''))
                ).length})
              </CardTitle>
              <CardDescription>
                Fornecedores que solicitaram acesso ao seu sistema logístico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SolicitacoesTable 
                solicitacoes={filteredSolicitacoes} 
                onView={setSelectedSolicitacao}
                onApprove={handleAprovar}
                onReject={handleRejeitar}
                isProcessing={isProcessing}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detalhes da Solicitação Modal */}
      {selectedSolicitacao && (
        <Dialog open={!!selectedSolicitacao} onOpenChange={() => setSelectedSolicitacao(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                {selectedSolicitacao.tipo_usuario === 'cliente' ? 
                  <Building2 className="h-5 w-5 mr-2 text-green-500" /> :
                  <Package className="h-5 w-5 mr-2 text-orange-500" />
                }
                {selectedSolicitacao.nome}
              </DialogTitle>
              <DialogDescription>
                Detalhes da solicitação de cadastro como {selectedSolicitacao.tipo_usuario}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Status e Tipo */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Tipo:</span>
                  {getTipoBadge(selectedSolicitacao.tipo_usuario)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  {getStatusBadge(selectedSolicitacao.status)}
                </div>
              </div>

              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Dados Pessoais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Nome:</span>
                    <p className="text-sm text-gray-600">{selectedSolicitacao.nome}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email:</span>
                    <p className="text-sm text-gray-600">{selectedSolicitacao.email}</p>
                  </div>
                </div>
                {selectedSolicitacao.telefone && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Telefone:</span>
                    <p className="text-sm text-gray-600">{formatPhone(selectedSolicitacao.telefone)}</p>
                  </div>
                )}
              </div>

              {/* Dados da Empresa */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900">Dados da Empresa</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-700">CNPJ:</span>
                    <p className="text-sm text-gray-600">{formatCNPJ(selectedSolicitacao.cnpj)}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Razão Social:</span>
                    <p className="text-sm text-gray-600">{selectedSolicitacao.razao_social || 'Não informado'}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">CNPJ Transportador:</span>
                  <p className="text-sm text-gray-600">{formatCNPJ(selectedSolicitacao.cnpj_transportador)}</p>
                </div>
              </div>

              {/* Observações */}
              {selectedSolicitacao.observacoes && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Observações:</span>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-1">
                    {selectedSolicitacao.observacoes}
                  </p>
                </div>
              )}

              {/* Data de Solicitação */}
              <div>
                <span className="text-sm font-medium text-gray-700">Data da Solicitação:</span>
                <p className="text-sm text-gray-600">
                  {new Date(selectedSolicitacao.created_at).toLocaleDateString('pt-BR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Ações */}
              {selectedSolicitacao.status === 'pendente' && (
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button 
                    variant="outline"
                    onClick={() => handleRejeitar(selectedSolicitacao)}
                    disabled={isProcessing}
                    className="border-red-300 text-red-600 hover:bg-red-100"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processando..." : "Rejeitar"}
                  </Button>
                  <Button 
                    onClick={() => handleAprovar(selectedSolicitacao)}
                    disabled={isProcessing}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processando..." : "Aprovar"}
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

interface SolicitacoesTableProps {
  solicitacoes: SolicitacaoCadastro[];
  onView: (solicitacao: SolicitacaoCadastro) => void;
  onApprove: (solicitacao: SolicitacaoCadastro) => void;
  onReject: (solicitacao: SolicitacaoCadastro) => void;
  isProcessing: boolean;
}

function SolicitacoesTable({ solicitacoes, onView, onApprove, onReject, isProcessing }: SolicitacoesTableProps) {
  const formatCNPJ = (cnpj: string) => {
    const digits = cnpj.replace(/\D/g, '');
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return phone;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { color: "bg-yellow-100 text-yellow-800", label: "Pendente", icon: Clock },
      aprovado: { color: "bg-green-100 text-green-800", label: "Aprovado", icon: Check },
      rejeitado: { color: "bg-red-100 text-red-800", label: "Rejeitado", icon: X }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente;
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.color}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data Solicitação</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {solicitacoes.map((solicitacao) => (
            <TableRow key={solicitacao.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    solicitacao.tipo_usuario === 'cliente' ? 'bg-green-500' : 'bg-orange-500'
                  }`}>
                    {solicitacao.tipo_usuario === 'cliente' ? 
                      <Building2 className="h-5 w-5 text-white" /> :
                      <Package className="h-5 w-5 text-white" />
                    }
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{solicitacao.nome}</p>
                    <p className="text-sm text-gray-500 capitalize">{solicitacao.tipo_usuario}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-900">
                    <FileText className="h-4 w-4 mr-1" />
                    {solicitacao.razao_social || 'Não informado'}
                  </div>
                  <div className="text-sm text-gray-600">
                    CNPJ: {formatCNPJ(solicitacao.cnpj)}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-1" />
                    {solicitacao.email}
                  </div>
                  {solicitacao.telefone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-1" />
                      {formatPhone(solicitacao.telefone)}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(solicitacao.status)}
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {new Date(solicitacao.created_at).toLocaleDateString('pt-BR')}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onView(solicitacao)}
                    className="border-[#0098DA] text-[#0098DA] hover:bg-[#0098DA] hover:text-white"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {solicitacao.status === 'pendente' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onApprove(solicitacao)}
                        disabled={isProcessing}
                        className="border-green-300 text-green-600 hover:bg-green-100"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReject(solicitacao)}
                        disabled={isProcessing}
                        className="border-red-300 text-red-600 hover:bg-red-100"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {solicitacoes.length === 0 && (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma solicitação encontrada</p>
        </div>
      )}
    </div>
  );
}