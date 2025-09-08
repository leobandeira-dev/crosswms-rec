import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Github, GitCommit, Calendar, User, ExternalLink, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/hooks/use-toast';

const manualVersionSchema = z.object({
  versao: z.string().min(1, 'Versão é obrigatória'),
  commit_hash: z.string().min(7, 'Hash do commit deve ter pelo menos 7 caracteres'),
  resumo_implementacao: z.string().min(1, 'Resumo é obrigatório'),
  detalhes_tecnico: z.string().optional(),
  responsavel: z.string().optional(),
  notas_adicionais: z.string().optional(),
});

type ManualVersionData = z.infer<typeof manualVersionSchema>;

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
}

export default function GitHubIntegration() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [githubRepo, setGithubRepo] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const queryClient = useQueryClient();

  const form = useForm<ManualVersionData>({
    resolver: zodResolver(manualVersionSchema),
    defaultValues: {
      versao: '',
      commit_hash: '',
      resumo_implementacao: '',
      detalhes_tecnico: '',
      responsavel: '',
      notas_adicionais: '',
    },
  });

  const { data: historicoVersoes = [], isLoading } = useQuery({
    queryKey: ['/api/historico-versoes'],
  });

  const { data: githubCommits = [], isLoading: loadingCommits, refetch: refetchCommits } = useQuery({
    queryKey: ['github-commits', githubRepo],
    queryFn: async () => {
      if (!githubRepo || !githubToken) return [];
      
      try {
        const response = await fetch(`https://api.github.com/repos/${githubRepo}/commits?per_page=10`, {
          headers: {
            'Authorization': `token ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Erro ao buscar commits do GitHub');
        }
        
        return response.json();
      } catch (error) {
        console.error('Erro ao buscar commits:', error);
        return [];
      }
    },
    enabled: !!githubRepo && !!githubToken,
  });

  const createVersaoMutation = useMutation({
    mutationFn: async (data: ManualVersionData) => {
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

  const onSubmit = (data: ManualVersionData) => {
    createVersaoMutation.mutate(data);
  };

  const fillFromCommit = (commit: GitHubCommit) => {
    form.setValue('commit_hash', commit.sha.substring(0, 12));
    form.setValue('resumo_implementacao', commit.commit.message);
    form.setValue('responsavel', commit.author?.login || commit.commit.author.name);
    
    // Auto-suggest version based on commit message
    const commitMessage = commit.commit.message.toLowerCase();
    let suggestedVersion = '1.0.0';
    
    if (commitMessage.includes('major') || commitMessage.includes('breaking')) {
      suggestedVersion = '2.0.0';
    } else if (commitMessage.includes('minor') || commitMessage.includes('feature')) {
      suggestedVersion = '1.1.0';
    } else if (commitMessage.includes('patch') || commitMessage.includes('fix')) {
      suggestedVersion = '1.0.1';
    }
    
    form.setValue('versao', suggestedVersion);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integração GitHub</h2>
          <p className="text-gray-600">Controle de versões baseado em commits do GitHub</p>
        </div>
      </div>

      {/* GitHub Configuration */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Github className="h-5 w-5" />
            <span>Configuração do Repositório</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="github-repo">Repositório GitHub</Label>
              <Input
                id="github-repo"
                placeholder="ex: usuario/repositorio"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Formato: proprietário/nome-do-repositório
              </p>
            </div>
            <div>
              <Label htmlFor="github-token">Token de Acesso (opcional)</Label>
              <Input
                id="github-token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-1">
                Para repositórios privados
              </p>
            </div>
          </div>
          <Button 
            onClick={() => refetchCommits()} 
            disabled={!githubRepo || loadingCommits}
            className="bg-gray-800 hover:bg-gray-900"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingCommits ? 'animate-spin' : ''}`} />
            Buscar Commits
          </Button>
        </CardContent>
      </Card>

      {/* Recent Commits */}
      {githubCommits.length > 0 && (
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <GitCommit className="h-5 w-5" />
              <span>Commits Recentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {githubCommits.map((commit: GitHubCommit) => (
                <div key={commit.sha} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {commit.sha.substring(0, 7)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {commit.author?.login || commit.commit.author.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatData(commit.commit.author.date)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">
                      {commit.commit.message}
                    </p>
                    <div className="flex space-x-2">
                      <a
                        href={commit.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ver no GitHub
                      </a>
                    </div>
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fillFromCommit(commit)}
                        className="ml-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Versão
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Version Registration */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Registrar Versão Manual
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
                name="resumo_implementacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resumo da Implementação</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva as principais mudanças implementadas..."
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
                name="responsavel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsável</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do responsável" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="detalhes_tecnico"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Detalhes Técnicos (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detalhes técnicos adicionais..."
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
                        placeholder="Observações, problemas conhecidos..."
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

      {/* Versões Históricas */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle>Histórico de Versões</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(historicoVersoes) && historicoVersoes.length > 0 ? (
            <div className="space-y-3">
              {historicoVersoes.slice(0, 5).map((versao: any, index: number) => (
                <div key={versao.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                      v{versao.versao}
                    </Badge>
                    {index === 0 && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Atual
                      </Badge>
                    )}
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
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Nenhuma versão registrada ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}