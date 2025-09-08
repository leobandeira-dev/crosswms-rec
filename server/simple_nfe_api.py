#!/usr/bin/env python3
import sys
import json
import requests
import re
from urllib.parse import quote
import xml.etree.ElementTree as ET

def validate_nfe_key(invoice_key):
    """Validate NFe key format"""
    if not invoice_key or len(invoice_key) != 44:
        return False, "Chave deve ter 44 dígitos"
    if not invoice_key.isdigit():
        return False, "Chave deve conter apenas números"
    return True, "Chave válida"

def get_uf_from_key(invoice_key):
    """Extract UF from NFe key"""
    uf_map = {
        '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
        '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL',
        '28': 'SE', '29': 'BA', '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP', '41': 'PR',
        '42': 'SC', '43': 'RS', '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF'
    }
    return uf_map.get(invoice_key[:2], 'SP')

def try_receita_federal_api(invoice_key):
    """Try Receita Federal NFe consultation"""
    try:
        # Official Receita Federal NFe consultation endpoint
        url = f"https://www.receita.fazenda.gov.br/ws/nfe/consultaprotocolo"
        
        soap_body = f'''<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
    <soap:Body>
        <nfeConsultaNF xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NfeConsulta4">
            <nfeDadosMsg>
                <consSitNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
                    <tpAmb>1</tpAmb>
                    <xServ>CONSULTAR</xServ>
                    <chNFe>{invoice_key}</chNFe>
                </consSitNFe>
            </nfeDadosMsg>
        </nfeConsultaNF>
    </soap:Body>
</soap:Envelope>'''
        
        headers = {
            'Content-Type': 'application/soap+xml; charset=utf-8',
            'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NfeConsulta4/nfeConsultaNF',
            'User-Agent': 'NFe-Consultation/1.0'
        }
        
        response = requests.post(url, data=soap_body, headers=headers, timeout=30)
        
        if response.status_code == 200:
            content = response.text
            if invoice_key in content and 'protNFe' in content:
                # Extract NFe XML from SOAP response
                xml_match = re.search(r'<nfeProc.*?</nfeProc>', content, re.DOTALL)
                if xml_match:
                    return xml_match.group(0)
                
                # Try alternative extraction
                xml_match = re.search(r'<NFe.*?</NFe>', content, re.DOTALL)
                if xml_match:
                    return xml_match.group(0)
    
    except Exception as e:
        print(f"Receita Federal API error: {e}")
    
    return None

def try_sefaz_webservice(invoice_key):
    """Try SEFAZ webservice based on UF"""
    uf = get_uf_from_key(invoice_key)
    
    # SEFAZ webservice URLs by state
    sefaz_ws = {
        'SP': 'https://nfe.fazenda.sp.gov.br/ws/nfeConsulta4.asmx',
        'RJ': 'https://www.nfe.rj.gov.br/ws/nfeConsulta4.asmx',
        'MG': 'https://nfe.fazenda.mg.gov.br/ws/nfeConsulta4.asmx',
        'RS': 'https://nfe.sefaz.rs.gov.br/ws/nfeConsulta4.asmx',
        'PR': 'https://nfe.sefa.pr.gov.br/ws/nfeConsulta4.asmx'
    }
    
    ws_url = sefaz_ws.get(uf)
    if not ws_url:
        return None
    
    try:
        soap_envelope = f'''<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <nfeConsultaNF xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NfeConsulta4">
      <nfeDadosMsg>
        <consSitNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
          <tpAmb>1</tpAmb>
          <xServ>CONSULTAR</xServ>
          <chNFe>{invoice_key}</chNFe>
        </consSitNFe>
      </nfeDadosMsg>
    </nfeConsultaNF>
  </soap:Body>
</soap:Envelope>'''
        
        headers = {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NfeConsulta4/nfeConsultaNF',
            'User-Agent': 'NFe-Consultation/1.0'
        }
        
        response = requests.post(ws_url, data=soap_envelope, headers=headers, timeout=25)
        
        if response.status_code == 200 and invoice_key in response.text:
            # Extract XML from SOAP response
            xml_match = re.search(r'<nfeProc.*?</nfeProc>', response.text, re.DOTALL)
            if xml_match:
                return xml_match.group(0)
    
    except Exception as e:
        print(f"SEFAZ {uf} webservice error: {e}")
    
    return None

