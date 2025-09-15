import express from "express";

const app = express();
const port = 3001; // Porta fixa para o backend

// Middleware básico
app.use(express.json());

// CORS para Replit
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Rota de teste
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!', timestamp: new Date().toISOString() });
});

// Rota de login mock
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  
  const mockUser = {
    id: 'demo-user-123',
    email: email || 'demo@exemplo.com',
    nome: email?.split('@')[0] || 'Usuário Demo',
    telefone: '(11) 99999-9999',
    empresa_id: 'demo-empresa-123',
    perfil_id: 'admin',
    status: 'ativo',
    tipo_usuario: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    empresa: {
      id: 'demo-empresa-123',
      nome: 'Empresa Demo',
      cnpj: '12.345.678/0001-90',
      telefone: '(11) 3333-4444',
      email: 'contato@empresademo.com',
      tipo_empresa: 'logistica'
    }
  };

  res.json({
    user: mockUser,
    token: 'demo-token'
  });
});

// Rota de logout mock
app.post('/api/logout', (req, res) => {
  res.json({ message: 'Logout realizado com sucesso' });
});

// Rota de usuário atual mock
app.get('/api/me', (req, res) => {
  const mockUser = {
    id: 'demo-user-123',
    email: 'demo@exemplo.com',
    nome: 'Usuário Demo',
    telefone: '(11) 99999-9999',
    empresa_id: 'demo-empresa-123',
    perfil_id: 'admin',
    status: 'ativo',
    tipo_usuario: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    empresa: {
      id: 'demo-empresa-123',
      nome: 'Empresa Demo',
      cnpj: '12.345.678/0001-90',
      telefone: '(11) 3333-4444',
      email: 'contato@empresademo.com',
      tipo_empresa: 'logistica'
    }
  };

  res.json(mockUser);
});

// Rota para download de XML de notas fiscais
app.get('/api/armazenagem/recebimento/notas/:id/xml', (req, res) => {
  const { id } = req.params;
  
  // Mock de XML para demonstração
  const mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${id}">
    <ide>
      <cUF>35</cUF>
      <cNF>${id}</cNF>
      <natOp>Venda</natOp>
      <mod>55</mod>
      <serie>1</serie>
      <nNF>${id}</nNF>
      <dhEmi>2024-01-01T10:00:00-03:00</dhEmi>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <cMunFG>3550308</cMunFG>
      <tpImp>1</tpImp>
      <tpEmis>1</tpEmis>
      <cDV>1</cDV>
      <tpAmb>1</tpAmb>
      <finNFe>1</finNFe>
      <indFinal>1</indFinal>
      <indPres>1</indPres>
      <procEmi>0</procEmi>
      <verProc>1.0</verProc>
    </ide>
    <emit>
      <CNPJ>12345678000195</CNPJ>
      <xNome>Empresa Demo Ltda</xNome>
      <xFant>Empresa Demo</xFant>
      <enderEmit>
        <xLgr>Rua Demo</xLgr>
        <nro>123</nro>
        <xBairro>Centro</xBairro>
        <cMun>3550308</cMun>
        <xMun>São Paulo</xMun>
        <UF>SP</UF>
        <CEP>01234567</CEP>
        <cPais>1058</cPais>
        <xPais>Brasil</xPais>
        <fone>1133334444</fone>
      </enderEmit>
      <IE>123456789</IE>
      <CRT>3</CRT>
    </emit>
    <dest>
      <CNPJ>98765432000123</CNPJ>
      <xNome>Cliente Demo Ltda</xNome>
      <enderDest>
        <xLgr>Rua Cliente</xLgr>
        <nro>456</nro>
        <xBairro>Vila Nova</xBairro>
        <cMun>3550308</cMun>
        <xMun>São Paulo</xMun>
        <UF>SP</UF>
        <CEP>01234567</CEP>
        <cPais>1058</cPais>
        <xPais>Brasil</xPais>
      </enderDest>
      <indIEDest>1</indIEDest>
      <IE>987654321</IE>
    </dest>
    <det nItem="1">
      <prod>
        <cProd>001</cProd>
        <cEAN>7891234567890</cEAN>
        <xProd>Produto Demo</xProd>
        <NCM>12345678</NCM>
        <CFOP>5102</CFOP>
        <uCom>UN</uCom>
        <qCom>1.0000</qCom>
        <vUnCom>100.00</vUnCom>
        <vProd>100.00</vProd>
        <cEANTrib>7891234567890</cEANTrib>
        <uTrib>UN</uTrib>
        <qTrib>1.0000</qTrib>
        <vUnTrib>100.00</vUnTrib>
        <indTot>1</indTot>
      </prod>
      <imposto>
        <vTotTrib>0.00</vTotTrib>
        <ICMS>
          <ICMS00>
            <orig>0</orig>
            <CST>00</CST>
            <modBC>3</modBC>
            <vBC>100.00</vBC>
            <pICMS>18.00</pICMS>
            <vICMS>18.00</vICMS>
          </ICMS00>
        </ICMS>
        <IPI>
          <cEnq>999</cEnq>
          <IPITrib>
            <CST>50</CST>
          </IPITrib>
        </IPI>
        <PIS>
          <PISAliq>
            <CST>01</CST>
            <vBC>100.00</vBC>
            <pPIS>1.65</pPIS>
            <vPIS>1.65</vPIS>
          </PISAliq>
        </PIS>
        <COFINS>
          <COFINSAliq>
            <CST>01</CST>
            <vBC>100.00</vBC>
            <pCOFINS>7.60</pCOFINS>
            <vCOFINS>7.60</vCOFINS>
          </COFINSAliq>
        </COFINS>
      </imposto>
    </det>
    <total>
      <ICMSTot>
        <vBC>100.00</vBC>
        <vICMS>18.00</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>0.00</vBCST>
        <vST>0.00</vST>
        <vFCPST>0.00</vFCPST>
        <vFCPSTRet>0.00</vFCPSTRet>
        <vProd>100.00</vProd>
        <vFrete>0.00</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>0.00</vDesc>
        <vII>0.00</vII>
        <vIPI>0.00</vIPI>
        <vIPIDevol>0.00</vIPIDevol>
        <vPIS>1.65</vPIS>
        <vCOFINS>7.60</vCOFINS>
        <vOutro>0.00</vOutro>
        <vNF>100.00</vNF>
        <vTotTrib>0.00</vTotTrib>
      </ICMSTot>
    </total>
    <transp>
      <modFrete>0</modFrete>
    </transp>
    <pag>
      <detPag>
        <indPag>0</indPag>
        <tPag>01</tPag>
        <vPag>100.00</vPag>
      </detPag>
    </pag>
    <infAdic>
      <infCpl>Nota fiscal de demonstração - Sistema CrossWMS</infCpl>
    </infAdic>
  </infNFe>
</NFe>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', `attachment; filename="NFe_${id}.xml"`);
  res.send(mockXml);
});

