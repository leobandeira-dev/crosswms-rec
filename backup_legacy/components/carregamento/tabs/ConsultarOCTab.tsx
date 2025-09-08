import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Eye, FileText, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useOrdemCarregamento } from '@/hooks/carregamento';
import DataTable from '@/components/common/DataTable';
import { OrdemCarregamento, NotaFiscal } from '@/hooks/carregamento/types';
import ImportarNotasDialog from '../ImportarNotasDialog';

const ConsultarOCTab: React.FC = () => {
  const [numeroOC, setNumeroOC] = useState('');
  const [ordemEncontrada, setOrdemEncontrada] = useState<OrdemCarregamento | null>(null);
  const [notasFiscaisVinculadas, setNotasFiscaisVinculadas] = useState<NotaFiscal[]>([]);
  const [volumesVinculados, setVolumesVinculados] = useState<any[]>([]);
  const [showNotasDialog, setShowNotasDialog] = useState(false);
  const [showVolumesDialog, setShowVolumesDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { 
    ordensCarregamento, 
    fetchOrdensCarregamento, 
    buscarOrdemPorNumero,
    buscarNotasFiscaisVinculadas,
    buscarVolumesVinculados
  } = useOrdemCarregamento();

  const handleBuscarOC = async () => {
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
        setOrdemEncontrada(ordem);
        
        // Buscar notas fiscais vinculadas
        const notas = await buscarNotasFiscaisVinculadas(numeroOC);
        setNotasFiscaisVinculadas(notas);
        
        // Buscar volumes vinculados
        const volumes = await buscarVolumesVinculados(numeroOC);
        setVolumesVinculados(volumes);
        
        toast({
          title: "Ordem de Carregamento encontrada",
          description: `OC ${numeroOC} localizada com ${notas.length} notas fiscais e ${volumes.length} volumes.`,
        });
      } else {
        setOrdemEncontrada(null);
        setNotasFiscaisVinculadas([]);
        setVolumesVinculados([]);
        toast({
          title: "Ordem não encontrada",
          description: `Nenhuma OC encontrada com o número ${numeroOC}.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar OC:', error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar a Ordem de Carregamento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVisualizarNotas = () => {
    if (!ordemEncontrada) return;
    setShowNotasDialog(true);
  };

  const handleVisualizarVolumes = () => {
    if (!ordemEncontrada) return;
    setShowVolumesDialog(true);
  };

  const ordensColumns = [
    {
      id: 'id',
      header: 'Número OC',
      accessor: 'id',
    },
    {
      id: 'cliente',
      header: 'Cliente',
      accessor: 'cliente',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      cell: ({ row }: any) => {
        const status = row.status || row.original?.status;
        const statusMap = {
          'pending': 'Pendente',
          'processing': 'Em Andamento',
          'completed': 'Concluída'
        };
        return statusMap[status as keyof typeof statusMap] || status;
      }
    },
    {
      id: 'dataCarregamento',
      header: 'Data Carregamento',
      accessor: 'dataCarregamento',
    },
    {
      id: 'acoes',
      header: 'Ações',
      accessor: 'acoes',
      cell: ({ row }: any) => {
        const ordem = row.original || row;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              setOrdemEncontrada(ordem);
              const notas = await buscarNotasFiscaisVinculadas(ordem.id);
              setNotasFiscaisVinculadas(notas);
              const volumes = await buscarVolumesVinculados(ordem.id);
              setVolumesVinculados(volumes);
              handleVisualizarNotas();
            }}
            className="flex items-center"
          >
            <Eye className="h-4 w-4 mr-1" />
            Visualizar
          </Button>
        );
      }
    }
  ];

  const notasColumns = [
    {
      id: 'numero',
      header: 'Número NF',
      accessor: 'numero',
    },
    {
      id: 'remetente',
      header: 'Remetente',
      accessor: 'remetente',
    },
    {
      id: 'cliente',
      header: 'Cliente',
      accessor: 'cliente',
    },
    {
      id: 'valor',
      header: 'Valor',
      accessor: 'valor',
      cell: ({ row }: any) => {
        const valor = row.valor || row.original?.valor;
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(valor);
      }
    },
    {
      id: 'pesoBruto',
      header: 'Peso (kg)',
      accessor: 'pesoBruto',
    },
  ];

  const volumesColumns = [
    {
      id: 'codigo',
      header: 'Código Volume',
      accessor: 'codigo',
    },
    {
      id: 'descricao',
      header: 'Descrição',
      accessor: 'descricao',
    },
    {
      id: 'peso',
      header: 'Peso (kg)',
      accessor: 'peso',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
    },
    {
      id: 'nota_fiscal',
      header: 'Nota Fiscal',
      accessor: 'nota_fiscal',
      cell: ({ row }: any) => {
        const volume = row.original || row;
        return volume.nota_fiscal?.numero || 'N/A';
      }
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Search className="mr-2 text-cross-blue" size={20} />
            Buscar Ordem de Carregamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numeroOC">Número da OC</Label>
              <Input
                id="numeroOC"
                placeholder="Digite o número da Ordem de Carregamento"
                value={numeroOC}
                onChange={(e) => setNumeroOC(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBuscarOC()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleBuscarOC}
                disabled={isLoading}
                className="bg-cross-blue hover:bg-cross-blue/90"
              >
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          {ordemEncontrada && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">OC {ordemEncontrada.id}</h3>
                  <p className="text-sm text-gray-600">Cliente: {ordemEncontrada.cliente}</p>
                  <p className="text-sm text-gray-600">Status: {ordemEncontrada.status}</p>
                  <p className="text-sm text-gray-600">Notas Fiscais: {notasFiscaisVinculadas.length}</p>
                  <p className="text-sm text-gray-600">Volumes: {volumesVinculados.length}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleVisualizarNotas}
                    className="bg-cross-blue hover:bg-cross-blue/90"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Visualizar Notas Fiscais
                  </Button>
                  <Button
                    onClick={handleVisualizarVolumes}
                    variant="outline"
                    className="border-cross-blue text-cross-blue hover:bg-cross-blue/10"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Visualizar Volumes
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Tipo:</span>
                  <p>{ordemEncontrada.tipoCarregamento}</p>
                </div>
                <div>
                  <span className="font-medium">Data:</span>
                  <p>{ordemEncontrada.dataCarregamento}</p>
                </div>
                <div>
                  <span className="font-medium">Transportadora:</span>
                  <p>{ordemEncontrada.transportadora}</p>
                </div>
                <div>
                  <span className="font-medium">Motorista:</span>
                  <p>{ordemEncontrada.motorista}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Todas as Ordens de Carregamento</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={ordensColumns}
            data={ordensCarregamento}
          />
        </CardContent>
      </Card>

      {/* Dialog para Notas Fiscais */}
      {showNotasDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden m-4">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Notas Fiscais - OC {ordemEncontrada?.id}</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowNotasDialog(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <DataTable
                columns={notasColumns}
                data={notasFiscaisVinculadas}
              />
            </div>
          </div>
        </div>
      )}

      {/* Dialog para Volumes */}
      {showVolumesDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[80vh] overflow-hidden m-4">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Volumes - OC {ordemEncontrada?.id}</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowVolumesDialog(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <DataTable
                columns={volumesColumns}
                data={volumesVinculados}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultarOCTab;
