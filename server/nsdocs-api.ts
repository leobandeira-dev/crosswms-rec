// NSDocs API integration module
// Replaces RPA functionality with clean API-based XML retrieval

export interface NSDOcsResponse {
  success: boolean;
  data?: any;
  xml_content?: string;
  error?: string;
  requires_api_key?: boolean;
  nfe_not_found?: boolean;
  api_error?: boolean;
  invalid_xml?: boolean;
  source?: string;
  debug_response?: any;
  available_methods?: string[];
}

export class NSDOcsAPIService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private baseUrl = 'https://api-v3.nsdocs.com.br';
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    context: string,
    retries: number = this.maxRetries
  ): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[NSDocs] ${context} - Tentativa ${attempt}/${retries}`);
        return await operation();
      } catch (error: any) {
        console.log(`[NSDocs] ${context} - Falha na tentativa ${attempt}:`, error.message);
        
        if (attempt === retries) {
          throw error;
        }
        
        // Exponential backoff with jitter
        const delay = this.retryDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        console.log(`[NSDocs] Aguardando ${Math.round(delay)}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error(`Operation failed after ${retries} attempts`);
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      console.log('[NSDocs] Usando token em cache');
      return this.accessToken;
    }

    console.log('[NSDocs] Iniciando autenticação OAuth2');
    console.log('[NSDocs] Base URL:', this.baseUrl);
    console.log('[NSDocs] Client ID:', this.clientId.substring(0, 8) + '...');

    try {
      // Try different authentication endpoints
      const authEndpoints = [
        '/auth/token',
        '/api/auth/token', 
        '/token',
        '/api/token'
      ];

      for (const endpoint of authEndpoints) {
        try {
          console.log(`[NSDocs] Tentando endpoint de auth: ${endpoint}`);
          
          const authUrl = `${this.baseUrl}${endpoint}`;
          const authPayload = {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'client_credentials'
          };

          console.log('[NSDocs] Payload de autenticação:', {
            client_id: this.clientId.substring(0, 8) + '...',
            grant_type: 'client_credentials',
            has_secret: !!this.clientSecret
          });

          const response = await fetch(authUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'CROSSWMS/1.0 (Replit Production)'
            },
            body: JSON.stringify(authPayload)
          });

          console.log(`[NSDocs] Auth response ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          });

          if (response.ok) {
            const tokenData = await response.json();
            console.log('[NSDocs] Token data recebido:', {
              hasAccessToken: !!tokenData.access_token,
              hasToken: !!tokenData.token,
              keys: Object.keys(tokenData)
            });
            
            this.accessToken = tokenData.access_token || tokenData.token;
            
            if (this.accessToken) {
              console.log('[NSDocs] Autenticação OAuth2 bem-sucedida');
              return this.accessToken;
            }
          } else {
            const errorText = await response.text();
            console.log(`[NSDocs] Erro auth ${endpoint}:`, errorText);
          }
        } catch (endpointError: any) {
          console.log(`[NSDocs] Erro de rede em ${endpoint}:`, endpointError.message);
          continue;
        }
      }

      // If OAuth fails, try using the client secret directly as API key
      console.log('[NSDocs] OAuth2 falhou, usando client secret como API key');
      this.accessToken = this.clientSecret;
      return this.accessToken;

    } catch (error: any) {
      console.log('[NSDocs] Erro crítico na autenticação:', error.message);
      // Fallback to using client secret as API key
      this.accessToken = this.clientSecret;
      return this.accessToken;
    }
  }

  async fetchNFeXML(chaveNotaFiscal: string): Promise<NSDOcsResponse> {
    if (!chaveNotaFiscal || chaveNotaFiscal.length !== 44) {
      return {
        success: false,
        error: 'Chave da nota fiscal deve ter exatamente 44 dígitos'
      };
    }

    try {
      // Get access token first
      const accessToken = await this.getAccessToken();

      // Test multiple endpoint patterns for NSDocs API
      const endpointPatterns = [
        `/requests/nfe/${chaveNotaFiscal}`,
        `/api/requests/nfe/${chaveNotaFiscal}`,
        `/nfe/${chaveNotaFiscal}`,
        `/api/nfe/${chaveNotaFiscal}`,
        `/consulta/nfe/${chaveNotaFiscal}`,
        `/api/consulta/nfe/${chaveNotaFiscal}`
      ];

      let searchResult = null;
      let lastError = '';
      let successfulEndpoint = '';

      console.log(`[NSDocs] Iniciando busca de NFe: ${chaveNotaFiscal}`);
      console.log(`[NSDocs] Testando ${endpointPatterns.length} endpoints diferentes`);

      for (const endpoint of endpointPatterns) {
        try {
          const result = await this.retryOperation(async () => {
            const fullUrl = `${this.baseUrl}${endpoint}`;
            console.log(`[NSDocs] Tentando endpoint: ${fullUrl}`);
            
            const searchResponse = await fetch(fullUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': 'CROSSWMS/1.0 (Replit Production)',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
              },
              // Add timeout for production stability
              signal: AbortSignal.timeout(30000) // 30 second timeout
            });

            console.log(`[NSDocs] Response ${endpoint}:`, {
              status: searchResponse.status,
              statusText: searchResponse.statusText,
              headers: Object.fromEntries(searchResponse.headers.entries())
            });

            if (searchResponse.ok) {
              const responseData = await searchResponse.json();
              console.log(`[NSDocs] Sucesso no endpoint: ${endpoint}`);
              console.log(`[NSDocs] Dados recebidos:`, {
                hasData: !!responseData,
                keys: responseData ? Object.keys(responseData) : [],
                hasNfe: !!(responseData?.nfe || responseData?.NFe || responseData?.nfeProc)
              });
              return { success: true, data: responseData, endpoint };
            } else if (searchResponse.status === 401) {
              console.log(`[NSDocs] Erro de autenticação no endpoint: ${endpoint}`);
              throw { authError: true, status: 401 };
            } else if (searchResponse.status !== 404) {
              const errorText = await searchResponse.text();
              console.log(`[NSDocs] Erro ${searchResponse.status} em ${endpoint}:`, errorText);
              throw new Error(`HTTP ${searchResponse.status}: ${errorText}`);
            } else {
              console.log(`[NSDocs] 404 (não encontrado) em ${endpoint} - normal, continuando...`);
              throw { notFound: true, status: 404 };
            }
          }, `Busca NFe em ${endpoint}`);

          if (result.success) {
            searchResult = result.data;
            successfulEndpoint = result.endpoint;
            break;
          }
        } catch (error: any) {
          if (error.authError) {
            return {
              success: false,
              error: 'Credenciais do NSDocs inválidas. Verifique Client ID e Client Secret.',
              requires_api_key: true
            };
          } else if (!error.notFound) {
            lastError = `${endpoint}: ${error.message}`;
            console.log(`[NSDocs] Erro definitivo em ${endpoint}:`, error.message);
          }
          continue;
        }
      }

      if (!searchResult) {
        console.log('[NSDocs] Nenhum endpoint retornou dados válidos');
        console.log('[NSDocs] Último erro registrado:', lastError);
        return {
          success: false,
          error: `NFe não encontrada na base de dados do NSDocs. Verifique se a chave está correta ou tente com outra NFe.`,
          nfe_not_found: true,
          debug_response: {
            lastError,
            endpointsTested: endpointPatterns.length,
            baseUrl: this.baseUrl
          }
        };
      }

      // Check if the API returned the complete NFe data structure first
      if (searchResult && (searchResult.nfeProc || searchResult.NFe || searchResult.nfe)) {
        // Extract data directly from JSON response
        const extractedData = this.extractNFeDataFromJSON(searchResult, chaveNotaFiscal);
        
        // Convert to XML for storage if needed
        const xml2js = await import('xml2js');
        const builder = new xml2js.Builder();
        const xmlData = builder.buildObject(searchResult);
        
        return {
          success: true,
          data: extractedData,
          xml_content: xmlData,
          source: 'nsdocs_api_json'
        };
      }

      // Try to extract document ID from various possible response formats
      const documentId = searchResult?.id || 
                        searchResult?.document_id || 
                        searchResult?.documentId ||
                        searchResult?.data?.id ||
                        searchResult?.data?.document_id ||
                        searchResult?.nfe?.id ||
                        searchResult?.response?.id ||
                        searchResult?.result?.id;

      // Check if XML is directly in response (various possible locations)
      const directXml = searchResult?.xml || 
                       searchResult?.xml_content || 
                       searchResult?.data?.xml ||
                       searchResult?.content?.xml ||
                       searchResult?.nfe?.xml ||
                       searchResult?.response?.xml ||
                       searchResult?.xml_data;
        
      if (directXml && typeof directXml === 'string' && directXml.includes('<NFe>')) {
        const extractedData = await this.extractNFeData(directXml, chaveNotaFiscal);
        return {
          success: true,
          data: extractedData,
          xml_content: directXml,
          source: 'nsdocs_api_direct'
        };
      }

      if (!documentId) {
        // If we have NFe data but no document ID, extract directly from JSON
        if (searchResult && searchResult.nfeProc) {
          const extractedData = this.extractNFeDataFromJSON(searchResult, chaveNotaFiscal);
          
          // Convert to XML for storage
          const xml2js = await import('xml2js');
          const builder = new xml2js.Builder();
          const xmlData = builder.buildObject(searchResult);
          
          return {
            success: true,
            data: extractedData,
            xml_content: xmlData,
            source: 'nsdocs_api_direct'
          };
        }

        return {
          success: false,
          error: `Estrutura de resposta não reconhecida`,
          api_error: true
        };
      }

      // Step 2: Try to fetch XML using document ID with multiple patterns
      const xmlEndpoints = [
        `/documents/${documentId}/xml`,
        `/api/documents/${documentId}/xml`,
        `/xml/${documentId}`,
        `/api/xml/${documentId}`
      ];

      let xmlData = '';
      for (const xmlEndpoint of xmlEndpoints) {
        try {
          const xmlResponse = await fetch(`${this.baseUrl}${xmlEndpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/xml'
            }
          });

          if (xmlResponse.ok) {
            xmlData = await xmlResponse.text();
            if (xmlData && xmlData.includes('<NFe>')) {
              break;
            }
          }
        } catch (xmlError) {
          continue;
        }
      }

      if (!xmlData || !xmlData.includes('<NFe>')) {
        return {
          success: false,
          error: 'XML não encontrado ou inválido nos endpoints testados',
          invalid_xml: true
        };
      }

      // Extract and return structured data
      const extractedData = await this.extractNFeData(xmlData, chaveNotaFiscal);

      return {
        success: true,
        data: extractedData,
        xml_content: xmlData,
        source: 'nsdocs_api'
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Erro de conectividade com NSDocs: ${error?.message || error}`,
        api_error: true
      };
    }
  }

  // Method to extract NFe data directly from JSON response
  extractNFeDataFromJSON(jsonData: any, chaveNotaFiscal: string): any {
    console.log('[NSDocs] Estrutura completa do JSON recebido:', JSON.stringify(jsonData, null, 2));
    
    // Navigate through the NFe structure from NSDocs API response
    const nfeProc = jsonData.nfeProc || jsonData;
    const nfe = nfeProc?.NFe || nfeProc?.nfe || nfeProc;
    const infNFe = nfe?.infNFe || nfe;
    
    if (!infNFe) {
      throw new Error('Estrutura NFe não encontrada na resposta JSON');
    }

    // Extract identification data
    const ide = infNFe.ide || {};
    const emit = infNFe.emit || {};
    const dest = infNFe.dest || {};
    const transp = infNFe.transp || {};
    const total = infNFe.total || {};
    const det = infNFe.det || [];

    // Handle both single item and array formats
    const firstDet = Array.isArray(det) ? det[0] : det;
    const vol = Array.isArray(transp.vol) ? transp.vol[0] : transp.vol;
    
    // Extract financial data with multiple fallback paths
    let valorNota = '0';
    let pesoBruto = '0';
    let quantidadeVolumes = '1';
    
    // Try different paths for valor total da nota
    if (total.ICMSTot?.vNF) {
      valorNota = total.ICMSTot.vNF.toString();
    } else if (total.vNF) {
      valorNota = total.vNF.toString();
    } else if (infNFe.total?.ICMSTot?.vNF) {
      valorNota = infNFe.total.ICMSTot.vNF.toString();
    }
    
    // Try different paths for peso bruto
    if (vol?.pesoB) {
      pesoBruto = vol.pesoB.toString();
    } else if (vol?.pesoL) {
      pesoBruto = vol.pesoL.toString();
    } else if (transp.vol?.pesoB) {
      pesoBruto = transp.vol.pesoB.toString();
    }
    
    // Try different paths for quantidade de volumes
    if (vol?.qVol) {
      quantidadeVolumes = vol.qVol.toString();
    } else if (transp.vol?.qVol) {
      quantidadeVolumes = transp.vol.qVol.toString();
    }
    
    console.log('[NSDocs] Valores extraídos:', {
      valorNota,
      pesoBruto,
      quantidadeVolumes,
      vol: vol,
      total: total
    });

    return {
      chave_nota_fiscal: chaveNotaFiscal,
      numero_nota: ide.nNF?.toString() || '',
      serie_nota: ide.serie?.toString() || '',
      data_hora_emissao: ide.dhEmi || '',
      natureza_operacao: ide.natOp || '',
      
      // Emitente data
      emitente_cnpj: emit.CNPJ?.toString() || '',
      emitente_razao_social: emit.xNome || '',
      emitente_nome_fantasia: emit.xFant || '',
      emitente_inscricao_estadual: emit.IE?.toString() || '',
      emitente_endereco: emit.enderEmit?.xLgr || '',
      emitente_numero: emit.enderEmit?.nro?.toString() || '',
      emitente_bairro: emit.enderEmit?.xBairro || '',
      emitente_municipio: emit.enderEmit?.xMun || '',
      emitente_uf: emit.enderEmit?.UF || '',
      emitente_cep: emit.enderEmit?.CEP?.toString() || '',
      
      // Destinatário data
      destinatario_cnpj: dest.CNPJ?.toString() || '',
      destinatario_razao_social: dest.xNome || '',
      destinatario_inscricao_estadual: dest.IE?.toString() || '',
      destinatario_endereco: dest.enderDest?.xLgr || '',
      destinatario_numero: dest.enderDest?.nro?.toString() || '',
      destinatario_bairro: dest.enderDest?.xBairro || '',
      destinatario_municipio: dest.enderDest?.xMun || '',
      destinatario_uf: dest.enderDest?.UF || '',
      destinatario_cep: dest.enderDest?.CEP?.toString() || '',
      
      // Transport data
      modalidade_frete: transp.modFrete?.toString() || '',
      transportadora_cnpj: transp.transporta?.CNPJ?.toString() || '',
      transportadora_razao_social: transp.transporta?.xNome || '',
      veiculo_placa: transp.veicTransp?.placa || '',
      veiculo_uf: transp.veicTransp?.UF || '',
      
      // Volume data with corrected extraction
      quantidade_volumes: quantidadeVolumes,
      volume_especie: vol?.esp || '',
      peso_bruto: pesoBruto,
      volume_peso_liquido: vol?.pesoL?.toString() || '',
      volume_peso_bruto: vol?.pesoB?.toString() || '',
      
      // Product data (first product)
      produto_codigo: firstDet?.prod?.cProd || '',
      produto_descricao: firstDet?.prod?.xProd || '',
      produto_ncm: firstDet?.prod?.NCM || '',
      produto_quantidade: firstDet?.prod?.qCom?.toString() || '',
      produto_unidade: firstDet?.prod?.uCom || '',
      produto_valor_unitario: firstDet?.prod?.vUnCom?.toString() || '',
      
      // Financial totals with corrected extraction
      valor_nota_fiscal: valorNota,
      valor_total: valorNota,
      valor_produtos: total.ICMSTot?.vProd?.toString() || total.vProd?.toString() || '',
      valor_frete: total.ICMSTot?.vFrete?.toString() || total.vFrete?.toString() || '',
      valor_seguro: total.ICMSTot?.vSeg?.toString() || total.vSeg?.toString() || '',
      valor_desconto: total.ICMSTot?.vDesc?.toString() || total.vDesc?.toString() || ''
    };
  }

  // Method to extract NFe data from XML
  async extractNFeData(xmlData: string, chaveNotaFiscal: string): Promise<any> {
    const xml2js = await import('xml2js');
    const parser = new xml2js.Parser({ explicitArray: true });
    const xmlObj = await parser.parseStringPromise(xmlData);
    
    const nfe = xmlObj?.NFe?.infNFe?.[0];
    if (!nfe) {
      throw new Error('XML não contém dados válidos da NFe');
    }

    const ide = nfe.ide?.[0] || {};
    const emit = nfe.emit?.[0] || {};
    const dest = nfe.dest?.[0] || {};
    const total = nfe.total?.[0]?.ICMSTot?.[0] || {};
    const transp = nfe.transp?.[0] || {};
    const enderEmit = emit.enderEmit?.[0] || {};
    const enderDest = dest.enderDest?.[0] || {};

    // Get volume and transport data
    const vol = transp.vol?.[0] || {};
    const det = nfe.det?.[0] || {};
    const prod = det.prod?.[0] || {};
    const infAdic = nfe.infAdic?.[0] || {};

    return {
      chave_nota_fiscal: chaveNotaFiscal,
      data_hora_emissao: ide.dhEmi?.[0] || '',
      numero_nota: ide.nNF?.[0] || '',
      serie_nota: ide.serie?.[0] || '',
      natureza_operacao: ide.natOp?.[0] || '',
      
      emitente_cnpj: emit.CNPJ?.[0] || '',
      emitente_razao_social: emit.xNome?.[0] || '',
      emitente_telefone: enderEmit.fone?.[0] || '',
      emitente_uf: enderEmit.UF?.[0] || '',
      emitente_cidade: enderEmit.xMun?.[0] || '',
      emitente_bairro: enderEmit.xBairro?.[0] || '',
      emitente_endereco: enderEmit.xLgr?.[0] || '',
      emitente_numero: enderEmit.nro?.[0] || '',
      emitente_cep: enderEmit.CEP?.[0] || '',
      
      destinatario_cnpj: dest.CNPJ?.[0] || '',
      destinatario_razao_social: dest.xNome?.[0] || '',
      destinatario_telefone: enderDest.fone?.[0] || '',
      destinatario_uf: enderDest.UF?.[0] || '',
      destinatario_cidade: enderDest.xMun?.[0] || '',
      destinatario_bairro: enderDest.xBairro?.[0] || '',
      destinatario_endereco: enderDest.xLgr?.[0] || '',
      destinatario_numero: enderDest.nro?.[0] || '',
      destinatario_cep: enderDest.CEP?.[0] || '',
      
      quantidade_volumes: vol.qVol?.[0] || '1',
      valor_nota_fiscal: total.vNF?.[0] || '0',
      peso_bruto: vol.pesoB?.[0] || '0',
      informacoes_complementares: infAdic.infCpl?.[0] || '',
      numero_pedido: prod.xPed?.[0] || '',
      tipo_frete: transp.modFrete?.[0] || '0'
    };
  }

  /**
   * Validates NFe access key format
   */
  static validateChaveNFe(chave: string): boolean {
    return /^\d{44}$/.test(chave);
  }

  /**
   * Formats CNPJ for display
   */
  static formatCNPJ(cnpj: string): string {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formats CEP for display
   */
  static formatCEP(cep: string): string {
    if (!cep) return '';
    return cep.replace(/^(\d{5})(\d{3})/, '$1-$2');
  }
}

export async function fetchNFeFromNSDocs(
  chaveNotaFiscal: string,
  clientId: string = 'd4398d37-ed0b-4a4c-9fb6-ee7aeaaf672a',
  clientSecret?: string
): Promise<NSDOcsResponse> {
  const apiKey = clientSecret || process.env.NSDOCS_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: 'API key do NSDocs não configurada',
      requires_api_key: true
    };
  }

  const nsdocs = new NSDOcsAPIService(clientId, apiKey);
  return await nsdocs.fetchNFeXML(chaveNotaFiscal);
}