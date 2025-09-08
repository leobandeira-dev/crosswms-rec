#!/usr/bin/env python3
import sys
import json
import requests
import time
import re
from urllib.parse import quote, urlencode
from bs4 import BeautifulSoup

def validate_nfe_key(invoice_key):
    """Validate NFe key format"""
    if not invoice_key or len(invoice_key) != 44:
        return False, "Chave deve ter 44 dígitos"
    if not invoice_key.isdigit():
        return False, "Chave deve conter apenas números"
    return True, "Chave válida"

def create_session():
    """Create a requests session with proper headers"""
    session = requests.Session()
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
    }
    
    session.headers.update(headers)
    return session

def try_meudanfe_direct_access(session, invoice_key):
    """Try direct access to meudanfe.com.br"""
    try:
        print(f"Acessando meudanfe.com.br para chave: {invoice_key}")
        
        # First, get the main page to establish session
        main_url = "https://meudanfe.com.br"
        response = session.get(main_url, timeout=15)
        
        if response.status_code != 200:
            print(f"Erro ao acessar página principal: {response.status_code}")
            return None
        
        # Look for consultation form or direct consultation URL
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Try to find consultation forms or links
        consultation_forms = soup.find_all('form')
        consultation_links = soup.find_all('a', href=re.compile(r'consult|nfe|danfe', re.I))
        
        # Try direct consultation endpoints
        consultation_urls = [
            f"https://meudanfe.com.br/consulta/{invoice_key}",
            f"https://meudanfe.com.br/nfe/consulta?chave={invoice_key}",
            f"https://meudanfe.com.br/danfe/{invoice_key}",
            f"https://meudanfe.com.br/api/consulta/{invoice_key}",
            f"https://meudanfe.com.br/busca?q={invoice_key}"
        ]
        
        for url in consultation_urls:
            try:
                print(f"Tentando URL: {url}")
                response = session.get(url, timeout=12)
                
                if response.status_code == 200:
                    content = response.text
                    
                    # Check for XML content in response
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
                                    "message": f"XML obtido via {url}"
                                }
                    
                    # Check for download links
                    soup = BeautifulSoup(content, 'html.parser')
                    download_links = soup.find_all('a', href=re.compile(r'\.xml|download', re.I))
                    
                    for link in download_links:
                        href = link.get('href')
                        if href:
                            # Make absolute URL if relative
                            if href.startswith('/'):
                                href = "https://meudanfe.com.br" + href
                            elif not href.startswith('http'):
                                href = "https://meudanfe.com.br/" + href
                            
                            try:
                                download_response = session.get(href, timeout=10)
                                if download_response.status_code == 200 and invoice_key in download_response.text:
                                    if '<?xml' in download_response.text:
                                        return {
                                            "success": True,
                                            "xml_content": download_response.text,
                                            "message": f"XML baixado via {href}"
                                        }
                            except:
                                continue
                
            except Exception as e:
                print(f"Erro na URL {url}: {e}")
                continue
        
        return None
        
    except Exception as e:
        print(f"Erro no acesso direto meudanfe: {e}")
        return None

