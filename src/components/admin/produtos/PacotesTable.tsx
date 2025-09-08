import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Edit, 
  MoreHorizontal, 
  Copy, 
  Eye,
  Users,
  ToggleLeft,
  ToggleRight,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PacoteModulosDialogFixed as PacoteModulosDialog } from './PacoteModulosDialogFixed';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

type PacotesTableProps = {
  searchTerm: string;
  onEdit: (id: string) => void;
};

export const PacotesTable = ({ searchTerm, onEdit }: PacotesTableProps) => {
  const [selectedPacote, setSelectedPacote] = useState<any | null>(null);
  const [showModulosDialog, setShowModulosDialog] = useState(false);
  const queryClient = useQueryClient();

  // Query para buscar pacotes
  const { data: pacotes = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['/api/admin/pacotes'],
  });



  // Mutation para alterar status do pacote
  const toggleStatusMutation = useMutation({
    mutationFn: (pacoteId: string) => 
      apiRequest(`/api/admin/pacotes/${pacoteId}/toggle-status`, { method: 'POST' }),
    onSuccess: () => {
      toast({
        title: "Status alterado",
        description: "O status do pacote foi alterado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pacotes'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    },
  });

  // Filter pacotes based on search term
  const filteredPacotes = Array.isArray(pacotes) ? pacotes.filter((pacote: any) => 
    pacote.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pacote.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleDuplicar = (pacote: any) => {
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A funcionalidade de duplicação será implementada em breve.",
    });
  };

  const handleVerModulos = (pacote: any) => {
    setSelectedPacote(pacote);
    setShowModulosDialog(true);
  };

  const handleVerClientes = (pacoteId: string) => {
    // Redirecionar para página de assinantes
    toast({
      title: "Carregando clientes",
      description: "Redirecionando para a lista de clientes deste pacote.",
    });
  };

  const handleToggleStatus = (pacote: any) => {
    toggleStatusMutation.mutate(pacote.id);
  };

  const getStatusBadge = (ativo: boolean) => {
    return ativo ? (
      <Badge variant="default" className="bg-green-600">Ativo</Badge>
    ) : (
      <Badge variant="secondary">Inativo</Badge>
    );
  };

  const formatPreco = (preco: string | number) => {
    const valor = typeof preco === 'string' ? parseFloat(preco) : preco;
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#0098DA]" />
          <p className="text-muted-foreground">Carregando pacotes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Erro ao carregar pacotes</p>
          <p className="text-muted-foreground text-sm">Verifique sua conexão e tente novamente</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Preço Mensal</TableHead>
            <TableHead>Custos</TableHead>
            <TableHead>Lucro</TableHead>
            <TableHead>Margem %</TableHead>
            <TableHead>Limites</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPacotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                {Array.isArray(pacotes) && pacotes.length === 0 ? 'Nenhum pacote cadastrado.' : 'Nenhum pacote encontrado para o termo pesquisado.'}
              </TableCell>
            </TableRow>
          ) : (
            filteredPacotes.map((pacote: any) => {
              const custoTotal = Number(pacote.custo_infraestrutura || 0) + 
                                Number(pacote.custo_por_documento || 0) + 
                                Number(pacote.custo_api_externa || 0) + 
                                Number(pacote.custo_processamento || 0);
              const precoMensal = Number(pacote.preco_mensal || 0);
              const lucroMensal = precoMensal - custoTotal;
              const margemCalculada = precoMensal > 0 ? (lucroMensal / precoMensal) * 100 : 0;
              
              return (
                <TableRow key={pacote.id}>
                  <TableCell className="font-medium">{pacote.nome}</TableCell>
                  <TableCell>
                    <Badge variant={pacote.tipo_pacote === 'modulo' ? 'default' : 'secondary'}>
                      {pacote.tipo_pacote === 'modulo' ? 'Módulo' : 'Plano'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatPreco(pacote.preco_mensal)}
                  </TableCell>
                  <TableCell className="font-mono text-red-600">
                    {formatPreco(custoTotal)}
                  </TableCell>
                  <TableCell className="font-mono text-green-600">
                    {formatPreco(lucroMensal)}
                  </TableCell>
                  <TableCell className="font-mono">
                    <Badge variant={margemCalculada >= 50 ? "default" : margemCalculada >= 30 ? "secondary" : "destructive"}>
                      {margemCalculada.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {pacote.limite_usuarios && <div>{pacote.limite_usuarios} usuários</div>}
                      {pacote.limite_documentos_mes && <div>{pacote.limite_documentos_mes.toLocaleString()} docs</div>}
                      {pacote.limite_filiais && <div className="text-muted-foreground">{pacote.limite_filiais} filiais</div>}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(pacote.ativo)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(pacote.id)}>
                          <Edit className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicar(pacote)}>
                          <Copy className="h-4 w-4 mr-2" /> Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleVerModulos(pacote)}>
                          <Eye className="h-4 w-4 mr-2" /> Ver Módulos
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleVerClientes(pacote.id)}>
                          <Users className="h-4 w-4 mr-2" /> Ver Assinantes
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(pacote)}
                          disabled={toggleStatusMutation.isPending}
                        >
                          {pacote.ativo ? (
                            <>
                              <ToggleLeft className="h-4 w-4 mr-2" /> Desativar
                            </>
                          ) : (
                            <>
                              <ToggleRight className="h-4 w-4 mr-2" /> Ativar
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Dialog to view modules */}
      <PacoteModulosDialog
        open={showModulosDialog}
        onOpenChange={setShowModulosDialog}
        pacote={selectedPacote}
      />
    </>
  );
};