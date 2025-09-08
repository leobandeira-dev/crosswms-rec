import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ArmazenagemNavbar from '@/components/layout/ArmazenagemNavbar';

import { 
  Target, 
  Package, 
  MapPin,
  Truck,
  ArrowLeft,
  Search,
  Grid3X3,
  Navigation,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLocation } from 'wouter';

const Enderecamento = () => {
  const [, setLocation] = useLocation();
  const [volumes, setVolumes] = useState([
    { 
      id: 1, 
      codigo: 'VOL001', 
      ordem: 'ORD-001', 
      posicao: '', 
      status: 'pendente',
      dimensoes: { altura: 1.2, largura: 0.8, comprimento: 1.0 },
      peso: 25.5
    },
    { 
      id: 2, 
      codigo: 'VOL002', 
      ordem: 'ORD-001', 
      posicao: 'A1-B2', 
      status: 'posicionado',
      dimensoes: { altura: 0.9, largura: 0.6, comprimento: 0.8 },
      peso: 18.2
    },
    { 
      id: 3, 
      codigo: 'VOL003', 
      ordem: 'ORD-002', 
      posicao: 'A2-C1', 
      status: 'posicionado',
      dimensoes: { altura: 1.5, largura: 1.0, comprimento: 1.2 },
      peso: 42.8
    }
  ]);

  const [veiculoSelecionado, setVeiculoSelecionado] = useState('');
  const [posicaoManual, setPosicaoManual] = useState('');

  const veiculos = [
    { id: 'VEI001', placa: 'ABC-1234', tipo: 'Carreta', capacidade: '25 tons' },
    { id: 'VEI002', placa: 'DEF-5678', tipo: 'Truck', capacidade: '12 tons' },
    { id: 'VEI003', placa: 'GHI-9012', tipo: 'Van', capacidade: '3.5 tons' }
  ];

  const handlePosicionamento = (volumeId, novaPosicao) => {
    setVolumes(volumes.map(v => 
      v.id === volumeId 
        ? { ...v, posicao: novaPosicao, status: 'posicionado' }
        : v
    ));
  };

  const calcularOcupacao = () => {
    const totalVolumes = volumes.length;
    const posicionados = volumes.filter(v => v.status === 'posicionado').length;
    return Math.round((posicionados / totalVolumes) * 100);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'posicionado': return 'bg-green-100 text-green-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const estatisticas = {
    total: volumes.length,
    posicionados: volumes.filter(v => v.status === 'posicionado').length,
    pendentes: volumes.filter(v => v.status === 'pendente').length,
    ocupacao: calcularOcupacao()
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ArmazenagemNavbar />
      
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setLocation('/armazenagem/conferencia')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center text-white text-xl font-bold">
                    3
                  </div>
                  Endereçamento
                </h1>
                <p className="text-gray-600 mt-1">Posicionamento dos volumes no veículo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Seleção de Veículo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Seleção de Veículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={veiculoSelecionado} onValueChange={setVeiculoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  {veiculos.map((veiculo) => (
                    <SelectItem key={veiculo.id} value={veiculo.id}>
                      {veiculo.placa} - {veiculo.tipo} ({veiculo.capacidade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {veiculoSelecionado && (
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                  <Truck className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium">
                      {veiculos.find(v => v.id === veiculoSelecionado)?.placa}
                    </p>
                    <p className="text-sm text-gray-600">
                      {veiculos.find(v => v.id === veiculoSelecionado)?.tipo} - {veiculos.find(v => v.id === veiculoSelecionado)?.capacidade}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Volumes</p>
                  <p className="text-2xl font-bold text-blue-600">{estatisticas.total}</p>
                </div>
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Posicionados</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.posicionados}</p>
                </div>
                <Target className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{estatisticas.pendentes}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ocupação</p>
                  <p className="text-2xl font-bold text-purple-600">{estatisticas.ocupacao}%</p>
                </div>
                <Grid3X3 className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mapa de Endereçamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              Mapa de Endereçamento do Veículo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {veiculoSelecionado ? (
              <div className="space-y-4">
                {/* Representação visual do veículo */}
                <div className="bg-gray-100 p-6 rounded-lg">
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    {/* Área de carga simulada */}
                    {Array.from({ length: 24 }, (_, i) => {
                      const posicao = `${String.fromCharCode(65 + Math.floor(i / 8))}${(i % 8) + 1}`;
                      const volumeNaPosicao = volumes.find(v => v.posicao === posicao);
                      
                      return (
                        <div
                          key={i}
                          className={`h-12 border-2 border-dashed rounded flex items-center justify-center text-xs font-medium cursor-pointer transition-colors ${
                            volumeNaPosicao 
                              ? 'bg-blue-500 text-white border-blue-600' 
                              : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                          onClick={() => {
                            if (!volumeNaPosicao && posicaoManual) {
                              // Lógica para posicionar volume
                              console.log(`Posicionando volume na posição ${posicao}`);
                            }
                          }}
                        >
                          {volumeNaPosicao ? volumeNaPosicao.codigo : posicao}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded"></div>
                      <span>Ocupado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-white border-2 border-dashed border-gray-300 rounded"></div>
                      <span>Disponível</span>
                    </div>
                  </div>
                </div>
                
                {/* Posicionamento manual */}
                <div className="flex gap-4">
                  <Input
                    placeholder="Digite a posição (ex: A1-B2)"
                    value={posicaoManual}
                    onChange={(e) => setPosicaoManual(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="flex items-center gap-2">
                    <Navigation className="w-4 h-4" />
                    Posicionar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Selecione um veículo para visualizar o mapa de endereçamento</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Volumes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Volumes para Endereçamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {volumes.map((volume) => (
                <div key={volume.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{volume.codigo}</h3>
                        <p className="text-sm text-gray-600">Ordem: {volume.ordem}</p>
                        <p className="text-xs text-gray-500">
                          {volume.dimensoes.altura}m × {volume.dimensoes.largura}m × {volume.dimensoes.comprimento}m | {volume.peso}kg
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Posição</p>
                        <p className="font-medium">
                          {volume.posicao || '-'}
                        </p>
                      </div>
                      
                      <Badge className={getStatusColor(volume.status)}>
                        {volume.status === 'posicionado' ? 'Posicionado' : 'Pendente'}
                      </Badge>
                      
                      <div className="flex gap-2">
                        {volume.status === 'pendente' && (
                          <Button 
                            size="sm" 
                            onClick={() => handlePosicionamento(volume.id, 'A1-B1')}
                            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-1"
                          >
                            <Target className="w-4 h-4" />
                            Auto Posicionar
                          </Button>
                        )}
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          <MapPin className="w-4 h-4" />
                          Manual
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ações do Footer */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Progresso: {estatisticas.posicionados} de {estatisticas.total} volumes posicionados ({estatisticas.ocupacao}% de ocupação)
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setLocation('/armazenagem/checklist')}
                disabled={estatisticas.pendentes > 0}
                className="flex items-center gap-2"
              >
                Próxima Etapa: Checklist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Enderecamento;