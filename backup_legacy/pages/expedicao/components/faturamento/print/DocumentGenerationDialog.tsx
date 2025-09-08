
import React, { useRef, useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import DocumentInfoForm from './DocumentInfoForm';
import { DocumentInfo } from './schema/documentSchema';
import FaturaDocumentLayout from './FaturaDocumentLayout';
import { NotaFiscal } from '../../../Faturamento';
import { CabecalhoValores, TotaisCalculados } from '../../../hooks/faturamento/types';
import { Button } from '@/components/ui/button';
import { useFaturamentoDocumentos } from '../../../hooks/faturamento/useFaturamentoDocumentos';
import FaturaDocumentPDFViewer from './FaturaDocumentPDFViewer';

interface DocumentGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notas: NotaFiscal[];
  cabecalhoValores: CabecalhoValores;
  totaisCalculados: TotaisCalculados;
}

const DocumentGenerationDialog: React.FC<DocumentGenerationDialogProps> = ({ 
  open, 
  onOpenChange, 
  notas, 
  cabecalhoValores,
  totaisCalculados
}) => {
  const [documentInfo, setDocumentInfo] = useState<DocumentInfo | null>(null);
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const documentRef = useRef<HTMLDivElement>(null);
  const { adicionarNovoDocumento } = useFaturamentoDocumentos();

  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      setStep('form');
      setDocumentInfo(null);
    }
  }, [open]);

  const handleFormSubmit = (data: DocumentInfo) => {
    setDocumentInfo(data);
    setStep('preview');
  };

  const handleBackToForm = () => {
    setStep('form');
  };

  const handleFinalizarDocumento = () => {
    if (documentInfo) {
      // Adiciona o documento ao sistema
      adicionarNovoDocumento(documentInfo, totaisCalculados.totalViagem);
      
      // Fecha o diálogo
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={step === 'preview' ? "max-w-4xl" : "max-w-2xl"}>
        <DialogHeader>
          <DialogTitle>
            {step === 'form' ? 'Informações do documento' : 'Pré-visualização do documento'}
          </DialogTitle>
        </DialogHeader>
        
        {step === 'form' ? (
          <DocumentInfoForm 
            onSubmit={handleFormSubmit}
            onCancel={() => onOpenChange(false)}
            defaultSequence={1} // Em produção, buscar último sequencial do dia
          />
        ) : (
          <div className="py-4">
            <div ref={documentRef}>
              {documentInfo && (
                <FaturaDocumentLayout
                  documentInfo={documentInfo}
                  notas={notas}
                  cabecalhoValores={cabecalhoValores}
                  totaisCalculados={totaisCalculados}
                />
              )}
            </div>
            <div className="mt-6">
              {documentInfo && (
                <div className="flex justify-between pt-4 border-t">
                  <button
                    onClick={handleBackToForm}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  >
                    Voltar e editar
                  </button>
                  <div className="flex space-x-2">
                    {documentInfo && (
                      <FaturaDocumentPDFViewer
                        documentInfo={documentInfo}
                        notas={notas}
                        cabecalhoValores={cabecalhoValores}
                        totaisCalculados={totaisCalculados}
                      />
                    )}
                    <Button onClick={handleFinalizarDocumento}>
                      Finalizar e emitir documento
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentGenerationDialog;
