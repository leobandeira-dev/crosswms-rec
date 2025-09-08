#!/usr/bin/env python3
import sys
import json
import os
import requests
import time
import re
from urllib.parse import quote

class HybridRPASystem:
    def __init__(self):
        self.session = requests.Session()
        self.download_folder = "C:\\CROSSWMS" if os.name == 'nt' else "/tmp/crosswms"
        self.setup_session()
    
    def setup_session(self):
        """Configura sessão HTTP simulando navegador real"""
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
    
    def execute_rpa(self, invoice_key):
        """Executa RPA híbrido com múltiplas estratégias"""
        
        print(f"Iniciando RPA híbrido para chave: {invoice_key}")
        
        # Estratégia 1: Selenium local se disponível
        if self.is_selenium_available():
            result = self.try_selenium_download(invoice_key)
            if result.get('success'):
                return result
        
        # Estratégia 2: Simulação HTTP avançada
        result = self.try_http_simulation(invoice_key)
        if result.get('success'):
            return result
        
        # Estratégia 3: Download direto se XML estiver disponível
        result = self.try_direct_xml_access(invoice_key)
        if result.get('success'):
            return result
        
        # Se todas falharam, retorna orientação para ambiente local
        return self.generate_local_setup_guidance(invoice_key)
    
    def is_selenium_available(self):
        """Verifica se Selenium e Chrome estão disponíveis"""
        try:
            from selenium import webdriver
            from selenium.webdriver.chrome.options import Options
            
            # Testa se ChromeDriver está acessível
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            
            driver = webdriver.Chrome(options=chrome_options)
            driver.quit()
            return True
        except Exception:
            return False
    
    def try_selenium_download(self, invoice_key):
        """Tenta download usando Selenium"""
        try:
            from selenium import webdriver
            from selenium.webdriver.common.by import By
            from selenium.webdriver.support.ui import WebDriverWait
            from selenium.webdriver.support import expected_conditions as EC
            from selenium.webdriver.chrome.options import Options
            
            print("Executando download com Selenium...")
            
            chrome_options = Options()
            
            # Configura pasta de download
            prefs = {
                "download.default_directory": self.download_folder,
                "download.prompt_for_download": False,
                "download.directory_upgrade": True,
                "safebrowsing.enabled": True
            }
            chrome_options.add_experimental_option("prefs", prefs)
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            
            driver = webdriver.Chrome(options=chrome_options)
            
            try:
                # Navega para meudanfe.com.br
                driver.get("https://meudanfe.com.br")
                
                # Procura campo de entrada
                input_element = WebDriverWait(driver, 10).until(
                    lambda d: d.find_element(By.CSS_SELECTOR, 'input[type="text"], input[placeholder*="chave"]') or
                             d.find_element(By.TAG_NAME, "input")
                )
                
                # Preenche chave
                input_element.clear()
                input_element.send_keys(invoice_key)
                
                # Procura e clica botão de busca
                search_button = driver.find_element(By.XPATH, "//*[contains(text(), 'Buscar') or contains(text(), 'BUSCAR')]")
                search_button.click()
                
                # Aguarda resultados
                time.sleep(3)
                
                # Procura botão de download
                download_button = driver.find_element(By.XPATH, "//*[contains(text(), 'Baixar XML') or contains(text(), 'Download')]")
                download_button.click()
                
                # Aguarda download
                xml_file = self.wait_for_download(invoice_key, 30)
                
                if xml_file:
                    xml_content = self.read_file(xml_file)
                    if xml_content and invoice_key in xml_content:
                        return {
                            "success": True,
                            "xml_content": xml_content,
                            "file_path": xml_file,
                            "method": "selenium_download",
                            "message": "XML baixado com sucesso via Selenium"
                        }
                
                return {"success": False, "error": "Download não completou"}
                
            finally:
                driver.quit()
                
        except Exception as e:
            print(f"Erro no Selenium: {e}")
            return {"success": False, "error": f"Erro Selenium: {str(e)}"}
    
    def try_http_simulation(self, invoice_key):
        """Simula navegação HTTP para buscar XML"""
        try:
            print("Executando simulação HTTP...")
            
            # Acessa página principal
            main_response = self.session.get('https://meudanfe.com.br', timeout=15)
            if main_response.status_code != 200:
                return {"success": False, "error": "Erro ao acessar site principal"}
            
            # Tenta diferentes endpoints de consulta
            consultation_urls = [
                f'https://meudanfe.com.br/ver-danfe?chave={invoice_key}',
                f'https://meudanfe.com.br/consulta?chNFe={invoice_key}',
                f'https://meudanfe.com.br/nfe/{invoice_key}',
                f'https://meudanfe.com.br/xml/{invoice_key}'
            ]
            
            for url in consultation_urls:
                print(f"Tentando: {url}")
                response = self.session.get(url, timeout=20)
                
                if response.status_code == 200:
                    # Verifica se encontrou a NFe
                    if invoice_key in response.text and ('sucesso' in response.text.lower() or 'xml' in response.text.lower()):
                        
                        # Procura por XML na resposta
                        xml_content = self.extract_xml_from_response(response.text, invoice_key)
                        if xml_content:
                            # Salva XML localmente
                            local_file = self.save_xml_locally(xml_content, invoice_key)
                            return {
                                "success": True,
                                "xml_content": xml_content,
                                "file_path": local_file,
                                "method": "http_simulation",
                                "message": "XML obtido via simulação HTTP"
                            }
                        
                        # Procura link de download
                        download_url = self.extract_download_link(response.text, invoice_key)
                        if download_url:
                            xml_response = self.session.get(download_url, timeout=15)
                            if xml_response.status_code == 200 and xml_response.text.startswith('<?xml'):
                                local_file = self.save_xml_locally(xml_response.text, invoice_key)
                                return {
                                    "success": True,
                                    "xml_content": xml_response.text,
                                    "file_path": local_file,
                                    "method": "http_download",
                                    "message": "XML baixado via HTTP"
                                }
            
            return {"success": False, "error": "NFe não encontrada via HTTP"}
            
        except Exception as e:
            print(f"Erro na simulação HTTP: {e}")
            return {"success": False, "error": f"Erro HTTP: {str(e)}"}
    
    def try_direct_xml_access(self, invoice_key):
        """Tenta acesso direto a URLs de XML"""
        try:
            print("Tentando acesso direto a XMLs...")
            
            # URLs diretas comuns para XMLs
            direct_urls = [
                f'https://meudanfe.com.br/download/xml/{invoice_key}',
                f'https://meudanfe.com.br/api/xml/{invoice_key}',
                f'https://meudanfe.com.br/files/xml/{invoice_key}.xml',
                f'https://meudanfe.com.br/nfe/xml/{invoice_key}.xml'
            ]
            
            for url in direct_urls:
                print(f"Tentando acesso direto: {url}")
                response = self.session.get(url, timeout=15)
                
                if response.status_code == 200 and response.text.startswith('<?xml'):
                    if invoice_key in response.text:
                        local_file = self.save_xml_locally(response.text, invoice_key)
                        return {
                            "success": True,
                            "xml_content": response.text,
                            "file_path": local_file,
                            "method": "direct_access",
                            "message": "XML acessado diretamente"
                        }
            
            return {"success": False, "error": "Acesso direto falhou"}
            
        except Exception as e:
            return {"success": False, "error": f"Erro acesso direto: {str(e)}"}
    
    def generate_local_setup_guidance(self, invoice_key):
        """Gera orientação para setup local"""
        return {
            "success": False,
            "error": "RPA requer ambiente local com Chrome",
            "local_setup_guide": True,
            "instructions": {
                "title": "Setup RPA Local para Download Automático",
                "requirements": [
                    "Google Chrome instalado",
                    "ChromeDriver compatível",
                    "Pasta C:\\CROSSWMS criada",
                    "Python com Selenium"
                ],
                "steps": [
                    "1. Instale Google Chrome",
                    "2. Baixe ChromeDriver",
                    "3. Crie pasta C:\\CROSSWMS",
                    "4. Execute o script RPA localmente",
                    "5. XML será baixado automaticamente"
                ],
                "benefit": "RPA local consegue fazer download real dos XMLs"
            },
            "suggestions": [
                "Use importação manual de XML como alternativa",
                "Configure ambiente local para RPA completo",
                "Solicite XML diretamente do emissor"
            ]
        }
    
    def extract_xml_from_response(self, html_content, invoice_key):
        """Extrai XML da resposta HTML"""
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
    
    def extract_download_link(self, html_content, invoice_key):
        """Extrai link de download da resposta"""
        try:
            patterns = [
                rf'href\s*=\s*["\']([^"\']*download[^"\']*xml[^"\']*{invoice_key}[^"\']*)["\']',
                rf'href\s*=\s*["\']([^"\']*xml[^"\']*{invoice_key}[^"\']*)["\']',
                rf'href\s*=\s*["\']([^"\']*{invoice_key}[^"\']*\.xml[^"\']*)["\']'
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
    
    def wait_for_download(self, invoice_key, timeout=30):
        """Aguarda download completar"""
        import glob
        
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            xml_files = glob.glob(os.path.join(self.download_folder, "*.xml"))
            
            for file in xml_files:
                if not file.endswith('.crdownload') and not file.endswith('.tmp'):
                    try:
                        content = self.read_file(file)
                        if content and invoice_key in content:
                            return file
                    except:
                        continue
            
            time.sleep(1)
        
        return None
    
    def read_file(self, filepath):
        """Lê conteúdo de arquivo"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception:
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
            # Executa RPA híbrido
            rpa = HybridRPASystem()
            result = rpa.execute_rpa(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()