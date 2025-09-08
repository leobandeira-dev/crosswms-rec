#!/usr/bin/env python3
import sys
import json
import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def setup_chrome():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    return webdriver.Chrome(options=options)

def extract_xml_meudanfe(invoice_key):
    if not invoice_key or len(invoice_key) != 44:
        return {"success": False, "error": "Chave deve ter 44 dígitos"}
    
    driver = None
    try:
        driver = setup_chrome()
        driver.set_page_load_timeout(25)
        
        # Access meudanfe.com.br
        driver.get("https://meudanfe.com.br/")
        wait = WebDriverWait(driver, 12)
        
        # Multiple attempts to find input field
        input_selectors = [
            "//input[contains(@placeholder, 'CHAVE')]",
            "//input[contains(@placeholder, 'chave')]",
            "//input[@type='text']",
            "//input[contains(@class, 'form-control')]"
        ]
        
        input_element = None
        for selector in input_selectors:
            try:
                input_element = wait.until(EC.presence_of_element_located((By.XPATH, selector)))
                break
            except TimeoutException:
                continue
        
        if not input_element:
            return {"success": False, "error": "Campo de entrada não localizado"}
        
        # Enter invoice key and verify it was entered correctly
        input_element.clear()
        time.sleep(0.5)
        input_element.send_keys(invoice_key)
        time.sleep(1)
        
        # Verify the key was entered correctly
        entered_value = input_element.get_attribute('value')
        if entered_value != invoice_key:
            print(f"Warning: Entered value '{entered_value}' doesn't match invoice key '{invoice_key}'")
            input_element.clear()
            time.sleep(0.5)
            input_element.send_keys(invoice_key)
            time.sleep(1)
        
        # Find search button with multiple strategies
        search_selectors = [
            "//button[contains(text(), 'Buscar')]",
            "//button[contains(text(), 'BUSCAR')]",
            "//input[@type='submit']",
            "//button[@type='submit']",
            "//button[contains(@class, 'btn')]"
        ]
        
        search_button = None
        for selector in search_selectors:
            try:
                search_button = driver.find_element(By.XPATH, selector)
                if search_button.is_enabled():
                    break
            except NoSuchElementException:
                continue
        
        if not search_button:
            return {"success": False, "error": "Botão de busca não encontrado"}
        
        # Click search and wait for results
        search_button.click()
        print(f"Search initiated for invoice key: {invoice_key}")
        time.sleep(6)  # Give more time for the search to complete
        
        # Wait for results to load - look for indicators that search completed
        try:
            # Wait for either results or error messages
            WebDriverWait(driver, 10).until(
                lambda d: len(d.find_elements(By.XPATH, "//*[contains(text(), 'XML') or contains(text(), 'xml') or contains(text(), 'Erro') or contains(text(), 'erro')]")) > 0
            )
        except TimeoutException:
            print("Timeout waiting for search results")
        
        # Multiple strategies to find XML content
        xml_strategies = [
            # Direct XML download links
            "//a[contains(@href, '.xml')]",
            "//a[contains(text(), 'XML')]",
            "//a[contains(text(), 'xml')]",
            "//a[contains(@href, 'xml')]",
            # Buttons for XML download
            "//button[contains(text(), 'XML')]",
            "//button[contains(text(), 'xml')]",
            "//input[@value='XML']",
            # XML content in page elements
            "//pre[contains(text(), '<?xml')]",
            "//textarea[contains(text(), '<?xml')]",
            "//div[contains(text(), '<?xml')]",
            # Generic download links
            "//a[contains(@href, 'download')]",
            "//button[contains(text(), 'Download')]",
            "//a[contains(@class, 'download')]"
        ]
        
        xml_content = None
        download_url = None
        
        for strategy in xml_strategies:
            try:
                elements = driver.find_elements(By.XPATH, strategy)
                for element in elements:
                    # Try to get download URL
                    href = element.get_attribute('href')
                    if href and ('.xml' in href.lower() or 'xml' in href.lower()):
                        download_url = href
                        break
                    
                    # Try to get XML content directly
                    text_content = element.text or element.get_attribute('value') or ''
                    if '<?xml' in text_content and len(text_content) > 200:
                        xml_content = text_content
                        break
                
                if xml_content or download_url:
                    break
                    
            except Exception:
                continue
        
        # Download XML if URL found
        if download_url:
            try:
                response = requests.get(download_url, timeout=20, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                })
                if response.status_code == 200 and response.text:
                    xml_content = response.text
            except Exception:
                pass
        
        # If no XML found via automation, try additional strategies
        if not xml_content:
            print(f"No XML found via standard methods, trying additional approaches for key: {invoice_key}")
            
            # Try searching for the specific invoice key in the page
            try:
                # Look for elements containing parts of the invoice key
                key_patterns = [
                    f"//text()[contains(., '{invoice_key[:20]}')]",
                    f"//text()[contains(., '{invoice_key[-20:]}')]",
                    f"//*[contains(text(), '{invoice_key[:15]}')]",
                    f"//*[contains(@value, '{invoice_key[:15]}')]"
                ]
                
                for pattern in key_patterns:
                    try:
                        elements = driver.find_elements(By.XPATH, pattern)
                        if elements:
                            print(f"Found {len(elements)} elements matching key pattern")
                            # Check if any contain XML-like content
                            for element in elements:
                                parent_text = element.get_attribute('outerHTML') or element.text or ''
                                if '<?xml' in parent_text and len(parent_text) > 500:
                                    xml_content = parent_text
                                    break
                        if xml_content:
                            break
                    except Exception:
                        continue
                        
            except Exception as e:
                print(f"Error in additional search strategies: {e}")
            
            # Try looking at page source for embedded XML
            if not xml_content:
                try:
                    page_source = driver.page_source
                    if invoice_key in page_source and '<?xml' in page_source:
                        # Try to extract XML from page source
                        xml_start = page_source.find('<?xml')
                        if xml_start != -1:
                            xml_end = page_source.find('</nfeProc>', xml_start)
                            if xml_end != -1:
                                xml_content = page_source[xml_start:xml_end + 10]
                except Exception:
                    pass
        
        # Validate that XML contains the correct invoice key before returning
        if xml_content and '<?xml' in xml_content and len(xml_content) > 300:
            # Critical validation: ensure the XML contains the exact invoice key
            if invoice_key in xml_content:
                print(f"✅ XML validation successful: Found invoice key {invoice_key} in XML content")
                return {
                    "success": True,
                    "xml_content": xml_content,
                    "message": "XML baixado com sucesso via automação RPA!"
                }
            else:
                print(f"❌ XML validation failed: Invoice key {invoice_key} not found in XML content")
                # Check if XML contains a different invoice key
                import re
                found_keys = re.findall(r'\d{44}', xml_content)
                if found_keys:
                    print(f"❌ XML contains different invoice key(s): {found_keys}")
                return {"success": False, "error": f"XML encontrado não corresponde à chave {invoice_key}"}
        
        return {"success": False, "error": "Nenhum XML válido encontrado para a chave informada"}
        
    except TimeoutException:
        return {"success": False, "error": "Timeout - Site demorou para responder"}
    except Exception as e:
        return {"success": False, "error": f"Erro na automação: {str(e)}"}
    finally:
        if driver:
            try:
                driver.quit()
            except:
                pass

def main():
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave NFe obrigatória"}
    else:
        invoice_key = sys.argv[1].strip()
        result = extract_xml_meudanfe(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()