
import { toast } from '@/hooks/use-toast';
import { NotaFiscal } from '../../../Faturamento';
import { CabecalhoValores } from '../types';
import { calculateFreightPerInvoice } from '../calculationUtils';

/**
 * Handles recalculating all invoices
 */
export const createRecalculateHandler = (
  notas: NotaFiscal[],
  setNotas: React.Dispatch<React.SetStateAction<NotaFiscal[]>>,
  cabecalhoValores: CabecalhoValores
) => {
  return () => {
    if (notas.length > 0) {
      try {
        // Ensure all notes have valid numeric values
        const sanitizedNotas = notas.map(nota => ({
          ...nota,
          pesoNota: isNaN(Number(nota.pesoNota)) ? 0 : Number(nota.pesoNota)
        }));
        
        const notasCalculated = calculateFreightPerInvoice(sanitizedNotas, cabecalhoValores);
        setNotas(notasCalculated);
        
        toast({
          title: "Frete recalculado",
          description: "Valores de frete foram recalculados e rateados com sucesso."
        });
      } catch (error) {
        console.error("Erro ao recalcular frete:", error);
        toast({
          title: "Erro ao recalcular frete",
          description: "Verifique se todos os parâmetros foram preenchidos corretamente.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Nenhuma nota fiscal disponível",
        description: "Adicione notas fiscais antes de recalcular o frete.",
        variant: "destructive"
      });
    }
  };
};
