import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ArmazenagemNavbar from '@/components/layout/ArmazenagemNavbar';

import { 
  CheckCircle, 
  AlertTriangle, 
  Package, 
  Barcode,
  Camera,
  FileText,
  ArrowLeft,
  Search,
  Plus,
  X,
  Eye
} from 'lucide-react';
import { useLocation } from 'wouter';

const Conferencia = () => {
  const [, setLocation] = useLocation();
  const [volumes, setVolumes] = useState([
    { id: 1, codigo: 'VOL001', ordem: 'ORD-001', status: 'pendente', observacoes: '' },
    { id: 2, codigo: 'VOL002', ordem: 'ORD-001', status: 'conferido', observacoes: 'Volume OK' },
    { id: 3, codigo: 'VOL003', ordem: 'ORD-002', status: 'divergencia', observacoes: 'Avaria na embalagem' }
  ]);

  const [codigoBarras, setCodigoBarras] = useState('');
  const [volumeSelecionado, setVolumeSelecionado] = useState(null);

  const handleConferencia = (volumeId, novoStatus, observacoes) => {
    setVolumes(volumes.map(v => 
      v.id === volumeId 
        ? { ...v, status: novoStatus, observacoes }
        : v
    ));
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'conferido': return 'bg-green-100 text-green-800';
      case 'divergencia': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const estatisticas = {
    total: volumes.length,
    conferidos: volumes.filter(v => v.status === 'conferido').length,
    pendentes: volumes.filter(v => v.status === 'pendente').length,
    divergencias: volumes.filter(v => v.status === 'divergencia').length
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
                onClick={() => setLocation('/armazenagem')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xl font-bold">
                    2
                  </div>
                  Conferência
                </h1>
                <p className="text-gray-600 mt-1">Verificação e validação dos volumes</p>
              </div>
            </div>
          </div>
        </div>

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
                  <p className="text-sm text-gray-600">Conferidos</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.conferidos}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
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
                <Package className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Divergências</p>
                  <p className="text-2xl font-bold text-red-600">{estatisticas.divergencias}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scanner de Código de Barras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Barcode className="w-5 h-5" />
              Scanner de Código de Barras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Digite ou escaneie o código de barras do volume"
                  value={codigoBarras}
                  onChange={(e) => setCodigoBarras(e.target.value)}
                  className="text-lg"
                />
              </div>
              <Button className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Buscar
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Câmera
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Volumes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Volumes para Conferência
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
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(volume.status)}>
                        {volume.status === 'conferido' ? 'Conferido' :
                         volume.status === 'divergencia' ? 'Divergência' : 'Pendente'}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setVolumeSelecionado(volume)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Detalhes
                        </Button>
                        
                        {volume.status === 'pendente' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => handleConferencia(volume.id, 'conferido', 'Volume conferido com sucesso')}
                              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Aprovar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleConferencia(volume.id, 'divergencia', 'Divergência encontrada')}
                              className="flex items-center gap-1"
                            >
                              <X className="w-4 h-4" />
                              Reprovar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {volume.observacoes && (
                    <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                      <strong>Observações:</strong> {volume.observacoes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal de Detalhes do Volume */}
        {volumeSelecionado && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl m-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Detalhes do Volume - {volumeSelecionado.codigo}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setVolumeSelecionado(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Código do Volume</label>
                    <p className="text-lg font-semibold">{volumeSelecionado.codigo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ordem</label>
                    <p className="text-lg">{volumeSelecionado.ordem}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status Atual</label>
                    <Badge className={getStatusColor(volumeSelecionado.status)}>
                      {volumeSelecionado.status === 'conferido' ? 'Conferido' :
                       volumeSelecionado.status === 'divergencia' ? 'Divergência' : 'Pendente'}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Observações</label>
                  <Textarea
                    value={volumeSelecionado.observacoes}
                    onChange={(e) => setVolumeSelecionado({
                      ...volumeSelecionado,
                      observacoes: e.target.value
                    })}
                    placeholder="Adicione observações sobre este volume..."
                    className="mt-1"
                  />
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setVolumeSelecionado(null)}
                  >
                    Cancelar
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        handleConferencia(volumeSelecionado.id, 'conferido', volumeSelecionado.observacoes);
                        setVolumeSelecionado(null);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar Volume
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleConferencia(volumeSelecionado.id, 'divergencia', volumeSelecionado.observacoes);
                        setVolumeSelecionado(null);
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reportar Divergência
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Ações do Footer */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Progresso: {estatisticas.conferidos} de {estatisticas.total} volumes conferidos
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                onClick={() => setLocation('/armazenagem/enderecamento')}
                disabled={estatisticas.pendentes > 0}
                className="flex items-center gap-2"
              >
                Próxima Etapa: Endereçamento
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conferencia;