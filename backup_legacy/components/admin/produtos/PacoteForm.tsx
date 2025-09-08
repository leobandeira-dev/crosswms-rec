
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

// Mock data for demonstration
const mockPacotes = [
  {
    id: '1',
    nome: 'Básico',
    descricao: 'Pacote com funcionalidades essenciais',
    preco: 199.00,
    status: 'ativo',
    modulos: ['Coletas', 'SAC'],
    popular: false,
  },
];

// Available modules
const modulosDisponiveis = [
  { id: 'coletas', label: 'Coletas' },
  { id: 'armazenagem', label: 'Armazenagem' },
  { id: 'expedicao', label: 'Expedição' },
  { id: 'sac', label: 'SAC' },
  { id: 'relatorios', label: 'Relatórios Avançados' },
];

const pacoteFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  preco: z.string().min(1, 'Preço é obrigatório'),
  status: z.enum(['ativo', 'inativo']),
  modulos: z.array(z.string()).min(1, 'Selecione pelo menos um módulo'),
  popular: z.boolean().optional(),
});

type PacoteFormProps = {
  pacoteId: string | null;
  onSave: () => void;
  onCancel: () => void;
};

export const PacoteForm = ({ pacoteId, onSave, onCancel }: PacoteFormProps) => {
  // Fetch pacote data if editing
  const pacoteData = pacoteId 
    ? mockPacotes.find(p => p.id === pacoteId) 
    : null;

  const form = useForm<z.infer<typeof pacoteFormSchema>>({
    resolver: zodResolver(pacoteFormSchema),
    defaultValues: pacoteData ? {
      nome: pacoteData.nome,
      descricao: pacoteData.descricao,
      preco: pacoteData.preco.toString(),
      status: pacoteData.status as 'ativo' | 'inativo',
      modulos: pacoteData.modulos,
      popular: pacoteData.popular,
    } : {
      nome: '',
      descricao: '',
      preco: '',
      status: 'ativo',
      modulos: [],
      popular: false,
    }
  });

  const onSubmit = async (data: z.infer<typeof pacoteFormSchema>) => {
    // Implement save logic here
    console.log('Dados do pacote:', data);
    
    // Mock saving
    setTimeout(() => {
      toast({
        title: pacoteId ? "Pacote atualizado" : "Pacote criado",
        description: `${data.nome} foi ${pacoteId ? 'atualizado' : 'adicionado'} com sucesso.`,
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
                      <Input placeholder="Nome do pacote" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço*</FormLabel>
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

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição*</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição do pacote" 
                          {...field} 
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="popular"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Marcar como Popular</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Este pacote será destacado como popular no site.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div>
              <FormLabel className="text-base">Módulos Inclusos*</FormLabel>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione os módulos que estarão disponíveis neste pacote:
              </p>
              
              <FormField
                control={form.control}
                name="modulos"
                render={() => (
                  <FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      {modulosDisponiveis.map((modulo) => (
                        <FormField
                          key={modulo.id}
                          control={form.control}
                          name="modulos"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={modulo.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(modulo.label)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, modulo.label])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== modulo.label
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {modulo.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">
                {pacoteId ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
