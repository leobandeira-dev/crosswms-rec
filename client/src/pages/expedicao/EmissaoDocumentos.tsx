
import React, { useState } from 'react';
import MainLayout from '../../components/layout/MainLayout';
import SearchFilter from '../../components/common/SearchFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileCheck, FileText, Printer, Download, Send } from 'lucide-react';

// Mock data
const cargas = [
  { 
    id: 'OC-2023-001',
    motorista: 'José da Silva',
    placa: 'ABC-1234',
    origem: 'São Paulo, SP',
    destino: 'Campinas, SP',
    dataCarregamento: '10/05/2023',
    status: 'pending',
    documentos: {
      oc: true,
      manifesto: true,
      cte: false,
      romaneio: true
    }
  },
  { 
    id: 'OC-2023-002',
    motorista: 'Carlos Santos',
    placa: 'DEF-5678',
    origem: 'Rio de Janeiro, RJ',
    destino: 'Niterói, RJ',
    dataCarregamento: '09/05/2023',
    status: 'loading',
    documentos: {
      oc: true,
      manifesto: true,
      cte: false,
      romaneio: true
    }
  },
  { 
    id: 'OC-2023-003',
    motorista: 'Pedro Oliveira',
    placa: 'GHI-9012',
    origem: 'Belo Horizonte, MG',
    destino: 'São Paulo, SP',
    dataCarregamento: '08/05/2023',
    status: 'in_transit',
    documentos: {
      oc: true,
      manifesto: true,
      cte: true,
      romaneio: true
    }
  },
  { 
    id: 'OC-2023-004',
    motorista: 'Ana Costa',
    placa: 'JKL-3456',
    origem: 'Curitiba, PR',
    destino: 'Florianópolis, SC',
    dataCarregamento: '07/05/2023',
    status: 'delivered',
    documentos: {
      oc: true,
      manifesto: true,
      cte: true,
      romaneio: true
    }
  }
];

