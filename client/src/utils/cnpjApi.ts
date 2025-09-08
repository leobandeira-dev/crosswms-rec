import { useState } from 'react';

/**
 * CNPJ API Integration
 * 
 * Integrates with Brazilian public APIs to fetch company data by CNPJ
 * Uses ReceitaWS and BrasilAPI as fallback options
 */

export interface CNPJData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  situacao: string;
}

export interface CNPJResponse {
  success: boolean;
  data?: CNPJData;
  error?: string;
  source?: string;
}

/**
 * Formats CNPJ string to XX.XXX.XXX/XXXX-XX format
 */
export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '');
  if (clean.length !== 14) return cnpj;
  return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/**
 * Removes CNPJ formatting to get clean numeric string
 */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Validates CNPJ format and checksum
 */
export function validateCNPJ(cnpj: string): boolean {
  const clean = cleanCNPJ(cnpj);
  
  if (clean.length !== 14) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1{13}$/.test(clean)) return false;
  
  // Calculate first check digit
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let checkDigit1 = sum % 11;
  checkDigit1 = checkDigit1 < 2 ? 0 : 11 - checkDigit1;
  
  if (parseInt(clean[12]) !== checkDigit1) return false;
  
  // Calculate second check digit
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(clean[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let checkDigit2 = sum % 11;
  checkDigit2 = checkDigit2 < 2 ? 0 : 11 - checkDigit2;
  
  return parseInt(clean[13]) === checkDigit2;
}

/**
 * Fetches company data from ReceitaWS API with CORS proxy
 */
async function fetchFromReceitaWS(cnpj: string): Promise<CNPJResponse> {
  try {
    const cleanCnpj = cleanCNPJ(cnpj);
    // Use CORS proxy to avoid CORS issues
    const response = await fetch(`https://cors-anywhere.herokuapp.com/https://www.receitaws.com.br/v1/cnpj/${cleanCnpj}`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'ERROR') {
      throw new Error(data.message || 'CNPJ não encontrado');
    }
    
    return {
      success: true,
      source: 'ReceitaWS',
      data: {
        cnpj: formatCNPJ(data.cnpj),
        razaoSocial: data.nome || '',
        nomeFantasia: data.fantasia || '',
        endereco: data.logradouro || '',
        numero: data.numero || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        cidade: data.municipio || '',
        uf: data.uf || '',
        cep: data.cep ? data.cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2') : '',
        telefone: data.telefone || '',
        email: data.email || '',
        situacao: data.situacao || ''
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro na consulta ReceitaWS',
      source: 'ReceitaWS'
    };
  }
}

/**
 * Fetches company data from BrasilAPI
 */
async function fetchFromBrasilAPI(cnpj: string): Promise<CNPJResponse> {
  try {
    const cleanCnpj = cleanCNPJ(cnpj);
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      source: 'BrasilAPI',
      data: {
        cnpj: formatCNPJ(data.cnpj),
        razaoSocial: data.razao_social || '',
        nomeFantasia: data.nome_fantasia || '',
        endereco: data.logradouro || '',
        numero: data.numero || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        cidade: data.municipio || '',
        uf: data.uf || '',
        cep: data.cep ? data.cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2') : '',
        telefone: data.ddd_telefone_1 || '',
        email: data.email || '',
        situacao: data.descricao_situacao_cadastral || ''
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro na consulta BrasilAPI',
      source: 'BrasilAPI'
    };
  }
}

/**
 * Fetches company data by CNPJ using BrasilAPI (CORS-friendly)
 */
export async function fetchCNPJData(cnpj: string): Promise<CNPJResponse> {
  const cleanCnpj = cleanCNPJ(cnpj);
  
  // Validate CNPJ format
  if (!validateCNPJ(cleanCnpj)) {
    return {
      success: false,
      error: 'CNPJ inválido'
    };
  }
  
  // Use BrasilAPI as primary source (no CORS issues)
  const result = await fetchFromBrasilAPI(cleanCnpj);
  if (result.success) {
    return result;
  }
  
  // If BrasilAPI fails, try a fallback with limited data
  return {
    success: false,
    error: result.error || 'Não foi possível consultar o CNPJ. Verifique se o número está correto.'
  };
}

/**
 * Hook for CNPJ input with auto-formatting
 */
export function useCNPJInput(onCNPJFound?: (data: CNPJData) => void) {
  const [value, setValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (inputValue: string) => {
    // Auto-format CNPJ
    const formatted = formatCNPJ(inputValue);
    setValue(formatted);
    setError(null);
    
    // Auto-fetch when CNPJ is complete
    const clean = cleanCNPJ(inputValue);
    if (clean.length === 14) {
      handleFetch(clean);
    }
  };
  
  const handleFetch = async (cnpj: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchCNPJData(cnpj);
      
      if (result.success && result.data) {
        onCNPJFound?.(result.data);
      } else {
        setError(result.error || 'Erro na consulta');
      }
    } catch (err) {
      setError('Erro na conexão');
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    value,
    setValue,
    handleChange,
    isLoading,
    error,
    handleFetch: () => handleFetch(cleanCNPJ(value))
  };
}