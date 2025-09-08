
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, FileText, AlertCircle } from 'lucide-react';
import { Carga } from '../types/coleta.types';
import ActionButtons from './CargasFinalizadas/ActionButtons';

interface CargasFinalizadasProps {
  cargas: Carga[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const CargasFinalizadas: React.FC<CargasFinalizadasProps> = ({ 
  cargas, 
  currentPage,
  setCurrentPage 
}) => {
  const [selectedTab, setSelectedTab] = useState<'entregues' | 'problemas'>('entregues');
  const [selectedCarga, setSelectedCarga] = useState<Carga | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const entregues = cargas.filter(carga => carga.status === 'delivered');
  const problemas = cargas.filter(carga => carga.status === 'problem');
  
  const handleVerDetalhes = (carga: Carga) => {
    setSelectedCarga(carga);
    setIsDialogOpen(true);
  };
  
  const handleExcluir = (cargaId: string) => {
    toast({
      title: "Carga excluída",
      description: `A carga ${cargaId} foi excluída do histórico.`,
      variant: "destructive",
    });
  };
  
  const renderCargasTable = (cargas: Carga[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox />
            </TableHead>
            <TableHead className="w-[120px]">Número</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Motorista</TableHead>
            <TableHead>Data Entrega</TableHead>
            <TableHead>Volumes</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cargas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Nenhuma carga {selectedTab === 'entregues' ? 'entregue' : 'com problema'} encontrada.
              </TableCell>
            </TableRow>
          ) : (
            cargas.map((carga) => (
              <TableRow key={carga.id}>
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell className="font-medium">{carga.id}</TableCell>
                <TableCell>{carga.destino}</TableCell>
                <TableCell>{carga.origem}</TableCell>
                <TableCell>{carga.motorista || "Não definido"}</TableCell>
                <TableCell>{carga.dataEntrega || "-"}</TableCell>
                <TableCell>{carga.volumes}</TableCell>
                <TableCell className="text-right">
                  <ActionButtons 
                    carga={carga}
                    onDetalhes={handleVerDetalhes}
                    onExcluir={handleExcluir}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
  
  return (
    <div className="space-y-4">
      <Tabs 
        value={selectedTab}
        onValueChange={(value) => setSelectedTab(value as 'entregues' | 'problemas')}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="entregues">Entregues ({entregues.length})</TabsTrigger>
          <TabsTrigger value="problemas">Com Problemas ({problemas.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entregues" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Cargas Entregues</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCargasTable(entregues)}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="problemas" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Cargas com Problemas</CardTitle>
            </CardHeader>
            <CardContent>
              {renderCargasTable(problemas)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {selectedCarga && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes da Carga</DialogTitle>
              <DialogDescription>
                Informações detalhadas sobre a carga {selectedCarga.id}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Origem</h4>
                  <p>{selectedCarga.origem}</p>
                </div>
                <div>
                  <h4 className="font-medium">Destino</h4>
                  <p>{selectedCarga.destino}</p>
                </div>
                <div>
                  <h4 className="font-medium">Motorista</h4>
                  <p>{selectedCarga.motorista || "Não definido"}</p>
                </div>
                <div>
                  <h4 className="font-medium">Veículo</h4>
                  <p>{selectedCarga.veiculo || "Não definido"}</p>
                </div>
                <div>
                  <h4 className="font-medium">Data Entrega</h4>
                  <p>{selectedCarga.dataEntrega || "Não definida"}</p>
                </div>
                <div>
                  <h4 className="font-medium">Status</h4>
                  <p className={selectedCarga.status === 'delivered' ? "text-green-500" : "text-red-500"}>
                    {selectedCarga.status === 'delivered' ? 'Entregue' : 'Problema na entrega'}
                  </p>
                </div>
              </div>
              
              {selectedCarga.observacoes && (
                <div>
                  <h4 className="font-medium">Observações</h4>
                  <p>{selectedCarga.observacoes}</p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Fechar</Button>
              <Button 
                onClick={() => {
                  toast({
                    title: "Documentação gerada",
                    description: "O comprovante de entrega foi gerado com sucesso.",
                    variant: "default",
                  });
                  setIsDialogOpen(false);
                }}
              >
                <FileText className="h-4 w-4 mr-2" /> 
                Gerar Comprovante
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CargasFinalizadas;
