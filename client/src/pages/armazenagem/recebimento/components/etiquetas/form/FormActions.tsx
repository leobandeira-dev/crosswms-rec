
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileOutput, Package } from 'lucide-react';

interface FormActionsProps {
  isVolumeEtiqueta: boolean;
  handleGenerateVolumes?: () => void;
  handleCreateEtiquetaMae?: () => void;
  isGenerating?: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ 
  isVolumeEtiqueta, 
  handleGenerateVolumes, 
  handleCreateEtiquetaMae,
  isGenerating = false
}) => {
  return (
    <>
      {isVolumeEtiqueta ? (
        <Button
          type="button"
          className="w-full"
          onClick={handleGenerateVolumes}
          disabled={isGenerating}
        >
          <FileOutput className="mr-2 h-4 w-4" />
          {isGenerating ? 'Gerando...' : 'Gerar Volumes'}
        </Button>
      ) : (
        <Button
          type="button"
          className="w-full"
          onClick={handleCreateEtiquetaMae}
          disabled={isGenerating}
        >
          <Package className="mr-2 h-4 w-4" />
          Adicionar Etiqueta Mãe
        </Button>
      )}
    </>
  );
};

export default FormActions;
