#!/usr/bin/env python3
import sys
import json
import requests
import time
import re
from urllib.parse import quote, unquote
import base64

def simulate_browser_behavior(invoice_key):
    """
    Simula o comportamento real do navegador no meudanfe.com.br
    baseado nas imagens fornecidas pelo usuário
    """
    
    session = requests.Session()
    
    # Headers que simulam um navegador real
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Cache-Control': 'max-age=0'
    })
    
    try:
        print(f"Simulando navegador acessando meudanfe.com.br...")
        
        # Passo 1: Carrega a página principal como um navegador real faria
        main_page = session.get('https://meudanfe.com.br', timeout=20)
        if main_page.status_code != 200:
            return create_error_response(f"Erro ao carregar página principal: {main_page.status_code}")
        
        print("Página principal carregada")
        
        # Passo 2: Extrai possíveis cookies e tokens necessários
        cookies = session.cookies.get_dict()
        print(f"Cookies estabelecidos: {len(cookies)} cookies")
        
        # Passo 3: Simula digitação da chave no campo de entrada
        print(f"Simulando digitação da chave: {invoice_key}")
        
        # Baseado nas imagens, o site usa uma URL específica para consultas
        # Formato observado: meudanfe.com.br/ver-danfe
        consultation_url = f"https://meudanfe.com.br/ver-danfe"
        
        # Headers para a requisição de consulta
        session.headers.update({
            'Referer': 'https://meudanfe.com.br/',
            'Origin': 'https://meudanfe.com.br',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'same-origin'
        })
        
        # Passo 4: Faz a requisição de consulta (simulando clique no botão)
        consultation_response = session.get(
            f"{consultation_url}?chave={invoice_key}",
            timeout=25
        )
        
        if consultation_response.status_code == 200:
            print("Consulta executada com sucesso")
            
            # Verifica se a resposta contém dados da NFe
            response_text = consultation_response.text.lower()
            
            if invoice_key in consultation_response.text:
                print("NFe encontrada na resposta!")
                
                # Procura por indicadores de sucesso
                success_indicators = ['sucesso', 'encontrada', 'autorizada', 'válida', 'dados gerais']
                if any(indicator in response_text for indicator in success_indicators):
                    print("Dados da NFe disponíveis")
                    
                    # Passo 5: Procura pelo botão "Baixar XML"
                    if 'baixar xml' in response_text or 'download' in response_text:
                        print("Botão de download encontrado")
                        
                        # Extrai o link de download do XML
                        xml_download_url = extract_xml_download_url(consultation_response.text, invoice_key)
                        
                        if xml_download_url:
                            print(f"Baixando XML de: {xml_download_url}")
                            
                            # Headers para download do XML
                            session.headers.update({
                                'Accept': 'application/xml,text/xml,*/*',
                                'Referer': consultation_response.url
                            })
                            
                            xml_response = session.get(xml_download_url, timeout=20)
                            
                            if xml_response.status_code == 200:
                                xml_content = xml_response.text.strip()
                                
                                # Valida se é um XML válido
                                if xml_content.startswith('<?xml') and invoice_key in xml_content:
                                    print("XML baixado com sucesso!")
                                    return {
                                        "success": True,
                                        "xml_content": xml_content,
                                        "message": "XML baixado automaticamente do meudanfe.com.br"
                                    }
                    
                    # Se não conseguiu baixar, tenta extrair dados da página
                    extracted_data = extract_nfe_data_from_page(consultation_response.text, invoice_key)
                    if extracted_data:
                        return {
                            "success": True,
                            "xml_content": extracted_data,
                            "message": "Dados da NFe extraídos da página de consulta"
                        }
                    
                    # NFe encontrada mas XML não disponível
                    return {
                        "success": False,
                        "error": "NFe localizada mas XML não está disponível para download público",
                        "found_data": True,
                        "suggestions": [
                            "A NFe foi encontrada no sistema",
                            "XML pode estar restrito ou indisponível",
                            "Tente importação manual do arquivo XML",
                            "Verifique se possui acesso aos dados desta NFe"
                        ]
                    }
            
            # NFe não encontrada
            error_message = extract_error_from_page(consultation_response.text)
            return {
                "success": False,
                "error": error_message or "NFe não encontrada no sistema",
                "suggestions": [
                    "Verifique se a chave está correta (44 dígitos)",
                    "Confirme se a NFe foi autorizada",
                    "A NFe pode não estar disponível publicamente"
                ]
            }
        
        else:
            return create_error_response(f"Erro na consulta: {consultation_response.status_code}")
            
    except requests.exceptions.Timeout:
        return create_timeout_response()
        
    except Exception as e:
        return create_general_error_response(str(e))

