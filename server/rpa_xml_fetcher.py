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

def get_chrome_driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    return webdriver.Chrome(options=options)

def extract_xml_from_meudanfe(invoice_key):
    if not invoice_key or len(invoice_key) != 44:
        return {"success": False, "error": "Chave deve ter 44 dígitos"}
    
    driver = None
    try:
        driver = get_chrome_driver()
        driver.set_page_load_timeout(20)
        
        # Access meudanfe.com.br
        driver.get("https://meudanfe.com.br/")
        wait = WebDriverWait(driver, 10)
        
        # Find and fill the input field
        input_selectors = [
            "input[placeholder*='CHAVE DE ACESSO']",
            "input[placeholder*='chave']",
            "input[type='text']"
        ]
        
        input_element = None
        for selector in input_selectors:
            try:
                input_element = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                break
            except TimeoutException:
                continue
        
        if not input_element:
            return {"success": False, "error": "Campo de entrada não encontrado"}
        
        input_element.clear()
        input_element.send_keys(invoice_key)
        
        # Find and click search button
        search_button = None
        try:
            search_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Buscar') or contains(text(), 'BUSCAR')]")
        except NoSuchElementException:
            try:
                search_button = driver.find_element(By.CSS_SELECTOR, "input[type='submit']")
            except NoSuchElementException:
                try:
                    search_button = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
                except NoSuchElementException:
                    pass
        
        if not search_button:
            # Try XPath approach
            try:
                search_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Buscar') or contains(text(), 'BUSCAR')]")
            except NoSuchElementException:
                return {"success": False, "error": "Botão de busca não encontrado"}
        
        search_button.click()
        time.sleep(3)
        
        # Look for XML download links
        xml_link = None
        try:
            xml_link = driver.find_element(By.CSS_SELECTOR, "a[href*='xml']")
        except NoSuchElementException:
            try:
                xml_link = driver.find_element(By.XPATH, "//a[contains(@href, 'xml') or contains(text(), 'XML')]")
            except NoSuchElementException:
                try:
                    xml_link = driver.find_element(By.XPATH, "//button[contains(text(), 'XML')]")
                except NoSuchElementException:
                    pass
        
        if not xml_link:
            try:
                xml_link = driver.find_element(By.XPATH, "//a[contains(@href, 'xml') or contains(text(), 'XML')]")
            except NoSuchElementException:
                pass
        
        if xml_link:
            href = xml_link.get_attribute('href')
            if href:
                # Download XML using requests
                try:
                    response = requests.get(href, timeout=15)
                    if response.status_code == 200 and response.text.strip():
                        xml_content = response.text
                        if '<?xml' in xml_content:
                            return {
                                "success": True,
                                "xml_content": xml_content,
                                "message": "XML obtido com sucesso"
                            }
                except requests.RequestException:
                    pass
            
            # Try clicking the link
            try:
                xml_link.click()
                time.sleep(2)
                
                # Check if XML content appeared on page
                xml_elements = driver.find_elements(By.XPATH, "//pre | //textarea | //*[contains(text(), '<?xml')]")
                for element in xml_elements:
                    content = element.text or element.get_attribute('value') or ''
                    if '<?xml' in content and len(content) > 100:
                        return {
                            "success": True,
                            "xml_content": content,
                            "message": "XML extraído da página"
                        }
            except Exception:
                pass
        
        # Check for error messages
        error_selectors = [
            "//*[contains(text(), 'não encontrado')]",
            "//*[contains(text(), 'inválida')]",
            "//*[contains(text(), 'erro')]"
        ]
        
        for selector in error_selectors:
            try:
                error_element = driver.find_element(By.XPATH, selector)
                if error_element.text:
                    return {"success": False, "error": f"Site retornou: {error_element.text}"}
            except NoSuchElementException:
                continue
        
        return {"success": False, "error": "XML não encontrado no resultado da busca"}
        
    except TimeoutException:
        return {"success": False, "error": "Timeout ao acessar o site"}
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
        result = {"success": False, "error": "Parâmetro de chave requerido"}
    else:
        invoice_key = sys.argv[1].strip()
        result = extract_xml_from_meudanfe(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()