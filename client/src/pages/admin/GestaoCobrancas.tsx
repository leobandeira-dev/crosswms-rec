import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Send,
  Settings
} from 'lucide-react';

const GestaoCobrancas = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('inadimplentes');
  const { toast } = useToast();

  // Mock data for billing management
  const inadimplentesData = [
    {
      id: '001',
      empresa: 'Logística ABC Ltda',
      cnpj: '12.345.678/0001-90',
      valorDevido: 2500.00,
      diasAtraso: 45,
      ultimoContato: '2024-01-15',
      status: 'critico',
      telefone: '(11) 9999-8888',
      email: 'financeiro@logisticaabc.com'
    },
    {
      id: '002',
      empresa: 'Transportes XYZ S.A.',
      cnpj: '98.765.432/0001-10',
      valorDevido: 1200.00,
      diasAtraso: 15,
      ultimoContato: '2024-01-20',
      status: 'atencao',
      telefone: '(21) 8888-7777',
      email: 'pagamentos@transportesxyz.com'
    },
    {
      id: '003',
      empresa: 'Distribuição 123',
      cnpj: '11.222.333/0001-44',
      valorDevido: 850.00,
      diasAtraso: 8,
      ultimoContato: '2024-01-25',
      status: 'moderado',
      telefone: '(31) 7777-6666',
      email: 'contato@dist123.com'
    }
  ];

  const cobrancasConfig = [
    {
      tipo: 'Email Automático',
      prazo: '7 dias após vencimento',
      status: 'ativo',
      ultimoEnvio: '2024-01-20',
      total: 45
    },
    {
      tipo: 'SMS Lembrete',
      prazo: '3 dias antes do vencimento',
      status: 'ativo',
      ultimoEnvio: '2024-01-25',
      total: 120
    },
    {
      tipo: 'Ligação Telefônica',
      prazo: '15 dias após vencimento',
      status: 'manual',
      ultimoEnvio: '2024-01-18',
      total: 12
    },
    {
      tipo: 'Carta Registrada',
      prazo: '30 dias após vencimento',
      status: 'ativo',
      ultimoEnvio: '2024-01-10',
      total: 8
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critico':
        return 'bg-red-100 text-red-800';
      case 'atencao':
        return 'bg-yellow-100 text-yellow-800';
      case 'moderado':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEnviarCobranca = (clienteId: string, tipo: string) => {
    toast({
      title: "Cobrança Enviada",
      description: `Cobrança ${tipo} enviada para cliente ${clienteId}`,
    });
  };

  const handleConfigurarCobranca = (tipo: string) => {
    toast({
      title: "Configuração Atualizada",
      description: `Configuração de cobrança ${tipo} foi atualizada`,
    });
  };

  const handleExportarRelatorio = () => {
    toast({
      title: "Relatório Exportado",
      description: "O relatório de inadimplência foi gerado com sucesso",
    });
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-red-600" />
            Gestão de Cobranças
          </h1>
          <p className="text-gray-600">
            Visualizar, configurar e notificar inadimplência - Acesso Super Usuário
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total em Atraso</p>
                  <p className="text-2xl font-bold text-red-600">R$ 15.240</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clientes Inadimplentes</p>
                  <p className="text-2xl font-bold text-yellow-600">23</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cobranças Enviadas</p>
                  <p className="text-2xl font-bold text-blue-600">185</p>
                </div>
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Taxa Recuperação</p>
                  <p className="text-2xl font-bold text-green-600">78%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="inadimplentes">Clientes Inadimplentes</TabsTrigger>
            <TabsTrigger value="configuracoes">Configurações de Cobrança</TabsTrigger>
            <TabsTrigger value="historico">Histórico de Cobranças</TabsTrigger>
          </TabsList>

          <TabsContent value="inadimplentes" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Clientes Inadimplentes</CardTitle>
                    <CardDescription>
                      Gerencie clientes com pagamentos em atraso
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar por empresa ou CNPJ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                    <Button variant="outline">
                      <Filter className="h-4 w-4" />
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Valor Devido</TableHead>
                      <TableHead>Dias em Atraso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Último Contato</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inadimplentesData
                      .filter(item => 
                        item.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.cnpj.includes(searchTerm)
                      )
                      .map((cliente) => (
                      <TableRow key={cliente.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cliente.empresa}</p>
                            <p className="text-sm text-gray-600">{cliente.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>{cliente.cnpj}</TableCell>
                        <TableCell>
                          <span className="font-bold text-red-600">
                            R$ {cliente.valorDevido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{cliente.diasAtraso} dias</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(cliente.status)}>
                            {cliente.status === 'critico' ? 'Crítico' : 
                             cliente.status === 'atencao' ? 'Atenção' : 'Moderado'}
                          </Badge>
                        </TableCell>
                        <TableCell>{cliente.ultimoContato}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEnviarCobranca(cliente.id, 'email')}
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleEnviarCobranca(cliente.id, 'telefone')}
                            >
                              <Phone className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="configuracoes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Cobrança Automática</CardTitle>
                <CardDescription>
                  Configure regras e templates para cobranças automáticas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cobrancasConfig.map((config, index) => (
                    <Card key={index} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{config.tipo}</h4>
                            <p className="text-sm text-gray-600">
                              Enviado {config.prazo} • Último: {config.ultimoEnvio}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Total enviado este mês: {config.total}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={config.status === 'ativo' ? 'default' : 'secondary'}>
                              {config.status === 'ativo' ? 'Ativo' : 'Manual'}
                            </Badge>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleConfigurarCobranca(config.tipo)}
                            >
                              Configurar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="historico" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Cobranças</CardTitle>
                <CardDescription>
                  Visualize o histórico completo de ações de cobrança
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Calendar className="h-4 w-4" />
                  <AlertDescription>
                    Histórico detalhado em desenvolvimento. Aqui serão exibidas todas as ações 
                    de cobrança realizadas, com timestamps e resultados.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default GestaoCobrancas;