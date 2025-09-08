import React, { useState } from 'react';
import { useLocation } from 'wouter';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Search,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Settings,
  Truck,
  Package,
  CreditCard,
  Globe
} from 'lucide-react';

const CadastroEmpresas = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tipoFilter, setTipoFilter] = useState('all');
  const [showNewEmpresaDialog, setShowNewEmpresaDialog] = useState(false);

  // Sample company data
  const empresas = [
    {
      id: 'EMP-001',
      razao_social: 'Distribuidora ABC Comércio Ltda',
      nome_fantasia: 'Distribuidora ABC',
      cnpj: '12.345.678/0001-90',
      inscricao_estadual: '123.456.789.012',
      tipo: 'cliente',
      status: 'ativo',
      endereco: {
        rua: 'Av. Paulista, 1000',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100'
      },
      contato: {
        telefone: '(11) 3000-0000',
        email: 'contato@distribuidoraabc.com.br',
        responsavel: 'João Silva',
        cargo: 'Gerente Logística'
      },
      dados_comerciais: {
        limite_credito: 250000.00,
        prazo_pagamento: 30,
        desconto_padrao: 5.0,
        categoria: 'premium'
      },
      data_cadastro: '2020-01-15',
      ultima_compra: '2024-06-10',
      total_pedidos: 847,
      volume_mensal: 156780.50,
      observacoes: 'Cliente premium com histórico excelente'
    },
    {
      id: 'EMP-002',
      razao_social: 'Transportes Rápidos S.A.',
      nome_fantasia: 'Transportes Rápidos',
      cnpj: '98.765.432/0001-10',
      inscricao_estadual: '987.654.321.098',
      tipo: 'transportadora',
      status: 'ativo',
      endereco: {
        rua: 'Rod. Fernão Dias, Km 50',
        bairro: 'Distrito Industrial',
        cidade: 'Atibaia',
        estado: 'SP',
        cep: '12940-000'
      },
      contato: {
        telefone: '(11) 4000-0000',
        email: 'operacional@transportesrapidos.com.br',
        responsavel: 'Maria Santos',
        cargo: 'Coordenadora Operacional'
      },
      dados_comerciais: {
        limite_credito: 100000.00,
        prazo_pagamento: 15,
        desconto_padrao: 0.0,
        categoria: 'standard'
      },
      data_cadastro: '2019-03-22',
      ultima_compra: '2024-06-11',
      total_pedidos: 2341,
      volume_mensal: 89650.00,
      observacoes: 'Parceiro logístico confiável'
    },
    {
      id: 'EMP-003',
      razao_social: 'Fornecedora XYZ Indústria Ltda',
      nome_fantasia: 'XYZ Indústria',
      cnpj: '11.222.333/0001-44',
      inscricao_estadual: '112.223.334.445',
      tipo: 'fornecedor',
      status: 'pendente_documentacao',
      endereco: {
        rua: 'Av. Industrial, 2000',
        bairro: 'Cidade Industrial',
        cidade: 'Contagem',
        estado: 'MG',
        cep: '32210-000'
      },
      contato: {
        telefone: '(31) 3500-0000',
        email: 'comercial@xyzindustria.com.br',
        responsavel: 'Carlos Oliveira',
        cargo: 'Diretor Comercial'
      },
      dados_comerciais: {
        limite_credito: 0.00,
        prazo_pagamento: 0,
        desconto_padrao: 0.0,
        categoria: 'novo'
      },
      data_cadastro: '2024-06-05',
      ultima_compra: null,
      total_pedidos: 0,
      volume_mensal: 0.00,
      observacoes: 'Aguardando validação de documentos'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'inativo': return 'bg-gray-100 text-gray-800';
      case 'suspenso': return 'bg-red-100 text-red-800';
      case 'pendente_documentacao': return 'bg-yellow-100 text-yellow-800';
      case 'pendente_aprovacao': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'cliente': return 'bg-blue-100 text-blue-800';
      case 'fornecedor': return 'bg-purple-100 text-purple-800';
      case 'transportadora': return 'bg-green-100 text-green-800';
      case 'parceiro': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoriaColor = (categoria: string) => {
    switch (categoria) {
      case 'premium': return 'bg-gold-100 text-gold-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'novo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEmpresas = empresas.filter(empresa => {
    const matchesSearch = empresa.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empresa.nome_fantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empresa.cnpj.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || empresa.status === statusFilter;
    const matchesTipo = tipoFilter === 'all' || empresa.tipo === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  return (
    <MainLayout title="Cadastro de Empresas">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Cadastro de Empresas</h2>
        <p className="text-gray-600">Gestão completa de clientes, fornecedores e parceiros</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Dialog open={showNewEmpresaDialog} onOpenChange={setShowNewEmpresaDialog}>
          <DialogTrigger asChild>
            <Button className="h-16 flex flex-col items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
              <DialogDescription>
                Registre uma nova empresa no sistema
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Dados da Empresa */}
              <div className="space-y-2 col-span-2">
                <h4 className="font-medium text-gray-800">Dados da Empresa</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="razao_social">Razão Social</Label>
                <Input id="razao_social" placeholder="Razão social completa" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
                <Input id="nome_fantasia" placeholder="Nome fantasia" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" placeholder="00.000.000/0000-00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inscricao_estadual">Inscrição Estadual</Label>
                <Input id="inscricao_estadual" placeholder="000.000.000.000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Empresa</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="fornecedor">Fornecedor</SelectItem>
                    <SelectItem value="transportadora">Transportadora</SelectItem>
                    <SelectItem value="parceiro">Parceiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria comercial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="novo">Novo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Endereço */}
              <div className="space-y-2 col-span-2">
                <h4 className="font-medium text-gray-800 mt-4">Endereço</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" placeholder="00000-000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logradouro">Logradouro</Label>
                <Input id="logradouro" placeholder="Rua, Avenida, etc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input id="bairro" placeholder="Nome do bairro" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" placeholder="Nome da cidade" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SP">São Paulo</SelectItem>
                    <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                    <SelectItem value="MG">Minas Gerais</SelectItem>
                    <SelectItem value="PR">Paraná</SelectItem>
                    <SelectItem value="SC">Santa Catarina</SelectItem>
                    <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contato */}
              <div className="space-y-2 col-span-2">
                <h4 className="font-medium text-gray-800 mt-4">Contato</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" placeholder="(00) 0000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="contato@empresa.com.br" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input id="responsavel" placeholder="Nome do responsável" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input id="cargo" placeholder="Cargo do responsável" />
              </div>

              {/* Dados Comerciais */}
              <div className="space-y-2 col-span-2">
                <h4 className="font-medium text-gray-800 mt-4">Dados Comerciais</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="limite_credito">Limite de Crédito</Label>
                <Input id="limite_credito" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prazo_pagamento">Prazo de Pagamento (dias)</Label>
                <Input id="prazo_pagamento" type="number" placeholder="30" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desconto_padrao">Desconto Padrão (%)</Label>
                <Input id="desconto_padrao" type="number" step="0.1" placeholder="0.0" />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" placeholder="Informações adicionais sobre a empresa..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewEmpresaDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowNewEmpresaDialog(false)}>
                Cadastrar Empresa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button 
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <FileText className="h-5 w-5" />
          Documentos
        </Button>

        <Button 
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <CreditCard className="h-5 w-5" />
          Financeiro
        </Button>

        <Button 
          onClick={() => setLocation('/relatorios/empresas')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <Package className="h-5 w-5" />
          Relatórios
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Users className="mr-2 h-4 w-4 text-blue-500" />
              Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">248</div>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Building className="mr-2 h-4 w-4 text-purple-500" />
              Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">89</div>
            <p className="text-xs text-muted-foreground">Cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Truck className="mr-2 h-4 w-4 text-green-500" />
              Transportadoras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">34</div>
            <p className="text-xs text-muted-foreground">Parceiras</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
              Pendências
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">12</div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="suspenso">Suspenso</SelectItem>
                <SelectItem value="pendente_documentacao">Pendente Documentação</SelectItem>
                <SelectItem value="pendente_aprovacao">Pendente Aprovação</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="fornecedor">Fornecedor</SelectItem>
                <SelectItem value="transportadora">Transportadora</SelectItem>
                <SelectItem value="parceiro">Parceiro</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Filtros Avançados
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dados Comerciais</TableHead>
                  <TableHead>Histórico</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmpresas.map((empresa) => (
                  <TableRow key={empresa.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{empresa.nome_fantasia}</div>
                        <div className="text-sm text-gray-500">{empresa.razao_social}</div>
                        <div className="text-xs text-gray-400">{empresa.id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">CNPJ: {empresa.cnpj}</div>
                        <div className="text-sm">IE: {empresa.inscricao_estadual}</div>
                        <div className="text-xs text-gray-500">
                          Cadastro: {empresa.data_cadastro}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {empresa.contato.telefone}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {empresa.contato.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          {empresa.contato.responsavel} - {empresa.contato.cargo}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {empresa.endereco.cidade}, {empresa.endereco.estado}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTipoColor(empresa.tipo)}>
                        {empresa.tipo}
                      </Badge>
                      <div className="mt-1">
                        <Badge className={getCategoriaColor(empresa.dados_comerciais.categoria)} variant="outline">
                          {empresa.dados_comerciais.categoria}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(empresa.status)}>
                        {empresa.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">
                          Limite: R$ {empresa.dados_comerciais.limite_credito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500">
                          Prazo: {empresa.dados_comerciais.prazo_pagamento} dias
                        </div>
                        <div className="text-xs text-gray-500">
                          Desconto: {empresa.dados_comerciais.desconto_padrao}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{empresa.total_pedidos} pedidos</div>
                        <div className="text-xs text-gray-500">
                          Vol. mensal: R$ {empresa.volume_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        {empresa.ultima_compra && (
                          <div className="text-xs text-gray-500">
                            Última: {empresa.ultima_compra}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredEmpresas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Building className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Nenhuma empresa encontrada com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default CadastroEmpresas;