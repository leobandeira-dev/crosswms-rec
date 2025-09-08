import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Calendar, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Pacote {
  id: string;
  nome: string;
  tipo_pacote: string;
  preco_mensal: number;
  descricao?: string;
  modulos_inclusos?: string[];
  funcionalidades?: string[];
}

interface Assinatura {
  id: string;
  cliente_transportador_id: string;
  pacote_id: string;
  data_inicio: string;
  data_vencimento: string;
  valor_mensal: number;
  status_pagamento: string;
  observacoes?: string;
  pacote?: Pacote;
}

interface GerenciamentoPacotesProps {
  clienteId: string;
}

export default function GerenciamentoPacotes({ clienteId }: GerenciamentoPacotesProps) {
  const [novaAssinatura, setNovaAssinatura] = useState<{ pacoteId: string; ativo: boolean } | null>(null);
  const queryClient = useQueryClient();

  // Buscar pacotes disponíveis
  const { data: pacotesDisponiveis = [], isLoading: loadingPacotes } = useQuery<Pacote[]>({
    queryKey: ['/api/admin/pacotes'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/pacotes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar pacotes');
      }
      
      return response.json();
    }
  });

  // Buscar assinaturas ativas do cliente
  const { data: assinaturas = [], isLoading: loadingAssinaturas } = useQuery<Assinatura[]>({
    queryKey: [`/api/clientes-transportador/${clienteId}/assinaturas`],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clientes-transportador/${clienteId}/assinaturas`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Erro ao carregar assinaturas');
      }
      
      return response.json();
    }
  });

  // Criar nova assinatura
  const criarAssinaturaMutation = useMutation({
    mutationFn: async (data: { pacoteId: string }) => {
      const token = localStorage.getItem('token');
      const novaAssinatura = {
        cliente_transportador_id: clienteId,
        pacote_id: data.pacoteId,
        data_inicio: new Date().toISOString(),
        data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        valor_mensal: pacotesDisponiveis.find(p => p.id === data.pacoteId)?.preco_mensal || 0,
        status_pagamento: 'ativo'
      };

      const response = await fetch('/api/assinaturas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novaAssinatura)
      });

      if (!response.ok) {
        throw new Error('Erro ao criar assinatura');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Pacote ativado com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/clientes-transportador/${clienteId}/assinaturas`] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao ativar pacote",
        variant: "destructive"
      });
    }
  });

  // Cancelar assinatura
  const cancelarAssinaturaMutation = useMutation({
    mutationFn: async (assinaturaId: string) => {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/assinaturas/${assinaturaId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status_pagamento: 'cancelado' })
      });

      if (!response.ok) {
        throw new Error('Erro ao cancelar assinatura');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Pacote cancelado com sucesso!"
      });
      queryClient.invalidateQueries({ queryKey: [`/api/clientes-transportador/${clienteId}/assinaturas`] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cancelar pacote",
        variant: "destructive"
      });
    }
  });

  const pacotesAtivos = assinaturas.filter(a => a.status_pagamento === 'ativo').map(a => a.pacote_id);

  const handleTogglePacote = (pacoteId: string, ativo: boolean) => {
    if (ativo) {
      // Ativar pacote
      criarAssinaturaMutation.mutate({ pacoteId });
    } else {
      // Cancelar pacote
      const assinatura = assinaturas.find(a => a.pacote_id === pacoteId && a.status_pagamento === 'ativo');
      if (assinatura) {
        cancelarAssinaturaMutation.mutate(assinatura.id);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle size={12} className="mr-1" />Ativo</Badge>;
      case 'cancelado':
        return <Badge variant="destructive"><XCircle size={12} className="mr-1" />Cancelado</Badge>;
      case 'suspenso':
        return <Badge variant="secondary">Suspenso</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loadingPacotes || loadingAssinaturas) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Carregando pacotes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pacotes Disponíveis */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Pacotes Disponíveis</h3>
        <div className="grid gap-4">
          {pacotesDisponiveis.map((pacote) => {
            const isAtivo = pacotesAtivos.includes(pacote.id);
            const assinatura = assinaturas.find(a => a.pacote_id === pacote.id && a.status_pagamento === 'ativo');
            
            return (
              <Card key={pacote.id} className={`border transition-all ${isAtivo ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Package size={20} className={isAtivo ? 'text-green-600' : 'text-gray-500'} />
                        <div>
                          <h4 className="font-semibold text-gray-900">{pacote.nome}</h4>
                          <p className="text-sm text-gray-600">{pacote.descricao}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="flex items-center gap-1 text-sm font-medium text-blue-600">
                              <DollarSign size={14} />
                              R$ {Number(pacote.preco_mensal || 0).toFixed(2)}/mês
                            </span>
                            {isAtivo && assinatura && (
                              <span className="flex items-center gap-1 text-sm text-green-600">
                                <Calendar size={14} />
                                Vence em {new Date(assinatura.data_vencimento).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isAtivo && getStatusBadge('ativo')}
                      <Switch
                        checked={isAtivo}
                        onCheckedChange={(checked) => handleTogglePacote(pacote.id, checked)}
                        disabled={criarAssinaturaMutation.isPending || cancelarAssinaturaMutation.isPending}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Histórico de Assinaturas */}
      {assinaturas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Histórico de Assinaturas</h3>
          <div className="space-y-3">
            {assinaturas.map((assinatura) => (
              <Card key={assinatura.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <Package size={16} className="text-gray-500" />
                        <div>
                          <h5 className="font-medium">Pacote ID: {assinatura.pacote_id}</h5>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Início: {new Date(assinatura.data_inicio).toLocaleDateString()}</span>
                            <span>Vencimento: {new Date(assinatura.data_vencimento).toLocaleDateString()}</span>
                            <span>R$ {Number(assinatura.valor_mensal || 0).toFixed(2)}/mês</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(assinatura.status_pagamento)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}