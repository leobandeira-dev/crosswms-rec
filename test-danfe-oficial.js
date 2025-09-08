// Teste simples do novo gerador DANFE oficial
import { NFEXMLParser } from './server/nfe-xml-parser.js';
import { DANFEOficialGenerator } from './server/danfe-oficial-generator.js';
import fs from 'fs';

const xmlExemplo = `<?xml version="1.0" encoding="utf-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <protNFe>
    <infProt>
      <nProt>242250145815827</nProt>
      <dhRecbto>2025-04-17T17:30:42-03:00</dhRecbto>
      <chNFe>42250485179240000239550020004175331780623268</chNFe>
    </infProt>
  </protNFe>
  <NFe>
    <infNFe Id="NFe42250485179240000239550020004175331780623268">
      <ide>
        <tpNF>1</tpNF>
        <nNF>417533</nNF>
        <serie>2</serie>
        <dhEmi>2025-04-17T17:29:00-03:00</dhEmi>
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
        </enderEmit>
        <IE>254851401</IE>
      </emit>
      <dest>
        <xNome>CONSORCIO DE ALUMINIO DO MARANHAO CONSORCIO ALUMAR</xNome>
        <CNPJ>00655209000193</CNPJ>
        <enderDest>
          <xLgr>RODOVIA BR 135</xLgr>
          <xMun>SAO LUIS</xMun>
          <UF>MA</UF>
          <CEP>65095050</CEP>
        </enderDest>
        <IE>120818728</IE>
      </dest>
      <det>
        <nItem>1</nItem>
        <prod>
          <cProd>000000000003784</cProd>
          <xProd>BOTINA 70B19 EC PAD PTA C/ELAST</xProd>
          <NCM>64059000</NCM>
          <CFOP>6102</CFOP>
          <uCom>PR</uCom>
          <qCom>8.0000</qCom>
          <vUnCom>103.22</vUnCom>
          <vProd>825.76</vProd>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
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
        </ICMSTot>
      </total>
      <transp>
        <modFrete>0</modFrete>
        <transporta>
          <xNome>SCHREIBER LOGISTICA LTDA</xNome>
          <CNPJ>10349430000258</CNPJ>
        </transporta>
        <vol>
          <qVol>2</qVol>
          <esp>VOLUME</esp>
          <pesoB>11.000</pesoB>
        </vol>
      </transp>
      <cobr>
        <dup>
          <nDup>001</nDup>
          <dVenc>2025-08-15</dVenc>
          <vDup>825.76</vDup>
        </dup>
      </cobr>
    </infNFe>
  </NFe>
</nfeProc>`;

async function testeDANFEOficial() {
  try {
    console.log('🧪 Testando parser XML...');
    const nfeData = await NFEXMLParser.parseXMLToNFEData(xmlExemplo);
    console.log('✅ Parser XML funcionou');
    console.log('📋 Dados extraídos:', {
      numero: nfeData.numeroNF,
      serie: nfeData.serie,
      emitente: nfeData.emitente.razaoSocial,
      destinatario: nfeData.destinatario.razaoSocial,
      valor: nfeData.totais.valorTotalNota
    });
    
    console.log('🖨️ Testando gerador DANFE...');
    const pdfBuffer = await DANFEOficialGenerator.generateOfficialDANFE(nfeData);
    console.log('✅ Gerador DANFE funcionou');
    console.log('📄 PDF gerado:', pdfBuffer.length, 'bytes');
    
    // Salvar o PDF para verificar
    fs.writeFileSync('danfe-oficial-teste.pdf', pdfBuffer);
    console.log('💾 PDF salvo como: danfe-oficial-teste.pdf');
    
    return true;
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
}

testeDANFEOficial();