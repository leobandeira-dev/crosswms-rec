import express from "express";
import { registerVolumesRoutes } from "./volumes-routes";
import { registerCnpjRoutes } from "./cnpj-routes";
import fetch from "node-fetch";
import 'dotenv/config';

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

// XML API Routes - Meu Danfe (sem dependência de Python, compatível com Windows)
app.post('/api/xml/fetch-from-meudanfe', async (req, res) => {
  try {
    const { chaveNotaFiscal } = req.body;
    const onlyDigits = (chaveNotaFiscal || '').toString().replace(/\D/g, '');
    if (!onlyDigits || onlyDigits.length !== 44) {
      return res.status(400).json({
        success: false,
        error: 'Chave de nota fiscal deve ter exatamente 44 dígitos',
        code: 'invalid_key'
      });
    }

    const apiKey = process.env.MEUDANFE_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ success: false, error: 'MEUDANFE_API_KEY ausente no servidor', code: 'meudanfe_api_key_missing' });
    }

    const chave = onlyDigits;

    // Etapa opcional: adicionar a NFe na área do cliente
    try {
      const addUrl = `https://api.meudanfe.com.br/v2/fd/add/${chave}`;
      const addRes = await fetch(addUrl, {
        method: 'PUT',
        headers: { 'Api-Key': apiKey }
      });
      let addJson: any = null;
      try { addJson = await addRes.json(); } catch {}
      console.log('[MeuDanfe] ADD status:', addRes.status, addJson ? JSON.stringify(addJson) : '(sem corpo)');
      if (addRes.status === 402) {
        return res.status(402).json({ success: false, error: 'Saldo insuficiente na API Meu Danfe', code: 'meudanfe_insufficient_balance' });
      }
      if (addRes.status === 401 || addRes.status === 403) {
        return res.status(401).json({ success: false, error: 'Api-Key inválida ou não informada na API Meu Danfe', code: 'meudanfe_invalid_api_key' });
      }
    } catch (e) {
      console.warn('[MeuDanfe] Falha ao adicionar NFe, prosseguindo para GET xml:', e instanceof Error ? e.message : e);
    }

    // Baixar XML oficial da NFe
    const getUrl = `https://api.meudanfe.com.br/v2/fd/get/xml/${chave}`;
    const getRes = await fetch(getUrl, {
      method: 'GET',
      headers: { 'Api-Key': apiKey }
    });

    let getJson: any = null;
    try {
      getJson = await getRes.json();
    } catch (err) {
      console.error('[MeuDanfe] Erro ao parsear JSON do GET xml:', err);
    }

    if (!getRes.ok) {
      return res.status(getRes.status).json({ success: false, error: `Erro HTTP Meu Danfe GET: ${getRes.status}`, code: 'meudanfe_http_error', raw: getJson });
    }

    // Tentar extrair XML em diferentes formatos possíveis
    const tryExtractXml = (json: any): string | null => {
      if (!json || typeof json !== 'object') return null;
      const candidates = [
        json.xml,
        json.data?.xml,
        json.result?.xml,
        json.conteudo?.xml,
        json.conteudo,
        json.payload?.xml,
      ];
      for (const c of candidates) {
        if (typeof c === 'string' && c.includes('<NFe')) return c;
      }
      return null;
    };

    const xml = tryExtractXml(getJson);
    if (!xml) {
      return res.status(200).json({ success: false, error: 'Resposta do Meu Danfe não contém XML', code: 'meudanfe_no_xml', raw: getJson });
    }

    return res.json({ success: true, xml, provider: 'meudanfe_api' });
  } catch (error) {
    console.error('[MeuDanfe] Erro no endpoint backend:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor Meu Danfe', code: 'server_error' });
  }
});

// XML API Routes - Meu Danfe Batch
app.post('/api/xml/fetch-from-meudanfe/batch', async (req, res) => {
  try {
    const { keys } = req.body || {};
    if (!Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({ success: false, error: 'Body deve conter array "keys" com chaves de 44 dígitos', code: 'invalid_body' });
    }

    const apiKey = process.env.MEUDANFE_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ success: false, error: 'MEUDANFE_API_KEY ausente no servidor', code: 'meudanfe_api_key_missing' });
    }

    const normalize = (k: any) => String(k || '').replace(/\D/g, '');
    const validKeys = keys
      .map(normalize)
      .filter(k => k.length === 44);

    if (validKeys.length === 0) {
      return res.status(400).json({ success: false, error: 'Nenhuma chave válida (44 dígitos) fornecida', code: 'no_valid_keys' });
    }

    const BATCH_SIZE = 5;
    const results: Array<{ key: string; success: boolean; xml_content?: string; error?: string; code?: string; status?: string; raw?: any }> = [];

    const processKey = async (chave: string) => {
      // Opcional: adicionar a NFe na área do cliente
      try {
        const addUrl = `https://api.meudanfe.com.br/v2/fd/add/${chave}`;
        const addRes = await fetch(addUrl, { method: 'PUT', headers: { 'Api-Key': apiKey } });
        if (addRes.status === 402) {
          return { key: chave, success: false, error: 'Saldo insuficiente na API Meu Danfe', code: 'meudanfe_insufficient_balance', status: 'error' };
        }
        if (addRes.status === 401 || addRes.status === 403) {
          return { key: chave, success: false, error: 'Api-Key inválida ou não informada na API Meu Danfe', code: 'meudanfe_invalid_api_key', status: 'error' };
        }
      } catch (e) {
        // prosseguir para GET
      }

      const getUrl = `https://api.meudanfe.com.br/v2/fd/get/xml/${chave}`;
      const getRes = await fetch(getUrl, { method: 'GET', headers: { 'Api-Key': apiKey, 'Accept': 'application/json' } });

      let getJson: any = null;
      try { getJson = await getRes.json(); } catch (err) {
        // manter nulo
      }

      if (!getRes.ok) {
        return { key: chave, success: false, error: `Erro HTTP Meu Danfe GET: ${getRes.status}`, code: 'meudanfe_http_error', raw: getJson, status: 'error' };
      }

      const xml = tryExtractXml(getJson);
      if (!xml) {
        return { key: chave, success: false, error: 'Resposta do Meu Danfe não contém XML', code: 'meudanfe_no_xml', raw: getJson, status: 'error' };
      }

      return { key: chave, success: true, xml_content: xml, status: 'completed' };
    };

    for (let i = 0; i < validKeys.length; i += BATCH_SIZE) {
      const slice = validKeys.slice(i, i + BATCH_SIZE);
      const settled = await Promise.allSettled(slice.map(k => processKey(k)));
      for (const [idx, s] of settled.entries()) {
        if (s.status === 'fulfilled') {
          results.push(s.value);
        } else {
          results.push({ key: slice[idx], success: false, error: (s as any).reason?.message || 'Erro desconhecido', code: 'unknown_error', status: 'error' });
        }
      }
    }

    return res.json({ success: true, items: results });
  } catch (error) {
    console.error('[MeuDanfe] Erro no endpoint batch:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor Meu Danfe (batch)', code: 'server_error' });
  }
});

// Redireciona raiz para o prefixo de app
app.get('/', (req, res) => {
  res.redirect('/crosswms-rec/');
});

// Fallback: qualquer rota não-API e fora do prefixo deve ir para o SPA
app.get(/^\/(?!api|crosswms-rec).*/, (req, res) => {
  const target = `/crosswms-rec${req.path}`;
  res.redirect(target);
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
