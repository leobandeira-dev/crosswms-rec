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
    """Setup Chrome specifically for meudanfe.com.br RPA"""
    try:
        options = Options()
        
        # Chrome options for better compatibility with meudanfe.com.br
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("--disable-extensions")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-infobars")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-browser-side-navigation")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-first-run")
        options.add_argument("--no-service-autorun")
        options.add_argument("--no-default-browser-check")
        options.add_argument("--password-store=basic")
        
        # Window size for better element detection
        options.add_argument("--window-size=1366,768")
        
        # User agent to avoid detection
        options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        
        # Download settings
        download_dir = "/tmp/nfe_downloads"
        os.makedirs(download_dir, exist_ok=True)
        
        prefs = {
            "download.default_directory": download_dir,
            "download.prompt_for_download": False,
            "download.directory_upgrade": True,
            "safebrowsing.enabled": True,
            "profile.default_content_setting_values.notifications": 2,
            "profile.default_content_settings.popups": 0
        }
        options.add_experimental_option("prefs", prefs)
        
        # Exclude automation flags
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        # Use ChromeDriverManager for automatic driver management
        service = Service(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service, options=options)
        
        # Execute script to remove webdriver property
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        # Set timeouts
        driver.set_page_load_timeout(30)
        driver.implicitly_wait(5)
        
        return driver, download_dir
        
    except Exception as e:
        print(f"Erro ao configurar Chrome: {e}")
        return None, None

def access_meudanfe_and_search(driver, invoice_key):
    """Access meudanfe.com.br and perform NFe search"""
    try:
        print(f"Acessando meudanfe.com.br para buscar chave: {invoice_key}")
        
        # Navigate to meudanfe.com.br
        driver.get("https://meudanfe.com.br")
        
        # Wait for page to load completely
        wait = WebDriverWait(driver, 20)
        
        # Take screenshot for debugging
        driver.save_screenshot("/tmp/meudanfe_initial.png")
        print("Screenshot inicial salva em /tmp/meudanfe_initial.png")
        
        # Wait a bit for any dynamic content to load
        time.sleep(3)
        
        # Look for search input field - try multiple selectors
        search_selectors = [
            "input[placeholder*='chave']",
            "input[placeholder*='CHAVE']", 
            "input[placeholder*='nota']",
            "input[placeholder*='NFe']",
            "input[placeholder*='consulta']",
            "input[name*='chave']",
            "input[id*='chave']",
            "input[id*='search']",
            "input[type='text']:first-of-type",
            "input[type='search']",
            ".search-input",
            "#search",
            "#chave",
            ".form-control"
        ]
        
        search_input = None
        for selector in search_selectors:
            try:
                search_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                if search_input.is_displayed() and search_input.is_enabled():
                    print(f"Campo de busca encontrado: {selector}")
                    break
            except TimeoutException:
                continue
        
        if not search_input:
            # Try finding any visible text input
            text_inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='text']")
            for inp in text_inputs:
                if inp.is_displayed() and inp.is_enabled():
                    search_input = inp
                    print("Usando primeiro campo de texto visível")
                    break
        
        if not search_input:
            driver.save_screenshot("/tmp/meudanfe_no_input.png")
            return {"success": False, "error": "Campo de busca não encontrado no meudanfe.com.br"}
        
        # Clear and enter the invoice key
        search_input.clear()
        time.sleep(1)
        search_input.send_keys(invoice_key)
        time.sleep(1)
        
        print(f"Chave inserida: {invoice_key}")
        
        # Look for search/submit button
        button_selectors = [
            "button[type='submit']",
            "input[type='submit']",
            "button:contains('Buscar')",
            "button:contains('Consultar')",
            "button:contains('Pesquisar')",
            "button:contains('Search')",
            ".btn-search",
            ".search-btn",
            ".btn-primary",
            "button.btn"
        ]
        
        search_button = None
        for selector in button_selectors:
            try:
                if ":contains" in selector:
                    # Use XPath for text-based selection
                    text_to_find = selector.split("'")[1]
                    xpath_selector = f"//button[contains(text(), '{text_to_find}')]"
                    search_button = driver.find_element(By.XPATH, xpath_selector)
                else:
                    search_button = driver.find_element(By.CSS_SELECTOR, selector)
                
                if search_button.is_displayed() and search_button.is_enabled():
                    print(f"Botão de busca encontrado: {selector}")
                    break
            except:
                continue
        
        # Submit the search
        if search_button:
            try:
                driver.execute_script("arguments[0].click();", search_button)
                print("Busca submetida via JavaScript")
            except:
                search_button.click()
                print("Busca submetida via click")
        else:
            # Try pressing Enter
            search_input.send_keys(Keys.RETURN)
            print("Busca submetida via Enter")
        
        # Wait for results
        time.sleep(5)
        driver.save_screenshot("/tmp/meudanfe_results.png")
        
        # Look for XML download links or content
        download_selectors = [
            "a[href*='.xml']",
            "a[href*='xml']",
            "a[href*='download']",
            "a:contains('Download')",
            "a:contains('XML')",
            "a:contains('Baixar')",
            "button:contains('Download')",
            "button:contains('XML')",
            ".download-link",
            ".xml-link"
        ]
        
        download_element = None
        for selector in download_selectors:
            try:
                if ":contains" in selector:
                    text_to_find = selector.split("'")[1]
                    xpath_selector = f"//a[contains(text(), '{text_to_find}')]"
                    download_element = driver.find_element(By.XPATH, xpath_selector)
                else:
                    download_element = driver.find_element(By.CSS_SELECTOR, selector)
                
                if download_element.is_displayed():
                    print(f"Link de download encontrado: {selector}")
                    break
            except:
                continue
        
        if download_element:
            # Click download
            try:
                driver.execute_script("arguments[0].click();", download_element)
                print("Download iniciado")
                time.sleep(3)
                
                # Check for downloaded file
                return check_downloaded_xml(invoice_key)
            except Exception as e:
                print(f"Erro ao fazer download: {e}")
        
        # Alternative: check page source for embedded XML
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
        
        # Check for error messages or no results
        error_texts = ["não encontrado", "erro", "inválido", "não existe"]
        for error_text in error_texts:
            if error_text in page_source.lower():
                return {
                    "success": False,
                    "error": f"Chave {invoice_key} não encontrada no meudanfe.com.br"
                }
        
        return {
            "success": False,
            "error": "XML não encontrado no meudanfe.com.br - verifique se a chave está correta"
        }
        
    except Exception as e:
        driver.save_screenshot("/tmp/meudanfe_error.png")
        print(f"Erro durante automação: {e}")
        return {"success": False, "error": f"Erro na automação: {str(e)}"}

