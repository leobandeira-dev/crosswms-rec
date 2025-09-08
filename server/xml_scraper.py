#!/usr/bin/env python3
"""
XML Scraper for meudanfe.com.br using Selenium WebDriver
Automatically fetches XML files using invoice access keys
"""

import os
import time
import tempfile
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import sys
import json

class MeuDanfeXMLScraper:
    def __init__(self, headless=True):
        self.headless = headless
        self.driver = None
        self.download_dir = tempfile.mkdtemp()
        
    def setup_driver(self):
        """Configure Chrome WebDriver with appropriate settings"""
        chrome_options = Options()
        
        if self.headless:
            chrome_options.add_argument("--headless")
        
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--window-size=1920,1080")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-plugins")
        chrome_options.add_argument("--disable-images")
        chrome_options.add_argument("--disable-javascript")
        
        # Set download preferences
        prefs = {
            "download.default_directory": self.download_dir,
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safebrowsing.enabled": True
        }
        chrome_options.add_experimental_option("prefs", prefs)
        
        try:
            # Use system chromedriver (installed via nix)
            self.driver = webdriver.Chrome(options=chrome_options)
                
        except Exception as e:
            raise Exception(f"Failed to initialize Chrome WebDriver: {str(e)}")
    
    def fetch_xml(self, chave_nota_fiscal):
        """
        Fetch XML from meudanfe.com.br using the invoice access key
        
        Args:
            chave_nota_fiscal (str): 44-digit invoice access key
            
        Returns:
            dict: Result containing success status and XML content or error message
        """
        if not chave_nota_fiscal or len(chave_nota_fiscal) != 44:
            return {
                "success": False,
                "error": "Chave de nota fiscal deve ter exatamente 44 dígitos"
            }
        
        try:
            self.setup_driver()
            
            # Navigate to meudanfe.com.br
            self.driver.get("https://meudanfe.com.br/")
            
            # Wait for page to load
            wait = WebDriverWait(self.driver, 15)
            
            # Find the input field for the access key
            chave_input = wait.until(
                EC.presence_of_element_located((By.XPATH, "//input[contains(@placeholder, 'CHAVE DE ACESSO') or contains(@placeholder, 'chave')]"))
            )
            
            # Clear and enter the access key
            chave_input.clear()
            chave_input.send_keys(chave_nota_fiscal)
            
            # Find and click the search button
            search_button = wait.until(
                EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Buscar') or contains(text(), 'BUSCAR')]"))
            )
            search_button.click()
            
            # Wait for results page
            time.sleep(3)
            
            # Look for XML download link or button
            try:
                # Try different selectors for XML download
                xml_selectors = [
                    "//a[contains(@href, '.xml') or contains(text(), 'XML')]",
                    "//button[contains(text(), 'XML')]",
                    "//a[contains(text(), 'Baixar XML')]",
                    "//a[contains(text(), 'Download XML')]"
                ]
                
                xml_link = None
                for selector in xml_selectors:
                    try:
                        xml_link = wait.until(EC.element_to_be_clickable((By.XPATH, selector)))
                        break
                    except TimeoutException:
                        continue
                
                if xml_link:
                    print(f"Link XML encontrado, fazendo download...")
                    
                    try:
                        # Get the XML URL if it's a direct link
                        xml_url = xml_link.get_attribute('href')
                        if xml_url and xml_url.endswith('.xml'):
                            # Download XML directly
                            response = requests.get(xml_url, timeout=30)
                            if response.status_code == 200:
                                xml_content = response.text
                            else:
                                # Click the link and wait for download
                                xml_link.click()
                                time.sleep(8)
                                xml_content = self._get_downloaded_xml()
                        else:
                            # Click the link and wait for download
                            xml_link.click()
                            time.sleep(8)
                            xml_content = self._get_downloaded_xml()
                        
                        if xml_content and len(xml_content) > 100:  # Basic validation
                            return {
                                "success": True,
                                "xml_content": xml_content,
                                "message": "XML baixado com sucesso!"
                            }
                        else:
                            return {
                                "success": False,
                                "error": "XML baixado está vazio ou corrompido"
                            }
                    except Exception as download_error:
                        print(f"Erro durante download: {str(download_error)}")
                        return {
                            "success": False,
                            "error": f"Erro durante download do XML: {str(download_error)}"
                        }
                        
                else:
                    # Check if there's an error message on the page
                    try:
                        error_elements = self.driver.find_elements(By.XPATH, "//*[contains(text(), 'não encontrado') or contains(text(), 'inválid') or contains(text(), 'erro')]")
                        if error_elements:
                            error_text = error_elements[0].text
                            return {
                                "success": False,
                                "error": f"Erro no site: {error_text}"
                            }
                    except:
                        pass
                    
                    return {
                        "success": False,
                        "error": "Link de download do XML não encontrado. Verifique se a chave está correta."
                    }
                    
            except TimeoutException:
                return {
                    "success": False,
                    "error": "Tempo limite excedido ao procurar o XML. Verifique se a chave está correta."
                }
                
        except TimeoutException:
            return {
                "success": False,
                "error": "Tempo limite excedido ao carregar a página ou procurar elementos"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Erro durante automação: {str(e)}"
            }
        finally:
            if self.driver:
                self.driver.quit()
    
    def _get_downloaded_xml(self):
        """Get the content of the downloaded XML file"""
        try:
            # Wait for file to be downloaded
            for _ in range(10):  # Wait up to 10 seconds
                files = os.listdir(self.download_dir)
                xml_files = [f for f in files if f.endswith('.xml')]
                if xml_files:
                    xml_file_path = os.path.join(self.download_dir, xml_files[0])
                    with open(xml_file_path, 'r', encoding='utf-8') as file:
                        return file.read()
                time.sleep(1)
            return None
        except Exception as e:
            print(f"Erro ao ler arquivo XML baixado: {str(e)}")
            return None

def main():
    """Main function for command line usage"""
    if len(sys.argv) != 2:
        print("Uso: python xml_scraper.py <chave_nota_fiscal>")
        sys.exit(1)
    
    chave = sys.argv[1]
    scraper = MeuDanfeXMLScraper(headless=True)
    
    result = scraper.fetch_xml(chave)
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()