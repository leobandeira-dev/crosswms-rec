#!/usr/bin/env python3
import sys
import json
import requests
import time
import re
from urllib.parse import quote, urlencode
from bs4 import BeautifulSoup
import base64

class MeuDanfeRPA:
    def __init__(self):
        self.session = requests.Session()
        self.base_url = "https://meudanfe.com.br"
        self.setup_session()
    
    def setup_session(self):
        """Configura sessão simulando navegador real"""
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1'
        })
    
    def execute_consultation(self, invoice_key):
        """Executa consulta usando múltiplas estratégias"""
        
        # Estratégia 1: Consulta direta via URL GET
        result = self.strategy_direct_url(invoice_key)
        if result.get('success'):
            return result
        
        # Estratégia 2: Simulação de POST com formulário
        result = self.strategy_form_post(invoice_key)
        if result.get('success'):
            return result
        
        # Estratégia 3: Requisições AJAX/JSON
        result = self.strategy_ajax_request(invoice_key)
        if result.get('success'):
            return result
        
        # Estratégia 4: Análise de JavaScript e endpoints dinâmicos
        result = self.strategy_javascript_analysis(invoice_key)
        if result.get('success'):
            return result
        
        # Se todas falharam, retorna resposta informativa
        return {
            "success": False,
            "error": "NFe não encontrada ou não disponível publicamente",
            "strategies_attempted": 4,
            "suggestions": [
                "Verifique se a chave NFe está correta",
                "Confirme se a NFe foi autorizada pela SEFAZ",
                "A NFe pode estar restrita ou indisponível",
                "Use importação manual do arquivo XML"
            ]
        }
    
    def strategy_direct_url(self, invoice_key):
        """Estratégia 1: Consulta direta via URL"""
        try:
            print("Estratégia 1: Consulta direta via URL")
            
            # URLs baseadas na análise das imagens do usuário
            urls_to_try = [
                f"{self.base_url}/ver-danfe?chave={invoice_key}",
                f"{self.base_url}/consulta?chNFe={invoice_key}",
                f"{self.base_url}/nfe?key={invoice_key}",
                f"{self.base_url}/danfe/{invoice_key}",
                f"{self.base_url}/xml/{invoice_key}"
            ]
            
            for url in urls_to_try:
                print(f"Tentando: {url}")
                
                response = self.session.get(url, timeout=20)
                
                if response.status_code == 200:
                    # Verifica se encontrou a NFe
                    if self.is_nfe_found(response.text, invoice_key):
                        print("NFe encontrada!")
                        
                        # Tenta extrair XML
                        xml_content = self.extract_xml_content(response.text, invoice_key)
                        if xml_content:
                            return {
                                "success": True,
                                "xml_content": xml_content,
                                "message": "XML obtido via consulta direta"
                            }
                        
                        # Tenta encontrar link de download
                        download_url = self.find_download_link(response.text, response.url)
                        if download_url:
                            xml_content = self.download_xml(download_url)
                            if xml_content:
                                return {
                                    "success": True,
                                    "xml_content": xml_content,
                                    "message": "XML baixado via link encontrado"
                                }
        
        except Exception as e:
            print(f"Erro na estratégia 1: {e}")
        
        return {"success": False}
    
    def strategy_form_post(self, invoice_key):
        """Estratégia 2: Simulação de POST com formulário"""
        try:
            print("Estratégia 2: Simulação de formulário POST")
            
            # Primeiro carrega a página principal
            main_page = self.session.get(self.base_url, timeout=15)
            if main_page.status_code != 200:
                return {"success": False}
            
            # Extrai possíveis tokens CSRF ou viewstate
            csrf_token = self.extract_csrf_token(main_page.text)
            
            # Dados do formulário
            form_data = {
                'chave': invoice_key,
                'chaveNFe': invoice_key,
                'chNFe': invoice_key,
                'consulta': 'xml',
                'tipo': 'danfe'
            }
            
            if csrf_token:
                form_data['_token'] = csrf_token
                form_data['csrf_token'] = csrf_token
            
            # Headers para POST
            self.session.headers.update({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': self.base_url,
                'Referer': self.base_url
            })
            
            # Endpoints para tentar POST
            post_endpoints = [
                '/consulta',
                '/buscar',
                '/ver-danfe',
                '/search',
                '/nfe/consulta'
            ]
            
            for endpoint in post_endpoints:
                print(f"POST para: {endpoint}")
                
                response = self.session.post(
                    f"{self.base_url}{endpoint}",
                    data=form_data,
                    timeout=20
                )
                
                if response.status_code == 200:
                    if self.is_nfe_found(response.text, invoice_key):
                        xml_content = self.extract_xml_content(response.text, invoice_key)
                        if xml_content:
                            return {
                                "success": True,
                                "xml_content": xml_content,
                                "message": "XML obtido via formulário POST"
                            }
        
        except Exception as e:
            print(f"Erro na estratégia 2: {e}")
        
        return {"success": False}
    
    def strategy_ajax_request(self, invoice_key):
        """Estratégia 3: Requisições AJAX/JSON"""
        try:
            print("Estratégia 3: Requisições AJAX/JSON")
            
            # Headers para AJAX
            self.session.headers.update({
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'Origin': self.base_url,
                'Referer': self.base_url
            })
            
            # Payload JSON
            json_payload = {
                'chave': invoice_key,
                'action': 'consultar',
                'tipo': 'xml'
            }
            
            # Endpoints AJAX para tentar
            ajax_endpoints = [
                '/api/consulta',
                '/ajax/nfe',
                '/api/nfe/consulta',
                '/consulta/ajax',
                '/buscar/ajax'
            ]
            
            for endpoint in ajax_endpoints:
                print(f"AJAX para: {endpoint}")
                
                response = self.session.post(
                    f"{self.base_url}{endpoint}",
                    json=json_payload,
                    timeout=20
                )
                
                if response.status_code == 200:
                    try:
                        json_response = response.json()
                        
                        if json_response.get('success') and json_response.get('xml'):
                            return {
                                "success": True,
                                "xml_content": json_response['xml'],
                                "message": "XML obtido via requisição AJAX"
                            }
                        
                        if json_response.get('download_url'):
                            xml_content = self.download_xml(json_response['download_url'])
                            if xml_content:
                                return {
                                    "success": True,
                                    "xml_content": xml_content,
                                    "message": "XML baixado via URL AJAX"
                                }
                    
                    except:
                        # Resposta não é JSON válido, mas pode conter dados úteis
                        if self.is_nfe_found(response.text, invoice_key):
                            xml_content = self.extract_xml_content(response.text, invoice_key)
                            if xml_content:
                                return {
                                    "success": True,
                                    "xml_content": xml_content,
                                    "message": "XML extraído de resposta AJAX"
                                }
        
        except Exception as e:
            print(f"Erro na estratégia 3: {e}")
        
        return {"success": False}
    
    def strategy_javascript_analysis(self, invoice_key):
        """Estratégia 4: Análise de JavaScript e endpoints dinâmicos"""
        try:
            print("Estratégia 4: Análise de JavaScript")
            
            # Carrega página principal para analisar JavaScript
            main_page = self.session.get(self.base_url, timeout=15)
            if main_page.status_code != 200:
                return {"success": False}
            
            # Procura por endpoints JavaScript
            js_endpoints = self.extract_js_endpoints(main_page.text)
            
            for endpoint in js_endpoints:
                print(f"Testando endpoint JS: {endpoint}")
                
                # Tenta GET
                try:
                    url = f"{self.base_url}{endpoint}?chave={invoice_key}"
                    response = self.session.get(url, timeout=15)
                    
                    if response.status_code == 200 and self.is_nfe_found(response.text, invoice_key):
                        xml_content = self.extract_xml_content(response.text, invoice_key)
                        if xml_content:
                            return {
                                "success": True,
                                "xml_content": xml_content,
                                "message": "XML obtido via endpoint JavaScript"
                            }
                except:
                    continue
        
        except Exception as e:
            print(f"Erro na estratégia 4: {e}")
        
        return {"success": False}
    
    def is_nfe_found(self, html_content, invoice_key):
        """Verifica se a NFe foi encontrada na resposta"""
        if not html_content or not invoice_key:
            return False
        
        # Indicadores de sucesso
        success_indicators = [
            'sucesso',
            'encontrada',
            'autorizada',
            'válida',
            'dados gerais',
            'baixar xml',
            'download',
            invoice_key
        ]
        
        html_lower = html_content.lower()
        return any(indicator in html_lower for indicator in success_indicators)
    
    def extract_xml_content(self, html_content, invoice_key):
        """Extrai conteúdo XML da resposta"""
        try:
            # Padrões para XML completo
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
            
            # Procura em dados JavaScript
            js_patterns = [
                rf'xmlData\s*[=:]\s*[\'"]([^\'"]+)[\'"]',
                rf'xmlContent\s*[=:]\s*[\'"]([^\'"]+)[\'"]',
                rf'"xml"\s*:\s*"([^"]+)"'
            ]
            
            for pattern in js_patterns:
                match = re.search(pattern, html_content, re.IGNORECASE)
                if match:
                    xml_data = match.group(1)
                    if invoice_key in xml_data and len(xml_data) > 1000:
                        # Decodifica escapes
                        xml_data = xml_data.replace('\\n', '\n').replace('\\t', '\t').replace('\\"', '"')
                        if xml_data.startswith('<?xml') or '<NFe' in xml_data:
                            return xml_data
        
        except Exception as e:
            print(f"Erro ao extrair XML: {e}")
        
        return None
    
    def find_download_link(self, html_content, base_url):
        """Encontra link de download do XML"""
        try:
            patterns = [
                r'href\s*=\s*["\']([^"\']*download[^"\']*xml[^"\']*)["\']',
                r'href\s*=\s*["\']([^"\']*xml[^"\']*download[^"\']*)["\']',
                r'href\s*=\s*["\']([^"\']*baixar[^"\']*xml[^"\']*)["\']'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, html_content, re.IGNORECASE)
                if match:
                    link = match.group(1)
                    if link.startswith('/'):
                        return f"{self.base_url}{link}"
                    elif link.startswith('http'):
                        return link
                    else:
                        return f"{self.base_url}/{link}"
        
        except Exception as e:
            print(f"Erro ao encontrar link de download: {e}")
        
        return None
    
    def download_xml(self, url):
        """Baixa XML de uma URL"""
        try:
            response = self.session.get(url, timeout=15)
            if response.status_code == 200:
                content = response.text.strip()
                if content.startswith('<?xml') and len(content) > 1000:
                    return content
        except Exception as e:
            print(f"Erro ao baixar XML: {e}")
        
        return None
    
    def extract_csrf_token(self, html_content):
        """Extrai token CSRF da página"""
        try:
            patterns = [
                r'name="_token"\s+value="([^"]+)"',
                r'name="csrf_token"\s+value="([^"]+)"',
                r'csrf-token"\s+content="([^"]+)"'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, html_content)
                if match:
                    return match.group(1)
        except:
            pass
        
        return None
    
    def extract_js_endpoints(self, html_content):
        """Extrai endpoints JavaScript da página"""
        try:
            endpoints = set()
            
            # Padrões para encontrar URLs em JavaScript
            patterns = [
                r'["\'](/[^"\']*(?:consulta|nfe|xml|danfe)[^"\']*)["\']',
                r'url\s*:\s*["\']([^"\']*)["\']',
                r'action\s*:\s*["\']([^"\']*)["\']'
            ]
            
            for pattern in patterns:
                matches = re.findall(pattern, html_content, re.IGNORECASE)
                for match in matches:
                    if match.startswith('/') and len(match) > 1:
                        endpoints.add(match)
            
            return list(endpoints)[:10]  # Limita a 10 endpoints
        except:
            return []

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
            print(f"Iniciando RPA avançado para chave: {invoice_key}")
            rpa = MeuDanfeRPA()
            result = rpa.execute_consultation(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()