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
import re

def setup_chrome():
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
    return webdriver.Chrome(options=options)

def get_uf_from_key(invoice_key):
    """Extract UF from NFe key"""
    uf_map = {
        '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
        '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL',
        '28': 'SE', '29': 'BA', '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP', '41': 'PR',
        '42': 'SC', '43': 'RS', '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF'
    }
    return uf_map.get(invoice_key[:2], 'SP')

def try_portal_nfe(invoice_key):
    """Try Portal Nacional da NFe"""
    driver = None
    try:
        driver = setup_chrome()
        driver.set_page_load_timeout(20)
        
        print(f"Accessing Portal Nacional da NFe for key: {invoice_key}")
        driver.get("https://www.nfe.fazenda.gov.br/portal/consulta.aspx")
        
        wait = WebDriverWait(driver, 15)
        
        # Find and fill the invoice key field
        key_input = wait.until(EC.presence_of_element_located((By.ID, "ctl00_ContentPlaceHolder1_txtChaveAcesso")))
        key_input.clear()
        key_input.send_keys(invoice_key)
        
        # Click search button
        search_button = driver.find_element(By.ID, "ctl00_ContentPlaceHolder1_btnConsultar")
        search_button.click()
        
        time.sleep(5)
        
        # Look for XML download link or content
        xml_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'XML') or contains(@href, '.xml')]")
        
        for element in xml_elements:
            href = element.get_attribute('href')
            if href and '.xml' in href:
                # Download the XML
                response = requests.get(href, timeout=15)
                if response.status_code == 200 and invoice_key in response.text:
                    return response.text
        
        # Check page source for embedded XML
        page_source = driver.page_source
        if invoice_key in page_source and '<?xml' in page_source:
            xml_start = page_source.find('<?xml')
            xml_end = page_source.find('</nfeProc>', xml_start)
            if xml_end != -1:
                return page_source[xml_start:xml_end + 10]
        
    except Exception as e:
        print(f"Portal NFe error: {e}")
    finally:
        if driver:
            driver.quit()
    
    return None

def try_sefaz_portal(invoice_key):
    """Try state SEFAZ portal based on UF"""
    uf = get_uf_from_key(invoice_key)
    
    sefaz_portals = {
        'SP': 'https://www.nfce.fazenda.sp.gov.br/NFCeConsultaPublica/Paginas/ConsultaQRCode.aspx',
        'RJ': 'https://www.fazenda.rj.gov.br/nfce/consulta',
        'MG': 'https://portalsefaz.fazenda.mg.gov.br/portalnfce/',
        'RS': 'https://www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx'
    }
    
    portal_url = sefaz_portals.get(uf)
    if not portal_url:
        return None
    
    driver = None
    try:
        driver = setup_chrome()
        driver.set_page_load_timeout(15)
        
        print(f"Accessing SEFAZ {uf} portal for key: {invoice_key}")
        driver.get(portal_url)
        
        wait = WebDriverWait(driver, 10)
        
        # Look for input fields for NFe key
        input_selectors = [
            "input[name*='chave']",
            "input[id*='chave']",
            "input[placeholder*='chave']",
            "input[type='text']"
        ]
        
        key_input = None
        for selector in input_selectors:
            try:
                key_input = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, selector)))
                break
            except:
                continue
        
        if key_input:
            key_input.clear()
            key_input.send_keys(invoice_key)
            
            # Find and click search button
            search_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Consultar') or contains(text(), 'Buscar')] | //input[@type='submit']")
            
            if search_buttons:
                search_buttons[0].click()
                time.sleep(5)
                
                # Look for XML content
                page_source = driver.page_source
                if invoice_key in page_source and '<?xml' in page_source:
                    xml_start = page_source.find('<?xml')
                    xml_end = page_source.find('</nfeProc>', xml_start)
                    if xml_end != -1:
                        return page_source[xml_start:xml_end + 10]
    
    except Exception as e:
        print(f"SEFAZ {uf} portal error: {e}")
    finally:
        if driver:
            driver.quit()
    
    return None

def try_direct_api_calls(invoice_key):
    """Try direct API calls to webservices"""
    uf = get_uf_from_key(invoice_key)
    
    # SEFAZ webservice URLs
    webservice_urls = {
        'SP': 'https://nfe.fazenda.sp.gov.br/ws/consultaprotocolo4.asmx',
        'RJ': 'https://www.nfe.rj.gov.br/ws/consultaprotocolo4.asmx',
        'MG': 'https://nfe.fazenda.mg.gov.br/ws/consultaprotocolo4.asmx'
    }
    
    ws_url = webservice_urls.get(uf)
    if not ws_url:
        return None
    
    try:
        # SOAP request for NFe consultation
        soap_envelope = f'''<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <nfeConsultaNF xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/NfeConsulta4">
      <nfeDadosMsg>
        <consSitNFe versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
          <tpAmb>1</tpAmb>
          <xServ>CONSULTAR</xServ>
          <chNFe>{invoice_key}</chNFe>
        </consSitNFe>
      </nfeDadosMsg>
    </nfeConsultaNF>
  </soap:Body>
</soap:Envelope>'''
        
        headers = {
            'Content-Type': 'text/xml; charset=utf-8',
            'SOAPAction': 'http://www.portalfiscal.inf.br/nfe/wsdl/NfeConsulta4/nfeConsultaNF'
        }
        
        response = requests.post(ws_url, data=soap_envelope, headers=headers, timeout=20)
        
        if response.status_code == 200 and invoice_key in response.text:
            # Extract XML from SOAP response
            xml_match = re.search(r'<nfeProc.*?</nfeProc>', response.text, re.DOTALL)
            if xml_match:
                return xml_match.group(0)
    
    except Exception as e:
        print(f"Direct API call error for {uf}: {e}")
    
    return None

def get_nfe_xml_official(invoice_key):
    """Main function using official channels only"""
    if not invoice_key or len(invoice_key) != 44 or not invoice_key.isdigit():
        return {"success": False, "error": "Chave da NFe deve ter 44 dígitos numéricos"}
    
    print(f"Buscando XML oficial para chave: {invoice_key}")
    
    # Try official methods in order of reliability
    methods = [
        ("Portal Nacional da NFe", try_portal_nfe),
        ("Portal SEFAZ Estadual", try_sefaz_portal),
        ("WebService SEFAZ", try_direct_api_calls)
    ]
    
    for method_name, method_func in methods:
        try:
            print(f"Tentando: {method_name}")
            xml_content = method_func(invoice_key)
            
            if xml_content and len(xml_content) > 500 and invoice_key in xml_content:
                print(f"✅ XML obtido via {method_name}")
                return {
                    "success": True,
                    "xml_content": xml_content,
                    "message": f"XML obtido via {method_name}"
                }
        except Exception as e:
            print(f"Erro em {method_name}: {e}")
            continue
    
    return {
        "success": False,
        "error": f"Não foi possível obter o XML da chave {invoice_key} através dos canais oficiais. Verifique se a chave está correta e se a NFe foi autorizada."
    }

def main():
    if len(sys.argv) != 2:
        result = {"success": False, "error": "Chave NFe obrigatória"}
    else:
        invoice_key = sys.argv[1].strip()
        result = get_nfe_xml_official(invoice_key)
    
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()