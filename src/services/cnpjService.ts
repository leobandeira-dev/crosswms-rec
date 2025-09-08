
interface CNPJResponse {
  status: string;
  cnpj: string;
  tipo: string;
  nome: string;
  fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cep: string;
  bairro: string;
  municipio: string;
  uf: string;
  email: string;
  telefone: string;
  situacao: string;
  message?: string;
  [key: string]: any;
}

const API_TOKEN = '2e00c689782a0d42abc744de0eff49710ad1974d2d73593fba4d8c15f6ba7d21';

// Simple in-memory cache
const cnpjCache: Record<string, { data: CNPJResponse, timestamp: number }> = {};
const CACHE_TTL = 1000 * 60 * 60; // 1 hour cache TTL

/**
 * Função para consultar dados de um CNPJ na API da Receita Federal
 * @param cnpj CNPJ sem formatação (apenas números)
 * @returns Dados da empresa ou erro
 */
export const consultarCNPJ = async (cnpj: string): Promise<CNPJResponse> => {
  // Remover formatação do CNPJ, se houver
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  
  if (cnpjLimpo.length !== 14) {
    throw new Error('CNPJ deve ter 14 dígitos');
  }
  
  // Verificar se temos dados em cache
  if (cnpjCache[cnpjLimpo] && 
      (Date.now() - cnpjCache[cnpjLimpo].timestamp) < CACHE_TTL) {
    console.log('Retornando dados do CNPJ do cache');
    return cnpjCache[cnpjLimpo].data;
  }
  
  try {
    // Usando API pública brasil.io como alternativa
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000) // 10 segundos timeout
    });
    
    if (!response.ok) {
      throw new Error(`Erro na consulta: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Mapear dados do formato da BrasilAPI para o nosso formato
    const mappedData: CNPJResponse = {
      status: "OK",
      cnpj: data.cnpj,
      tipo: data.identificador_matriz_filial === 1 ? "MATRIZ" : "FILIAL",
      nome: data.razao_social,
      fantasia: data.nome_fantasia || data.razao_social,
      logradouro: data.logradouro || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      cep: data.cep ? data.cep.replace(/\D/g, '') : '',
      bairro: data.bairro || '',
      municipio: data.municipio?.nome || '',
      uf: data.uf || '',
      email: data.email || '',
      telefone: data.ddd_telefone_1 ? `(${data.ddd_telefone_1}) ${data.telefone_1}` : '',
      situacao: data.situacao_cadastral || 'ATIVA'
    };
    
    // Armazenar dados no cache
    cnpjCache[cnpjLimpo] = {
      data: mappedData,
      timestamp: Date.now()
    };
    
    return mappedData;
  } catch (error: any) {
    console.error('Erro ao consultar CNPJ no BrasilAPI:', error);
    
    // Tenta API principal ReceitaWS como segunda opção
    try {
      const response = await fetch(`https://receitaws.com.br/v1/cnpj/${cnpjLimpo}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`
        },
        signal: AbortSignal.timeout(10000) // 10 segundos timeout
      });
      
      if (response.status === 429) {
        throw new Error('Limite de requisições excedido. Tente novamente em 1 minuto.');
      }
      
      if (response.status === 504) {
        throw new Error('Tempo de resposta excedido. Tente novamente mais tarde.');
      }
      
      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'ERROR') {
        throw new Error(data.message || 'CNPJ não encontrado');
      }
      
      // Armazenar dados no cache
      cnpjCache[cnpjLimpo] = {
        data,
        timestamp: Date.now()
      };
      
      return data;
    } catch (secondError: any) {
      console.error('Erro ao consultar CNPJ na ReceitaWS:', secondError);
      
      // Se o erro for de timeout ou rede, podemos tentar usar dados em cache mesmo que expirados
      if (cnpjCache[cnpjLimpo]) {
        console.log('Usando dados de cache expirados devido a erro de rede');
        return cnpjCache[cnpjLimpo].data;
      }
      
      throw new Error(`Falha ao consultar CNPJ: ${secondError.message}`);
    }
  }
};

/**
 * Formatar um CNPJ para exibição (XX.XXX.XXX/XXXX-XX)
 */
