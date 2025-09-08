
import { NotaFiscal } from '../../Faturamento';
import { CabecalhoValores, TotaisCalculados } from './types';

/**
 * Calcula os totais da viagem com base nos valores do cabeçalho e no peso total real
 */
export const calcularTotaisViagem = (
  cabecalhoValores: CabecalhoValores, 
  pesoTotalReal: number
): TotaisCalculados => {
  // Ensure we have valid numbers to work with (default to 0 if NaN)
  const pesoTotal = isNaN(pesoTotalReal) ? 0 : pesoTotalReal;
  const fretePorTonelada = isNaN(cabecalhoValores.fretePorTonelada) ? 0 : cabecalhoValores.fretePorTonelada;
  const pesoMinimo = isNaN(cabecalhoValores.pesoMinimo) ? 0 : cabecalhoValores.pesoMinimo;
  const aliquotaExpresso = isNaN(cabecalhoValores.aliquotaExpresso) ? 0 : cabecalhoValores.aliquotaExpresso;
  const aliquotaICMS = isNaN(cabecalhoValores.aliquotaICMS) ? 0 : cabecalhoValores.aliquotaICMS;
  const pedagio = isNaN(cabecalhoValores.pedagio) ? 0 : cabecalhoValores.pedagio;
  
  // Determine if we need to use minimum weight - using Math.max to ensure we use the greater value
  const pesoConsiderado = Math.max(pesoTotal, pesoMinimo);
  
  // Calcular frete peso viagem
  const fretePesoViagem = (fretePorTonelada / 1000) * pesoConsiderado;
  
  // Calcular pedagio viagem
  const pedagioViagem = pedagio;
  
  // Calcular expresso viagem
  const expressoViagem = fretePesoViagem * (aliquotaExpresso / 100);
  
  // Calcular ICMS viagem
  const baseCalculo = fretePesoViagem + pedagioViagem + expressoViagem;
  const icmsViagem = aliquotaICMS > 0 
    ? (baseCalculo / (100 - aliquotaICMS) * aliquotaICMS)
    : 0;
  
  // Calcular total viagem
  const totalViagem = fretePesoViagem + pedagioViagem + expressoViagem + icmsViagem;
  
  return {
    fretePesoViagem,
    pedagioViagem,
    expressoViagem,
    icmsViagem,
    totalViagem
  };
};

/**
 * Calcula o frete para cada nota fiscal baseado no rateio por peso
 */
export const calculateFreightPerInvoice = (
  notasToCalculate: NotaFiscal[], 
  cabecalhoValores: CabecalhoValores
): NotaFiscal[] => {
  if (notasToCalculate.length === 0) return [];
  
  // Calculate total real weight - ensure we have valid numbers
  const pesoTotalReal = notasToCalculate.reduce((sum, nota) => {
    const pesoNota = isNaN(Number(nota.pesoNota)) ? 0 : Number(nota.pesoNota);
    return sum + pesoNota;
  }, 0);
  
  // Determine considered weight as the greater between total weight and minimum weight
  const pesoMinimo = isNaN(Number(cabecalhoValores.pesoMinimo)) ? 0 : Number(cabecalhoValores.pesoMinimo);
  const pesoConsiderado = Math.max(pesoTotalReal, pesoMinimo);
  
  // Calculate totals
  const totaisViagem = calcularTotaisViagem(cabecalhoValores, pesoTotalReal);
  const {
    fretePesoViagem,
    pedagioViagem,
    expressoViagem,
    icmsViagem
  } = totaisViagem;
  
  // Calculate freight for each note
  return notasToCalculate.map(nota => {
    // Ensure peso nota is a valid number
    const pesoNota = isNaN(Number(nota.pesoNota)) ? 0 : Number(nota.pesoNota);
    
    // Calculate weight proportion for current note (prevent division by zero)
    const proporcaoPeso = pesoTotalReal > 0 ? pesoNota / pesoTotalReal : 0;
    
    // Calculate weight-based freight - rateio por peso
    const fretePeso = fretePesoViagem * proporcaoPeso;
    
    // Calculate express value - rateio por peso
    const valorExpresso = expressoViagem * proporcaoPeso;
    
    // Calculate pedagio - rateio por peso
    const pedagogioRateio = pedagioViagem * proporcaoPeso;
    
    // Get additional values from header
    const paletizacao = (cabecalhoValores.paletizacao || 0) * proporcaoPeso;
    const valorFreteTransferencia = (cabecalhoValores.valorFreteTransferencia || 0) * proporcaoPeso;
    const valorColeta = (cabecalhoValores.valorColeta || 0) * proporcaoPeso;
    
    // Calculate ICMS value - rateio por peso
    const icms = icmsViagem * proporcaoPeso;
    
    // Calculate total freight to be allocated
    const freteRatear = fretePeso + valorExpresso;
    
    // Calcular o total da prestação
    const totalPrestacao = fretePeso + valorExpresso + paletizacao + pedagogioRateio + icms;
    
    return {
      ...nota,
      fretePorTonelada: Number(cabecalhoValores.fretePorTonelada) || 0,
      pesoMinimo: Number(cabecalhoValores.pesoMinimo) || 0,
      aliquotaICMS: Number(cabecalhoValores.aliquotaICMS) || 0,
      aliquotaExpresso: Number(cabecalhoValores.aliquotaExpresso) || 0,
      valorFreteTransferencia: Number(valorFreteTransferencia) || 0,
      valorColeta: Number(valorColeta) || 0, 
      paletizacao: Number(paletizacao) || 0,
      pedagio: Number(pedagogioRateio) || 0,
      fretePeso: Number(fretePeso) || 0,
      valorExpresso: Number(valorExpresso) || 0,
      freteRatear: Number(freteRatear) || 0,
      icms: Number(icms) || 0,
      totalPrestacao: Number(totalPrestacao) || 0
    };
  });
};
