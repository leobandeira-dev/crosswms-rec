
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LayoutSelector from './print/LayoutSelector';
import PrintActionButtons from './print/PrintActionButtons';
import DocumentInfo from './print/DocumentInfo';
import EmailSendForm from './print/EmailSendForm';
import useDocumentOperations from './print/useDocumentOperations';

interface DocumentPrintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentType: string;
  layoutRef: React.RefObject<HTMLDivElement>;
  danfeRef?: React.RefObject<HTMLDivElement>;
  simplifiedDanfeRef?: React.RefObject<HTMLDivElement>;
  filename?: string;
  xmlData?: any;
}

const DocumentPrintModal: React.FC<DocumentPrintModalProps> = ({
  open,
  onOpenChange,
  documentId,
  documentType,
  layoutRef,
  danfeRef,
  simplifiedDanfeRef,
  filename,
  xmlData
}) => {
  const [email, setEmail] = useState('');
  const [selectedLayout, setSelectedLayout] = useState('default');
  const [danfePdfBase64, setDanfePdfBase64] = useState<string | null>(null);
  
  // Clear PDF data when modal is closed
  useEffect(() => {
    if (!open) {
      setDanfePdfBase64(null);
    }
  }, [open]);
  
  const { 
    handlePrint, 
    handleSave, 
    handleSendEmail, 
    isProcessing 
  } = useDocumentOperations({
    layoutRef,
    danfeRef,
    simplifiedDanfeRef,
    documentId,
    documentType,
    selectedLayout,
    xmlData,
    danfePdfBase64,
    setDanfePdfBase64,
    filename
  });

  const handleFocusEmail = () => {
    document.getElementById('email-input')?.focus();
  };
  
  const handleEmailSubmit = async () => {
    const success = await handleSendEmail(email);
    if (success) {
      onOpenChange(false);
    }
  };

  const showDanfeOptions = documentType === "Nota Fiscal" && (danfeRef !== undefined || simplifiedDanfeRef !== undefined);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Opções de Impressão - {documentType}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <LayoutSelector 
            value={selectedLayout} 
            onChange={setSelectedLayout}
            showDANFE={showDanfeOptions}
          />
          
          <PrintActionButtons
            onPrint={handlePrint}
            onSave={handleSave}
            onFocusEmail={handleFocusEmail}
            isGenerating={isProcessing}
          />
          
          <DocumentInfo 
            documentType={documentType} 
            documentId={documentId} 
          />
          
          <EmailSendForm
            email={email}
            setEmail={setEmail}
            onSendEmail={handleEmailSubmit}
            isGenerating={isProcessing}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentPrintModal;
