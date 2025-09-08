
import React from 'react';
import { Volume } from './VolumesTable';
import VolumesTable from './VolumesTable';

interface GeneratedVolumesPanelProps {
  volumes: Volume[];
  handlePrintEtiquetas: (volume: Volume) => void;
  handleClassifyVolume: (volume: Volume) => void;
  showEtiquetaMaeColumn?: boolean;
}

const GeneratedVolumesPanel: React.FC<GeneratedVolumesPanelProps> = ({ 
  volumes, 
  handlePrintEtiquetas, 
  handleClassifyVolume,
  showEtiquetaMaeColumn = false
}) => {
  if (volumes.length === 0) {
    return (
      <div className="mt-6 p-8 text-center border rounded-md bg-gray-50">
        <p className="text-gray-600">
          Informe a nota fiscal e a quantidade de volumes, depois clique em "Gerar Volumes" para criar etiquetas.
        </p>
      </div>
    );
  }

  return (
    <VolumesTable 
      volumes={volumes}
      onPrintEtiquetas={handlePrintEtiquetas}
      onClassifyVolume={handleClassifyVolume}
      showEtiquetaMaeColumn={showEtiquetaMaeColumn}
    />
  );
};

export default GeneratedVolumesPanel;
