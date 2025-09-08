import { NotaFiscalSchemaType } from '../components/forms/notaFiscalSchema';

/**
 * Extract data from XML string to populate a NotaFiscal form
 * Supports both nfeProc (processed NFe) and regular NFe formats
 */
export const extractDataFromXml = (xmlString: string): Partial<any> => {
  try {
    console.log("Tentando extrair dados do XML string");
    
    // Parse XML string using DOMParser
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error("Erro ao fazer parse do XML:", parserError.textContent);
      return {};
    }
    
    // Helper function to get text content from element
    const getElementText = (selector: string): string => {
      const element = xmlDoc.querySelector(selector);
      return element?.textContent?.trim() || '';
    };
    
    // Helper function to get attribute value
    const getElementAttribute = (selector: string, attribute: string): string => {
      const element = xmlDoc.querySelector(selector);
      return element?.getAttribute(attribute) || '';
    };
    
    // Try to find NFe data in nfeProc structure first, then fallback to direct NFe
    const infNFeSelector = 'nfeProc NFe infNFe, NFe infNFe, infNFe';
    const infNFeElement = xmlDoc.querySelector(infNFeSelector);
    
    if (!infNFeElement) {
      console.error("Estrutura de XML não reconhecida - infNFe não encontrado");
      return {};
    }
    
    // Extract chave from infNFe Id attribute 
    const chaveNotaFiscal = getElementAttribute(infNFeSelector, 'Id')?.replace('NFe', '') || '';
    
    console.log("Chave NFe encontrada:", chaveNotaFiscal);
    
    // Extract basic NFe identification data
    const numeroNota = getElementText('ide nNF, nNF');
    const serieNota = getElementText('ide serie, serie');
    const dataEmissao = getElementText('ide dhEmi, dhEmi')?.replace('T', ' ')?.substring(0, 19) || '';
    const naturezaOperacao = getElementText('ide natOp, natOp');
    
    // Extract emitente (sender) data
    const emitenteCnpj = getElementText('emit CNPJ, CNPJ').replace(/\D/g, '');
    const emitenteRazaoSocial = getElementText('emit xNome, xNome');
    const emitenteTelefone = getElementText('emit enderEmit fone, enderEmit fone, fone');
    const emitenteUf = getElementText('emit enderEmit UF, enderEmit UF, UF');
    const emitenteCidade = getElementText('emit enderEmit xMun, enderEmit xMun, xMun');
    const emitenteBairro = getElementText('emit enderEmit xBairro, enderEmit xBairro, xBairro');
    const emitenteEndereco = getElementText('emit enderEmit xLgr, enderEmit xLgr, xLgr');
    const emitenteNumero = getElementText('emit enderEmit nro, enderEmit nro, nro');
    const emitenteCep = getElementText('emit enderEmit CEP, enderEmit CEP, CEP').replace(/\D/g, '');
    
    // Extract destinatário (recipient) data
    const destinatarioCnpj = getElementText('dest CNPJ, dest CPF').replace(/\D/g, '');
    const destinatarioRazaoSocial = getElementText('dest xNome, dest xNome');
    const destinatarioTelefone = getElementText('dest enderDest fone, enderDest fone');
    const destinatarioUf = getElementText('dest enderDest UF, enderDest UF');
    const destinatarioCidade = getElementText('dest enderDest xMun, enderDest xMun');
    const destinatarioBairro = getElementText('dest enderDest xBairro, enderDest xBairro');
    const destinatarioEndereco = getElementText('dest enderDest xLgr, enderDest xLgr');
    const destinatarioNumero = getElementText('dest enderDest nro, enderDest nro');
    const destinatarioCep = getElementText('dest enderDest CEP, enderDest CEP').replace(/\D/g, '');
    
    // Extract transport and volume data
    const quantidadeVolumes = getElementText('transp vol qVol, vol qVol') || '1';
    const pesoBruto = getElementText('transp vol pesoB, vol pesoB') || '0';
    const valorNota = getElementText('total ICMSTot vNF, ICMSTot vNF, vNF') || '0';
    
    // Extract additional information and order number
    const informacoesComplementares = getElementText('infAdic infCpl, infCpl');
    
    // Extract order number from products or additional info
    let numeroPedido = getElementText('det prod xPed, prod xPed');
    if (!numeroPedido && informacoesComplementares) {
      const pedidoMatch = informacoesComplementares.match(/Pedido:\s*(\d+)/i) || 
                         informacoesComplementares.match(/Número do Pedido:\s*([^\s]+)/i);
      if (pedidoMatch) {
        numeroPedido = pedidoMatch[1].replace(/-/g, '');
      }
    }
    
    console.log("Dados extraídos:", {
      chaveNotaFiscal,
      numeroNota,
      serieNota,
      emitenteCnpj,
      emitenteRazaoSocial,
      destinatarioCnpj,
      destinatarioRazaoSocial,
      valorNota,
      pesoBruto,
      quantidadeVolumes
    });

    // Return extracted data in the expected format
    return {
      chaveNotaFiscal,
      numeroNota,
      serieNota,
      dataEmissao,
      naturezaOperacao,
      emitenteCnpj,
      emitenteRazaoSocial,
      emitenteTelefone,
      emitenteUf,
      emitenteCidade,
      emitenteBairro,
      emitenteEndereco,
      emitenteNumero,
      emitenteCep,
      destinatarioCnpj,
      destinatarioRazaoSocial,
      destinatarioTelefone,
      destinatarioUf,
      destinatarioCidade,
      destinatarioBairro,
      destinatarioEndereco,
      destinatarioNumero,
      destinatarioCep,
      quantidadeVolumes: parseInt(quantidadeVolumes) || 1,
      valorNota,
      pesoBruto,
      informacoesComplementares,
      numeroPedido
    };
    
  } catch (error) {
    console.error("Erro ao processar XML:", error);
    return {};
  }
};

/**
 * Search for nota fiscal by chave
 * This is a placeholder function for API integration
 */
export const searchNotaFiscalByChave = async (chave: string): Promise<any> => {
  try {
    console.log("Buscando nota fiscal por chave:", chave);
    
    // This would typically make an API call to search for the NFe
    // For now, return null to indicate not found
    return null;
  } catch (error) {
    console.error("Erro ao buscar nota fiscal por chave:", error);
    return null;
  }
};