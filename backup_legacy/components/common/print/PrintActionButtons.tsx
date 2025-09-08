
import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Save, Mail } from 'lucide-react';

interface PrintActionButtonsProps {
  onPrint: () => void;
  onSave: () => void;
  onFocusEmail: () => void;
  isGenerating: boolean;
}

/**
 * Component that displays the print action buttons
 */
const PrintActionButtons: React.FC<PrintActionButtonsProps> = ({
  onPrint,
  onSave,
  onFocusEmail,
  isGenerating
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Button 
        onClick={onPrint}
        disabled={isGenerating}
        className="flex-col py-6 h-auto"
      >
        <Printer className="h-8 w-8 mb-2" />
        <span>Imprimir</span>
      </Button>
      
      <Button 
        onClick={onSave}
        disabled={isGenerating}
        variant="outline"
        className="flex-col py-6 h-auto"
      >
        <Save className="h-8 w-8 mb-2" />
        <span>Salvar PDF</span>
      </Button>
      
      <Button 
        variant="secondary"
        className="flex-col py-6 h-auto"
        onClick={onFocusEmail}
      >
        <Mail className="h-8 w-8 mb-2" />
        <span>Enviar por E-mail</span>
      </Button>
    </div>
  );
};

export default PrintActionButtons;
