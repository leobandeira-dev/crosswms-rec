/**
 * CrossXML API Integration Service
 * 
 * Provides NFe XML retrieval integration with CrossXML API service.
 * Based on common Brazilian NFe API patterns for document retrieval.
 * 
 * Features:
 * - Token-based authentication
 * - NFe key validation
 * - Complete NFe data extraction
 * - Error handling with specific error types
 * 
 * Usage:
 *   const crossxml = new CrossXMLService(username, token);
 *   const result = await crossxml.fetchNFeXML(chaveNotaFiscal);
 */

export interface CrossXMLResponse {
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

export class CrossXMLService {
  private apiKey: string;
  private baseUrl = 'https://crossxml.com.br/api/v1';

  constructor(username: string, apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Fetches NFe XML data from CrossXML API using job-based download with fallback
   */
  async fetchNFeXML(chaveNotaFiscal: string): Promise<CrossXMLResponse> {
    try {
      console.log(`[CrossXML] Iniciando busca para chave: ${chaveNotaFiscal}`);

      // Validate NFe key format
      if (!CrossXMLService.validateChaveNFe(chaveNotaFiscal)) {
        return {
          success: false,
          error: 'Chave de NFe inválida. Deve ter exatamente 44 dígitos.',
          source: 'crossxml_validation'
        };
      }

      // Use real API only - no fallback to demo data
      return await this.tryRealAPI(chaveNotaFiscal);

    } catch (error: any) {
      console.error(`[CrossXML] Erro crítico:`, error);
      
      return {
        success: false,
        error: `Erro na API CrossXML: ${error.message}`,
        api_error: true,
        source: 'crossxml_error'
      };
    }
  }

  /**
   * Tries to use the real CrossXML API
   */
  private async tryRealAPI(chaveNotaFiscal: string): Promise<CrossXMLResponse> {
    try {
      // Step 1: Initiate download job
      const jobId = await this.initiateDownloadJob([chaveNotaFiscal]);
      if (!jobId) {
        return {
          success: false,
          error: 'Falha ao iniciar job de download na CrossXML',
          api_error: true,
          source: 'crossxml_job_init'
        };
      }

      console.log(`[CrossXML] Job iniciado com ID: ${jobId}`);

      // Step 2: Monitor job completion (extended timeout for real processing)
      const jobResult = await this.monitorJobWithTimeout(jobId, 60000); // 60 seconds max
      if (!jobResult.success) {
        return jobResult;
      }

      // Step 3: Get file list and download XML
      const files = await this.getJobFiles(jobId);
      if (!files || files.length === 0) {
        return {
          success: false,
          error: 'Nenhum arquivo XML encontrado para esta chave',
          nfe_not_found: true,
          source: 'crossxml_no_files'
        };
      }

      // Step 4: Download and parse the XML file
      const xmlContent = await this.downloadXMLFile(jobId, files[0].filename);
      if (!xmlContent) {
        return {
          success: false,
          error: 'Falha ao baixar conteúdo XML',
          api_error: true,
          source: 'crossxml_download'
        };
      }

      // Step 5: Extract NFe data from XML
      const extractedData = await this.extractNFeDataFromXML(xmlContent, chaveNotaFiscal);
      
      return {
        success: true,
        data: extractedData,
        xml_content: xmlContent,
        source: 'crossxml_api'
      };

    } catch (error: any) {
      return {
        success: false,
        error: `Erro na API real: ${error.message}`,
        api_error: true,
        source: 'crossxml_real_api_error'
      };
    }
  }

  /**
   * Creates demo NFe data for testing when real API fails
   */
  private createDemoNFeData(chaveNotaFiscal: string): any {
    // Extract basic info from NFe key
    const uf = chaveNotaFiscal.substring(0, 2);
    const numeroNota = chaveNotaFiscal.substring(25, 34);
    const serie = chaveNotaFiscal.substring(22, 25);
    
    return {
      chave_nota_fiscal: chaveNotaFiscal,
      data_hora_emissao: '2025-01-04T10:30:00-03:00',
      numero_nota: numeroNota,
      serie_nota: serie,
      natureza_operacao: 'Venda de mercadorias (CrossXML Demo)',
      operacao: 'Entrada',
      cliente_retira: 'Não',

      // Emitente (Sender) - demo data
      emitente_cnpj: '12345678000195',
      emitente_razao_social: 'EMPRESA EMITENTE LTDA (CrossXML Demo)',
      emitente_telefone: '(11) 99999-8888',
      emitente_uf: this.getUfFromCode(uf),
      emitente_cidade: 'São Paulo',
      emitente_bairro: 'Centro',
      emitente_endereco: 'Rua das Empresas, 123',
      emitente_numero: '123',
      emitente_cep: '01000-000',

      // Destinatário (Recipient) - demo data
      destinatario_cnpj: '98765432000186',
      destinatario_razao_social: 'EMPRESA DESTINATARIA S/A (CrossXML Demo)',
      destinatario_telefone: '(21) 88888-7777',
      destinatario_uf: 'RJ',
      destinatario_cidade: 'Rio de Janeiro',
      destinatario_bairro: 'Copacabana',
      destinatario_endereco: 'Av. Atlântica, 456',
      destinatario_numero: '456',
      destinatario_cep: '22000-000',

      // Financial and volume information - demo data
      quantidade_volumes: '3',
      valor_nota_fiscal: '1875.50',
      peso_bruto: '25.8',
      informacoes_complementares: 'Mercadorias transportadas via CrossXML API. Pedido: 98765',
      numero_pedido: '98765',
      
      // Additional fields
      tipo_frete: 'CIF',
      custo_extra: ''
    };
  }

  /**
   * Gets UF name from code
   */
  private getUfFromCode(code: string): string {
    const ufMap: { [key: string]: string } = {
      '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
      '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL', '28': 'SE', '29': 'BA',
      '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP',
      '41': 'PR', '42': 'SC', '43': 'RS',
      '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF'
    };
    return ufMap[code] || 'SP';
  }

  /**
   * Initiates download job for invoice keys
   */
  private async initiateDownloadJob(invoiceKeys: string[]): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoice_keys: invoiceKeys
        })
      });

      if (!response.ok) {
        console.error(`[CrossXML] Erro ao iniciar job: ${response.status} ${response.statusText}`);
        return null;
      }

      const result = await response.json();
      return result.job_id;
      
    } catch (error: any) {
      console.error(`[CrossXML] Erro na requisição de job:`, error);
      return null;
    }
  }

  /**
   * Monitors job until completion with custom timeout
   */
  private async monitorJobWithTimeout(jobId: string, timeoutMs: number): Promise<CrossXMLResponse> {
    const maxAttempts = Math.ceil(timeoutMs / 3000); // Check every 3 seconds for faster response
    let attempts = 0;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(`${this.baseUrl}/jobs/${jobId}`, {
          headers: {
            'X-API-Key': this.apiKey
          }
        });

        if (!response.ok) {
          console.error(`[CrossXML] Erro status check: ${response.status}`);
          return {
            success: false,
            error: `Erro ao verificar status do job: ${response.status}`,
            api_error: true,
            source: 'crossxml_job_status'
          };
        }

        const status = await response.json();
        const progress = status.progress?.percentage || 0;
        
        console.log(`[CrossXML] Job ${jobId} - Status: ${status.status} - Progresso: ${progress}% - Tentativa: ${attempts + 1}/${maxAttempts}`);

        if (status.status === 'completed') {
          console.log(`[CrossXML] Job ${jobId} concluído! Files disponíveis: ${status.files?.length || 0}`);
          return { success: true, source: 'crossxml_job_complete' };
        } else if (status.status === 'failed') {
          console.error(`[CrossXML] Job ${jobId} falhou:`, status.errors);
          return {
            success: false,
            error: `Job falhou: ${status.errors?.join(', ') || 'Erro desconhecido'}`,
            api_error: true,
            source: 'crossxml_job_failed'
          };
        } else if (status.status === 'running' && progress > 0) {
          console.log(`[CrossXML] Job ${jobId} em progresso: ${progress}%`);
        }

        // Wait 3 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 3000));
        attempts++;

      } catch (error: any) {
        console.error(`[CrossXML] Erro ao monitorar job:`, error);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    console.error(`[CrossXML] Timeout no job ${jobId} após ${timeoutMs}ms`);
    return {
      success: false,
      error: `Timeout aguardando conclusão do job (${timeoutMs/1000}s)`,
      api_error: true,
      source: 'crossxml_timeout'
    };
  }

  /**
   * Monitors job until completion (legacy method)
   */
  private async monitorJob(jobId: string): Promise<CrossXMLResponse> {
    return this.monitorJobWithTimeout(jobId, 120000); // 2 minutes default
  }

  /**
   * Gets list of files from completed job
   */
  private async getJobFiles(jobId: string): Promise<any[] | null> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}/files`, {
        headers: {
          'X-API-Key': this.apiKey
        }
      });

      if (!response.ok) {
        console.error(`[CrossXML] Erro ao listar arquivos: ${response.status}`);
        return null;
      }

      const data = await response.json();
      return data.files;
      
    } catch (error: any) {
      console.error(`[CrossXML] Erro ao obter lista de arquivos:`, error);
      return null;
    }
  }

  /**
   * Downloads XML file content
   */
  private async downloadXMLFile(jobId: string, filename: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/jobs/${jobId}/files/${filename}`, {
        headers: {
          'X-API-Key': this.apiKey
        }
      });

      if (!response.ok) {
        console.error(`[CrossXML] Erro ao baixar arquivo: ${response.status}`);
        return null;
      }

      return await response.text();
      
    } catch (error: any) {
      console.error(`[CrossXML] Erro ao baixar XML:`, error);
      return null;
    }
  }

  /**
   * Extracts NFe data from XML content
   */
  private async extractNFeDataFromXML(xmlContent: string, chaveNotaFiscal: string): Promise<any> {
    try {
      // Use the same XML parsing logic as NSDocs for consistency
      const { parseStringPromise } = await import('xml2js');
      const result = await parseStringPromise(xmlContent, { 
        explicitArray: false,
        ignoreAttrs: false,
        mergeAttrs: true
      });

      // Navigate through the XML structure
      let nfeData = result;
      if (result.nfeProc) {
        nfeData = result.nfeProc.NFe || result.nfeProc;
      }
      if (nfeData.NFe) {
        nfeData = nfeData.NFe;
      }
      if (nfeData.infNFe) {
        nfeData = nfeData.infNFe;
      }

      const ide = nfeData.ide || {};
      const emit = nfeData.emit || {};
      const dest = nfeData.dest || {};
      const total = nfeData.total || {};
      const icmsTotal = total.ICMSTot || {};
      const transp = nfeData.transp || {};
      const vol = transp.vol || {};
      const infAdic = nfeData.infAdic || {};

      // Extract volume data properly
      let volumeData: any = {};
      if (Array.isArray(vol)) {
        volumeData = vol[0] || {};
      } else if (vol) {
        volumeData = vol;
      }

      // Extract complementary information for order number
      const infCpl = infAdic.infCpl || '';
      const pedidoMatch = infCpl.match(/Pedido[:\s]*(\d+)/i);
      const numeroPedido = pedidoMatch ? pedidoMatch[1] : '';

      return {
        chave_nota_fiscal: chaveNotaFiscal,
        data_hora_emissao: ide.dhEmi || ide.dEmi || '',
        numero_nota: ide.nNF || '',
        serie_nota: ide.serie || '',
        natureza_operacao: ide.natOp || '',
        operacao: 'Entrada',
        cliente_retira: 'Não',

        // Emitente (Sender)
        emitente_cnpj: emit.CNPJ || '',
        emitente_razao_social: emit.xNome || '',
        emitente_telefone: emit.enderEmit?.fone || '',
        emitente_uf: emit.enderEmit?.UF || '',
        emitente_cidade: emit.enderEmit?.xMun || '',
        emitente_bairro: emit.enderEmit?.xBairro || '',
        emitente_endereco: emit.enderEmit?.xLgr || '',
        emitente_numero: emit.enderEmit?.nro || '',
        emitente_cep: emit.enderEmit?.CEP || '',

        // Destinatário (Recipient)
        destinatario_cnpj: dest.CNPJ || dest.CPF || '',
        destinatario_razao_social: dest.xNome || '',
        destinatario_telefone: dest.enderDest?.fone || '',
        destinatario_uf: dest.enderDest?.UF || '',
        destinatario_cidade: dest.enderDest?.xMun || '',
        destinatario_bairro: dest.enderDest?.xBairro || '',
        destinatario_endereco: dest.enderDest?.xLgr || '',
        destinatario_numero: dest.enderDest?.nro || '',
        destinatario_cep: dest.enderDest?.CEP || '',

        // Financial and volume information
        quantidade_volumes: volumeData.qVol || '1',
        valor_nota_fiscal: icmsTotal.vNF || '0',
        peso_bruto: volumeData.pesoB || '0',
        informacoes_complementares: infCpl,
        numero_pedido: numeroPedido,
        
        // Additional fields
        tipo_frete: 'CIF',
        custo_extra: ''
      };

    } catch (error: any) {
      console.error(`[CrossXML] Erro ao extrair dados do XML:`, error);
      
      // Return minimal data structure on extraction error
      return {
        chave_nota_fiscal: chaveNotaFiscal,
        numero_nota: '',
        emitente_razao_social: 'Erro na extração de dados',
        destinatario_razao_social: 'Erro na extração de dados',
        valor_nota_fiscal: '0',
        peso_bruto: '0',
        quantidade_volumes: '1'
      };
    }
  }





  /**
   * Validates NFe access key format
   */
  static validateChaveNFe(chave: string): boolean {
    return typeof chave === 'string' && 
           chave.length === 44 && 
           /^\d{44}$/.test(chave);
  }

  /**
   * Formats CNPJ for display
   */
  static formatCNPJ(cnpj: string): string {
    if (!cnpj || cnpj.length !== 14) return cnpj;
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  }

  /**
   * Formats CEP for display
   */
  static formatCEP(cep: string): string {
    if (!cep || cep.length !== 8) return cep;
    return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }
}

/**
 * Standalone function for external use
 */
export async function fetchNFeFromCrossXML(
  chaveNotaFiscal: string,
  username: string,
  token: string
): Promise<CrossXMLResponse> {
  const service = new CrossXMLService(username, token);
  return await service.fetchNFeXML(chaveNotaFiscal);
}