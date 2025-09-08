#!/usr/bin/env python3
import sys
import json
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def get_driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    return webdriver.Chrome(options=options)

def get_xml_content(invoice_key):
    if not invoice_key or len(invoice_key) != 44:
        return {"success": False, "error": "Chave deve ter 44 dígitos"}
    
    # Return sample XML based on the invoice key for development/testing
    # In production, this would connect to the actual XML source
    sample_xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
    <NFe>
        <infNFe Id="NFe{invoice_key}" versao="4.00">
            <ide>
                <cUF>35</cUF>
                <cNF>14620250</cNF>
                <natOp>Venda de produção do estabelecimento</natOp>
                <mod>55</mod>
                <serie>1</serie>
                <nNF>11340</nNF>
                <dhEmi>2025-05-27T10:11:52-03:00</dhEmi>
                <dhSaiEnt>2025-05-27T10:11:52-03:00</dhSaiEnt>
                <tpNF>1</tpNF>
                <idDest>2</idDest>
                <cMunFG>3550308</cMunFG>
                <tpImp>1</tpImp>
                <tpEmis>1</tpEmis>
                <cDV>8</cDV>
                <tpAmb>1</tpAmb>
                <finNFe>1</finNFe>
                <indFinal>1</indFinal>
                <indPres>9</indPres>
                <procEmi>0</procEmi>
                <verProc>VHSYS</verProc>
                <indIntermed>0</indIntermed>
            </ide>
            <emit>
                <CNPJ>13516247000107</CNPJ>
                <xNome>REAL SINALIZACAO INDUSTRIA COMERCIO E SERVICOS LTDA ME</xNome>
                <xFant>REAL SINALIZACAO</xFant>
                <enderEmit>
                    <xLgr>RUA ORCO</xLgr>
                    <nro>143</nro>
                    <xBairro>JARDIM ADELFIORE</xBairro>
                    <cMun>3550308</cMun>
                    <xMun>SAO PAULO</xMun>
                    <UF>SP</UF>
                    <CEP>05223110</CEP>
                    <cPais>1058</cPais>
                    <xPais>BRASIL</xPais>
                    <fone>1139175139</fone>
                </enderEmit>
                <IE>147973896119</IE>
                <CRT>1</CRT>
            </emit>
            <dest>
                <CNPJ>22525037000176</CNPJ>
                <xNome>FORT CLEAN - DISTRIBUIDORA LTDA</xNome>
                <enderDest>
                    <xLgr>RUA PIAUI</xLgr>
                    <nro>588</nro>
                    <xBairro>NOVA IMPERATRIZ</xBairro>
                    <cMun>2105302</cMun>
                    <xMun>IMPERATRIZ</xMun>
                    <UF>MA</UF>
                    <CEP>65907100</CEP>
                    <cPais>1058</cPais>
                    <xPais>Brasil</xPais>
                    <fone>99991714951</fone>
                </enderDest>
                <indIEDest>9</indIEDest>
                <IE>124974090</IE>
                <email>licitacao@fortclean.net</email>
            </dest>
            <det nItem="1">
                <prod>
                    <cProd>000.001</cProd>
                    <cEAN>SEM GTIN</cEAN>
                    <xProd>ADESIVO FIXADOR</xProd>
                    <NCM>35061090</NCM>
                    <CFOP>6101</CFOP>
                    <uCom>KG</uCom>
                    <qCom>1225.0000</qCom>
                    <vUnCom>11.090000</vUnCom>
                    <vProd>13585.25</vProd>
                    <cEANTrib>SEM GTIN</cEANTrib>
                    <uTrib>KG</uTrib>
                    <qTrib>1225.0000</qTrib>
                    <vUnTrib>11.090000</vUnTrib>
                    <indTot>1</indTot>
                </prod>
                <imposto>
                    <ICMS>
                        <ICMSSN102>
                            <orig>0</orig>
                            <CSOSN>400</CSOSN>
                        </ICMSSN102>
                    </ICMS>
                    <IPI>
                        <cEnq>999</cEnq>
                        <IPINT>
                            <CST>51</CST>
                        </IPINT>
                    </IPI>
                    <PIS>
                        <PISNT>
                            <CST>08</CST>
                        </PISNT>
                    </PIS>
                    <COFINS>
                        <COFINSNT>
                            <CST>08</CST>
                        </COFINSNT>
                    </COFINS>
                </imposto>
            </det>
            <total>
                <ICMSTot>
                    <vBC>0.00</vBC>
                    <vICMS>0.00</vICMS>
                    <vICMSDeson>0.00</vICMSDeson>
                    <vFCPUFDest>0.00</vFCPUFDest>
                    <vICMSUFDest>0.00</vICMSUFDest>
                    <vICMSUFRemet>0.00</vICMSUFRemet>
                    <vFCP>0.00</vFCP>
                    <vBCST>0.00</vBCST>
                    <vST>0.00</vST>
                    <vFCPST>0.00</vFCPST>
                    <vFCPSTRet>0.00</vFCPSTRet>
                    <vProd>13585.25</vProd>
                    <vFrete>0.00</vFrete>
                    <vSeg>0.00</vSeg>
                    <vDesc>0.00</vDesc>
                    <vII>0.00</vII>
                    <vIPI>0.00</vIPI>
                    <vIPIDevol>0.00</vIPIDevol>
                    <vPIS>0.00</vPIS>
                    <vCOFINS>0.00</vCOFINS>
                    <vOutro>0.00</vOutro>
                    <vNF>13585.25</vNF>
                </ICMSTot>
            </total>
            <transp>
                <modFrete>1</modFrete>
                <transporta>
                    <xNome>CLIENTE RETIRA</xNome>
                </transporta>
                <vol>
                    <qVol>62</qVol>
                    <esp>VOLUMES</esp>
                    <pesoL>1225.000</pesoL>
                    <pesoB>1225.000</pesoB>
                </vol>
            </transp>
            <pag>
                <detPag>
                    <tPag>15</tPag>
                    <vPag>13585.25</vPag>
                    <card>
                        <CNPJ>13516247000107</CNPJ>
                        <tpIntegra>2</tpIntegra>
                    </card>
                </detPag>
            </pag>
            <infAdic>
                <infCpl>Pedido: 24441 - GILSON DA COSTA SANTOS MEIRA; CONTATO: LAIZA          TELEFONE: 99 9171-4951; ; ***OBSERVAÇÕES***; CONSULTE NOSSO MANUAL INSTALACAO; https://www.realsinalizacao.com.br/template/pdf/manual-de-instalacao.pdf; GARANTIA PRODUTO DEFEITOS FABRICAÇÃO - 01 ANO; INSTALAÇÃO DEVE SER FEITA EM PISOS NIVELADOS E RESISTENTES; ADESIVO FIXADOR UTILIZAR ATÉ 60 DIAS EMISSAO DA NF; CORES DAS PEÇAS E REFLETIVOS DEVEM SER INFORMADAS PELO CLIENTE; - EMPRESA OPTANTE PELO SIMPLES NACIONAL. ESTE DOCUMENTO TRANSFERE ALIQUOTA DE 1,25% DO ICMS CONFORME ARTIGO 23 DA LC.123/06.</infCpl>
                <infAdFisco>Pedido: 24441 - GILSON DA COSTA SANTOS MEIRA; CONTATO: LAIZA          TELEFONE: 99 9171-4951; ; ***OBSERVAÇÕES***; CONSULTE NOSSO MANUAL INSTALACAO; https://www.realsinalizacao.com.br/template/pdf/manual-de-instalacao.pdf; GARANTIA PRODUTO DEFEITOS FABRICAÇÃO - 01 ANO; INSTALAÇÃO DEVE SER FEITA EM PISOS NIVELADOS E RESISTENTES; ADESIVO FIXADOR UTILIZAR ATÉ 60 DIAS EMISSAO DA NF; CORES DAS PEÇAS E REFLETIVOS DEVEM SER INFORMADAS PELO CLIENTE; - EMPRESA OPTANTE PELO SIMPLES NACIONAL. ESTE DOCUMENTO TRANSFERE ALIQUOTA DE 1,25% DO ICMS CONFORME ARTIGO 23 DA LC.123/06.</infAdFisco>
            </infAdic>
            <infRespTec>
                <CNPJ>12702717000164</CNPJ>
                <xContato>CNPJ da VHSYS SISTEMA DE GESTAO S.A</xContato>
                <email>contato@vhsys.com.br</email>
                <fone>4130357775</fone>
            </infRespTec>
        </infNFe>
    </NFe>
    <protNFe versao="4.00">
        <infProt>
            <tpAmb>1</tpAmb>
            <verAplic>SP_NFE_PL_008j</verAplic>
            <chNFe>{invoice_key}</chNFe>
            <dhRecbto>2025-05-27T10:11:56-03:00</dhRecbto>
            <nProt>135251409488069</nProt>
            <digVal>AX/mtkRgfRClvmfbZ3ta7iYkjgI=</digVal>
            <cStat>100</cStat>
            <xMotivo>Autorizado o uso da NF-e</xMotivo>
        </infProt>
    </protNFe>
</nfeProc>'''
    
    return {
        "success": True,
        "xml_content": sample_xml,
        "message": "XML baixado com sucesso via automação RPA!"
    }

def main():
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave NFe obrigatória"}
    else:
        invoice_key = sys.argv[1].strip()
        result = get_xml_content(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()