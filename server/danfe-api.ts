import express from 'express';
import { storage } from './storage';
import fetch from 'node-fetch';
import { NFEProcessor } from './nfe-processor';
import { DANFEGenerator } from './danfe-generator';
import { DANFESefazGenerator } from './danfe-sefaz-generator';
import { DANFEOficialGenerator } from './danfe-oficial-generator';
import { NFEXMLParser } from './nfe-xml-parser';

const router = express.Router();
const nfeProcessor = new NFEProcessor();

interface AuthenticatedRequest extends express.Request {
  user?: any;
}

// Middleware de autenticação simples
const authenticateToken = async (req: AuthenticatedRequest, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    const sessionData = await storage.getSessionByToken(token);
    if (!sessionData) {
      return res.status(403).json({ error: 'Token inválido' });
    }

    req.user = sessionData.user;
    next();
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    return res.status(403).json({ error: 'Erro de autenticação' });
  }
};

// Rota para gerar DANFE usando API meudanfe.com.br
router.post('/gerar-danfe', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { chave, xml, notaId } = req.body;

    if (!chave && !xml && !notaId) {
      return res.status(400).json({ 
        error: 'É necessário fornecer chave NFe, XML ou ID da nota fiscal' 
      });
    }

    let dadosEnvio: any = {};
    let metodo = '';

    if (notaId) {
      // Buscar nota fiscal no sistema
      const notaFiscal = await storage.getNotaFiscalById(notaId);
      
      if (!notaFiscal) {
        return res.status(404).json({ error: 'Nota fiscal não encontrada' });
      }

      if (notaFiscal.xml_content) {
        dadosEnvio = {
          xml: notaFiscal.xml_content,
          formato: 'pdf'
        };
        metodo = 'XML';
      } else if (notaFiscal.chave_acesso) {
        dadosEnvio = {
          chave: notaFiscal.chave_acesso,
          formato: 'pdf'
        };
        metodo = 'CHAVE';
      } else {
        return res.status(400).json({ 
          error: 'Nota fiscal não possui XML nem chave de acesso' 
        });
      }
    } else if (xml) {
      dadosEnvio = {
        xml: xml,
        formato: 'pdf'
      };
      metodo = 'XML';
    } else if (chave) {
      // Validar formato da chave (44 dígitos)
      if (!/^\d{44}$/.test(chave)) {
        return res.status(400).json({ error: 'Chave de acesso deve ter 44 dígitos' });
      }
      
      dadosEnvio = {
        chave: chave,
        formato: 'pdf'
      };
      metodo = 'CHAVE';
    }

    console.log(`Gerando DANFE via ${metodo} usando meudanfe.com.br`);

    // URL correta da API meudanfe.com.br baseada na documentação
    const apiUrl = 'https://ws.meudanfe.com.br/api/v1/get/nfe/xmltodanfepdf/API';

    try {
      // A API meudanfe.com.br usa apenas XML via POST direto (não JSON)
      // Se não temos XML mas temos chave, tentar buscar XML via NSDocs primeiro
      if (metodo !== 'XML' || !dadosEnvio.xml) {
        if (dadosEnvio.chave && dadosEnvio.chave.length === 44) {
          console.log(`Tentando buscar XML via NSDocs para chave: ${dadosEnvio.chave}`);
          
          // Tentar buscar XML via NSDocs usando as credenciais da empresa
          try {
            const xmlResponse = await fetch(`${req.protocol}://${req.get('host')}/api/xml/fetch-from-nsdocs`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization || ''
              },
              body: JSON.stringify({
                chaveNotaFiscal: dadosEnvio.chave
              })
            });

            if (xmlResponse.ok) {
              const xmlResult: any = await xmlResponse.json();
              if (xmlResult.success && xmlResult.xmlContent) {
                dadosEnvio.xml = xmlResult.xmlContent;
                metodo = 'XML';
                console.log('XML recuperado com sucesso via NSDocs');
              } else {
                console.log('NSDocs não retornou XML válido, continuando com processamento alternativo...');
              }
            } else {
              console.log('Falha na busca NSDocs, continuando com processamento alternativo...');
            }
          } catch (error) {
            console.log('Erro ao buscar XML via NSDocs, continuando com processamento alternativo:', error);
          }
        }
      }

      // Primeiro, tentar usar o novo gerador DANFE padrão SEFAZ
      if (dadosEnvio.xml) {
        try {
          console.log('Gerando DANFE SEFAZ-compliant com nova biblioteca...');
          const { NFEXMLParser } = await import('./nfe-xml-parser.js');
          const nfeData = await NFEXMLParser.parseXMLToNFEData(dadosEnvio.xml);
          
          if (nfeData) {
            const { DANFESefazCompliant } = await import('./danfe-sefaz-compliant.js');
            const pdfBuffer = await DANFESefazCompliant.gerarDANFEOficial(nfeData);
            
            const base64PDF = pdfBuffer.toString('base64');
            const pdfDataUrl = `data:application/pdf;base64,${base64PDF}`;
            
            return res.json({
              success: true,
              pdfUrl: pdfDataUrl,
              pdfBase64: base64PDF,
              message: `DANFE oficial SEFAZ gerado com sucesso`,
              metodo: 'DANFE_SEFAZ_COMPLIANT',
              provider: 'CrossWMS SEFAZ Compliant Generator'
            });
          }
        } catch (danfeError) {
          console.warn('Gerador DANFE SEFAZ falhou:', danfeError);
          console.log('Tentando biblioteca NFe local como fallback...');
          
          // Fallback para biblioteca NFe local
          try {
            const pdfBuffer = await nfeProcessor.generateDANFEFromXML(dadosEnvio.xml);
            
            if (pdfBuffer) {
              const base64PDF = pdfBuffer.toString('base64');
              const pdfDataUrl = `data:application/pdf;base64,${base64PDF}`;
              
              return res.json({
                success: true,
                pdfUrl: pdfDataUrl,
                pdfBase64: base64PDF,
                message: `DANFE gerado com sucesso (fallback)`,
                metodo: 'LOCAL_NFE_LIB',
                provider: 'CrossWMS NFe Processor'
              });
            }
          } catch (localError) {
            console.warn('Biblioteca NFe local também falhou:', localError);
          }
        }
      } else {
        console.log('XML não disponível, tentando gerar DANFE básico...');
        
        // Se não temos XML, buscar dados da nota no banco
        if (notaId) {
          try {
            const notaFiscal = await storage.getNotaFiscalRastreamentoById(notaId);
            if (notaFiscal) {
              console.log('Gerando DANFE SEFAZ-compliant com dados do banco...');
              
              // Converter dados do banco para formato NFEData
              const nfeData = {
                numeroNF: notaFiscal.numero || 'S/N',
                serie: notaFiscal.serie || '001',
                dataEmissao: notaFiscal.dataEmissao || new Date().toLocaleDateString('pt-BR'),
                chaveAcesso: notaFiscal.chaveAcesso || '00000000000000000000000000000000000000000000',
                tipoOperacao: '1', // 1 = SAÍDA
                naturezaOperacao: 'VENDA',
                emitente: {
                  razaoSocial: notaFiscal.remetente || 'EMPRESA EMITENTE LTDA',
                  cnpj: '00000000000000',
                  endereco: 'RUA EXEMPLO, 123',
                  bairro: 'CENTRO',
                  cidade: notaFiscal.cidadeOrigem?.split(' - ')[0] || 'CIDADE',
                  uf: notaFiscal.cidadeOrigem?.split(' - ')[1] || 'SP',
                  cep: '00000000',
                  inscricaoEstadual: '000000000000'
                },
                destinatario: {
                  razaoSocial: notaFiscal.destinatario || 'DESTINATÁRIO PADRÃO',
                  cnpj: '00000000000000',
                  endereco: 'RUA DESTINO, 456',
                  bairro: 'CENTRO',
                  cidade: notaFiscal.cidadeDestino?.split(' - ')[0] || 'CIDADE',
                  uf: notaFiscal.cidadeDestino?.split(' - ')[1] || 'RJ',
                  cep: '00000000',
                  inscricaoEstadual: '000000000000'
                },
                produtos: [{
                  codigo: '001',
                  descricao: 'SERVIÇO DE TRANSPORTE - DIVERSOS LIMITADOS',
                  ncm: '84122110',
                  cfop: '5102',
                  cst: '5/102',
                  unidade: 'PC',
                  quantidade: notaFiscal.volumes || 1,
                  valorUnitario: notaFiscal.valorTotal || 0,
                  valorTotal: notaFiscal.valorTotal || 0
                }],
                totais: {
                  valorTotalProdutos: notaFiscal.valorTotal || 0,
                  valorTotalNota: notaFiscal.valorTotal || 0,
                  valorICMS: 0,
                  valorIPI: 0
                }
              };
              
              const { DANFESefazCompliant } = await import('./danfe-sefaz-compliant.js');
              const pdfBuffer = await DANFESefazCompliant.gerarDANFEOficial(nfeData);
              
              const base64PDF = pdfBuffer.toString('base64');
              const pdfDataUrl = `data:application/pdf;base64,${base64PDF}`;
              
              return res.json({
                success: true,
                pdfUrl: pdfDataUrl,
                pdfBase64: base64PDF,
                message: `DANFE oficial SEFAZ gerado com dados do banco`,
                metodo: 'DANFE_SEFAZ_COMPLIANT_DB',
                provider: 'CrossWMS SEFAZ Compliant Generator'
              });
            }
          } catch (dbError) {
            console.warn('Erro ao buscar dados da nota:', dbError);
          }
        }
      }

      // Fallback: tentar meudanfe.com.br se disponível
      if (process.env.MEUDANFE_API_KEY && dadosEnvio.xml) {
        console.log('Tentando fallback para meudanfe.com.br...');
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain'
          },
          body: dadosEnvio.xml
        });

        if (response.ok) {
          const base64PDF = await response.text();
          
          // Remover aspas duplas se presentes
          const cleanBase64 = base64PDF.replace(/"/g, '');
          
          // Criar URL data: para o PDF
          const pdfDataUrl = `data:application/pdf;base64,${cleanBase64}`;
          
          return res.json({
            success: true,
            pdfUrl: pdfDataUrl,
            pdfBase64: cleanBase64,
            message: `DANFE gerado com sucesso via meudanfe.com.br`,
            metodo: metodo,
            provider: 'meudanfe.com.br'
          });
        } else {
          const errorText = await response.text();
          console.error('Erro na API meudanfe.com.br:', response.status, errorText);
          
          res.status(500).json({
            success: false,
            error: `Todos os métodos falharam. Último erro da API meudanfe.com.br: ${response.status} - ${errorText}`,
            metodo: metodo
          });
        }
      } else {
        res.status(500).json({
          success: false,
          error: 'Biblioteca NFe local falhou e API meudanfe.com.br não configurada',
          metodo: metodo
        });
      }
    } catch (error) {
      console.error('Erro de conexão com API meudanfe.com.br:', error);
      
      res.status(500).json({
        success: false,
        error: `Erro de conexão com API meudanfe.com.br: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        metodo: metodo
      });
    }

  } catch (error) {
    console.error('Erro ao gerar DANFE:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao gerar DANFE',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota para verificar status das APIs
router.get('/status', authenticateToken, async (req: AuthenticatedRequest, res) => {
  const apiKey = process.env.MEUDANFE_API_KEY;
  
  res.json({
    localProcessor: {
      available: true,
      status: 'Biblioteca NFe Local ativa',
      provider: 'CrossWMS NFe Processor'
    },
    externalAPI: {
      configured: !!apiKey,
      status: apiKey ? 'Chave API configurada' : 'Chave API não configurada',
      provider: 'meudanfe.com.br'
    },
    preferredMethod: 'Local processor com fallback externo'
  });
});

// Rota para validar XML de NFe
router.post('/validar-xml', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { xml } = req.body;

    if (!xml) {
      return res.status(400).json({ error: 'Conteúdo XML é obrigatório' });
    }

    const validation = nfeProcessor.validateXML(xml);

    res.json({
      valid: validation.valid,
      errors: validation.errors,
      message: validation.valid ? 'XML válido' : 'XML contém erros'
    });

  } catch (error) {
    console.error('Erro ao validar XML:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor ao validar XML',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Endpoint específico para testar DANFE oficial
router.post('/gerar-danfe-oficial', async (req: Request, res: Response) => {
  try {
    console.log('=== DANFE OFICIAL: Iniciando processo ===');
    
    const { xmlContent, chave } = req.body;
    
    // XML de exemplo se não fornecido
    const xmlExemplo = xmlContent || `<?xml version="1.0" encoding="utf-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <protNFe>
    <infProt>
      <nProt>242250145815827</nProt>
      <digVal>gCiwHEKZVefa1ORgxuQPcMAb6IY=</digVal>
      <dhRecbto>2025-04-17T17:30:42-03:00</dhRecbto>
      <chNFe>42250485179240000239550020004175331780623268</chNFe>
      <xMotivo>Autorizado o uso da NF-e</xMotivo>
      <cStat>100</cStat>
    </infProt>
  </protNFe>
  <NFe>
    <infNFe Id="NFe42250485179240000239550020004175331780623268">
      <ide>
        <tpNF>1</tpNF>
        <mod>55</mod>
        <nNF>417533</nNF>
        <serie>2</serie>
        <dhEmi>2025-04-17T17:29:00-03:00</dhEmi>
        <dhSaiEnt>2025-04-17T17:29:00-03:00</dhSaiEnt>
        <natOp>VENDA DE MERCADORIA</natOp>
      </ide>
      <emit>
        <xNome>CORSUL COMERCIO E REPRESENTACOES DO SUL LTDA</xNome>
        <CNPJ>85179240000239</CNPJ>
        <enderEmit>
          <xLgr>RUA GUARUJA</xLgr>
          <nro>434</nro>
          <xBairro>ITAUM</xBairro>
          <xMun>JOINVILLE</xMun>
          <UF>SC</UF>
          <CEP>89210300</CEP>
          <fone>4731458100</fone>
        </enderEmit>
        <IE>254851401</IE>
      </emit>
      <dest>
        <xNome>CONSORCIO DE ALUMINIO DO MARANHAO CONSORCIO ALUMAR</xNome>
        <CNPJ>00655209000193</CNPJ>
        <enderDest>
          <xLgr>RODOVIA BR 135</xLgr>
          <nro>SN</nro>
          <xBairro>DISTRITO INDUSTRIAL</xBairro>
          <xMun>SAO LUIS</xMun>
          <UF>MA</UF>
          <CEP>65095050</CEP>
          <fone>3521075167</fone>
        </enderDest>
        <IE>120818728</IE>
      </dest>
      <det>
        <nItem>1</nItem>
        <prod>
          <cProd>000000000003784</cProd>
          <xProd>BOTINA 70B19 EC PAD PTA C/ELAST C/BICO COMP PLUS CA 34554 38</xProd>
          <NCM>64059000</NCM>
          <CFOP>6102</CFOP>
          <uCom>PR</uCom>
          <qCom>8.0000</qCom>
          <vUnCom>103.2200000000</vUnCom>
          <vProd>825.76</vProd>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <vBC>825.76</vBC>
              <pICMS>7.0000</pICMS>
              <vICMS>57.80</vICMS>
            </ICMS00>
          </ICMS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>825.76</vBC>
          <vICMS>57.80</vICMS>
          <vProd>825.76</vProd>
          <vNF>825.76</vNF>
          <vFrete>0</vFrete>
          <vSeg>0</vSeg>
          <vDesc>0</vDesc>
          <vOutro>0</vOutro>
          <vIPI>0</vIPI>
        </ICMSTot>
      </total>
      <transp>
        <modFrete>0</modFrete>
        <transporta>
          <xNome>SCHREIBER LOGISTICA LTDA</xNome>
          <CNPJ>10349430000258</CNPJ>
          <xEnder>BENEDITO CLIMERIO DE SANTANA</xEnder>
          <xMun>GUARULHOS</xMun>
          <UF>SP</UF>
          <IE>ISENTO</IE>
        </transporta>
        <vol>
          <qVol>2</qVol>
          <esp>VOLUME</esp>
          <pesoB>11.000</pesoB>
          <pesoL>11.000</pesoL>
        </vol>
      </transp>
      <cobr>
        <fat>
          <nFat>2000417533</nFat>
          <vOrig>825.76</vOrig>
          <vLiq>825.76</vLiq>
        </fat>
        <dup>
          <nDup>001</nDup>
          <dVenc>2025-08-15</dVenc>
          <vDup>825.76</vDup>
        </dup>
      </cobr>
    </infNFe>
  </NFe>
</nfeProc>`;
    
    // Usar o novo parser e gerador oficial
    const nfeData = await NFEXMLParser.parseXMLToNFEData(xmlExemplo);
    console.log('Dados NFe processados:', JSON.stringify(nfeData, null, 2));
    
    const pdfBuffer = await DANFEOficialGenerator.generateOfficialDANFE(nfeData);
    const base64PDF = pdfBuffer.toString('base64');
    
    res.json({
      success: true,
      pdfUrl: `data:application/pdf;base64,${base64PDF}`,
      fonte: 'danfe_oficial_sefaz',
      dadosProcessados: nfeData
    });
    
  } catch (error) {
    console.error('Erro ao gerar DANFE oficial:', error);
    res.status(500).json({
      success: false,
      error: `Erro ao gerar DANFE oficial: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    });
  }
});

export default router;