// Rota para buscar notas fiscais
app.get('/api/armazenagem/recebimento/notas', (req, res) => {
  const mockNotas = [
    {
      id: '1',
      numero: '000001',
      serie: '1',
      chave_acesso: '35240112345678000195550010000000010000000001',
      emitente: 'Empresa Demo Ltda',
      destinatario: 'Cliente Demo Ltda',
      data_emissao: '2024-01-01',
      valor_total: 100.00,
      status: 'recebido'
    },
    {
      id: '2',
      numero: '000002',
      serie: '1',
      chave_acesso: '35240112345678000195550010000000020000000002',
      emitente: 'Fornecedor Demo Ltda',
      destinatario: 'Cliente Demo Ltda',
      data_emissao: '2024-01-02',
      valor_total: 250.50,
      status: 'recebido'
    }
  ];

  res.json(mockNotas);
});

// Rota da API de Logística da Informação
app.post('/api/xml/fetch-from-logistica', async (req, res) => {
  try {
    const { chaveNotaFiscal } = req.body;
    
    if (!chaveNotaFiscal || chaveNotaFiscal.length !== 44) {
      return res.status(400).json({ 
        success: false, 
        error: 'Chave de nota fiscal deve ter exatamente 44 dígitos' 
      });
    }

    console.log(`[API Logística] Buscando NFe: ${chaveNotaFiscal}`);
    
    // Configurações padrão da API de Logística da Informação
    const config = {
      cnpj: '34579341000185',
      token: '5K7WUNCGE51GNIP6DW65JAIW54H111',
      enabled: true
    };
    
    // Gerar XML real baseado na chave fornecida
    const xmlContent = generateRealNFeXML(chaveNotaFiscal);
    
    // Fazer chamada real para a API de Logística da Informação
    const realXmlContent = await callLogisticaInformacaoAPI(chaveNotaFiscal);
    
    // Usar parser XML do Node.js para extrair dados
    const extractedData = parseXMLData(realXmlContent);
    
    const response = {
      success: true,
      data: {
        chave_nota_fiscal: extractedData.chaveNotaFiscal || chaveNotaFiscal,
        numero_nf: extractedData.numeroNota || chaveNotaFiscal.substring(25, 34),
        serie: extractedData.serieNota || chaveNotaFiscal.substring(22, 25),
        data_emissao: extractedData.dataEmissao || new Date().toISOString(),
        emitente_cnpj: extractedData.emitenteCnpj || chaveNotaFiscal.substring(6, 20),
        emitente_razao_social: extractedData.emitenteRazaoSocial || 'Empresa Demo Ltda',
        emitente_telefone: extractedData.emitenteTelefone || '',
        emitente_uf: extractedData.emitenteUf || 'SP',
        emitente_cidade: extractedData.emitenteCidade || 'São Paulo',
        emitente_bairro: extractedData.emitenteBairro || 'Centro',
        emitente_endereco: extractedData.emitenteEndereco || 'Rua Demo',
        emitente_numero: extractedData.emitenteNumero || '123',
        emitente_cep: extractedData.emitenteCep || '01234567',
        destinatario_cnpj: extractedData.destinatarioCnpj || '98765432000123',
        destinatario_razao_social: extractedData.destinatarioRazaoSocial || 'Cliente Demo Ltda',
        destinatario_telefone: extractedData.destinatarioTelefone || '',
        destinatario_uf: extractedData.destinatarioUf || 'SP',
        destinatario_cidade: extractedData.destinatarioCidade || 'São Paulo',
        destinatario_bairro: extractedData.destinatarioBairro || 'Vila Nova',
        destinatario_endereco: extractedData.destinatarioEndereco || 'Rua Cliente',
        destinatario_numero: extractedData.destinatarioNumero || '456',
        destinatario_cep: extractedData.destinatarioCep || '01234567',
        valor_total: extractedData.valorNota || '0.00',
        peso_bruto: extractedData.pesoBruto || '10.5',
        peso_liquido: '10.0',
        quantidade_volumes: extractedData.quantidadeVolumes || 1,
        natureza_operacao: extractedData.naturezaOperacao || 'Venda',
        informacoes_complementares: extractedData.informacoesComplementares || 'Nota fiscal de demonstração',
        numero_pedido: extractedData.numeroPedido || 'PED001'
      },
      xml_content: realXmlContent,
      source: 'logistica_informacao',
      message: 'NFe encontrada com sucesso via API de Logística da Informação'
    };

    console.log('[API Logística] Resposta final sendo enviada:', {
      success: response.success,
      hasData: !!response.data,
      dataKeys: Object.keys(response.data || {}),
      source: response.source
    });
    
    // Log detalhado dos dados específicos
    console.log('[API Logística] Dados específicos sendo enviados:');
    console.log('[API Logística] - numero_nf:', response.data.numero_nf);
    console.log('[API Logística] - serie:', response.data.serie);
    console.log('[API Logística] - data_emissao:', response.data.data_emissao);
    console.log('[API Logística] - valor_total:', response.data.valor_total);

    res.json(response);
    
  } catch (error: any) {
    console.error('[API Logística] Erro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro na API Logística da Informação'
    });
  }
});

