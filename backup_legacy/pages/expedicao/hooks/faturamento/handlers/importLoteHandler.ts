
import { toast } from '@/hooks/use-toast';
import { NotaFiscal } from '../../../Faturamento';
import { CabecalhoValores } from '../types';
import { calculateFreightPerInvoice } from '../calculationUtils';

/**
 * Handles importing a batch of invoices
 */
export const createImportLoteHandler = (
  notas: NotaFiscal[],
  setNotas: React.Dispatch<React.SetStateAction<NotaFiscal[]>>,
  setActiveTab: React.Dispatch<React.SetStateAction<string>>,
  cabecalhoValores: CabecalhoValores
) => {
  return (notasLote: Omit<NotaFiscal, 'id' | 'fretePeso' | 'valorExpresso' | 'freteRatear'>[]) => {
    if (notasLote.length === 0) return;
    
    try {
      // Generate IDs for new notes and ensure numeric values are valid
      const notasComId = notasLote.map(nota => ({
        ...nota,
        id: `NF-${Math.random().toString(36).substr(2, 9)}`,
        pesoNota: isNaN(Number(nota.pesoNota)) ? 0 : Number(nota.pesoNota)
      }));
      
      // Combine with existing notes
      const updatedNotas = [...notas, ...notasComId];
      
      // Calculate freight
      const notasCalculated = calculateFreightPerInvoice(updatedNotas, cabecalhoValores);
      setNotas(notasCalculated);
      
      toast({
        title: "Notas fiscais importadas com sucesso",
        description: `${notasLote.length} notas fiscais foram adicionadas ao sistema.`
      });
      
      // Switch to notes tab to show the imported items
      setActiveTab("notas");
    } catch (error) {
      console.error("Erro ao importar lote:", error);
      toast({
        title: "Erro ao importar lote",
        description: "Verifique os dados das notas fiscais e tente novamente.",
        variant: "destructive"
      });
    }
  };
};
