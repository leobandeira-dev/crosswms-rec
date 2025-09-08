/**
 * Logística da Informação API Integration Service
 * 
 * Integração com a API da FR Consultores para consulta de NFe
 * URL: https://ws.logisticadainformacao.srv.br/consultanfe/consultanfe.asmx
 */

export interface LogisticaInformacaoResponse {
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

export class LogisticaInformacaoService {
  private cnpj: string;
  private token: string;
  private baseUrl = 'https://ws.logisticadainformacao.srv.br/ConsultaNFe/ConsultaNFe.asmx';

  constructor(cnpj: string, token: string) {
    this.cnpj = cnpj;
    this.token = token;
  }

  /**
   * Busca NFe XML usando SOAP request
   */
  async fetchNFeXML(chaveNotaFiscal: string): Promise<LogisticaInformacaoResponse> {
    try {
      console.log(`[Logística Info] Buscando chave: ${chaveNotaFiscal}`);

      // Limpar e validar chave NFe
      const cleanKey = chaveNotaFiscal.replace(/\D/g, ''); // Remove caracteres não numéricos
      
      if (cleanKey.length !== 44) {
        return {
          success: false,
          error: `Chave NFe deve ter exatamente 44 dígitos. Chave fornecida: ${chaveNotaFiscal} (${cleanKey.length} dígitos válidos)`,
          invalid_xml: true,
          source: 'logistica_validation'
        };
      }

      console.log(`[Logística Info] Chave validada e limpa: ${cleanKey}`);

      // Criar envelope SOAP para ConsultaNFe
      const soapEnvelope = this.createSOAPEnvelope(this.cnpj, this.token, cleanKey);

      console.log(`[Logística Info] Enviando requisição SOAP para: ${this.baseUrl}`);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
          'SOAPAction': '"http://tempuri.org/ConsultaNFe"',
          'User-Agent': 'CrossWMS/2.1'
        },
        body: soapEnvelope
      });

      console.log(`[Logística Info] Status da resposta: ${response.status}`);

      if (!response.ok) {
        return {
          success: false,
          error: `Erro HTTP: ${response.status} - ${response.statusText}`,
          api_error: true,
          source: 'logistica_http_error'
        };
      }

      const responseText = await response.text();
      console.log(`[Logística Info] Resposta recebida (primeiros 500 chars):`, responseText.substring(0, 500));
      console.log(`[Logística Info] Resposta completa (para debug):`, responseText);

      // Processar resposta SOAP
      const result = this.parseSOAPResponse(responseText);

      if (result.success && result.xml_content) {
        // Extrair dados estruturados do XML
        const extractedData = this.extractNFeData(result.xml_content, chaveNotaFiscal);
        
        return {
          success: true,
          data: extractedData,
          xml_content: result.xml_content,
          source: 'logistica_informacao'
        };
      }

