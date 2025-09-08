#!/usr/bin/env python3
import sys
import json
import requests
import time
import re
from urllib.parse import quote

def execute_meudanfe_javascript_flow(invoice_key):
    """
    Executa consulta no meudanfe.com.br simulando as requisições JavaScript
    baseado no fluxo real observado nas imagens do usuário
    """
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Content-Type': 'application/json',
        'Origin': 'https://meudanfe.com.br',
        'Referer': 'https://meudanfe.com.br/'
    })
    
    try:
        print(f"Iniciando consulta JavaScript para chave: {invoice_key}")
        
        # Passo 1: Acessa página principal para estabelecer sessão
        main_response = session.get('https://meudanfe.com.br', timeout=15)
        if main_response.status_code != 200:
            return {"success": False, "error": f"Erro ao acessar site principal: {main_response.status_code}"}
        
        print("Sessão estabelecida com sucesso")
        
        # Passo 2: Tenta diferentes endpoints de consulta baseados no padrão observado
        consultation_endpoints = [
            '/api/consulta',
            '/consulta/nfe',
            '/ver-danfe',
            '/nfe/consulta',
            '/api/nfe/consulta'
        ]
        
        for endpoint in consultation_endpoints:
            try:
                print(f"Tentando endpoint: {endpoint}")
                
                # Dados da requisição JavaScript
                payload = {
                    'chave': invoice_key,
                    'chaveNFe': invoice_key,
                    'tipo': 'xml'
                }
                
                # Requisição POST simulando JavaScript
                response = session.post(
                    f'https://meudanfe.com.br{endpoint}',
                    json=payload,
                    timeout=20
                )
                
                if response.status_code == 200:
                    result = response.json() if response.headers.get('content-type', '').startswith('application/json') else None
                    
                    if result and result.get('success'):
                        print("Consulta bem-sucedida!")
                        
                        # Se retornou XML diretamente
                        if result.get('xml_content'):
                            return {
                                "success": True,
                                "xml_content": result['xml_content'],
                                "message": "XML obtido via API JavaScript do meudanfe.com.br"
                            }
                        
                        # Se retornou URL de download
                        if result.get('download_url'):
                            xml_response = session.get(result['download_url'], timeout=15)
                            if xml_response.status_code == 200 and xml_response.text.startswith('<?xml'):
                                return {
                                    "success": True,
                                    "xml_content": xml_response.text,
                                    "message": "XML baixado via URL do meudanfe.com.br"
                                }
                    
                    # Verifica se a resposta HTML contém dados da NFe
                    if response.text and invoice_key in response.text:
                        if 'Sucesso' in response.text or 'sucesso' in response.text:
                            print("NFe encontrada na resposta HTML")
                            
                            # Procura por XML na resposta
                            xml_content = extract_xml_from_response(response.text, invoice_key)
                            if xml_content:
                                return {
                                    "success": True,
                                    "xml_content": xml_content,
                                    "message": "XML extraído da resposta HTML"
                                }
                            
                            # Se não encontrou XML mas encontrou a NFe, tenta buscar link de download
                            download_link = extract_download_link(response.text, invoice_key)
                            if download_link:
                                xml_response = session.get(download_link, timeout=15)
                                if xml_response.status_code == 200 and xml_response.text.startswith('<?xml'):
                                    return {
                                        "success": True,
                                        "xml_content": xml_response.text,
                                        "message": "XML baixado via link extraído"
                                    }
                
            except Exception as e:
                print(f"Erro no endpoint {endpoint}: {e}")
                continue
        
        # Passo 3: Tenta consulta direta por GET (como navegador faria)
        print("Tentando consulta direta por GET...")
        
        get_urls = [
            f'https://meudanfe.com.br/consulta?chave={invoice_key}',
            f'https://meudanfe.com.br/ver-danfe?chave={invoice_key}',
            f'https://meudanfe.com.br/nfe/{invoice_key}',
            f'https://meudanfe.com.br/xml/{invoice_key}'
        ]
        
        for url in get_urls:
            try:
                print(f"Tentando URL direta: {url}")
                response = session.get(url, timeout=15)
                
                if response.status_code == 200 and invoice_key in response.text:
                    if 'Sucesso' in response.text or 'xml' in response.text.lower():
                        xml_content = extract_xml_from_response(response.text, invoice_key)
                        if xml_content:
                            return {
                                "success": True,
                                "xml_content": xml_content,
                                "message": "XML obtido via consulta direta"
                            }
                        
                        # Se é uma página de download direto
                        if response.text.startswith('<?xml'):
                            return {
                                "success": True,
                                "xml_content": response.text,
                                "message": "XML baixado diretamente"
                            }
                
            except Exception as e:
                print(f"Erro na URL {url}: {e}")
                continue
        
        # Se chegou aqui, não conseguiu obter o XML
        return {
            "success": False,
            "error": "NFe não encontrada ou XML não disponível",
            "suggestions": [
                "Verifique se a chave NFe está correta (44 dígitos)",
                "Confirme se a NFe foi autorizada pela SEFAZ",
                "A NFe pode não estar disponível para consulta pública",
                "Tente fazer upload manual do arquivo XML"
            ]
        }
        
    except Exception as e:
        print(f"Erro geral: {e}")
        return {
            "success": False,
            "error": f"Erro durante consulta: {str(e)}",
            "suggestions": [
                "Erro de conexão com o site",
                "Tente novamente em alguns minutos",
                "Use importação manual do XML"
            ]
        }

