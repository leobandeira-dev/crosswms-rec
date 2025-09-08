
/**
 * Utilitário para extrair informações de documentos XML baseado em caminhos específicos
 */

// Função para extrair valores específicos de um XML baseado em um caminho de acesso
export const extractValueFromXml = (xmlObj: any, path: string): string => {
  try {
    const parts = path.split(':');
    let current = xmlObj;
    
    for (const part of parts) {
      if (!current || typeof current !== 'object') {
        return '';
      }
      
      // Tenta acessar o campo com letra minúscula primeiro (padrão comum)
      if (current[part.toLowerCase()]) {
        current = current[part.toLowerCase()];
      } 
      // Tenta acessar com a chave exata
      else if (current[part]) {
        current = current[part];
      } 
      // Tenta acessar com a primeira letra em minúscula (outro padrão comum)
      else if (part.length > 0 && current[part.charAt(0).toLowerCase() + part.slice(1)]) {
        current = current[part.charAt(0).toLowerCase() + part.slice(1)];
      } else {
        // Se não conseguiu encontrar, retorna vazio
        return '';
      }
    }
    
    // Retorna o valor como string
    return current ? current.toString() : '';
  } catch (error) {
    console.error(`Erro ao extrair valor do caminho ${path}:`, error);
    return '';
  }
};

// Extrai campos específicos de nota fiscal baseado nos caminhos definidos
export const extractNotaFiscalData = (xmlObj: any): Record<string, any> => {
  if (!xmlObj) return {};
  
  // Caminhos para extrair campos da nota fiscal
  const paths = {
    // Dados da Nota Fiscal
    chaveNF: "nfeProc:protNFe:infProt:chNFe",
    dataHoraEmissao: "NFe:infNFe:ide:dhEmi",
    numeroNF: "NFe:infNFe:ide:nNF",
    serieNF: "NFe:infNFe:ide:serie",
    tipoOperacao: "NFe:infNFe:ide:tpNF",
    
    // Dados do Emitente
    emitenteCNPJ: "NFe:infNFe:emit:CNPJ",
    emitenteRazaoSocial: "NFe:infNFe:emit:xNome",
    emitenteTelefone: "NFe:infNFe:emit:enderEmit:fone",
    emitenteUF: "NFe:infNFe:emit:enderEmit:UF",
    emitenteCidade: "NFe:infNFe:emit:enderEmit:xMun",
    emitenteBairro: "NFe:infNFe:emit:enderEmit:xBairro",
    emitenteEndereco: "NFe:infNFe:emit:enderEmit:xLgr",
    emitenteNumero: "NFe:infNFe:emit:enderEmit:nro",
    emitenteCEP: "NFe:infNFe:emit:enderEmit:CEP",
    emitenteComplemento: "NFe:infNFe:emit:enderEmit:xCpl",
    
    // Dados do Destinatário
    destinatarioCNPJ: "NFe:infNFe:dest:CNPJ",
    destinatarioRazaoSocial: "NFe:infNFe:dest:xNome",
    destinatarioTelefone: "NFe:infNFe:dest:enderDest:fone",
    destinatarioUF: "NFe:infNFe:dest:enderDest:UF",
    destinatarioCidade: "NFe:infNFe:dest:enderDest:xMun",
    destinatarioBairro: "NFe:infNFe:dest:enderDest:xBairro",
    destinatarioEndereco: "NFe:infNFe:dest:enderDest:xLgr",
    destinatarioNumero: "NFe:infNFe:dest:enderDest:nro",
    destinatarioCEP: "NFe:infNFe:dest:enderDest:CEP",
    destinatarioComplemento: "NFe:infNFe:dest:enderDest:xCpl",
    
    // Totais da Nota
    valorTotal: "NFe:infNFe:total:ICMSTot:vNF",
    pesoTotalBruto: "NFe:infNFe:transp:vol:pesoB",
    volumesTotal: "NFe:infNFe:transp:vol:qVol",
    informacoesComplementares: "NFe:infNFe:infAdic:infCpl"
  };
  
  // Extrai cada valor baseado nos caminhos
  const result: Record<string, any> = {};
  
  for (const [key, path] of Object.entries(paths)) {
    result[key] = extractValueFromXml(xmlObj, path);
  }

  // Format and combine address fields
  result.enderecoRemetenteCompleto = `${result.emitenteEndereco || ''}, ${result.emitenteNumero || ''} ${result.emitenteComplemento ? '- ' + result.emitenteComplemento : ''}`;
  result.enderecoDestinatarioCompleto = `${result.destinatarioEndereco || ''}, ${result.destinatarioNumero || ''} ${result.destinatarioComplemento ? '- ' + result.destinatarioComplemento : ''}`;
  
  // Tenta extrair o número do pedido das informações complementares usando regex
  if (result.informacoesComplementares) {
    const pedidoRegex = /pedido[:\s]*(\d+[-]?\d*)/i;
    const pedidoMatch = result.informacoesComplementares.match(pedidoRegex);
    result.numeroPedido = pedidoMatch ? pedidoMatch[1] : '';
  }
  
  return result;
};
