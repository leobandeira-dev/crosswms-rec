
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Key, RefreshCw, UserPlus } from 'lucide-react';

// Mock dados de usuários do cliente
const mockUsuarios = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@abclogistica.com.br',
    cargo: 'Gerente',
    ultimoAcesso: '10/05/2023 14:30',
    status: 'ativo',
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria.santos@abclogistica.com.br',
    cargo: 'Operador',
    ultimoAcesso: '11/05/2023 09:15',
    status: 'ativo',
  },
  {
    id: '3',
    nome: 'Carlos Oliveira',
    email: 'carlos.oliveira@abclogistica.com.br',
    cargo: 'Analista',
    ultimoAcesso: '05/05/2023 16:45',
    status: 'inativo',
  },
];

// Mock módulos disponíveis
const mockModulos = [
  {
    id: 'coletas',
    nome: 'Coletas',
    permissoes: ['Visualizar', 'Cadastrar', 'Editar', 'Excluir']
  },
  {
    id: 'armazem',
    nome: 'Armazenagem',
    permissoes: ['Visualizar', 'Cadastrar', 'Editar', 'Excluir']
  },
  {
    id: 'expedicao',
    nome: 'Expedição',
    permissoes: ['Visualizar', 'Cadastrar', 'Editar', 'Excluir']
  },
  {
    id: 'relatorios',
    nome: 'Relatórios',
    permissoes: ['Visualizar', 'Exportar']
  },
];

type ClienteAcessosDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: any | null;
};

export const ClienteAcessosDialog = ({ open, onOpenChange, cliente }: ClienteAcessosDialogProps) => {
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [showUserPermissions, setShowUserPermissions] = useState<boolean>(false);
  
  if (!cliente) return null;

  const handleResetPassword = (usuario: any) => {
    toast({
      title: "Redefinição de senha enviada",
      description: `Um e-mail de redefinição de senha foi enviado para ${usuario.email}.`,
    });
  };

  const handleToggleUserStatus = (usuario: any) => {
    const newStatus = usuario.status === 'ativo' ? 'inativo' : 'ativo';
    toast({
      title: `Usuário ${newStatus === 'ativo' ? 'ativado' : 'desativado'}`,
      description: `O acesso de ${usuario.nome} foi ${newStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso.`,
    });
  };

  const handleShowUserPermissions = (userId: string) => {
    setActiveUserId(userId);
    setShowUserPermissions(true);
  };

  const handleSavePermissions = () => {
    toast({
      title: "Permissões salvas",
      description: "As permissões do usuário foram atualizadas com sucesso.",
    });
    setShowUserPermissions(false);
  };

  const handleCreateUser = () => {
    toast({
      title: "Criar novo usuário",
      description: "Implemente a funcionalidade de criação de usuários.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Gerenciar Acessos - {cliente.razaoSocial}</DialogTitle>
        </DialogHeader>

        {showUserPermissions ? (
          <Card className="border-0 shadow-none">
            <CardHeader>
              <CardTitle>
                Permissões do Usuário: {mockUsuarios.find(u => u.id === activeUserId)?.nome}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockModulos.map(modulo => (
                  <div key={modulo.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id={`modulo-${modulo.id}`} defaultChecked />
                      <Label htmlFor={`modulo-${modulo.id}`} className="font-medium">
                        {modulo.nome}
                      </Label>
                    </div>
                    <div className="ml-6 grid grid-cols-2 gap-2">
                      {modulo.permissoes.map(permissao => (
                        <div key={`${modulo.id}-${permissao}`} className="flex items-center gap-2">
                          <Checkbox id={`${modulo.id}-${permissao}`} defaultChecked />
                          <Label htmlFor={`${modulo.id}-${permissao}`}>{permissao}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline" onClick={() => setShowUserPermissions(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSavePermissions}>Salvar Permissões</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Button onClick={handleCreateUser}>
                <UserPlus className="h-4 w-4 mr-2" /> Adicionar Usuário
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Último Acesso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUsuarios.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      mockUsuarios.map(usuario => (
                        <TableRow key={usuario.id}>
                          <TableCell className="font-medium">{usuario.nome}</TableCell>
                          <TableCell>{usuario.email}</TableCell>
                          <TableCell>{usuario.cargo}</TableCell>
                          <TableCell>{usuario.ultimoAcesso}</TableCell>
                          <TableCell>
                            <Badge variant={usuario.status === 'ativo' ? 'default' : 'secondary'}>
                              {usuario.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleResetPassword(usuario)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reset Senha
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleShowUserPermissions(usuario.id)}
                            >
                              <Key className="h-4 w-4 mr-2" />
                              Permissões
                            </Button>
                            <Switch 
                              checked={usuario.status === 'ativo'} 
                              onCheckedChange={() => handleToggleUserStatus(usuario)}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
