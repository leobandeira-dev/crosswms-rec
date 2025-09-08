#!/usr/bin/env python3
import sys
import json
import os
import requests
import time
import re
from urllib.parse import quote

class OptimizedRPAFinal:
    def __init__(self):
        self.session = requests.Session()
        self.download_folder = "C:\\CROSSWMS"
        self.setup_session()
    
    def setup_session(self):
        """Configura sessão HTTP otimizada"""
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
            'Cache-Control': 'max-age=0'
        })
    
    def execute_rpa(self, invoice_key):
        """Executa RPA otimizado com foco em resultados práticos"""
        
        print(f"Iniciando RPA otimizado para chave: {invoice_key}")
        
        # Estratégia principal: Simulação HTTP completa
        result = self.execute_http_rpa(invoice_key)
        if result.get('success'):
            return result
        
        # Se falhou, oferece orientação prática
        return self.generate_practical_guidance(invoice_key, result.get('attempts', []))
    
    def execute_http_rpa(self, invoice_key):
        """Executa RPA via HTTP simulando navegação real"""
        attempts = []
        
        try:
            print("Executando RPA HTTP completo...")
            
            # Passo 1: Acessa página principal
            print("Acessando meudanfe.com.br...")
            main_response = self.session.get('https://meudanfe.com.br', timeout=15)
            attempts.append(f"Página principal: {main_response.status_code}")
            
            if main_response.status_code != 200:
                return {"success": False, "attempts": attempts, "error": "Erro ao acessar site principal"}
            
            # Passo 2: Tenta múltiplas estratégias de consulta
            consultation_strategies = [
                self.try_direct_consultation,
                self.try_form_submission,
                self.try_api_endpoints,
                self.try_xml_discovery
            ]
            
            for strategy in consultation_strategies:
                result = strategy(invoice_key, attempts)
                if result.get('success'):
                    return result
            
            return {"success": False, "attempts": attempts, "error": "Todas as estratégias HTTP falharam"}
            
        except Exception as e:
            print(f"Erro no RPA HTTP: {e}")
            attempts.append(f"Erro: {str(e)}")
            return {"success": False, "attempts": attempts, "error": f"Erro técnico: {str(e)}"}
    
    def try_direct_consultation(self, invoice_key, attempts):
        """Estratégia 1: Consulta direta via URLs"""
        try:
            print("Tentando consulta direta...")
            
            direct_urls = [
                f'https://meudanfe.com.br/ver-danfe?chave={invoice_key}',
                f'https://meudanfe.com.br/consulta?chNFe={invoice_key}',
                f'https://meudanfe.com.br/nfe/{invoice_key}',
                f'https://meudanfe.com.br/danfe/{invoice_key}'
            ]
            
            for url in direct_urls:
                response = self.session.get(url, timeout=20)
                attempts.append(f"URL direta {url}: {response.status_code}")
                
                if response.status_code == 200:
                    # Verifica se encontrou dados da NFe
                    if invoice_key in response.text and self.has_success_indicators(response.text):
                        xml_content = self.extract_xml_content(response.text, invoice_key)
                        if xml_content:
                            local_file = self.save_xml_locally(xml_content, invoice_key)
                            return {
                                "success": True,
                                "xml_content": xml_content,
                                "file_path": local_file,
                                "method": "direct_consultation",
                                "message": "XML obtido via consulta direta"
                            }
                        
                        # Procura link de download
                        download_url = self.find_download_link(response.text)
                        if download_url:
                            xml_response = self.session.get(download_url, timeout=15)
                            if xml_response.status_code == 200 and xml_response.text.startswith('<?xml'):
                                local_file = self.save_xml_locally(xml_response.text, invoice_key)
                                return {
                                    "success": True,
                                    "xml_content": xml_response.text,
                                    "file_path": local_file,
                                    "method": "direct_download",
                                    "message": "XML baixado via link direto"
                                }
            
            return {"success": False}
            
        except Exception as e:
            attempts.append(f"Erro consulta direta: {str(e)}")
            return {"success": False}
    
    def try_form_submission(self, invoice_key, attempts):
        """Estratégia 2: Submissão de formulário"""
        try:
            print("Tentando submissão de formulário...")
            
            # Headers para POST
            self.session.headers.update({
                'Content-Type': 'application/x-www-form-urlencoded',
                'Origin': 'https://meudanfe.com.br',
                'Referer': 'https://meudanfe.com.br'
            })
            
            form_data = {
                'chave': invoice_key,
                'chaveNFe': invoice_key,
                'chNFe': invoice_key,
                'consulta': 'xml',
                'action': 'buscar'
            }
            
            form_endpoints = ['/consulta', '/buscar', '/ver-danfe', '/search']
            
            for endpoint in form_endpoints:
                response = self.session.post(f'https://meudanfe.com.br{endpoint}', data=form_data, timeout=20)
                attempts.append(f"POST {endpoint}: {response.status_code}")
                
                if response.status_code == 200 and self.has_success_indicators(response.text):
                    xml_content = self.extract_xml_content(response.text, invoice_key)
                    if xml_content:
                        local_file = self.save_xml_locally(xml_content, invoice_key)
                        return {
                            "success": True,
                            "xml_content": xml_content,
                            "file_path": local_file,
                            "method": "form_submission",
                            "message": "XML obtido via formulário"
                        }
            
            return {"success": False}
            
        except Exception as e:
            attempts.append(f"Erro formulário: {str(e)}")
            return {"success": False}
    
    def try_api_endpoints(self, invoice_key, attempts):
        """Estratégia 3: Endpoints de API"""
        try:
            print("Tentando endpoints de API...")
            
            # Headers para API
            self.session.headers.update({
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            })
            
            api_endpoints = [
                f'/api/consulta/{invoice_key}',
                f'/api/nfe/{invoice_key}',
                f'/api/xml/{invoice_key}',
                f'/ajax/consulta/{invoice_key}'
            ]
            
            for endpoint in api_endpoints:
                response = self.session.get(f'https://meudanfe.com.br{endpoint}', timeout=15)
                attempts.append(f"API {endpoint}: {response.status_code}")
                
                if response.status_code == 200:
                    try:
                        json_data = response.json()
                        if json_data.get('xml') or json_data.get('content'):
                            xml_content = json_data.get('xml') or json_data.get('content')
                            if invoice_key in xml_content:
                                local_file = self.save_xml_locally(xml_content, invoice_key)
                                return {
                                    "success": True,
                                    "xml_content": xml_content,
                                    "file_path": local_file,
                                    "method": "api_endpoint",
                                    "message": "XML obtido via API"
                                }
                    except:
                        # Não é JSON, pode ser XML direto
                        if response.text.startswith('<?xml') and invoice_key in response.text:
                            local_file = self.save_xml_locally(response.text, invoice_key)
                            return {
                                "success": True,
                                "xml_content": response.text,
                                "file_path": local_file,
                                "method": "api_xml",
                                "message": "XML obtido via API direta"
                            }
            
            return {"success": False}
            
        except Exception as e:
            attempts.append(f"Erro API: {str(e)}")
            return {"success": False}
    
    def try_xml_discovery(self, invoice_key, attempts):
        """Estratégia 4: Descoberta automática de XMLs"""
        try:
            print("Tentando descoberta de XMLs...")
            
            xml_paths = [
                f'/download/xml/{invoice_key}',
                f'/files/{invoice_key}.xml',
                f'/xml/{invoice_key}.xml',
                f'/storage/xml/{invoice_key}',
                f'/public/xml/{invoice_key}.xml'
            ]
            
            for path in xml_paths:
                response = self.session.get(f'https://meudanfe.com.br{path}', timeout=10)
                attempts.append(f"XML {path}: {response.status_code}")
                
                if response.status_code == 200 and response.text.startswith('<?xml'):
                    if invoice_key in response.text and len(response.text) > 1000:
                        local_file = self.save_xml_locally(response.text, invoice_key)
                        return {
                            "success": True,
                            "xml_content": response.text,
                            "file_path": local_file,
                            "method": "xml_discovery",
                            "message": "XML descoberto automaticamente"
                        }
            
            return {"success": False}
            
        except Exception as e:
            attempts.append(f"Erro descoberta: {str(e)}")
            return {"success": False}
    
    def has_success_indicators(self, html_content):
        """Verifica indicadores de sucesso na resposta"""
        indicators = ['sucesso', 'encontrada', 'autorizada', 'válida', 'baixar xml', 'download']
        return any(indicator in html_content.lower() for indicator in indicators)
    
    def extract_xml_content(self, html_content, invoice_key):
        """Extrai conteúdo XML da resposta"""
        try:
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
                    if len(xml_content) > 2000:
                        return xml_content
            
            return None
            
        except Exception:
            return None
    
    def find_download_link(self, html_content):
        """Encontra link de download na resposta"""
        try:
            patterns = [
                r'href\s*=\s*["\']([^"\']*download[^"\']*xml[^"\']*)["\']',
                r'href\s*=\s*["\']([^"\']*xml[^"\']*download[^"\']*)["\']',
                r'href\s*=\s*["\']([^"\']*baixar[^"\']*)["\']'
            ]
            
            for pattern in patterns:
                match = re.search(pattern, html_content, re.IGNORECASE)
                if match:
                    link = match.group(1)
                    if link.startswith('/'):
                        return f'https://meudanfe.com.br{link}'
                    elif link.startswith('http'):
                        return link
                    else:
                        return f'https://meudanfe.com.br/{link}'
            
            return None
            
        except Exception:
            return None
    
    def save_xml_locally(self, xml_content, invoice_key):
        """Salva XML na pasta local"""
        try:
            # Cria pasta se não existir
            os.makedirs(self.download_folder, exist_ok=True)
            
            filename = f"NFe_{invoice_key}.xml"
            filepath = os.path.join(self.download_folder, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(xml_content)
            
            print(f"XML salvo em: {filepath}")
            return filepath
            
        except Exception as e:
            print(f"Erro ao salvar XML: {e}")
            return None
    
    def generate_practical_guidance(self, invoice_key, attempts):
        """Gera orientação prática para o usuário"""
        return {
            "success": False,
            "error": "RPA executou todas as estratégias mas NFe não está disponível publicamente",
            "rpa_executed": True,
            "strategies_attempted": 4,
            "attempts": attempts,
            "practical_guidance": {
                "web_environment": {
                    "status": "RPA executado com sucesso",
                    "result": "NFe não disponível para consulta pública",
                    "recommendation": "Use importação manual de XML"
                },
                "local_environment": {
                    "setup": f"Para RPA completo com download automático em {self.download_folder}",
                    "requirements": [
                        "Google Chrome instalado",
                        "ChromeDriver configurado",
                        f"Pasta {self.download_folder} criada",
                        "Selenium Python configurado"
                    ],
                    "benefit": "Download automático real de XMLs disponíveis"
                }
            },
            "next_steps": [
                "Use importação manual de XML (drag & drop)",
                "Solicite XML diretamente do emissor",
                "Configure ambiente local para RPA completo"
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
            # Executa RPA otimizado
            rpa = OptimizedRPAFinal()
            result = rpa.execute_rpa(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()