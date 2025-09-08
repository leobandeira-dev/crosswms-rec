import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Clock, CheckCircle } from 'lucide-react';

const ClienteSolicitacoes: React.FC = () => {
  const solicitacoes = [
    { id: 1, tipo: 'Coleta', status: 'Agendada', data: '16/06/2025', endereco: 'Rua das Flores, 123' },
    { id: 2, tipo: 'Entrega', status: 'Em trânsito', data: '15/06/2025', endereco: 'Av. Principal, 456' },
    { id: 3, tipo: 'Coleta', status: 'Concluída', data: '14/06/2025', endereco: 'Rua Central, 789' },
  ];

  return (
    <MainLayout title="Minhas Solicitações">
      <div className="space-y-6">
        <div className="grid gap-4">
          {solicitacoes.map((solicitacao) => (
            <Card key={solicitacao.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {solicitacao.tipo} #{solicitacao.id}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {solicitacao.status === 'Agendada' && <Clock className="h-4 w-4 text-yellow-500" />}
                  {solicitacao.status === 'Em trânsito' && <Package className="h-4 w-4 text-blue-500" />}
                  {solicitacao.status === 'Concluída' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  <span className={`text-sm font-medium ${
                    solicitacao.status === 'Agendada' ? 'text-yellow-600' :
                    solicitacao.status === 'Em trânsito' ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {solicitacao.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Data: {solicitacao.data}</p>
                <p className="text-sm text-gray-600">Endereço: {solicitacao.endereco}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default ClienteSolicitacoes;