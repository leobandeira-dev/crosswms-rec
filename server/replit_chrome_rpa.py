#!/usr/bin/env python3
import sys
import json
import time
import os
import subprocess
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def validate_nfe_key(invoice_key):
    """Validate NFe key format"""
    if not invoice_key or len(invoice_key) != 44:
        return False, "Chave deve ter 44 dígitos"
    if not invoice_key.isdigit():
        return False, "Chave deve conter apenas números"
    return True, "Chave válida"

def setup_replit_chrome():
    """Setup Chrome for Replit environment"""
    try:
        options = Options()
        
        # Essential options for Replit
        options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--disable-extensions")
        options.add_argument("--disable-plugins")
        options.add_argument("--disable-images")
        options.add_argument("--disable-javascript")
        options.add_argument("--window-size=1366,768")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        # Use system Chromium
        chromium_path = "/nix/store/zi4f80l169xlmivz8vja8wlphq74qqk0-chromium-125.0.6422.141/bin/chromium-browser"
        options.binary_location = chromium_path
        
        # Download settings
        download_dir = "/tmp/xml_downloads"
        os.makedirs(download_dir, exist_ok=True)
        
        prefs = {
            "download.default_directory": download_dir,
            "download.prompt_for_download": False,
            "download.directory_upgrade": True
        }
        options.add_experimental_option("prefs", prefs)
        
        # Try to use existing chromedriver or download one
        chromedriver_path = None
        
        # Check if chromedriver exists in common locations
        possible_paths = [
            "/usr/bin/chromedriver",
            "/usr/local/bin/chromedriver",
            "./chromedriver"
        ]
        
        for path in possible_paths:
            if os.path.exists(path) and os.access(path, os.X_OK):
                chromedriver_path = path
                break
        
        if not chromedriver_path:
            # Try to download chromedriver for this version
            try:
                from webdriver_manager.chrome import ChromeDriverManager
                chromedriver_path = ChromeDriverManager().install()
            except Exception:
                # Fallback: try to use a specific version
                chromedriver_path = "/usr/bin/chromedriver"
        
        # Create service
        service = Service(chromedriver_path)
        
        # Create driver
        driver = webdriver.Chrome(service=service, options=options)
        
        # Set timeouts
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(5)
        
        return driver, download_dir
        
    except Exception as e:
        print(f"Erro ao configurar Chrome: {e}")
        return None, None

