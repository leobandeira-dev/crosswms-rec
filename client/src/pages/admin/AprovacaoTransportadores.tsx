import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MainLayout from "@/components/layout/MainLayout";
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
  Truck, 
  Search, 
  Check, 
  X, 
  Eye,
  Clock,
  Building2,
  Phone,
  Mail,
  MapPin
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
  observacoes: string;
  status: 'pendente' | 'aprovado' | 'rejeitado';
  created_at: Date;
  tipo_usuario: 'transportador';
}

export default function AprovacaoTransportadores() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<SolicitacaoCadastro | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: solicitacoes, isLoading, refetch } = useQuery<SolicitacaoCadastro[]>({
    queryKey: ['/api/admin/solicitacoes-transportadores'],
  });

  const filteredSolicitacoes = solicitacoes?.filter(solicitacao => 
    solicitacao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solicitacao.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    solicitacao.cnpj.includes(searchTerm.replace(/\D/g, ''))
  ) || [];

  const pendentes = filteredSolicitacoes.filter(s => s.status === 'pendente');
  const aprovados = filteredSolicitacoes.filter(s => s.status === 'aprovado');
  const rejeitados = filteredSolicitacoes.filter(s => s.status === 'rejeitado');

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
      // Simular aprovação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Transportador aprovado",
        description: `${solicitacao.nome} foi aprovado e receberá acesso ao sistema por email.`,
      });
      
      refetch();
      setSelectedSolicitacao(null);
    } catch (error) {
      toast({
        title: "Erro na aprovação",
        description: "Não foi possível aprovar o transportador. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejeitar = async (solicitacao: SolicitacaoCadastro) => {
    setIsProcessing(true);
    try {
      // Simular rejeição
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Transportador rejeitado",
        description: `${solicitacao.nome} foi rejeitado e será notificado por email.`,
      });
      
      refetch();
      setSelectedSolicitacao(null);
    } catch (error) {
      toast({
        title: "Erro na rejeição",
        description: "Não foi possível rejeitar o transportador. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Aprovação de Transportadores">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Aprovação de Transportadores">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-600">
              Analise e aprove solicitações de cadastro de transportadores/operadores logísticos
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
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{filteredSolicitacoes.length}</p>
              </div>
              <Truck className="h-8 w-8 text-[#0098DA]" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pendentes.length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aprovados</p>
                <p className="text-2xl font-bold text-green-600">{aprovados.length}</p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejeitados</p>
                <p className="text-2xl font-bold text-red-600">{rejeitados.length}</p>
              </div>
              <X className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Solicitações Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Solicitações de Cadastro ({filteredSolicitacoes.length})
          </CardTitle>
          <CardDescription>
            Lista de todas as solicitações de cadastro de transportadores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transportador</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Solicitação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSolicitacoes.map((solicitacao) => (
                  <TableRow key={solicitacao.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#0098DA] rounded-full flex items-center justify-center">
                          <Truck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{solicitacao.nome}</p>
                          <p className="text-sm text-gray-500">Transportador</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Building2 className="h-4 w-4 mr-1" />
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
                          onClick={() => setSelectedSolicitacao(solicitacao)}
                          className="border-[#0098DA] text-[#0098DA] hover:bg-[#0098DA] hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {solicitacao.status === 'pendente' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAprovar(solicitacao)}
                              disabled={isProcessing}
                              className="border-green-300 text-green-600 hover:bg-green-100"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejeitar(solicitacao)}
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
          </div>
          
          {filteredSolicitacoes.length === 0 && (
            <div className="text-center py-8">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma solicitação encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalhes da Solicitação Modal */}
      {selectedSolicitacao && (
        <Dialog open={!!selectedSolicitacao} onOpenChange={() => setSelectedSolicitacao(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2 text-[#0098DA]" />
                {selectedSolicitacao.nome}
              </DialogTitle>
              <DialogDescription>
                Detalhes da solicitação de cadastro
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                {getStatusBadge(selectedSolicitacao.status)}
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
    </MainLayout>
  );
}