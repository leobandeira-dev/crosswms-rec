
import React, { useState } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Archive, FileText, Check, AlertTriangle } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import SearchFilter from '@/components/common/SearchFilter';
import { recebimentoFiliaisFilterConfig } from './filterConfig';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// Mock data
const transferenciasFiliais = [
  { id: 'TF-2023-001', filialOrigem: 'São Paulo', filialDestino: 'Rio de Janeiro', notaFiscal: '12345', data: '10/05/2023', volumes: 10, status: 'transit' },
  { id: 'TF-2023-002', filialOrigem: 'Rio de Janeiro', filialDestino: 'São Paulo', notaFiscal: '12346', data: '09/05/2023', volumes: 15, status: 'pending' },
  { id: 'TF-2023-003', filialOrigem: 'Belo Horizonte', filialDestino: 'São Paulo', notaFiscal: '12347', data: '08/05/2023', volumes: 8, status: 'completed' },
];

interface ReceberTransferenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  transferencia: any;
  onReceber: () => void;
}

const ReceberTransferenciaModal: React.FC<ReceberTransferenciaModalProps> = ({ 
  isOpen, onClose, transferencia, onReceber 
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleReceber = () => {
    setIsLoading(true);
    // Simulação de uma chamada à API
    setTimeout(() => {
      setIsLoading(false);
      onReceber();
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Receber Transferência</DialogTitle>
          <DialogDescription>
            Confirme o recebimento desta transferência da filial {transferencia?.filialOrigem}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-1">ID da Transferência:</p>
              <p className="text-sm">{transferencia?.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Nota Fiscal:</p>
              <p className="text-sm">{transferencia?.notaFiscal}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Filial de Origem:</p>
              <p className="text-sm">{transferencia?.filialOrigem}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Data:</p>
              <p className="text-sm">{transferencia?.data}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Volumes:</p>
              <p className="text-sm">{transferencia?.volumes}</p>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
            <div className="flex items-start">
              <AlertTriangle className="text-yellow-500 mr-2 mt-0.5" size={18} />
              <p className="text-sm text-yellow-700">
                Ao confirmar o recebimento, todos os itens desta transferência terão seu status 
                alterado para "Na filial de destino" e não poderão ser modificados.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleReceber} 
            className="bg-cross-blue hover:bg-cross-blue/90"
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : 'Confirmar Recebimento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RecebimentoFiliais: React.FC = () => {
  const { toast } = useToast();
  const [transferencias, setTransferencias] = useState(transferenciasFiliais);
  const [selectedTransferencia, setSelectedTransferencia] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReceberTransferencia = (transferencia: any) => {
    setSelectedTransferencia(transferencia);
    setIsModalOpen(true);
  };

  const confirmReceberTransferencia = () => {
    // Atualiza o status da transferência para "completed" (concluído)
    setTransferencias(prev => 
      prev.map(t => 
        t.id === selectedTransferencia.id 
          ? { ...t, status: 'completed' } 
          : t
      )
    );

    // Notifica o usuário
    toast({
      title: "Transferência recebida",
      description: `A transferência ${selectedTransferencia.id} foi recebida com sucesso. Status atualizado para "Na filial de destino".`,
    });
  };

  return (
    <MainLayout title="Recebimento Entre Filiais">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Recebimento Entre Filiais</h2>
        <p className="text-gray-600">Gerencie transferências e recebimentos entre filiais da empresa</p>
      </div>
      
      <Tabs defaultValue="receber" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="receber">A Receber</TabsTrigger>
          <TabsTrigger value="enviar">A Enviar</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="receber">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Archive className="mr-2 text-cross-blue" size={20} />
                Transferências para Recebimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SearchFilter 
                placeholder="Buscar por ID ou nota fiscal..." 
                filters={recebimentoFiliaisFilterConfig}
                type="search"
              />
              
              <DataTable
                columns={[
                  { header: 'ID', accessor: 'id' },
                  { header: 'Filial de Origem', accessor: 'filialOrigem' },
                  { header: 'Filial de Destino', accessor: 'filialDestino' },
                  { header: 'Nota Fiscal', accessor: 'notaFiscal' },
                  { header: 'Data', accessor: 'data' },
                  { header: 'Volumes', accessor: 'volumes' },
                  { 
                    header: 'Status', 
                    accessor: 'status',
                    cell: (row) => {
                      const statusMap: any = {
                        'transit': { type: 'info', text: 'Em Trânsito' },
                        'pending': { type: 'warning', text: 'Aguardando' },
                        'completed': { type: 'success', text: 'Na filial de destino' },
                      };
                      const status = statusMap[row.status];
                      return <StatusBadge status={status.type} text={status.text} />;
                    }
                  },
                  {
                    header: 'Ações',
                    accessor: 'actions',
                    cell: (row) => (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Detalhes</Button>
                        {row.status !== 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-cross-blue text-white hover:bg-cross-blue/90"
                            onClick={() => handleReceberTransferencia(row)}
                          >
                            <Check className="mr-1" size={16} />
                            Receber
                          </Button>
                        )}
                      </div>
                    )
                  }
                ]}
                data={transferencias.filter(t => t.status !== 'completed')}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="enviar">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="mr-2 text-cross-blue" size={20} />
                Iniciar Nova Transferência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Use este formulário para iniciar uma transferência de mercadoria para outra filial.
              </p>
              <Button className="bg-cross-blue hover:bg-cross-blue/90">
                Nova Transferência
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Transferências</CardTitle>
            </CardHeader>
            <CardContent>
              <SearchFilter 
                placeholder="Buscar por ID ou nota fiscal..." 
                filters={recebimentoFiliaisFilterConfig}
                type="search"
              />
              
              <DataTable
                columns={[
                  { header: 'ID', accessor: 'id' },
                  { header: 'Filial de Origem', accessor: 'filialOrigem' },
                  { header: 'Filial de Destino', accessor: 'filialDestino' },
                  { header: 'Nota Fiscal', accessor: 'notaFiscal' },
                  { header: 'Data', accessor: 'data' },
                  { header: 'Volumes', accessor: 'volumes' },
                  { 
                    header: 'Status', 
                    accessor: 'status',
                    cell: (row) => {
                      const statusMap: any = {
                        'transit': { type: 'info', text: 'Em Trânsito' },
                        'pending': { type: 'warning', text: 'Aguardando' },
                        'completed': { type: 'success', text: 'Na filial de destino' },
                      };
                      const status = statusMap[row.status];
                      return <StatusBadge status={status.type} text={status.text} />;
                    }
                  },
                  {
                    header: 'Ações',
                    accessor: 'actions',
                    cell: () => (
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    )
                  }
                ]}
                data={transferencias}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal para receber transferência */}
      <ReceberTransferenciaModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transferencia={selectedTransferencia}
        onReceber={confirmReceberTransferencia}
      />
    </MainLayout>
  );
};

export default RecebimentoFiliais;
