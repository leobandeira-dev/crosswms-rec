
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

// Mock clientes para o select
const mockClientes = [
  { id: '1', nome: 'Empresa ABC Ltda' },
  { id: '2', nome: 'Distribuidora XYZ S.A.' },
  { id: '3', nome: 'Transportes Rápidos Ltda' },
];

// Mock recebimentos para edição
const mockRecebimentos = [
  {
    id: '1',
    clienteId: '1',
    recibo: 'REC-1001',
    dataEmissao: '2023-06-01',
    dataVencimento: '2023-06-15',
    valor: 1250.00,
    formaPagamento: 'boleto',
    status: 'pendente',
    descricao: 'Mensalidade Pacote Standard - Junho/2023',
    observacoes: '',
  },
];

const formasPagamento = [
  { value: 'boleto', label: 'Boleto' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao', label: 'Cartão de Crédito' },
  { value: 'transferencia', label: 'Transferência Bancária' },
];

const recebimentoFormSchema = z.object({
  clienteId: z.string().min(1, 'Cliente é obrigatório'),
  recibo: z.string().min(1, 'Número do recibo é obrigatório'),
  dataEmissao: z.string().min(1, 'Data de emissão é obrigatória'),
  dataVencimento: z.string().min(1, 'Data de vencimento é obrigatória'),
  valor: z.string().min(1, 'Valor é obrigatório'),
  formaPagamento: z.string().min(1, 'Forma de pagamento é obrigatória'),
  status: z.string().min(1, 'Status é obrigatório'),
  dataPagamento: z.string().optional(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  observacoes: z.string().optional(),
});

type RecebimentoFormProps = {
  recebimentoId: string | null;
  onSave: () => void;
  onCancel: () => void;
};

export const RecebimentoForm = ({ recebimentoId, onSave, onCancel }: RecebimentoFormProps) => {
  // Fetch recebimento data if editing
  const recebimentoData = recebimentoId 
    ? mockRecebimentos.find(r => r.id === recebimentoId) 
    : null;

  const form = useForm<z.infer<typeof recebimentoFormSchema>>({
    resolver: zodResolver(recebimentoFormSchema),
    defaultValues: recebimentoData ? {
      clienteId: recebimentoData.clienteId,
      recibo: recebimentoData.recibo,
      dataEmissao: recebimentoData.dataEmissao,
      dataVencimento: recebimentoData.dataVencimento,
      valor: recebimentoData.valor.toString(),
      formaPagamento: recebimentoData.formaPagamento,
      status: recebimentoData.status,
      dataPagamento: '',
      descricao: recebimentoData.descricao,
      observacoes: recebimentoData.observacoes,
    } : {
      clienteId: '',
      recibo: '',
      dataEmissao: new Date().toISOString().split('T')[0],
      dataVencimento: '',
      valor: '',
      formaPagamento: '',
      status: 'pendente',
      dataPagamento: '',
      descricao: '',
      observacoes: '',
    }
  });

  const watchStatus = form.watch('status');

  const onSubmit = async (data: z.infer<typeof recebimentoFormSchema>) => {
    // Implement save logic here
    console.log('Dados do recebimento:', data);
    
    // Mock saving
    setTimeout(() => {
      toast({
        title: recebimentoId ? "Recebimento atualizado" : "Recebimento criado",
        description: `Recebimento ${data.recibo} foi ${recebimentoId ? 'atualizado' : 'adicionado'} com sucesso.`,
      });
      onSave();
    }, 500);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                name="recibo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do Recibo*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: REC-1001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataEmissao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Emissão*</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataVencimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Vencimento*</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="0.00" 
                        {...field} 
                        type="number" 
                        step="0.01"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="formaPagamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma de pagamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {formasPagamento.map((forma) => (
                          <SelectItem key={forma.value} value={forma.value}>
                            {forma.label}
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
                        <SelectItem value="pendente">Pendente</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="atrasado">Atrasado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchStatus === 'pago' && (
                <FormField
                  control={form.control}
                  name="dataPagamento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Pagamento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição*</FormLabel>
                  <FormControl>
                    <Input placeholder="Descrição do recebimento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais" 
                      {...field}
                      rows={3}
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
                {recebimentoId ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
