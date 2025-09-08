import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, User, GitCommit, Activity, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

const novaVersaoSchema = z.object({
  versao: z.string().min(1, 'Versão é obrigatória'),
  resumo_implementacao: z.string().min(1, 'Resumo é obrigatório'),
  detalhes_tecnico: z.string().optional(),
  ambiente: z.enum(['production', 'staging', 'development']).default('production'),
  responsavel: z.string().optional(),
  commit_hash: z.string().optional(),
  notas_adicionais: z.string().optional(),
});

type NovaVersaoData = z.infer<typeof novaVersaoSchema>;

export default function HistoricoVersoes() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<NovaVersaoData>({
    resolver: zodResolver(novaVersaoSchema),
    defaultValues: {
      versao: '',
      resumo_implementacao: '',
      detalhes_tecnico: '',
      ambiente: 'production',
      responsavel: '',
      commit_hash: '',
      notas_adicionais: '',
    },
  });

  const { data: response, isLoading } = useQuery({
    queryKey: ['/api/historico-versoes'],
  });
  
  const historicoVersoes = Array.isArray(response) ? response : [];

  const createVersaoMutation = useMutation({
    mutationFn: async (data: NovaVersaoData) => {
      const response = await fetch('/api/historico-versoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao criar versão');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/historico-versoes'] });
      toast({
        title: "Versão registrada",
        description: "Nova versão foi adicionada ao histórico com sucesso.",
      });
      setDialogOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao registrar nova versão.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NovaVersaoData) => {
    createVersaoMutation.mutate(data);
  };

  const formatData = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'desativado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rollback':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getAmbienteColor = (ambiente: string) => {
    switch (ambiente) {
      case 'production':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'staging':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'development':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Histórico de Versões</h2>
          <p className="text-gray-600">Controle de deploys e versões do sistema</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Registrar Deploy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nova Versão</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="versao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Versão</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: 2.1.0" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ambiente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ambiente</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o ambiente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="production">Produção</SelectItem>
                            <SelectItem value="staging">Homologação</SelectItem>
                            <SelectItem value="development">Desenvolvimento</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="resumo_implementacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resumo da Implementação</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva as principais mudanças implementadas nesta versão..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="responsavel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do responsável pelo deploy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="commit_hash"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hash do Commit</FormLabel>
                        <FormControl>
                          <Input placeholder="ex: a1b2c3d4..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="detalhes_tecnico"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detalhes Técnicos (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detalhes técnicos adicionais sobre a implementação..."
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notas_adicionais"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas Adicionais (Opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações, problemas conhecidos, próximos passos..."
                          rows={2}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createVersaoMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createVersaoMutation.isPending ? 'Registrando...' : 'Registrar Versão'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {Array.isArray(historicoVersoes) && historicoVersoes.length > 0 ? (
          historicoVersoes.map((versao: any, index: number) => (
            <Card key={versao.id} className="border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CardTitle className="text-lg font-semibold">
                      Versão {versao.versao}
                    </CardTitle>
                    <Badge className={`${getStatusColor(versao.status)} font-medium`}>
                      {versao.status}
                    </Badge>
                    <Badge className={`${getAmbienteColor(versao.ambiente)} font-medium`}>
                      {versao.ambiente}
                    </Badge>
                    {index === 0 && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-medium">
                        Atual
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatData(versao.data_deploy)}
                    </div>
                    {versao.responsavel && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {versao.responsavel}
                      </div>
                    )}
                    {versao.commit_hash && (
                      <div className="flex items-center">
                        <GitCommit className="h-4 w-4 mr-1" />
                        {versao.commit_hash.substring(0, 8)}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Resumo da Implementação</h4>
                    <p className="text-gray-600">{versao.resumo_implementacao}</p>
                  </div>
                  
                  {versao.detalhes_tecnico && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Detalhes Técnicos</h4>
                      <p className="text-gray-600 text-sm">{versao.detalhes_tecnico}</p>
                    </div>
                  )}
                  
                  {versao.notas_adicionais && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Notas Adicionais</h4>
                      <p className="text-gray-600 text-sm">{versao.notas_adicionais}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border border-gray-200">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum histórico encontrado</h3>
              <p className="text-gray-600 mb-4">
                Ainda não há registros de versões no sistema.
              </p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Primeira Versão
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}