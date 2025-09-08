
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Eye, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useOrdemCarregamento } from '@/hooks/carregamento';
import DataTable from '@/components/common/DataTable';
import { OrdemCarregamento, NotaFiscal } from '@/hooks/carregamento/types';
import ImportarNotasDialog from '../ImportarNotasDialog';

const ConsultarOCTab: React.FC = () => {
  const [numeroOC, setNumeroOC] = useState('');
  const [ordemEncontrada, setOrdemEncontrada] = useState<OrdemCarregamento | null>(null);
  const [notasFiscaisVinculadas, setNotasFiscaisVinculadas] = useState<NotaFiscal[]>([]);
  const [showNotasDialog, setShowNotasDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { ordensCarregamento, fetchOrdensCarregamento, buscarOrdemPorNumero } = useOrdemCarregamento();

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
        setNotasFiscaisVinculadas(ordem.notasFiscais || []);
        
        toast({
          title: "Ordem de Carregamento encontrada",
          description: `OC ${numeroOC} localizada com sucesso.`,
        });
      } else {
        setOrdemEncontrada(null);
        setNotasFiscaisVinculadas([]);
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

  const ordensColumns = [
    {
      id: 'id',
      header: 'Número OC',
      accessor: 'id',
      accessorKey: 'id',
    },
    {
      id: 'cliente',
      header: 'Cliente',
      accessor: 'cliente',
      accessorKey: 'cliente',
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      accessorKey: 'status',
      cell: ({ row }: any) => {
        const status = row.getValue('status');
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
      accessorKey: 'dataCarregamento',
    },
    {
      id: 'acoes',
      header: 'Ações',
      accessor: 'acoes',
      cell: ({ row }: any) => {
        const ordem = row.original;
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setOrdemEncontrada(ordem);
              setNotasFiscaisVinculadas(ordem.notasFiscais || []);
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
                </div>
                <Button
                  onClick={handleVisualizarNotas}
                  className="bg-cross-blue hover:bg-cross-blue/90"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Visualizar Notas Fiscais
                </Button>
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

      <ImportarNotasDialog
        open={showNotasDialog}
        onOpenChange={setShowNotasDialog}
        onImport={() => {}}
        notasFiscaisDisponiveis={notasFiscaisVinculadas}
        isLoading={false}
      />
    </div>
  );
};

export default ConsultarOCTab;
