
import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface FormInitializerProps {
  form: UseFormReturn<any>;
  notaFiscalData: any;
  onInitialized?: () => void;
}

const FormInitializer: React.FC<FormInitializerProps> = ({ form, notaFiscalData, onInitialized }) => {
  useEffect(() => {
    // If nota fiscal data is provided, pre-fill the form
    if (notaFiscalData && (notaFiscalData.notaFiscal || notaFiscalData.numero_nota || notaFiscalData.chave_nota_fiscal)) {
      // Log all received data for debugging
      console.log("Nota fiscal data received:", notaFiscalData);
      
      // Set all the available data from the nota fiscal
      // Handle different field names for invoice number
      const invoiceNumber = notaFiscalData.notaFiscal || notaFiscalData.numero_nota || notaFiscalData.numeroNota || '';
      form.setValue('notaFiscal', invoiceNumber);
      
      // Set volumes total - check all possible field names
      if (notaFiscalData.volumesTotal) {
        console.log("Setting volumesTotal from notaFiscalData.volumesTotal:", notaFiscalData.volumesTotal);
        form.setValue('volumesTotal', String(notaFiscalData.volumesTotal).trim());
      } else if (notaFiscalData.volumesTotais) {
        console.log("Setting volumesTotal from notaFiscalData.volumesTotais:", notaFiscalData.volumesTotais);
        form.setValue('volumesTotal', String(notaFiscalData.volumesTotais).trim());
      } else if (notaFiscalData.quantidade_volumes) {
        console.log("Setting volumesTotal from notaFiscalData.quantidade_volumes:", notaFiscalData.quantidade_volumes);
        form.setValue('volumesTotal', String(notaFiscalData.quantidade_volumes).trim());
      } else if (notaFiscalData.volumes_totais) {
        console.log("Setting volumesTotal from notaFiscalData.volumes_totais:", notaFiscalData.volumes_totais);
        form.setValue('volumesTotal', String(notaFiscalData.volumes_totais).trim());
      } else {
        // Set default volume count of 1 if not specified
        form.setValue('volumesTotal', '1');
      }
      
      // Set peso total - check different field names
      const pesoTotal = notaFiscalData.pesoTotal || 
                       notaFiscalData.peso_total_bruto || 
                       notaFiscalData.peso_bruto || 
                       notaFiscalData.pesoTotalBruto || '';
      form.setValue('pesoTotalBruto', pesoTotal);
      
      // If volumes total is provided, automatically generate volumes
      const volumeCount = notaFiscalData.volumesTotal || 
                         notaFiscalData.volumesTotais || 
                         notaFiscalData.quantidade_volumes || 
                         notaFiscalData.volumes_totais || 
                         1;
      if (volumeCount && parseInt(String(volumeCount)) > 0) {
        setTimeout(() => {
          if (onInitialized) onInitialized();
        }, 300);
      }
    }
  }, [notaFiscalData, form, onInitialized]);
  
  return null; // This component doesn't render anything
};

export default FormInitializer;
