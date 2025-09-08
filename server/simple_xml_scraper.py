#!/usr/bin/env python3
import sys
import json
import time
import tempfile
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def fetch_xml_from_meudanfe(chave_nota_fiscal):
    """Fetch XML from meudanfe.com.br using Selenium automation"""
    
    if not chave_nota_fiscal or len(chave_nota_fiscal) != 44:
        return {
            "success": False,
            "error": "Chave de nota fiscal deve ter exatamente 44 dígitos"
        }
    
    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    download_dir = tempfile.mkdtemp()
    prefs = {
        "download.default_directory": download_dir,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": True
    }
    chrome_options.add_experimental_option("prefs", prefs)
    
    driver = None
    try:
        # Initialize WebDriver
        driver = webdriver.Chrome(options=chrome_options)
        
        # Navigate to meudanfe.com.br
        driver.get("https://meudanfe.com.br/")
        
        # Wait for page to load and find input field
        wait = WebDriverWait(driver, 20)
        
        # Find the input field for the access key
        input_selectors = [
            "//input[contains(@placeholder, 'CHAVE DE ACESSO')]",
            "//input[contains(@placeholder, 'chave')]",
            "//input[@type='text']"
        ]
        
        chave_input = None
        for selector in input_selectors:
            try:
                chave_input = wait.until(EC.presence_of_element_located((By.XPATH, selector)))
                break
            except TimeoutException:
                continue
        
        if not chave_input:
            return {
                "success": False,
                "error": "Campo de entrada da chave não encontrado no site"
            }
        
        # Clear and enter the access key
        chave_input.clear()
        chave_input.send_keys(chave_nota_fiscal)
        
        # Find and click the search button
        button_selectors = [
            "//button[contains(text(), 'Buscar')]",
            "//button[contains(text(), 'BUSCAR')]",
            "//input[@type='submit']"
        ]
        
        search_button = None
        for selector in button_selectors:
            try:
                search_button = wait.until(EC.element_to_be_clickable((By.XPATH, selector)))
                break
            except TimeoutException:
                continue
        
        if not search_button:
            return {
                "success": False,
                "error": "Botão de busca não encontrado no site"
            }
        
        search_button.click()
        
        # Wait for results page
        time.sleep(5)
        
        # Look for XML download link
        xml_selectors = [
            "//a[contains(@href, '.xml')]",
            "//a[contains(text(), 'XML')]",
            "//button[contains(text(), 'XML')]",
            "//a[contains(text(), 'Baixar')]"
        ]
        
        xml_link = None
        for selector in xml_selectors:
            try:
                xml_link = driver.find_element(By.XPATH, selector)
                break
            except NoSuchElementException:
                continue
        
        if xml_link:
            try:
                # Click the XML download link
                xml_link.click()
                time.sleep(3)
                
                # Check if file was downloaded
                xml_files = []
                for _ in range(10):  # Wait up to 10 seconds for download
                    try:
                        files = os.listdir(download_dir)
                        xml_files = [f for f in files if f.endswith('.xml')]
                        if xml_files:
                            break
                        time.sleep(1)
                    except:
                        time.sleep(1)
                
                if xml_files:
                    # Read the downloaded XML file
                    xml_file_path = os.path.join(download_dir, xml_files[0])
                    with open(xml_file_path, 'r', encoding='utf-8') as file:
                        xml_content = file.read()
                    
                    if xml_content and len(xml_content) > 100:
                        return {
                            "success": True,
                            "xml_content": xml_content,
                            "message": "XML baixado com sucesso via automação RPA!"
                        }
                    else:
                        return {
                            "success": False,
                            "error": "Arquivo XML baixado está vazio ou corrompido"
                        }
                else:
                    # Try to get XML content directly from the page
                    try:
                        xml_content_element = driver.find_element(By.XPATH, "//pre | //textarea | //div[contains(@class, 'xml')]")
                        xml_content = xml_content_element.text
                        
                        if xml_content and '<?xml' in xml_content:
                            return {
                                "success": True,
                                "xml_content": xml_content,
                                "message": "XML extraído da página com sucesso!"
                            }
                    except:
                        pass
                    
                    return {
                        "success": False,
                        "error": "Não foi possível baixar ou extrair o XML"
                    }
            except Exception as download_error:
                return {
                    "success": False,
                    "error": f"Erro durante download: {str(download_error)}"
                }
        else:
            # Check for error messages
            error_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'não encontrado') or contains(text(), 'inválid') or contains(text(), 'erro')]")
            if error_elements:
                return {
                    "success": False,
                    "error": f"Erro no site: {error_elements[0].text}"
                }
            else:
                return {
                    "success": False,
                    "error": "XML não encontrado. Verifique se a chave está correta."
                }
                
    except TimeoutException:
        return {
            "success": False,
            "error": "Timeout ao acessar o site meudanfe.com.br"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Erro durante automação: {str(e)}"
        }
    finally:
        if driver:
            driver.quit()

def main():
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave de nota fiscal requerida"}
    else:
        chave = sys.argv[1]
        result = fetch_xml_from_meudanfe(chave)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()