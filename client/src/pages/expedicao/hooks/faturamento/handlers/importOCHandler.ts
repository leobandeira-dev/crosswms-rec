
import { toast } from '@/hooks/use-toast';
import { NotaFiscal } from '../../../Faturamento';
import { CabecalhoValores, ImportacaoOCParams } from '../types';
import { calculateFreightPerInvoice } from '../calculationUtils';

/**
 * Handles importing invoices from a loading order
 */
export const createImportOCHandler = (
  notas: NotaFiscal[],
  setNotas: React.Dispatch<React.SetStateAction<NotaFiscal[]>>,
  setActiveTab: React.Dispatch<React.SetStateAction<string>>,
  cabecalhoValores: CabecalhoValores,
  setOrdemCarregamentoId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  return ({ notasOC, ocId }: ImportacaoOCParams) => {
    if (notasOC.length === 0) return;
    
    try {
      // Map OC invoices to our invoice format
      const notasParaImportar = notasOC.map(notaOC => {
        const dataEmissao = new Date(notaOC.dataEmissao);
        const pesoBruto = isNaN(Number(notaOC.pesoBruto)) ? 0 : Number(notaOC.pesoBruto);
        const valor = isNaN(Number(notaOC.valor)) ? 0 : Number(notaOC.valor);
        
        return {
          id: `NF-${Math.random().toString(36).substr(2, 9)}`,
          data: new Date(),
          cliente: notaOC.cliente || '',
          remetente: notaOC.remetente || '',
          notaFiscal: notaOC.numero || '',
          pedido: notaOC.pedido || '',
          dataEmissao: dataEmissao,
          pesoNota: pesoBruto,
          valorNF: valor,
          fretePorTonelada: Number(cabecalhoValores.fretePorTonelada) || 0,
          pesoMinimo: Number(cabecalhoValores.pesoMinimo) || 0,
          valorFreteTransferencia: 0,
          cteColeta: '',
          valorColeta: 0,
          cteTransferencia: '',
          paletizacao: 0,
          pedagio: 0,
          aliquotaICMS: Number(cabecalhoValores.aliquotaICMS) || 0,
          aliquotaExpresso: Number(cabecalhoValores.aliquotaExpresso) || 0,
          fretePeso: 0,
          valorExpresso: 0,
          freteRatear: 0,
          icms: 0,
          totalPrestacao: 0
        } as NotaFiscal;
      });
      
      // Combine with existing notes
      const updatedNotas = [...notas, ...notasParaImportar];
      
      // Calculate freight with header values
      const notasCalculated = calculateFreightPerInvoice(updatedNotas, cabecalhoValores);
      setNotas(notasCalculated);
      
      // Set the load order ID
      setOrdemCarregamentoId(ocId);
      
      toast({
        title: "Notas fiscais importadas da OC",
        description: `${notasParaImportar.length} notas fiscais foram importadas da OC ${ocId}.`
      });
      
      // Switch to notes tab to show the imported items
      setActiveTab("notas");
    } catch (error) {
      console.error("Erro ao importar notas da OC:", error);
      toast({
        title: "Erro ao importar notas da OC",
        description: "Verifique os dados das notas fiscais da OC e tente novamente.",
        variant: "destructive"
      });
    }
  };
};
