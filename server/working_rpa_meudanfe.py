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

def create_session_with_headers():
    """Create session with browser-like headers"""
    session = requests.Session()
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
    }
    
    session.headers.update(headers)
    return session

def simulate_meudanfe_rpa(session, invoice_key):
    """Simulate RPA process for meudanfe.com.br"""
    try:
        print(f"Simulando RPA para meudanfe.com.br com chave: {invoice_key}")
        
        # Step 1: Access main page
        main_url = "https://meudanfe.com.br"
        response = session.get(main_url, timeout=15)
        
        if response.status_code != 200:
            return {"success": False, "error": f"Erro ao acessar {main_url}: {response.status_code}"}
        
        print("Página principal acessada com sucesso")
        
        # Step 2: Try different consultation endpoints
        consultation_endpoints = [
            f"{main_url}/consulta/{invoice_key}",
            f"{main_url}/nfe/consulta?chave={invoice_key}",
            f"{main_url}/api/consulta/{invoice_key}",
            f"{main_url}/buscar?q={invoice_key}",
            f"{main_url}/xml/{invoice_key}",
            f"{main_url}/danfe/{invoice_key}"
        ]
        
        for endpoint in consultation_endpoints:
            try:
                print(f"Tentando endpoint: {endpoint}")
                response = session.get(endpoint, timeout=12)
                
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
                                    "message": f"XML obtido via RPA do endpoint: {endpoint}"
                                }
                    
                    # Check for download links
                    download_patterns = [
                        r'href="([^"]*\.xml[^"]*)"',
                        r'href="([^"]*download[^"]*)"',
                        r'href="([^"]*xml[^"]*)"'
                    ]
                    
                    for pattern in download_patterns:
                        matches = re.findall(pattern, content, re.IGNORECASE)
                        for match in matches:
                            download_url = match
                            if not download_url.startswith('http'):
                                download_url = main_url + ('/' if not download_url.startswith('/') else '') + download_url
                            
                            try:
                                download_response = session.get(download_url, timeout=10)
                                if download_response.status_code == 200 and invoice_key in download_response.text:
                                    if '<?xml' in download_response.text:
                                        return {
                                            "success": True,
                                            "xml_content": download_response.text,
                                            "message": f"XML baixado via RPA: {download_url}"
                                        }
                            except Exception:
                                continue
                
            except Exception as e:
                print(f"Erro no endpoint {endpoint}: {e}")
                continue
        
        # Step 3: Try form submission simulation
        form_data = {
            'chave': invoice_key,
            'chave_nfe': invoice_key,
            'nota_fiscal': invoice_key,
            'consulta': invoice_key,
            'search': invoice_key,
            'q': invoice_key
        }
        
        form_endpoints = [
            f"{main_url}/consulta",
            f"{main_url}/buscar",
            f"{main_url}/search",
            f"{main_url}/api/search"
        ]
        
        for endpoint in form_endpoints:
            try:
                print(f"Tentando formulário: {endpoint}")
                
                # Try POST
                response = session.post(endpoint, data=form_data, timeout=12)
                if response.status_code == 200 and invoice_key in response.text and '<?xml' in response.text:
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
                response = session.get(endpoint, params=form_data, timeout=12)
                if response.status_code == 200 and invoice_key in response.text and '<?xml' in response.text:
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
                
            except Exception as e:
                print(f"Erro no formulário {endpoint}: {e}")
                continue
        
        return {"success": False, "error": "XML não encontrado através da automação RPA"}
        
    except Exception as e:
        print(f"Erro geral na automação: {e}")
        return {"success": False, "error": f"Erro na automação RPA: {str(e)}"}

def execute_rpa_workflow(invoice_key):
    """Main RPA workflow execution"""
    
    # Validate invoice key
    is_valid, message = validate_nfe_key(invoice_key)
    if not is_valid:
        return {"success": False, "error": message}
    
    print(f"Iniciando workflow RPA para chave: {invoice_key}")
    
    # Create session
    session = create_session_with_headers()
    
    # Execute RPA simulation
    result = simulate_meudanfe_rpa(session, invoice_key)
    
    return result

def main():
    """Entry point for RPA script"""
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave NFe é obrigatória"}
    else:
        invoice_key = sys.argv[1].strip()
        result = execute_rpa_workflow(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()