
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

// Mock leads data for editing
const mockLeads = [
  {
    id: '1',
    nome: 'João Silva',
    empresa: 'Empresa Nova Ltda',
    email: 'joao.silva@empresanova.com.br',
    telefone: '(11) 98765-4321',
    cargo: 'Diretor',
    origem: 'site',
    status: 'novo',
    observacoes: 'Cliente interessado no pacote standard para logística.',
  },
];

const origemOptions = [
  { value: 'site', label: 'Site' },
  { value: 'indicacao', label: 'Indicação' },
  { value: 'feira', label: 'Feira/Evento' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'email', label: 'E-mail Marketing' },
  { value: 'outro', label: 'Outro' },
];

const statusOptions = [
  { value: 'novo', label: 'Novo' },
  { value: 'contatado', label: 'Contatado' },
  { value: 'qualificado', label: 'Qualificado' },
  { value: 'proposta', label: 'Proposta' },
  { value: 'fechado', label: 'Fechado' },
  { value: 'perdido', label: 'Perdido' },
];

const leadFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  empresa: z.string().min(1, 'Empresa é obrigatória'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  cargo: z.string().optional(),
  origem: z.string().min(1, 'Origem é obrigatória'),
  status: z.string().min(1, 'Status é obrigatório'),
  observacoes: z.string().optional(),
});

type LeadFormProps = {
  leadId: string | null;
  onSave: () => void;
  onCancel: () => void;
};

export const LeadForm = ({ leadId, onSave, onCancel }: LeadFormProps) => {
  // Fetch lead data if editing
  const leadData = leadId 
    ? mockLeads.find(l => l.id === leadId) 
    : null;

  const form = useForm<z.infer<typeof leadFormSchema>>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: leadData ? {
      nome: leadData.nome,
      empresa: leadData.empresa,
      email: leadData.email,
      telefone: leadData.telefone,
      cargo: leadData.cargo,
      origem: leadData.origem,
      status: leadData.status,
      observacoes: leadData.observacoes,
    } : {
      nome: '',
      empresa: '',
      email: '',
      telefone: '',
      cargo: '',
      origem: '',
      status: 'novo',
      observacoes: '',
    }
  });

  const onSubmit = async (data: z.infer<typeof leadFormSchema>) => {
    // Implement save logic here
    console.log('Dados do lead:', data);
    
    // Mock saving
    setTimeout(() => {
      toast({
        title: leadId ? "Lead atualizado" : "Lead criado",
        description: `${data.nome} foi ${leadId ? 'atualizado' : 'adicionado'} com sucesso.`,
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
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome*</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do contato" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="empresa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa*</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail*</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone*</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Cargo do contato" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="origem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origem*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a origem" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {origemOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações, histórico de contatos, etc." 
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
                {leadId ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
