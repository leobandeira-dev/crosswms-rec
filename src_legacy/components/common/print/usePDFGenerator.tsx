
import React from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from "@/hooks/use-toast";
import { usePDFLayoutManager } from './usePDFLayoutManager';
import { handlePDFError } from './pdfErrorHandler';

/**
 * Hook for PDF generation functionality
 */
export const usePDFGenerator = (
  layoutRef: React.RefObject<HTMLDivElement>,
  documentId: string,
  documentType: string
) => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { handleMultiPageLayout } = usePDFLayoutManager();

  const generatePDF = async (options?: { isDANFE?: boolean }) => {
    if (!layoutRef.current) {
      toast({
        title: "Erro",
        description: "Conteúdo não encontrado para gerar PDF.",
        variant: "destructive"
      });
      return null;
    }

    setIsGenerating(true);
    try {
      // Wait for all images and resources to load fully
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log("Iniciando geração do PDF para:", documentType, documentId);
      console.log("Referência do elemento:", layoutRef.current);
      
      // Capture the content with higher quality settings
      const canvas = await html2canvas(layoutRef.current, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        logging: true, // Enable logging for debugging
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Make sure the cloned document is visible for rendering
          const clonedElement = clonedDoc.querySelector('[data-html2canvas-clone="true"]');
          if (clonedElement) {
            console.log("Elemento clonado encontrado e preparado para renderização");
            (clonedElement as HTMLElement).style.display = "block";
            (clonedElement as HTMLElement).style.visibility = "visible";
            (clonedElement as HTMLElement).style.position = "absolute";
            (clonedElement as HTMLElement).style.top = "0";
            (clonedElement as HTMLElement).style.left = "0";
          }
        }
      });
      
      console.log("Canvas gerado com dimensões:", canvas.width, "x", canvas.height);
      
      // Set up PDF with appropriate orientation
      const isLandscape = canvas.width > canvas.height;
      const pdf = new jsPDF({
        orientation: isLandscape ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });
      
      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate margins and available space
      const margin = 10;
      const availableWidth = pdfWidth - (2 * margin);
      
      // Calculate scaling factors
      const scaleFactor = availableWidth / canvas.width;
      const scaledHeight = canvas.height * scaleFactor;
      
      // Add title if not a DANFE document
      let yPosition = margin;
      if (!options?.isDANFE) {
        pdf.setFontSize(14);
        pdf.text(`${documentType} - ${documentId}`, margin, yPosition);
        yPosition += 10;
      }
      
      // Handle multi-page rendering if needed
      const contentHeight = scaledHeight;
      const maxHeightPerPage = pdfHeight - margin * 2 - (yPosition - margin);
      
      if (contentHeight <= maxHeightPerPage) {
        // Content fits on a single page
        console.log("Conteúdo cabe em uma única página");
        pdf.addImage(
          canvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          margin,
          yPosition,
          availableWidth,
          scaledHeight
        );
      } else {
        // Content needs multiple pages
        console.log("Conteúdo requer múltiplas páginas");
        await handleMultiPageLayout(canvas, pdf, margin, yPosition, availableWidth, scaleFactor, maxHeightPerPage, pdfHeight);
      }
      
      console.log("PDF gerado com sucesso");
      return pdf;
      
    } catch (error) {
      return handlePDFError(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePDF, isGenerating };
};
