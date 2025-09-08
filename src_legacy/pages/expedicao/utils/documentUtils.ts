
/**
 * Gera um número de documento no formato DDMMAA-X
 * onde X é um sequencial diário
 * 
 * @param date Data para geração do número
 * @param sequence Número sequencial do dia
 * @returns Número do documento formatado
 */
export const generateDocumentNumber = (date: Date, sequence: number): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString().slice(-2);
  
  return `${day}${month}${year}-${sequence}`;
};

/**
 * Obtém a data a partir de um número de documento
 * 
 * @param documentNumber Número do documento no formato DDMMAA-X
 * @returns Data extraída do número do documento
 */
export const getDateFromDocumentNumber = (documentNumber: string): Date | null => {
  if (!documentNumber || !documentNumber.includes('-')) return null;
  
  const dateStr = documentNumber.split('-')[0];
  if (dateStr.length !== 6) return null;
  
  const day = parseInt(dateStr.substring(0, 2));
  const month = parseInt(dateStr.substring(2, 4)) - 1;
  const year = parseInt(`20${dateStr.substring(4, 6)}`);
  
  const date = new Date(year, month, day);
  return isNaN(date.getTime()) ? null : date;
};
