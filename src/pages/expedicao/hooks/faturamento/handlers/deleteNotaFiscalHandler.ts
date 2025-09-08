
import { toast } from '@/hooks/use-toast';
import { NotaFiscal } from '../../../Faturamento';
import { CabecalhoValores } from '../types';
import { calculateFreightPerInvoice } from '../calculationUtils';

/**
 * Handles deleting an invoice from the list
 */
export const createDeleteNotaFiscalHandler = (
  notas: NotaFiscal[],
  setNotas: React.Dispatch<React.SetStateAction<NotaFiscal[]>>,
  cabecalhoValores: CabecalhoValores
) => {
  return (id: string) => {
    const updatedNotas = notas.filter(nota => nota.id !== id);
    
    // If there are still notes, recalculate
    if (updatedNotas.length > 0) {
      const notasCalculated = calculateFreightPerInvoice(updatedNotas, cabecalhoValores);
      setNotas(notasCalculated);
    } else {
      setNotas([]);
    }
    
    toast({
      title: "Nota fiscal removida",
      description: "A nota fiscal foi removida com sucesso."
    });
  };
};
