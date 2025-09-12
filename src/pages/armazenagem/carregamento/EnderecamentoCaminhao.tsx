
import React from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Hook atualizado para usar dados reais
import { useEnderecamentoReal } from '@/hooks/useEnderecamentoReal';

// Components
import HistoricoLayout from '@/components/carregamento/enderecamento/HistoricoLayout';
import CarregamentoLayout from '@/components/carregamento/enderecamento/CarregamentoLayout';
import ConfirmationDialog from '@/components/carregamento/enderecamento/ConfirmationDialog';

const EnderecamentoCaminhao: React.FC = () => {
  const {
    ordemSelecionada,
    volumes,
    volumesFiltrados,
    selecionados,
    caminhaoLayout,
    confirmDialogOpen,
    isLoading,
    numeroLinhas,
    setConfirmDialogOpen,
    handleOrderFormSubmit,
    filtrarVolumes,
    toggleSelecao,
    selecionarTodos,
    moverVolumesSelecionados,
    removerVolume,
    saveLayout,
    allVolumesPositioned,
    gerarLayoutDinamico,
    atualizarNumeroLinhas
  } = useEnderecamentoReal();

  // Converter o caminhaoLayout (objeto) para o formato esperado pelo TruckLayoutGrid (array)
  const layoutArray = React.useMemo(() => {
    return gerarLayoutDinamico(numeroLinhas, caminhaoLayout);
  }, [gerarLayoutDinamico, numeroLinhas, caminhaoLayout]);
  
  return (
    <MainLayout title="Endereçamento no Caminhão">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Endereçamento no Caminhão</h2>
        <p className="text-gray-600">Organize o layout e posicionamento da carga no veículo</p>
      </div>
      
      <Tabs defaultValue="layout" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="layout">Layout do Carregamento</TabsTrigger>
          <TabsTrigger value="historico">Histórico de Layouts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="layout">
          <CarregamentoLayout 
            orderNumber={ordemSelecionada}
            volumes={volumes}
            volumesFiltrados={volumesFiltrados}
            selecionados={selecionados}
            caminhaoLayout={layoutArray}
            numeroLinhas={numeroLinhas}
            onOrderFormSubmit={handleOrderFormSubmit}
            onFilter={filtrarVolumes}
            onSelectionToggle={toggleSelecao}
            onSelectAll={selecionarTodos}
            onCellClick={moverVolumesSelecionados}
            onRemoveVolume={removerVolume}
            onSaveLayout={saveLayout}
            onUpdateLinhas={atualizarNumeroLinhas}
            hasSelectedVolumes={selecionados.length > 0}
            allVolumesPositioned={allVolumesPositioned}
          />
        </TabsContent>
        
        <TabsContent value="historico">
          <HistoricoLayout />
        </TabsContent>
      </Tabs>

      <ConfirmationDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={() => {
          // Adicionar lógica de confirmação aqui
          console.log('Confirmação realizada');
          setConfirmDialogOpen(false);
        }}
      />
    </MainLayout>
  );
};

export default EnderecamentoCaminhao;
