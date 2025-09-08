
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '../../../components/common/DataTable';
import { Button } from '@/components/ui/button';
import { FileText, CheckCircle, AlertCircle, Check, MessageSquare } from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';
import { toast } from '@/hooks/use-toast';
import SearchFilter from '../../../components/common/SearchFilter';
import { handleWhatsAppSupport, problemosComuns } from '../utils/supportHelpers';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ActiveLoadsProps {
  cargas: any[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const ActiveLoads: React.FC<ActiveLoadsProps> = ({ cargas, currentPage, setCurrentPage }) => {
  const filters = [
    {
      name: 'Status',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Pendentes de Aceite', value: 'pending' },
        { label: 'Em trânsito', value: 'transit' },
        { label: 'Em carregamento', value: 'loading' },
        { label: 'Agendadas', value: 'scheduled' },
        { label: 'Entregues', value: 'delivered' },
        { label: 'Com problemas', value: 'problem' },
      ]
    },
    {
      name: 'Motorista',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'José da Silva', value: 'jose' },
        { label: 'Carlos Santos', value: 'carlos' },
        { label: 'Pedro Oliveira', value: 'pedro' },
        { label: 'Antônio Ferreira', value: 'antonio' },
        { label: 'Manuel Costa', value: 'manuel' },
      ]
    }
  ];

  const [selectedCarga, setSelectedCarga] = useState<any>(null);
  const [openSupportDialog, setOpenSupportDialog] = useState(false);

  const handleSearch = (value: string) => {
    console.log('Search:', value);
    // Implementar lógica de busca
  };
  
  const handleFilterChange = (filter: string, value: string) => {
    console.log(`Filter ${filter} changed to ${value}`);
    // Implementar lógica de filtro
  };

  const handleAcceptCarga = (cargaId: string) => {
    // Implementar lógica para aceitar carga
    toast({
      title: "Carga aceita com sucesso",
      description: `A carga ${cargaId} foi aceita e agora está em andamento.`,
    });
    console.log('Carga aceita:', cargaId);
  };

  const handleSupportRequest = (problem: string, description: string) => {
    if (!selectedCarga) return;
    
    const cargaInfo = {
      id: selectedCarga.id,
      destino: selectedCarga.destino,
      motorista: selectedCarga.motorista,
      veiculo: selectedCarga.veiculo,
      cpf: selectedCarga.cpf || 'Não informado'
    };
    
    const messageWithProblem = `${problem} - ${description} - `;
    
    handleWhatsAppSupport({
      ...cargaInfo,
      id: `${cargaInfo.id} - PROBLEMA: ${messageWithProblem}`
    });
    
    setOpenSupportDialog(false);
  };

  return (
    <>
      <SearchFilter 
        placeholder="Buscar por ID, motorista ou destino..."
        filters={filters}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Cargas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { header: 'ID', accessor: 'id' },
              { header: 'Destino', accessor: 'destino' },
              { header: 'Motorista', accessor: 'motorista' },
              { header: 'Veículo', accessor: 'veiculo' },
              { header: 'Data Prevista', accessor: 'dataPrevisao' },
              { header: 'Volumes', accessor: 'volumes' },
              { header: 'Peso', accessor: 'peso' },
              { 
                header: 'Status', 
                accessor: 'status',
                cell: (row) => {
                  const statusMap: any = {
                    'pending': { type: 'default', text: 'Pendente Aceite' },
                    'transit': { type: 'info', text: 'Em Trânsito' },
                    'loading': { type: 'warning', text: 'Em Carregamento' },
                    'scheduled': { type: 'default', text: 'Agendada' },
                    'delivered': { type: 'success', text: 'Entregue' },
                    'problem': { type: 'error', text: 'Problema' }
                  };
                  const status = statusMap[row.status];
                  return <StatusBadge status={status.type} text={status.text} />;
                }
              },
              { 
                header: 'Ações', 
                accessor: 'actions',
                className: "text-right w-[220px]",
                cell: (row) => (
                  <div className="flex space-x-2 justify-end">
                    <Dialog open={openSupportDialog && selectedCarga?.id === row.id} onOpenChange={(open) => {
                      if (open) {
                        setSelectedCarga(row);
                      }
                      setOpenSupportDialog(open);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline"
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white border-none"
                          onClick={() => setSelectedCarga(row)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" /> Suporte
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Solicitar Suporte - Carga {row.id}</DialogTitle>
                          <DialogDescription>
                            Selecione o problema que está enfrentando com esta carga:
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {problemosComuns.map((problema, index) => (
                            <Button 
                              key={index} 
                              variant="outline" 
                              className="justify-start text-left px-4 py-3 h-auto"
                              onClick={() => handleSupportRequest(problema.title, problema.description)}
                            >
                              <div>
                                <div className="font-bold">{problema.title}</div>
                                <div className="text-sm text-gray-500">{problema.description}</div>
                              </div>
                            </Button>
                          ))}
                          <Button 
                            variant="outline" 
                            className="justify-start text-left px-4 py-3 h-auto"
                            onClick={() => handleWhatsAppSupport({
                              id: row.id,
                              destino: row.destino,
                              motorista: row.motorista,
                              veiculo: row.veiculo,
                              cpf: row.cpf || 'Não informado'
                            })}
                          >
                            <div>
                              <div className="font-bold">Outro Problema</div>
                              <div className="text-sm text-gray-500">Problemas não listados acima</div>
                            </div>
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="outline"
                      size="sm"
                    >
                      <FileText className="h-4 w-4 mr-1" /> Detalhes
                    </Button>
                    
                    {row.status === 'pending' && (
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                        onClick={() => handleAcceptCarga(row.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Aceitar
                      </Button>
                    )}
                    
                    {row.status === 'transit' && (
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" /> Entregar
                      </Button>
                    )}
                    
                    {row.status !== 'delivered' && row.status !== 'problem' && (
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <AlertCircle className="h-4 w-4 mr-1" /> Problema
                      </Button>
                    )}
                  </div>
                )
              }
            ]}
            data={cargas}
            pagination={{
              totalPages: Math.ceil(cargas.length / 10),
              currentPage: currentPage,
              onPageChange: setCurrentPage
            }}
            onRowClick={(row) => console.log('Row clicked:', row)}
          />
        </CardContent>
      </Card>
    </>
  );
};

export default ActiveLoads;
