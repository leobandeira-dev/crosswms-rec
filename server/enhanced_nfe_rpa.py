#!/usr/bin/env python3
import sys
import json
import requests
import time
import re
from urllib.parse import quote, urlencode

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

def create_session():
    """Create session with proper headers"""
    session = requests.Session()
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    }
    
    session.headers.update(headers)
    return session

def try_multiple_nfe_sites(session, invoice_key):
    """Try multiple NFe consultation sites"""
    uf = get_uf_from_key(invoice_key)
    
    # Multiple NFe consultation sites
    nfe_sites = [
        f"https://www.nfe.fazenda.gov.br/portal/consulta.aspx?tipoConsulta=completa&tipoConteudo=XML&chNFe={invoice_key}",
        f"https://meudanfe.com.br/consulta/{invoice_key}",
        f"https://consultanfe.com/consulta/{invoice_key}",
        f"https://nfe.sefaz.rs.gov.br/site/consulta?chNFe={invoice_key}",
        f"https://www.fazenda.sp.gov.br/nfe/consultanfe.aspx?chave={invoice_key}",
        f"https://nfce.encat.org/consultarNFCe?chNFe={invoice_key}",
        f"https://www.fazenda.mg.gov.br/nfe/consulta?chave={invoice_key}"
    ]
    
    for site_url in nfe_sites:
        try:
            print(f"Tentando site: {site_url}")
            response = session.get(site_url, timeout=15)
            
            if response.status_code == 200:
                content = response.text
                
                # Check for XML content
                if invoice_key in content and '<?xml' in content:
                    xml_start = content.find('<?xml')
                    xml_end = content.find('</nfeProc>', xml_start)
                    if xml_end == -1:
                        xml_end = content.find('</NFe>', xml_start)
                    
                    if xml_end != -1:
                        xml_content = content[xml_start:xml_end + 10]
                        if len(xml_content) > 1000:
                            return {
                                "success": True,
                                "xml_content": xml_content,
                                "message": f"XML obtido de: {site_url}"
                            }
                
                # Look for download links
                download_patterns = [
                    r'href="([^"]*\.xml[^"]*)"',
                    r'href="([^"]*download[^"]*xml[^"]*)"'
                ]
                
                for pattern in download_patterns:
                    matches = re.findall(pattern, content, re.IGNORECASE)
                    for match in matches:
                        download_url = match
                        if not download_url.startswith('http'):
                            base_url = '/'.join(site_url.split('/')[:3])
                            download_url = base_url + ('/' if not download_url.startswith('/') else '') + download_url
                        
                        try:
                            download_response = session.get(download_url, timeout=10)
                            if download_response.status_code == 200 and invoice_key in download_response.text:
                                if '<?xml' in download_response.text:
                                    return {
                                        "success": True,
                                        "xml_content": download_response.text,
                                        "message": f"XML baixado de: {download_url}"
                                    }
                        except Exception:
                            continue
        
        except Exception as e:
            print(f"Erro no site {site_url}: {e}")
            continue
    
    return None

def try_api_endpoints(session, invoice_key):
    """Try various API endpoints"""
    api_endpoints = [
        f"https://api.nfe.fazenda.gov.br/v1/consulta/{invoice_key}",
        f"https://consulta-nfe.herokuapp.com/api/{invoice_key}",
        f"https://nfe-api.vercel.app/consulta/{invoice_key}",
        f"https://api-nfe.netlify.app/xml/{invoice_key}"
    ]
    
    for endpoint in api_endpoints:
        try:
            print(f"Tentando API: {endpoint}")
            response = session.get(endpoint, timeout=12)
            
            if response.status_code == 200:
                content = response.text
                
                # Check for XML in response
                if invoice_key in content and '<?xml' in content:
                    xml_start = content.find('<?xml')
                    xml_end = content.find('</nfeProc>', xml_start)
                    if xml_end == -1:
                        xml_end = content.find('</NFe>', xml_start)
                    
                    if xml_end != -1:
                        xml_content = content[xml_start:xml_end + 10]
                        if len(xml_content) > 1000:
                            return {
                                "success": True,
                                "xml_content": xml_content,
                                "message": f"XML obtido via API: {endpoint}"
                            }
                
                # Try JSON response
                try:
                    json_data = response.json()
                    if isinstance(json_data, dict):
                        for key in ['xml', 'xmlContent', 'nfe', 'data', 'content']:
                            if key in json_data and invoice_key in str(json_data[key]):
                                xml_content = json_data[key]
                                if isinstance(xml_content, str) and len(xml_content) > 1000:
                                    return {
                                        "success": True,
                                        "xml_content": xml_content,
                                        "message": f"XML obtido via JSON API: {endpoint}"
                                    }
                except Exception:
                    pass
        
        except Exception as e:
            print(f"Erro na API {endpoint}: {e}")
            continue
    
    return None