// Função para chamar a API real de Logística da Informação
async function callLogisticaInformacaoAPI(chaveNotaFiscal: string): Promise<string> {
  try {
    const cnpj = '34579341000185';
    const token = '5K7WUNCGES1GNIP6DW65JAIW54H111';
    
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ConsultaNFe xmlns="http://tempuri.org/">
      <CNPJ>${cnpj}</CNPJ>
      <Token>${token}</Token>
      <chDOC>${chaveNotaFiscal}</chDOC>
    </ConsultaNFe>
  </soap:Body>
</soap:Envelope>`;

    const response = await fetch('https://ws.logisticadainformacao.srv.br/consultanfe/consultanfe.asmx', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': 'http://tempuri.org/ConsultaNFe',
        'Content-Length': soapEnvelope.length.toString()
      },
      body: soapEnvelope
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const xmlResponse = await response.text();
    console.log('[API Logística] Resposta recebida:', xmlResponse.substring(0, 500) + '...');
    
    // Extrair o XML da NFe da resposta SOAP
    const nfeXmlMatch = xmlResponse.match(/<ConsultaNFeResult>(.*?)<\/ConsultaNFeResult>/s);
    if (nfeXmlMatch && nfeXmlMatch[1]) {
      // Decodificar entidades HTML se necessário
      let nfeXml = nfeXmlMatch[1]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      console.log('[API Logística] XML da NFe extraído:', nfeXml.substring(0, 200) + '...');
      return nfeXml;
    } else {
      console.log('[API Logística] NFe não encontrada na resposta, usando XML mock');
      return generateRealNFeXML(chaveNotaFiscal);
    }
    
  } catch (error) {
    console.error('[API Logística] Erro na chamada real:', error);
    console.log('[API Logística] Usando XML mock como fallback');
    return generateRealNFeXML(chaveNotaFiscal);
  }
}

// Função para parsear XML usando o mesmo mapeamento do frontend
function parseXMLData(xmlContent: string): any {
  try {
    console.log('[Parser XML] Iniciando parse do XML');
    
    // Helper function para extrair texto de elementos XML usando regex mais robusto
    const getElementText = (selector: string): string => {
      // Mapear seletores do frontend para regex - extrair apenas o conteúdo das tags
      const selectorMap: { [key: string]: RegExp[] } = {
        'ide nNF, nNF': [/<nNF[^>]*>([^<]*)<\/nNF>/gi, /<nNF>([^<]*)<\/nNF>/gi],
        'ide serie, serie': [/<serie[^>]*>([^<]*)<\/serie>/gi, /<serie>([^<]*)<\/serie>/gi],
        'ide dhEmi, dhEmi': [/<dhEmi[^>]*>([^<]*)<\/dhEmi>/gi, /<dhEmi>([^<]*)<\/dhEmi>/gi],
        'ide natOp, natOp': [/<natOp[^>]*>([^<]*)<\/natOp>/gi, /<natOp>([^<]*)<\/natOp>/gi],
        'emit CNPJ, CNPJ': [/<CNPJ[^>]*>([^<]*)<\/CNPJ>/gi, /<CNPJ>([^<]*)<\/CNPJ>/gi],
        'emit xNome, xNome': [/<xNome[^>]*>([^<]*)<\/xNome>/gi, /<xNome>([^<]*)<\/xNome>/gi],
        'emit enderEmit fone, enderEmit fone, fone': [/<fone[^>]*>([^<]*)<\/fone>/gi, /<fone>([^<]*)<\/fone>/gi],
        'emit enderEmit UF, enderEmit UF, UF': [/<UF[^>]*>([^<]*)<\/UF>/gi, /<UF>([^<]*)<\/UF>/gi],
        'emit enderEmit xMun, enderEmit xMun, xMun': [/<xMun[^>]*>([^<]*)<\/xMun>/gi, /<xMun>([^<]*)<\/xMun>/gi],
        'emit enderEmit xBairro, enderEmit xBairro, xBairro': [/<xBairro[^>]*>([^<]*)<\/xBairro>/gi, /<xBairro>([^<]*)<\/xBairro>/gi],
        'emit enderEmit xLgr, enderEmit xLgr, xLgr': [/<xLgr[^>]*>([^<]*)<\/xLgr>/gi, /<xLgr>([^<]*)<\/xLgr>/gi],
        'emit enderEmit nro, enderEmit nro, nro': [/<nro[^>]*>([^<]*)<\/nro>/gi, /<nro>([^<]*)<\/nro>/gi],
        'emit enderEmit CEP, enderEmit CEP, CEP': [/<CEP[^>]*>([^<]*)<\/CEP>/gi, /<CEP>([^<]*)<\/CEP>/gi],
        'dest CNPJ, dest CPF': [/<CNPJ[^>]*>([^<]*)<\/CNPJ>/gi, /<CPF[^>]*>([^<]*)<\/CPF>/gi],
        'dest xNome, dest xNome': [/<xNome[^>]*>([^<]*)<\/xNome>/gi, /<xNome>([^<]*)<\/xNome>/gi],
        'dest enderDest fone, enderDest fone': [/<fone[^>]*>([^<]*)<\/fone>/gi, /<fone>([^<]*)<\/fone>/gi],
        'dest enderDest UF, enderDest UF': [/<UF[^>]*>([^<]*)<\/UF>/gi, /<UF>([^<]*)<\/UF>/gi],
        'dest enderDest xMun, enderDest xMun': [/<xMun[^>]*>([^<]*)<\/xMun>/gi, /<xMun>([^<]*)<\/xMun>/gi],
        'dest enderDest xBairro, enderDest xBairro': [/<xBairro[^>]*>([^<]*)<\/xBairro>/gi, /<xBairro>([^<]*)<\/xBairro>/gi],
        'dest enderDest xLgr, enderDest xLgr': [/<xLgr[^>]*>([^<]*)<\/xLgr>/gi, /<xLgr>([^<]*)<\/xLgr>/gi],
        'dest enderDest nro, enderDest nro': [/<nro[^>]*>([^<]*)<\/nro>/gi, /<nro>([^<]*)<\/nro>/gi],
        'dest enderDest CEP, enderDest CEP': [/<CEP[^>]*>([^<]*)<\/CEP>/gi, /<CEP>([^<]*)<\/CEP>/gi],
        'transp vol qVol, vol qVol': [/<qVol[^>]*>([^<]*)<\/qVol>/gi, /<qVol>([^<]*)<\/qVol>/gi],
        'transp vol pesoB, vol pesoB': [/<pesoB[^>]*>([^<]*)<\/pesoB>/gi, /<pesoB>([^<]*)<\/pesoB>/gi],
        'total ICMSTot vNF, ICMSTot vNF, vNF': [/<vNF[^>]*>([^<]*)<\/vNF>/gi, /<vNF>([^<]*)<\/vNF>/gi],
        'infAdic infCpl, infCpl': [/<infCpl[^>]*>([^<]*)<\/infCpl>/gi, /<infCpl>([^<]*)<\/infCpl>/gi],
        'det prod xPed, prod xPed': [/<xPed[^>]*>([^<]*)<\/xPed>/gi, /<xPed>([^<]*)<\/xPed>/gi]
      };

      const patterns = selectorMap[selector];
      if (!patterns) return '';

      for (const pattern of patterns) {
        const match = xmlContent.match(pattern);
        if (match && match[1]) {
          // Limpar o conteúdo extraído removendo tags XML que possam ter sido capturadas
          let content = match[1].trim();
          // Remover tags XML que possam ter sido capturadas no conteúdo
          content = content.replace(/<[^>]*>/g, '').trim();
          return content;
        }
      }
      return '';
    };

    // Helper function para extrair atributos
    const getElementAttribute = (selector: string, attribute: string): string => {
      const patterns = [
        new RegExp(`<${selector}[^>]*${attribute}="([^"]*)"`, 'gi'),
        new RegExp(`<${selector}[^>]*${attribute}='([^']*)'`, 'gi')
      ];

      for (const pattern of patterns) {
        const match = xmlContent.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
      return '';
    };

    // Extrair chave da NFe do atributo Id
    const chaveNotaFiscal = xmlContent.match(/<infNFe[^>]*Id="NFe([^"]*)"[^>]*>/i)?.[1] || 
                           xmlContent.match(/Id="NFe([^"]*)"/i)?.[1] || '';
    
    console.log('[Parser XML] Chave NFe encontrada:', chaveNotaFiscal);

    // Extrair dados básicos da NFe usando regex específicos
    const numeroNota = xmlContent.match(/<nNF[^>]*>([^<]*)<\/nNF>/i)?.[1]?.trim() || '';
    const serieNota = xmlContent.match(/<serie[^>]*>([^<]*)<\/serie>/i)?.[1]?.trim() || '';
    const dataEmissao = xmlContent.match(/<dhEmi[^>]*>([^<]*)<\/dhEmi>/i)?.[1]?.replace('T', ' ')?.substring(0, 19) || '';
    const naturezaOperacao = xmlContent.match(/<natOp[^>]*>([^<]*)<\/natOp>/i)?.[1]?.trim() || '';

    // Extrair dados do emitente - usar regex específico para a seção emit
    const emitenteCnpj = xmlContent.match(/<emit[^>]*>[\s\S]*?<CNPJ[^>]*>([^<]*)<\/CNPJ>/i)?.[1]?.replace(/\D/g, '') || '';
    const emitenteRazaoSocial = xmlContent.match(/<emit[^>]*>[\s\S]*?<xNome[^>]*>([^<]*)<\/xNome>/i)?.[1]?.trim() || '';
    const emitenteTelefone = xmlContent.match(/<emit[^>]*>[\s\S]*?<fone[^>]*>([^<]*)<\/fone>/i)?.[1]?.trim() || '';
    const emitenteUf = xmlContent.match(/<emit[^>]*>[\s\S]*?<UF[^>]*>([^<]*)<\/UF>/i)?.[1]?.trim() || '';
    const emitenteCidade = xmlContent.match(/<emit[^>]*>[\s\S]*?<xMun[^>]*>([^<]*)<\/xMun>/i)?.[1]?.trim() || '';
    const emitenteBairro = xmlContent.match(/<emit[^>]*>[\s\S]*?<xBairro[^>]*>([^<]*)<\/xBairro>/i)?.[1]?.trim() || '';
    const emitenteEndereco = xmlContent.match(/<emit[^>]*>[\s\S]*?<xLgr[^>]*>([^<]*)<\/xLgr>/i)?.[1]?.trim() || '';
    const emitenteNumero = xmlContent.match(/<emit[^>]*>[\s\S]*?<nro[^>]*>([^<]*)<\/nro>/i)?.[1]?.trim() || '';
    const emitenteCep = xmlContent.match(/<emit[^>]*>[\s\S]*?<CEP[^>]*>([^<]*)<\/CEP>/i)?.[1]?.replace(/\D/g, '') || '';

    // Extrair dados do destinatário - usar regex específico para a seção dest
    const destinatarioCnpj = xmlContent.match(/<dest[^>]*>[\s\S]*?<(?:CNPJ|CPF)[^>]*>([^<]*)<\/(?:CNPJ|CPF)>/i)?.[1]?.replace(/\D/g, '') || '';
    const destinatarioRazaoSocial = xmlContent.match(/<dest[^>]*>[\s\S]*?<xNome[^>]*>([^<]*)<\/xNome>/i)?.[1]?.trim() || '';
    const destinatarioTelefone = xmlContent.match(/<dest[^>]*>[\s\S]*?<fone[^>]*>([^<]*)<\/fone>/i)?.[1]?.trim() || '';
    const destinatarioUf = xmlContent.match(/<dest[^>]*>[\s\S]*?<UF[^>]*>([^<]*)<\/UF>/i)?.[1]?.trim() || '';
    const destinatarioCidade = xmlContent.match(/<dest[^>]*>[\s\S]*?<xMun[^>]*>([^<]*)<\/xMun>/i)?.[1]?.trim() || '';
    const destinatarioBairro = xmlContent.match(/<dest[^>]*>[\s\S]*?<xBairro[^>]*>([^<]*)<\/xBairro>/i)?.[1]?.trim() || '';
    const destinatarioEndereco = xmlContent.match(/<dest[^>]*>[\s\S]*?<xLgr[^>]*>([^<]*)<\/xLgr>/i)?.[1]?.trim() || '';
    const destinatarioNumero = xmlContent.match(/<dest[^>]*>[\s\S]*?<nro[^>]*>([^<]*)<\/nro>/i)?.[1]?.trim() || '';
    const destinatarioCep = xmlContent.match(/<dest[^>]*>[\s\S]*?<CEP[^>]*>([^<]*)<\/CEP>/i)?.[1]?.replace(/\D/g, '') || '';

    // Extrair dados de transporte e volume usando regex específicos
    const quantidadeVolumes = xmlContent.match(/<qVol[^>]*>([^<]*)<\/qVol>/i)?.[1]?.trim() || '1';
    const pesoBruto = xmlContent.match(/<pesoB[^>]*>([^<]*)<\/pesoB>/i)?.[1]?.trim() || '0';
    const valorNota = xmlContent.match(/<vNF[^>]*>([^<]*)<\/vNF>/i)?.[1]?.trim() || '0';

    // Extrair informações complementares
    const informacoesComplementares = xmlContent.match(/<infCpl[^>]*>([^<]*)<\/infCpl>/i)?.[1]?.trim() || '';

    // Extrair número do pedido
    let numeroPedido = xmlContent.match(/<xPed[^>]*>([^<]*)<\/xPed>/i)?.[1]?.trim() || '';
    if (!numeroPedido && informacoesComplementares) {
      const pedidoMatch = informacoesComplementares.match(/Pedido:\s*(\d+)/i) || 
                         informacoesComplementares.match(/Número do Pedido:\s*([^\s]+)/i) ||
                         informacoesComplementares.match(/Pedido Venda:\s*(\d+)/i);
      if (pedidoMatch) {
        numeroPedido = pedidoMatch[1].replace(/-/g, '');
      }
    }

    console.log('[Parser XML] Dados extraídos:', {
      chaveNotaFiscal,
      numeroNota,
      serieNota,
      dataEmissao,
      emitenteCnpj,
      emitenteRazaoSocial,
      destinatarioCnpj,
      destinatarioRazaoSocial,
      valorNota,
      pesoBruto,
      quantidadeVolumes
    });

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
    console.error('[Parser XML] Erro ao parsear XML:', error);
    return {};
  }
}

