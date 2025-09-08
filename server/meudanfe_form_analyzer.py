#!/usr/bin/env python3
import requests
from bs4 import BeautifulSoup
import json
import sys

def analyze_meudanfe_form():
    """Analisa o formulário real do meudanfe.com.br"""
    
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    })
    
    try:
        print("Analisando estrutura do meudanfe.com.br...")
        response = session.get('https://meudanfe.com.br', timeout=15)
        
        if response.status_code != 200:
            print(f"Erro ao acessar site: {response.status_code}")
            return
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Procura por formulários
        forms = soup.find_all('form')
        print(f"Encontrados {len(forms)} formulários na página")
        
        for i, form in enumerate(forms):
            print(f"\n=== FORMULÁRIO {i+1} ===")
            print(f"Action: {form.get('action', 'N/A')}")
            print(f"Method: {form.get('method', 'GET')}")
            
            # Lista todos os inputs
            inputs = form.find_all(['input', 'textarea', 'select'])
            for inp in inputs:
                print(f"Input: name='{inp.get('name', 'N/A')}' type='{inp.get('type', 'N/A')}' id='{inp.get('id', 'N/A')}'")
        
        # Procura por campos de chave NFe especificamente
        nfe_inputs = soup.find_all('input', {'placeholder': lambda x: x and 'chave' in x.lower()})
        if not nfe_inputs:
            nfe_inputs = soup.find_all('input', {'name': lambda x: x and 'chave' in x.lower()})
        
        print(f"\n=== CAMPOS NFE ENCONTRADOS ===")
        for inp in nfe_inputs:
            print(f"Campo NFe: name='{inp.get('name')}' id='{inp.get('id')}' placeholder='{inp.get('placeholder')}'")
        
        # Procura por botões de busca
        buttons = soup.find_all(['button', 'input'], {'type': ['submit', 'button']})
        print(f"\n=== BOTÕES ENCONTRADOS ===")
        for btn in buttons:
            text = btn.get_text() or btn.get('value', '')
            print(f"Botão: '{text}' type='{btn.get('type')}' onclick='{btn.get('onclick', 'N/A')}'")
        
        # Procura por JavaScript relevante
        scripts = soup.find_all('script')
        print(f"\n=== ANÁLISE DE SCRIPTS ===")
        for script in scripts:
            if script.string and ('consulta' in script.string.lower() or 'nfe' in script.string.lower()):
                print("Script com referências a consulta/NFe encontrado")
                # Extrai URLs relevantes
                import re
                urls = re.findall(r'["\']([^"\']*(?:consulta|nfe|xml)[^"\']*)["\']', script.string)
                for url in urls[:5]:  # Primeiras 5 URLs
                    print(f"  URL: {url}")
        
        # Salva HTML para análise detalhada
        with open('/tmp/meudanfe_analysis.html', 'w', encoding='utf-8') as f:
            f.write(response.text)
        print(f"\nHTML salvo em /tmp/meudanfe_analysis.html para análise detalhada")
        
        return True
        
    except Exception as e:
        print(f"Erro durante análise: {e}")
        return False

if __name__ == "__main__":
    analyze_meudanfe_form()