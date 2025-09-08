
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, CheckCircle, Package, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useOrdemCarregamento } from '@/hooks/carregamento';
import { OrdemCarregamento } from '@/hooks/carregamento/types';
import { ItemConferencia } from '@/components/carregamento/types/conferencia.types';
import VolumesTable from '@/components/carregamento/VolumesTable';
import BarcodeScannerSection from '@/components/carregamento/BarcodeScannerSection';
import { useEnderecamentoReal } from '@/hooks/carregamento/useEnderecamentoReal';

const ConferenciaCarga: React.FC = () => {
  const [numeroOC, setNumeroOC] = useState('');
  const [ordemSelecionada, setOrdemSelecionada] = useState<OrdemCarregamento | null>(null);
  const [volumes, setVolumes] = useState<ItemConferencia[]>([]);
  const [codigoVolume, setCodigoVolume] = useState('');
  const [codigoNF, setCodigoNF] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { buscarOrdemPorNumero } = useOrdemCarregamento();
  const { buscarVolumesParaEnderecamento, atualizarStatusVolume } = useEnderecamentoReal();

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
        await carregarVolumesOrdem(ordem.id);
        
        toast({
          title: "Ordem de Carregamento encontrada",
          description: `OC ${numeroOC} carregada para conferência.`,
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

  const carregarVolumesOrdem = async (numeroOrdem: string) => {
    try {
      const volumesEncontrados = await buscarVolumesParaEnderecamento(numeroOrdem);
      
      // Converter volumes para formato de ItemConferencia
      const volumesConferencia: ItemConferencia[] = volumesEncontrados.map(volume => ({
        id: volume.id,
        produto: volume.produto,
        quantidade: 1,
        verificado: volume.posicaoAtual !== undefined,
        etiquetaMae: volume.codigo,
        notaFiscal: volume.notaFiscal
      }));

      setVolumes(volumesConferencia);
      
      toast({
        title: "Volumes carregados",
        description: `${volumesConferencia.length} volumes encontrados para conferência.`,
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

  const handleVerificarVolume = async (volumeId: string) => {
    setVolumes(prevVolumes =>
      prevVolumes.map(volume =>
        volume.id === volumeId
          ? { ...volume, verificado: true }
          : volume
      )
    );

    // Atualizar status no banco de dados
    await atualizarStatusVolume(volumeId, 'verificado');

    toast({
      title: "Volume verificado",
      description: `Volume ${volumeId} foi marcado como verificado.`,
    });
  };

  const handleRemoverVolume = (volumeId: string) => {
    setVolumes(prevVolumes =>
      prevVolumes.filter(volume => volume.id !== volumeId)
    );

    toast({
      title: "Volume removido",
      description: `Volume ${volumeId} foi removido da conferência.`,
    });
  };

  const handleScanVolume = (codigo: string) => {
    const volume = volumes.find(v => v.id === codigo || v.etiquetaMae === codigo);
    if (volume) {
      handleVerificarVolume(volume.id);
      setCodigoVolume('');
    } else {
      toast({
        title: "Volume não encontrado",
        description: `Volume com código ${codigo} não encontrado nesta ordem.`,
        variant: "destructive",
      });
    }
  };

  const handleScanNF = (codigo: string) => {
    const volumesNF = volumes.filter(v => v.notaFiscal === codigo);
    if (volumesNF.length > 0) {
      volumesNF.forEach(volume => {
        if (!volume.verificado) {
          handleVerificarVolume(volume.id);
        }
      });
      setCodigoNF('');
      toast({
        title: "Volumes da NF verificados",
        description: `${volumesNF.length} volumes da NF ${codigo} foram verificados.`,
      });
    } else {
      toast({
        title: "Nota Fiscal não encontrada",
        description: `Nenhum volume encontrado para a NF ${codigo}.`,
        variant: "destructive",
      });
    }
  };

  const volumesNaoVerificados = volumes.filter(v => !v.verificado);
  const volumesVerificados = volumes.filter(v => v.verificado);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <CheckCircle className="mr-2 text-cross-blue" size={24} />
            Conferência de Carga
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
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">Verificados</p>
                      <p className="text-2xl font-bold">{volumesVerificados.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium">Pendentes</p>
                      <p className="text-2xl font-bold">{volumesNaoVerificados.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {ordemSelecionada && (
        <>
          <BarcodeScannerSection
            codigoVolume={codigoVolume}
            setCodigoVolume={setCodigoVolume}
            codigoNF={codigoNF}
            setCodigoNF={setCodigoNF}
            onScanVolume={handleScanVolume}
            onScanNF={handleScanNF}
            ordemSelecionada={ordemSelecionada}
          />

          <VolumesTable
            ordemSelecionada={ordemSelecionada}
            itens={volumes}
            handleVerificarItem={handleVerificarVolume}
            handleRemoverItem={handleRemoverVolume}
            tipoVisualizacao="conferir"
          />
        </>
      )}
    </div>
  );
};

export default ConferenciaCarga;