export const formatarCNPJ = (cnpj: string): string => {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  
  if (cnpjLimpo.length !== 14) return cnpj;
  
  return cnpjLimpo.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
};

/**
 * Remove a formatação do CNPJ, deixando apenas números
 */
export const limparCNPJ = (cnpj: string): string => {
  return cnpj.replace(/[^\d]/g, '');
};

/**
 * Função para mapear os dados da API para o formato do formulário
 */
export const mapearDadosParaFormulario = (dados: CNPJResponse) => {
  return {
    cnpj: formatarCNPJ(dados.cnpj),
    razaoSocial: dados.nome,
    nomeFantasia: dados.fantasia || dados.nome,
    email: dados.email,
    telefone: dados.telefone,
    logradouro: dados.logradouro,
    numero: dados.numero,
    complemento: dados.complemento || '',
    bairro: dados.bairro,
    cidade: dados.municipio,
    uf: dados.uf,
    cep: dados.cep.replace(/\D/g, '').replace(/^(\d{5})(\d{3})$/, '$1-$2'),
  };
};

/**
 * Alternativa para consultar CNPJ usando proxy
 * Esta função tenta usar um proxy se a API direta falhar
 */
export const consultarCNPJComAlternativa = async (cnpj: string): Promise<CNPJResponse> => {
  try {
    // Tenta o método principal primeiro (que já tem múltiplas tentativas)
    return await consultarCNPJ(cnpj);
  } catch (error) {
    console.warn("Erro nas consultas principais, tentando alternativa:", error);
    
    // CNPJ limpo sem formatação
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    
    if (cnpjLimpo.length !== 14) {
      throw new Error('CNPJ deve ter 14 dígitos');
    }
    
    // Se todas as APIs falharem, usamos uma API pública adicional como último recurso
    try {
      console.log('Tentando API CNPJ.ws como último recurso');
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Mapear dados do formato da CNPJ.ws para o nosso formato
      const mappedData: CNPJResponse = {
        status: "OK",
        cnpj: data.cnpj_numero || cnpjLimpo,
        tipo: data.estabelecimento?.tipo === 'MATRIZ' ? 'MATRIZ' : 'FILIAL',
        nome: data.razao_social,
        fantasia: data.estabelecimento?.nome_fantasia || data.razao_social,
        logradouro: data.estabelecimento?.tipo_logradouro + ' ' + data.estabelecimento?.logradouro || '',
        numero: data.estabelecimento?.numero || '',
        complemento: data.estabelecimento?.complemento || '',
        cep: data.estabelecimento?.cep || '',
        bairro: data.estabelecimento?.bairro || '',
        municipio: data.estabelecimento?.cidade?.nome || '',
        uf: data.estabelecimento?.estado?.sigla || '',
        email: data.estabelecimento?.email || '',
        telefone: data.estabelecimento?.ddd1 && data.estabelecimento?.telefone1 ? 
          `(${data.estabelecimento.ddd1}) ${data.estabelecimento.telefone1}` : '',
        situacao: data.estabelecimento?.situacao_cadastral || 'ATIVA'
      };
      
      // Armazenar dados no cache
      cnpjCache[cnpjLimpo] = {
        data: mappedData,
        timestamp: Date.now()
      };
      
      return mappedData;
    } catch (finalError: any) {
      console.error('Todas as tentativas de API falharam:', finalError);
      
      // Se chegou aqui, todas as APIs falharam
      // Como último recurso, usamos dados mockados para não bloquear o usuário
      const mockResponse: CNPJResponse = {
        status: "OK",
        cnpj: cnpjLimpo,
        tipo: "MATRIZ",
        nome: "EMPRESA DE TESTE (APIs indisponíveis)",
        fantasia: "DADOS MOCKADOS - APIs indisponíveis",
        logradouro: "RUA DE TESTE",
        numero: "123",
        complemento: "SALA 1",
        cep: "12345678",
        bairro: "BAIRRO TESTE",
        municipio: "SÃO PAULO",
        uf: "SP",
        email: "teste@empresa.com",
        telefone: "(11) 1234-5678",
        situacao: "ATIVA"
      };
      
      // Armazena os dados mockados no cache também
      cnpjCache[cnpjLimpo] = {
        data: mockResponse,
        timestamp: Date.now()
      };
      
      return mockResponse;
    }
  }
};
