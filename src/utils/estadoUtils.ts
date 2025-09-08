
/**
 * Funções para conversão e formatação de estados brasileiros
 */

// Mapeamento de nomes de estados para siglas
const estadosMap: Record<string, string> = {
  'acre': 'AC',
  'alagoas': 'AL',
  'amapa': 'AP',
  'amazonas': 'AM',
  'bahia': 'BA',
  'ceara': 'CE',
  'distrito federal': 'DF',
  'espirito santo': 'ES',
  'goias': 'GO',
  'maranhao': 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  'para': 'PA',
  'paraiba': 'PB',
  'parana': 'PR',
  'pernambuco': 'PE',
  'piaui': 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  'rondonia': 'RO',
  'roraima': 'RR',
  'santa catarina': 'SC',
  'sao paulo': 'SP',
  'sergipe': 'SE',
  'tocantins': 'TO'
};

/**
 * Converte o nome de um estado para sua sigla
 * Se a entrada já for uma sigla ou não for encontrada, retorna a própria entrada
 * 
 * @param estado - Nome do estado ou já a sigla
 * @returns Sigla do estado (UF)
 */
export const converterParaUF = (estado?: string): string => {
  if (!estado) return '';
  
  // Se já for uma sigla (2 caracteres), retorna a própria entrada
  if (estado.length === 2 && estado === estado.toUpperCase()) {
    return estado;
  }
  
  // Normaliza a string (remove acentos, converte para minúsculo)
  const normalizado = estado.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  // Retorna a sigla ou a própria entrada se não encontrado
  return estadosMap[normalizado] || estado;
};

/**
 * Verifica se uma string é uma UF válida
 * 
 * @param uf - String a ser verificada
 * @returns boolean indicando se é uma UF válida
 */
export const isUFValida = (uf?: string): boolean => {
  if (!uf || uf.length !== 2) return false;
  return Object.values(estadosMap).includes(uf.toUpperCase());
};

/**
 * Extrai apenas a sigla UF de um texto que pode ter formato "Cidade - UF" ou outro
 * Esta função garante que apenas a sigla seja retornada, removendo qualquer texto adicional
 * 
 * @param texto - Texto que pode conter cidade e UF
 * @returns Apenas a sigla UF
 */
export const extrairApenasUF = (texto?: string): string => {
  if (!texto) return '';
  
  // Verifica se o texto tem o formato "Cidade - UF"
  const match = texto.match(/.*\s+-\s+([A-Za-z]{2}|[A-Za-z\s]+)$/);
  if (match) {
    // Extrai a parte após o último "-"
    const estadoParte = match[1].trim();
    // Converte para UF
    return converterParaUF(estadoParte);
  }
  
  // Se não encontrar o padrão, tenta converter o texto todo
  return converterParaUF(texto);
};

/**
 * Separa cidade e estado de um texto no formato "Cidade - UF"
 * 
 * @param texto - Texto no formato "Cidade - UF"
 * @returns Objeto com cidade e estado separados ou null se formato inválido
 */
export const separarCidadeEstado = (texto?: string): { cidade: string; estado: string } | null => {
  if (!texto) return null;
  
  // Verifica se o texto tem o formato "Cidade - UF"
  const match = texto.match(/(.+)\s+-\s+([A-Za-z]{2}|[A-Za-z\s]+)$/);
  if (match) {
    const cidade = match[1].trim();
    const estado = extrairApenasUF(match[2].trim());
    return { cidade, estado };
  }
  
  return null;
};
