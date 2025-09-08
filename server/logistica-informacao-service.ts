/**
 * Serviço para integração com API da Logística da Informação
 * Implementa consulta de NFe via SOAP
 */

export interface LogisticaInformacaoResponse {
  success: boolean;
  data?: any;
  xml_content?: string;
  error?: string;
  nfe_not_found?: boolean;
  auth_error?: boolean;
  api_error?: boolean;
  invalid_xml?: boolean;
  source?: string;
}

export class LogisticaInformacaoService {
  private cnpj: string;
  private token: string;
  private baseUrl = 'https://ws.logisticadainformacao.srv.br/consultanfe/consultanfe.asmx';

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
          'Content-Type': 'text/xml; charset=utf-8',
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

      // Processar resposta SOAP
      const result = this.parseSOAPResponse(responseText);

      if (result.success && result.xml_content) {
        console.log(`[Logística Info] Preparando extração de dados para chave: ${chaveNotaFiscal}`);
        console.log(`[Logística Info] XML recebido possui ${result.xml_content.length} caracteres`);
        
        // Extrair dados estruturados do XML
        const extractedData = this.extractNFeData(result.xml_content, chaveNotaFiscal);
        
        console.log(`[Logística Info] Dados extraídos completos:`, JSON.stringify(extractedData, null, 2));
        
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
   * Cria envelope SOAP para ConsultaNFe - seguindo documentação oficial
   */
  private createSOAPEnvelope(cnpj: string, token: string, chaveNFe: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ConsultaNFe xmlns="http://tempuri.org/">
      <CNPJ>${cnpj}</CNPJ>
      <Token>${token}</Token>
      <chDOC>${chaveNFe}</chDOC>
    </ConsultaNFe>
  </soap:Body>
</soap:Envelope>`;
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
        
        return this.mapApiError(errorCode, errorDesc);
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

      // TERCEIRO: Verificar se o conteúdo decodificado contém erros
      const statusMatchDecoded = xmlContent.match(/<StatusConsulta>(\d+)<\/StatusConsulta>/);
      const descMatchDecoded = xmlContent.match(/<StatusDescricao>(.*?)<\/StatusDescricao>/);
      
      if (statusMatchDecoded && statusMatchDecoded[1] !== '1') {
        const errorCode = statusMatchDecoded[1];
        const errorDesc = descMatchDecoded ? descMatchDecoded[1] : 'Erro desconhecido';
        
        console.log(`[Logística Info] Erro detectado no XML decodificado - Código: ${errorCode}, Descrição: ${errorDesc}`);
        
        return this.mapApiError(errorCode, errorDesc);
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
   * Mapeia códigos de erro da API conforme documentação
   */
  private mapApiError(errorCode: string, errorDesc: string): LogisticaInformacaoResponse {
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

  /**
   * Extrai dados estruturados do XML da NFe
   */
  private extractNFeData(xmlContent: string, chaveNotaFiscal: string): any {
    try {
      console.log('[Logística Info] Iniciando extração de dados do XML...');
      
      // Usar regex para extrair dados diretamente do XML
      const extractValue = (pattern: RegExp, fallback = '') => {
        const match = xmlContent.match(pattern);
        return match ? match[1].trim() : fallback;
      };

      // Dados básicos da NFe
      const numeroNota = extractValue(/<nNF>(\d+)<\/nNF>/);
      const serieNota = extractValue(/<serie>(\d+)<\/serie>/);
      const dataEmissao = extractValue(/<dhEmi>(.*?)<\/dhEmi>/);
      const naturezaOperacao = extractValue(/<natOp>(.*?)<\/natOp>/);

      // Dados do emitente
      const emitenteCnpj = extractValue(/<emit>[\s\S]*?<CNPJ>(\d+)<\/CNPJ>/);
      const emitenteNome = extractValue(/<emit>[\s\S]*?<xNome>(.*?)<\/xNome>/);
      const emitenteTelefone = extractValue(/<emit>[\s\S]*?<fone>(\d+)<\/fone>/);
      const emitenteUf = extractValue(/<emit>[\s\S]*?<enderEmit>[\s\S]*?<UF>(.*?)<\/UF>/);
      const emitenteCidade = extractValue(/<emit>[\s\S]*?<enderEmit>[\s\S]*?<xMun>(.*?)<\/xMun>/);
      const emitenteBairro = extractValue(/<emit>[\s\S]*?<enderEmit>[\s\S]*?<xBairro>(.*?)<\/xBairro>/);
      const emitenteEndereco = extractValue(/<emit>[\s\S]*?<enderEmit>[\s\S]*?<xLgr>(.*?)<\/xLgr>/);
      const emitenteNumero = extractValue(/<emit>[\s\S]*?<enderEmit>[\s\S]*?<nro>(.*?)<\/nro>/);
      const emitenteCep = extractValue(/<emit>[\s\S]*?<enderEmit>[\s\S]*?<CEP>(\d+)<\/CEP>/);

      // Dados do destinatário
      const destinatarioCnpj = extractValue(/<dest>[\s\S]*?<CNPJ>(\d+)<\/CNPJ>/);
      const destinatarioNome = extractValue(/<dest>[\s\S]*?<xNome>(.*?)<\/xNome>/);
      const destinatarioTelefone = extractValue(/<dest>[\s\S]*?<fone>(\d+)<\/fone>/);
      const destinatarioUf = extractValue(/<dest>[\s\S]*?<enderDest>[\s\S]*?<UF>(.*?)<\/UF>/);
      const destinatarioCidade = extractValue(/<dest>[\s\S]*?<enderDest>[\s\S]*?<xMun>(.*?)<\/xMun>/);
      const destinatarioBairro = extractValue(/<dest>[\s\S]*?<enderDest>[\s\S]*?<xBairro>(.*?)<\/xBairro>/);
      const destinatarioEndereco = extractValue(/<dest>[\s\S]*?<enderDest>[\s\S]*?<xLgr>(.*?)<\/xLgr>/);
      const destinatarioNumero = extractValue(/<dest>[\s\S]*?<enderDest>[\s\S]*?<nro>(.*?)<\/nro>/);
      const destinatarioCep = extractValue(/<dest>[\s\S]*?<enderDest>[\s\S]*?<CEP>(\d+)<\/CEP>/);

      // Valores totais
      const valorTotal = extractValue(/<vNF>([\d.]+)<\/vNF>/);
      const valorProdutos = extractValue(/<vProd>([\d.]+)<\/vProd>/);

      // Dados de transporte
      const quantidadeVolumes = extractValue(/<qVol>(\d+)<\/qVol>/, '1');
      const pesoLiquido = extractValue(/<pesoL>([\d.]+)<\/pesoL>/, '0.00');
      const pesoBruto = extractValue(/<pesoB>([\d.]+)<\/pesoB>/, '0.00');

      // Informações complementares
      const informacoesComplementares = extractValue(/<infCpl>(.*?)<\/infCpl>/);

      // Extrair número do pedido das informações complementares se existir
      const numeroPedidoMatch = informacoesComplementares.match(/Pedido[:\s]*(\d+)/i);
      const numeroPedido = numeroPedidoMatch ? numeroPedidoMatch[1] : '';

      console.log('[Logística Info] Dados extraídos:', {
        numeroNota,
        emitenteCnpj: emitenteCnpj.substring(0, 8) + '...',
        emitenteCidade: emitenteCidade,
        destinatarioNome: destinatarioNome.substring(0, 20) + '...',
        destinatarioCidade: destinatarioCidade,
        valorTotal
      });

      return {
        chave_nota_fiscal: chaveNotaFiscal,
        numero_nota: numeroNota,
        serie_nota: serieNota,
        data_hora_emissao: dataEmissao ? dataEmissao.replace('T', ' ').substring(0, 19) : '',
        emitente_cnpj: emitenteCnpj,
        emitente_razao_social: emitenteNome,
        emitente_telefone: emitenteTelefone,
        emitente_uf: emitenteUf,
        emitente_cidade: emitenteCidade,
        emitente_bairro: emitenteBairro,
        emitente_endereco: emitenteEndereco,
        emitente_numero: emitenteNumero,
        emitente_cep: emitenteCep,
        destinatario_cnpj: destinatarioCnpj,
        destinatario_razao_social: destinatarioNome,
        destinatario_telefone: destinatarioTelefone,
        destinatario_uf: destinatarioUf,
        destinatario_cidade: destinatarioCidade,
        destinatario_bairro: destinatarioBairro,
        destinatario_endereco: destinatarioEndereco,
        destinatario_numero: destinatarioNumero,
        destinatario_cep: destinatarioCep,
        valor_nota_fiscal: valorTotal || '0.00',
        valor_produtos: valorProdutos || '0.00',
        peso_bruto: pesoBruto,
        peso_liquido: pesoLiquido,
        quantidade_volumes: quantidadeVolumes,
        natureza_operacao: naturezaOperacao,
        informacoes_complementares: informacoesComplementares,
        numero_pedido: numeroPedido,
        source: 'logistica_informacao'
      };
    } catch (error) {
      console.error('[Logística Info] Erro ao extrair dados:', error);
      return {
        chave_nota_fiscal: chaveNotaFiscal,
        source: 'logistica_informacao',
        error: 'Erro na extração de dados'
      };
    }
  }

  /**
   * Valida formato da chave NFe
   */
  static validateChaveNFe(chave: string): boolean {
    const cleanKey = chave.replace(/\D/g, '');
    return cleanKey.length === 44;
  }
}