def extract_xml_from_response(html_content, invoice_key):
    """Extrai XML da resposta HTML"""
    try:
        # Padrões para encontrar XML
        xml_patterns = [
            r'<\?xml[^>]*>.*?</nfeProc>',
            r'<\?xml[^>]*>.*?</NFe>',
            r'<nfeProc[^>]*>.*?</nfeProc>',
            r'<NFe[^>]*>.*?</NFe>'
        ]
        
        for pattern in xml_patterns:
            match = re.search(pattern, html_content, re.DOTALL | re.IGNORECASE)
            if match and invoice_key in match.group(0):
                xml_content = match.group(0)
                if len(xml_content) > 1000:  # XML válido deve ter tamanho mínimo
                    return xml_content
        
        # Procura por XML em elementos JavaScript ou dados JSON
        js_patterns = [
            rf'xmlContent["\']?\s*[:=]\s*["\']([^"\']+)["\']',
            rf'xml_data["\']?\s*[:=]\s*["\']([^"\']+)["\']',
            rf'"xml"\s*:\s*"([^"]+)"'
        ]
        
        for pattern in js_patterns:
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                xml_candidate = match.group(1)
                if invoice_key in xml_candidate and len(xml_candidate) > 500:
                    # Decodifica possíveis escapes
                    xml_candidate = xml_candidate.replace('\\n', '\n').replace('\\t', '\t').replace('\\"', '"')
                    if xml_candidate.startswith('<?xml') or xml_candidate.startswith('<nfeProc') or xml_candidate.startswith('<NFe'):
                        return xml_candidate
    
    except Exception as e:
        print(f"Erro ao extrair XML: {e}")
    
    return None

def extract_download_link(html_content, invoice_key):
    """Extrai link de download da resposta"""
    try:
        # Padrões para links de download
        link_patterns = [
            rf'href\s*=\s*["\']([^"\']*download[^"\']*{invoice_key}[^"\']*)["\']',
            rf'href\s*=\s*["\']([^"\']*xml[^"\']*{invoice_key}[^"\']*)["\']',
            rf'href\s*=\s*["\']([^"\']*{invoice_key}[^"\']*\.xml[^"\']*)["\']'
        ]
        
        for pattern in link_patterns:
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                link = match.group(1)
                if link.startswith('/'):
                    return f'https://meudanfe.com.br{link}'
                elif link.startswith('http'):
                    return link
                else:
                    return f'https://meudanfe.com.br/{link}'
    
    except Exception as e:
        print(f"Erro ao extrair link: {e}")
    
    return None

def validate_nfe_key(invoice_key):
    """Valida formato da chave NFe"""
    if not invoice_key or len(invoice_key) != 44:
        return False, "Chave NFe deve ter exatamente 44 dígitos"
    
    if not invoice_key.isdigit():
        return False, "Chave NFe deve conter apenas números"
    
    return True, "Chave válida"

def main():
    """Ponto de entrada"""
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave NFe é obrigatória"}
    else:
        invoice_key = sys.argv[1].strip()
        
        # Valida a chave
        is_valid, message = validate_nfe_key(invoice_key)
        if not is_valid:
            result = {"success": False, "error": message}
        else:
            result = execute_meudanfe_javascript_flow(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()