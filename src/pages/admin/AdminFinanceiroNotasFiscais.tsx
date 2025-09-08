import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Search, FileText, Building, Calendar, Eye, Download, Filter } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NotaFiscal {
  id: string;
  chave_acesso: string;
  numero_nota: string;
  serie: string;
  emitente_nome: string;
  emitente_cnpj: string;
  destinatario_nome: string;
  destinatario_cnpj: string;
  valor_total: number;
  data_emissao: string;
  data_vencimento: string;
  status: string;
  tipo_operacao: string;
  empresa_id: string;
  created_at: string;
}

export default function AdminFinanceiroNotasFiscais() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [tipoFilter, setTipoFilter] = useState('todos');

  const { data: notasFiscais = [], isLoading } = useQuery<NotaFiscal[]>({
    queryKey: ['/api/admin/financeiro/notas-fiscais'],
  });

  const filteredNotas = notasFiscais.filter(nota => {
    const matchesSearch = nota.numero_nota.includes(searchTerm) ||
                         nota.emitente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nota.destinatario_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nota.chave_acesso.includes(searchTerm);
    const matchesStatus = statusFilter === 'todos' || nota.status === statusFilter;
    const matchesTipo = tipoFilter === 'todos' || nota.tipo_operacao === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'autorizada': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'rejeitada': return 'bg-red-100 text-red-800';
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

  const totalAutorizadas = notasFiscais
    .filter(n => n.status === 'autorizada')
    .reduce((acc, n) => acc + n.valor_total, 0);

  const totalPendentes = notasFiscais.filter(n => n.status === 'pendente').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notas Fiscais</h1>
            <p className="text-gray-600 mt-1">Gestão de notas fiscais do sistema</p>
          </div>
          <Button className="bg-[#0098DA] hover:bg-[#0077B3]">
            <Download size={20} className="mr-2" />
            Exportar XML
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Autorizadas</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAutorizadas)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPendentes}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total NFe</p>
                  <p className="text-2xl font-bold text-gray-900">{notasFiscais.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Este Mês</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {notasFiscais.filter(n => 
                      new Date(n.data_emissao).getMonth() === new Date().getMonth()
                    ).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Notas Fiscais</CardTitle>
            <CardDescription>
              Controle completo de notas fiscais eletrônicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar por número, chave de acesso, emitente ou destinatário..."
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
                  <SelectItem value="autorizada">Autorizada</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="rejeitada">Rejeitada</SelectItem>
                </SelectContent>
              </Select>
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Tipos</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0098DA] mx-auto"></div>
                <p className="text-gray-500 mt-2">Carregando notas fiscais...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotas.map((nota) => (
                  <div key={nota.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText size={20} className="text-[#0098DA]" />
                          <h3 className="font-semibold text-lg">NFe {nota.numero_nota}/{nota.serie}</h3>
                          <Badge className={getStatusColor(nota.status)}>
                            {nota.status}
                          </Badge>
                          <span className="text-lg font-bold text-[#0098DA]">
                            {formatCurrency(nota.valor_total)}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-2">
                          <div>
                            <p><strong>Emitente:</strong> {nota.emitente_nome}</p>
                            <p><strong>CNPJ:</strong> {nota.emitente_cnpj}</p>
                          </div>
                          <div>
                            <p><strong>Destinatário:</strong> {nota.destinatario_nome}</p>
                            <p><strong>CNPJ:</strong> {nota.destinatario_cnpj}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Emissão: {formatDate(nota.data_emissao)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText size={16} />
                            <span>Tipo: {nota.tipo_operacao}</span>
                          </div>
                          <div className="text-xs text-gray-400">
                            Chave: {nota.chave_acesso}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye size={16} className="mr-1" />
                          Ver XML
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download size={16} className="mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredNotas.length === 0 && (
                  <div className="text-center py-8">
                    <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Nenhuma nota fiscal encontrada</p>
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