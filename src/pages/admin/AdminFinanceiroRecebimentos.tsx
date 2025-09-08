import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Search, CreditCard, DollarSign, Calendar, Building, Eye, FileText, Download } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Recebimento {
  id: string;
  empresa_id: string;
  empresa_nome: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string | null;
  status: string;
  tipo_pagamento: string;
  observacoes: string;
  created_at: string;
}

export default function AdminFinanceiroRecebimentos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');

  const { data: recebimentos = [], isLoading } = useQuery<Recebimento[]>({
    queryKey: ['/api/admin/financeiro/recebimentos'],
  });

  const filteredRecebimentos = recebimentos.filter(recebimento => {
    const matchesSearch = recebimento.empresa_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recebimento.observacoes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || recebimento.status === statusFilter;
    const matchesTipo = tipoFilter === 'todos' || recebimento.tipo_pagamento === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'vencido': return 'bg-red-100 text-red-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const totalPendente = recebimentos
    .filter(r => r.status === 'pendente')
    .reduce((acc, r) => acc + r.valor, 0);

  const totalRecebido = recebimentos
    .filter(r => r.status === 'pago')
    .reduce((acc, r) => acc + r.valor, 0);

  const totalVencido = recebimentos
    .filter(r => r.status === 'vencido')
    .reduce((acc, r) => acc + r.valor, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recebimentos</h1>
            <p className="text-gray-600 mt-1">Controle financeiro de recebimentos do sistema</p>
          </div>
          <Button className="bg-[#0098DA] hover:bg-[#0077B3]">
            <Download size={20} className="mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendente</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalPendente)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recebido</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRecebido)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vencido</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalVencido)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{recebimentos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Recebimentos</CardTitle>
            <CardDescription>
              Gestão completa de recebimentos financeiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por empresa ou observações..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Tipos</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="pontual">Pontual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0098DA] mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando recebimentos...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecebimentos.map((recebimento) => (
                  <div key={recebimento.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building size={20} className="text-[#0098DA]" />
                          <h3 className="font-semibold text-lg">{recebimento.empresa_nome}</h3>
                          <Badge className={getStatusColor(recebimento.status)}>
                            {recebimento.status}
                          </Badge>
                          <span className="text-lg font-bold text-[#0098DA]">
                            {formatCurrency(recebimento.valor)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Vencimento: {formatDate(recebimento.data_vencimento)}</span>
                          </div>
                          {recebimento.data_pagamento && (
                            <div className="flex items-center gap-2">
                              <DollarSign size={16} />
                              <span>Pago em: {formatDate(recebimento.data_pagamento)}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} />
                            <span>Tipo: {recebimento.tipo_pagamento}</span>
                          </div>
                        </div>
                        {recebimento.observacoes && (
                          <p className="text-sm text-gray-500 mt-2">{recebimento.observacoes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye size={16} className="mr-1" />
                          Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredRecebimentos.length === 0 && (
                  <div className="text-center py-8">
                    <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Nenhum recebimento encontrado</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}