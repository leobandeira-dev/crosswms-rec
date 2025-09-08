/**
 * NSDocs API V3 - Implementação para api-v3.nsdocs.com.br/developer
 * Usando credenciais oficiais da API v3 com endpoints corretos
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

export class NSDOcsAPIService {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private baseUrl = 'https://api-v3.nsdocs.com.br';

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Autentica com a API NSDocs usando OAuth2
   */
  private async authenticate(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    console.log('[NSDocs V2] Iniciando autenticação OAuth2');

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
          'User-Agent': 'CrossWMS/2.0'
        },
        body: JSON.stringify(authPayload)
      });

      if (!response.ok) {
        throw new Error(`Erro de autenticação: ${response.status} ${response.statusText}`);
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;

      if (!this.accessToken) {
        throw new Error('Token de acesso não recebido da API NSDocs');
      }

      console.log('[NSDocs V2] Autenticação OAuth2 bem-sucedida');
      return this.accessToken;

    } catch (error: any) {
      console.error('[NSDocs V2] Erro na autenticação:', error.message);
      throw new Error(`Falha na autenticação com NSDocs: ${error.message}`);
    }
  }

  /**
   * Busca dados da NFe usando endpoints múltiplos
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
      console.log(`[NSDocs V2] Iniciando busca para chave: ${chaveNotaFiscal}`);
      
      const token = await this.authenticate();
      
      // Endpoints possíveis para busca de NFe
      const endpoints = [
        `/nfe/${chaveNotaFiscal}`,
        `/api/nfe/${chaveNotaFiscal}`,
        `/consulta/${chaveNotaFiscal}`,
        `/v1/nfe/${chaveNotaFiscal}`
      ];

      for (const endpoint of endpoints) {
        try {
          console.log(`[NSDocs V2] Testando endpoint: ${endpoint}`);
          
          const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'User-Agent': 'CrossWMS/2.0'
            }
          });

          console.log(`[NSDocs V2] Response ${endpoint}:`, {
            status: response.status,
            statusText: response.statusText
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data && (data.nfe || data.data || data.xml)) {
              console.log('[NSDocs V2] NFe encontrada com sucesso');
              
              return {
                success: true,
                data: this.extractNFeData(data, chaveNotaFiscal),
                xml_content: data.xml || data.xml_content,
                source: 'nsdocs_api_v2'
              };
            }
          } else if (response.status === 404) {
            console.log(`[NSDocs V2] Endpoint ${endpoint} não encontrado, tentando próximo`);
            continue;
          } else if (response.status === 401) {
            // Token expirado, limpar e tentar novamente
            this.accessToken = null;
            const newToken = await this.authenticate();
            // Retry com novo token
            const retryResponse = await fetch(`${this.baseUrl}${endpoint}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (retryResponse.ok) {
              const retryData = await retryResponse.json();
              if (retryData && (retryData.nfe || retryData.data || retryData.xml)) {
                return {
                  success: true,
                  data: this.extractNFeData(retryData, chaveNotaFiscal),
                  xml_content: retryData.xml || retryData.xml_content,
                  source: 'nsdocs_api_v2'
                };
              }
            }
          }
        } catch (endpointError: any) {
          console.log(`[NSDocs V2] Erro no endpoint ${endpoint}:`, endpointError.message);
          continue;
        }
      }

      return {
        success: false,
        error: 'NFe não encontrada nos serviços disponíveis',
        nfe_not_found: true,
        source: 'nsdocs_api_v2'
      };

    } catch (error: any) {
      console.error('[NSDocs V2] Erro crítico:', error.message);
      return {
        success: false,
        error: `Erro na API NSDocs: ${error.message}`,
        api_error: true,
        source: 'nsdocs_api_v2'
      };
    }
  }

  /**
   * Extrai dados estruturados da resposta da API
   */
  private extractNFeData(apiResponse: any, chaveNotaFiscal: string): any {
    console.log('[NSDocs V2] Extraindo dados da NFe');
    
    // Tentar diferentes estruturas de resposta
    const nfeData = apiResponse.nfe || apiResponse.data || apiResponse;
    
    if (!nfeData) {
      console.log('[NSDocs V2] Estrutura de dados não reconhecida');
      return null;
    }

    // Extrair informações básicas
    const extractedData = {
      id: `nfe_${chaveNotaFiscal}`,
      chave_nota_fiscal: chaveNotaFiscal,
      numero_nota: this.getNestedValue(nfeData, ['numero', 'nNF', 'numeroNota']) || '',
      serie_nota: this.getNestedValue(nfeData, ['serie', 'serie', 'serieNota']) || '',
      data_hora_emissao: this.getNestedValue(nfeData, ['dataEmissao', 'dhEmi', 'dataHoraEmissao']) || '',
      natureza_operacao: this.getNestedValue(nfeData, ['naturezaOperacao', 'natOp']) || '',
      
      // Dados do emitente
      emitente_cnpj: this.getNestedValue(nfeData, ['emitente.cnpj', 'emit.CNPJ', 'emitente.CNPJ']) || '',
      emitente_razao_social: this.getNestedValue(nfeData, ['emitente.razaoSocial', 'emit.xNome', 'emitente.xNome']) || '',
      emitente_telefone: this.getNestedValue(nfeData, ['emitente.telefone', 'emit.enderEmit.fone', 'emitente.fone']) || '',
      emitente_uf: this.getNestedValue(nfeData, ['emitente.uf', 'emit.enderEmit.UF', 'emitente.UF']) || '',
      emitente_cidade: this.getNestedValue(nfeData, ['emitente.cidade', 'emit.enderEmit.xMun', 'emitente.xMun']) || '',
      emitente_bairro: this.getNestedValue(nfeData, ['emitente.bairro', 'emit.enderEmit.xBairro', 'emitente.xBairro']) || '',
      emitente_endereco: this.getNestedValue(nfeData, ['emitente.endereco', 'emit.enderEmit.xLgr', 'emitente.xLgr']) || '',
      emitente_numero: this.getNestedValue(nfeData, ['emitente.numero', 'emit.enderEmit.nro', 'emitente.nro']) || '',
      emitente_cep: this.getNestedValue(nfeData, ['emitente.cep', 'emit.enderEmit.CEP', 'emitente.CEP']) || '',
      
      // Dados do destinatário
      destinatario_cnpj: this.getNestedValue(nfeData, ['destinatario.cnpj', 'dest.CNPJ', 'destinatario.CNPJ']) || '',
      destinatario_razao_social: this.getNestedValue(nfeData, ['destinatario.razaoSocial', 'dest.xNome', 'destinatario.xNome']) || '',
      destinatario_telefone: this.getNestedValue(nfeData, ['destinatario.telefone', 'dest.enderDest.fone', 'destinatario.fone']) || '',
      destinatario_uf: this.getNestedValue(nfeData, ['destinatario.uf', 'dest.enderDest.UF', 'destinatario.UF']) || '',
      destinatario_cidade: this.getNestedValue(nfeData, ['destinatario.cidade', 'dest.enderDest.xMun', 'destinatario.xMun']) || '',
      destinatario_bairro: this.getNestedValue(nfeData, ['destinatario.bairro', 'dest.enderDest.xBairro', 'destinatario.xBairro']) || '',
      destinatario_endereco: this.getNestedValue(nfeData, ['destinatario.endereco', 'dest.enderDest.xLgr', 'destinatario.xLgr']) || '',
      destinatario_numero: this.getNestedValue(nfeData, ['destinatario.numero', 'dest.enderDest.nro', 'destinatario.nro']) || '',
      destinatario_cep: this.getNestedValue(nfeData, ['destinatario.cep', 'dest.enderDest.CEP', 'destinatario.CEP']) || '',
      
      // Totais
      quantidade_volumes: this.getNestedValue(nfeData, ['volumes', 'vol.qVol', 'quantidadeVolumes']) || '1',
      valor_nota_fiscal: this.getNestedValue(nfeData, ['total.vNF', 'ICMSTot.vNF', 'valorTotal']) || '0.00',
      peso_bruto: this.getNestedValue(nfeData, ['peso.pesoB', 'vol.pesoB', 'pesoBruto']) || '0.00',
      
      // Campos adicionais
      informacoes_complementares: this.getNestedValue(nfeData, ['informacoesComplementares', 'infAdic.infCpl']) || '',
      numero_pedido: this.getNestedValue(nfeData, ['numeroPedido', 'pedido']) || '',
      operacao: 'Entrada',
      cliente_retira: 'Não',
      tipo_frete: 'CIF',
      custo_extra: '0.00'
    };

    console.log('[NSDocs V2] Dados extraídos com sucesso:', {
      numero_nota: extractedData.numero_nota,
      emitente: extractedData.emitente_razao_social,
      destinatario: extractedData.destinatario_razao_social
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
  const service = new NSDOcsAPIService(clientId, clientSecret);
  return await service.fetchNFeXML(chaveNotaFiscal);
}