
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { toast } from "@/hooks/use-toast";

interface ExportOptions {
  title: string;
  fileName: string;
  element?: HTMLElement;
  data?: any[];
}

/**
 * Utility functions for exporting reports in different formats
 */
export const reportExport = {
  /**
   * Export report data to Excel (XLSX) format
   */
  toExcel: (options: ExportOptions) => {
    try {
      if (!options.data || options.data.length === 0) {
        toast({
          title: "Erro ao exportar",
          description: "Não há dados para exportar",
          variant: "destructive"
        });
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(options.data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, options.title);
      
      // Generate file name with date
      const fileName = `${options.fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Create and download the file
      XLSX.writeFile(workbook, fileName);
      
      toast({
        title: "Exportação concluída",
        description: `Relatório exportado como ${fileName}`,
      });
    } catch (error) {
      console.error("Erro ao exportar para Excel:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o relatório para Excel",
        variant: "destructive"
      });
    }
  },

  /**
   * Export report to PDF format using html2canvas and jsPDF
   */
  toPDF: async (options: ExportOptions) => {
    try {
      if (!options.element) {
        toast({
          title: "Erro ao exportar",
          description: "Elemento não encontrado para exportação",
          variant: "destructive"
        });
        return;
      }

      // Show loading toast
      toast({
        title: "Gerando PDF",
        description: "Por favor, aguarde...",
      });

      // Generate file name with date
      const fileName = `${options.fileName}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Convert HTML element to canvas
      const canvas = await html2canvas(options.element, {
        scale: 2, // Better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Determine PDF orientation based on dimensions
      const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
      
      // Create PDF document
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add image to PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Save PDF
      pdf.save(fileName);
      
      toast({
        title: "Exportação concluída",
        description: `Relatório exportado como ${fileName}`,
      });
    } catch (error) {
      console.error("Erro ao exportar para PDF:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o relatório para PDF",
        variant: "destructive"
      });
    }
  },

  /**
   * Print the report directly
   */
  print: (options: ExportOptions) => {
    try {
      if (!options.element) {
        toast({
          title: "Erro ao imprimir",
          description: "Elemento não encontrado para impressão",
          variant: "destructive"
        });
        return;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Erro ao imprimir",
          description: "Bloqueador de pop-ups pode estar ativado",
          variant: "destructive"
        });
        return;
      }

      // Get styles from parent page to apply to print window
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('\n');
          } catch (e) {
            return '';
          }
        })
        .join('\n');

      // Clone the element and prepare for printing
      const elementHtml = options.element.outerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${options.title}</title>
            <style>${styles}</style>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              @media print {
                body { padding: 0; }
                button, .no-print { display: none !important; }
              }
            </style>
          </head>
          <body>
            <h1>${options.title}</h1>
            <div>${elementHtml}</div>
            <script>
              setTimeout(() => {
                window.print();
                setTimeout(() => window.close(), 500);
              }, 500);
            </script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
      
      toast({
        title: "Impressão iniciada",
        description: "O relatório foi enviado para impressão",
      });
    } catch (error) {
      console.error("Erro ao imprimir:", error);
      toast({
        title: "Erro ao imprimir",
        description: "Não foi possível imprimir o relatório",
        variant: "destructive"
      });
    }
  }
};
