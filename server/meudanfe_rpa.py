#!/usr/bin/env python3
import sys
import json
import requests
import time
import os
import re
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager

def setup_chrome_driver():
    """Setup Chrome driver with optimized options for Replit"""
    try:
        options = Options()
        
        # Essential options for headless operation in Replit
        options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-plugins")
        options.add_argument("--disable-images")
        options.add_argument("--disable-web-security")
        options.add_argument("--allow-running-insecure-content")
        options.add_argument("--ignore-certificate-errors")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--remote-debugging-port=9222")
        
        # User agent to avoid detection
        options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        # Download preferences
        download_dir = "/tmp/xml_downloads"
        os.makedirs(download_dir, exist_ok=True)
        
        prefs = {
            "download.default_directory": download_dir,
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safebrowsing.enabled": False
        }
        options.add_experimental_option("prefs", prefs)
        
        # Use system chromium from Replit
        options.binary_location = "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium-browser"
        
        # Use ChromeDriverManager for driver installation
        try:
            service = Service(ChromeDriverManager().install())
        except:
            # Fallback to system chromedriver if available
            service = Service("/usr/bin/chromedriver")
        
        driver = webdriver.Chrome(service=service, options=options)
        
        # Set timeouts
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(10)
        
        return driver, download_dir
        
    except Exception as e:
        print(f"Erro ao configurar Chrome driver: {e}")
        return None, None

def access_meudanfe_site(driver, invoice_key):
    """Access meudanfe.com.br and perform NFe consultation"""
    try:
        print(f"Acessando meudanfe.com.br para chave: {invoice_key}")
        
        # Navigate to meudanfe.com.br
        driver.get("https://meudanfe.com.br")
        
        # Wait for page to load
        wait = WebDriverWait(driver, 20)
        
        # Look for NFe consultation section or search field
        search_selectors = [
            "input[placeholder*='chave']",
            "input[placeholder*='nota']",
            "input[placeholder*='NFe']",
            "input[name*='chave']",
            "input[id*='chave']",
            "input[type='text']",
            "input[class*='search']"
        ]
        
        search_input = None
        for selector in search_selectors:
            try:
                search_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                print(f"Encontrado campo de busca: {selector}")
                break
            except TimeoutException:
                continue
        
        if not search_input:
            # Try alternative approach - look for any input field
            inputs = driver.find_elements(By.TAG_NAME, "input")
            for inp in inputs:
                if inp.get_attribute("type") in ["text", "search"] and inp.is_displayed():
                    search_input = inp
                    break
        
        if not search_input:
            return {"success": False, "error": "Campo de busca não encontrado no site meudanfe.com.br"}
        
        # Clear and enter the invoice key
        search_input.clear()
        search_input.send_keys(invoice_key)
        
        # Look for search/submit button
        button_selectors = [
            "button[type='submit']",
            "input[type='submit']",
            "button:contains('Buscar')",
            "button:contains('Consultar')",
            "button:contains('Pesquisar')",
            ".btn-search",
            ".search-btn"
        ]
        
        search_button = None
        for selector in button_selectors:
            try:
                search_button = driver.find_element(By.CSS_SELECTOR, selector)
                if search_button.is_displayed():
                    break
            except:
                continue
        
        if search_button:
            search_button.click()
        else:
            # Try pressing Enter
            search_input.send_keys(Keys.RETURN)
        
        # Wait for results
        time.sleep(5)
        
        # Look for download links or XML content
        download_selectors = [
            "a[href*='.xml']",
            "a:contains('Download')",
            "a:contains('XML')",
            "button:contains('Download')",
            ".download-link",
            ".xml-download"
        ]
        
        download_link = None
        for selector in download_selectors:
            try:
                download_link = driver.find_element(By.CSS_SELECTOR, selector)
                if download_link.is_displayed():
                    break
            except:
                continue
        
        if download_link:
            # Click download link
            download_link.click()
            time.sleep(3)
            
            # Check if file was downloaded
            return check_downloaded_xml(invoice_key)
        
        # Alternative: look for embedded XML content
        page_source = driver.page_source
        if invoice_key in page_source and '<?xml' in page_source:
            xml_start = page_source.find('<?xml')
            xml_end = page_source.find('</nfeProc>', xml_start)
            if xml_end == -1:
                xml_end = page_source.find('</NFe>', xml_start)
            
            if xml_end != -1:
                xml_content = page_source[xml_start:xml_end + 10]
                if len(xml_content) > 1000:
                    return {
                        "success": True,
                        "xml_content": xml_content,
                        "message": "XML extraído da página meudanfe.com.br"
                    }
        
        return {"success": False, "error": "XML não encontrado no site meudanfe.com.br"}
        
    except Exception as e:
        print(f"Erro durante automação meudanfe: {e}")
        return {"success": False, "error": f"Erro na automação: {str(e)}"}

