/**
 * NSDocs API Integration Module
 * 
 * Provides clean, reusable integration with NSDocs API for Brazilian NFe document retrieval.
 * Replaces RPA automation with reliable API-based XML fetching and data extraction.
 * 
 * Features:
 * - OAuth2 authentication with automatic token management
 * - Multiple endpoint discovery for API compatibility
 * - Direct JSON response processing with fallback XML parsing
 * - Comprehensive NFe data extraction for all form fields
 * - Error handling with specific error types for user feedback
 * 
 * Usage:
 *   const nsdocs = new NSDOcsAPI(clientId, clientSecret);
 *   const result = await nsdocs.fetchNFeXML(chaveNotaFiscal);
 */

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
}

export class NSDOcsAPI {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private baseUrl = 'https://api-v3.nsdocs.com.br';

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Obtains access token using multiple authentication strategies
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

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
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              client_id: this.clientId,
              client_secret: this.clientSecret,
              grant_type: 'client_credentials'
            })
          });

          if (response.ok) {
            const tokenData = await response.json();
            this.accessToken = tokenData.access_token || tokenData.token;
            
            if (this.accessToken) {
              return this.accessToken;
            }
          }
        } catch (endpointError) {
          continue;
        }
      }

      // If OAuth fails, use client secret directly as API key
      this.accessToken = this.clientSecret;
      return this.accessToken;

    } catch (error: any) {
      // Fallback to using client secret as API key
      this.accessToken = this.clientSecret;
      return this.accessToken;
    }
  }

  /**
   * Fetches NFe XML data from NSDocs API
   */
  async fetchNFeXML(chaveNotaFiscal: string): Promise<NSDOcsResponse> {
    if (!chaveNotaFiscal || chaveNotaFiscal.length !== 44) {
      return {
        success: false,
        error: 'Chave da nota fiscal deve ter exatamente 44 dígitos'
      };
    }

    try {
      const accessToken = await this.getAccessToken();

      // Test multiple endpoint patterns for NSDocs API compatibility
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

      for (const endpoint of endpointPatterns) {
        try {
          const searchResponse = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          });

          if (searchResponse.ok) {
            searchResult = await searchResponse.json();
            break;
          } else if (searchResponse.status === 401) {
            return {
              success: false,
              error: 'Credenciais do NSDocs inválidas. Verifique Client ID e Client Secret.',
              requires_api_key: true
            };
          } else if (searchResponse.status !== 404) {
            lastError = `${endpoint}: ${searchResponse.status} - ${await searchResponse.text()}`;
          }
        } catch (fetchError: any) {
          lastError = `${endpoint}: ${fetchError.message}`;
          continue;
        }
      }

      if (!searchResult) {
        return {
          success: false,
          error: `NFe não encontrada nos endpoints testados. Último erro: ${lastError}`,
          nfe_not_found: true
        };
      }

      // Check if the API returned complete NFe data structure
      if (searchResult && (searchResult.nfeProc || searchResult.NFe || searchResult.nfe)) {
        const extractedData = this.extractNFeDataFromJSON(searchResult, chaveNotaFiscal);
        
        // Convert to XML for storage
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

      // Try document ID approach if direct data not available
      const documentId = searchResult?.id || 
                        searchResult?.document_id || 
                        searchResult?.documentId ||
                        searchResult?.data?.id ||
                        searchResult?.data?.document_id ||
                        searchResult?.nfe?.id ||
                        searchResult?.response?.id ||
                        searchResult?.result?.id;

      // Check for direct XML in response
      const directXml = searchResult?.xml || 
                       searchResult?.xml_content || 
                       searchResult?.data?.xml ||
                       searchResult?.content?.xml ||
                       searchResult?.nfe?.xml ||
                       searchResult?.response?.xml ||
                       searchResult?.xml_data;
        
      if (directXml && typeof directXml === 'string' && directXml.includes('<NFe>')) {
        const extractedData = await this.extractNFeDataFromXML(directXml, chaveNotaFiscal);
        return {
          success: true,
          data: extractedData,
          xml_content: directXml,
          source: 'nsdocs_api_direct'
        };
      }

      if (!documentId) {
        return {
          success: false,
          error: 'Estrutura de resposta não reconhecida',
          api_error: true
        };
      }

      // Fetch XML using document ID
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
          error: 'XML não encontrado ou inválido',
          invalid_xml: true
        };
      }

      const extractedData = await this.extractNFeDataFromXML(xmlData, chaveNotaFiscal);

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

  /**
   * Extracts NFe data directly from JSON response structure
   */
  private extractNFeDataFromJSON(jsonData: any, chaveNotaFiscal: string): any {
    const nfeProc = jsonData.nfeProc || jsonData;
    const nfe = nfeProc?.NFe || nfeProc?.nfe || nfeProc;
    const infNFe = nfe?.infNFe || nfe;
    
    if (!infNFe) {
      throw new Error('Estrutura NFe não encontrada na resposta JSON');
    }

    const ide = infNFe.ide || {};
    const emit = infNFe.emit || {};
    const dest = infNFe.dest || {};
    const transp = infNFe.transp || {};
    const total = infNFe.total || {};
    const det = infNFe.det || [];

    const firstDet = Array.isArray(det) ? det[0] : det;
    const vol = Array.isArray(transp.vol) ? transp.vol[0] : transp.vol;

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
      
      // Volume data
      quantidade_volumes: vol?.qVol?.toString() || '',
      peso_bruto: vol?.pesoB?.toString() || '',
      volume_quantidade: vol?.qVol?.toString() || '',
      volume_especie: vol?.esp || '',
      volume_peso_liquido: vol?.pesoL?.toString() || '',
      volume_peso_bruto: vol?.pesoB?.toString() || '',
      
      // Product data (first product)
      produto_codigo: firstDet?.prod?.cProd || '',
      produto_descricao: firstDet?.prod?.xProd || '',
      produto_ncm: firstDet?.prod?.NCM || '',
      produto_quantidade: firstDet?.prod?.qCom?.toString() || '',
      produto_unidade: firstDet?.prod?.uCom || '',
      produto_valor_unitario: firstDet?.prod?.vUnCom?.toString() || '',
      
      // Financial totals - match XML field names
      valor_nota_fiscal: total.ICMSTot?.vNF?.toString() || '',
      valor_total: total.ICMSTot?.vNF?.toString() || '',
      valor_produtos: total.ICMSTot?.vProd?.toString() || '',
      valor_frete: total.ICMSTot?.vFrete?.toString() || '',
      valor_seguro: total.ICMSTot?.vSeg?.toString() || '',
      valor_desconto: total.ICMSTot?.vDesc?.toString() || '',
      
      // Additional fields to match XML processing
      informacoes_complementares: '',
      numero_pedido: '',
      tipo_frete: 'CIF',
      custo_extra: '',
      operacao: '',
      cliente_retira: ''
    };
  }

  /**
   * Extracts NFe data from XML string
   */
  private async extractNFeDataFromXML(xmlData: string, chaveNotaFiscal: string): Promise<any> {
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
    const det = nfe.det?.[0] || {};

    return {
      chave_nota_fiscal: chaveNotaFiscal,
      numero_nota: ide.nNF?.[0] || '',
      serie_nota: ide.serie?.[0] || '',
      data_hora_emissao: ide.dhEmi?.[0] || '',
      natureza_operacao: ide.natOp?.[0] || '',
      
      // Emitente data
      emitente_cnpj: emit.CNPJ?.[0] || '',
      emitente_razao_social: emit.xNome?.[0] || '',
      emitente_nome_fantasia: emit.xFant?.[0] || '',
      emitente_inscricao_estadual: emit.IE?.[0] || '',
      emitente_endereco: emit.enderEmit?.[0]?.xLgr?.[0] || '',
      emitente_numero: emit.enderEmit?.[0]?.nro?.[0] || '',
      emitente_bairro: emit.enderEmit?.[0]?.xBairro?.[0] || '',
      emitente_municipio: emit.enderEmit?.[0]?.xMun?.[0] || '',
      emitente_uf: emit.enderEmit?.[0]?.UF?.[0] || '',
      emitente_cep: emit.enderEmit?.[0]?.CEP?.[0] || '',
      
      // Destinatário data
      destinatario_cnpj: dest.CNPJ?.[0] || '',
      destinatario_razao_social: dest.xNome?.[0] || '',
      destinatario_inscricao_estadual: dest.IE?.[0] || '',
      destinatario_endereco: dest.enderDest?.[0]?.xLgr?.[0] || '',
      destinatario_numero: dest.enderDest?.[0]?.nro?.[0] || '',
      destinatario_bairro: dest.enderDest?.[0]?.xBairro?.[0] || '',
      destinatario_municipio: dest.enderDest?.[0]?.xMun?.[0] || '',
      destinatario_uf: dest.enderDest?.[0]?.UF?.[0] || '',
      destinatario_cep: dest.enderDest?.[0]?.CEP?.[0] || '',
      
      // Transport data
      modalidade_frete: transp.modFrete?.[0] || '',
      transportadora_cnpj: transp.transporta?.[0]?.CNPJ?.[0] || '',
      transportadora_razao_social: transp.transporta?.[0]?.xNome?.[0] || '',
      veiculo_placa: transp.veicTransp?.[0]?.placa?.[0] || '',
      veiculo_uf: transp.veicTransp?.[0]?.UF?.[0] || '',
      
      // Volume data
      quantidade_volumes: transp.vol?.[0]?.qVol?.[0] || '',
      peso_bruto: transp.vol?.[0]?.pesoB?.[0] || '',
      volume_quantidade: transp.vol?.[0]?.qVol?.[0] || '',
      volume_especie: transp.vol?.[0]?.esp?.[0] || '',
      volume_peso_liquido: transp.vol?.[0]?.pesoL?.[0] || '',
      volume_peso_bruto: transp.vol?.[0]?.pesoB?.[0] || '',
      
      // Product data (first product)
      produto_codigo: det.prod?.[0]?.cProd?.[0] || '',
      produto_descricao: det.prod?.[0]?.xProd?.[0] || '',
      produto_ncm: det.prod?.[0]?.NCM?.[0] || '',
      produto_quantidade: det.prod?.[0]?.qCom?.[0] || '',
      produto_unidade: det.prod?.[0]?.uCom?.[0] || '',
      produto_valor_unitario: det.prod?.[0]?.vUnCom?.[0] || '',
      
      // Financial totals
      valor_total: total.vNF?.[0] || '',
      valor_produtos: total.vProd?.[0] || '',
      valor_frete: total.vFrete?.[0] || '',
      valor_seguro: total.vSeg?.[0] || '',
      valor_desconto: total.vDesc?.[0] || ''
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
    const digits = cnpj.replace(/\D/g, '');
    return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formats CEP for display
   */
  static formatCEP(cep: string): string {
    const digits = cep.replace(/\D/g, '');
    return digits.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
}

// Export convenience function for quick usage
export async function fetchNFeFromNSDocs(
  chaveNotaFiscal: string, 
  clientId: string, 
  clientSecret: string
): Promise<NSDOcsResponse> {
  const api = new NSDOcsAPI(clientId, clientSecret);
  return await api.fetchNFeXML(chaveNotaFiscal);
}

export default NSDOcsAPI;