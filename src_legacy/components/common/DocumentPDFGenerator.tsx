
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import DocumentPrintModal from './DocumentPrintModal';

interface DocumentPDFGeneratorProps {
  documentId: string;
  documentType: string;
  renderDocument: (documentId: string) => React.ReactNode;
  buttonText?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | null;
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

/**
 * A reusable component for generating PDF documents
 * 
 * @param documentId - The ID of the document to generate
 * @param documentType - The type of document (e.g., "Nota Fiscal", "Ordem de Recebimento")
 * @param renderDocument - A function that returns the JSX to render in the PDF
 * @param buttonText - Optional text for the button (defaults to just an icon)
 * @param buttonVariant - Optional button variant
 * @param buttonSize - Optional button size
 */
const DocumentPDFGenerator: React.FC<DocumentPDFGeneratorProps> = ({
  documentId,
  documentType,
  renderDocument,
  buttonText,
  buttonVariant = "outline",
  buttonSize = "sm"
}) => {
  const [printModalOpen, setPrintModalOpen] = useState(false);
  const documentRef = useRef<HTMLDivElement>(null);
  
  const handlePrintClick = () => {
    setPrintModalOpen(true);
  };
  
  return (
    <>
      <Button 
        variant={buttonVariant} 
        size={buttonSize}
        onClick={handlePrintClick}
      >
        <Printer className="h-4 w-4" />
        {buttonText && <span className="ml-2">{buttonText}</span>}
      </Button>
      
      {/* Hidden div for document rendering */}
      <div className="hidden">
        <div ref={documentRef} className="p-4 bg-white">
          <h2 className="text-xl font-bold mb-4">{documentType} - {documentId}</h2>
          <div className="border p-4">
            {renderDocument(documentId)}
          </div>
        </div>
      </div>
      
      <DocumentPrintModal
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
        documentId={documentId}
        documentType={documentType}
        layoutRef={documentRef}
      />
    </>
  );
};

export default DocumentPDFGenerator;
