
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, User } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead
} from '@/components/ui/table';

interface Usuario {
  id: string;
  nome: string;
  email: string;
  empresa: string;
  cnpj: string;
  perfil: string;
  status: string;
}

interface AprovacoesUsuarioProps {
  usuarios: Usuario[];
  onApprove: (userId: string) => void;
  onReject: (userId: string) => void;
}

const AprovacoesUsuario: React.FC<AprovacoesUsuarioProps> = ({
  usuarios,
  onApprove,
  onReject
}) => {
  const [selectedUser, setSelectedUser] = React.useState<Usuario | null>(null);
  const [dialogAction, setDialogAction] = React.useState<'approve' | 'reject' | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleApprove = (user: Usuario) => {
    setSelectedUser(user);
    setDialogAction('approve');
    setDialogOpen(true);
  };

  const handleReject = (user: Usuario) => {
    setSelectedUser(user);
    setDialogAction('reject');
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (selectedUser && dialogAction) {
      if (dialogAction === 'approve') {
        onApprove(selectedUser.id);
      } else {
        onReject(selectedUser.id);
      }
      setDialogOpen(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <User className="mr-2 text-cross-blue" size={20} />
            Aprovações Pendentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {usuarios && usuarios.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>CNPJ</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell>{usuario.nome}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{usuario.empresa}</TableCell>
                      <TableCell>{usuario.cnpj}</TableCell>
                      <TableCell>{usuario.perfil}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(usuario)}
                            className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                          >
                            <Check size={16} />
                            Aprovar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(usuario)}
                            className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                          >
                            <X size={16} />
                            Rejeitar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-sm text-gray-500">
                Total: {usuarios.length} usuário(s) pendente(s)
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Não há aprovações pendentes no momento.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'approve'
                ? `Tem certeza que deseja aprovar o usuário ${selectedUser?.nome}?`
                : `Tem certeza que deseja rejeitar o usuário ${selectedUser?.nome}?`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Nome:</p>
                <p className="text-sm">{selectedUser?.nome}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Email:</p>
                <p className="text-sm">{selectedUser?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Empresa:</p>
                <p className="text-sm">{selectedUser?.empresa}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Perfil:</p>
                <p className="text-sm">{selectedUser?.perfil}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmAction}
              className={
                dialogAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {dialogAction === 'approve' ? 'Aprovar' : 'Rejeitar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AprovacoesUsuario;