def try_form_submissions(session, invoice_key):
    """Try form submissions to various sites"""
    form_sites = [
        "https://meudanfe.com.br",
        "https://consultanfe.com",
        "https://nfe-consulta.com.br"
    ]
    
    for site in form_sites:
        try:
            print(f"Tentando formulário em: {site}")
            
            # Get the main page first
            response = session.get(site, timeout=10)
            if response.status_code != 200:
                continue
            
            # Try different form submission endpoints
            form_endpoints = [
                f"{site}/consulta",
                f"{site}/buscar",
                f"{site}/search",
                f"{site}/api/consulta"
            ]
            
            form_data = {
                'chave': invoice_key,
                'chave_nfe': invoice_key,
                'nota_fiscal': invoice_key,
                'search': invoice_key,
                'q': invoice_key
            }
            
            for endpoint in form_endpoints:
                try:
                    # Try POST
                    response = session.post(endpoint, data=form_data, timeout=10)
                    if response.status_code == 200 and invoice_key in response.text:
                        if '<?xml' in response.text:
                            xml_start = response.text.find('<?xml')
                            xml_end = response.text.find('</nfeProc>', xml_start)
                            if xml_end == -1:
                                xml_end = response.text.find('</NFe>', xml_start)
                            
                            if xml_end != -1:
                                xml_content = response.text[xml_start:xml_end + 10]
                                if len(xml_content) > 1000:
                                    return {
                                        "success": True,
                                        "xml_content": xml_content,
                                        "message": f"XML obtido via formulário: {endpoint}"
                                    }
                    
                    # Try GET with params
                    response = session.get(endpoint, params=form_data, timeout=10)
                    if response.status_code == 200 and invoice_key in response.text:
                        if '<?xml' in response.text:
                            xml_start = response.text.find('<?xml')
                            xml_end = response.text.find('</nfeProc>', xml_start)
                            if xml_end == -1:
                                xml_end = response.text.find('</NFe>', xml_start)
                            
                            if xml_end != -1:
                                xml_content = response.text[xml_start:xml_end + 10]
                                if len(xml_content) > 1000:
                                    return {
                                        "success": True,
                                        "xml_content": xml_content,
                                        "message": f"XML obtido via GET: {endpoint}"
                                    }
                
                except Exception:
                    continue
        
        except Exception as e:
            print(f"Erro no site {site}: {e}")
            continue
    
    return None

def enhanced_nfe_automation(invoice_key):
    """Enhanced NFe automation with multiple strategies"""
    
    # Validate key
    is_valid, message = validate_nfe_key(invoice_key)
    if not is_valid:
        return {"success": False, "error": message}
    
    print(f"Iniciando automação aprimorada para chave: {invoice_key}")
    
    # Create session
    session = create_session()
    
    # Try different strategies
    strategies = [
        ("Sites de consulta NFe", try_multiple_nfe_sites),
        ("APIs públicas", try_api_endpoints),
        ("Formulários de consulta", try_form_submissions)
    ]
    
    for strategy_name, strategy_func in strategies:
        try:
            print(f"Executando estratégia: {strategy_name}")
            result = strategy_func(session, invoice_key)
            
            if result and result.get("success"):
                print(f"✅ Sucesso com {strategy_name}")
                return result
        
        except Exception as e:
            print(f"Erro na estratégia {strategy_name}: {e}")
            continue
    
    # If all strategies fail, provide helpful message
    uf = get_uf_from_key(invoice_key)
    return {
        "success": False,
        "error": f"Não foi possível obter o XML da NFe {invoice_key}. A nota pode não estar disponível publicamente ou pode ser necessário acesso aos sistemas oficiais da SEFAZ-{uf} com certificado digital.",
        "suggestions": [
            "Verifique se a chave está correta",
            "Confirme se a NFe foi autorizada pela SEFAZ",
            "Tente novamente em alguns minutos",
            "Use a importação manual de XML se disponível"
        ]
    }

def main():
    """Entry point"""
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave NFe é obrigatória"}
    else:
        invoice_key = sys.argv[1].strip()
        result = enhanced_nfe_automation(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()