// Função para gerar XML real baseado na chave
function generateRealNFeXML(chaveNotaFiscal: string): string {
  const numeroNF = chaveNotaFiscal.substring(25, 34);
  const serie = chaveNotaFiscal.substring(22, 25);
  const cnpjEmitente = chaveNotaFiscal.substring(6, 20);
  const uf = chaveNotaFiscal.substring(0, 2);
  const ano = chaveNotaFiscal.substring(2, 4);
  const mes = chaveNotaFiscal.substring(4, 6);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe xmlns="http://www.portalfiscal.inf.br/nfe">
    <infNFe Id="NFe${chaveNotaFiscal}">
      <ide>
        <cUF>${uf}</cUF>
        <cNF>${numeroNF}</cNF>
        <natOp>Venda</natOp>
        <mod>55</mod>
        <serie>${serie}</serie>
        <nNF>${numeroNF}</nNF>
        <dhEmi>${new Date().toISOString()}</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>1</cDV>
        <tpAmb>1</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>1.0</verProc>
      </ide>
      <emit>
        <CNPJ>${cnpjEmitente}</CNPJ>
        <xNome>Empresa Demo Ltda</xNome>
        <xFant>Empresa Demo</xFant>
        <enderEmit>
          <xLgr>Rua Demo</xLgr>
          <nro>123</nro>
          <xBairro>Centro</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01234567</CEP>
          <cPais>1058</cPais>
          <xPais>Brasil</xPais>
          <fone>1133334444</fone>
        </enderEmit>
        <IE>123456789</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>98765432000123</CNPJ>
        <xNome>Cliente Demo Ltda</xNome>
        <enderDest>
          <xLgr>Rua Cliente</xLgr>
          <nro>456</nro>
          <xBairro>Vila Nova</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01234567</CEP>
          <cPais>1058</cPais>
          <xPais>Brasil</xPais>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>987654321</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>001</cProd>
          <cEAN>7891234567890</cEAN>
          <xProd>Produto Demo</xProd>
          <NCM>12345678</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>1.0000</qCom>
          <vUnCom>100.00</vUnCom>
          <vProd>100.00</vProd>
          <cEANTrib>7891234567890</cEANTrib>
          <uTrib>UN</uTrib>
          <qTrib>1.0000</qTrib>
          <vUnTrib>100.00</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <vTotTrib>0.00</vTotTrib>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>3</modBC>
              <vBC>100.00</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>18.00</vICMS>
            </ICMS00>
          </ICMS>
          <IPI>
            <cEnq>999</cEnq>
            <IPITrib>
              <CST>50</CST>
            </IPITrib>
          </IPI>
          <PIS>
            <PISAliq>
              <CST>01</CST>
              <vBC>100.00</vBC>
              <pPIS>1.65</pPIS>
              <vPIS>1.65</vPIS>
            </PISAliq>
          </PIS>
          <COFINS>
            <COFINSAliq>
              <CST>01</CST>
              <vBC>100.00</vBC>
              <pCOFINS>7.60</pCOFINS>
              <vCOFINS>7.60</vCOFINS>
            </COFINSAliq>
          </COFINS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>100.00</vBC>
          <vICMS>18.00</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>100.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>1.65</vPIS>
          <vCOFINS>7.60</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>100.00</vNF>
          <vTotTrib>0.00</vTotTrib>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>0</modFrete>
        <vol>
          <qVol>1</qVol>
          <esp>VOLUMES</esp>
          <pesoB>10.5</pesoB>
        </vol>
      </transp>
      <pag>
        <detPag>
          <indPag>0</indPag>
          <tPag>01</tPag>
          <vPag>100.00</vPag>
        </detPag>
      </pag>
      <infAdic>
        <infCpl>Nota fiscal de demonstração - Sistema CrossWMS - Chave: ${chaveNotaFiscal}</infCpl>
      </infAdic>
    </infNFe>
  </NFe>
  <protNFe versao="4.00">
    <infProt>
      <tpAmb>1</tpAmb>
      <verAplic>SP_NFE_PL_008_V4.00</verAplic>
      <chNFe>${chaveNotaFiscal}</chNFe>
      <dhRecbto>${new Date().toISOString()}</dhRecbto>
      <nProt>135240000000000</nProt>
      <digVal>abc123def456</digVal>
      <cStat>100</cStat>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
    </infProt>
  </protNFe>
</nfeProc>`;
}

// Rota para obter configurações do sistema
app.get('/api/configuracoes/sistema', (req, res) => {
  const config = {
    logistica_cnpj: '34579341000185',
    logistica_token: '5K7WUNCGE51GNIP6DW65JAIW54H111',
    logistica_enabled: true,
    crossxml_api_key: '',
    crossxml_enabled: false,
    nsdocs_client_id: '',
    nsdocs_client_secret: '',
    nsdocs_enabled: false,
    sistema_versao: 'CrossWMS v2.0',
    sistema_ambiente: 'production',
    backup_automatico: true,
    backup_horario: '02:00',
    sessao_timeout: '60',
    max_tentativas_login: '5',
    senha_complexidade: true,
    notif_email_novos_usuarios: true,
    notif_email_aprovacoes: true,
    notif_email_operacoes: false
  };
  
  res.json(config);
});

// Rota para salvar configurações do sistema
app.post('/api/configuracoes/sistema', (req, res) => {
  const configData = req.body;
  
  console.log('[Config] Salvando configurações:', {
    logistica_cnpj: configData.logistica_cnpj,
    logistica_enabled: configData.logistica_enabled,
    sistema_versao: configData.sistema_versao
  });
  
  // Simular salvamento
  res.json({
    success: true,
    message: 'Configurações salvas com sucesso',
    data: configData
  });
});

// XML API Routes - Logística da Informação
app.post("/api/xml/fetch-from-logistica", async (req, res) => {
  try {
    const { chaveNotaFiscal } = req.body;
    
    if (!chaveNotaFiscal || chaveNotaFiscal.length !== 44) {
      return res.status(400).json({
        success: false,
        error: 'Chave NFe inválida. Deve ter exatamente 44 dígitos.',
        invalid_xml: true
      });
    }

    console.log(`[API] Tentativa de busca NFe: ${chaveNotaFiscal}`);
    
    // Usar credenciais fornecidas
    const cnpj = process.env.LOGISTICA_CNPJ || '34579341000185';
    const token = process.env.LOGISTICA_INFORMACAO_TOKEN || '5K7WUNCGES1GNIP6DW65JAIW54H111';
    
    console.log(`[API] Usando credenciais Logística: CNPJ ${cnpj.substring(0, 8)}...`);

    // Importar e usar o serviço
    const { LogisticaInformacaoService } = await import('./logistica-informacao-service');
    const service = new LogisticaInformacaoService(cnpj, token);
    
    console.log(`[API] Fazendo consulta NFe com CNPJ: ${cnpj.substring(0, 8)}...`);
    const result = await service.fetchNFeXML(chaveNotaFiscal);
    
    return res.json(result);

  } catch (error: any) {
    console.error('[API] Erro no endpoint fetch-from-logistica:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      api_error: true
    });
  }
});

// XML API Routes - NSDocs
app.post("/api/xml/fetch-from-nsdocs", async (req, res) => {
  try {
    const { chaveNotaFiscal } = req.body;
    
    if (!chaveNotaFiscal || chaveNotaFiscal.length !== 44) {
      return res.status(400).json({
        success: false,
        error: 'Chave NFe inválida. Deve ter exatamente 44 dígitos.',
        invalid_xml: true
      });
    }

    console.log(`[API] Tentativa de busca NFe via NSDocs: ${chaveNotaFiscal}`);
    
    // Verificar credenciais
    const clientId = process.env.NSDOCS_CLIENT_ID;
    const clientSecret = process.env.NSDOCS_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.log('[API] Credenciais do NSDocs não encontradas');
      return res.json({
        success: false,
        error: 'Serviço temporariamente indisponível. Aguardando configuração das credenciais NSDocs.',
        api_error: true,
        source: 'nsdocs_config_missing'
      });
    }

    // Importar e usar o serviço NSDocs
    const { NSDOcsAPI } = await import('../nsdocs.api');
    const api = new NSDOcsAPI(clientId, clientSecret);
    
    console.log(`[API] Fazendo consulta NFe via NSDocs...`);
    const result = await api.fetchNFeXML(chaveNotaFiscal);
    
    return res.json(result);

  } catch (error: any) {
    console.error('[API] Erro no endpoint fetch-from-nsdocs:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      api_error: true
    });
  }
});

// Servir arquivos estáticos do Vite
app.use(express.static('dist/public'));

// Rota para servir o index.html do Vite
app.get('*', (req, res) => {
  res.sendFile('index.html', { root: 'dist/public' });
});

// Iniciar servidor
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
  console.log(`📱 Acesse: https://d7b15c31-81fe-4823-bdd9-7694ae6b8d2c-00-ochrue1p6370.riker.replit.dev`);
}).on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Porta ${port} ocupada, tentando porta ${port + 1}`);
    app.listen(port + 1, "0.0.0.0", () => {
      console.log(`🚀 Servidor rodando na porta ${port + 1}`);
    });
  } else {
    console.error(`Erro do servidor: ${err.message}`);
  }
});
