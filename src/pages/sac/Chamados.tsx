
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Filter, Phone, MessageSquare, ArrowUpDown } from 'lucide-react';

const Chamados: React.FC = () => {
  const mockChamados = Array.from({ length: 10 }, (_, i) => ({
    id: `CH-${2023001 + i}`,
    cliente: `Cliente Exemplo ${i + 1}`,
    tipo: ['Suporte', 'Reclamação', 'Solicitação', 'Informação'][i % 4],
    canal: ['Telefone', 'Email', 'Chat', 'WhatsApp'][i % 4],
    dataRegistro: new Date(2023, 7, 20 - i).toLocaleDateString('pt-BR'),
    status: ['Em atendimento', 'Finalizado', 'Aguardando', 'Novo'][i % 4],
    responsavel: ['Ana Silva', 'João Souza', 'Maria Oliveira', 'Pedro Santos'][i % 4],
  }));

  return (
    <MainLayout title="Chamados">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Gestão de Chamados</h2>
        <p className="text-gray-600">Acompanhe e gerencie os chamados de clientes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <MessageSquare className="h-6 w-6 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Chamados Abertos</p>
                <h3 className="text-2xl font-bold">24</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Phone className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Atendimentos Hoje</p>
                <h3 className="text-2xl font-bold">12</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-amber-100 p-3 rounded-full mr-4">
                <MessageSquare className="h-6 w-6 text-amber-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tempo Médio</p>
                <h3 className="text-2xl font-bold">15 min</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <MessageSquare className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Satisfação</p>
                <h3 className="text-2xl font-bold">97%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Filtros e Buscas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex w-full items-center space-x-2">
              <Input type="text" placeholder="Buscar chamado..." />
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center">
              <Button variant="outline" className="w-full flex justify-between">
                <span>Filtros</span>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex justify-end">
              <Button className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>Novo Chamado</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Nº</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead className="w-[120px]">
                  <div className="flex items-center">
                    Data
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockChamados.map((chamado) => (
                <TableRow key={chamado.id}>
                  <TableCell className="font-medium">{chamado.id}</TableCell>
                  <TableCell>{chamado.cliente}</TableCell>
                  <TableCell>{chamado.tipo}</TableCell>
                  <TableCell>{chamado.canal}</TableCell>
                  <TableCell>{chamado.dataRegistro}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      chamado.status === 'Finalizado' ? 'bg-green-100 text-green-800' : 
                      chamado.status === 'Em atendimento' ? 'bg-blue-100 text-blue-800' :
                      chamado.status === 'Novo' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {chamado.status}
                    </span>
                  </TableCell>
                  <TableCell>{chamado.responsavel}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Visualizar</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </MainLayout>
  );
};

export default Chamados;
