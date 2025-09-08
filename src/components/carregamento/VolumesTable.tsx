
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import DataTable from '@/components/common/DataTable';
import { toast } from "@/hooks/use-toast";
import { OrdemCarregamento } from './types/order.types';
import { ItemConferencia } from './types/conferencia.types';
import RemoveItemDialog from './RemoveItemDialog';
import EmptyStateMessage from './EmptyStateMessage';
import OrderHeaderInfo from './OrderHeaderInfo';
import { getVolumeColumns } from './VolumesTableColumns';

interface VolumesTableProps {
  ordemSelecionada: OrdemCarregamento | null;
  itens: ItemConferencia[];
  handleVerificarItem: (id: string) => void;
  handleRemoverItem?: (id: string) => void;
  tipoVisualizacao: 'conferir' | 'emConferencia' | 'conferidas';
  loading?: boolean;
}

const VolumesTable: React.FC<VolumesTableProps> = ({ 
  ordemSelecionada, 
  itens, 
  handleVerificarItem, 
  handleRemoverItem,
  tipoVisualizacao,
  loading = false
}) => {
  const [itemParaRemover, setItemParaRemover] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const confirmarRemocao = (id: string) => {
    setItemParaRemover(id);
    setDialogOpen(true);
  };

  const removerItem = () => {
    if (itemParaRemover && handleRemoverItem) {
      handleRemoverItem(itemParaRemover);
      toast({
        title: "Item removido",
        description: `O item foi removido da ordem de carregamento.`,
      });
    }
    setDialogOpen(false);
    setItemParaRemover(null);
  };

  const getTitleByTipo = () => {
    switch (tipoVisualizacao) {
      case 'conferir': return 'Volumes para Conferência';
      case 'emConferencia': return 'Volumes em Conferência';
      case 'conferidas': return 'Volumes Conferidos';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <CheckCircle className="mr-2 text-cross-blue" size={20} />
          {getTitleByTipo()}
        </CardTitle>
        {ordemSelecionada && (
          <OrderHeaderInfo ordem={ordemSelecionada} />
        )}
      </CardHeader>
      <CardContent>
        {ordemSelecionada ? (
          <DataTable
            columns={getVolumeColumns(handleVerificarItem, handleRemoverItem ? confirmarRemocao : undefined, tipoVisualizacao)}
            data={itens}
          />
        ) : (
          <EmptyStateMessage tipoVisualizacao={tipoVisualizacao} />
        )}
        
        {ordemSelecionada && tipoVisualizacao === 'conferir' && (
          <div className="flex justify-end mt-4">
            <Button 
              className="bg-cross-blue hover:bg-cross-blue/90"
              disabled={itens.some(item => !item.verificado) || loading}
            >
              Finalizar Conferência
            </Button>
          </div>
        )}
      </CardContent>

      <RemoveItemDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onConfirm={removerItem} 
      />
    </Card>
  );
};

export default VolumesTable;
