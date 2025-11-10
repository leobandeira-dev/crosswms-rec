import express from "express";
import { registerVolumesRoutes } from "./volumes-routes";
import { registerCnpjRoutes } from "./cnpj-routes";

const app = express();
const port = 3001; // Porta fixa para o backend

// Middleware básico
app.use(express.json());

// Registrar rotas de volumes/etiquetas
registerVolumesRoutes(app);
// Registrar rota de consulta CNPJ
registerCnpjRoutes(app);

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

// Removido: rota mock duplicada de Logística da Informação que causava erro de referência

// XML API Routes - Logística da Informação
app.post("/api/xml/fetch-from-logistica", async (req, res) => {
  try {
    const { chaveNotaFiscal, cnpj: bodyCnpj, token: bodyToken } = req.body;

    if (!chaveNotaFiscal || chaveNotaFiscal.length !== 44) {
      return res.status(400).json({
        success: false,
        error: 'Chave NFe inválida. Deve ter exatamente 44 dígitos.',
        invalid_xml: true
      });
    }

    console.log(`[API] Tentativa de busca NFe: ${chaveNotaFiscal}`);

    const cnpj = bodyCnpj || process.env.LOGISTICA_CNPJ || '34579341000185';
    const token = bodyToken || process.env.LOGISTICA_INFORMACAO_TOKEN || '5K7WUNCGES1GNIP6DW65JAIW54H111';

    console.log(`[API] Usando credenciais Logística: CNPJ ${cnpj.substring(0, 8)}...`);

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

// Redireciona raiz para o prefixo de app
app.get('/', (req, res) => {
  res.redirect('/crosswms-rec/');
});

// Servir arquivos estáticos do Vite sob o prefixo configurado no build
app.use('/crosswms-rec', express.static('dist/public'));

// Rota para servir o index.html do Vite para quaisquer caminhos da app
app.get('/crosswms-rec/*', (req, res) => {
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
