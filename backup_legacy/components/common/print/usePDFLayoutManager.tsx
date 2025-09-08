
import React from 'react';
import { jsPDF } from 'jspdf';

/**
 * Hook for managing PDF layouts, especially multi-page documents
 */
export const usePDFLayoutManager = () => {
  /**
   * Handles slicing and rendering content across multiple PDF pages
   */
  const handleMultiPageLayout = async (
    canvas: HTMLCanvasElement,
    pdf: jsPDF,
    margin: number,
    initialYPosition: number,
    availableWidth: number,
    scaleFactor: number,
    maxHeightPerPage: number,
    pdfHeight: number
  ) => {
    let remainingHeight = canvas.height;
    let sourceY = 0;
    let currentPage = 0;
    
    while (remainingHeight > 0) {
      // Calculate height for this page in canvas space
      const pageHeightInCanvasSpace = currentPage === 0
        ? (maxHeightPerPage / scaleFactor)
        : ((pdfHeight - margin * 2) / scaleFactor);
      
      // Create a temporary canvas for the slice
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = Math.min(pageHeightInCanvasSpace, remainingHeight);
      
      // Draw the slice to the temporary canvas
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          canvas,
          0, sourceY, canvas.width, tempCanvas.height,
          0, 0, canvas.width, tempCanvas.height
        );
        
        // Calculate this slice dimensions in PDF space
        const sliceHeightInPDF = tempCanvas.height * scaleFactor;
        const currentYPosition = currentPage === 0 ? initialYPosition : margin;
        
        console.log(`Adicionando página ${currentPage + 1}:`, {
          height: tempCanvas.height,
          y: sourceY,
          pdfY: currentYPosition
        });
        
        // Add the slice to the PDF
        pdf.addImage(
          tempCanvas.toDataURL('image/jpeg', 1.0),
          'JPEG',
          margin,
          currentYPosition,
          availableWidth,
          sliceHeightInPDF
        );
        
        // Update for next page
        sourceY += tempCanvas.height;
        remainingHeight -= tempCanvas.height;
        
        // Add a new page if needed
        if (remainingHeight > 0) {
          pdf.addPage();
          currentPage++;
        }
      }
    }
  }

  return { handleMultiPageLayout };
}