def check_downloaded_xml(invoice_key):
    """Check if XML was downloaded and read content"""
    download_dir = "/tmp/nfe_downloads"
    
    try:
        # Wait for download
        for i in range(10):  # Wait up to 10 seconds
            if os.path.exists(download_dir):
                files = os.listdir(download_dir)
                xml_files = [f for f in files if f.endswith('.xml')]
                
                if xml_files:
                    # Read the most recent XML file
                    latest_file = max([os.path.join(download_dir, f) for f in xml_files], 
                                    key=os.path.getctime)
                    
                    with open(latest_file, 'r', encoding='utf-8') as f:
                        xml_content = f.read()
                    
                    # Verify it contains our invoice key
                    if invoice_key in xml_content:
                        return {
                            "success": True,
                            "xml_content": xml_content,
                            "message": f"XML baixado do meudanfe.com.br: {os.path.basename(latest_file)}"
                        }
            
            time.sleep(1)
        
        return {"success": False, "error": "XML não foi baixado ou não contém a chave correta"}
        
    except Exception as e:
        return {"success": False, "error": f"Erro ao verificar download: {str(e)}"}

def get_xml_via_chrome_rpa(invoice_key):
    """Main function to get XML using Chrome RPA"""
    
    # Validate invoice key
    is_valid, message = validate_nfe_key(invoice_key)
    if not is_valid:
        return {"success": False, "error": message}
    
    print(f"Iniciando RPA Chrome para meudanfe.com.br: {invoice_key}")
    
    # Setup Chrome driver
    driver, download_dir = setup_chrome_for_rpa()
    if not driver:
        return {"success": False, "error": "Erro ao configurar Chrome para RPA"}
    
    try:
        # Perform the RPA automation
        result = access_meudanfe_and_search(driver, invoice_key)
        return result
        
    finally:
        # Always clean up
        try:
            driver.quit()
        except:
            pass
        
        # Clean download directory
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
        result = get_xml_via_chrome_rpa(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()