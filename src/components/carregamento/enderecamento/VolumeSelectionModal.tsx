import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Package, Search, Filter, CheckCircle, Camera, QrCode, Barcode } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';

interface Volume {
  id: string;
  codigo: string;
  notaFiscal: string;
  produto: string;
  peso: string;
  dimensoes: string;
  fragil: boolean;
  posicaoAtual?: string;
  descricao: string;
  posicionado: boolean;
  etiquetaMae: string;
  fornecedor: string;
  quantidade: number;
  etiquetado: boolean;
}

interface VolumeSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cellId: string;
  cellPosition: string;
  availableVolumes: Volume[];
  allocatedVolumes: Volume[];
  onAllocateVolumes: (volumeIds: string[], cellId: string) => void;
  onRemoveVolume: (volumeId: string, cellId: string) => void;
}

const VolumeSelectionModal: React.FC<VolumeSelectionModalProps> = ({
  isOpen,
  onClose,
  cellId,
  cellPosition,
  availableVolumes,
  allocatedVolumes,
  onAllocateVolumes,
  onRemoveVolume
}) => {
  const [searchType, setSearchType] = useState<'volume' | 'etiqueta' | 'nota'>('volume');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVolumes, setFilteredVolumes] = useState<Volume[]>([]);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [selectedVolumes, setSelectedVolumes] = useState<string[]>([]);
  const [volumesParaAlocar, setVolumesParaAlocar] = useState<Volume[]>([]);

  // Filtrar volumes disponíveis
  useEffect(() => {
    let filtered = availableVolumes.filter(volume => !volume.posicionado);
    
    if (searchTerm) {
      switch (searchType) {
        case 'volume':
          filtered = filtered.filter(v => 
            v.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.descricao.toLowerCase().includes(searchTerm.toLowerCase())
          );
          break;
        case 'etiqueta':
          filtered = filtered.filter(v => 
            v.etiquetaMae.toLowerCase().includes(searchTerm.toLowerCase())
          );
          break;
        case 'nota':
          filtered = filtered.filter(v => 
            v.notaFiscal.toLowerCase().includes(searchTerm.toLowerCase())
          );
          break;
      }
    }
    
    setFilteredVolumes(filtered);
  }, [availableVolumes, searchTerm, searchType]);

  // Resetar busca quando modal abre
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedVolumes([]);
      setVolumesParaAlocar([]);
    }
  }, [isOpen]);

  const handleVolumeToggle = (volumeId: string) => {
    const volume = availableVolumes.find(v => v.id === volumeId);
    if (volume) {
      // Adicionar à lista de volumes para alocar
      setVolumesParaAlocar(prev => {
        if (prev.find(v => v.id === volumeId)) {
          // Se já está na lista, remover
          return prev.filter(v => v.id !== volumeId);
        } else {
          // Se não está na lista, adicionar
          return [...prev, volume];
        }
      });
      
      // Atualizar seleção visual
      setSelectedVolumes(prev => 
        prev.includes(volumeId) 
          ? prev.filter(id => id !== volumeId)
          : [...prev, volumeId]
      );
    }
  };


  const handleRemoveAllocated = (volumeId: string) => {
    onRemoveVolume(volumeId, cellId);
  };

  const handleAlocarVolumes = () => {
    if (volumesParaAlocar.length > 0) {
      const volumeIds = volumesParaAlocar.map(v => v.id);
      onAllocateVolumes(volumeIds, cellId);
      setVolumesParaAlocar([]);
      setSelectedVolumes([]);
      onClose();
    }
  };

  const handleRemoverVolumeParaAlocar = (volumeId: string) => {
    setVolumesParaAlocar(prev => prev.filter(v => v.id !== volumeId));
    setSelectedVolumes(prev => prev.filter(id => id !== volumeId));
  };

  const handleScan = (code: string, type: 'qr' | 'barcode') => {
    console.log('Código escaneado:', code, 'Tipo:', type);
    setScannerOpen(false);
    
    if (type === 'qr') {
      // QR Code = Etiqueta Mãe - buscar e adicionar volume específico
      const volume = availableVolumes.find(v => 
        v.etiquetaMae === code && !v.posicionado
      );
      if (volume) {
        // Adicionar à lista de volumes para alocar
        setVolumesParaAlocar(prev => {
          if (!prev.find(v => v.id === volume.id)) {
            return [...prev, volume];
          }
          return prev;
        });
        setSelectedVolumes(prev => 
          prev.includes(volume.id) ? prev : [...prev, volume.id]
        );
      } else {
        setSearchTerm(code);
        setSearchType('etiqueta');
      }
    } else {
      // Código de barras = Nota Fiscal - buscar e adicionar todos os volumes da nota
      const volumesDaNota = availableVolumes.filter(v => 
        v.notaFiscal === code && !v.posicionado
      );
      if (volumesDaNota.length > 0) {
        // Adicionar todos os volumes da nota à lista
        setVolumesParaAlocar(prev => {
          const novosVolumes = volumesDaNota.filter(v => !prev.find(p => p.id === v.id));
          return [...prev, ...novosVolumes];
        });
        setSelectedVolumes(prev => {
          const novosIds = volumesDaNota.map(v => v.id).filter(id => !prev.includes(id));
          return [...prev, ...novosIds];
        });
      } else {
        setSearchTerm(code);
        setSearchType('nota');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Seleção de Volumes
            </h2>
            <p className="text-gray-600 mt-1">
              Posição: <span className="font-semibold">{cellPosition}</span>
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex h-[calc(95vh-200px)]">
          {/* Left Panel - Available Volumes */}
          <div className="w-1/2 border-r flex flex-col">
            {/* Search Section */}
            <div className="p-4 border-b bg-gray-50">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Tipo de Pesquisa</Label>
                  <div className="flex gap-2 mt-3">
                    <Button
                      variant={searchType === 'volume' ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => setSearchType('volume')}
                      className="flex-1 h-12 text-base"
                    >
                      Volume
                    </Button>
                    <Button
                      variant={searchType === 'etiqueta' ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => setSearchType('etiqueta')}
                      className="flex-1 h-12 text-base"
                    >
                      Etiqueta Mãe
                    </Button>
                    <Button
                      variant={searchType === 'nota' ? 'default' : 'outline'}
                      size="lg"
                      onClick={() => setSearchType('nota')}
                      className="flex-1 h-12 text-base"
                    >
                      Nota Fiscal
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder={`Pesquisar por ${searchType === 'volume' ? 'volume' : searchType === 'etiqueta' ? 'etiqueta' : 'nota fiscal'}`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  <Button variant="outline" size="lg" className="h-12 px-6">
                    <Search className="h-5 w-5" />
                  </Button>
                </div>

                {/* Scanner Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setScannerOpen(true)}
                    className="flex-1 h-12 text-base"
                  >
                    <QrCode className="mr-2 h-5 w-5" />
                    Escanear QR Code
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setScannerOpen(true)}
                    className="flex-1 h-12 text-base"
                  >
                    <Barcode className="mr-2 h-5 w-5" />
                    Escanear Código
                  </Button>
                </div>
              </div>
            </div>

            {/* Available Volumes List */}
            <div className="flex-1 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-3">
                  <Package className="h-6 w-6" />
                  Volumes Disponíveis
                </h3>
                <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg">
                  Clique no volume para alocar automaticamente
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {filteredVolumes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-lg">
                    Nenhum volume disponível
                  </div>
                ) : (
                  filteredVolumes.map((volume) => (
                    <Card 
                      key={volume.id} 
                      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        selectedVolumes.includes(volume.id) 
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-200' 
                          : 'hover:bg-gray-50 border-2 hover:border-blue-300'
                      }`}
                      onClick={() => handleVolumeToggle(volume.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          <Checkbox
                            checked={selectedVolumes.includes(volume.id)}
                            onCheckedChange={() => handleVolumeToggle(volume.id)}
                            className="h-5 w-5"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-lg text-gray-900 mb-2 flex items-center gap-2">
                            {volume.codigo}
                            {selectedVolumes.includes(volume.id) && (
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Selecionado
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-2">
                            <div className="flex items-center gap-4">
                              <span className="font-medium">Peso:</span>
                              <span>{volume.peso}</span>
                              <span className="font-medium">Dimensões:</span>
                              <span>{volume.dimensoes}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-medium">Etiqueta:</span>
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded">{volume.etiquetaMae}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-medium">NF:</span>
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded">{volume.notaFiscal}</span>
                              <span className="font-medium">Fornecedor:</span>
                              <span className="truncate">{volume.fornecedor}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>

              <div className="mt-4 text-lg font-medium text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200">
                💡 Dica: Use o scanner para alocação rápida por QR Code ou código de barras
              </div>
            </div>
          </div>

          {/* Right Panel - Volumes para Alocar */}
          <div className="w-1/2 flex flex-col">
            <div className="flex-1 p-4 flex flex-col">
              <h3 className="text-xl font-semibold flex items-center gap-3 mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                Volumes para Alocar
              </h3>

              <div className="flex-1 space-y-3 overflow-y-auto">
                {volumesParaAlocar.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 text-lg">
                    Nenhum volume selecionado para alocação
                  </div>
                ) : (
                  volumesParaAlocar.map((volume) => (
                    <Card key={volume.id} className="p-4 bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="font-bold text-lg text-gray-900 mb-2">{volume.codigo}</div>
                          <div className="text-sm text-gray-600 space-y-2">
                            <div className="flex items-center gap-4">
                              <span className="font-medium">Peso:</span>
                              <span>{volume.peso}</span>
                              <span className="font-medium">Dimensões:</span>
                              <span>{volume.dimensoes}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-medium">Etiqueta:</span>
                              <span className="font-mono bg-blue-100 px-2 py-1 rounded">{volume.etiquetaMae}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-medium">NF:</span>
                              <span className="font-mono bg-blue-100 px-2 py-1 rounded">{volume.notaFiscal}</span>
                              <span className="font-medium">Fornecedor:</span>
                              <span className="truncate">{volume.fornecedor}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={() => handleRemoverVolumeParaAlocar(volume.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-10 w-10 p-0"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 sticky bottom-0 z-10">
          <div className="text-lg font-medium text-gray-700">
            {volumesParaAlocar.length} volumes selecionados para alocação
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              size="lg"
              className="h-12 px-8 text-base"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAlocarVolumes}
              disabled={volumesParaAlocar.length === 0}
              size="lg"
              className="bg-cross-blue hover:bg-cross-blue/90 h-12 px-8 text-base font-semibold"
            >
              Alocar ({volumesParaAlocar.length})
            </Button>
          </div>
        </div>

        {/* Barcode Scanner */}
        <BarcodeScanner
          isOpen={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onScan={handleScan}
          scanType="both"
        />
      </div>
    </div>
  );
};

export default VolumeSelectionModal;
