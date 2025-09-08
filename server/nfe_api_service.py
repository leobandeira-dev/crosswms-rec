#!/usr/bin/env python3
import sys
import json
import requests
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException

def setup_chrome():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    return webdriver.Chrome(options=options)

def fetch_xml_via_api(invoice_key):
    """Try to fetch XML via alternative APIs"""
    if not invoice_key or len(invoice_key) != 44:
        return {"success": False, "error": "Chave deve ter 44 dígitos"}
    
    # Try multiple API endpoints for NFe consultation
    api_endpoints = [
        f"https://api.focusnfe.com.br/v2/nfe/{invoice_key}.xml",
        f"https://webmaniabr.com/api/1/nfe/consulta/?chave={invoice_key}",
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/xml, text/xml, */*'
    }
    
    for endpoint in api_endpoints:
        try:
            response = requests.get(endpoint, headers=headers, timeout=15)
            if response.status_code == 200 and response.text:
                content = response.text
                # Validate that this is XML content and contains the invoice key
                if '<?xml' in content and invoice_key in content:
                    return {
                        "success": True,
                        "xml_content": content,
                        "message": "XML obtido via API de consulta"
                    }
        except Exception as e:
            print(f"API endpoint {endpoint} failed: {e}")
            continue
    
    return None

def fetch_xml_improved_rpa(invoice_key):
    """Improved RPA with faster timeout and better error handling"""
    driver = None
    try:
        driver = setup_chrome()
        driver.set_page_load_timeout(15)  # Reduced timeout
        
        # Try meudanfe.com.br with improved strategy
        print(f"Accessing meudanfe.com.br for key: {invoice_key}")
        driver.get("https://meudanfe.com.br/")
        
        wait = WebDriverWait(driver, 8)  # Reduced wait time
        
        # Find input field quickly
        input_element = None
        input_selectors = [
            "input[placeholder*='CHAVE']",
            "input[placeholder*='chave']", 
            "input[type='text']",
            "#chave",
            ".form-control"
        ]
        
        for selector in input_selectors:
            try:
                input_element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                break
            except TimeoutException:
                continue
        
        if not input_element:
            return {"success": False, "error": "Campo de entrada não encontrado rapidamente"}
        
        # Enter key and search
        input_element.clear()
        input_element.send_keys(invoice_key)
        time.sleep(0.5)
        
        # Find and click search button
        search_button = None
        search_selectors = [
            "button:contains('Buscar')",
            "input[type='submit']",
            "button[type='submit']",
            ".btn-primary"
        ]
        
        for selector in search_selectors:
            try:
                if 'contains' in selector:
                    search_button = driver.find_element(By.XPATH, f"//button[contains(text(), 'Buscar')]")
                else:
                    search_button = driver.find_element(By.CSS_SELECTOR, selector)
                if search_button and search_button.is_enabled():
                    break
            except:
                continue
        
        if search_button:
            search_button.click()
            time.sleep(3)
            
            # Quick search for XML content
            xml_elements = driver.find_elements(By.XPATH, "//*[contains(text(), '<?xml')]")
            for element in xml_elements:
                content = element.text or element.get_attribute('value') or ''
                if len(content) > 500 and invoice_key in content:
                    return {
                        "success": True,
                        "xml_content": content,
                        "message": "XML obtido via RPA melhorado"
                    }
        
        return {"success": False, "error": "XML não encontrado no tempo esperado"}
        
    except Exception as e:
        return {"success": False, "error": f"Erro no RPA: {str(e)}"}
    finally:
        if driver:
            try:
                driver.quit()
            except:
                pass

def get_nfe_xml(invoice_key):
    """Main function that tries multiple methods to get NFe XML"""
    if not invoice_key or len(invoice_key) != 44:
        return {"success": False, "error": "Chave da NFe deve ter 44 dígitos"}
    
    print(f"Buscando XML para chave: {invoice_key}")
    
    # Method 1: Try API services first (faster)
    print("Tentando via APIs de consulta...")
    api_result = fetch_xml_via_api(invoice_key)
    if api_result and api_result.get("success"):
        return api_result
    
    # Method 2: Try improved RPA
    print("Tentando via RPA melhorado...")
    rpa_result = fetch_xml_improved_rpa(invoice_key)
    if rpa_result and rpa_result.get("success"):
        return rpa_result
    
    # If all methods fail
    return {
        "success": False, 
        "error": f"Não foi possível obter o XML da chave {invoice_key}. Verifique se a chave está correta e se a nota fiscal existe."
    }

def main():
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave NFe obrigatória"}
    else:
        invoice_key = sys.argv[1].strip()
        result = get_nfe_xml(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()