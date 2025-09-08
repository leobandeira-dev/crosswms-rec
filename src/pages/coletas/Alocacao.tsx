import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Truck, 
  User, 
  MapPin, 
  Clock,
  Package,
  Search,
  CheckCircle,
  AlertCircle,
  Calendar,
  Route,
  Fuel,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ColetaAlocacao {
  id: string;
  numeroNota: string;
  cliente: string;
  endereco: string;
  volumes: number;
  pesoTotal: number;
  prazoColeta: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'aprovada' | 'alocada' | 'em_rota';
  observacoes?: string;
}

interface Veiculo {
  id: string;
  placa: string;
  modelo: string;
  capacidadePeso: number;
  capacidadeVolume: number;
  status: 'disponivel' | 'ocupado' | 'manutencao';
  localizacao: string;
}

interface Motorista {
  id: string;
  nome: string;
  documento: string;
  telefone: string;
  status: 'disponivel' | 'ocupado' | 'folga';
  experiencia: number;
}

const Alocacao: React.FC = () => {
  const { toast } = useToast();
  const [filtro, setFiltro] = useState('');
  const [veiculoSelecionado, setVeiculoSelecionado] = useState<string>('');
  const [motoristaSelecionado, setMotoristaSelecionado] = useState<string>('');

  const coletas: ColetaAlocacao[] = [
    {
      id: '1',
      numeroNota: '417536',
      cliente: 'CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA',
      endereco: 'JOINVILLE/SC',
      volumes: 2,
      pesoTotal: 16.2,
      prazoColeta: '2025-06-17T14:00:00',
      prioridade: 'alta',
      status: 'aprovada'
    },
    {
      id: '2',
      numeroNota: '415201',
      cliente: 'METALURGICA DEL REY LTDA',
      endereco: 'SAO LUIS/MA',
      volumes: 5,
      pesoTotal: 45.8,
      prazoColeta: '2025-06-17T16:00:00',
      prioridade: 'media',
      status: 'aprovada'
    }
  ];

  const veiculos: Veiculo[] = [
    {
      id: '1',
      placa: 'ABC-1234',
      modelo: 'Mercedes Sprinter',
      capacidadePeso: 3500,
      capacidadeVolume: 15,
      status: 'disponivel',
      localizacao: 'Base Principal'
    },
    {
      id: '2',
      placa: 'DEF-5678',
      modelo: 'Iveco Daily',
      capacidadePeso: 2800,
      capacidadeVolume: 12,
      status: 'disponivel',
      localizacao: 'Base Secundária'
    },
    {
      id: '3',
      placa: 'GHI-9012',
      modelo: 'Ford Cargo',
      capacidadePeso: 8000,
      capacidadeVolume: 35,
      status: 'ocupado',
      localizacao: 'Em Rota'
    }
  ];

  const motoristas: Motorista[] = [
    {
      id: '1',
      nome: 'João Silva',
      documento: '123.456.789-00',
      telefone: '(47) 99999-1234',
      status: 'disponivel',
      experiencia: 5
    },
    {
      id: '2',
      nome: 'Maria Santos',
      documento: '987.654.321-00',
      telefone: '(47) 99999-5678',
      status: 'disponivel',
      experiencia: 8
    },
    {
      id: '3',
      nome: 'Carlos Oliveira',
      documento: '456.789.123-00',
      telefone: '(47) 99999-9012',
      status: 'ocupado',
      experiencia: 12
    }
  ];

  const handleAlocarRecursos = (coletaId: string) => {
    if (!veiculoSelecionado || !motoristaSelecionado) {
      toast({
        title: "Seleção Incompleta",
        description: "Selecione um veículo e um motorista para continuar.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Recursos Alocados",
      description: "Veículo e motorista foram alocados com sucesso. Coleta pronta para execução.",
      variant: "default"
    });

    // Reset selections
    setVeiculoSelecionado('');
    setMotoristaSelecionado('');
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case 'urgente':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Urgente</Badge>;
      case 'alta':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300">Alta</Badge>;
      case 'media':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Média</Badge>;
      case 'baixa':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Baixa</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponivel':
        return <Badge className="bg-green-100 text-green-800">Disponível</Badge>;
      case 'ocupado':
        return <Badge className="bg-red-100 text-red-800">Ocupado</Badge>;
      case 'manutencao':
        return <Badge className="bg-yellow-100 text-yellow-800">Manutenção</Badge>;
      case 'folga':
        return <Badge className="bg-blue-100 text-blue-800">Folga</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const veiculosDisponiveis = veiculos.filter(v => v.status === 'disponivel');
  const motoristasDisponiveis = motoristas.filter(m => m.status === 'disponivel');

  return (
    <MainLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-heading mb-2">Alocação de Recursos</h1>
          <p className="text-gray-600">
            Designação de veículos e motoristas para as coletas aprovadas
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-gray-600">Aguardando Alocação</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-600">Veículos Disponíveis</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Motoristas Livres</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">98%</div>
              <div className="text-sm text-gray-600">Taxa Ocupação</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coletas para Alocação */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Coletas Aprovadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {coletas.map((coleta) => (
                    <Card key={coleta.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold">NF {coleta.numeroNota}</h4>
                            <p className="text-sm text-gray-600">{coleta.cliente}</p>
                          </div>
                          {getPrioridadeBadge(coleta.prioridade)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span>{coleta.endereco}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{formatDate(coleta.prazoColeta)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span>{coleta.volumes} volumes</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-gray-400" />
                            <span>{coleta.pesoTotal} kg</span>
                          </div>
                        </div>

                        {coleta.status === 'aprovada' && (
                          <div className="pt-3 border-t">
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <Select value={veiculoSelecionado} onValueChange={setVeiculoSelecionado}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar Veículo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {veiculosDisponiveis.map((veiculo) => (
                                    <SelectItem key={veiculo.id} value={veiculo.id}>
                                      {veiculo.placa} - {veiculo.modelo}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select value={motoristaSelecionado} onValueChange={setMotoristaSelecionado}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar Motorista" />
                                </SelectTrigger>
                                <SelectContent>
                                  {motoristasDisponiveis.map((motorista) => (
                                    <SelectItem key={motorista.id} value={motorista.id}>
                                      {motorista.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <Button 
                              onClick={() => handleAlocarRecursos(coleta.id)}
                              className="w-full"
                              disabled={!veiculoSelecionado || !motoristaSelecionado}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Alocar Recursos
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recursos Disponíveis */}
          <div className="space-y-6">
            {/* Veículos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Frota Disponível ({veiculosDisponiveis.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {veiculosDisponiveis.map((veiculo) => (
                    <div key={veiculo.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{veiculo.placa}</div>
                        {getStatusBadge(veiculo.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>{veiculo.modelo}</div>
                        <div className="flex gap-4 mt-1">
                          <span>{veiculo.capacidadePeso}kg</span>
                          <span>{veiculo.capacidadeVolume}m³</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />
                          {veiculo.localizacao}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Motoristas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Motoristas Livres ({motoristasDisponiveis.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {motoristasDisponiveis.map((motorista) => (
                    <div key={motorista.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{motorista.nome}</div>
                        {getStatusBadge(motorista.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>{motorista.documento}</div>
                        <div>{motorista.telefone}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {motorista.experiencia} anos exp.
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Alocacao;