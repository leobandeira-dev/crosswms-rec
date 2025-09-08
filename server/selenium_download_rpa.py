#!/usr/bin/env python3
import sys
import json
import os
import time
import glob
import shutil
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class MeuDanfeSeleniumRPA:
    def __init__(self, download_folder="C:\\CROSSWMS"):
        self.download_folder = download_folder
        self.driver = None
        self.setup_driver()
    
    def setup_driver(self):
        """Configura Chrome WebDriver com download automático"""
        chrome_options = Options()
        
        # Configura pasta de download
        prefs = {
            "download.default_directory": self.download_folder,
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safebrowsing.enabled": True
        }
        chrome_options.add_experimental_option("prefs", prefs)
        
        # Configurações do Chrome
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        try:
            # Tenta usar ChromeDriver local
            if os.path.exists("./chromedriver"):
                service = Service("./chromedriver")
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
            else:
                # Fallback para ChromeDriver no PATH
                self.driver = webdriver.Chrome(options=chrome_options)
            
            # Remove indicadores de automação
            self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
        except Exception as e:
            print(f"Erro ao inicializar Chrome: {e}")
            raise
    
    def execute_download_rpa(self, invoice_key):
        """Executa RPA completo com download real do XML"""
        try:
            print(f"Iniciando RPA Selenium para chave: {invoice_key}")
            
            # Limpa arquivos XML antigos da pasta
            self.cleanup_old_xmls()
            
            # Navega para meudanfe.com.br
            print("Acessando meudanfe.com.br...")
            self.driver.get("https://meudanfe.com.br")
            
            # Aguarda carregamento da página
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.TAG_NAME, "body"))
            )
            
            # Procura campo de entrada da chave NFe
            print("Procurando campo de entrada...")
            input_selectors = [
                'input[placeholder*="CHAVE"]',
                'input[placeholder*="chave"]',
                'input[name*="chave"]',
                'input[id*="chave"]',
                'input[type="text"]'
            ]
            
            input_element = None
            for selector in input_selectors:
                try:
                    input_element = WebDriverWait(self.driver, 5).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                    )
                    break
                except TimeoutException:
                    continue
            
            if not input_element:
                # Procura por campo de input de forma mais ampla
                input_elements = self.driver.find_elements(By.TAG_NAME, "input")
                for elem in input_elements:
                    if elem.get_attribute("type") in ["text", "search"] or "chave" in elem.get_attribute("placeholder", "").lower():
                        input_element = elem
                        break
            
            if not input_element:
                return {"success": False, "error": "Campo de entrada não encontrado na página"}
            
            # Preenche a chave NFe
            print(f"Preenchendo chave: {invoice_key}")
            input_element.clear()
            input_element.send_keys(invoice_key)
            
            # Procura botão de busca
            print("Procurando botão de busca...")
            button_selectors = [
                'button:contains("Buscar")',
                'button:contains("BUSCAR")',
                'input[value*="Buscar"]',
                'button[type="submit"]',
                '.btn:contains("Buscar")'
            ]
            
            search_button = None
            for selector in button_selectors:
                try:
                    search_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                    break
                except NoSuchElementException:
                    continue
            
            # Se não encontrou, procura por texto "Buscar" em qualquer elemento
            if not search_button:
                elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Buscar') or contains(text(), 'BUSCAR')]")
                for elem in elements:
                    if elem.tag_name in ["button", "input", "a"] or "btn" in elem.get_attribute("class", ""):
                        search_button = elem
                        break
            
            if not search_button:
                return {"success": False, "error": "Botão de busca não encontrado"}
            
            # Clica no botão de busca
            print("Clicando no botão de busca...")
            search_button.click()
            
            # Aguarda carregamento dos resultados
            time.sleep(3)
            
            # Procura por indicações de sucesso
            page_text = self.driver.page_source.lower()
            if "sucesso" in page_text or "encontrada" in page_text or invoice_key in page_text:
                print("NFe encontrada! Procurando botão de download...")
                
                # Procura botão "Baixar XML"
                download_selectors = [
                    'button:contains("Baixar XML")',
                    'a:contains("Baixar XML")',
                    'button:contains("Download")',
                    'a[href*="xml"]',
                    '.btn:contains("XML")'
                ]
                
                download_button = None
                for selector in download_selectors:
                    try:
                        download_button = self.driver.find_element(By.CSS_SELECTOR, selector)
                        break
                    except NoSuchElementException:
                        continue
                
                # Procura por texto "Baixar XML" ou "Download"
                if not download_button:
                    elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'Baixar XML') or contains(text(), 'Download') or contains(text(), 'XML')]")
                    for elem in elements:
                        if elem.tag_name in ["button", "a"] or "btn" in elem.get_attribute("class", ""):
                            download_button = elem
                            break
                
                if download_button:
                    print("Clicando no botão de download...")
                    download_button.click()
                    
                    # Aguarda download completar
                    xml_file = self.wait_for_download(invoice_key)
                    
                    if xml_file:
                        # Lê o conteúdo do XML baixado
                        xml_content = self.read_xml_file(xml_file)
                        
                        if xml_content and invoice_key in xml_content:
                            return {
                                "success": True,
                                "xml_content": xml_content,
                                "file_path": xml_file,
                                "message": "XML baixado com sucesso via RPA Selenium"
                            }
                        else:
                            return {"success": False, "error": "XML baixado mas conteúdo inválido"}
                    else:
                        return {"success": False, "error": "Download não completou no tempo esperado"}
                else:
                    return {"success": False, "error": "Botão de download não encontrado"}
            else:
                return {"success": False, "error": "NFe não encontrada no sistema"}
        
        except Exception as e:
            print(f"Erro durante RPA: {e}")
            return {"success": False, "error": f"Erro técnico: {str(e)}"}
        
        finally:
            if self.driver:
                self.driver.quit()
    
    def cleanup_old_xmls(self):
        """Remove XMLs antigos da pasta de download"""
        try:
            os.makedirs(self.download_folder, exist_ok=True)
            xml_files = glob.glob(os.path.join(self.download_folder, "*.xml"))
            for file in xml_files:
                os.remove(file)
        except Exception as e:
            print(f"Erro ao limpar pasta: {e}")
    
    def wait_for_download(self, invoice_key, timeout=30):
        """Aguarda download do XML completar"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            # Procura por arquivos XML na pasta
            xml_files = glob.glob(os.path.join(self.download_folder, "*.xml"))
            
            for file in xml_files:
                # Verifica se não é arquivo temporário de download
                if not file.endswith('.crdownload') and not file.endswith('.tmp'):
                    # Verifica se arquivo contém a chave NFe
                    try:
                        with open(file, 'r', encoding='utf-8') as f:
                            content = f.read()
                            if invoice_key in content:
                                print(f"XML encontrado: {file}")
                                return file
                    except:
                        continue
            
            time.sleep(1)
        
        return None
    
    def read_xml_file(self, file_path):
        """Lê conteúdo do arquivo XML"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Erro ao ler XML: {e}")
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
            # Executa RPA com Selenium
            rpa = MeuDanfeSeleniumRPA()
            result = rpa.execute_download_rpa(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()