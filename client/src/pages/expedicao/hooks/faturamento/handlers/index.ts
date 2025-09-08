
import { createAddNotaFiscalHandler } from './addNotaFiscalHandler';
import { createDeleteNotaFiscalHandler } from './deleteNotaFiscalHandler';
import { createRecalculateHandler } from './recalculateHandler';
import { createImportLoteHandler } from './importLoteHandler';
import { createImportOCHandler } from './importOCHandler';
import { createExportToPDFHandler } from './exportToPDFHandler';
import { NotaFiscal } from '../../../Faturamento';
import { CabecalhoValores, TotaisCalculados } from '../types';

/**
 * Creates handlers for nota fiscal operations
 */
export const createNotaFiscalHandlers = (
  notas: NotaFiscal[],
  setNotas: React.Dispatch<React.SetStateAction<NotaFiscal[]>>,
  setActiveTab: React.Dispatch<React.SetStateAction<string>>,
  cabecalhoValores: CabecalhoValores,
  setOrdemCarregamentoId: React.Dispatch<React.SetStateAction<string | null>>,
  totaisCalculados: TotaisCalculados
) => {
  // Create individual handlers
  const handleAddNotaFiscal = createAddNotaFiscalHandler(notas, setNotas, cabecalhoValores);
  const handleDeleteNotaFiscal = createDeleteNotaFiscalHandler(notas, setNotas, cabecalhoValores);
  const handleRecalculate = createRecalculateHandler(notas, setNotas, cabecalhoValores);
  const handleImportarLote = createImportLoteHandler(notas, setNotas, setActiveTab, cabecalhoValores);
  const handleImportarNotasOrdemCarregamento = createImportOCHandler(
    notas, 
    setNotas, 
    setActiveTab, 
    cabecalhoValores, 
    setOrdemCarregamentoId
  );
  const handleExportToPDF = createExportToPDFHandler(notas, cabecalhoValores, totaisCalculados);

  // Return all handlers
  return {
    handleAddNotaFiscal,
    handleDeleteNotaFiscal,
    handleRecalculate,
    handleImportarLote,
    handleImportarNotasOrdemCarregamento,
    handleExportToPDF,
  };
};
