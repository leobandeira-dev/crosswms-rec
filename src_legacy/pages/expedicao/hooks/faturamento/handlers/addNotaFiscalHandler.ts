
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { NotaFiscal } from '../../../Faturamento';
import { CabecalhoValores } from '../types';
import { calculateFreightPerInvoice } from '../calculationUtils';

/**
 * Handles adding a new invoice to the list
 */
export const createAddNotaFiscalHandler = (
  notas: NotaFiscal[],
  setNotas: React.Dispatch<React.SetStateAction<NotaFiscal[]>>,
  cabecalhoValores: CabecalhoValores
) => {
  return (nota: Omit<NotaFiscal, 'id' | 'fretePeso' | 'valorExpresso' | 'freteRatear'>) => {
    try {
      // Ensure pesoNota is a valid number
      const pesoNota = isNaN(Number(nota.pesoNota)) ? 0 : Number(nota.pesoNota);
      
      const newNota: NotaFiscal = {
        ...nota,
        id: `NF-${Math.random().toString(36).substr(2, 9)}`,
        pesoNota: pesoNota
      };
      
      const updatedNotas = [...notas, newNota];
      
      // If there are notes, calculate freight
      if (updatedNotas.length > 0) {
        const notasCalculated = calculateFreightPerInvoice(updatedNotas, cabecalhoValores);
        setNotas(notasCalculated);
        
        toast({
          title: "Nota fiscal adicionada com sucesso",
          description: `Nota para ${nota.cliente} em ${format(nota.data, 'dd/MM/yyyy')} adicionada.`
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar nota fiscal:", error);
      toast({
        title: "Erro ao adicionar nota fiscal",
        description: "Verifique se todos os campos estão preenchidos corretamente.",
        variant: "destructive"
      });
    }
  };
};
