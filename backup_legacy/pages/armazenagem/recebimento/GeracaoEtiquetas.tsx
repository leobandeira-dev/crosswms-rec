
import React, { useState, useEffect } from 'react';
import MainLayout from '../../../components/layout/MainLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useLocation } from 'react-router-dom';

// Import refactored components
import GerarEtiquetasTab from './components/etiquetas/GerarEtiquetasTab';
import FormInitializer from './components/etiquetas/FormInitializer';
import ConsultaEtiquetasTab from './components/etiquetas/ConsultaEtiquetasTab';
import EtiquetasMaeTab from './components/etiquetas/EtiquetasMaeTab';
import ClassifyVolumeDialog from './components/etiquetas/ClassifyVolumeDialog';
import VolumeExistsConfirmDialog from './components/etiquetas/VolumeExistsConfirmDialog';
import { useGeracaoEtiquetas } from './hooks/useGeracaoEtiquetas';

const GeracaoEtiquetas: React.FC = () => {
  const location = useLocation();
  const initialTab = location.state?.activeTab || 'gerar';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const {
    form,
    notaFiscalData,
    tipoEtiqueta,
    generatedVolumes,
    volumes,
    etiquetasMae,
    classifyDialogOpen,
    selectedVolume,
    volumeExistsDialogOpen,
    pendingPrintVolume,
    existingVolumesCount,
    setClassifyDialogOpen,
    setVolumeExistsDialogOpen,
    handleGenerateVolumes,
    handlePrintEtiquetas,
    handleReimprimirEtiquetas,
    handlePrintEtiquetaMae,
    handleCreateEtiquetaMae,
    handleClassifyVolume,
    handleSaveVolumeClassification,
    handleVincularVolumes,
    handleConfirmPrintWithExistingVolumes,
    setVolumes,
    setGeneratedVolumes
  } = useGeracaoEtiquetas();

  // Set initial form values if opening specifically for etiquetas mãe creation
  useEffect(() => {
    if (initialTab === 'etiquetasMae') {
      form.setValue('tipoEtiquetaMae', 'palete');
      form.setValue('descricaoEtiquetaMae', 'Novo Palete');
    }
  }, [initialTab, form]);

  return (
    <MainLayout title="Geração de Etiquetas">
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-2">Geração de Etiquetas por Volume</h2>
        <p className="text-gray-600">Gere etiquetas de identificação única para cada volume ou etiquetas mãe para agrupamento</p>
      </div>
      
      {/* Use the FormInitializer to handle form data initialization */}
      <FormInitializer 
        form={form} 
        notaFiscalData={notaFiscalData}
        onInitialized={handleGenerateVolumes}
      />
      
      <Tabs value={activeTab} className="mb-6" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="mb-4">
          <TabsTrigger value="gerar">Etiquetas Volumes</TabsTrigger>
          <TabsTrigger value="consultar">Consultar Etiquetas</TabsTrigger>
          <TabsTrigger value="etiquetasMae">Etiquetas Mãe</TabsTrigger>
        </TabsList>
        
        <TabsContent value="gerar">
          <GerarEtiquetasTab 
            form={form}
            generatedVolumes={generatedVolumes}
            handleGenerateVolumes={handleGenerateVolumes}
            handlePrintEtiquetas={handlePrintEtiquetas}
            handleClassifyVolume={handleClassifyVolume}
            setVolumes={setVolumes}
            setGeneratedVolumes={setGeneratedVolumes}
          />
        </TabsContent>
        
        <TabsContent value="consultar">
          <ConsultaEtiquetasTab 
            volumes={volumes}
            handleReimprimirEtiquetas={handleReimprimirEtiquetas}
          />
        </TabsContent>
        
        <TabsContent value="etiquetasMae">
          <EtiquetasMaeTab 
            etiquetasMae={etiquetasMae}
            volumes={volumes}
            handlePrintEtiquetaMae={handlePrintEtiquetaMae}
            handleVincularVolumes={handleVincularVolumes}
            handleCreateEtiquetaMae={handleCreateEtiquetaMae}
            form={form}
            returnUrl={location.state?.returnUrl}
          />
        </TabsContent>
      </Tabs>

      {/* Classification Dialog */}
      <ClassifyVolumeDialog 
        volume={selectedVolume}
        open={classifyDialogOpen}
        onClose={() => setClassifyDialogOpen(false)}
        onSave={handleSaveVolumeClassification}
      />

      {/* Volume Exists Confirmation Dialog */}
      <VolumeExistsConfirmDialog
        open={volumeExistsDialogOpen}
        onOpenChange={setVolumeExistsDialogOpen}
        onConfirm={handleConfirmPrintWithExistingVolumes}
        notaFiscal={pendingPrintVolume?.notaFiscal || ''}
        existingVolumesCount={existingVolumesCount}
      />
    </MainLayout>
  );
};

export default GeracaoEtiquetas;