const EmissaoDocumentos = () => {
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [selectedCarga, setSelectedCarga] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('cargas');
  const [currentPage, setCurrentPage] = useState(1);
  
  const filters = [
    {
      name: 'Status',
      options: [
        { label: 'Todos', value: 'all' },
        { label: 'Aguardando', value: 'pending' },
        { label: 'Em Carregamento', value: 'loading' },
        { label: 'Em Trânsito', value: 'in_transit' },
        { label: 'Entregue', value: 'delivered' },
      ]
    },
    {
      name: 'Data',
      options: [
        { label: 'Hoje', value: 'today' },
        { label: 'Últimos 7 dias', value: '7days' },
        { label: 'Últimos 30 dias', value: '30days' },
        { label: 'Personalizado', value: 'custom' },
      ]
    }
  ];
  
  const handleSearch = (value: string) => {
    console.log('Search:', value);
    // Implementar lógica de busca
  };
  
  const handleFilterChange = (filter: string, value: string) => {
    console.log(`Filter ${filter} changed to ${value}`);
    // Implementar lógica de filtro
  };
  
  const openDocDialog = (carga: any) => {
    setSelectedCarga(carga);
    setIsDocDialogOpen(true);
  };
  
  const getStatusBadge = (status: string) => {
    const statusMap: any = {
      'pending': { type: 'warning', text: 'Aguardando' },
      'loading': { type: 'info', text: 'Em Carregamento' },
      'in_transit': { type: 'info', text: 'Em Trânsito' },
      'delivered': { type: 'success', text: 'Entregue' },
    };
    const statusData = statusMap[status];
    return <StatusBadge status={statusData.type} text={statusData.text} />;
  };

  return (
    <MainLayout title="Expedição e Documentos">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-heading">Gestão de Expedição</h2>
          <p className="text-gray-500">Emissão e controle de documentos para cargas</p>
        </div>
      </div>
      
      <Tabs defaultValue="cargas" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="cargas">Cargas para Expedição</TabsTrigger>
          <TabsTrigger value="documentos">Documentos Emitidos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="cargas">
          <SearchFilter 
            placeholder="Buscar por OC, motorista ou placa..."
            filters={filters}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Cargas Aguardando Documentação</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { header: 'OC', accessor: 'id' },
                  { header: 'Motorista', accessor: 'motorista' },
                  { header: 'Placa', accessor: 'placa' },
                  { header: 'Origem', accessor: 'origem' },
                  { header: 'Destino', accessor: 'destino' },
                  { header: 'Data Carregamento', accessor: 'dataCarregamento' },
                  { 
                    header: 'Status', 
                    accessor: 'status',
                    cell: (row) => getStatusBadge(row.status)
                  },
                  { 
                    header: 'Documentos', 
                    accessor: 'documentos',
                    cell: (row) => (
                      <div className="flex space-x-1">
                        <span className={`px-1 rounded-sm ${row.documentos.oc ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>OC</span>
                        <span className={`px-1 rounded-sm ${row.documentos.manifesto ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>MF</span>
                        <span className={`px-1 rounded-sm ${row.documentos.cte ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>CT-e</span>
                        <span className={`px-1 rounded-sm ${row.documentos.romaneio ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>ROM</span>
                      </div>
                    )
                  },
                  { 
                    header: 'Ações', 
                    accessor: '',
                    cell: (row) => (
                      <div className="flex space-x-2 justify-end">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openDocDialog(row);
                          }}
                          size="sm"
                          className="bg-cross-blue hover:bg-cross-blueDark"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Documentos
                        </Button>
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
                onRowClick={openDocDialog}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documentos">
          <SearchFilter 
            placeholder="Buscar por OC, motorista ou documento..."
            filters={[
              {
                name: 'Tipo Documento',
                options: [
                  { label: 'Todos', value: 'all' },
                  { label: 'Ordem de Carregamento', value: 'oc' },
                  { label: 'Manifesto', value: 'manifesto' },
                  { label: 'CT-e', value: 'cte' },
                  { label: 'Romaneio', value: 'romaneio' },
                ]
              },
              {
                name: 'Data',
                options: [
                  { label: 'Hoje', value: 'today' },
                  { label: 'Últimos 7 dias', value: '7days' },
                  { label: 'Últimos 30 dias', value: '30days' },
                  { label: 'Personalizado', value: 'custom' },
                ]
              }
            ]}
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Documentos Emitidos</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={[
                  { header: 'ID Documento', accessor: 'id' },
                  { header: 'Tipo', accessor: 'motorista' },
                  { header: 'OC Relacionada', accessor: 'placa' },
                  { header: 'Emitido em', accessor: 'origem' },
                  { header: 'Emitido por', accessor: 'destino' },
                  { 
                    header: 'Ações', 
                    accessor: '',
                    cell: (row) => (
                      <div className="flex space-x-2 justify-end">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Visualizar documento');
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Download documento');
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Enviar documento');
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  }
                ]}
                data={[]} // Esta tabela estaria vazia inicialmente ou com dados reais
                pagination={{
                  totalPages: 1,
                  currentPage: 1,
                  onPageChange: setCurrentPage
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {selectedCarga && (
        <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>Documentos para Carga {selectedCarga.id}</DialogTitle>
              <DialogDescription>
                Gere e gerencie os documentos necessários para esta carga.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Motorista</p>
                  <p className="font-medium">{selectedCarga.motorista}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Placa</p>
                  <p className="font-medium">{selectedCarga.placa}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Origem</p>
                  <p className="font-medium">{selectedCarga.origem}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Destino</p>
                  <p className="font-medium">{selectedCarga.destino}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Data de Carregamento</p>
                  <p className="font-medium">{selectedCarga.dataCarregamento}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedCarga.status)}</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-heading mb-4">Documentos da Carga</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileCheck className={`mr-3 ${selectedCarga.documentos.oc ? 'text-green-500' : 'text-gray-400'}`} size={24} />
                      <div>
                        <p className="font-medium">Ordem de Carregamento</p>
                        <p className="text-sm text-gray-500">OC #{selectedCarga.id}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Printer className="mr-2 h-4 w-4" /> Imprimir
                      </Button>
                      <Button size="sm" disabled={!selectedCarga.documentos.oc}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileCheck className={`mr-3 ${selectedCarga.documentos.manifesto ? 'text-green-500' : 'text-gray-400'}`} size={24} />
                      <div>
                        <p className="font-medium">Manifesto</p>
                        <p className="text-sm text-gray-500">Manifesto de carga #{selectedCarga.id.replace('OC', 'MF')}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Printer className="mr-2 h-4 w-4" /> Imprimir
                      </Button>
                      <Button size="sm" disabled={!selectedCarga.documentos.manifesto}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileCheck className={`mr-3 ${selectedCarga.documentos.cte ? 'text-green-500' : 'text-gray-400'}`} size={24} />
                      <div>
                        <p className="font-medium">CT-e</p>
                        <p className="text-sm text-gray-500">Conhecimento de Transporte Eletrônico</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!selectedCarga.documentos.cte ? (
                        <Button size="sm" className="bg-cross-blue hover:bg-cross-blueDark">
                          Gerar CT-e
                        </Button>
                      ) : (
                        <>
                          <Button size="sm" variant="outline">
                            <Printer className="mr-2 h-4 w-4" /> Imprimir
                          </Button>
                          <Button size="sm">
                            <Download className="mr-2 h-4 w-4" /> Download
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <FileCheck className={`mr-3 ${selectedCarga.documentos.romaneio ? 'text-green-500' : 'text-gray-400'}`} size={24} />
                      <div>
                        <p className="font-medium">Romaneio</p>
                        <p className="text-sm text-gray-500">Romaneio de carga #{selectedCarga.id.replace('OC', 'ROM')}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Printer className="mr-2 h-4 w-4" /> Imprimir
                      </Button>
                      <Button size="sm" disabled={!selectedCarga.documentos.romaneio}>
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDocDialogOpen(false)}
                className="mr-auto"
              >
                Fechar
              </Button>
              
              <Button variant="outline">
                <Send className="mr-2 h-4 w-4" /> Enviar por E-mail
              </Button>
              
              <Button className="bg-cross-blue hover:bg-cross-blueDark">
                <Printer className="mr-2 h-4 w-4" /> Imprimir Todos
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </MainLayout>
  );
};

export default EmissaoDocumentos;
