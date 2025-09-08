
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, MapPin, Package, Truck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useOrdemCarregamento } from '@/hooks/carregamento';
import { OrdemCarregamento } from '@/hooks/carregamento/types';
import { useEnderecamentoReal } from '@/hooks/carregamento/useEnderecamentoReal';
import TruckLayoutGrid from '@/components/carregamento/enderecamento/TruckLayoutGrid';
import VolumeList from '@/components/carregamento/enderecamento/VolumeList';
import InstructionsCard from '@/components/carregamento/enderecamento/InstructionsCard';

// Interface local para volumes de endereçamento
interface VolumeEnderecamento {
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

const Enderecamento: React.FC = () => {
  const [numeroOC, setNumeroOC] = useState('');
  const [ordemSelecionada, setOrdemSelecionada] = useState<OrdemCarregamento | null>(null);
  const [volumes, setVolumes] = useState<VolumeEnderecamento[]>([]);
  const [volumesSelecionados, setVolumesSelecionados] = useState<string[]>([]);
  const [posicaoSelecionada, setPosicaoSelecionada] = useState<string | null>(null);
  const [filtroVolume, setFiltroVolume] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { buscarOrdemPorNumero } = useOrdemCarregamento();
  const { 
    buscarVolumesParaEnderecamento, 
    buscarPosicoesDisponiveis, 
    endercarVolume 
  } = useEnderecamentoReal();

  const buscarOrdemCarregamento = async () => {
    if (!numeroOC.trim()) {
      toast({
        title: "Número da OC é obrigatório",
        description: "Por favor, informe o número da Ordem de Carregamento.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const ordem = await buscarOrdemPorNumero(numeroOC);
      
      if (ordem) {
        setOrdemSelecionada(ordem);
        await carregarVolumesParaEnderecamento(ordem.id);
        
        toast({
          title: "Ordem carregada",
          description: `OC ${numeroOC} carregada para endereçamento.`,
        });
      } else {
        setOrdemSelecionada(null);
        setVolumes([]);
        toast({
          title: "Ordem não encontrada",
          description: `Nenhuma OC encontrada com o número ${numeroOC}.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar ordem:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar a Ordem de Carregamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const carregarVolumesParaEnderecamento = async (numeroOrdem: string) => {
    try {
      const volumesEncontrados = await buscarVolumesParaEnderecamento(numeroOrdem);
      
      // Converter volumes para o formato esperado pelo componente
      const volumesFormatados: VolumeEnderecamento[] = volumesEncontrados.map(volume => ({
        id: volume.id,
        codigo: volume.codigo,
        notaFiscal: volume.notaFiscal,
        produto: volume.produto,
        peso: volume.peso.toString(),
        dimensoes: volume.dimensoes,
        fragil: volume.fragil,
        posicaoAtual: volume.posicaoAtual,
        descricao: volume.produto,
        posicionado: !!volume.posicaoAtual,
        etiquetaMae: volume.codigo,
        fornecedor: 'Fornecedor padrão',
        quantidade: 1,
        etiquetado: true
      }));

      setVolumes(volumesFormatados);
      
      toast({
        title: "Volumes carregados",
        description: `${volumesFormatados.length} volumes disponíveis para endereçamento.`,
      });
    } catch (error) {
      console.error('Erro ao carregar volumes:', error);
      toast({
        title: "Erro ao carregar volumes",
        description: "Ocorreu um erro ao buscar os volumes da ordem.",
        variant: "destructive",
      });
    }
  };

  const handleSelecionarVolume = (volumeId: string) => {
    setVolumesSelecionados(prev => {
      if (prev.includes(volumeId)) {
        return prev.filter(id => id !== volumeId);
      } else {
        return [...prev, volumeId];
      }
    });
    setPosicaoSelecionada(null);
  };

  const handleSelecionarTodos = () => {
    const volumesNaoPosicionados = volumes.filter(v => !v.posicaoAtual);
    if (volumesSelecionados.length === volumesNaoPosicionados.length) {
      setVolumesSelecionados([]);
    } else {
      setVolumesSelecionados(volumesNaoPosicionados.map(v => v.id));
    }
  };

  const handleSelecionarPosicao = (posicao: string) => {
    setPosicaoSelecionada(posicao);
  };

  const handleConfirmarEnderecamento = async () => {
    if (volumesSelecionados.length === 0 || !posicaoSelecionada || !ordemSelecionada) {
      toast({
        title: "Seleção incompleta",
        description: "Selecione pelo menos um volume e uma posição para confirmar o endereçamento.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Endereçar apenas o primeiro volume selecionado por vez
      const volumeId = volumesSelecionados[0];
      const sucesso = await endercarVolume(volumeId, posicaoSelecionada, ordemSelecionada.id);
      
      if (sucesso) {
        // Atualizar o volume com a nova posição
        setVolumes(prevVolumes =>
          prevVolumes.map(volume =>
            volume.id === volumeId
              ? { ...volume, posicaoAtual: posicaoSelecionada, posicionado: true }
              : volume
          )
        );

        // Remover volume da seleção
        setVolumesSelecionados(prev => prev.filter(id => id !== volumeId));
        setPosicaoSelecionada(null);
      }
    } catch (error) {
      console.error('Erro ao endereçar volume:', error);
      toast({
        title: "Erro no endereçamento",
        description: "Ocorreu um erro ao endereçar o volume.",
        variant: "destructive",
      });
    }
  };

  const volumesFiltrados = volumes.filter(volume =>
    volume.codigo.toLowerCase().includes(filtroVolume.toLowerCase()) ||
    volume.notaFiscal.toLowerCase().includes(filtroVolume.toLowerCase()) ||
    volume.produto.toLowerCase().includes(filtroVolume.toLowerCase())
  );

  const volumesEndereçados = volumes.filter(v => v.posicaoAtual);
  const volumesPendentes = volumes.filter(v => !v.posicaoAtual);

  // Criar layout de células para o TruckLayoutGrid
  const layoutCelulas = Array.from({ length: 20 }, (_, i) => {
    const linha = i + 1;
    return ['esquerda', 'centro', 'direita'].map(coluna => ({
      id: `${coluna}-${linha}`,
      coluna: coluna as 'esquerda' | 'centro' | 'direita',
      linha,
      volumes: volumes.filter(v => v.posicaoAtual === `${coluna.charAt(0).toUpperCase()}${linha}`)
    }));
  }).flat();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <MapPin className="mr-2 text-cross-blue" size={24} />
            Endereçamento de Carregamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="numeroOC">Número da OC</Label>
              <Input
                id="numeroOC"
                placeholder="Digite o número da Ordem de Carregamento"
                value={numeroOC}
                onChange={(e) => setNumeroOC(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && buscarOrdemCarregamento()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={buscarOrdemCarregamento}
                disabled={isLoading}
                className="bg-cross-blue hover:bg-cross-blue/90"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Buscando...' : 'Buscar Ordem'}
              </Button>
            </div>
          </div>

          {ordemSelecionada && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">Total de Volumes</p>
                      <p className="text-2xl font-bold">{volumes.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Endereçados</p>
                      <p className="text-2xl font-bold">{volumesEndereçados.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Pendentes</p>
                      <p className="text-2xl font-bold">{volumesPendentes.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {ordemSelecionada && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Volumes Disponíveis</span>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Filtrar volumes..."
                      value={filtroVolume}
                      onChange={(e) => setFiltroVolume(e.target.value)}
                      className="w-48"
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VolumeList
                  volumes={volumesFiltrados}
                  selecionados={volumesSelecionados}
                  onSelectionToggle={handleSelecionarVolume}
                  onSelectAll={handleSelecionarTodos}
                />
              </CardContent>
            </Card>

            <InstructionsCard />
          </div>

          <div className="space-y-6">
            <TruckLayoutGrid
              orderNumber={ordemSelecionada.id}
              layout={layoutCelulas}
              totalVolumes={volumes.length}
              positionedVolumes={volumesEndereçados.length}
              onCellClick={handleSelecionarPosicao}
              onRemoveVolume={(volumeId: string) => {
                setVolumes(prev => prev.map(v => 
                  v.id === volumeId ? { ...v, posicaoAtual: undefined, posicionado: false } : v
                ));
              }}
              hasSelectedVolumes={volumesSelecionados.length > 0}
              onSaveLayout={() => {}}
              allVolumesPositioned={volumesPendentes.length === 0}
              onPrintLayout={() => {}}
            />

            {volumesSelecionados.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Volumes Selecionados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-3 border rounded-lg bg-blue-50">
                    <p className="text-sm font-medium">
                      {volumesSelecionados.length} volume(s) selecionado(s)
                    </p>
                    {volumesSelecionados.map(volumeId => {
                      const volume = volumes.find(v => v.id === volumeId);
                      return volume ? (
                        <div key={volumeId} className="mt-2">
                          <p className="text-sm">{volume.codigo} - {volume.produto}</p>
                          <p className="text-xs text-gray-600">
                            Peso: {volume.peso}kg | {volume.dimensoes}
                            {volume.fragil && " | FRÁGIL"}
                          </p>
                        </div>
                      ) : null;
                    })}
                    {posicaoSelecionada && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Posição selecionada: {posicaoSelecionada}</p>
                        <Button
                          onClick={handleConfirmarEnderecamento}
                          className="mt-2 bg-cross-blue hover:bg-cross-blue/90"
                        >
                          Confirmar Endereçamento
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Enderecamento;
