
// usePDFGenerator.ts
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { EtiquetaFormat } from './types';

export const usePDFGenerator = () => {
  // Generate a PDF from HTML content
  const generatePDF = async (htmlContent: string[], formato: EtiquetaFormat, fileName: string) => {
    try {
      // Create temporary element for rendering
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);
      
      // Add HTML content
      tempDiv.innerHTML = htmlContent.join('');
      
      // Set PDF orientation
      const orientation = formato.width > formato.height ? 'landscape' : 'portrait';
      const unit = formato.unit as "pt" | "mm" | "cm" | "in" | "px" | "pc" | "em" | "ex";
      
      const pdf = new jsPDF({
        orientation,
        unit,
        format: [formato.width, formato.height]
      });
      
      // Create PDF pages for each element
      for (let i = 0; i < htmlContent.length; i++) {
        const etiquetaElement = tempDiv.children[i] as HTMLElement;
        
        if (i > 0) pdf.addPage();
        
        const canvas = await html2canvas(etiquetaElement, {
          scale: 2,
          logging: false,
          useCORS: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, formato.width, formato.height);
      }
      
      // Save PDF
      pdf.save(fileName);
      
      // Clean up temporary element
      document.body.removeChild(tempDiv);
      
      return fileName;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  return { generatePDF };
};
