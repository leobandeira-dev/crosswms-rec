
/**
 * Format CNPJ number with proper mask (XX.XXX.XXX/XXXX-XX)
 */
export const formatCNPJ = (cnpj: string): string => {
  if (!cnpj) return '';
  
  // Remove non-numeric characters
  const numericOnly = cnpj.replace(/\D/g, '');
  
  // Pad with zeros if necessary
  const paddedCnpj = numericOnly.padStart(14, '0');
  
  // Format as XX.XXX.XXX/XXXX-XX
  return paddedCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

/**
 * Format date from ISO (YYYY-MM-DD) to localized format (DD/MM/YYYY)
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  
  try {
    // Handle both ISO format and timestamp formats
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn("Invalid date format:", dateStr);
      return dateStr;
    }
    
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateStr;
  }
};

/**
 * Format currency values with Brazilian formatting (R$ X.XXX,XX)
 */
export const formatCurrency = (value: string | number): string => {
  if (value === undefined || value === null) return 'R$ 0,00';
  
  try {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(numValue);
  } catch (error) {
    console.error("Error formatting currency:", error);
    return 'R$ 0,00';
  }
};

/**
 * Format number with Brazilian formatting (X.XXX,XX)
 * Used for quantity and value formatting in DANFE
 */
export const formatNumber = (value: string | number, preserveDecimals: boolean = false): string => {
  if (value === undefined || value === null) return '0,00';
  
  try {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // If preserveDecimals is true, use maximumFractionDigits of 6 to show all decimals
    if (preserveDecimals) {
      // Create formatted string first
      const formatted = numValue.toString().replace('.', ',');
      
      // Check if we need to add trailing zeros to preserve format
      const decimalPart = formatted.split(',')[1] || '';
      if (decimalPart.length < 3 && decimalPart.length > 0) {
        return formatted.padEnd(formatted.length + (3 - decimalPart.length), '0');
      }
      return formatted;
    }
    
    return new Intl.NumberFormat('pt-BR', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(numValue);
  } catch (error) {
    console.error("Error formatting number:", error);
    return '0,00';
  }
};