def execute_meudanfe_rpa(driver, invoice_key):
    """Execute RPA automation on meudanfe.com.br"""
    try:
        print(f"Acessando meudanfe.com.br para chave: {invoice_key}")
        
        # Navigate to the site
        driver.get("https://meudanfe.com.br")
        
        # Wait for page load
        wait = WebDriverWait(driver, 15)
        time.sleep(3)
        
        # Try to find search input
        search_input = None
        
        # Multiple selectors to try
        input_selectors = [
            "input[type='text']",
            "input[placeholder*='chave']",
            "input[placeholder*='nota']",
            "input[name*='chave']",
            "input[id*='chave']",
            ".form-control",
            "#search",
            "#chave"
        ]
        
        for selector in input_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    if element.is_displayed() and element.is_enabled():
                        search_input = element
                        print(f"Campo encontrado com seletor: {selector}")
                        break
                if search_input:
                    break
            except Exception:
                continue
        
        if not search_input:
            return {"success": False, "error": "Campo de busca não encontrado no meudanfe.com.br"}
        
        # Enter the invoice key
        search_input.clear()
        time.sleep(0.5)
        search_input.send_keys(invoice_key)
        time.sleep(0.5)
        
        print(f"Chave inserida: {invoice_key}")
        
        # Try to find and click search button
        search_button = None
        
        button_selectors = [
            "button[type='submit']",
            "input[type='submit']",
            "button.btn",
            ".btn-primary",
            ".search-btn"
        ]
        
        for selector in button_selectors:
            try:
                buttons = driver.find_elements(By.CSS_SELECTOR, selector)
                for button in buttons:
                    if button.is_displayed() and button.is_enabled():
                        search_button = button
                        break
                if search_button:
                    break
            except Exception:
                continue
        
        # Try text-based button search
        if not search_button:
            button_texts = ["Buscar", "Consultar", "Pesquisar"]
            for text in button_texts:
                try:
                    xpath = f"//button[contains(text(), '{text}')]"
                    button = driver.find_element(By.XPATH, xpath)
                    if button.is_displayed():
                        search_button = button
                        break
                except Exception:
                    continue
        
        # Submit the search
        if search_button:
            try:
                driver.execute_script("arguments[0].click();", search_button)
                print("Busca enviada via JavaScript")
            except Exception:
                search_button.click()
                print("Busca enviada via click")
        else:
            search_input.send_keys(Keys.RETURN)
            print("Busca enviada via Enter")
        
        # Wait for results
        time.sleep(5)
        
        # Look for XML or download links
        download_link = None
        
        download_selectors = [
            "a[href*='.xml']",
            "a[href*='xml']",
            "a[href*='download']"
        ]
        
        for selector in download_selectors:
            try:
                links = driver.find_elements(By.CSS_SELECTOR, selector)
                for link in links:
                    if link.is_displayed():
                        download_link = link
                        break
                if download_link:
                    break
            except Exception:
                continue
        
        # Try text-based download links
        if not download_link:
            download_texts = ["Download", "XML", "Baixar"]
            for text in download_texts:
                try:
                    xpath = f"//a[contains(text(), '{text}')]"
                    link = driver.find_element(By.XPATH, xpath)
                    if link.is_displayed():
                        download_link = link
                        break
                except Exception:
                    continue
        
        if download_link:
            try:
                driver.execute_script("arguments[0].click();", download_link)
                print("Download iniciado")
                time.sleep(3)
                return check_xml_download(invoice_key)
            except Exception as e:
                print(f"Erro ao fazer download: {e}")
        
        # Check page source for embedded XML
        page_source = driver.page_source
        if invoice_key in page_source and '<?xml' in page_source:
            xml_start = page_source.find('<?xml')
            xml_end = page_source.find('</nfeProc>', xml_start)
            if xml_end == -1:
                xml_end = page_source.find('</NFe>', xml_start)
            
            if xml_end != -1:
                xml_content = page_source[xml_start:xml_end + 10]
                if len(xml_content) > 500:
                    return {
                        "success": True,
                        "xml_content": xml_content,
                        "message": "XML extraído da página meudanfe.com.br"
                    }
        
        return {"success": False, "error": "Não foi possível obter o XML da nota fiscal no meudanfe.com.br"}
        
    except Exception as e:
        print(f"Erro durante automação: {e}")
        return {"success": False, "error": f"Erro na automação: {str(e)}"}

def check_xml_download(invoice_key):
    """Check if XML file was downloaded"""
    download_dir = "/tmp/xml_downloads"
    
    try:
        for i in range(8):  # Wait up to 8 seconds
            if os.path.exists(download_dir):
                files = os.listdir(download_dir)
                xml_files = [f for f in files if f.endswith('.xml')]
                
                if xml_files:
                    # Get the newest file
                    latest_file = max([os.path.join(download_dir, f) for f in xml_files], 
                                    key=os.path.getctime)
                    
                    with open(latest_file, 'r', encoding='utf-8') as f:
                        xml_content = f.read()
                    
                    # Verify it contains our invoice key
                    if invoice_key in xml_content:
                        return {
                            "success": True,
                            "xml_content": xml_content,
                            "message": f"XML baixado: {os.path.basename(latest_file)}"
                        }
            
            time.sleep(1)
        
        return {"success": False, "error": "Download não completado ou arquivo não contém chave correta"}
        
    except Exception as e:
        return {"success": False, "error": f"Erro ao verificar download: {str(e)}"}

def run_rpa_automation(invoice_key):
    """Main RPA function"""
    
    # Validate key
    is_valid, message = validate_nfe_key(invoice_key)
    if not is_valid:
        return {"success": False, "error": message}
    
    print(f"Iniciando RPA para meudanfe.com.br: {invoice_key}")
    
    # Setup Chrome
    driver, download_dir = setup_replit_chrome()
    if not driver:
        return {"success": False, "error": "Não foi possível configurar o navegador para automação"}
    
    try:
        result = execute_meudanfe_rpa(driver, invoice_key)
        return result
        
    finally:
        # Cleanup
        try:
            driver.quit()
        except Exception:
            pass
        
        # Clean download directory
        try:
            if download_dir and os.path.exists(download_dir):
                for file in os.listdir(download_dir):
                    file_path = os.path.join(download_dir, file)
                    if os.path.isfile(file_path):
                        os.remove(file_path)
        except Exception:
            pass

def main():
    """Entry point"""
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave NFe é obrigatória"}
    else:
        invoice_key = sys.argv[1].strip()
        result = run_rpa_automation(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()