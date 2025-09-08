
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockChamados = [
  {
    id: '1',
    clienteId: '1',
    assunto: 'Erro ao gerar relatórios',
    descricao: 'Quando tento gerar o relatório de expedição, aparece um erro de "dados não encontrados".',
    categoria: 'bug',
    prioridade: 'alta',
    status: 'aberto',
  },
];

// Mock clientes para o select
const mockClientes = [
  { id: '1', nome: 'Empresa ABC Ltda' },
  { id: '2', nome: 'Distribuidora XYZ S.A.' },
  { id: '3', nome: 'Transportes Rápidos Ltda' },
];

const chamadoFormSchema = z.object({
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  assunto: z.string().min(1, 'Assunto é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  prioridade: z.string().min(1, 'Prioridade é obrigatória'),
  status: z.string().min(1, 'Status é obrigatório'),
});

type ChamadoFormProps = {
  chamadoId: string | null;
  onSave: () => void;
  onCancel: () => void;
};

export const ChamadoForm = ({ chamadoId, onSave, onCancel }: ChamadoFormProps) => {
  // Fetch chamado data if editing
  const chamadoData = chamadoId 
    ? mockChamados.find(c => c.id === chamadoId) 
    : null;

  const form = useForm<z.infer<typeof chamadoFormSchema>>({
    resolver: zodResolver(chamadoFormSchema),
    defaultValues: chamadoData ? {
      clienteId: chamadoData.clienteId,
      assunto: chamadoData.assunto,
      descricao: chamadoData.descricao,
      categoria: chamadoData.categoria,
      prioridade: chamadoData.prioridade,
      status: chamadoData.status,
    } : {
      clienteId: '',
      assunto: '',
      descricao: '',
      categoria: 'duvida',
      prioridade: 'media',
      status: 'aberto',
    }
  });

  const onSubmit = async (data: z.infer<typeof chamadoFormSchema>) => {
    // Implement save logic here
    console.log('Dados do chamado:', data);
    
    // Mock saving
    setTimeout(() => {
      toast({
        title: chamadoId ? "Chamado atualizado" : "Chamado criado",
        description: `O chamado ${data.assunto} foi ${chamadoId ? 'atualizado' : 'criado'} com sucesso.`,
      });
      onSave();
    }, 500);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="clienteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente*</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mockClientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assunto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assunto*</FormLabel>
                  <FormControl>
                    <Input placeholder="Assunto do chamado" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bug">Bug</SelectItem>
                        <SelectItem value="duvida">Dúvida</SelectItem>
                        <SelectItem value="solicitacao">Solicitação</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prioridade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prioridade*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="aberto">Aberto</SelectItem>
                        <SelectItem value="em_atendimento">Em Atendimento</SelectItem>
                        <SelectItem value="resolvido">Resolvido</SelectItem>
                        <SelectItem value="fechado">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição*</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição detalhada do chamado" 
                      {...field} 
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                {chamadoId ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
