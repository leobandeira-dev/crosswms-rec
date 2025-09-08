
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Filial } from '@/types/enderecamento.cadastro.types';
import StatusBadge from '@/components/common/StatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';

interface FiliaisTabProps {
  filiais: Filial[];
  adicionarFilial: (filial: Omit<Filial, 'id'>) => void;
  atualizarFilial: (id: string, dados: Partial<Filial>) => void;
  excluirFilial: (id: string) => void;
  currentFilial: Filial | null;
  setCurrentFilial: (filial: Filial | null) => void;
}

const FiliaisTab: React.FC<FiliaisTabProps> = ({
  filiais,
  adicionarFilial,
  atualizarFilial,
  excluirFilial,
  currentFilial,
  setCurrentFilial
}) => {
  const form = useForm();
  const editForm = useForm();
  const [open, setOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  const handleSubmit = (data: any) => {
    adicionarFilial({
      nome: data.nome,
      codigo: data.codigo,
      cnpj: data.cnpj,
      status: 'ativo'
    });
    form.reset();
    setOpen(false);
  };

  const handleEdit = (data: any) => {
    if (currentFilial) {
      atualizarFilial(currentFilial.id, {
        nome: data.nome,
        codigo: data.codigo,
        cnpj: data.cnpj,
        status: data.status as 'ativo' | 'inativo'
      });
      setEditOpen(false);
      setCurrentFilial(null);
    }
  };

  const abrirEdicao = (filial: Filial) => {
    setCurrentFilial(filial);
    editForm.setValue('nome', filial.nome);
    editForm.setValue('codigo', filial.codigo);
    editForm.setValue('cnpj', filial.cnpj);
    editForm.setValue('status', filial.status);
    setEditOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Filiais</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-cross-blue hover:bg-cross-blue/90">
              <Plus size={16} className="mr-2" />
              Nova Filial
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Filial</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da filial" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input placeholder="Código da filial" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="CNPJ da filial" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="bg-cross-blue hover:bg-cross-blue/90">
                    Salvar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog for editing */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Filial</DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da filial" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input placeholder="Código da filial" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="CNPJ da filial" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" className="bg-cross-blue hover:bg-cross-blue/90">
                    Atualizar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Código</TableHead>
              <TableHead>CNPJ</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filiais.map((filial) => (
              <TableRow key={filial.id}>
                <TableCell>{filial.nome}</TableCell>
                <TableCell>{filial.codigo}</TableCell>
                <TableCell>{filial.cnpj}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={filial.status === 'ativo' ? 'success' : 'error'}
                    text={filial.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => abrirEdicao(filial)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => excluirFilial(filial.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FiliaisTab;
