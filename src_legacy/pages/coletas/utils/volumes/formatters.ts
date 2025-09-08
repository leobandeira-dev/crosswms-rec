
// Format number for display
export const formatarNumero = (numero: number): string => {
  return numero.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
};

// Format weight for display
export const formatarPeso = (peso: number): string => {
  return peso.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Format currency for display
export const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Format percentage for display
export const formatarPorcentagem = (valor: number): string => {
  return `${(valor * 100).toFixed(2)}%`;
};
