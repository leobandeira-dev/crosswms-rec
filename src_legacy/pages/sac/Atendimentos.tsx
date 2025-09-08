
import React from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Search, Filter, ArrowUpDown } from 'lucide-react';

const Atendimentos: React.FC = () => {
  const mockAtendimentos = Array.from({ length: 10 }, (_, i) => ({
    id: `ATD-${2023001 + i}`,
    cliente: `Cliente Exemplo ${i + 1}`,
    assunto: ['Dúvida de entrega', 'Solicitação de informação', 'Consulta de status', 'Problema com produto'][i % 4],
    dataRegistro: new Date(2023, 7, 20 - i).toLocaleDateString('pt-BR'),
    status: ['Em análise', 'Concluído', 'Aguardando cliente', 'Novo'][i % 4],
    prioridade: ['Alta', 'Normal', 'Baixa'][i % 3],
  }));

  return (
    <MainLayout title="Atendimentos">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Gestão de Atendimentos</h2>
        <p className="text-gray-600">Monitore e gerencie todos os atendimentos ao cliente</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Filtros e Buscas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex w-full items-center space-x-2">
              <Input type="text" placeholder="Buscar atendimento..." />
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
                <span>Novo Atendimento</span>
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
                <TableHead>Assunto</TableHead>
                <TableHead className="w-[120px]">
                  <div className="flex items-center">
                    Data
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAtendimentos.map((atendimento) => (
                <TableRow key={atendimento.id}>
                  <TableCell className="font-medium">{atendimento.id}</TableCell>
                  <TableCell>{atendimento.cliente}</TableCell>
                  <TableCell>{atendimento.assunto}</TableCell>
                  <TableCell>{atendimento.dataRegistro}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      atendimento.status === 'Concluído' ? 'bg-green-100 text-green-800' : 
                      atendimento.status === 'Em análise' ? 'bg-blue-100 text-blue-800' :
                      atendimento.status === 'Novo' ? 'bg-purple-100 text-purple-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {atendimento.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      atendimento.prioridade === 'Alta' ? 'bg-red-100 text-red-800' : 
                      atendimento.prioridade === 'Normal' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {atendimento.prioridade}
                    </span>
                  </TableCell>
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

export default Atendimentos;