def check_downloaded_xml(invoice_key):
    """Check if XML file was downloaded and read its content"""
    download_dir = "/tmp/xml_downloads"
    
    try:
        # Wait for download to complete
        time.sleep(5)
        
        # Look for XML files in download directory
        if os.path.exists(download_dir):
            files = os.listdir(download_dir)
            
            for filename in files:
                if filename.endswith('.xml'):
                    file_path = os.path.join(download_dir, filename)
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            xml_content = f.read()
                        
                        # Verify the XML contains the correct invoice key
                        if invoice_key in xml_content:
                            return {
                                "success": True,
                                "xml_content": xml_content,
                                "message": f"XML baixado via meudanfe.com.br: {filename}"
                            }
                    except Exception as e:
                        print(f"Erro ao ler arquivo {filename}: {e}")
                        continue
        
        return {"success": False, "error": "Arquivo XML não foi baixado ou não contém a chave correta"}
        
    except Exception as e:
        print(f"Erro ao verificar download: {e}")
        return {"success": False, "error": f"Erro ao verificar download: {str(e)}"}

def try_alternative_meudanfe_access(invoice_key):
    """Try alternative methods to access meudanfe data"""
    try:
        # Direct API attempt
        api_urls = [
            f"https://meudanfe.com.br/api/consulta/{invoice_key}",
            f"https://meudanfe.com.br/consulta?chave={invoice_key}",
            f"https://api.meudanfe.com.br/nfe/{invoice_key}"
        ]
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, application/xml, text/xml',
            'Referer': 'https://meudanfe.com.br'
        }
        
        for url in api_urls:
            try:
                response = requests.get(url, headers=headers, timeout=15)
                
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
                                    "message": "XML obtido via API meudanfe.com.br"
                                }
            
            except Exception as e:
                print(f"Erro API {url}: {e}")
                continue
        
        return None
        
    except Exception as e:
        print(f"Erro em métodos alternativos: {e}")
        return None

def get_xml_from_meudanfe(invoice_key):
    """Main function to get XML from meudanfe.com.br"""
    
    # Validate invoice key
    if not invoice_key or len(invoice_key) != 44 or not invoice_key.isdigit():
        return {"success": False, "error": "Chave NFe deve ter 44 dígitos numéricos"}
    
    print(f"Iniciando automação meudanfe.com.br para chave: {invoice_key}")
    
    # Try alternative methods first (faster)
    print("Tentando métodos alternativos...")
    alt_result = try_alternative_meudanfe_access(invoice_key)
    if alt_result and alt_result.get("success"):
        return alt_result
    
    # Setup Chrome driver for web scraping
    driver, download_dir = setup_chrome_driver()
    if not driver:
        return {"success": False, "error": "Erro ao configurar navegador para automação"}
    
    try:
        # Perform web scraping
        result = access_meudanfe_site(driver, invoice_key)
        return result
        
    finally:
        # Always close driver
        try:
            driver.quit()
        except:
            pass
        
        # Clean up download directory
        try:
            if download_dir and os.path.exists(download_dir):
                for file in os.listdir(download_dir):
                    os.remove(os.path.join(download_dir, file))
        except:
            pass

def main():
    """Main entry point"""
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave NFe é obrigatória"}
    else:
        invoice_key = sys.argv[1].strip()
        result = get_xml_from_meudanfe(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()