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
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  MapPin,
  Truck,
  Search,
  Plus,
  Edit,
  Eye,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserCheck,
  Settings,
  Car,
  Award
} from 'lucide-react';

const CadastroMotoristas = () => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showNewMotoristaDialog, setShowNewMotoristaDialog] = useState(false);

  // Sample driver data
  const motoristas = [
    {
      id: 'MOT-001',
      nome: 'João Silva Santos',
      cpf: '123.456.789-00',
      rg: '12.345.678-9',
      cnh: {
        numero: '12345678901',
        categoria: 'E',
        vencimento: '2025-12-15',
        status: 'ativa'
      },
      telefone: '(11) 99999-9999',
      email: 'joao.silva@email.com',
      endereco: {
        rua: 'Rua das Flores, 123',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01010-000'
      },
      data_nascimento: '1985-03-15',
      data_contratacao: '2020-01-10',
      status: 'ativo',
      disponivel: true,
      veiculo_atual: 'ABC-1234',
      pontuacao_cnh: 0,
      viagens_realizadas: 1247,
      km_rodados: 485620,
      observacoes: 'Motorista experiente com excelente histórico'
    },
    {
      id: 'MOT-002',
      nome: 'Maria Santos Oliveira',
      cpf: '987.654.321-00',
      rg: '98.765.432-1',
      cnh: {
        numero: '98765432109',
        categoria: 'D',
        vencimento: '2024-08-20',
        status: 'proxima_vencimento'
      },
      telefone: '(11) 88888-8888',
      email: 'maria.santos@email.com',
      endereco: {
        rua: 'Av. Paulista, 500',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100'
      },
      data_nascimento: '1982-07-22',
      data_contratacao: '2019-05-20',
      status: 'ativo',
      disponivel: false,
      veiculo_atual: 'XYZ-5678',
      pontuacao_cnh: 5,
      viagens_realizadas: 892,
      km_rodados: 298750,
      observacoes: 'CNH próxima ao vencimento - renovar'
    },
    {
      id: 'MOT-003',
      nome: 'Carlos Eduardo Pereira',
      cpf: '456.789.123-00',
      rg: '45.678.912-3',
      cnh: {
        numero: '45678912345',
        categoria: 'E',
        vencimento: '2026-03-10',
        status: 'ativa'
      },
      telefone: '(11) 77777-7777',
      email: 'carlos.pereira@email.com',
      endereco: {
        rua: 'Rua do Comércio, 789',
        bairro: 'Vila Madalena',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '05433-000'
      },
      data_nascimento: '1978-11-05',
      data_contratacao: '2018-03-12',
      status: 'ativo',
      disponivel: true,
      veiculo_atual: null,
      pontuacao_cnh: 12,
      viagens_realizadas: 1856,
      km_rodados: 725430,
      observacoes: 'Motorista veterano - necessita atenção na pontuação CNH'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'inativo': return 'bg-gray-100 text-gray-800';
      case 'suspenso': return 'bg-red-100 text-red-800';
      case 'ferias': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCNHStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-800';
      case 'proxima_vencimento': return 'bg-yellow-100 text-yellow-800';
      case 'vencida': return 'bg-red-100 text-red-800';
      case 'suspensa': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisponibilidadeColor = (disponivel: boolean) => {
    return disponivel ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const filteredMotoristas = motoristas.filter(motorista => {
    const matchesSearch = motorista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         motorista.cpf.includes(searchTerm) ||
                         motorista.cnh.numero.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || motorista.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout title="Cadastro de Motoristas">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Cadastro de Motoristas</h2>
        <p className="text-gray-600">Gestão completa do cadastro e documentação de motoristas</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Dialog open={showNewMotoristaDialog} onOpenChange={setShowNewMotoristaDialog}>
          <DialogTrigger asChild>
            <Button className="h-16 flex flex-col items-center justify-center gap-2">
              <Plus className="h-5 w-5" />
              Novo Motorista
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Motorista</DialogTitle>
              <DialogDescription>
                Registre um novo motorista no sistema
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              {/* Dados Pessoais */}
              <div className="space-y-2 col-span-2">
                <h4 className="font-medium text-gray-800">Dados Pessoais</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" placeholder="Nome completo do motorista" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input id="rg" placeholder="00.000.000-0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input id="data_nascimento" type="date" />
              </div>

              {/* CNH */}
              <div className="space-y-2 col-span-2">
                <h4 className="font-medium text-gray-800 mt-4">Carteira Nacional de Habilitação</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnh_numero">Número da CNH</Label>
                <Input id="cnh_numero" placeholder="00000000000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnh_categoria">Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A - Motocicleta</SelectItem>
                    <SelectItem value="B">B - Automóvel</SelectItem>
                    <SelectItem value="C">C - Caminhão</SelectItem>
                    <SelectItem value="D">D - Ônibus</SelectItem>
                    <SelectItem value="E">E - Carreta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnh_vencimento">Vencimento CNH</Label>
                <Input id="cnh_vencimento" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pontuacao_cnh">Pontuação CNH</Label>
                <Input id="pontuacao_cnh" type="number" placeholder="0" min="0" max="20" />
              </div>

              {/* Contato */}
              <div className="space-y-2 col-span-2">
                <h4 className="font-medium text-gray-800 mt-4">Contato</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" placeholder="(00) 90000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="motorista@email.com" />
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
                <Label htmlFor="rua">Logradouro</Label>
                <Input id="rua" placeholder="Rua, Avenida, etc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bairro">Bairro</Label>
                <Input id="bairro" placeholder="Nome do bairro" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input id="cidade" placeholder="Nome da cidade" />
              </div>

              {/* Dados Profissionais */}
              <div className="space-y-2 col-span-2">
                <h4 className="font-medium text-gray-800 mt-4">Dados Profissionais</h4>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_contratacao">Data de Contratação</Label>
                <Input id="data_contratacao" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Status do motorista" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="ferias">Férias</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea id="observacoes" placeholder="Informações adicionais sobre o motorista..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewMotoristaDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setShowNewMotoristaDialog(false)}>
                Cadastrar Motorista
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button 
          onClick={() => setLocation('/motoristas/cargas')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <Truck className="h-5 w-5" />
          Cargas Atribuídas
        </Button>

        <Button 
          onClick={() => setLocation('/relatorios/motoristas')}
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <FileText className="h-5 w-5" />
          Relatórios
        </Button>

        <Button 
          variant="outline"
          className="h-16 flex flex-col items-center justify-center gap-2"
        >
          <Award className="h-5 w-5" />
          Avaliações
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <UserCheck className="mr-2 h-4 w-4 text-green-500" />
              Motoristas Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">156</div>
            <p className="text-xs text-muted-foreground">Total cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <CheckCircle className="mr-2 h-4 w-4 text-blue-500" />
              Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">89</div>
            <p className="text-xs text-muted-foreground">Para novas viagens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
              CNH Vencendo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">12</div>
            <p className="text-xs text-muted-foreground">Próximos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Car className="mr-2 h-4 w-4 text-purple-500" />
              Em Viagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">67</div>
            <p className="text-xs text-muted-foreground">Atualmente</p>
          </CardContent>
        </Card>
      </div>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Motoristas Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CPF ou CNH..."
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
                <SelectItem value="ferias">Férias</SelectItem>
                <SelectItem value="suspenso">Suspenso</SelectItem>
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
                  <TableHead>Motorista</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead>CNH</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Disponibilidade</TableHead>
                  <TableHead>Estatísticas</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMotoristas.map((motorista) => (
                  <TableRow key={motorista.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <div className="font-medium">{motorista.nome}</div>
                        <div className="text-sm text-gray-500">{motorista.id}</div>
                        <div className="text-xs text-gray-400">Contratado: {motorista.data_contratacao}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">CPF: {motorista.cpf}</div>
                        <div className="text-sm">RG: {motorista.rg}</div>
                        <div className="text-xs text-gray-500">Nasc: {motorista.data_nascimento}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{motorista.cnh.numero}</div>
                        <div className="text-sm">Categoria: {motorista.cnh.categoria}</div>
                        <Badge className={getCNHStatusColor(motorista.cnh.status)}>
                          {motorista.cnh.status.replace('_', ' ')}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">
                          Venc: {motorista.cnh.vencimento}
                        </div>
                        {motorista.pontuacao_cnh > 0 && (
                          <div className="text-xs text-red-600">
                            {motorista.pontuacao_cnh} pontos
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {motorista.telefone}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {motorista.email}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {motorista.endereco.cidade}, {motorista.endereco.estado}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(motorista.status)}>
                        {motorista.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Badge className={getDisponibilidadeColor(motorista.disponivel)}>
                          {motorista.disponivel ? 'Disponível' : 'Ocupado'}
                        </Badge>
                        {motorista.veiculo_atual && (
                          <div className="text-xs text-gray-500 mt-1">
                            Veículo: {motorista.veiculo_atual}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium">{motorista.viagens_realizadas} viagens</div>
                        <div className="text-xs text-gray-500">{motorista.km_rodados.toLocaleString()} km</div>
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

          {filteredMotoristas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Nenhum motorista encontrado com os filtros aplicados.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default CadastroMotoristas;