      return result;

    } catch (error: any) {
      console.error(`[Logística Info] Erro crítico:`, error);
      
      return {
        success: false,
        error: `Erro crítico: ${error.message}`,
        api_error: true,
        source: 'logistica_critical_error'
      };
    }
  }

  /**
   * Cria envelope SOAP para ConsultaNFe
   */
  private createSOAPEnvelope(cnpj: string, token: string, chaveNFe: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                 xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <ConsultaNFe xmlns="http://tempuri.org/">
      <CNPJ>${cnpj}</CNPJ>
      <Token>${token}</Token>
      <chDoc>${chaveNFe}</chDoc>
    </ConsultaNFe>
  </soap12:Body>
</soap12:Envelope>`;
  }

  /**
   * Processa resposta SOAP e extrai XML da NFe
   */
  private parseSOAPResponse(responseText: string): LogisticaInformacaoResponse {
    try {
      console.log(`[Logística Info] Analisando resposta SOAP...`);
      
      // PRIMEIRO: Verificar se há erro na resposta ANTES de tentar extrair XML
      const statusMatch = responseText.match(/<StatusConsulta>(\d+)<\/StatusConsulta>/);
      const descMatch = responseText.match(/<StatusDescricao>(.*?)<\/StatusDescricao>/);
      
      if (statusMatch && statusMatch[1] !== '1') {
        const errorCode = statusMatch[1];
        const errorDesc = descMatch ? descMatch[1] : 'Erro desconhecido';
        
        console.log(`[Logística Info] Erro detectado - Código: ${errorCode}, Descrição: ${errorDesc}`);
        
        // Mapear códigos de erro específicos conforme documentação
        let mappedError = `Erro ${errorCode}: ${errorDesc}`;
        let errorType = 'api_error';
        
        switch (errorCode) {
          case '1':
            mappedError = 'Usuário/Senha Inválida - Verifique as credenciais';
            errorType = 'auth_error';
            break;
          case '2':
            mappedError = 'Créditos Expirados - Entre em contato com a equipe comercial';
            errorType = 'api_error';
            break;
          case '3':
            mappedError = 'NFe Inexistente no Portal Nacional';
            errorType = 'nfe_not_found';
            break;
          case '33':
            mappedError = 'Chave NFe com formato inválido ou não encontrada na base da Logística da Informação. \n\nPossíveis causas:\n• A NFe não existe nesta base de dados\n• A chave pode estar incorreta\n• A NFe pode não estar disponível neste provedor';
            errorType = 'nfe_not_found';
            break;
          case '4':
            mappedError = 'Falha na Consulta - Tente novamente em alguns momentos';
            errorType = 'api_error';
            break;
          case '7':
            mappedError = 'Portal da NFe indisponível';
            errorType = 'api_error';
            break;
          case '19':
            mappedError = 'NFe emitida em contingência e ainda não autorizada pela SEFAZ';
            errorType = 'nfe_not_found';
            break;
          default:
            mappedError = `${errorDesc} (Código: ${errorCode})`;
            break;
        }
        
        return {
          success: false,
          error: mappedError,
          [errorType]: true,
          source: 'logistica_api_error'
        };
      }

      // SEGUNDO: Se não há erro, tentar extrair XML
      const patterns = [
        /<ConsultaNFeResult>(.*?)<\/ConsultaNFeResult>/s,
        /<ConsultaNFe.*?Result>(.*?)<\/ConsultaNFe.*?Result>/s,
        /<.*?Result>(.*?)<\/.*?Result>/s
      ];

      let xmlContent = '';
      let foundMatch = false;

      for (const pattern of patterns) {
        const match = responseText.match(pattern);
        if (match && match[1]) {
          xmlContent = match[1].trim();
          foundMatch = true;
          console.log(`[Logística Info] Padrão encontrado, conteúdo extraído (${xmlContent.length} chars)`);
          break;
        }
      }

      if (!foundMatch) {
        console.log(`[Logística Info] Nenhum padrão de resultado encontrado.`);
        return {
          success: false,
          error: 'XML da NFe não encontrado na resposta SOAP',
          nfe_not_found: true,
          source: 'logistica_no_xml'
        };
      }

      // Decodificar entidades HTML/XML se necessário
      xmlContent = xmlContent
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&apos;/g, "'");

      console.log(`[Logística Info] XML decodificado (primeiros 200 chars):`, xmlContent.substring(0, 200));

      // TERCEIRO: Agora verificar se o conteúdo decodificado contém erros
      console.log(`[Logística Info] Verificando erros no XML decodificado...`);
      const statusMatchDecoded = xmlContent.match(/<StatusConsulta>(\d+)<\/StatusConsulta>/);
      const descMatchDecoded = xmlContent.match(/<StatusDescricao>(.*?)<\/StatusDescricao>/);
      
      console.log(`[Logística Info] Status match:`, statusMatchDecoded);
      console.log(`[Logística Info] Desc match:`, descMatchDecoded);
      
      if (statusMatchDecoded && statusMatchDecoded[1] !== '1') {
        const errorCode = statusMatchDecoded[1];
        const errorDesc = descMatchDecoded ? descMatchDecoded[1] : 'Erro desconhecido';
        
        console.log(`[Logística Info] Erro detectado no XML decodificado - Código: ${errorCode}, Descrição: ${errorDesc}`);
        
        // Mapear códigos de erro específicos conforme documentação
        let mappedError = `Erro ${errorCode}: ${errorDesc}`;
        let errorType = 'api_error';
        
        switch (errorCode) {
          case '1':
            mappedError = 'Usuário/Senha Inválida - Verifique as credenciais';
            errorType = 'auth_error';
            break;
          case '2':
            mappedError = 'Créditos Expirados - Entre em contato com a equipe comercial';
            errorType = 'api_error';
            break;
          case '3':
            mappedError = 'NFe Inexistente no Portal Nacional';
            errorType = 'nfe_not_found';
            break;
          case '33':
            mappedError = 'Chave NFe com formato inválido ou não encontrada na base da Logística da Informação. \n\nPossíveis causas:\n• A NFe não existe nesta base de dados\n• A chave pode estar incorreta\n• A NFe pode não estar disponível neste provedor';
            errorType = 'nfe_not_found';
            break;
          case '4':
            mappedError = 'Falha na Consulta - Tente novamente em alguns momentos';
            errorType = 'api_error';
            break;
          case '7':
            mappedError = 'Portal da NFe indisponível';
            errorType = 'api_error';
            break;
          case '19':
            mappedError = 'NFe emitida em contingência e ainda não autorizada pela SEFAZ';
            errorType = 'nfe_not_found';
            break;
          default:
            mappedError = `${errorDesc} (Código: ${errorCode})`;
            break;
        }
        
        return {
          success: false,
          error: mappedError,
          [errorType]: true,
          source: 'logistica_api_error'
        };
      }

      // QUARTO: Verificação se é XML válido de NFe
      const hasNFeTag = xmlContent.includes('<NFe') || xmlContent.includes('<nfe') || 
                        xmlContent.includes('<nfeProc') || xmlContent.includes('<NFE');
      
      if (!hasNFeTag) {
        console.log(`[Logística Info] Conteúdo não é XML de NFe válido:`, xmlContent.substring(0, 100));
        
        return {
          success: false,
          error: 'Resposta não contém XML de NFe válido',
          nfe_not_found: true,
          source: 'logistica_invalid_xml'
        };
      }

      console.log(`[Logística Info] XML válido de NFe detectado!`);
      
      return {
        success: true,
        xml_content: xmlContent,
        source: 'logistica_informacao'
      };

    } catch (error: any) {
      console.error(`[Logística Info] Erro no parse SOAP:`, error);
      return {
        success: false,
        error: `Erro ao processar resposta SOAP: ${error.message}`,
        api_error: true,
        source: 'logistica_parse_error'
      };
    }
  }

  /**
   * Extrai dados estruturados do XML da NFe
   */
  private extractNFeData(xmlContent: string, chaveNotaFiscal: string): any {
    try {
      // Criar parser DOM para extrair dados
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

      // Função auxiliar para extrair texto de elementos
      const getElementText = (selector: string): string => {
        const element = xmlDoc.querySelector(selector);
        return element?.textContent?.trim() || '';
      };

      // Extrair dados principais da NFe
      const data = {
        chave_nota_fiscal: chaveNotaFiscal,
        numero_nota: getElementText('nNF'),
        serie_nota: getElementText('serie'),
        data_hora_emissao: getElementText('dhEmi'),
        natureza_operacao: getElementText('natOp'),
        operacao: 'Saída', // Padrão para NFe de saída
        cliente_retira: 'Não',

        // Dados do emitente
        emitente_cnpj: getElementText('emit CNPJ'),
        emitente_razao_social: getElementText('emit xNome'),
        emitente_telefone: getElementText('emit fone'),
        emitente_uf: getElementText('emit enderEmit UF'),
        emitente_cidade: getElementText('emit enderEmit xMun'),
        emitente_bairro: getElementText('emit enderEmit xBairro'),
        emitente_endereco: getElementText('emit enderEmit xLgr'),
        emitente_numero: getElementText('emit enderEmit nro'),
        emitente_cep: getElementText('emit enderEmit CEP'),

        // Dados do destinatário
        destinatario_cnpj: getElementText('dest CNPJ'),
        destinatario_razao_social: getElementText('dest xNome'),
        destinatario_telefone: getElementText('dest fone'),
        destinatario_uf: getElementText('dest enderDest UF'),
        destinatario_cidade: getElementText('dest enderDest xMun'),
        destinatario_bairro: getElementText('dest enderDest xBairro'),
        destinatario_endereco: getElementText('dest enderDest xLgr'),
        destinatario_numero: getElementText('dest enderDest nro'),
        destinatario_cep: getElementText('dest enderDest CEP'),

        // Valores e volumes
        quantidade_volumes: getElementText('transp vol qVol') || '1',
        valor_nota_fiscal: getElementText('total ICMSTot vNF'),
        peso_bruto: getElementText('transp vol pesoB'),
        informacoes_complementares: getElementText('infAdic infCpl'),
        tipo_frete: getElementText('transp modFrete') === '0' ? 'CIF' : 'FOB',

        // Extrair número do pedido das informações complementares
        numero_pedido: this.extractPedidoNumber(getElementText('infAdic infCpl'))
      };

      console.log(`[Logística Info] Dados extraídos para NFe ${chaveNotaFiscal}:`, {
        emitente: data.emitente_razao_social,
        destinatario: data.destinatario_razao_social,
        valor: data.valor_nota_fiscal,
        volumes: data.quantidade_volumes
      });

      return data;

    } catch (error: any) {
      console.error(`[Logística Info] Erro ao extrair dados do XML:`, error);
      
      // Retornar dados básicos em caso de erro
      return {
        chave_nota_fiscal: chaveNotaFiscal,
        numero_nota: '',
        serie_nota: '',
        data_hora_emissao: '',
        natureza_operacao: '',
        operacao: 'Saída',
        cliente_retira: 'Não',
        emitente_cnpj: '',
        emitente_razao_social: '',
        destinatario_cnpj: '',
        destinatario_razao_social: '',
        quantidade_volumes: '1',
        valor_nota_fiscal: '0.00',
        peso_bruto: '0.00',
        informacoes_complementares: 'Erro na extração de dados do XML',
        numero_pedido: '',
        tipo_frete: 'CIF'
      };
    }
  }

  /**
   * Extrai número do pedido das informações complementares
   */
  private extractPedidoNumber(infComplementares: string): string {
    if (!infComplementares) return '';
    
    const patterns = [
      /Pedido[:\s]*(\d+)/i,
      /Ped[:\s]*(\d+)/i,
      /PV[:\s]*(\d+)/i,
      /(\d{4,})/
    ];

    for (const pattern of patterns) {
      const match = infComplementares.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return '';
  }

  /**
   * Valida formato da chave NFe
   */
  static validateChaveNFe(chave: string): boolean {
    return /^\d{44}$/.test(chave);
  }
}

/**
 * Função standalone para uso externo
 */
export async function fetchNFeFromLogisticaInformacao(
  chaveNotaFiscal: string,
  cnpj: string = '34579341000185',
  token: string = '5K7WUNCGES1GNIP6DW65JAIW54H111'
): Promise<LogisticaInformacaoResponse> {
  const service = new LogisticaInformacaoService(cnpj, token);
  return await service.fetchNFeXML(chaveNotaFiscal);
}