def try_portal_consultation(invoice_key):
    """Try direct portal consultation"""
    try:
        # Portal Nacional da NFe
        portal_url = "https://www.nfe.fazenda.gov.br/portal/consulta.aspx"
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
        }
        
        # Make initial request to get session
        session = requests.Session()
        response = session.get(portal_url, headers=headers, timeout=15)
        
        if response.status_code == 200:
            # Look for form fields and viewstate
            form_data = {
                'ctl00$ContentPlaceHolder1$txtChaveAcesso': invoice_key,
                'ctl00$ContentPlaceHolder1$btnConsultar': 'Consultar'
            }
            
            # Extract viewstate if present
            viewstate_match = re.search(r'name="__VIEWSTATE" value="([^"]*)"', response.text)
            if viewstate_match:
                form_data['__VIEWSTATE'] = viewstate_match.group(1)
            
            # Submit form
            response = session.post(portal_url, data=form_data, headers=headers, timeout=20)
            
            if response.status_code == 200 and invoice_key in response.text:
                # Look for XML content in response
                if '<?xml' in response.text:
                    xml_start = response.text.find('<?xml')
                    xml_end = response.text.find('</nfeProc>', xml_start)
                    if xml_end != -1:
                        return response.text[xml_start:xml_end + 10]
    
    except Exception as e:
        print(f"Portal consultation error: {e}")
    
    return None

def try_public_nfe_apis(invoice_key):
    """Try third-party public NFe APIs"""
    public_apis = [
        f"https://api.nfe.eti.br/v1/nfe/{invoice_key}",
        f"https://nfe-api.herokuapp.com/consulta/{invoice_key}",
        f"https://consultanfe.com/api/v1/consulta/{invoice_key}"
    ]
    
    headers = {
        'User-Agent': 'NFe-Consultation-Service/1.0',
        'Accept': 'application/json, application/xml, text/xml'
    }
    
    for api_url in public_apis:
        try:
            response = requests.get(api_url, headers=headers, timeout=15)
            
            if response.status_code == 200:
                content = response.text
                
                # Check if response contains XML
                if '<?xml' in content and invoice_key in content:
                    # Try to extract clean XML
                    xml_start = content.find('<?xml')
                    xml_end = content.find('</nfeProc>', xml_start)
                    if xml_end == -1:
                        xml_end = content.find('</NFe>', xml_start)
                    
                    if xml_end != -1:
                        xml_content = content[xml_start:xml_end + 10]
                        if len(xml_content) > 1000:  # Ensure it's substantial XML
                            return xml_content
                
                # Try JSON response
                try:
                    json_data = response.json()
                    if 'xml' in json_data and invoice_key in str(json_data['xml']):
                        return json_data['xml']
                except:
                    pass
        
        except Exception as e:
            print(f"Public API {api_url} error: {e}")
            continue
    
    return None

def get_nfe_xml_simple(invoice_key):
    """Main function with multiple consultation methods"""
    # Validate key
    is_valid, message = validate_nfe_key(invoice_key)
    if not is_valid:
        return {"success": False, "error": message}
    
    print(f"Iniciando consulta NFe para chave: {invoice_key}")
    
    methods = [
        ("Webservice SEFAZ", try_sefaz_webservice),
        ("API Receita Federal", try_receita_federal_api),
        ("Portal Nacional NFe", try_portal_consultation),
        ("APIs Públicas", try_public_nfe_apis)
    ]
    
    for method_name, method_func in methods:
        try:
            print(f"Tentando: {method_name}")
            xml_content = method_func(invoice_key)
            
            if xml_content and len(xml_content) > 500 and invoice_key in xml_content:
                print(f"✅ XML obtido via {method_name}")
                return {
                    "success": True,
                    "xml_content": xml_content,
                    "message": f"XML obtido via {method_name}",
                    "invoice_key": invoice_key
                }
        except Exception as e:
            print(f"Erro em {method_name}: {e}")
            continue
    
    return {
        "success": False,
        "error": f"Não foi possível obter o XML da NFe {invoice_key}. A chave pode estar incorreta ou a nota fiscal pode não ter sido autorizada pela SEFAZ.",
        "tried_methods": [method[0] for method in methods]
    }

def main():
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave NFe é obrigatória"}
    else:
        invoice_key = sys.argv[1].strip()
        result = get_nfe_xml_simple(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()