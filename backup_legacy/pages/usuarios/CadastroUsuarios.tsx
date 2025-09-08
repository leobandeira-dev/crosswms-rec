
import React, { useState, useEffect } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, UserPlus, Users, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CadastroForm from './components/CadastroForm';
import AprovacoesUsuario from './components/AprovacoesUsuario';
import PermissoesUsuario from './components/PermissoesUsuario';
import UsersListTab from './components/UsersListTab';
import UserDetailsDialog from './components/UserDetailsDialog';
import { useQuery } from '@tanstack/react-query';
import { fetchComprehensiveUsersList } from '@/services/userService';
import { Skeleton } from '@/components/ui/skeleton';

interface CadastroUsuariosProps {
  initialTab?: string;
}

const CadastroUsuarios: React.FC<CadastroUsuariosProps> = ({ initialTab = 'cadastro' }) => {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // Fetch real users from Supabase
  const { data: usuarios = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['comprehensive-users'],
    queryFn: fetchComprehensiveUsersList,
  });

  // Atualiza a tab quando o initialTab mudar (útil para navegação via link)
  useEffect(() => {
    setCurrentTab(initialTab);
  }, [initialTab]);

  const handleUsuarioSubmit = (data: any) => {
    // Normalmente aqui teríamos uma chamada para API
    toast({
      title: "Cadastro realizado",
      description: "Seu cadastro foi enviado e está aguardando aprovação.",
    });
  };

  const handleApprove = (userId: string) => {
    // Normalmente aqui teríamos uma chamada para API para aprovar o usuário
    toast({
      title: "Usuário aprovado",
      description: "O usuário foi aprovado com sucesso.",
    });
  };

  const handleReject = (userId: string) => {
    // Normalmente aqui teríamos uma chamada para API para rejeitar o usuário
    toast({
      title: "Usuário rejeitado",
      description: "O usuário foi rejeitado.",
    });
  };

  const handleVerDetalhes = (usuario: any) => {
    setSelectedUser(usuario);
    setDetailsDialogOpen(true);
  };

  return (
    <MainLayout title="Cadastro de Usuários">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Gerenciamento de Usuários</h2>
        <p className="text-gray-600">Cadastro, aprovações, permissões e listagem de usuários do sistema</p>
      </div>
      
      <Tabs defaultValue="cadastro" className="mb-6" value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="cadastro">Novo Cadastro</TabsTrigger>
          <TabsTrigger value="aprovacoes">Aprovações Pendentes</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
          <TabsTrigger value="listagem">Usuários</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cadastro">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <UserPlus className="mr-2 text-cross-blue" size={20} />
                Cadastro de Novo Usuário
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CadastroForm onSubmit={handleUsuarioSubmit} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="aprovacoes">
          {isLoadingUsers ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <User className="mr-2 text-cross-blue" size={20} />
                  Aprovações Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-80 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <AprovacoesUsuario 
              usuarios={usuarios.filter(u => u.status === 'pendente')}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </TabsContent>
        
        <TabsContent value="permissoes">
          <PermissoesUsuario />
        </TabsContent>
        
        <TabsContent value="listagem">
          {isLoadingUsers ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 text-cross-blue" size={20} />
                  Listagem de Usuários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-80 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <UsersListTab 
              users={usuarios}
              onViewDetails={handleVerDetalhes}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog para detalhes do usuário */}
      <UserDetailsDialog 
        open={detailsDialogOpen} 
        onOpenChange={setDetailsDialogOpen} 
        user={selectedUser} 
      />
    </MainLayout>
  );
};

export default CadastroUsuarios;
