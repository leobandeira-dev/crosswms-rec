#!/usr/bin/env python3
import sys
import json
import requests
import time
import re
from urllib.parse import urlencode, quote
from bs4 import BeautifulSoup

def simulate_exact_meudanfe_flow(invoice_key):
    """
    Simula exatamente o fluxo manual do usuário no meudanfe.com.br:
    1. Acessa site principal
    2. Preenche chave no campo de busca
    3. Clica 'Buscar DANFE/XML'
    4. Aguarda página de resultados
    5. Clica 'Baixar XML'
    6. Captura conteúdo XML
    """
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0'
    })
    
    try:
        print(f"Passo 1: Acessando meudanfe.com.br...")
        
        # Passo 1: Acessa a página principal
        main_page = session.get('https://meudanfe.com.br', timeout=15)
        if main_page.status_code != 200:
            return {"success": False, "error": f"Erro ao acessar site principal: {main_page.status_code}"}
        
        print(f"Site principal acessado com sucesso")
        
        # Passo 2: Simula preenchimento do campo e clique no botão
        print(f"Passo 2: Preenchendo chave {invoice_key} e clicando 'Buscar DANFE/XML'...")
        
        # Monta a URL de busca como o site faria
        search_url = f"https://meudanfe.com.br/consulta"
        
        # Dados do formulário simulando o preenchimento manual
        form_data = {
            'chave': invoice_key,
            'chaveNFe': invoice_key,
            'consulta': 'danfe'
        }
        
        # Headers específicos para a requisição de busca
        session.headers.update({
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': 'https://meudanfe.com.br',
            'Referer': 'https://meudanfe.com.br'
        })
        
        # Passo 3: Submete a busca (simulando clique no botão)
        search_response = session.post(search_url, data=form_data, timeout=20)
        
        if search_response.status_code == 200:
            print("Busca executada com sucesso, processando resultados...")
            
            # Verifica se a resposta contém dados da NFe
            if invoice_key in search_response.text and ('Sucesso' in search_response.text or 'sucesso' in search_response.text):
                print("NFe encontrada! Dados disponíveis na página")
                
                # Passo 4: Procura pelo botão "Baixar XML" na resposta
                if 'Baixar XML' in search_response.text or 'baixar-xml' in search_response.text:
                    print("Botão 'Baixar XML' encontrado, simulando clique...")
                    
                    # Passo 5: Simula clique no botão "Baixar XML"
                    xml_download_url = extract_xml_download_link(search_response.text, invoice_key)
                    
                    if xml_download_url:
                        xml_response = session.get(xml_download_url, timeout=15)
                        
                        if xml_response.status_code == 200 and xml_response.text.strip().startswith('<?xml'):
                            print("XML baixado com sucesso!")
                            return {
                                "success": True,
                                "xml_content": xml_response.text,
                                "message": "XML obtido via automação do fluxo exato do meudanfe.com.br"
                            }
                    
                    # Alternativa: tenta extrair XML diretamente da página de resultados
                    xml_from_page = extract_xml_from_results_page(search_response.text, invoice_key)
                    if xml_from_page:
                        print("XML extraído da página de resultados!")
                        return {
                            "success": True,
                            "xml_content": xml_from_page,
                            "message": "XML extraído da página de resultados do meudanfe.com.br"
                        }
                
                # Se chegou aqui, a NFe foi encontrada mas não conseguiu baixar o XML
                return {
                    "success": False,
                    "error": "NFe encontrada mas XML não disponível para download",
                    "found_data": True,
                    "suggestions": [
                        "A NFe foi localizada no sistema",
                        "Botão de download pode estar temporariamente indisponível",
                        "Tente novamente em alguns minutos",
                        "Use importação manual se tiver o arquivo XML"
                    ]
                }
            
            else:
                # Verifica se há alguma mensagem de erro específica
                error_msg = extract_error_message(search_response.text)
                return {
                    "success": False,
                    "error": error_msg or "NFe não encontrada no sistema",
                    "suggestions": [
                        "Verifique se a chave NFe está correta",
                        "Confirme se a NFe foi emitida e autorizada",
                        "A NFe pode não estar disponível publicamente",
                        "Tente importação manual do XML"
                    ]
                }
        else:
            return {
                "success": False,
                "error": f"Erro na busca: status {search_response.status_code}",
                "suggestions": [
                    "Site pode estar temporariamente indisponível",
                    "Tente novamente em alguns minutos"
                ]
            }
    
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "error": "Timeout durante consulta ao meudanfe.com.br",
            "suggestions": [
                "Conexão lenta ou site sobrecarregado",
                "Tente novamente em alguns minutos"
            ]
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": f"Erro durante automação: {str(e)}",
            "suggestions": [
                "Erro técnico na automação",
                "Tente importação manual do XML"
            ]
        }

