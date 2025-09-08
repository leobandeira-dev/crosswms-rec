// Teste endpoint exclusivo para DANFE simples
import express, { Request, Response } from 'express';
import { NFEXMLParser } from './nfe-xml-parser.js';
import { DANFESimples } from './danfe-simples.js';

export const testDANFESimples = async (req: Request, res: Response) => {
  try {
    console.log('🧪 Teste DANFE simples iniciado');
    
    const xmlSimples = `<?xml version="1.0" encoding="utf-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
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
        <xNome>CONSORCIO DE ALUMINIO DO MARANHAO</xNome>
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
      </transp>
    </infNFe>
  </NFe>
</nfeProc>`;
    
    const nfeData = await NFEXMLParser.parseXMLToNFEData(xmlSimples);
    console.log('✅ XML processado:', nfeData.numeroNF);
    console.log('📋 Dados estruturados:', {
      numero: nfeData.numeroNF,
      serie: nfeData.serie,
      emitente: nfeData.emitente?.razaoSocial,
      destinatario: nfeData.destinatario?.razaoSocial,
      produtos: nfeData.produtos?.length
    });
    
    const pdfBuffer = await DANFESimples.gerarDANFE(nfeData);
    console.log('✅ PDF simples gerado:', pdfBuffer.length, 'bytes');
    
    const base64PDF = pdfBuffer.toString('base64');
    
    res.json({
      success: true,
      pdfUrl: `data:application/pdf;base64,${base64PDF}`,
      fonte: 'danfe_simples_teste',
      numeroNF: nfeData.numeroNF,
      emitente: nfeData.emitente?.razaoSocial,
      pdfSize: pdfBuffer.length,
      dadosExtraidos: {
        numero: nfeData.numeroNF,
        serie: nfeData.serie,
        dataEmissao: nfeData.dataEmissao,
        chaveAcesso: nfeData.chaveAcesso,
        valorTotal: nfeData.totais?.valorTotalNota
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no teste DANFE simples:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
};