def extract_xml_download_url(html_content, invoice_key):
    """Extrai URL de download do XML da página"""
    try:
        # Padrões para encontrar links de download
        download_patterns = [
            rf'href\s*=\s*["\']([^"\']*download[^"\']*xml[^"\']*{invoice_key}[^"\']*)["\']',
            rf'href\s*=\s*["\']([^"\']*xml[^"\']*{invoice_key}[^"\']*)["\']',
            rf'href\s*=\s*["\']([^"\']*{invoice_key}[^"\']*\.xml[^"\']*)["\']',
            rf'data-url\s*=\s*["\']([^"\']*xml[^"\']*)["\']',
            rf'onclick\s*=\s*["\'][^"\']*window\.open\(["\']([^"\']*xml[^"\']*)["\']',
        ]
        
        for pattern in download_patterns:
            matches = re.findall(pattern, html_content, re.IGNORECASE)
            for match in matches:
                if match:
                    url = match.strip()
                    if url.startswith('/'):
                        return f'https://meudanfe.com.br{url}'
                    elif url.startswith('http'):
                        return url
                    else:
                        return f'https://meudanfe.com.br/{url}'
        
        # Procura por padrões JavaScript específicos
        js_patterns = [
            rf'downloadXml\(["\']([^"\']*)["\']',
            rf'baixarXml\(["\']([^"\']*)["\']',
            rf'getXml\(["\']([^"\']*)["\']'
        ]
        
        for pattern in js_patterns:
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                url_part = match.group(1)
                if invoice_key in url_part or 'xml' in url_part.lower():
                    if url_part.startswith('/'):
                        return f'https://meudanfe.com.br{url_part}'
                    return f'https://meudanfe.com.br/xml/{url_part}'
    
    except Exception as e:
        print(f"Erro ao extrair URL de download: {e}")
    
    return None

def extract_nfe_data_from_page(html_content, invoice_key):
    """Extrai dados XML embutidos na página"""
    try:
        # Procura por XML completo na página
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
                if len(xml_content) > 2000:  # XML válido deve ter tamanho significativo
                    return xml_content
        
        # Procura por dados em JavaScript
        js_data_patterns = [
            rf'xmlData\s*=\s*[\'"]([^\'"]+)[\'"]',
            rf'nfeData\s*=\s*[\'"]([^\'"]+)[\'"]',
            rf'xmlContent\s*=\s*[\'"]([^\'"]+)[\'"]'
        ]
        
        for pattern in js_data_patterns:
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                data = match.group(1)
                if invoice_key in data and len(data) > 1000:
                    # Decodifica possíveis escapes
                    data = data.replace('\\n', '\n').replace('\\t', '\t').replace('\\"', '"')
                    if data.startswith('<?xml') or '<NFe' in data:
                        return data
    
    except Exception as e:
        print(f"Erro ao extrair dados da página: {e}")
    
    return None

def extract_error_from_page(html_content):
    """Extrai mensagem de erro da página"""
    try:
        error_patterns = [
            r'<div[^>]*class="[^"]*erro[^"]*"[^>]*>([^<]+)</div>',
            r'<span[^>]*class="[^"]*erro[^"]*"[^>]*>([^<]+)</span>',
            r'<p[^>]*class="[^"]*erro[^"]*"[^>]*>([^<]+)</p>',
            r'alert\([\'"]([^\'"]+ não [^\'"]*)[\'"]\)',
            r'Erro:\s*([^<\n]+)',
            r'não encontrada',
            r'inválida',
            r'não autorizada'
        ]
        
        for pattern in error_patterns:
            match = re.search(pattern, html_content, re.IGNORECASE)
            if match:
                if len(match.groups()) > 0:
                    return match.group(1).strip()
                else:
                    return match.group(0).strip()
    
    except Exception:
        pass
    
    return None

def create_error_response(message):
    """Cria resposta de erro padrão"""
    return {
        "success": False,
        "error": message,
        "suggestions": ["Tente novamente", "Verifique sua conexão", "Use importação manual"]
    }

def create_timeout_response():
    """Cria resposta para timeout"""
    return {
        "success": False,
        "error": "Timeout na consulta ao meudanfe.com.br",
        "suggestions": [
            "Site pode estar lento ou sobrecarregado",
            "Tente novamente em alguns minutos",
            "Use importação manual do XML"
        ]
    }

def create_general_error_response(error_msg):
    """Cria resposta para erro geral"""
    return {
        "success": False,
        "error": f"Erro durante automação: {error_msg}",
        "suggestions": [
            "Erro técnico na automação",
            "Tente importação manual",
            "Contate suporte se o problema persistir"
        ]
    }

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
            result = simulate_browser_behavior(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()