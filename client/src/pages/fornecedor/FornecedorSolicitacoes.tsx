import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, CheckCircle, Package } from 'lucide-react';

const FornecedorSolicitacoes: React.FC = () => {
  const solicitacoes = [
    { 
      id: 1, 
      produto: 'Peças Automotivas Lote A', 
      quantidade: 500, 
      status: 'Aprovada', 
      dataColeta: '18/06/2025',
      transportador: 'TransLog Brasil'
    },
    { 
      id: 2, 
      produto: 'Componentes Eletrônicos', 
      quantidade: 200, 
      status: 'Pendente', 
      dataColeta: '20/06/2025',
      transportador: 'TransLog Brasil'
    },
    { 
      id: 3, 
      produto: 'Materiais de Construção', 
      quantidade: 1000, 
      status: 'Coletada', 
      dataColeta: '15/06/2025',
      transportador: 'TransLog Brasil'
    },
  ];

  return (
    <MainLayout title="Minhas Solicitações de Coleta">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Solicitações de Coleta</h2>
          <Button className="bg-[#0098DA] hover:bg-[#0077B5]">
            <Plus size={16} className="mr-2" />
            Nova Solicitação
          </Button>
        </div>

        <div className="grid gap-4">
          {solicitacoes.map((solicitacao) => (
            <Card key={solicitacao.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Solicitação #{solicitacao.id}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {solicitacao.status === 'Pendente' && <Clock className="h-4 w-4 text-yellow-500" />}
                  {solicitacao.status === 'Aprovada' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {solicitacao.status === 'Coletada' && <Package className="h-4 w-4 text-blue-500" />}
                  <span className={`text-sm font-medium ${
                    solicitacao.status === 'Pendente' ? 'text-yellow-600' :
                    solicitacao.status === 'Aprovada' ? 'text-green-600' :
                    'text-blue-600'
                  }`}>
                    {solicitacao.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">{solicitacao.produto}</p>
                  <p className="text-sm text-gray-600">Quantidade: {solicitacao.quantidade} unidades</p>
                  <p className="text-sm text-gray-600">Data da Coleta: {solicitacao.dataColeta}</p>
                  <p className="text-sm text-gray-600">Transportador: {solicitacao.transportador}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default FornecedorSolicitacoes;