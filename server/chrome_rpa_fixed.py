#!/usr/bin/env python3
import sys
import json
import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.keys import Keys
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager

def validate_nfe_key(invoice_key):
    """Validate NFe key format"""
    if not invoice_key or len(invoice_key) != 44:
        return False, "Chave deve ter 44 dígitos"
    if not invoice_key.isdigit():
        return False, "Chave deve conter apenas números"
    return True, "Chave válida"

def setup_chrome_for_rpa():
    """Setup Chrome specifically optimized for RPA"""
    try:
        options = Options()
        
        # Basic Chrome options for RPA
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("--disable-extensions")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-infobars")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1366,768")
        
        # User agent
        options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        # Download settings
        download_dir = "/tmp/nfe_downloads"
        os.makedirs(download_dir, exist_ok=True)
        
        prefs = {
            "download.default_directory": download_dir,
            "download.prompt_for_download": False,
            "download.directory_upgrade": True
        }
        options.add_experimental_option("prefs", prefs)
        
        # Anti-detection
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        # Use ChromeDriverManager
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        
        # Remove webdriver property
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(5)
        
        return driver, download_dir
        
    except Exception as e:
        print(f"Erro ao configurar Chrome: {e}")
        return None, None

def perform_meudanfe_automation(driver, invoice_key):
    """Execute the RPA automation on meudanfe.com.br"""
    try:
        print(f"Navegando para meudanfe.com.br com chave: {invoice_key}")
        
        driver.get("https://meudanfe.com.br")
        wait = WebDriverWait(driver, 20)
        
        # Wait for page load
        time.sleep(3)
        
        # Find search input field
        search_input = None
        search_selectors = [
            "input[placeholder*='chave' i]",
            "input[placeholder*='nota' i]", 
            "input[name*='chave' i]",
            "input[id*='chave' i]",
            "input[type='text']",
            "input[type='search']"
        ]
        
        for selector in search_selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                for element in elements:
                    if element.is_displayed() and element.is_enabled():
                        search_input = element
                        print(f"Campo encontrado: {selector}")
                        break
                if search_input:
                    break
            except Exception:
                continue
        
        if not search_input:
            return {"success": False, "error": "Campo de busca não encontrado"}
        
        # Enter the invoice key
        search_input.clear()
        time.sleep(1)
        search_input.send_keys(invoice_key)
        time.sleep(1)
        
        # Find and click search button
        search_button = None
        button_selectors = [
            "button[type='submit']",
            "input[type='submit']",
            "button.btn-primary",
            "button.btn",
            ".search-btn"
        ]
        
        # Also try text-based buttons
        button_texts = ["Buscar", "Consultar", "Pesquisar", "Search"]
        
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
            for text in button_texts:
                try:
                    xpath = f"//button[contains(text(), '{text}')]"
                    button = driver.find_element(By.XPATH, xpath)
                    if button.is_displayed() and button.is_enabled():
                        search_button = button
                        break
                except Exception:
                    continue
        
        # Submit search
        if search_button:
            try:
                driver.execute_script("arguments[0].click();", search_button)
            except Exception:
                search_button.click()
        else:
            search_input.send_keys(Keys.RETURN)
        
        # Wait for results
        time.sleep(5)
        
        # Look for XML download options
        download_found = False
        download_selectors = [
            "a[href*='.xml']",
            "a[href*='xml']",
            "a[href*='download']"
        ]
        
        download_texts = ["Download", "XML", "Baixar"]
        
        # Check CSS selectors
        for selector in download_selectors:
            try:
                links = driver.find_elements(By.CSS_SELECTOR, selector)
                for link in links:
                    if link.is_displayed():
                        driver.execute_script("arguments[0].click();", link)
                        download_found = True
                        break
                if download_found:
                    break
            except Exception:
                continue
        
        # Check text-based links
        if not download_found:
            for text in download_texts:
                try:
                    xpath = f"//a[contains(text(), '{text}')]"
                    link = driver.find_element(By.XPATH, xpath)
                    if link.is_displayed():
                        driver.execute_script("arguments[0].click();", link)
                        download_found = True
                        break
                except Exception:
                    continue
        
        if download_found:
            time.sleep(3)
            return check_download_result(invoice_key)
        
        # Check page source for embedded XML
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
                        "message": "XML extraído da página"
                    }
        
        return {"success": False, "error": "XML não encontrado na página"}
        
    except Exception as e:
        print(f"Erro na automação: {e}")
        return {"success": False, "error": f"Erro na automação: {str(e)}"}

def check_download_result(invoice_key):
    """Check if XML was downloaded successfully"""
    download_dir = "/tmp/nfe_downloads"
    
    try:
        for i in range(10):
            if os.path.exists(download_dir):
                files = os.listdir(download_dir)
                xml_files = [f for f in files if f.endswith('.xml')]
                
                if xml_files:
                    latest_file = max([os.path.join(download_dir, f) for f in xml_files], 
                                    key=os.path.getctime)
                    
                    with open(latest_file, 'r', encoding='utf-8') as f:
                        xml_content = f.read()
                    
                    if invoice_key in xml_content:
                        return {
                            "success": True,
                            "xml_content": xml_content,
                            "message": f"XML baixado: {os.path.basename(latest_file)}"
                        }
            
            time.sleep(1)
        
        return {"success": False, "error": "Download não completado"}
        
    except Exception as e:
        return {"success": False, "error": f"Erro no download: {str(e)}"}

def execute_chrome_rpa(invoice_key):
    """Main RPA execution function"""
    
    # Validate key
    is_valid, message = validate_nfe_key(invoice_key)
    if not is_valid:
        return {"success": False, "error": message}
    
    print(f"Iniciando RPA Chrome para: {invoice_key}")
    
    # Setup Chrome
    driver, download_dir = setup_chrome_for_rpa()
    if not driver:
        return {"success": False, "error": "Erro ao configurar Chrome"}
    
    try:
        result = perform_meudanfe_automation(driver, invoice_key)
        return result
        
    finally:
        try:
            driver.quit()
        except Exception:
            pass
        
        # Cleanup downloads
        try:
            if download_dir and os.path.exists(download_dir):
                for file in os.listdir(download_dir):
                    os.remove(os.path.join(download_dir, file))
        except Exception:
            pass

def main():
    """Entry point"""
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave NFe obrigatória"}
    else:
        invoice_key = sys.argv[1].strip()
        result = execute_chrome_rpa(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()