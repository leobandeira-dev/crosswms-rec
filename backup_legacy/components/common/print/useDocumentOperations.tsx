
import React, { useState } from 'react';
import useDANFEGenerator from './DANFEGenerator';
import { toast } from "@/hooks/use-toast";
import { createPDFDataUrl } from '@/pages/armazenagem/recebimento/utils/danfeAPI';

interface UseDocumentOperationsProps {
  layoutRef: React.RefObject<HTMLDivElement>;
  danfeRef?: React.RefObject<HTMLDivElement>;
  simplifiedDanfeRef?: React.RefObject<HTMLDivElement>;
  documentId: string;
  documentType: string;
  selectedLayout: string;
  xmlData?: any;
  danfePdfBase64: string | null;
  setDanfePdfBase64: (base64: string | null) => void;
  filename?: string;
}

const useDocumentOperations = ({
  layoutRef,
  danfeRef,
  simplifiedDanfeRef,
  documentId,
  documentType,
  selectedLayout,
  xmlData,
  danfePdfBase64,
  setDanfePdfBase64,
  filename = 'documento'
}: UseDocumentOperationsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  // Use the DANFE generator hook for DANFE operations
  const danfeOperations = useDANFEGenerator({
    xmlData,
    danfePdfBase64,
    setDanfePdfBase64,
    documentId,
    layoutType: selectedLayout === 'simplified' ? 'simplified' : 'danfe'
  });

  // Print function
  const handlePrint = async () => {
    setIsProcessing(true);
    try {
      let printWindow;

      if (selectedLayout === 'danfe' || selectedLayout === 'simplified') {
        // Handle DANFE printing
        await danfeOperations.handlePrint();
      } else {
        // Standard layout printing
        const printContent = layoutRef.current?.innerHTML;
        if (printContent) {
          printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(`
              <html>
                <head>
                  <title>Impressão ${documentType}</title>
                  <style>
                    body { font-family: Arial, sans-serif; }
                    /* Add more styles as needed */
                  </style>
                </head>
                <body>${printContent}</body>
              </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            // printWindow.close();
          }
        }
        
        toast({
          title: "Documento enviado para impressão",
          description: `O documento ${documentId} foi enviado para a impressora.`
        });
      }
    } catch (error) {
      console.error("Erro ao imprimir:", error);
      toast({
        title: "Erro na impressão",
        description: "Ocorreu um problema ao enviar para impressão.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Save function
  const handleSave = async () => {
    setIsProcessing(true);
    try {
      if (selectedLayout === 'danfe' || selectedLayout === 'simplified') {
        // Handle DANFE saving
        await danfeOperations.handleSave();
      } else {
        // Standard layout saving - using html2pdf or similar approach
        // This is a placeholder for actual implementation
        toast({
          title: "Documento salvo",
          description: `O ${documentType} foi salvo com sucesso.`,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um problema ao salvar o documento.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Email function
  const handleSendEmail = async (email: string): Promise<boolean> => {
    if (!email || !email.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um endereço de email válido.",
        variant: "destructive"
      });
      return false;
    }

    setIsProcessing(true);
    try {
      // Generate or get the PDF
      let pdfContent = null;
      
      if (selectedLayout === 'danfe' || selectedLayout === 'simplified') {
        // Use the DANFE generator to get PDF content
        pdfContent = await danfeOperations.generateDANFE();
      } else {
        // For standard layout, generate PDF from layout content
        // This is a placeholder for actual implementation
        // In a real scenario, you'd use a PDF generation library here
      }
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Email enviado",
        description: `O documento foi enviado para ${email}`,
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      toast({
        title: "Erro no envio",
        description: "Não foi possível enviar o email.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { handlePrint, handleSave, handleSendEmail, isProcessing };
};

export default useDocumentOperations;