def extract_xml_download_link(html_content, invoice_key):
    """Extrai o link de download do XML da página de resultados"""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Procura por links que contenham "xml" e a chave da NFe
        xml_links = soup.find_all('a', href=True)
        
        for link in xml_links:
            href = link.get('href', '')
            text = link.get_text().lower()
            
            if ('xml' in href.lower() or 'xml' in text) and invoice_key in href:
                if href.startswith('http'):
                    return href
                elif href.startswith('/'):
                    return f'https://meudanfe.com.br{href}'
                else:
                    return f'https://meudanfe.com.br/{href}'
        
        # Procura por padrões específicos do meudanfe
        patterns = [
            rf'/download/xml/{invoice_key}',
            rf'/xml/{invoice_key}',
            rf'/ver-danfe\?.*{invoice_key}.*xml',
            rf'/api/xml/{invoice_key}'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, html_content)
            if match:
                found_url = match.group(0)
                if found_url.startswith('/'):
                    return f'https://meudanfe.com.br{found_url}'
                return found_url
    
    except Exception as e:
        print(f"Erro ao extrair link de download: {e}")
    
    return None

def extract_xml_from_results_page(html_content, invoice_key):
    """Extrai XML diretamente da página de resultados se estiver embutido"""
    try:
        # Procura por XML embutido na página
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
        
        # Procura por XML em elementos JavaScript ou hidden
        script_patterns = [
            rf'xmlContent\s*=\s*[\'"]([^\'"]{{500,}})[\'"]',
            rf'xml_data\s*=\s*[\'"]([^\'"]{{500,}})[\'"]',
            rf'<input[^>]*value\s*=\s*[\'"](<\?xml[^\'"]{{500,}})[\'"]'
        ]
        
        for pattern in script_patterns:
            match = re.search(pattern, html_content, re.DOTALL | re.IGNORECASE)
            if match and invoice_key in match.group(1):
                return match.group(1)
    
    except Exception as e:
        print(f"Erro ao extrair XML da página: {e}")
    
    return None

def extract_error_message(html_content):
    """Extrai mensagem de erro específica da página"""
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Procura por elementos comuns de erro
        error_selectors = [
            '.alert-danger',
            '.error',
            '.erro',
            '[class*="error"]',
            '[class*="erro"]'
        ]
        
        for selector in error_selectors:
            error_elem = soup.select_one(selector)
            if error_elem:
                error_text = error_elem.get_text().strip()
                if error_text and len(error_text) > 5:
                    return error_text
        
        # Procura por texto de erro comum
        if 'não encontrada' in html_content.lower():
            return "NFe não encontrada no sistema"
        elif 'inválida' in html_content.lower():
            return "Chave NFe inválida"
        elif 'indisponível' in html_content.lower():
            return "Serviço temporariamente indisponível"
    
    except Exception:
        pass
    
    return None

def validate_nfe_key(invoice_key):
    """Valida formato da chave NFe"""
    if not invoice_key or len(invoice_key) != 44:
        return False, "Chave NFe deve ter exatamente 44 dígitos"
    
    if not invoice_key.isdigit():
        return False, "Chave NFe deve conter apenas números"
    
    return True, "Chave válida"

def execute_meudanfe_exact_flow(invoice_key):
    """Função principal que executa o fluxo exato"""
    
    # Valida a chave
    is_valid, message = validate_nfe_key(invoice_key)
    if not is_valid:
        return {"success": False, "error": message}
    
    print(f"Iniciando automação do fluxo exato meudanfe.com.br para: {invoice_key}")
    print("Simulando exatamente os passos manuais do usuário...")
    
    return simulate_exact_meudanfe_flow(invoice_key)

def main():
    """Ponto de entrada"""
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave NFe é obrigatória"}
    else:
        invoice_key = sys.argv[1].strip()
        result = execute_meudanfe_exact_flow(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()