def try_meudanfe_form_submission(session, invoice_key):
    """Try submitting consultation form on meudanfe.com.br"""
    try:
        # Get main page to find forms
        main_url = "https://meudanfe.com.br"
        response = session.get(main_url, timeout=15)
        
        if response.status_code != 200:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Look for forms that might be consultation forms
        forms = soup.find_all('form')
        
        for form in forms:
            form_action = form.get('action', '')
            form_method = form.get('method', 'get').lower()
            
            # Look for input fields in the form
            inputs = form.find_all('input')
            text_inputs = [inp for inp in inputs if inp.get('type') in ['text', 'search', None]]
            
            if text_inputs:
                # Try to submit the form with our invoice key
                form_data = {}
                
                for inp in inputs:
                    name = inp.get('name')
                    input_type = inp.get('type', 'text')
                    value = inp.get('value', '')
                    
                    if name:
                        if input_type in ['text', 'search'] and not value:
                            form_data[name] = invoice_key
                        elif input_type == 'hidden':
                            form_data[name] = value
                        elif input_type == 'submit':
                            if not value:
                                form_data[name] = 'Consultar'
                
                # Add common field names if not found
                if not any(key.lower() in ['chave', 'nfe', 'nota', 'consulta'] for key in form_data.keys()):
                    form_data['chave'] = invoice_key
                    form_data['nfe'] = invoice_key
                
                # Submit form
                try:
                    if form_action:
                        if form_action.startswith('/'):
                            submit_url = "https://meudanfe.com.br" + form_action
                        elif form_action.startswith('http'):
                            submit_url = form_action
                        else:
                            submit_url = "https://meudanfe.com.br/" + form_action
                    else:
                        submit_url = main_url
                    
                    if form_method == 'post':
                        response = session.post(submit_url, data=form_data, timeout=15)
                    else:
                        response = session.get(submit_url, params=form_data, timeout=15)
                    
                    if response.status_code == 200:
                        content = response.text
                        
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
                                        "message": "XML obtido via formulário meudanfe.com.br"
                                    }
                
                except Exception as e:
                    print(f"Erro ao submeter formulário: {e}")
                    continue
        
        return None
        
    except Exception as e:
        print(f"Erro na submissão de formulário: {e}")
        return None

def try_meudanfe_api_endpoints(session, invoice_key):
    """Try various API endpoints on meudanfe.com.br"""
    api_endpoints = [
        f"https://meudanfe.com.br/api/v1/nfe/{invoice_key}",
        f"https://meudanfe.com.br/api/consulta/{invoice_key}",
        f"https://meudanfe.com.br/rest/nfe/{invoice_key}",
        f"https://meudanfe.com.br/services/consulta?chave={invoice_key}",
        f"https://meudanfe.com.br/xml/{invoice_key}",
        f"https://meudanfe.com.br/download/{invoice_key}.xml"
    ]
    
    for endpoint in api_endpoints:
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
                                "message": f"XML obtido via API: {endpoint}"
                            }
                
                # Check for JSON response with XML
                try:
                    json_data = response.json()
                    if isinstance(json_data, dict):
                        for key in ['xml', 'xmlContent', 'nfe', 'data', 'content']:
                            if key in json_data and invoice_key in str(json_data[key]):
                                return {
                                    "success": True,
                                    "xml_content": json_data[key],
                                    "message": f"XML obtido via JSON API: {endpoint}"
                                }
                except:
                    pass
        
        except Exception as e:
            print(f"Erro no endpoint {endpoint}: {e}")
            continue
    
    return None

def get_xml_from_meudanfe_http(invoice_key):
    """Main function to get XML from meudanfe.com.br using HTTP methods"""
    
    # Validate invoice key
    is_valid, message = validate_nfe_key(invoice_key)
    if not is_valid:
        return {"success": False, "error": message}
    
    print(f"Iniciando automação HTTP para meudanfe.com.br: {invoice_key}")
    
    # Create session
    session = create_session()
    
    methods = [
        ("Acesso direto", try_meudanfe_direct_access),
        ("Endpoints API", try_meudanfe_api_endpoints),
        ("Formulários", try_meudanfe_form_submission)
    ]
    
    for method_name, method_func in methods:
        try:
            print(f"Tentando: {method_name}")
            result = method_func(session, invoice_key)
            
            if result and result.get("success"):
                print(f"✅ Sucesso via {method_name}")
                return result
        
        except Exception as e:
            print(f"Erro em {method_name}: {e}")
            continue
    
    return {
        "success": False,
        "error": f"Não foi possível obter o XML da chave {invoice_key} através do site meudanfe.com.br. Verifique se a chave está correta e se o site está acessível."
    }

def main():
    """Main entry point"""
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave NFe é obrigatória"}
    else:
        invoice_key = sys.argv[1].strip()
        result = get_xml_from_meudanfe_http(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()