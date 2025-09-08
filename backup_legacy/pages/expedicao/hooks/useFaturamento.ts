import { useState, useEffect } from 'react';
import { NotaFiscal } from '../Faturamento';
import { calcularTotaisViagem, calculateFreightPerInvoice } from './faturamento/calculationUtils';
import { createNotaFiscalHandlers } from './faturamento/handlers';
import { CabecalhoValores, TotaisCalculados } from './faturamento/types';
import { toast } from '@/hooks/use-toast';

export const useFaturamento = () => {
  const [notas, setNotas] = useState<NotaFiscal[]>([]);
  const [activeTab, setActiveTab] = useState("notas");
  const [ordemCarregamentoId, setOrdemCarregamentoId] = useState<string | null>(null);
  
  // Estado para os valores de cabeçalho
  const [cabecalhoValores, setCabecalhoValores] = useState<CabecalhoValores>({
    fretePorTonelada: 0,
    pesoMinimo: 0,
    aliquotaICMS: 0,
    aliquotaExpresso: 0,
    valorFreteTransferencia: 0,
    valorColeta: 0,
    paletizacao: 0,
    pedagio: 0,
  });
  
  // Estado para os totais calculados
  const [totaisCalculados, setTotaisCalculados] = useState<TotaisCalculados>({
    fretePesoViagem: 0,
    pedagioViagem: 0,
    expressoViagem: 0,
    icmsViagem: 0,
    totalViagem: 0
  });

  // Calcular totais sempre que o cabeçalho ou as notas mudam
  useEffect(() => {
    calcularTotais();
  }, [cabecalhoValores, notas]);

  const calcularTotais = () => {
    // Calculate total real weight, ensuring we have valid numbers
    const pesoTotalReal = notas.reduce((sum, nota) => {
      const peso = isNaN(Number(nota.pesoNota)) ? 0 : Number(nota.pesoNota);
      return sum + peso;
    }, 0);
    
    // Calculate totals using the utility function
    const totais = calcularTotaisViagem(cabecalhoValores, pesoTotalReal);
    
    // Update state with calculated totals
    setTotaisCalculados(totais);
  };

  // Handle the rateio of values to each nota fiscal
  const handleRatear = () => {
    if (notas.length > 0) {
      try {
        const sanitizedNotas = notas.map(nota => ({
          ...nota,
          pesoNota: isNaN(Number(nota.pesoNota)) ? 0 : Number(nota.pesoNota)
        }));
        
        const notasCalculated = calculateFreightPerInvoice(sanitizedNotas, cabecalhoValores);
        setNotas(notasCalculated);
        
        // Force recalculation of totals
        calcularTotais();
        
        toast({
          title: "Valores rateados com sucesso",
          description: "Os valores foram rateados entre todas as notas fiscais."
        });
      } catch (error) {
        console.error("Erro ao ratear valores:", error);
        toast({
          title: "Erro ao ratear valores",
          description: "Ocorreu um erro ao calcular o rateio. Verifique os valores informados.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Nenhuma nota fiscal disponível",
        description: "Adicione notas fiscais antes de ratear valores.",
        variant: "destructive"
      });
    }
  };

  // Create all nota fiscal handlers using the refactored handlers utility
  const handlers = createNotaFiscalHandlers(
    notas,
    setNotas,
    setActiveTab,
    cabecalhoValores,
    setOrdemCarregamentoId,
    totaisCalculados
  );

  // Implement the handleUpdateCabecalho handler here since it needs to update state
  const handleUpdateCabecalho = (values: CabecalhoValores) => {
    // Ensure all numeric values are valid numbers
    const sanitizedValues: CabecalhoValores = {
      fretePorTonelada: isNaN(Number(values.fretePorTonelada)) ? 0 : Number(values.fretePorTonelada),
      pesoMinimo: isNaN(Number(values.pesoMinimo)) ? 0 : Number(values.pesoMinimo),
      aliquotaICMS: isNaN(Number(values.aliquotaICMS)) ? 0 : Number(values.aliquotaICMS),
      aliquotaExpresso: isNaN(Number(values.aliquotaExpresso)) ? 0 : Number(values.aliquotaExpresso),
      valorFreteTransferencia: isNaN(Number(values.valorFreteTransferencia)) ? 0 : Number(values.valorFreteTransferencia),
      valorColeta: isNaN(Number(values.valorColeta)) ? 0 : Number(values.valorColeta),
      paletizacao: isNaN(Number(values.paletizacao)) ? 0 : Number(values.paletizacao),
      pedagio: isNaN(Number(values.pedagio)) ? 0 : Number(values.pedagio),
    };
    
    setCabecalhoValores(sanitizedValues);
    
    toast({
      title: "Parâmetros atualizados",
      description: "Clique em 'Ratear Valores' para aplicar às notas fiscais."
    });
  };

  return {
    notas,
    activeTab,
    cabecalhoValores,
    totaisCalculados,
    ordemCarregamentoId,
    setActiveTab,
    handleAddNotaFiscal: handlers.handleAddNotaFiscal,
    handleDeleteNotaFiscal: handlers.handleDeleteNotaFiscal,
    handleRecalculate: handlers.handleRecalculate,
    handleImportarLote: handlers.handleImportarLote,
    handleImportarNotasOrdemCarregamento: handlers.handleImportarNotasOrdemCarregamento,
    handleUpdateCabecalho,
    handleExportToPDF: handlers.handleExportToPDF,
    handleRatear,
  };
};
