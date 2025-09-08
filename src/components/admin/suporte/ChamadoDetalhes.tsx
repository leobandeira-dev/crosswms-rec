
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { MessageCircle, Clock, User, Tag, AlertTriangle, Send } from 'lucide-react';

// Mock data for demonstration
const mockChamados = [
  {
    id: '1',
    clienteId: '1',
    cliente: 'Empresa ABC Ltda',
    assunto: 'Erro ao gerar relatórios',
    descricao: 'Quando tento gerar o relatório de expedição, aparece um erro de "dados não encontrados".',
    categoria: 'Bug',
    prioridade: 'alta',
    status: 'aberto',
    dataAbertura: '15/05/2023 14:30',
    ultimaAtualizacao: '16/05/2023 09:15',
    responsavel: 'Carlos Silva',
  },
];

// Mock mensagens do chamado
const mockMensagens = [
  {
    id: '1',
    chamadoId: '1',
    usuario: 'João Silva',
    usuarioEmail: 'joao.silva@empresaabc.com.br',
    conteudo: 'Estou tendo problemas para gerar o relatório de expedição no módulo de Armazenagem. Sempre que clico em "Gerar", aparece um erro dizendo "Dados não encontrados".',
    data: '15/05/2023 14:30',
    tipo: 'cliente',
  },
  {
    id: '2',
    chamadoId: '1',
    usuario: 'Carlos Silva',
    usuarioEmail: 'carlos.silva@suporte.com.br',
    conteudo: 'Olá João, obrigado por reportar este problema. Você poderia nos informar qual a data que está tentando filtrar no relatório? Também seria útil um print da tela de erro.',
    data: '15/05/2023 15:45',
    tipo: 'suporte',
  },
  {
    id: '3',
    chamadoId: '1',
    usuario: 'João Silva',
    usuarioEmail: 'joao.silva@empresaabc.com.br',
    conteudo: 'Estou tentando gerar para o período de 01/05 a 15/05. Anexo segue o print da tela de erro.',
    data: '16/05/2023 09:15',
    tipo: 'cliente',
    anexo: 'erro_relatorio.png',
  },
];

type ChamadoDetalhesProps = {
  chamadoId: string;
  onEdit: (id: string) => void;
  onBack: () => void;
};

export const ChamadoDetalhes = ({ chamadoId, onEdit, onBack }: ChamadoDetalhesProps) => {
  const [resposta, setResposta] = useState('');
  
  // Fetch chamado data
  const chamado = mockChamados.find(c => c.id === chamadoId);
  const mensagens = mockMensagens.filter(m => m.chamadoId === chamadoId);
  
  if (!chamado) {
    return (
      <div>
        <p>Chamado não encontrado.</p>
        <Button onClick={onBack}>Voltar</Button>
      </div>
    );
  }

  const handleResponder = () => {
    if (!resposta.trim()) {
      toast({
        title: "Resposta vazia",
        description: "Por favor, escreva uma resposta antes de enviar.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Resposta enviada",
      description: "Sua resposta foi enviada com sucesso.",
    });
    
    setResposta('');
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade.toLowerCase()) {
      case 'alta':
        return <Badge variant="destructive">Alta</Badge>;
      case 'media':
        return <Badge variant="default">Média</Badge>;
      case 'baixa':
        return <Badge variant="outline">Baixa</Badge>;
      case 'critica':
        return <Badge variant="destructive" className="bg-red-700">Crítica</Badge>;
      default:
        return <Badge variant="secondary">{prioridade}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aberto':
        return <Badge variant="secondary">Aberto</Badge>;
      case 'em_atendimento':
        return <Badge variant="default" className="bg-blue-600">Em Atendimento</Badge>;
      case 'resolvido':
        return <Badge variant="default" className="bg-green-600">Resolvido</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoriaBadge = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'bug':
        return <Badge variant="destructive" className="bg-red-500">{categoria}</Badge>;
      case 'duvida':
      case 'dúvida':
        return <Badge variant="default" className="bg-blue-500">{categoria}</Badge>;
      case 'solicitacao':
      case 'solicitação':
        return <Badge variant="default" className="bg-amber-500">{categoria}</Badge>;
      default:
        return <Badge variant="secondary">{categoria}</Badge>;
    }
  };

  const getMensagemClassNames = (tipo: string) => {
    return tipo === 'cliente' 
      ? 'bg-muted ml-6 mr-0 md:ml-12' 
      : 'bg-primary text-primary-foreground ml-0 mr-6 md:mr-12';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">{chamado.assunto}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Chamado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Descrição:</h3>
                  <p className="mt-1">{chamado.descricao}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p>{chamado.cliente}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Categoria</p>
                      <div>{getCategoriaBadge(chamado.categoria)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Prioridade</p>
                      <div>{getPrioridadeBadge(chamado.prioridade)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Responsável</p>
                      <p>{chamado.responsavel || 'Não atribuído'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Aberto em</p>
                      <p>{chamado.dataAbertura}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Atualizado em</p>
                      <p>{chamado.ultimaAtualizacao}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => onEdit(chamadoId)}>
                    Editar Chamado
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="text-center">
                  {getStatusBadge(chamado.status)}
                </div>
                
                <div className="mt-4 w-full">
                  <Button 
                    className="w-full"
                    disabled={chamado.status === 'em_atendimento'}
                  >
                    Assumir Atendimento
                  </Button>
                </div>
                
                <div className="mt-2 w-full">
                  <Button 
                    className="w-full"
                    variant="outline"
                    disabled={chamado.status === 'resolvido'}
                  >
                    Marcar como Resolvido
                  </Button>
                </div>
                
                <div className="mt-2 w-full">
                  <Button 
                    className="w-full"
                    variant="outline"
                  >
                    Transferir Chamado
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" /> 
            Conversação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mensagens.map((mensagem) => (
              <div 
                key={mensagem.id} 
                className={`p-4 rounded-lg ${getMensagemClassNames(mensagem.tipo)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>
                        {mensagem.usuario.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{mensagem.usuario}</p>
                      <p className="text-xs opacity-70">{mensagem.usuarioEmail}</p>
                    </div>
                  </div>
                  <p className="text-xs">{mensagem.data}</p>
                </div>
                <div className="ml-10">
                  <p className="whitespace-pre-line">{mensagem.conteudo}</p>
                  
                  {mensagem.anexo && (
                    <div className="mt-2 p-2 bg-background/50 rounded inline-block">
                      <div className="flex items-center gap-2">
                        <div className="text-xs">📎 {mensagem.anexo}</div>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          Visualizar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div className="mt-6 space-y-4">
              <Textarea 
                placeholder="Digite sua resposta..." 
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                rows={4}
              />
              
              <div className="flex justify-between">
                <Button variant="outline">
                  Anexar Arquivo
                </Button>
                <Button onClick={handleResponder}>
                  <Send className="h-4 w-4 mr-2" /> Enviar Resposta
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
