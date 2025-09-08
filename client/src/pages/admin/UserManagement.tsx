import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { UserListing } from '@/components/admin/UserListing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Users, ArrowLeft, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Empresa {
  id: string;
  nome: string;
  cnpj: string;
  tipo_empresa: string;
  status: string;
}

export function UserManagement() {
  const [selectedEmpresaId, setSelectedEmpresaId] = useState<string>('');
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  const { toast } = useToast();

  const { data: empresas = [], isLoading: isLoadingEmpresas, refetch: refetchEmpresas } = useQuery({
    queryKey: ['/api/empresas'],
    queryFn: () => apiRequest('/api/empresas')
  });

  const { data: currentUser } = useQuery({
    queryKey: ['/api/profile'],
    queryFn: () => apiRequest('/api/profile')
  });

  // Auto-select empresa if user is not super_admin
  useEffect(() => {
    if (currentUser && currentUser.tipo_usuario !== 'super_admin' && currentUser.empresa_id) {
      setSelectedEmpresaId(currentUser.empresa_id);
      const userEmpresa = empresas.find((e: Empresa) => e.id === currentUser.empresa_id);
      if (userEmpresa) {
        setSelectedEmpresa(userEmpresa);
      }
    }
  }, [currentUser, empresas]);

  const handleEmpresaChange = (empresaId: string) => {
    setSelectedEmpresaId(empresaId);
    const empresa = empresas.find((e: Empresa) => e.id === empresaId);
    setSelectedEmpresa(empresa || null);
  };

  const handleRefresh = () => {
    refetchEmpresas();
    toast({
      title: "Dados atualizados",
      description: "Lista de empresas foi recarregada"
    });
  };

  const getTipoEmpresaBadge = (tipo: string) => {
    switch (tipo) {
      case 'transportador': return { variant: 'default' as const, label: 'Transportador' };
      case 'cliente': return { variant: 'secondary' as const, label: 'Cliente' };
      case 'fornecedor': return { variant: 'outline' as const, label: 'Fornecedor' };
      default: return { variant: 'outline' as const, label: tipo };
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie usuários cadastrados por empresa
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Seleção de Empresa */}
      {currentUser?.tipo_usuario === 'super_admin' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Seleção de Empresa
            </CardTitle>
            <CardDescription>
              Selecione uma empresa para visualizar seus usuários cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingEmpresas ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex-1">
                  <Select value={selectedEmpresaId} onValueChange={handleEmpresaChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma empresa..." />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((empresa: Empresa) => {
                        const tipoBadge = getTipoEmpresaBadge(empresa.tipo_empresa);
                        return (
                          <SelectItem key={empresa.id} value={empresa.id}>
                            <div className="flex items-center gap-2">
                              <span>{empresa.nome}</span>
                              <Badge variant={tipoBadge.variant} className="text-xs">
                                {tipoBadge.label}
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedEmpresa && (
                  <div className="text-sm text-muted-foreground">
                    CNPJ: {selectedEmpresa.cnpj}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        selectedEmpresa && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Building className="h-6 w-6 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">{selectedEmpresa.nome}</h3>
                  <p className="text-sm text-muted-foreground">CNPJ: {selectedEmpresa.cnpj}</p>
                </div>
                <div className="ml-auto">
                  {(() => {
                    const tipoBadge = getTipoEmpresaBadge(selectedEmpresa.tipo_empresa);
                    return (
                      <Badge variant={tipoBadge.variant}>
                        {tipoBadge.label}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* Lista de Usuários */}
      {selectedEmpresaId ? (
        <UserListing 
          empresaId={selectedEmpresaId} 
          empresaNome={selectedEmpresa?.nome}
        />
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Selecione uma empresa</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {currentUser?.tipo_usuario === 'super_admin' 
                ? 'Escolha uma empresa na lista acima para visualizar seus usuários cadastrados'
                : 'Carregando informações da sua empresa...'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}