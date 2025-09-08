#!/usr/bin/env python3
import sys
import json
import requests
import time
from urllib.parse import quote
import xml.etree.ElementTree as ET

def validate_nfe_key(invoice_key):
    """Validate NFe key format and structure"""
    if not invoice_key or len(invoice_key) != 44:
        return False, "Chave deve ter 44 dígitos"
    
    if not invoice_key.isdigit():
        return False, "Chave deve conter apenas números"
    
    return True, "Chave válida"

def extract_uf_from_key(invoice_key):
    """Extract UF code from NFe key"""
    uf_codes = {
        '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
        '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL',
        '28': 'SE', '29': 'BA', '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP', '41': 'PR',
        '42': 'SC', '43': 'RS', '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF'
    }
    uf_code = invoice_key[:2]
    return uf_codes.get(uf_code, 'SP')  # Default to SP if not found

def try_sefaz_consultation(invoice_key):
    """Try to consult NFe via SEFAZ webservices"""
    uf = extract_uf_from_key(invoice_key)
    
    # SEFAZ consultation URLs by state
    sefaz_urls = {
        'SP': 'https://nfe.fazenda.sp.gov.br/ws/consultaprotocolo',
        'RJ': 'https://www.nfe.rj.gov.br/ws/consultaprotocolo',
        'MG': 'https://nfe.fazenda.mg.gov.br/ws/consultaprotocolo',
        'RS': 'https://nfe.sefaz.rs.gov.br/ws/consultaprotocolo'
    }
    
    consultation_url = sefaz_urls.get(uf)
    if not consultation_url:
        return None
    
    try:
        # SOAP envelope for NFe consultation
        soap_body = f'''<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
    <soap:Header />
    <soap:Body>
        <nfeConsultaNF xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NfeConsulta2">
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
            'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NfeConsulta2/nfeConsultaNF'
        }
        
        response = requests.post(consultation_url, data=soap_body, headers=headers, timeout=15)
        if response.status_code == 200 and invoice_key in response.text:
            return response.text
    except Exception as e:
        print(f"SEFAZ consultation failed for {uf}: {e}")
    
    return None

def try_public_apis(invoice_key):
    """Try public NFe consultation APIs"""
    public_apis = [
        f"https://www.nfe.fazenda.gov.br/portal/consulta.aspx?tipoConsulta=completa&tipoConteudo=XML&chNFe={invoice_key}",
        f"https://www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx?chNFe={invoice_key}",
        f"https://sistemas.sefaz.am.gov.br/nfceweb/consultarNFCe.jsp?chNFe={invoice_key}"
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8'
    }
    
    for api_url in public_apis:
        try:
            response = requests.get(api_url, headers=headers, timeout=10)
            if response.status_code == 200:
                content = response.text
                # Look for XML content
                if '<?xml' in content and invoice_key in content:
                    # Try to extract just the XML part
                    xml_start = content.find('<?xml')
                    if xml_start != -1:
                        xml_end = content.find('</nfeProc>', xml_start)
                        if xml_end == -1:
                            xml_end = content.find('</NFe>', xml_start)
                        if xml_end != -1:
                            xml_content = content[xml_start:xml_end + 10]
                            if len(xml_content) > 500:
                                return xml_content
        except Exception as e:
            print(f"Public API {api_url} failed: {e}")
            continue
    
    return None

def try_qr_code_consultation(invoice_key):
    """Try to get NFe via QR code consultation"""
    try:
        # Generate QR code URL for NFe consultation
        uf = extract_uf_from_key(invoice_key)
        qr_base_urls = {
            'SP': 'https://www.fazenda.sp.gov.br/nfe/qrcode',
            'RJ': 'https://www.fazenda.rj.gov.br/nfe/qrcode',
            'MG': 'https://www.fazenda.mg.gov.br/nfe/qrcode'
        }
        
        base_url = qr_base_urls.get(uf)
        if base_url:
            qr_url = f"{base_url}?chNFe={invoice_key}&tpAmb=1"
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(qr_url, headers=headers, timeout=10)
            if response.status_code == 200 and '<?xml' in response.text:
                return response.text
    except Exception as e:
        print(f"QR code consultation failed: {e}")
    
    return None

def get_nfe_xml(invoice_key):
    """Main function to get NFe XML using multiple strategies"""
    # Validate key first
    is_valid, message = validate_nfe_key(invoice_key)
    if not is_valid:
        return {"success": False, "error": message}
    
    print(f"Buscando XML para chave: {invoice_key}")
    
    # Try different methods in order of reliability
    methods = [
        ("Consulta via APIs públicas", try_public_apis),
        ("Consulta via SEFAZ", try_sefaz_consultation),
        ("Consulta via QR Code", try_qr_code_consultation)
    ]
    
    for method_name, method_func in methods:
        try:
            print(f"Tentando: {method_name}")
            xml_content = method_func(invoice_key)
            
            if xml_content and invoice_key in xml_content:
                print(f"✅ XML obtido via {method_name}")
                return {
                    "success": True,
                    "xml_content": xml_content,
                    "message": f"XML obtido via {method_name}"
                }
        except Exception as e:
            print(f"Erro em {method_name}: {e}")
            continue
    
    # If all methods fail, return appropriate error
    return {
        "success": False,
        "error": f"Não foi possível obter o XML da chave {invoice_key}. Verifique se a chave está correta e se a nota fiscal foi emitida e autorizada pela SEFAZ."
    }

def main():
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave NFe obrigatória"}
    else:
        invoice_key = sys.argv[1].strip()
        result = get_nfe_xml(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()