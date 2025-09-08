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

def create_driver():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    return webdriver.Chrome(options=options)

def fetch_xml_from_meudanfe(chave_nfe):
    # Validate input
    if not chave_nfe or len(chave_nfe) != 44:
        return {"success": False, "error": "Chave deve ter 44 dígitos"}
    
    driver = None
    try:
        driver = create_driver()
        driver.set_page_load_timeout(30)
        
        # Navigate to meudanfe.com.br
        driver.get("https://meudanfe.com.br/")
        wait = WebDriverWait(driver, 15)
        
        # Find input field for NFe key
        input_field = wait.until(
            EC.presence_of_element_located((By.XPATH, "//input[@placeholder and contains(@placeholder, 'CHAVE')]"))
        )
        
        # Clear and enter the NFe key
        input_field.clear()
        input_field.send_keys(chave_nfe)
        
        # Find and click search button
        search_button = wait.until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Buscar') or contains(text(), 'BUSCAR')]"))
        )
        search_button.click()
        
        # Wait for results
        time.sleep(5)
        
        # Look for XML download link
        xml_links = driver.find_elements(By.XPATH, "//a[contains(@href, '.xml') or contains(text(), 'XML')]")
        
        if xml_links:
            xml_url = xml_links[0].get_attribute('href')
            
            if xml_url:
                # Download XML using requests
                response = requests.get(xml_url, timeout=30)
                
                if response.status_code == 200:
                    xml_content = response.text
                    
                    # Validate XML content
                    if xml_content and '<?xml' in xml_content and len(xml_content) > 500:
                        return {
                            "success": True,
                            "xml_content": xml_content,
                            "message": "XML baixado com sucesso via automação RPA!"
                        }
                    else:
                        return {"success": False, "error": "XML baixado está inválido ou vazio"}
                else:
                    return {"success": False, "error": f"Erro HTTP {response.status_code} ao baixar XML"}
            else:
                return {"success": False, "error": "URL do XML não encontrada"}
        else:
            # Check for error messages on the page
            error_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'não encontrado') or contains(text(), 'inválida') or contains(text(), 'erro')]")
            
            if error_elements:
                error_text = error_elements[0].text
                return {"success": False, "error": f"Erro no site: {error_text}"}
            else:
                return {"success": False, "error": "XML não encontrado no resultado da busca"}
    
    except TimeoutException:
        return {"success": False, "error": "Timeout - Site não respondeu no tempo esperado"}
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
        result = {"success": False, "error": "Chave NFe é obrigatória"}
    else:
        chave_nfe = sys.argv[1].strip()
        result = fetch_xml_from_meudanfe(chave_nfe)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()