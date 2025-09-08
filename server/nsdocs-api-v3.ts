/**
 * NSDocs API V3 - Implementação oficial para api-v3.nsdocs.com.br
 * Baseada na documentação Swagger e credenciais v3 fornecidas
 */

export interface NSDOcsResponse {
  success: boolean;
  data?: any;
  xml_content?: string;
  error?: string;
  requires_api_key?: boolean;
  nfe_not_found?: boolean;
  api_error?: boolean;
  source?: string;
}

export class NSDOcsAPIV3Service {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private baseUrl = 'https://api-v3.nsdocs.com.br';

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Autentica com a API NSDocs v3 usando OAuth2
   */
  private async authenticate(): Promise<string> {
    // Verificar se o token ainda é válido
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return this.accessToken;
    }

    console.log('[NSDocs V3] Iniciando autenticação OAuth2');

    try {
      const authUrl = `${this.baseUrl}/auth/token`;
      const authPayload = {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials'
      };

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CrossWMS/2.1'
        },
        body: JSON.stringify(authPayload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro de autenticação: ${response.status} - ${errorText}`);
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = tokenData.expires_at ? tokenData.expires_at * 1000 : Date.now() + 3600000;

      if (!this.accessToken) {
        throw new Error('Token de acesso não recebido da API NSDocs v3');
      }

      console.log('[NSDocs V3] Autenticação OAuth2 bem-sucedida');
      return this.accessToken;

    } catch (error: any) {
      console.error('[NSDocs V3] Erro na autenticação:', error.message);
      throw new Error(`Falha na autenticação com NSDocs v3: ${error.message}`);
    }
  }

  /**
   * Busca dados da NFe usando endpoints da API v3
   */
  async fetchNFeXML(chaveNotaFiscal: string): Promise<NSDOcsResponse> {
    if (!chaveNotaFiscal || chaveNotaFiscal.length !== 44) {
      return {
        success: false,
        error: 'Chave da nota fiscal deve ter exatamente 44 dígitos',
        api_error: true
      };
    }

    try {
      console.log(`[NSDocs V3] Iniciando busca para chave: ${chaveNotaFiscal}`);
      
      const token = await this.authenticate();
      
      // Usar endpoint garantido que retorna dados estruturados
      const endpoints = [
        `/requests/nfe/${chaveNotaFiscal}` // Dados estruturados JSON
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`[NSDocs V3] Testando endpoint: ${endpoint}`);
          
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'CrossWMS/2.1'
            }
          });

          console.log(`[NSDocs V3] Response ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText
          });

          if (response.ok) {
            const data = await response.json();
            
            // Verificar se temos dados válidos de NFe
            if (data && (data.nfeProc || data.nfe || data.data || data.xml || data.document)) {
              console.log('[NSDocs V3] NFe encontrada com sucesso');
              
              // Verificar se há conteúdo XML disponível
              const xmlContent = data.xml || data.xml_content || data.document?.xml || data.nfeProc?.xml;
              console.log('[NSDocs V3] XML Content available:', !!xmlContent);
              console.log('[NSDocs V3] XML fields in response:', {
                hasXml: !!data.xml,
                hasXmlContent: !!data.xml_content,
                hasDocumentXml: !!data.document?.xml,
                hasNfeProcXml: !!data.nfeProc?.xml
              });
              
              return {
                success: true,
                data: this.extractNFeData(data, chaveNotaFiscal),
                xml_content: xmlContent,
                source: 'nsdocs_api_v3'
              };
            } else {
              console.log('[NSDocs V3] Resposta sem estrutura NFe válida');
              // Continue para próximo endpoint
            }
          } else if (response.status === 404) {
            console.log(`[NSDocs V3] Endpoint ${endpoint} não encontrado`);
            continue;
          } else if (response.status === 401) {
            // Token expirado, limpar e tentar novamente
            this.accessToken = null;
            this.tokenExpiry = null;
            const newToken = await this.authenticate();
            
            const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              if (retryData && (retryData.nfe || retryData.data || retryData.xml)) {
                return {
                  success: true,
                  data: this.extractNFeData(retryData, chaveNotaFiscal),
                  xml_content: retryData.xml || retryData.xml_content,
                  source: 'nsdocs_api_v3'
                };
              }
            }
          }
        } catch (endpointError: any) {
          console.log(`[NSDocs V3] Erro no endpoint ${endpoint}:`, endpointError.message);
          continue;
        }
      }

      // Tentar método POST se GET não funcionou
      return await this.tryPostMethod(chaveNotaFiscal, token);

    } catch (error: any) {
      console.error('[NSDocs V3] Erro crítico:', error.message);
      return {
        success: false,
        error: `Erro na API NSDocs v3: ${error.message}`,
        api_error: true,
        source: 'nsdocs_api_v3'
      };
    }
  }

  /**
   * Tenta método POST para buscar NFe
   */
  private async tryPostMethod(chaveNotaFiscal: string, token: string): Promise<NSDOcsResponse> {
    const postEndpoints = [
      '/nfe/search',
      '/consulta',
      '/api/search',
      '/v3/search'
    ];

    for (const endpoint of postEndpoints) {
      try {
        console.log(`[NSDocs V3] Testando POST ${endpoint}`);
        
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            chave: chaveNotaFiscal,
            chave_acesso: chaveNotaFiscal,
            access_key: chaveNotaFiscal
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data && (data.nfe || data.data || data.xml)) {
            console.log('[NSDocs V3] NFe encontrada via POST');
            return {
              success: true,
              data: this.extractNFeData(data, chaveNotaFiscal),
              xml_content: data.xml || data.xml_content,
              source: 'nsdocs_api_v3_post'
            };
          }
        }
      } catch (error) {
        continue;
      }
    }

    return {
      success: false,
      error: 'NFe não encontrada nos serviços da API v3',
      nfe_not_found: true,
      source: 'nsdocs_api_v3'
    };
  }

  /**
   * Localiza dados de transporte na estrutura da resposta
   */
  private findTransportData(data: any): any {
    const paths = [
      'nfeProc.NFe.infNFe.transp',
      'NFe.infNFe.transp', 
      'infNFe.transp',
      'transp',
      'transporte',
      'transport'
    ];
    
    for (const path of paths) {
      const result = this.getNestedValue(data, [path]);
      if (result) {
        return { path, data: result };
      }
    }
    return null;
  }

  /**
   * Extrai dados do array de volumes (vol)
   */
  private extractFromVolArray(data: any, field: string): string | null {
    const volPaths = [
      'transp.vol',
      'vol',
      'volumes'
    ];
    
    for (const path of volPaths) {
      const volData = this.getNestedValue(data, [path]);
      if (Array.isArray(volData) && volData.length > 0) {
        const value = volData[0][field];
        if (value !== undefined && value !== null) {
          return String(value);
        }
      }
    }
    return null;
  }

  /**
   * Extrai dados específicos de volume usando acesso direto ao array
   */
  private extractVolumeData(data: any, field: string): string | null {
    // Acessar diretamente a estrutura transp.vol[0].field
    try {
      if (data && data.transp && data.transp.vol && Array.isArray(data.transp.vol) && data.transp.vol.length > 0) {
        const value = data.transp.vol[0][field];
        if (value !== undefined && value !== null) {
          return String(value);
        }
      }
    } catch (error) {
      console.log(`[NSDocs V3] Erro ao extrair ${field} do array de volumes:`, error);
    }
    return null;
  }

  /**
   * Extrai dados estruturados da resposta da API v3
   */
  private extractNFeData(apiResponse: any, chaveNotaFiscal: string): any {
    console.log('[NSDocs V3] Extraindo dados da NFe');
    
    // Processar estrutura nfeProc da API v3
    let nfeData = null;
    if (apiResponse.nfeProc && apiResponse.nfeProc.NFe) {
      nfeData = apiResponse.nfeProc.NFe.infNFe;
      console.log('[NSDocs V3] Usando estrutura nfeProc.NFe.infNFe');
    } else {
      // Fallback para outras estruturas
      nfeData = apiResponse.nfe || apiResponse.data || apiResponse.document || apiResponse;
      console.log('[NSDocs V3] Usando estrutura alternativa');
    }
    
    if (!nfeData) {
      console.log('[NSDocs V3] Estrutura de dados não reconhecida');
      return null;
    }

    // Extrair informações básicas adaptadas para API v3
    const extractedData = {
      id: `nfe_${chaveNotaFiscal}`,
      chave_nota_fiscal: chaveNotaFiscal,
      numero_nota: this.getNestedValue(nfeData, [
        'ide.nNF', 'numero', 'nNF', 'numeroNota', 'number'
      ]) || '',
      serie_nota: this.getNestedValue(nfeData, [
        'ide.serie', 'serie', 'serieNota', 'series'
      ]) || '',
      data_hora_emissao: this.getNestedValue(nfeData, [
        'ide.dhEmi', 'dataEmissao', 'dhEmi', 'dataHoraEmissao', 'emission_date'
      ]) || '',
      natureza_operacao: this.getNestedValue(nfeData, [
        'ide.natOp', 'naturezaOperacao', 'natOp', 'operation_nature'
      ]) || '',
      
      // Dados do emitente
      emitente_cnpj: this.getNestedValue(nfeData, [
        'emit.CNPJ', 'emitente.cnpj', 'emitente.CNPJ', 'issuer.cnpj'
      ]) || '',
      emitente_razao_social: this.getNestedValue(nfeData, [
        'emit.xNome', 'emitente.razaoSocial', 'emitente.xNome', 'issuer.name'
      ]) || '',
      emitente_telefone: this.getNestedValue(nfeData, [
        'emit.enderEmit.fone', 'emitente.telefone', 'emitente.fone', 'issuer.phone'
      ]) || '',
      emitente_uf: this.getNestedValue(nfeData, [
        'emit.enderEmit.UF', 'emitente.uf', 'emitente.UF', 'issuer.state'
      ]) || '',
      emitente_cidade: this.getNestedValue(nfeData, [
        'emit.enderEmit.xMun', 'emitente.cidade', 'emitente.xMun', 'issuer.city'
      ]) || '',
      emitente_bairro: this.getNestedValue(nfeData, [
        'emit.enderEmit.xBairro', 'emitente.bairro', 'emitente.xBairro', 'issuer.district'
      ]) || '',
      emitente_endereco: this.getNestedValue(nfeData, [
        'emit.enderEmit.xLgr', 'emitente.endereco', 'emitente.xLgr', 'issuer.address'
      ]) || '',
      emitente_numero: this.getNestedValue(nfeData, [
        'emit.enderEmit.nro', 'emitente.numero', 'emitente.nro', 'issuer.number'
      ]) || '',
      emitente_cep: this.getNestedValue(nfeData, [
        'emit.enderEmit.CEP', 'emitente.cep', 'emitente.CEP', 'issuer.zipcode'
      ]) || '',
      
      // Dados do destinatário
      destinatario_cnpj: this.getNestedValue(nfeData, [
        'dest.CNPJ', 'destinatario.cnpj', 'destinatario.CNPJ', 'recipient.cnpj'
      ]) || '',
      destinatario_razao_social: this.getNestedValue(nfeData, [
        'dest.xNome', 'destinatario.razaoSocial', 'destinatario.xNome', 'recipient.name'
      ]) || '',
      destinatario_telefone: this.getNestedValue(nfeData, [
        'dest.enderDest.fone', 'destinatario.telefone', 'destinatario.fone', 'recipient.phone'
      ]) || '',
      destinatario_uf: this.getNestedValue(nfeData, [
        'dest.enderDest.UF', 'destinatario.uf', 'destinatario.UF', 'recipient.state'
      ]) || '',
      destinatario_cidade: this.getNestedValue(nfeData, [
        'dest.enderDest.xMun', 'destinatario.cidade', 'destinatario.xMun', 'recipient.city'
      ]) || '',
      destinatario_bairro: this.getNestedValue(nfeData, [
        'dest.enderDest.xBairro', 'destinatario.bairro', 'destinatario.xBairro', 'recipient.district'
      ]) || '',
      destinatario_endereco: this.getNestedValue(nfeData, [
        'dest.enderDest.xLgr', 'destinatario.endereco', 'destinatario.xLgr', 'recipient.address'
      ]) || '',
      destinatario_numero: this.getNestedValue(nfeData, [
        'dest.enderDest.nro', 'destinatario.numero', 'destinatario.nro', 'recipient.number'
      ]) || '',
      destinatario_cep: this.getNestedValue(nfeData, [
        'dest.enderDest.CEP', 'destinatario.cep', 'destinatario.CEP', 'recipient.zipcode'
      ]) || '',
      
      // Totais
      quantidade_volumes: this.extractVolumeData(nfeData, 'qVol') || '1',
      valor_nota_fiscal: this.getNestedValue(nfeData, [
        'total.ICMSTot.vNF', 'total.vNF', 'ICMSTot.vNF', 'valorTotal', 'total_value'
      ]) || '0.00',
      peso_bruto: this.extractVolumeData(nfeData, 'pesoB') || '0.00',
      
      // Campos adicionais
      informacoes_complementares: this.getNestedValue(nfeData, [
        'infAdic.infCpl', 'informacoesComplementares', 'additional_info'
      ]) || '',
      numero_pedido: '',
      operacao: 'Entrada',
      cliente_retira: 'Não',
      tipo_frete: 'CIF',
      custo_extra: '0.00'
    };

    // Extrair número do pedido das informações complementares
    if (extractedData.informacoes_complementares) {
      const pedidoMatch = extractedData.informacoes_complementares.match(/Pedido:\s*(\d+)/i);
      if (pedidoMatch) {
        extractedData.numero_pedido = pedidoMatch[1];
      }
    }

    console.log('[NSDocs V3] Dados extraídos:', {
      numero_nota: extractedData.numero_nota,
      emitente: extractedData.emitente_razao_social,
      destinatario: extractedData.destinatario_razao_social,
      peso_bruto: extractedData.peso_bruto,
      numero_pedido: extractedData.numero_pedido
    });

    return extractedData;
  }

  /**
   * Busca valor aninhado usando múltiplos caminhos possíveis
   */
  private getNestedValue(obj: any, paths: string[]): string {
    for (const path of paths) {
      try {
        const value = path.split('.').reduce((current, key) => current?.[key], obj);
        if (value !== undefined && value !== null && value !== '') {
          return String(value);
        }
      } catch (error) {
        continue;
      }
    }
    return '';
  }
}

// Função exportada para compatibilidade
export async function fetchNFeFromNSDocs(
  chaveNotaFiscal: string,
  clientId: string,
  clientSecret: string
): Promise<NSDOcsResponse> {
  const service = new NSDOcsAPIV3Service(clientId, clientSecret);
  return await service.fetchNFeXML(chaveNotaFiscal);
}