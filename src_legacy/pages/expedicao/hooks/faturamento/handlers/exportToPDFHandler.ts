
import { toast } from '@/hooks/use-toast';
import { NotaFiscal } from '../../../Faturamento';
import { TotaisCalculados } from '../types';

/**
 * Handles exporting to PDF functionality
 */
export const createExportToPDFHandler = (
  notas: NotaFiscal[],
  cabecalhoValores: any,
  totaisCalculados: TotaisCalculados
) => {
  return () => {
    if (notas.length === 0) {
      toast({
        title: "Nenhuma nota fiscal disponível",
        description: "Adicione notas fiscais antes de exportar para PDF."
      });
      return;
    }
    
    // Mudança para navegar para a aba documentos
    const tabElement = document.querySelector('button[value="documentos"]');
    if (tabElement) {
      (tabElement as HTMLElement).click();
      
      toast({
        title: "Preencha as informações do documento",
        description: "Complete o formulário de informações do documento para gerar o PDF."
      });
    } else {
      // Fallback para o método antigo se o botão não for encontrado
      document.dispatchEvent(new CustomEvent('openDocumentDialog', {
        detail: {
          notas,
          cabecalhoValores,
          totaisCalculados
        }
      }));
    }
  };
};
