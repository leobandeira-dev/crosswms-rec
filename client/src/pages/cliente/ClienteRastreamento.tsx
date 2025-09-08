import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Clock, Package } from 'lucide-react';

const ClienteRastreamento: React.FC = () => {
  const [codigoRastreamento, setCodigoRastreamento] = React.useState('');

  const handleRastreamento = () => {
    // TODO: Implementar rastreamento
  };

  const rastreamentos = [
    { 
      codigo: 'CR001234', 
      status: 'Em trânsito', 
      localizacao: 'São Paulo - SP',
      ultimaAtualizacao: '15/06/2025 14:30'
    },
    { 
      codigo: 'CR001235', 
      status: 'Entregue', 
      localizacao: 'Rio de Janeiro - RJ',
      ultimaAtualizacao: '14/06/2025 16:45'
    },
  ];

  return (
    <MainLayout title="Rastreamento de Cargas">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Buscar Rastreamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="Digite o código de rastreamento"
                value={codigoRastreamento}
                onChange={(e) => setCodigoRastreamento(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleRastreamento} className="bg-[#0098DA] hover:bg-[#0077B5]">
                <Search size={16} className="mr-2" />
                Rastrear
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Rastreamentos Recentes</h3>
          {rastreamentos.map((item) => (
            <Card key={item.codigo}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-[#0098DA]" />
                      <span className="font-medium">{item.codigo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} />
                      <span>{item.localizacao}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>{item.ultimaAtualizacao}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    item.status === 'Entregue' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default ClienteRastreamento;