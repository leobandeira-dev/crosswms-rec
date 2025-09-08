
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';
import NotaFiscalFields from './form/NotaFiscalFields';
import VolumeFields from './form/VolumeFields';
import PrintConfigFields from './form/PrintConfigFields';
import VolumeTypeFields from './form/VolumeTypeFields';
import EtiquetaMaeFields from './form/EtiquetaMaeFields';
import EtiquetaTypeSelector from './form/EtiquetaTypeSelector';
import FormActions from './form/FormActions';

interface EtiquetaFormPanelProps {
  form: UseFormReturn<any>;
  tipoEtiqueta: 'volume' | 'mae';
  isQuimico: boolean;
  handleGenerateVolumes?: () => void;
  handleCreateEtiquetaMae?: () => void;
  showEtiquetaMaeOption: boolean;
}

const EtiquetaFormPanel: React.FC<EtiquetaFormPanelProps> = ({
  form,
  tipoEtiqueta,
  isQuimico,
  handleGenerateVolumes,
  handleCreateEtiquetaMae,
  showEtiquetaMaeOption
}) => {
  const watchTipoEtiqueta = form.watch('tipoEtiqueta', tipoEtiqueta);
  const isVolumeEtiqueta = watchTipoEtiqueta === 'volume';
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Gerar {tipoEtiqueta === 'mae' ? 'Etiqueta Mãe' : 'Etiquetas de Volume'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <NotaFiscalFields form={form} />
          
          {isVolumeEtiqueta && <VolumeFields form={form} />}
          
          {!isVolumeEtiqueta && <EtiquetaMaeFields form={form} />}
          
          <PrintConfigFields form={form} />
          
          {isVolumeEtiqueta && <VolumeTypeFields form={form} />}
          
          {showEtiquetaMaeOption && <EtiquetaTypeSelector form={form} />}
        </div>
        
        <FormActions 
          isVolumeEtiqueta={isVolumeEtiqueta}
          handleGenerateVolumes={handleGenerateVolumes}
          handleCreateEtiquetaMae={handleCreateEtiquetaMae}
        />
      </CardContent>
    </Card>
  );
};

export default EtiquetaFormPanel;
